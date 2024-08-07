var storedData = {};
var showCompletedTable = false
const millisecondsInDay = 1000 * 60 * 60 * 24;
const millisecondsInHour = 1000 * 60 * 60;

const labelColours = {
    "green": "#61BD4F",
    "yellow": "#F2D600",
    "orange": "#FF9F1A",
    "red": "#EB5A46",
    "purple": "#C377E0",
    "blue": "#0079BF",
    "sky": "#00C2E0",
    "lime": "#51E898",
    "pink": "#FF78CB",
    "black": "#344563",
    "green_dark": "#519839",
    "yellow_dark": "#D9B51C",
    "orange_dark": "#D29034",
    "red_dark": "#B04632",
    "purple_dark": "#89609E",
    "blue_dark": "#055A8C",
    "sky_dark": "#096FAB",
    "lime_dark": "#4BBF6B",
    "pink_dark": "#FF7588",
    "black_dark": "#2F3E4E",
    "green_light": "#84CF96",
    "yellow_light": "#cda71b",
    "orange_light": "#FFAF5F",
    "red_light": "#FF8888",
    "purple_light": "#D8A4E2",
    "blue_light": "#4FB8F0",
    "sky_light": "#4AC3E0",
    "lime_light": "#7BE1BB",
    "pink_light": "#FF9CCB",
    "black_light": "#505F79"
};

