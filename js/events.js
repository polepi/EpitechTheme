import * as core from './core.js';
var user_data_cache = null;

var start_date;
var end_date;
var is_reg_hidden = 0;

var selected_days = 7;
var user_loc = "ES/BAR";
var event_semester_min = null;
var event_semester_max = null;

var input_daterange = 7;
function apply_filter_sem() {
    const semrange_input_min = document.getElementById("input-left").value;
    const semrange_input_max = document.getElementById("input-right").value;

    event_semester_min = semrange_input_min;
    event_semester_max = semrange_input_max;
    selected_days = input_daterange;
    var storedData = {};
    storedData["event_semester_min"] = semrange_input_min;
    storedData["event_semester_max"] = semrange_input_max;
    chrome.storage.local.set({"event_semester": storedData });
}

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

    var dispText = selected_days + " days";
    if (selected_days == 30) {
        dispText = "1 month";
    }
    if (selected_days == 365) {
        dispText = "1 year";
    }

    const oneWeekAhead = new Date(currentDate);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + selected_days);
    const weekAheadYear = oneWeekAhead.getFullYear();
    const weekAheadMonth = oneWeekAhead.getMonth() + 1;
    const weekAheadDay = oneWeekAhead.getDate();
    end_date = weekAheadYear+"-"+weekAheadMonth+"-"+weekAheadDay;
}

