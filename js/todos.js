const lists_selection_wrapper = document.getElementById("lists_selection_wrapper");
const list_table_todos = document.getElementById("taskTable");
const list_card_info = document.getElementById("tab_display_card");

const millisecondsInDay = 1000 * 60 * 60 * 24;
const millisecondsInHour = 1000 * 60 * 60;

var filter_show_completed = false;

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

var labelsData = {};
var boardData = {};

var todo_sel = null;
var card_sel = null;
var data_lists = null;
var trello_data = null;

function textcolor_auto_detection(colour) {
    colour = (colour.charAt(0) === '#') ? colour.substring(1, 7) : colour;
    var r = parseInt(colour.substring(0, 2), 16);
    var g = parseInt(colour.substring(2, 4), 16);
    var b = parseInt(colour.substring(4, 6), 16);
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 120) ? "#000" : "#f1f1f1";
}

async function card_trello_getURLs(card_id, only_proj) {
    var retval = null;

    try {
        const req = await fetch(`https://api.trello.com/1/cards/${card_id}/attachments?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            if (req.status == 401)
                document.getElementById("trello_change_content_wrapper").innerHTML = "<br><br><center>401 Invalid credentials\nVerify your Trello API credentials.</center>";
            else
                alert(`HTTP error: ${req.status}`);
            document.getElementById("modal_show_trello_list").style.display = "none";
            throw new Error(`HTTP error: ${req.status}`);
        }
        const res = await req.json();

        if (res.length != 0) {
            retval = {
                "project": null,
                "attachments": res
            }
            for (let i = 0; i < res.length; i++) {
                if (res[i]["name"] == "Project") {
                    retval["project"] = res[i];
                    break;
                }
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
    if (only_proj == true && retval && retval["project"]["url"])
        return retval["project"]["url"];
    return retval;
}

function card_disp_cleanup() {
    document.getElementById("form_create_edit").style.display = "none";
    document.getElementById("loading_create_edit").style.display = "block";
    list_card_info.style.display = "block";
    document.getElementById("tab_display_card_todos_wrap").style.display = "none";
    document.getElementById("tab_display_card_todos_wrap").innerHTML = "";
    document.getElementById("tab_display_card_labels").innerHTML = "";
    document.getElementById("tab_display_card_attachments").innerHTML = "";
}

function card_load_into(id) {
    var data_temp = null;

    card_disp_cleanup();
    document.getElementById("s_editcard_save_btn").style.display = "inline-block";
    document.getElementById("edit_card_url_open_trello_link").style.display = "none";

    if (data_lists["sel"] && data_lists["list"] && data_lists["list"][data_lists["sel"]]["cards"][id])
        data_temp = data_lists["list"][data_lists["sel"]]["cards"][id];
    else
        return;

    document.getElementById("tab_table").style.display = "none";

    document.getElementById("info_task_edit_name").innerHTML = `Edit <b>${data_temp["name"]}</b>`;
    list_card_info.querySelector("[name='name']").value = data_temp["name"];
    list_card_info.querySelector("[name='url']").value = data_temp["url"];

    list_card_info.querySelector("[name='desc']").style.height = "1px";
    list_card_info.querySelector("[name='desc']").value = data_temp["desc"];
    
    var epochTime = data_temp["due_date"];
    var d = new Date(epochTime);
    list_card_info.querySelector("[name='duetime']").value = d.toISOString().slice(0, 16);

    list_card_info.querySelector("[name='duetime']").addEventListener("change", function() {
        if (list_card_info.querySelector("[name='duetime']").value) {
            const temp_d = new Date(list_card_info.querySelector("[name='duetime']").value);
            if (temp_d) {
                document.getElementById("edit_card_date_due").innerHTML = get_dueDate(temp_d.getTime());
            }
        }
    });

    document.getElementById("edit_card_date_due").innerHTML = get_dueDate(data_temp["due_date"]);

    if (data_temp["url"]) {
        document.getElementById("edit_card_url_open_link").style.display = "block";
        document.getElementById("edit_card_url_open_link").href = data_temp["url"];
    } else
        document.getElementById("edit_card_url_open_link").style.display = "none";

    document.getElementById("loading_create_edit").style.display = "none";
    document.getElementById("form_create_edit").style.display = "block";

    list_card_info.style.display = "block";
    list_card_info.querySelector("[name='desc']").style.height = (25+list_card_info.querySelector("[name='desc']").scrollHeight)+"px";
}

async function trello_load_checklist(check_id) {
    var res = null;

    try {
        const req = await fetch(`https://api.trello.com/1/checklists/${check_id}?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            throw new Error(`HTTP error: ${req.status}`);
        }
        res = await req.json();
    } catch (error) {
        console.error('An error occurred:', error);
    }
    return res;
}

