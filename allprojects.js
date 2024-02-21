var start_date;
var end_date;
var is_reg_hidden = 0;
var show_hubprojects = 0;

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

function getDaysLeft(targetString, text, text2) {
    const [datePart, timePart] = targetString.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');

    const targetDate = new Date(year, month - 1, day, hours, minutes);
    const currentDate = new Date();
    const difference = targetDate - currentDate;
    var returnString;

    if (difference < 0) {
        var days = parseFloat((difference / (1000 * 60 * 60 * 24)).toFixed(1));
        days *= -1;
        returnString = `${days} ${days === 1 ? 'day' : 'days'}`;
        return "<text style='color:#aaa;'>"+text2+" "+returnString+" ago</text>";
    } else if (difference > 0) {
        const days = parseFloat((difference / (1000 * 60 * 60 * 24)).toFixed(1));
        returnString = `${days} ${days === 1 ? 'day' : 'days'}`;
        if (days <= 3)
            returnString = "<b style='color:orange;'>"+returnString+"</b>";
        return text+" "+returnString;
    } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        returnString = text+" <b style='color:red;'>"+`${hours} ${hours === 1 ? 'hour' : 'hours'}`+"</b>";
        return returnString;
    }
}

function sortTableDates() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("table_proj_event_list");
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getAttribute("data-time");
            y = rows[i + 1].getAttribute("data-time");
            if (x > y) {
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

function gettimeepoch(var1) {
    const [day, month, year, hours, minutes] = var1.match(/\d+/g).map(Number);
    const dateObject = new Date(year, month - 1, day, hours, minutes);
    
    return dateObject.getTime();
}

function filterTable() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("inp_text_filter");
    filter = input.value.toUpperCase();
    table = document.getElementById("table_proj_event_list");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
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

document.getElementById("tb_myprojects_btn").addEventListener('click', () => {
    document.getElementById("tab_table").style.display = "block";
    document.getElementById("tab_allprojects").style.display = "none";
    document.getElementById('tab_addevent').style.display = "none";
    document.getElementById('tab_taskdesc').style.display = "none";
});

document.getElementById("tb_allprojects_btn").addEventListener('click', () => {
    document.getElementById("tab_table").style.display = "none";
    document.getElementById("tab_allprojects").style.display = "block";
    document.getElementById('tab_addevent').style.display = "none";
    document.getElementById('tab_taskdesc').style.display = "none";
});

document.getElementById("inp_text_filter").addEventListener('keyup', () => {
    filterTable();
});

document.getElementById('s_hub_proj_btn').addEventListener('click', () => {
    if (show_hubprojects == 1) {
        show_hubprojects = 0;
        document.getElementById('s_showhub_icon').innerHTML = "visibility_off";
    } else {
        show_hubprojects = 1;
        document.getElementById('s_showhub_icon').innerHTML = "visibility";
    }
    fetch_projects();
});

function fetch_projects() {
    const url_projects_json = "https://intra.epitech.eu/?format=json";
    const ulProjElement = document.getElementById('table_proj_event_list');
    ulProjElement.innerHTML = "";

    fetch(url_projects_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.board.projets.forEach(event => {
            if (show_hubprojects == 1 || event.title.substring(0, 9) != "[PROJECT]") {
                const new_tr_element = document.createElement('tr');
                new_tr_element.setAttribute("data-time", gettimeepoch(event.timeline_end));
                new_tr_element.innerHTML = "<td>"+event.title+"</td><td><span>"+getDaysLeft(event.timeline_start, "Starts in", "")+"</span></td><td><span>"+getDaysLeft(event.timeline_end, "Ends in", "Ended")+"</span></td>";
                new_tr_element.addEventListener("click", function () {
                    const targetUrl = "https://intra.epitech.eu"+event.title_link;
                    window.open(targetUrl, '_blank');
                });
                ulProjElement.appendChild(new_tr_element);
            }
        });
        sortTableDates();
        document.getElementById('is_grades_loading').style.display = "none";
    })
    .catch(error => {
        document.getElementById('is_grades_loading').style.borderTop = '4px solid #682828';
        setTimeout(() => {
            console.log(error);
            document.getElementById('is_grades_loading').style.borderTop = '4px solid rgb(45, 54, 110);';
            fetch_projects();
        }, 500);
    });
}
fetch_projects();