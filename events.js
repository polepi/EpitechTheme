table_event_list
var start_date;
var end_date;
var is_reg_hidden = 0;

function convertDateFormat(inputString) {
    const date = new Date(inputString);
  
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function get_current_week() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    start_date = currentYear+"-"+currentMonth+"-"+currentDay;

    const oneWeekAhead = new Date(currentDate);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
    const weekAheadYear = oneWeekAhead.getFullYear();
    const weekAheadMonth = oneWeekAhead.getMonth() + 1;
    const weekAheadDay = oneWeekAhead.getDate();
    end_date = weekAheadYear+"-"+weekAheadMonth+"-"+weekAheadDay;
}

function getDaysLeft(targetString) {
    const targetDate = new Date(targetString);
    const currentDate = new Date();
    const difference = targetDate - currentDate;
    var returnString;

    if (difference > 0) {
        const days = parseFloat((difference / (1000 * 60 * 60 * 24)).toFixed(1));
        returnString = `${days} ${days === 1 ? 'day' : 'days'}`;
        if (days <= 3)
            returnString = "<b style='color:orange;'>"+returnString+"</b>";
        return returnString;
    } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        returnString = "<b style='color:red;'>"+`${hours} ${hours === 1 ? 'hour' : 'hours'}`+"</b>";
        return returnString;
    }
}

function sortTableDates() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("table_event_list");
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[3];
            y = rows[i + 1].getElementsByTagName("TD")[3];
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function filterTable() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("inp_text_filter");
    filter = input.value.toUpperCase();
    table = document.getElementById("table_event_list");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1].getElementsByTagName("span")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

document.getElementById("inp_text_filter").addEventListener('keyup', () => {
    filterTable();
});

document.getElementById("btn_show_reg").addEventListener('click', () => {
    var input, filter, table, tr, td;
    input = document.getElementById("inp_text_filter");
    filter = input.value.toUpperCase();
    table = document.getElementById("table_event_list");
    tr = table.getElementsByTagName("tr");

    for (var i = 0; i < tr.length; i++) {
        if (tr[i].getElementsByTagName("td")[0].getElementsByTagName("span")[0].textContent == "check_box_outline_blank") {
            if (is_reg_hidden == 0) {
                tr[i].style.display = "none";
            } else {
                tr[i].style.display = "";
            }
        }
    }
    if (is_reg_hidden == 1)
        is_reg_hidden = 0;
    else
        is_reg_hidden = 1;
});

function fetch_schedule() {
    get_current_week();
    const url_grades_json = "https://intra.epitech.eu/planning/load?format=json&start="+start_date+"&end="+end_date;
    const ulElement = document.getElementById('table_event_list');

    fetch(url_grades_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.forEach(event => {
            console.log(event);
            if (event.instance_location == "ES/BAR" && event.semester<= 1) {
                const new_tr_element = document.createElement('tr');
                isregist = "check_box_outline_blank";
                if (event.event_registered == "registered")
                    isregist = "check_box";
                new_tr_element.innerHTML = "<td title='Registered'><span class='material-icons-outlined'>"+isregist+"</span></td><td title='Room: "+event.room.code+"\nSeats: "+event.total_students_registered+"/"+event.room.seats+"'><span>"+event.acti_title+"</span><span>"+event.titlemodule+"</span></td><td><span>"+convertDateFormat(event.start)+"</span><span>Starts in "+getDaysLeft(event.start)+"</span><td><span>"+convertDateFormat(event.end)+"</span><span>Ends in "+getDaysLeft(event.start)+"</span></td>";
                new_tr_element.addEventListener("click", function () {
                    const targetUrl = "https://intra.epitech.eu/module/"+event.scolaryear+"/"+event.codemodule+"/"+event.codeinstance+"/"+event.codeacti;
                    window.open(targetUrl, '_blank');
                });
                ulElement.appendChild(new_tr_element);
            }
        });
        sortTableDates();
        document.getElementById('is_grades_loading').style.display = "none";
    })
    .catch(error => {
        document.getElementById('is_grades_loading').style.borderTop = '4px solid #682828';
        setTimeout(() => {
            document.getElementById('is_grades_loading').style.borderTop = '4px solid rgb(45, 54, 110);';
            fetch_schedule();
        }, 500);
    });
}
fetch_schedule();