async function card_load_trello_into(data_temp) {
    document.getElementById("tab_table").style.display = "none";
    document.getElementById("s_editcard_save_btn").style.display = "inline-block";

    card_disp_cleanup();
    card_sel = data_temp["id"];
    document.getElementById("info_task_edit_name").innerHTML = `Edit <b>${data_temp["name"]}</b>`;
    list_card_info.querySelector("[name='name']").value = data_temp["name"];
    list_card_info.querySelector("[name='url']").value = data_temp["url"];
    document.getElementById("edit_card_url_open_trello_link").href = data_temp["url"];

    list_card_info.querySelector("[name='desc']").style.height = "1px";
    list_card_info.querySelector("[name='desc']").value = data_temp["desc"];

    if (data_temp["due"] && data_temp["due"] != null) {
        var d = new Date(data_temp["due"]);

        list_card_info.querySelector("[name='duetime']").value = d.toISOString().slice(0, 16);
        document.getElementById("edit_card_date_due").innerHTML = get_dueDate(d.getTime());
    }

    list_card_info.querySelector("[name='duetime']").addEventListener("change", function() {
        if (list_card_info.querySelector("[name='duetime']").value) {
            const temp_d = new Date(list_card_info.querySelector("[name='duetime']").value);
            if (temp_d) {
                document.getElementById("edit_card_date_due").innerHTML = get_dueDate(temp_d.getTime());
            }
        }
    });

    document.getElementById("tab_display_card_attachments").parentNode.style.display = "none";
    const attach_url = await card_trello_getURLs(data_temp["id"]);
    if (attach_url) {
        if (attach_url["project"] && attach_url["project"]["url"]) {
            document.getElementById("form_create_edit").querySelector("[name='url']").value = attach_url["project"]["url"];
            document.getElementById("edit_card_url_open_link").style.display = "block";
            document.getElementById("edit_card_url_open_link").href = attach_url["project"]["url"];
        }
        if (attach_url["attachments"]) {
            for (let i = 0; i < attach_url["attachments"].length; i++) {
                if (!attach_url["attachments"][i]["url"] || attach_url["attachments"][i]["name"] == "Project")
                    continue;
                document.getElementById("tab_display_card_attachments").parentNode.style.display = "block";
                if (attach_url["attachments"][i]["name"] && attach_url["attachments"][i]["name"] != attach_url["attachments"][i]["url"])
                    document.getElementById("tab_display_card_attachments").innerHTML += `<a href="${attach_url["attachments"][i]["url"]}" target="_blank"><span class="material-icons-outlined" style="margin-right: 6px;font-size: 18px;margin-top: 1px;color: #666;">link</span> ${attach_url["attachments"][i]["name"]} (${attach_url["attachments"][i]["url"]})</a>`;
                else
                    document.getElementById("tab_display_card_attachments").innerHTML += `<a href="${attach_url["attachments"][i]["url"]}" target="_blank"><span class="material-icons-outlined" style="margin-right: 6px;font-size: 18px;margin-top: 1px;color: #666;">link</span> ${attach_url["attachments"][i]["url"]}</a>`;
            }
        }
    }

    if (data_temp["idChecklists"].length > 0) {
        for (let i = 0; i < data_temp["idChecklists"].length; i++) {
            const data_todo_temp = await trello_load_checklist(data_temp["idChecklists"][i]);
            if (!data_todo_temp || !data_todo_temp["checkItems"] || data_todo_temp["checkItems"].length <= 0)
                continue;

            const attach_todos_title = document.createElement("h3");
            const attach_todos = document.createElement("table");

            attach_todos_title.innerHTML = `${data_todo_temp["name"]}`;

            data_todo_temp["checkItems"].forEach((itemCheck) => {
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
                attach_todos.appendChild(checkTable_tr);
            });
            document.getElementById("tab_display_card_todos_wrap").appendChild(attach_todos_title);
            document.getElementById("tab_display_card_todos_wrap").appendChild(attach_todos);
        }
        
        document.getElementById("tab_display_card_todos_wrap").style.display = "block";
    }

    const labels_temp = data_temp["labels"];
    if (labels_temp && labels_temp.length > 0) {
        document.getElementById("tab_display_card_labels").parentNode.style.display = "block";
        for (let i = 0; i < labels_temp.length; i++)
            document.getElementById("tab_display_card_labels").innerHTML += `<span style="background-color:${labelColours[labels_temp[i]["color"]]};color:${textcolor_auto_detection(labelColours[labels_temp[i]["color"]])};">${labels_temp[i]["name"]}</span>`;
    } else {
        document.getElementById("tab_display_card_labels").parentNode.style.display = "none";
    }
    document.getElementById("loading_create_edit").style.display = "none";
    document.getElementById("form_create_edit").style.display = "block";

    list_card_info.querySelector("[name='desc']").style.height = (25+list_card_info.querySelector("[name='desc']").scrollHeight)+"px";
    document.getElementById("edit_card_url_open_trello_link").style.display = "inline-block";
}

function formatDate(d) {
    var date = new Date(d);
    var dayName = date.toLocaleString('default', { weekday: 'long' });
    var dayNum = date.getDate();
    var month = date.getMonth() + 1;

    return `${dayName}, ${dayNum}/${month}`;
}

function get_dueDate(d, raw) {
    let remainingTime;
    let color;
    let icon = "radio_button_checked";
    let is_completed = 0;

    const date = new Date(d + 3600000);
    const currentDate = new Date();
    const timeDifference = date.getTime() - currentDate.getTime();
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

    if (is_completed == 1) {
        color = '#3b8000';
        icon = 'event_available';
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
        remainingTime = (timeDifference / millisecondsInDay).toFixed(1) + ' day';
        if ((timeDifference / millisecondsInDay).toFixed(1) > 1)
            remainingTime += 's';
    }

    if (raw)
        return `${remainingTime}`;
    return `<span style='color:${color};font-size:12px;'><span class="material-icons-outlined mar-right" style="font-size:16px;margin-top:2.5px;">${icon}</span><span>${remainingTime}</span></span>`;
}