function sortTable() {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById('taskTable');
    switching = true;
    
    while (switching) {
      switching = false;
      rows = table.getElementsByTagName('tr');
      
      for (i = 0; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = parseInt(rows[i].getAttribute('data-index'));
        y = parseInt(rows[i + 1].getAttribute('data-index'));
        
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

function openDescList(event) {
    const clickedElement = event.target.parentNode;
    const dataTitle = clickedElement.getAttribute('data-title');
    chrome.storage.local.get("TaskListing", function(data) {
        storedData = data["TaskListing"];
    });
    console.log("CARD INFO: ", storedData);

    let remainingTime;
    let color;
    let icon = "radio_button_checked";
    let icon2 = "check_box_outline_blank";

    const date = new Date(storedData[dataTitle].d + 3600000);
    const currentDate = new Date();
    const timeDifference = date.getTime() - currentDate.getTime();
    const formattedDateTime = date.toISOString().slice(0, 16);
    let daysLeft = Math.floor(timeDifference / millisecondsInDay);

    if (daysLeft <= 1) {
        color = '#a61e0c';
        icon = "error_outline";
    } else if (daysLeft <= 3) {
        color = '#ffa600';
        icon = "running_with_errors";
    } else if (daysLeft <= 7) {
        color = '#3b8000';
        icon = "timelapse";
    } else {
        color = '#3b8000';
    }
    if (storedData[dataTitle].c == 1) {
        color = '#3b8000';
        icon = 'event_available';
        icon2 = 'check_box';
    }
    if (Math.ceil(timeDifference / (1000 * 60)) <= 0) {
        color = '#aaa';
        icon = 'history_toggle_off';
        remainingTime = "Expired"
    } else if (timeDifference < millisecondsInHour) {
        remainingTime = Math.ceil(timeDifference / (1000 * 60)) + ' minutes';
    } else if (timeDifference < millisecondsInDay) {
        remainingTime = Math.floor(timeDifference / millisecondsInHour) + ' hours';
    } else {
        remainingTime = (timeDifference / millisecondsInDay).toFixed(2) + ' day(s)';
    }

    document.getElementById('info_taskLab').style.display = "none";
    document.getElementById('info_taskLab').innerHTML = "";
    if (storedData[dataTitle] && storedData[dataTitle].l) {
        const info_taskLab = document.getElementById('info_taskLab');
        storedData[dataTitle].l.forEach((item) => {
          const row = document.createElement('span');
          row.innerHTML = item.n;
          row.style.backgroundColor = labelColours[item.c];
          info_taskLab.appendChild(row);
        });
        info_taskLab.style.display = "block";
    }
    
    document.getElementById('info_taskDaysIcon').innerHTML = "<div style='border-right:1px solid #ddd;'><span style='font-size: 18px;margin-top: 0px;' class='material-icons' >"+icon+"</span></div><div>"+remainingTime+"</div>";
    document.getElementById('info_taskDaysIcon').style.color = color;
    document.getElementById('tab_table').style.display = "none";
    document.getElementById('info_taskName').textContent = dataTitle;

    document.getElementById('info_taskCardUrl').style.display = "none";
    if (storedData[dataTitle] && storedData[dataTitle].tu) {
        document.getElementById('info_taskCardUrl').href = storedData[dataTitle].tu;
        document.getElementById('info_taskCardUrl').style.display = "inline-block";
    }

    document.getElementById('info_taskDesc').style.display = "none";
    if (storedData[dataTitle].desc) {
        document.getElementById('info_taskDesc').textContent = storedData[dataTitle].desc;
        document.getElementById('info_taskDesc').style.display = "block";
    }

    document.getElementById('in_edittask_due').value = formattedDateTime;
    document.getElementById('tab_taskdesc').style.display = "block";

    document.getElementById('info_taskUrl').style.display = "none";
    document.getElementById('info_taskUrl').innerHTML = "";
    if (storedData[dataTitle] && storedData[dataTitle].u) {
        const row = document.createElement('span');
        row.innerHTML = "<a href='"+storedData[dataTitle].u+"' target='_blank' style='font-size: 18px;margin-top: 0px;'><i class='material-icons'>open_in_new</i></a><input id='etask_url' value='"+storedData[dataTitle].u+"' autocomplete='off' placeholder='Link to project'>";
        document.getElementById('info_taskUrl').appendChild(row);
        document.getElementById('info_taskUrl').style.display = "block";
    }
    document.getElementById("info_taskChecks").innerHTML = "";

    if (storedData[dataTitle] && storedData[dataTitle].checks) {
        storedData[dataTitle].checks.forEach((item) => {
            const checkTable_div = document.createElement('div');
            checkTable_div.innerHTML = "<h3><span style='font-size: 18px;padding-right:8px;margin-top: 0px;border-right:1px solid #bbb;margin-right:3px' class='material-icons'>checklist</span>&nbsp;&nbsp;"+item.name+"</h3>";
            const checkTable_table = document.createElement('table');
            item.checkItems.forEach((itemCheck) => {
                const checkTable_tr = document.createElement('tr');
                const checkTable_td = document.createElement('td');
                const checkTable_td2 = document.createElement('td');
                checkTable_td.innerHTML = itemCheck.name
                if (itemCheck.state == "complete") {
                    checkTable_td2.innerHTML = "<span style='font-size: 18px;margin-top: 0px;' class='material-icons'>check_box</span>";
                } else {
                    checkTable_td2.innerHTML = "<span style='font-size: 18px;margin-top: 0px;' class='material-icons'>check_box_outline_blank</span>"
                }
                checkTable_tr.appendChild(checkTable_td2);
                checkTable_tr.appendChild(checkTable_td);
                checkTable_table.appendChild(checkTable_tr);
            });
            checkTable_div.appendChild(checkTable_table);
            document.getElementById('info_taskChecks').appendChild(checkTable_div);
        });
    }
}

function apply_card_save_changes() {
    document.getElementById('s_descEvent_save').style.display = "none";
    const taskname = document.getElementById('info_taskName').textContent;
    const tasktime = document.getElementById('in_edittask_due').value;
    const etask_url = document.getElementById('etask_url').value;
    const epochTime = new Date(tasktime).getTime();
    chrome.storage.local.get("TaskListing", function(data) {
        storedData = data["TaskListing"];
    });
    if (storedData[taskname]) {
        storedData[taskname].desc = document.getElementById('info_taskDesc').value;
    }
    if (tasktime && epochTime) {
        storedData[taskname].d = epochTime;
    }
    if (etask_url) {
        storedData[taskname].u = etask_url;
    }

    const divsInInfoTaskChecks = document.querySelectorAll('#info_taskChecks div');
    var i_taskcheck = 0;
    divsInInfoTaskChecks.forEach(div => {
        var i_taskcheck2 = 0;
        div.querySelectorAll('tr').forEach(div2 => {
            const checkbox = div2.querySelector('input[type=checkbox]');
            if (checkbox && checkbox.checked) {
                storedData[taskname].checks[i_taskcheck].checkItems[i_taskcheck2].state = "complete";
            } else {
                storedData[taskname].checks[i_taskcheck].checkItems[i_taskcheck2].state = "incomplete";
            }
            i_taskcheck2 += 1;
        });
        i_taskcheck += 1;
    });
    chrome.storage.local.set({'TaskListing': storedData}, () => {
        document.getElementById('s_descEvent_save').style.display = "inline-block";
    });
}

function createTaskList() {
    const taskTable = document.getElementById('taskTable');
    if (!taskTable) {
        return;
    }

    taskTable.innerHTML = '';
    var completed_count = 0;
    var all_count = 0;
    chrome.storage.local.get("TaskListing", function(data) {
        storedData = data["TaskListing"];
        if (storedData) {
            Object.keys(storedData).forEach(title => {
                const date = new Date(storedData[title].d);
                const dateString = date.toDateString();
                const currentDate = new Date();
                const timeDifference = date.getTime() - currentDate.getTime();
                const row = document.createElement('tr');
                row.setAttribute('data-index', storedData[title].d);
                row.setAttribute('data-comp', storedData[title].c);
                row.setAttribute('data-title', title);
                row.setAttribute('data-desc', storedData[title].desc);
                let remainingTime;
                let color;
                let icon = "radio_button_checked";
                let icon2 = "check_box_outline_blank";
                let daysLeft = Math.floor(timeDifference / millisecondsInDay);

                all_count = parseInt(all_count) + 1;
                if (showCompletedTable == 0 && storedData[title].c == 1) {
                    row.style.display = "none";
                }
                if (daysLeft <= 1) {
                    color = '#a61e0c';
                    icon = "error_outline";
                } else if (daysLeft <= 3) {
                    color = '#ffa600';
                    icon = "running_with_errors";
                } else if (daysLeft <= 7) {
                    color = '#3b8000';
                    icon = "timelapse";
                } else {
                    color = '#3b8000';
                }
                if (storedData[title].c == 1) {
                    color = '#3b8000';
                    icon = 'event_available';
                    icon2 = 'check_box';
                    completed_count = parseInt(completed_count) + 1;
                }
                if (Math.ceil(timeDifference / (1000 * 60)) <= 0) {
                    color = '#aaa';
                    icon = 'history_toggle_off';
                    remainingTime = "Expired"
                } else if (timeDifference < millisecondsInHour) {
                    remainingTime = Math.ceil(timeDifference / (1000 * 60)) + ' minutes';
                } else if (timeDifference < millisecondsInDay) {
                    remainingTime = Math.floor(timeDifference / millisecondsInHour) + ' hours';
                } else {
                    remainingTime = (timeDifference / millisecondsInDay).toFixed(1) + ' day(s)';
                }
                const checkCell = document.createElement('td');
                checkCell.innerHTML = "<span style='font-size: 18px;margin-top: 1px;' class='material-icons'> "+icon2+"</span>";
                checkCell.addEventListener('click', () => {
                    if (storedData[title].c == 1) {
                        storedData[title].c = 0;
                    } else {
                        storedData[title].c = 1;
                    }
                    chrome.storage.local.set({ 'TaskListing': storedData }, () => {
                        createTaskList();
                    });
                });
                const titleCell = document.createElement('td');
                titleCell.textContent = title;
                if (storedData[title].c == 1) {
                    titleCell.style.textDecoration = "line-through";
                }
                titleCell.addEventListener('click', () => {
                    window.open(storedData[title].u, '_blank');
                });
                const labelCell = document.createElement('td');
                
                if (storedData[title].l && storedData[title].l[0]) {
                    labelCell.style.width = "12px"
                    labelCell.style.backgroundColor = labelColours[storedData[title].l[0].c];
                    labelCell.title = storedData[title].l[0].n;
                }
                const dateCell = document.createElement('td');
                dateCell.style.paddingLeft = "12px";
                dateCell.textContent = dateString;
                const button1Cell = document.createElement('td');
                button1Cell.innerHTML = "<span style='font-size: 18px;margin-top: 1px;' class='material-icons'> "+icon+"</span> "+remainingTime;
                button1Cell.style.color = color;

                dateCell.addEventListener('click', openDescList);
                button1Cell.addEventListener('click', openDescList);
                labelCell.addEventListener('click', openDescList);

                const button2Cell = document.createElement('td');
                const button2 = document.createElement('button');
                button2.addEventListener('click', () => {
                    delete storedData[title];
                    chrome.storage.local.set({ 'TaskListing': storedData }, () => {
                        const row = button2.parentNode.parentNode;
                        row.parentNode.removeChild(row);
                    });
                });
                button2.innerHTML = '<i class="material-icons" style="font-size: 18px;">remove</i>';
                button2Cell.setAttribute("title", "Remove "+title)
                button2.classList.add('btn_del');
                button2Cell.appendChild(button2);
                row.appendChild(checkCell);
                row.appendChild(titleCell);
                row.appendChild(labelCell);
                row.appendChild(dateCell);
                row.appendChild(button1Cell);
                row.appendChild(button2Cell);
                taskTable.appendChild(row);
            });
            if (completed_count > 0) {
                document.getElementById("s_completed_badge").textContent = completed_count;
                document.getElementById("s_completed_badge").style.display = "inline";
            } else {
                document.getElementById("s_completed_badge").style.display = "none";
            }
            sortTable();
        }

        if (showCompletedTable == 1 && all_count != 0)
            document.getElementById("nothingToSee_div").style.display = "none";
        else if ((all_count - completed_count) == 0)
            document.getElementById("nothingToSee_div").style.display = "block";
        else
            document.getElementById("nothingToSee_div").style.display = "none";
    });
}

document.getElementById("filter_input").addEventListener("keyup", filterTableNames);
function filterTableNames() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("filter_input");
    filter = input.value.toUpperCase();
    table = document.getElementById("taskTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
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

function update_showCompleted(toggle) {
    chrome.storage.local.get("showCompleted", function(data) {
        showCompletedTable = data.showCompleted;
        if (!showCompletedTable || showCompletedTable == 0) {
            document.getElementById('s_completed_icon').textContent = "visibility";
            showCompletedTable = 0;
        } else {
            document.getElementById('s_completed_icon').textContent = "visibility_off";
        }
        if (toggle) {
            if (!showCompletedTable || showCompletedTable == 0) {
                showCompletedTable = 1;
            } else {
                showCompletedTable = 0;
            }
            chrome.storage.local.set({'showCompleted': showCompletedTable}, () => {
                update_showCompleted(false);
                createTaskList();
            });
        }
    });
}

document.getElementById('s_descEvent_save').addEventListener('click', apply_card_save_changes);

document.getElementById('s_completed_btn').addEventListener('click', () => {
    update_showCompleted(true);
});

document.getElementById('s_add_btn').addEventListener('click', () => {
    document.getElementById('tab_table').style.display = "none";
    document.getElementById('tab_addevent').style.display = "block";
});

document.getElementById('s_canelEvent_btn').addEventListener('click', () => {
    document.getElementById('tab_table').style.display = "block";
    document.getElementById('tab_addevent').style.display = "none";
});

document.getElementById('s_canelEvent_btn3').addEventListener('click', () => {
    document.getElementById('tab_table').style.display = "block";
    document.getElementById('tab_taskdesc').style.display = "none";
});

document.getElementById('s_add_btn2').addEventListener('click', () => {
    document.getElementById('tab_table').style.display = "none";
    document.getElementById('tab_addevent').style.display = "block";
});

document.getElementById('tb_intra_btn').addEventListener('click', () => {
    window.open('https://intra.epitech.eu/', '_blank');
});

document.getElementById('createTask_form').addEventListener('submit', (event) => {
    event.preventDefault();
    let t_name = document.getElementById('in_addtask_name').value;
    let t_url =  document.getElementById('in_addtask_url').value;
    let t_date =  document.getElementById('in_addtask_due').value;
    const epochTime = new Date(t_date).getTime();

    chrome.storage.local.get("TaskListing", function(data) {
        let newData = data["TaskListing"] || {};
        
        newData[t_name] = {
            d: epochTime,
            u: t_url,
            c: 0
          };

        chrome.storage.local.set({ "TaskListing": newData }, function() {
            createTaskList();
            document.getElementById('tab_table').style.display = "block";
            document.getElementById('tab_addevent').style.display = "none"
        });
    });
});

window.onload = function() {
    update_showCompleted(false);
    createTaskList();
};

var url = new URL(window.location.href);
var url_c = url.searchParams.get("t");
if (url_c == "tab_allprojects") {
    document.getElementById('tab_table').style.display = "none";
    document.getElementById('tab_allprojects').style.display = "block";
}