var show_next_days = 14;
var user_loc = "ES/BAR";
var event_semester_min = 0;
var event_semester_max = 2;

var show_registred_only = 0;

var start_date = 0;
var end_date = 0;

var event_data = {}

function get_current_week() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    start_date = currentYear+"-"+currentMonth+"-"+currentDay;

    const oneWeekAhead = new Date(currentDate);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + show_next_days);
    const weekAheadYear = oneWeekAhead.getFullYear();
    const weekAheadMonth = oneWeekAhead.getMonth() + 1;
    const weekAheadDay = oneWeekAhead.getDate();
    end_date = weekAheadYear+"-"+weekAheadMonth+"-"+weekAheadDay;
}

chrome.storage.local.get("event_semester", function(data) {
    var in_min = 0;
    var in_max = 2;
    let storedData = data["event_semester"] || {};
    if (storedData && storedData["event_semester_min"] && storedData["event_semester_max"]) {
        in_min = storedData["event_semester_min"];
        in_max = storedData["event_semester_max"];
    }
    event_semester_min = in_min;
    event_semester_max = in_max;
});

function sortEvents() {
    const tdElements = document.querySelectorAll('#table_calendar_view td');

    tdElements.forEach(td => {
        const divs = td.querySelectorAll('.calendar_holder > div');
        const divArray = Array.from(divs);
        divArray.sort((a, b) => {
            const timeA = a.getAttribute('data-time');
            const timeB = b.getAttribute('data-time');
            return timeA.localeCompare(timeB);
        });
        divs.forEach(div => div.remove());
        divArray.forEach(div => td.appendChild(div));
    });
}

function fetch_schedule() {
    document.getElementById('is_grades_loading').style.display = "block";
    document.getElementById('table_calendar_view_div').style.display = "none";

    get_current_week();
    printTable();
    const url_grades_json = "https://intra.epitech.eu/planning/load?format=json&start="+start_date+"&end="+end_date;

    fetch(url_grades_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.forEach(event => {
            if (event.instance_location == user_loc && event.semester >= event_semester_min && event.semester <= event_semester_max) {
                if (show_registred_only == 0 || event.event_registered == "registered") {
                    const ev_date = event.start.split(' ')[0];
                    const start = event.start.split(' ')[1].split(':').slice(0, 2).join(':');
                    const end = event.end.split(' ')[1].split(':').slice(0, 2).join(':');;
                    const cont = document.getElementById('calend_td_'+ev_date);
                    if (cont && ev_date && start && end) {
                        const new_el = document.createElement('div');
                        new_el.setAttribute("data-time", start);
                        new_el.classList.add("calendar_event");
                        if (event.event_registered == "registered")
                            new_el.classList.add("calendar_event_active");
                        new_el.innerHTML = `<div>${start} - ${end}</div><div>${event.acti_title}</div>`;
                        cont.querySelector('.calendar_holder').appendChild(new_el);
                        new_el.addEventListener("click", function () {
                            const targetUrl = "https://intra.epitech.eu/module/"+event.scolaryear+"/"+event.codemodule+"/"+event.codeinstance+"/"+event.codeacti;
                            window.open(targetUrl, '_blank');
                        });
                    }
                }
            }
        });
        sortEvents();
        document.getElementById('is_grades_loading').style.display = "none";
        document.getElementById('table_calendar_view_div').style.display = "block";
    })
    .catch(error => {
        console.log(error);
        document.getElementById('is_grades_loading').style.borderTop = '4px solid #682828';
        setTimeout(() => {
            document.getElementById('is_grades_loading').style.borderTop = '4px solid rgb(45, 54, 110);';
            fetch_schedule();
        }, 500);
    });
}

function getNext7Days() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const next7Days = [];

    for (let i = 0; i < show_next_days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const yearNumber = date.getFullYear();
        const monthNumber = (date.getMonth() + 1).toString().padStart(2, '0');;
        const dayOfWeek = days[date.getDay()];
        const dayNumber = date.getDate().toString().padStart(2, '0');
        const dayOfMonth = date.getDate();
        next7Days.push({ dayOfWeek, dayOfMonth, yearNumber, monthNumber, dayNumber });
    }
    return next7Days;
}

function printTable() {
    const days = getNext7Days();
    var i = 0;
    document.getElementById('table_calendar_view').innerHTML = '';
    let table = '<tr>';
    if (show_next_days < 7) {
        for (let j = 0; j < show_next_days; j++) {
            table += `<th>${days[j].dayOfWeek}</th>`;
        }
    } else {
        for (let j = 0; j < 7; j++) {
            table += `<th>${days[j].dayOfWeek}</th>`;
        }
    }
    table += '</tr><tr>';
    days.forEach(day => {
        table += `<td id='calend_td_${day.yearNumber}-${day.monthNumber}-${day.dayNumber}'>${day.dayOfMonth}<div class='calendar_holder'></div></td>`;
        i += 1;
        if (i % 7 == 0)
            table += '</tr><tr>';
    });
    table += '</tr>';
    document.getElementById('table_calendar_view').innerHTML = '';
    document.getElementById('table_calendar_view').innerHTML = table;
}

document.getElementById('select_val_days').addEventListener('change', function() {
    show_next_days = this.value;
    fetch_schedule();
});

document.getElementById("btn_show_reg").addEventListener("click", function () {
    if (show_registred_only == 1) {
        show_registred_only = 0;
        document.getElementById('is_reg_only').textContent = "visibility";
    } else {
        show_registred_only = 1
        document.getElementById('is_reg_only').textContent = "visibility_off";
    }
    fetch_schedule();
});

document.getElementById("btn_goto_schedule").addEventListener("click", function () {
    window.location = "events.html";
});

document.getElementById("btn_goto_calendar").addEventListener("click", function () {
    window.location = "calendar.html";
});

fetch_schedule();