async function create_add_new_trello_url(id, url) {
    await fetch(`https://api.trello.com/1/cards/${id}/attachments?name=Project&url=${url}&key=${trello_data.apiKey}&token=${trello_data.token}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }})
        .then(response => {
            return response.text();
    })
    .then()
    .catch(err => console.error(err));
}

async function trello_card_update(id, new_data, reload_after) {
    new_data["key"] = trello_data.apiKey;
    new_data["token"] = trello_data.token;
    
    const response = await fetch(`https://api.trello.com/1/cards/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json'
        },
        body: new URLSearchParams(new_data)
    });

    if (!response.ok) {
        throw new Error('Failed to update card');
    }

    const data = await response.json();

    if (reload_after)
        location.reload();
    return data;  
}

async function trello_card_remove(id) {
    await fetch(`https://api.trello.com/1/cards/${id}?&key=${trello_data.apiKey}&token=${trello_data.token}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }})
        .then(response => {
            return response.text();
    })
    .then(function() {
        location.reload();
    })
    .catch(err => console.error(err));
}

async function card_add_new_trello(form) {
    var data_temp = null;

    if (data_lists["sel"]) {
        data_temp = data_lists["list"][data_lists["sel"]];
        if (!data_temp["trello_id"])
            return;
    } else
        return;

    const d_name = form.querySelector("[name='name']").value;
    const d_url = form.querySelector("[name='url']").value;
    var d_due = form.querySelector("[name='duetime']").value;
    const d_desc = form.querySelector("[name='desc']").value;

    if (d_name == "" || !d_due)
        return;

    if (Date.parse(d_due)) {
        d_due = Date.parse(d_due);
    }

    document.getElementById("edit_card_date_due").innerHTML = "";

    await fetch(`https://api.trello.com/1/cards?idList=${data_temp["trello_id"]}&name=${d_name}&due=${d_due}&desc=${d_desc}&key=${trello_data.apiKey}&token=${trello_data.token}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }})
        .then(response => {
            return response.json();
    })
    .then(res => {
        if (d_url && d_url != null && d_url != "" && res && res["id"]) {
            create_add_new_trello_url(res["id"], d_url);
        }
    })
    .catch(err => console.error(err));
}

function card_add_new(form) {
    var data_temp = null;

    if (data_lists["sel"])
        data_temp = data_lists["list"][data_lists["sel"]];
    else
        return;

    const d_name = form.querySelector("[name='name']").value;
    const d_url = form.querySelector("[name='url']").value;
    var d_due = form.querySelector("[name='duetime']").value;
    const d_desc = form.querySelector("[name='desc']").value;

    if (d_name == "" || !d_due)
        return;

    if (Date.parse(d_due)) {
        d_due = Date.parse(d_due);
    }

    document.getElementById("edit_card_date_due").innerHTML = "";

    data_lists["list"][data_lists["sel"]]["cards"].push({
        "name": d_name,
        "due_date": d_due,
        "url": d_url,
        "desc": d_desc,
        "labels": [],
        "completed": 0
    });

    chrome.storage.local.set({"TodoLists": data_lists});
}

document.getElementById("form_create_new").addEventListener("submit", function(e) {
    e.preventDefault();
    if (boardData && data_lists["sel"] && data_lists["list"][data_lists["sel"]]
        && data_lists["list"][data_lists["sel"]]["trello_id"]) {
        card_add_new_trello(document.getElementById("form_create_new"));
        location.reload();
    } else {
        card_add_new(document.getElementById("form_create_new"));
        location.reload();
    }
});

document.getElementById("form_create_edit").addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!data_lists || !data_lists["sel"]) {
        console.log("No list selected");
        return;
    }

    const form = document.getElementById("form_create_edit");

    const d_name = form.querySelector("[name='name']").value;
    const d_url = form.querySelector("[name='url']").value;
    var d_due = form.querySelector("[name='duetime']").value;
    const d_desc = form.querySelector("[name='desc']").value;

    if (d_name == "" || !d_due)
        return;

    if (Date.parse(d_due)) {
        d_due = Date.parse(d_due);
    }

    if (data_lists["list"][data_lists["sel"]] && data_lists["list"][data_lists["sel"]]["trello_id"] && card_sel) {
        trello_card_update(card_sel, {
            "name": d_name,
            "due": d_due,
            "desc": d_desc,
        }, true);
    } else if (data_lists["list"][data_lists["sel"]]["cards"] && data_lists["list"][data_lists["sel"]]["cards"][card_sel]) {
        data_lists["list"][data_lists["sel"]]["cards"][card_sel] = {
            "name": d_name,
            "due_date": d_due,
            "url": d_url,
            "desc": d_desc,
            "labels": [],
            "completed": 0
        };
    
        chrome.storage.local.set({"TodoLists": data_lists}, function() {
            location.reload();
        });
    }
});

