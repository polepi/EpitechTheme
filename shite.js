var header_auth;
var last_check;
var targ_year;

document.getElementById("filter_input").addEventListener("keyup", filterTableNames);
function filterTableNames() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("filter_input");
    filter = input.value.toUpperCase();
    table = document.getElementById("shite_subject_list");
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
    sortTable();
}

function is_object_new(input_date) {
    var dateObject = new Date(input_date);

    if (last_check <= dateObject) {
        return "<span class='new_tag'>New</span>"
    }
    return "";
}

function sortTable() {
    var table = document.getElementById('shite_subject_list');
    var rows = Array.from(table.rows)

    rows.sort(function(a, b) {
        var dateA = parseInt(a.getAttribute('date-index'), 10);
        var dateB = parseInt(b.getAttribute('date-index'), 10);
        return dateB - dateA;
    });
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    rows.forEach(function(row) {
        table.appendChild(row);
    });
}

function convertDateFormat(inputDate) {
    var dateObject = new Date(inputDate);
    var day = dateObject.getUTCDate();
    var month = dateObject.getUTCMonth() + 1;
    var year = dateObject.getUTCFullYear() % 100;
    var hours = dateObject.getUTCHours();
    var minutes = dateObject.getUTCMinutes();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}

function daysSince(inputDate) {
    var currentDate = new Date();
    var inputDateTime = new Date(inputDate);
    var timeDifference = currentDate - inputDateTime;
    var milliseconds = timeDifference;
    var seconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    var months = Math.floor(days / 30); // Using an average month length of 30 days

    if (months >= 1) {
        return months + "mo ago";
    } else if (days >= 1) {
        return days + "d ago";
    } else if (hours >= 1) {
        return hours + "h ago";
    } else {
        return minutes + "m ago";
    }
}

function get_correct_per(item) {
    //console.log(item)
    var iscrashed = item["results"]["externalItems"]
    for (var i = 0; i < iscrashed.length; i++) {
        if (iscrashed[i]["type"] == "crash" && iscrashed[i]["value"] > 0)
            return "<span style='color:#555;'>Crashed</span>";
    }
    item = Object.values(item["results"]["skills"]);
    var len = item.length;
    var completedItems = 0;
    var countItems = 0;

    for (var i = 0; i < len; i++) {
        var res = item[i];
        countItems += res["count"];
        completedItems += res["passed"];
    }
    var completionPercentage = ((completedItems / countItems) * 100).toFixed(0);
    if (isNaN(completionPercentage))
        return "-";
    var colour_text = "#e35d5d"
    if (completionPercentage > 10)
        colour_text = "#ff4d00";
    if (completionPercentage > 30)
        colour_text = "#ff9100";
    if (completionPercentage > 50)
        colour_text = "#e3d409";
    if (completionPercentage > 65)
        colour_text = "#90b31e";
    if (completionPercentage > 75)
        colour_text = "#26a324";
    if (completionPercentage >= 100)
    return "<span class='legendary_result'>"+completionPercentage+"%</span>";
    return "<b class='legendary_result' style='background-color:"+colour_text+";'>"+completionPercentage+"%</b>";
}

function load_subject_list(data) {
    const ulElement = document.getElementById('shite_subject_list');

    data.forEach((item) => {
        const new_tr_element = document.createElement('tr');
        const isnew = is_object_new(item["date"]);
        
        new_tr_element.setAttribute('date-index', Date.parse(item["date"]));
        new_tr_element.innerHTML = "<td>"+item["project"]["name"]+"</td><td>"+isnew+"</td><td style='text-align:right;padding-right:25px;'>"+get_correct_per(item)+"</td><td>"+daysSince(item["date"])+"</td>";
        if (item["project"] && item["project"]["module"] && item["project"]["module"]["code"]) {
            new_tr_element.addEventListener("click", function () {
                const targetUrl = "https://my.epitech.eu/index.html#d/"+targ_year+"/"+item["project"]["module"]["code"]+"/"+item["project"]["slug"]+"/"+item["results"]["testRunId"];
                window.open(targetUrl, '_blank');
            });
        }
        ulElement.appendChild(new_tr_element);
    });
    sortTable();
}
    
function get_shite_data(isTest) {
    fetch('https://api.epitest.eu/me/'+targ_year, {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en;q=0.9',
            'Authorization': `Bearer ${header_auth}`,
            'Connection': 'keep-alive',
            'DNT': '1',
            'Host': 'api.epitest.eu',
            'Origin': 'https://my.epitech.eu',
            'Referer': 'https://my.epitech.eu/'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        var send_data = data;
        document.getElementById('t_notset_warn').style.display = 'none';
        if (data && data == "") {
            const new_tr_element = document.createElement('tr');
            new_tr_element.innerHTML = "<td>No data, try a different year</td>";
            document.getElementById('shite_subject_list').appendChild(new_tr_element);
        }
        load_subject_list(send_data);
    })
    .catch(error => {
        if (isTest == true) {
            update_api();
        } else {
            document.getElementById('t_notset_warn').style.display = 'block';
            console.error('Error:', error);
        }
    });
}

function get_header_auth(isTest) {
    chrome.storage.local.get('shite-key', function(data) {
        header_auth = data["shite-key"];
        header_auth = header_auth.substring(1, header_auth.length - 1);
        get_shite_data(isTest);
    });
}

function update_api() {
    chrome.tabs.create({url: 'https://my.epitech.eu', active: false}, tab =>{
        setTimeout(function() {
            chrome.tabs.remove(tab.id);
            get_header_auth(false);
        }, 2000);
    });
}

function get_stored_data() {
    var currentDate = new Date();
    document.getElementById("date_input").max = currentDate.getFullYear();
    chrome.storage.local.get('curr_year', function(data) {
        targ_year = data["curr_year"];
        if (targ_year == null) {
            targ_year = currentDate.getFullYear() - 1;
        }
        document.getElementById("date_input").value = targ_year;
        document.getElementById("date_input").addEventListener('blur', function() {
            if (targ_year != document.getElementById("date_input").value) {
                targ_year = document.getElementById("date_input").value;
                chrome.storage.local.set({'curr_year': targ_year}, () => {
                    location.reload();
                });
            }
        });
    });
    chrome.storage.local.get('last_time', function(data) {
        last_check = data["last_time"];

        if (last_check == null) {
            last_check = new Date();
            chrome.storage.local.set({'last_time': last_check});
        }
        get_header_auth(true);
    });
}
get_stored_data();

document.getElementById("btn_mark_read").addEventListener('click', function() {
    last_check = new Date();
    chrome.storage.local.set({'last_time': last_check}, () => {
        location.reload();
    });
});