function getDaysLeft(targetString, fronttext) {
    const targetDate = new Date(targetString);
    const currentDate = new Date();
    const difference = targetDate - currentDate;
    var returnString;
    const days = parseFloat((difference / (1000 * 60 * 60 * 24)).toFixed(1));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor(difference / (1000 * 60));

    if (difference < 0) {
        returnString = `${days * - 1} ${days === 1 ? 'day' : 'days'}`;
        return returnString + " ago";
    } else if (days >= 1) {  
        returnString = `${days} ${days === 1 ? 'day' : 'days'}`;
        if (days <= 3)
            returnString = "<b style='color:#FFBF00;'>"+returnString+"</b>";
        return fronttext + " " + returnString;
    } else if (hours >= 1) {
        returnString = "<b style='color:#FF7518;'>"+ fronttext +` ${hours} ${hours === 1 ? 'hour' : 'hours'}`+"</b>";
        return returnString;
    } else {
        returnString = "<b style='color:#DC143C;'>"+ fronttext +` ${minutes} ${minutes === 1 ? 'min' : 'mins'}`+"</b>";
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
        var new_window = window.open('https://intra.epitech.eu/');
        new_window.blur();
        window.focus();
        warn_div.style.display = "none";
    });

    warn_btns.appendChild(warn_btn_intra);
    warn_btns.appendChild(warn_btn_diss);
    warn_div.appendChild(warn_notice);
    warn_div.appendChild(warn_btns);
    document.body.appendChild(warn_div);
}


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
        if (document.getElementById("t_failedlogin_warn"))
            document.getElementById("t_failedlogin_warn").style.display = "none";
        table_event_list.innerHTML = "";
        if (!data || Object.keys(data).length == 0) {
            table_event_list.innerHTML = "<tr><td>No events</td></tr>";
            document.getElementById('is_grades_loading').style.display = "none";
            return;
        }
        data.forEach(event => {
            if (event.instance_location == user_loc && (event.semester == 0 || (event.semester >= event_semester_min && event.semester <= event_semester_max))) {
                const new_tr_element = document.createElement('tr');
                var isregist = "check_box_outline_blank";
                if (event.event_registered == "registered")
                    isregist = "check_box";
                var room_code = "-";
                var room_seats = "-";
                if (event.room && event.room.code && event.seats) {
                    room_code = event.room.code !== undefined && event.room.code !== null && event.room.code !== "" ? event.room.code : "-";
                    room_seats = event.room.seats !== undefined && event.room.seats !== null && event.room.seats !== "" ? event.room.seats : "-";
                }
                new_tr_element.innerHTML = "<td title='Registered'><span class='material-icons-outlined'>"+isregist+"</span></td><td title='Room: "+room_code+"\nSeats: "+event.total_students_registered+"/"+room_seats+"'><span>"+event.acti_title+"</span><span>"+event.titlemodule+"</span></td><td><span>"+convertDateFormat(event.start)+"</span><span>"+getDaysLeft(event.start, "Starts in")+"</span><td><span>"+convertDateFormat(event.end)+"</span><span>"+getDaysLeft(event.start, "Ends in")+"</span></td>";
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

document.getElementById("list_settings_btn").addEventListener('click', () => {
    document.getElementById("modal_date").style.display = "block";
});
window.onclick = function(event) {
    if (event.target.classList.contains('modal-box')) {
        document.getElementById("modal_date").style.display = "none";
    }
}

document.getElementById("apply_fiters_btn").addEventListener("click", function() {
    apply_filter_sem();
    fetch_schedule();
    document.getElementById("modal_date").style.display = "none";
});

document.getElementById("btn_modal_range_3").addEventListener("click", function() {
	input_daterange = 3;
});
document.getElementById("btn_modal_range_7").addEventListener("click", function() {
	input_daterange = 7;
});
document.getElementById("btn_modal_range_14").addEventListener("click", function() {
	input_daterange = 14;
});
document.getElementById("btn_modal_range_30").addEventListener("click", function() {
	input_daterange = 30;
});
document.getElementById("btn_modal_range_365").addEventListener("click", function() {
	input_daterange = 365;
});


core.userData_get().then(data => {
    user_data_cache = data;

    user_loc = user_data_cache.UserLocation;

    if (event_semester_min == null || event_semester_max == null) {
        event_semester_min = ((user_data_cache.UserCourse - 1) * 2) + 1;
        event_semester_max = ((user_data_cache.UserCourse - 1) * 2) + 2;
    }

    console.log("event_semester_min: "+event_semester_min);
    console.log("event_semester_max: "+event_semester_max);

    fetch_schedule();
});

var slider_inputLeft = document.getElementById("input-left");
var slider_inputRight = document.getElementById("input-right");
var slider_thumbLeft = document.querySelector(".slider > .thumb.left");
var slider_thumbRight = document.querySelector(".slider > .thumb.right");
var slider_range = document.querySelector(".slider > .range");

function setLeftValue() {
	var _this = slider_inputLeft,
        min = parseInt(_this.min),
        max = parseInt(_this.max);
    _this.value = Math.min(parseInt(_this.value), parseInt(slider_inputRight.value) - 1);
    var percent = ((_this.value - min) / (max - min)) * 100;
    slider_thumbLeft.style.left = percent + "%";
    slider_range.style.left = percent + "%";
    document.getElementById("slider_left_showSem").textContent = slider_inputLeft.value;
}
setLeftValue();

function setRightValue() {
	var _this = slider_inputRight,
        min = parseInt(_this.min),
        max = parseInt(_this.max);
    _this.value = Math.max(parseInt(_this.value), parseInt(slider_inputLeft.value) + 1);
    var percent = ((_this.value - min) / (max - min)) * 100;
    slider_thumbRight.style.right = (100 - percent) + "%";
    slider_range.style.right = (100 - percent) + "%";
    document.getElementById("slider_right_showSem").textContent = slider_inputRight.value;
}
setRightValue();

slider_inputLeft.addEventListener("input", setLeftValue);
slider_inputRight.addEventListener("input", setRightValue);

slider_inputLeft.addEventListener("mouseover", function() {
	slider_thumbLeft.classList.add("hover");
});
slider_inputLeft.addEventListener("mouseout", function() {
	slider_thumbLeft.classList.remove("hover");
});
slider_inputLeft.addEventListener("mousedown", function() {
	slider_thumbLeft.classList.add("active");
});
slider_inputLeft.addEventListener("mouseup", function() {
	slider_thumbLeft.classList.remove("active");
});
slider_inputRight.addEventListener("mouseover", function() {
	slider_thumbRight.classList.add("hover");
});
slider_inputRight.addEventListener("mouseout", function() {
	slider_thumbRight.classList.remove("hover");
});
slider_inputRight.addEventListener("mousedown", function() {
	slider_thumbRight.classList.add("active");
});
slider_inputRight.addEventListener("mouseup", function() {
	slider_thumbRight.classList.remove("active");
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

if (window.outerHeight > 800) {
    document.getElementById("nv_overflow_data").style.height = "100vh";
}