async function get_trelloBoard_data(bid) {
    var res = null;

    try {
        const req = await fetch(`https://api.trello.com/1/boards/${bid}?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            if (req.status == 401)
                document.getElementById("trello_change_content_wrapper").innerHTML = "<br><br><center>401 Invalid credentials\nVerify your Trello API credentials.</center>";
            else
                alert(`HTTP error: ${req.status}`);
            throw new Error(`HTTP error: ${req.status}`);
        }
        res = await req.json();
    } catch (err) {
        console.log("Error loading board data from Trello:",err)
    }
    return res;
}

async function trello_card_redirect(temp_card) {
    const temp_project_url = await card_trello_getURLs(temp_card["id"], true);
    if (temp_project_url)
        window.open(temp_project_url, '_blank');
    else if (temp_card["url"] && temp_card["url"] != "" && temp_card["url"] != null)
        window.open(temp_card["url"], '_blank');
    else
        card_load_trello_into(temp_card);
}

async function list_render_trello() {
    document.getElementById("trello_change_content_wrapper").innerHTML = "";
    document.getElementById("nothingToSee_div").style.display = "none";
    document.getElementById("trello_load_list_loader").style.display = "block";
    var data_board = data_lists["list"][data_lists["sel"]];
    try {
        const req = await fetch(`https://api.trello.com/1/lists/${data_board["trello_id"]}/cards?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            if (req.status == 401)
                document.getElementById("trello_change_content_wrapper").innerHTML = "<br><br><center>401 Invalid credentials\nVerify your Trello API credentials.</center>";
            else
                alert(`HTTP error: ${req.status}`);
            document.getElementById("modal_show_trello_list").style.display = "none";
            throw new Error(`HTTP error: ${req.status}`);
        }
        const res = await req.json();

        boardData = await get_trelloBoard_data(data_board["trello_board_id"]);
        if (boardData && boardData["labelNames"]) {
            Object.keys(boardData["labelNames"]).forEach(function(key) {
                if (boardData["labelNames"][key] != "")
                    labelsData[boardData["labelNames"][key]] = key;
            });
        }

        if (res.length > 0)
            document.getElementById("nothingToSee_div").style.display = "block";

        for (let i = 0; i < res.length; i++)  {
            const temp_card = res[i];

            const new_el = document.createElement("tr");
            const del_el = document.createElement("span");
    
            const new_td_1 = document.createElement("td");
            const new_td_2 = document.createElement("td");
            const new_td_3 = document.createElement("td");
            const new_td_4 = document.createElement("td");
            const new_td_5 = document.createElement("td");
            const new_td_6 = document.createElement("td");

            var local_date = new Date(temp_card["due"]);
            var epoch_data = local_date.getTime();

            // LABELS //

            const labels_temp = temp_card["labels"];
            const max_labels_display = 3;
            if (labels_temp && labels_temp.length > 0) {
                var label_attr = "";
                document.getElementById("tab_display_card_labels").parentNode.style.display = "block";
                for (let i = 0; i < labels_temp.length; i++) {
                    if (i < max_labels_display)
                        new_td_6.innerHTML += `<c_label style='z-index: ${(max_labels_display + 1) - i};background-color:${labelColours[labels_temp[i]["color"]]};' title='${labels_temp[i]["name"]}'></c_label>`;
                    if (label_attr != "")
                        label_attr += ","
                    label_attr += labels_temp[i]["name"]
                }
                if (labels_temp.length > max_labels_display)
                    new_td_6.innerHTML += `<c_label style='background: repeating-linear-gradient( 45deg, #fff, #fff 2px, #999 2px, #999 4px );' title='${label_attr}'></c_label>`;
                new_el.setAttribute("data-labels", label_attr);
            } else {
                document.getElementById("tab_display_card_labels").parentNode.style.display = "none";
            }
            new_td_6.style = "white-space: nowrap; width: 1%;";

            // DELETE CARD //
    
            del_el.textContent = "close";
            del_el.classList.add("material-icons-round");
            del_el.title = `Remove "${temp_card["name"]}"`;
    
            del_el.addEventListener("click", function() {
                if (confirm(`Do you wish to remove ${temp_card["name"]}?`) == true) {
                    del_el.style.display = "none";

                    if (data_board && data_board["trello_id"]) {
                        trello_card_remove(temp_card["id"]);
                    } else {
                        data_lists["list"][data_lists["sel"]]["cards"].splice(i, 1);
                        chrome.storage.local.set({"TodoLists": data_lists}, function() {
                            location.reload();
                        });
                    }
                }
            });

            if (temp_card["dueComplete"] == true) {
                new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box</span>`;
                new_el.setAttribute("data-completed", true);
                new_td_2.style.textDecoration = "line-through";
            } else {
                new_el.setAttribute("data-completed", false);
                new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box_outline_blank</span>`;
            }

            new_td_1.title = "Mark as completed"
            new_td_2.innerHTML = `${temp_card["name"]}`;

            if (temp_card["due"] && temp_card["due"] != null) {
                new_td_3.innerHTML = `${get_dueDate(epoch_data)}`;
                new_td_4.innerHTML = formatDate(epoch_data);
                new_td_4.title = local_date;
            } else {
                new_td_3.innerHTML = "";
                new_td_4.innerHTML = "";
                new_td_4.title = "";
            }

            new_el.setAttribute("data-due_date", epoch_data);
            
            new_td_5.classList.add("navbar_actions");
            new_td_5.appendChild(del_el);
    
            new_td_1.addEventListener("click", function() {
                if (temp_card["dueComplete"] == true || temp_card["dueComplete"] == "true" || temp_card["dueComplete"] == 1) {
                    new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box_outline_blank</span>`;
                    temp_card["dueComplete"] = 0;
                    new_el.setAttribute("data-completed", false);
                    trello_card_update(temp_card["id"], {dueComplete: false});
                } else {
                    new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box</span>`;
                    temp_card["dueComplete"] = 1;
                    new_el.setAttribute("data-completed", true);
                    trello_card_update(temp_card["id"], {dueComplete: true});
                }
                show_completed_update();
            });
            new_td_2.addEventListener("click", function() {
                trello_card_redirect(temp_card);
            });
            new_td_3.addEventListener("click", function() {
                card_load_trello_into(temp_card);
            });
            new_td_4.addEventListener("click", function() {
                card_load_trello_into(temp_card);
            });
            new_td_6.addEventListener("click", function() {
                card_load_trello_into(temp_card);
            });
    
            if (temp_card["url"] && temp_card["url"] != "" && temp_card["url"] != null)
                new_td_2.title = `Open "${temp_card["url"]}"`;
            else
                new_td_2.title = `Edit "${temp_card["name"]}"`;
    
            new_td_3.title = `Edit "${temp_card["name"]}"`;
    
            new_el.setAttribute("data-id", i);
            
            new_el.appendChild(new_td_1);
            new_el.appendChild(new_td_2);
            new_el.appendChild(new_td_6);
            new_el.appendChild(new_td_4);
            new_el.appendChild(new_td_3);
            new_el.appendChild(new_td_5);
            list_table_todos.appendChild(new_el);
        }
        show_completed_update();
        Array.from(list_table_todos.getElementsByTagName("tr"))
            .sort((a, b) => a.getAttribute("data-due_date").localeCompare(b.getAttribute("data-due_date")))
            .forEach(li => list_table_todos.appendChild(li));
    } catch (error) {
        list_table_todos.innerHTML = "<p><center><b>Error</b> unable to connect to Trello</center></p>"
        console.error('An error occurred:', error);
    }
    document.getElementById("trello_load_list_loader").style.display = "none";
}

