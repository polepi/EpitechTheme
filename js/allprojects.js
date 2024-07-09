var start_date;
var end_date;
var is_reg_hidden = 0;

var show_hubprojects = 0;
var show_bootsprojects = 1;
var show_completedprojects = 0;
var count_hubprojects, count_bootsprojects, count_completedprojects;

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

document.getElementById('s_boot_proj_btn').addEventListener('click', () => {
    if (show_bootsprojects == 1) {
        show_bootsprojects = 0;
        document.getElementById('s_showboot_icon').innerHTML = "visibility_off";
    } else {
        show_bootsprojects = 1;
        document.getElementById('s_showboot_icon').innerHTML = "visibility";
    }
    fetch_projects();
});

document.getElementById('s_expired_proj_btn').addEventListener('click', () => {
    if (show_completedprojects == 1) {
        show_completedprojects = 0;
        document.getElementById('s_showexpired_icon').innerHTML = "visibility_off";
    } else {
        show_completedprojects = 1;
        document.getElementById('s_showexpired_icon').innerHTML = "visibility";
    }
    fetch_projects();
});

var has_user_warned_ddos = 0;
function pass_ddos() {
    if (has_user_warned_ddos)
        return;
    has_user_warned_ddos = true;
    var warn_div = document.createElement('div');
    warn_div.setAttribute("id", "t_failedlogin_warn")
    warn_div.style = "position:absolute;top:120px;padding: 6px 10px;background-color: #f1f1f1;border:1px solid #ccc;border-radius:3px;color: #333;font-size:14px;"
    var warn_btns = document.createElement('p');

    var warn_notice = document.createElement('div');
    warn_notice.innerHTML = `<span style="display: block;font-size:16px;padding:8px 10px;border-bottom:1px solid #ccc;margin-bottom:6px;" class="noselect">😭&nbsp;&nbsp;Unable to connect</span>
    <span>We are experiencing issues while trying to reach the Intranet API: The intranet might be down, or you might be logged out!<br><br>
    <span style="padding:8px 10px;background-color:#ddd;border-radius:3px;"><span style='font-size: 19px;margin-top: 0px;' class='material-icons-outlined'>info</span>&nbsp;<b>Possible fix:</b> Log into the intranet and try again!</span></span><br><br>`

    var warn_btn_intra = document.createElement('a');
    warn_btn_intra.target = "_blank";
    warn_btn_intra.href = "https://intra.epitech.eu/";
    warn_btn_intra.style = "padding: 6px 8px;border-radius:3px;background-color:#2d366e;cursor:pointer;color:#f1f1f1;text-decoration:none;";
    warn_btn_intra.innerHTML = `<span style='font-size: 18px;margin-top: 0px;' class='material-icons'>open_in_new</span>&nbsp;&nbsp;Open intranet`;

    var warn_btn_diss = document.createElement('span');
    warn_btn_diss.style = "margin-left:5px;padding: 6px 8px;border-radius:3px;background-color:#ddd;cursor:pointer;color:#333;text-decoration:none;";
    warn_btn_diss.innerHTML = `<span style='font-size: 18px;margin-top: 0px;' class='material-icons'>close</span>&nbsp;&nbsp;Dismiss`;
    warn_btn_diss.addEventListener('click', () => {
        warn_div.style.display = "none";
    });

    warn_btns.appendChild(warn_btn_intra);
    warn_btns.appendChild(warn_btn_diss);
    warn_div.appendChild(warn_notice);
    warn_div.appendChild(warn_btns);
    document.body.appendChild(warn_div);
}

function fetch_projects() {
    const url_projects_json = "https://intra.epitech.eu/?format=json";
    const ulProjElement = document.getElementById('table_proj_event_list');
    ulProjElement.innerHTML = "";

    count_hubprojects = 0;
    count_bootsprojects = 0;
    count_completedprojects = 0;

    fetch(url_projects_json)
    .then(response => {
        if (!response.ok) {
            if (response.status != 503) {
                throw new Error(`HTTP error: ${response.status}`);
            }
        }
        return response.json();
    })
    .then(data => {
        if (document.getElementById("t_failedlogin_warn"))
            document.getElementById("t_failedlogin_warn").style.display = "none";
        data.board.projets.forEach(event => {
            var timeline_starts = event.timeline_start;
            var timeline_ends = event.timeline_end;
            if (event.title.substring(0, 9) == "[PROJECT]")
                count_hubprojects += 1;
            if (event.title.substring(0, 12) == "Bootstrap - ")
                count_bootsprojects += 1;
            if (gettimeepoch(event.timeline_end) <= (new Date().getTime()))
                count_completedprojects += 1;
            if (show_hubprojects == 1 || event.title.substring(0, 9) != "[PROJECT]") {
                if (show_bootsprojects == 1 || event.title.substring(0, 12) != "Bootstrap - ") {       
                    if (show_completedprojects == 1 || gettimeepoch(event.timeline_end) > (new Date().getTime())) {
                        const new_tr_element = document.createElement('tr');
                        new_tr_element.setAttribute("data-time", gettimeepoch(event.timeline_end));
                        new_tr_element.innerHTML = "<td>"+event.title+"</td><td><span>"+getDaysLeft(timeline_starts, "Starts in", "")+"</span></td><td><span>"+getDaysLeft(timeline_ends, "Ends in", "Ended")+"</span></td>";
                        new_tr_element.addEventListener("click", function () {
                            const targetUrl = "https://intra.epitech.eu"+event.title_link;
                            window.open(targetUrl, '_blank');
                        });
                        ulProjElement.appendChild(new_tr_element);
                    }
                }
            }
        });
        sortTableDates();
        document.getElementById("s_showhub_txt").innerHTML = "HUB <span class='completed_badges'>"+count_hubprojects+"</span>";
        document.getElementById("s_showboot_txt").innerHTML = "Bootstraps <span class='completed_badges'>"+count_bootsprojects+"</span>";
        document.getElementById("s_showexpired_txt").innerHTML = "Expired <span class='completed_badges'>"+count_completedprojects+"</span>";
        if (count_completedprojects == 0)
            document.getElementById("s_showexpired_txt").innerHTML = 'Expired';
        if (count_bootsprojects == 0)
            document.getElementById("s_showboot_txt").innerHTML = 'Bootstraps';
        if (count_hubprojects == 0)
            document.getElementById("s_showhub_txt").innerHTML = 'HUB';
        document.getElementById('is_grades_loading').style.display = "none";
    })
    .catch(error => {
        document.getElementById('is_grades_loading').style.borderTop = '4px solid #682828';
        if (error.message.includes('Failed to fetch') && document.getElementById("tab_allprojects").style.display == "block") {
            pass_ddos();
        }
        setTimeout(() => {
            document.getElementById('is_grades_loading').style.borderTop = '4px solid rgb(45, 54, 110);';
            fetch_projects();
        }, 500);
    });
}
fetch_projects();

document.getElementById("tb_myprojects_btn").addEventListener("click", () => {
    window.location = "start.html";
});

document.getElementById("tb_calprojects_btn").addEventListener("click", () => {
    window.location = "calendar.html";
});

document.getElementById("tb_allprojects_btn").addEventListener("click", () => {
    location.reload();
});

document.getElementById("tb_intra_btn").addEventListener("click", () => {
    window.open("https://intra.epitech.eu/", '_blank');
});