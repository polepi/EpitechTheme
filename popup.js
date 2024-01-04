var storedData = {};
const millisecondsInDay = 1000 * 60 * 60 * 24;
const millisecondsInHour = 1000 * 60 * 60;

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
  

function createTaskList() {
    const taskTable = document.getElementById('taskTable');
    if (!taskTable) {
        return;
    }

    taskTable.innerHTML = '';

    chrome.storage.local.get("TaskListing", function(data) {
        const storedData = data["TaskListing"];
        console.log("Opening", storedData);
        if (storedData) {
            Object.keys(storedData).forEach(title => {
                const date = new Date(storedData[title].d);
                const dateString = date.toDateString();
                const currentDate = new Date();
                const timeDifference = date.getTime() - currentDate.getTime();

                const row = document.createElement('tr');

                row.setAttribute('data-index', storedData[title].d);
                let remainingTime;
                let color;
                let icon = "radio_button_checked";
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

                if (Math.ceil(timeDifference / (1000 * 60)) <= 0) {
                    color = '#aaa';
                    icon = 'history_toggle_off';
                    remainingTime = "Expired"
                } else if (timeDifference < millisecondsInHour) {
                    remainingTime = Math.ceil(timeDifference / (1000 * 60)) + ' minutes';
                } else if (timeDifference < millisecondsInDay) {
                    remainingTime = Math.floor(timeDifference / millisecondsInHour) + ' hours';
                } else {
                    remainingTime = daysLeft + ' day(s)';
                }

                const titleCell = document.createElement('td');
                titleCell.textContent = title;
                titleCell.addEventListener('click', () => {
                    window.open(storedData[title].u, '_blank');
                });
                const dateCell = document.createElement('td');
                dateCell.textContent = dateString;
                const button1Cell = document.createElement('td');
                button1Cell.innerHTML = "<span style='font-size: 18px;margin-top: 1px;' class='material-icons'> "+icon+"</span> "+remainingTime;
                button1Cell.style.color = color;
                const button2Cell = document.createElement('td');
                const button2 = document.createElement('button');
                button2.addEventListener('click', () => {
                    delete storedData[title];
                    chrome.storage.local.set({ 'TaskListing': storedData }, () => {
                        console.log('storedData updated after removal', storedData);
                        const row = button2.parentNode.parentNode;
                        row.parentNode.removeChild(row);
                    });
                });
                button2.innerHTML = '<i class="material-icons" style="font-size: 16px;">delete</i>';
                button2.classList.add('btn_del');
                button2Cell.appendChild(button2);
                row.appendChild(titleCell);
                row.appendChild(dateCell);
                row.appendChild(button1Cell);
                row.appendChild(button2Cell);
                taskTable.appendChild(row);
            });
            sortTable();
        } else {
            const noDataItem = document.createElement('tr');
            const noDataCell = document.createElement('td');
            noDataCell.textContent = 'No tasks added';
            noDataCell.colSpan = 4;
            noDataItem.appendChild(noDataCell);
            taskTable.appendChild(noDataItem);
        }
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

window.onload = function() {
    createTaskList();
};