function list_render_local() {
    var data_temp = null;

    document.getElementById("trello_load_list_loader").style.display = "block";

    console.log("->",data_lists)

    if (data_lists && data_lists["sel"])
        data_temp = data_lists["list"][data_lists["sel"]];
    else {
        console.log("No list selected");
        list_table_todos.innerHTML = "<p>Error loading a list.</p>";
        return;
    }

    data_temp["ltime"] = Date.now();
    chrome.storage.local.set({"TodoLists": data_lists});

    document.getElementById("tab_table").style.display = "block";
    document.getElementById("tab_sidebar").style.display = "none";

    list_table_todos.innerHTML = "";
    labelsData = {};
    boardData = {};

    if (data_temp && data_temp["trello_id"]) {
        document.getElementById("in_filter_lists").placeholder = `Search in "${data_lists["sel"]}"`;
        document.getElementById("view_list_url_open_trello_link").href = `https://trello.com/b/${data_temp["trello_board_id"]}`;
        document.getElementById("view_list_url_open_trello_link").style.display = "inline-block";
        list_render_trello();
        return;
    }
    document.getElementById("view_list_url_open_trello_link").style.display = "none";
    document.getElementById("tab_display_card_attachments").parentNode.style.display = "none";
    document.getElementById("tab_display_card_labels").parentNode.style.display = "none";
    document.getElementById("in_filter_lists").placeholder = `Search in "${data_lists["sel"]}"`;
    
    if (data_temp["cards"].length == 0)
        document.getElementById("nothingToSee_div").style.display = "block";
    else
        document.getElementById("nothingToSee_div").style.display = "none";

    for (let i = 0; i < data_temp["cards"].length; i++) {
        const temp_card = data_temp["cards"][i];

        const new_el = document.createElement("tr");
        const del_el = document.createElement("span");

        const new_td_1 = document.createElement("td");
        const new_td_2 = document.createElement("td");
        const new_td_3 = document.createElement("td");
        const new_td_4 = document.createElement("td");
        const new_td_5 = document.createElement("td");

        var local_date = new Date(temp_card["due_date"]);

        del_el.textContent = "close";
        del_el.classList.add("material-icons-round");
        del_el.title = `Remove "${temp_card["name"]}"`;

        del_el.addEventListener("click", function() {
            if (confirm(`Do you wish to remove ${temp_card["name"]}?`) == true) {
                del_el.style.display = "none";
                data_lists["list"][data_lists["sel"]]["cards"].splice(i, 1);
                chrome.storage.local.set({"TodoLists": data_lists}, function() {
                    location.reload();
                });
            }
        });

        if (temp_card["completed"] == 1) {
            new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box</span>`;
            new_el.setAttribute("data-completed", true);
            new_td_2.style.textDecoration = "line-through";
        } else {
            new_el.setAttribute("data-completed", false);
            new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box_outline_blank</span>`;
        }
        new_td_1.title = "Mark as completed"
        new_td_2.innerHTML = `${temp_card["name"]}`;
        new_td_3.innerHTML = `${get_dueDate(temp_card["due_date"])}`;
        new_td_4.innerHTML = formatDate(temp_card["due_date"]);
        new_td_4.title = local_date;
        new_td_5.classList.add("navbar_actions");
        new_td_5.appendChild(del_el);

        new_td_1.addEventListener("click", function() {
            if (temp_card["completed"] == 1) {
                new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box_outline_blank</span>`;
                temp_card["completed"] = 0;
                new_el.setAttribute("data-completed", false);
            } else {
                new_td_1.innerHTML = `<span class="material-icons-round" style="font-size: 17px;">check_box</span>`;
                temp_card["completed"] = 1;
                new_el.setAttribute("data-completed", true);
            }
            chrome.storage.local.set({"TodoLists": data_lists});
            show_completed_update();
        });
        new_td_2.addEventListener("click", function() {
            if (temp_card["url"] && temp_card["url"] != "" && temp_card["url"] != null)
                window.open(temp_card["url"], '_blank');
            else
                card_load_into(i);
        });
        new_td_3.addEventListener("click", function() {
            card_load_into(i);
        });
        new_td_4.addEventListener("click", function() {
            card_load_into(i);
        });

        if (temp_card["url"] && temp_card["url"] != "" && temp_card["url"] != null)
            new_td_2.title = `Open "${temp_card["url"]}"`;
        else
            new_td_2.title = `Edit "${temp_card["name"]}"`;

        new_td_3.title = `Edit "${temp_card["name"]}"`;

        new_el.setAttribute("data-id", i);
        new_el.setAttribute("data-due_date", temp_card["due_date"]);
        
        new_el.appendChild(new_td_1);
        new_el.appendChild(new_td_2);
        new_el.appendChild(new_td_4);
        new_el.appendChild(new_td_3);
        new_el.appendChild(new_td_5);
        list_table_todos.appendChild(new_el);
    }

    document.getElementById("trello_load_list_loader").style.display = "none";

    Array.from(list_table_todos.getElementsByTagName("tr"))
            .sort((a, b) => a.getAttribute("data-due_date").localeCompare(b.getAttribute("data-due_date")))
            .forEach(li => list_table_todos.appendChild(li));

    show_completed_update();
}

function show_completed_update() {
    let count = 0;
    let comp_count = 0;

    list_table_todos.querySelectorAll("tr").forEach(element => {
        if (filter_show_completed && element.getAttribute("data-completed") == 'true') {
            element.style.display = "";
            count += 1;
            comp_count += 1;
            element.querySelector("td:nth-child(2)").style.textDecoration = "line-through";
        } else if (element.getAttribute("data-completed") == 'true') {
            element.style.display = "none";
            comp_count += 1;
        } else {
            count += 1;
            element.querySelector("td:nth-child(2)").style.textDecoration = "";
        }
    });

    if (count == 0)
        document.getElementById("nothingToSee_div").style.display = "block";
    else
        document.getElementById("nothingToSee_div").style.display = "none";
    document.getElementById("s_togg_completed_btn").querySelector("span:nth-child(2)").innerHTML = `${comp_count}`;
    if (comp_count == 0)
        document.getElementById("s_togg_completed_btn").querySelector("span:nth-child(2)").style.display = 'none';
    else
        document.getElementById("s_togg_completed_btn").querySelector("span:nth-child(2)").style.display = 'inline-block';
    document.getElementById("loading_create_edit").style.display = "none";
}

document.getElementById("s_togg_completed_btn").addEventListener("click", function() {
    filter_show_completed = !filter_show_completed;
    show_completed_update();
    chrome.storage.local.set({'showCompleted': filter_show_completed});
});

document.getElementById("s_newcard_ret_btn").addEventListener("click", function() {
    document.getElementById("tab_create_new").style.display = "none";
    document.getElementById("tab_table").style.display = "block";
});

document.getElementById("s_editcard_ret_btn").addEventListener("click", function() {
    document.getElementById("tab_display_card").style.display = "none";
    document.getElementById("tab_table").style.display = "block";
});

document.getElementById("edit_card_date_deco").addEventListener("click", function() {
    document.getElementById("form_create_edit").querySelector("[name='duetime']").showPicker();
});

function load_lists_data() {
    chrome.storage.local.get("TodoLists", function(data) {
        data_lists = data["TodoLists"] || {
            "sel": "Todo",
            "list": {
                "Todo": {
                    "name": "Todo",
                    "ctime": Date.now(),
                    "ltime": Date.now(),
                    "is_fav": 0,
                    "is_hid": 0,
                    "cards": []
                }
            }
        };
        if (data_lists["sel"])
            todo_sel = data_lists["sel"];
        else {
            
            const temp_list_fix = Object.entries(data_lists["list"]);

            if (temp_list_fix.length > 0) {
                data_lists["sel"] = temp_list_fix[0][0];
            } else {
                console.log("(!) Error: No list selected!");
                return;
            }
        }

        lists_selection_wrapper.innerHTML = "";

        const array_lists = Object.entries(data_lists["list"]);

        if (array_lists.length <= 0)
            lists_selection_wrapper.innerHTML = "<li><center>🧾 No lists found</center></li>";

        array_lists.forEach(([key, list]) => {
            const new_el = document.createElement("li");
            const del_el = document.createElement("i");

            new_el.setAttribute("data-mdate", list["ltime"]);

            if (list["trello_id"]) {
                new_el.innerHTML = `${list["name"]}<svg class="svg_ico" title="Linked to a trello list" style="position:absolute;right:40px;" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.147 0H2.853A2.86 2.86 0 000 2.853v18.294A2.86 2.86 0 002.853 24h18.294A2.86 2.86 0 0024 21.147V2.853A2.86 2.86 0 0021.147 0zM10.34 17.287a.953.953 0 01-.953.953h-4a.954.954 0 01-.954-.953V5.38a.953.953 0 01.954-.953h4a.954.954 0 01.953.953zm9.233-5.467a.944.944 0 01-.953.947h-4a.947.947 0 01-.953-.947V5.38a.953.953 0 01.953-.953h4a.954.954 0 01.953.953z"/></svg>`;
                new_el.addEventListener("click", function() {
                    todo_sel = list["name"];
                    data_lists["sel"] = list["name"];
                    chrome.storage.local.set({"TodoLists": data_lists}, function() {
                        list_render_local();
                    });
                });
            } else {
                new_el.innerHTML = `${list["name"]}`;
                new_el.addEventListener("click", function() {
                    todo_sel = list["name"];
                    data_lists["sel"] = list["name"];
                    chrome.storage.local.set({"TodoLists": data_lists}, function() {
                        list_render_local();
                    });
                });
            }

            del_el.innerHTML = `<span class="material-icons-round mar-right" style="font-size: 17px;">close</span>`;
            del_el.style = "position:absolute;right:10px;"
            del_el.addEventListener("click", function() {
                if (Object.keys(data_lists["list"]).length <= 1) {
                    alert("You cannot remove all lists!\nCreate a new list before removing this one.")
                    return;
                }

                if (list["trello_id"]) {
                    if (!confirm(`Do you wish to unlink ${list["name"]} from your device?\nIt will still be accessible from Trello.`))
                        return;
                } else {
                    if (!confirm(`Do you wish to remove ${list["name"]} and all it's contents?`))
                        return;
                }

                if (data_lists["list"] && data_lists["list"][list["name"]]) {
                    delete data_lists["list"][list["name"]];
                }
                if (data_lists["sel"] == list["name"]) {
                    data_lists["sel"] = data_lists["list"][0];
                }
                chrome.storage.local.set({"TodoLists": data_lists}, function() {
                    new_el.remove();
                    location.reload();
                });
            });
            new_el.appendChild(del_el);
            lists_selection_wrapper.appendChild(new_el);
        });

        Array.from(lists_selection_wrapper.getElementsByTagName("li"))
            .sort((a, b) => b.getAttribute("data-mdate").localeCompare(a.getAttribute("data-mdate")))
            .forEach(li => lists_selection_wrapper.appendChild(li));

        list_render_local();
    });
}

