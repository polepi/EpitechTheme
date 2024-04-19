var show_next_days = 14;
var user_loc = "ES/BAR";
var event_semester_min = 0;
var event_semester_max = 2;

var show_registred_only = 0;
var stack_duplicated = 1;

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

function stack_elements(td, el, els) {
    if (!el.classList.contains("cal_stack")) {
        const name = el.getAttribute("name");
        let foundDuplicate = false;
        els.forEach(element => {
            if (element !== el && element.getAttribute("name") === name) {
                if (!foundDuplicate) {
                    const new_el = document.createElement('span');
                    new_el.setAttribute("name", "showMore_"+name);
                    new_el.classList.add("dup_btn");
                    new_el.innerHTML = "<span class='material-icons-outlined' name='expand_icon_"+name+"'>expand_more</span>Show <b>0</b> more";
                    new_el.addEventListener("click", function () {
                        const duplicates = td.querySelectorAll('[name="' + name + '"]');
                        duplicates.forEach((dup, index) => {
                            if (index > 0) {
                                dup.style.display = 'block';
                            }
                        });
                        new_el.style.display = 'none';
                        new_el1.style.display = 'block';
                        td.querySelector('[name="hideMore_'+name+'"]').style.display = 'block';
                    });
                    td.appendChild(new_el);

                    const new_el1 = document.createElement('span');
                    new_el1.setAttribute("name", "hideMore_"+name);
                    new_el1.classList.add("dup_btn");
                    new_el1.style.display = 'none';
                    new_el1.innerHTML = "<span class='material-icons-outlined'>expand_less</span>Hide duplicated";
                    new_el1.addEventListener("click", function () {
                        const duplicates = td.querySelectorAll('[name="' + name + '"]');
                        duplicates.forEach((dup, index) => {
                            if (index > 0) {
                                dup.style.display = 'none';
                            }
                        });
                        new_el.style.display = 'block';
                        new_el1.style.display = 'none';
                        td.querySelector('[name="showMore_'+name+'"]').style.display = 'block';
                    });
                    td.appendChild(new_el1);
                    foundDuplicate = true;
                }
                if (td.querySelector('[name="showMore_'+name+'"]')) {
                    td.querySelector('[name="showMore_'+name+'"] > b').textContent = parseInt(td.querySelector('[name="showMore_'+name+'"] > b').textContent, 10) + 1;
                }
                element.classList.add("cal_stack");
                if (element.classList.contains('calendar_event_active')) {
                    td.querySelector('[name="showMore_'+name+'"]').style.color = "red";
                    td.querySelector('[name="showMore_'+name+'"] > span').innerHTML = "expand_circle_down";
                    element.style.display = "block";
                }
                element.style.marginLeft = '20px';
            }
        });
    }
}

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
        divArray.forEach(div => {
            td.appendChild(div);
            if (stack_duplicated == 1)
                stack_elements(td, div, divArray);
        });
    });
}

function pass_verif() {
    const element = document.createElement("iframe");
    element.src = "https://intra.epitech.eu/";
    document.appendChild(element);
}

var has_user_warned_ddos = 0;
function pass_ddos() {
    if (has_user_warned_ddos)
        return;
    has_user_warned_ddos = true;
    var warn_div = document.createElement('div');
    warn_div.setAttribute("id", "t_failedlogin_warn")
    warn_div.style = "position:absolute;top:60px;padding: 6px 10px;background-color: #f1f1f1;border:1px solid #ccc;border-radius:3px;color: #333;font-size:14px;"
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
        if (document.getElementById("t_failedlogin_warn"))
            document.getElementById("t_failedlogin_warn").style.display = "none";
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
                        new_el.setAttribute("name", event.acti_title);
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
        if (error.message.includes('Failed to fetch')) {
            pass_ddos();
        }
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
        table += `<td id='calend_td_${day.yearNumber}-${day.monthNumber}-${day.dayNumber}'><div style='display:block;'><span style='display:inline-block;width:auto;'>${day.dayOfMonth}</span>`;
        if (i == 0)
            table += `<span style='float:right;color:#555;display:inline-block;width:auto;'>(Today)</span>`;
        else
            table += `<span style='float:right;color:#555;display:inline-block;width:auto;' title='day(s) away'>(`+i+` d)</span>`;
        table += `</div><div class='calendar_holder'></div></td>`;
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

document.getElementById("go_full_screen").addEventListener("click", function () {
    window.open("calendar.html", "_blank");
});

document.getElementById("btn_goto_schedule").addEventListener("click", function () {
    window.location = "events.html";
});

document.getElementById("btn_goto_calendar").addEventListener("click", function () {
    window.location = "calendar.html";
});

document.getElementById("btn_goto_timeline").addEventListener("click", function () {
    window.location = "timeline.html";
});

document.getElementById("stack_duplicated_btn").addEventListener("click", function () {
    if (stack_duplicated == 1) {
        stack_duplicated = 0;
        document.getElementById('is_stacked_only').textContent = "layers_clear";
    } else {
        stack_duplicated = 1
        document.getElementById('is_stacked_only').textContent = "layers";
    }
    fetch_schedule();
});

if (window.outerHeight > 800) {
    document.getElementById("nv_main_bar").style.display = "none";
    document.getElementById("btn_goto_schedule").style.display = "none";
    document.getElementById("btn_goto_calendar").style.display = "none";
    document.getElementById("calendar_main_container").style.zoom = "1";
    document.getElementById("go_full_screen").style.display = "none";
}

fetch_schedule();