function load_trelloData() {
    chrome.storage.local.get("TrelloData", function(data) {
        trello_data = data["TrelloData"] || null;
        load_lists_data();
    });
  }

document.getElementById("s_list_btn").addEventListener("click", function() {
    document.getElementById("tab_table").style.display = "none";
    document.getElementById("tab_sidebar").style.display = "block";
});

document.getElementById("s_add_btn").addEventListener("click", function() {
    if (boardData && boardData != null && boardData != {}) {

    } else {

    }
    document.getElementById("tab_table").style.display = "none";
    document.getElementById("tab_sidebar").style.display = "none";
    document.getElementById("tab_create_new").style.display = "block";
});

document.getElementById("s_add_btn2").addEventListener("click", function() {
    document.getElementById("tab_table").style.display = "none";
    document.getElementById("tab_sidebar").style.display = "none";
    document.getElementById("tab_create_new").style.display = "block";
});

document.getElementById("btn_change-list_return").addEventListener("click", function() {
    document.getElementById("tab_table").style.display = "block";
    document.getElementById("tab_sidebar").style.display = "none";
});

document.getElementById("btn_change-list_trello").addEventListener("click", function() {
    document.getElementById("tab_sidebar").style.display = "none";
    trello_list_change_boards();
    document.getElementById("tab_importFromTrello").style.display = "block";
});

document.getElementById("btn_change-trello_return").addEventListener("click", function() {
    document.getElementById("tab_sidebar").style.display = "block";
    document.getElementById("tab_importFromTrello").style.display = "none";
});

function import_trello_list(element) {
    const new_tr = document.createElement("tr");
    new_tr.addEventListener("click", function() {
        document.getElementById("tab_importFromTrello").style.display = "none";

        if (!element.name || element.name == null || element.name == "")
            return;
    
        if (data_lists["list"] && data_lists["list"][element.name]) {
            alert("A list with this name already exists!\nTry changing the list name in Trello.");
            return;
        }
    
        data_lists["sel"] = element.name;

        data_lists["list"][element.name] = {
            "name": element.name,
            "ctime": Date.now(),
            "ltime": Date.now(),
            "is_fav": 0,
            "trello_id": element.id,
            "trello_board_id": element.idBoard,
        };
    
        chrome.storage.local.set({"TodoLists": data_lists});
        location.reload();
    });
    new_tr.innerHTML = `<td>🗂️ ${element.name}</td><td style="text-align:right;"><a style="color:#222;" href="${element.shortUrl}"><span style="font-size:14px;" class="material-icons-outlined">open_in_new</span></a></td>`;
    document.getElementById("trello_change_content_wrapper").appendChild(new_tr);
}

async function trello_list_change_lists(board_id) {
    document.getElementById("trello_change_content_wrapper").innerHTML = "";

    const req = await fetch(`https://api.trello.com/1/boards/${board_id}/lists?key=${trello_data.apiKey}&token=${trello_data.token}`)
    const res = await req.json();

    const new_tr = document.createElement("tr");
    new_tr.innerHTML = `<td>⬅️ | Select a list to link</td>`;
    new_tr.style.border = "1px solid #555";
    new_tr.addEventListener("click", function() {
        trello_list_change_boards();
    });
    document.getElementById("trello_change_content_wrapper").appendChild(new_tr);

    res.forEach(element => {
        import_trello_list(element);
    });

    document.getElementById("trello_change_content_wrapper").parentNode.style.display = "block";
}

async function trello_import_list_validate(list_id) {
    try {
        document.getElementById("trello_change_content_wrapper").innerHTML = "";
        const req = await fetch(`https://api.trello.com/1/lists/${list_id}?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            if (req.status == 401)
                alert(`401 Invalid credentials\nEither the API Key or/and Token is/are invalid.`);
            else if (req.status == 400)
                alert(`Error: Provided Trello List ID is invalid!`);
            else
                alert(`HTTP error: ${req.status}`);
            location.reload();
            throw new Error(`HTTP error: ${req.status}`);
        }
        const res = await req.json();
        import_trello_list(res);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

document.getElementById("trello_change_content_wrapper_input").addEventListener('keyup', function (e) {
    if (e.key === 'Enter' && document.getElementById("trello_change_content_wrapper_input").value.length > 5) {
        const list_id = document.getElementById("trello_change_content_wrapper_input").value;
        trello_import_list_validate(list_id);
    }
});

async function trello_list_change_boards() {
    document.getElementById("trello_change_content_wrapper").innerHTML = "";

    try {
        const req = await fetch(`https://api.trello.com/1/members/me/boards?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            if (req.status == 401)
                alert(`401 Invalid credentials\nEither the API Key or/and Token is/are invalid.`);
            else
                alert(`HTTP error: ${req.status}`);
            document.getElementById("modal_show_trello_list").style.display = "none";
            throw new Error(`HTTP error: ${req.status}`);
        }
        const res = await req.json();
        document.getElementById("trello_change_content_wrapper").innerHTML = "";

        res.forEach(element => {
            const new_tr = document.createElement("tr");
            new_tr.addEventListener("click", function() {
                trello_list_change_lists(element.id);
            });
            new_tr.innerHTML = `<td>🗃️ ${element.name}</td><td style="text-align:right;"><a style="color:#222;" href="${element.shortUrl}"><span style="font-size:14px;" class="material-icons-outlined">open_in_new</span></a></td>`;
            document.getElementById("trello_change_content_wrapper").appendChild(new_tr);
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

document.getElementById("btn_change-list_new").addEventListener("click", function() {
    let list_name = prompt('Give a name to your new list');

    if (!list_name || list_name == null || list_name == "")
        return;

    if (data_lists["list"] && data_lists["list"][list_name]) {
        alert("A list with this name already exists!");
        return;
    }

    data_lists["sel"] = list_name;

    data_lists["list"][list_name] = {
        "name": list_name,
        "ctime": Date.now(),
        "ltime": Date.now(),
        "is_fav": 0,
        "cards": []
    };

    chrome.storage.local.set({"TodoLists": data_lists});

    document.getElementById("tab_table").style.display = "none";
    location.reload();
});

const in_filter_lists = document.getElementById("in_filter_lists");
document.getElementById("in_filter_lists").addEventListener("keyup", () => {
    var val = in_filter_lists.value.toUpperCase();
    var is_label = false;

    if (val && val.charAt(0) == '#') {
        is_label = true;
        val = val.substring(1);
    }

    var tr, td, txtValue;

    tr = list_table_todos.getElementsByTagName("tr");
    for (let i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (is_label == false && txtValue.toUpperCase().indexOf(val) > -1) {
                tr[i].style.display = "";
            } else if (is_label == true && tr[i] && tr[i].getAttribute("data-labels")) {
                const data_labels = tr[i].getAttribute("data-labels").toUpperCase().split(",");
                if (data_labels.includes(val)) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
});

document.getElementById("tb_calprojects_btn").addEventListener("click", () => {
    window.location = "calendar.html";
});

document.getElementById("tb_allprojects_btn").addEventListener("click", () => {
    window.location = "all_events.html";
});

document.getElementById("tb_intra_btn").addEventListener("click", () => {
    window.open("https://intra.epitech.eu/", '_blank');
});

chrome.storage.local.get("showCompleted", function(data) {
    filter_show_completed = data["showCompleted"] || false;
    load_trelloData();
});
