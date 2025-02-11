var listRendering = null;
var is_style_added = false;

function render_list_destroy() {
    if (listRendering) {
        listRendering.remove();
        listRendering = null;
    }
}

function render_list_btn(el_name, callback, origin) {
    const new_btn = document.createElement("div");
    new_btn.classList.add("list_item");
    new_btn.innerHTML = `${el_name}`;
    new_btn.title = `Add this project to ${el_name} (My Projects)`;
    new_btn.addEventListener("click", function () {
        callback(el_name, origin);
    })
    return new_btn;
}

function render_list_div(btn, callback, origin) {
    if (listRendering) {
        render_list_destroy();
        return;
    }

    const pos = btn.getBoundingClientRect();
    const pos_left = pos.left + window.scrollX;
    const pos_top = pos.top + window.scrollY;

    listRendering = document.createElement("div");
    listRendering.style = `z-index:100;background-color:#272727;border:1px solid #151515;border-radius:0.5em;padding:6px;position:absolute;box-shadow: 1px 1px 8px #323232;max-height:200px;overflow-y: auto;`;
    listRendering.style.top = (pos_top + 45) + "px";
    listRendering.style.left = pos_left + "px";

    chrome.runtime.sendMessage({
        action: 'request_lists'
    },
        (res) => {
            listRendering.innerHTML = "";
            listRendering.id = "epiTheme_render_lists";
            const json_array = Object.values(res["list"]);

            if (is_style_added == false) {
                is_style_added = true;

                var style = document.createElement('style');
                style.innerHTML = "#epiTheme_render_lists > .list_item {display:block;padding:6px 14px;cursor:pointer;color:white;} #epiTheme_render_lists > .list_item:hover {background-color: #353535;} #epiTheme_render_lists > .list_item:first-child {border-bottom: 1px solid #111;}";
                document.getElementsByTagName('head')[0].appendChild(style);
            }

            if (res["list"][res["sel"]]) {
                listRendering.appendChild(render_list_btn(res["list"][res["sel"]]["name"], callback, origin));
            }

            for (let i = 0; i < json_array.length; i++) {
                if (json_array[i]["name"] == res["list"][res["sel"]]["name"]) {
                    continue;
                }
                listRendering.appendChild(render_list_btn(json_array[i]["name"], callback, origin));
            }

            document.body.append(listRendering);
        });
}

function add_to_calendar(listName, origin) {
    render_list_destroy();

    const article = origin;
    const title = article.querySelector('h3').textContent;
    const endDate = article.querySelectorAll('span')[6].textContent;
    const link = article.querySelector('h3 a').href;
    chrome.runtime.sendMessage({
        action: 'addEventToCalendar',
        title: title,
        link: link,
        list: listName,
        endDate: endDate
    },
        (response) => {
            if (response == true) {
                const newchild = document.createElement("div");
                newchild.style = "line-height:18px;border-radius: 3px;z-index: 100000;position:fixed;top:10px;right:10px;background-color:#222;color:#f1f1f1;border:1px solid #111;padding: 8px 6px;";
                newchild.innerHTML = "<span style='display:inline-block;margin-right:5px;font-size:16px;'>✨</span><span style='display:inline-block;'>Added <b>" + title + "</b> to <b>My Projects</b></span>";
                document.body.appendChild(newchild);
                setTimeout(function () { newchild.remove(); }, 5000);
            }
        });
}

function add_to_calendar2(listName) {
    render_list_destroy();

    const title = document.querySelector('#project .bloc.top .data .item.title h1').textContent;
    const endDate = document.querySelector('.date_end.bulle').textContent;
    const link = window.location.href;

    chrome.runtime.sendMessage({
        action: 'addEventToCalendar',
        title: title,
        link: link,
        list: listName,
        endDate: endDate
    },
        (response) => {
            if (response == true) {
                const newchild = document.createElement("div");
                newchild.style = "line-height:18px;border-radius: 3px;z-index: 100000;position:fixed;top:10px;right:10px;background-color:#222;color:#f1f1f1;border:1px solid #111;padding: 8px 6px;";
                newchild.innerHTML = "<span style='display:inline-block;margin-right:5px;font-size:16px;'>✨</span><span style='display:inline-block;'>Added <b>" + title + "</b> to <b>My Projects</b></span>";
                document.body.appendChild(newchild);
                setTimeout(function () { newchild.remove(); }, 5000);
            }
        });
}

const projButtonsContainer = document.querySelector('#project .bloc.top .data .buttons');

if (projButtonsContainer) {
    const button = document.createElement('div');
    button.classList.add('btn_add2');
    button.title = "Add this project to an EpiTheme Todo";
    button.textContent = "";
    button.addEventListener('click', function () {
        render_list_div(button, add_to_calendar2);
    });
    projButtonsContainer.appendChild(button);
}

const articles = document.querySelectorAll('.projet .articles article');
articles.forEach(article => {
    const button = document.createElement('button');
    article.style.position = "relative";
    button.textContent = '';
    button.classList.add('btn_add');
    button.title = "Add this project to an EpiTheme Todo";
    button.addEventListener('click', function (event) {
        render_list_div(button, add_to_calendar, article);
    });
    article.appendChild(button);
});

const spanElement2 = document.querySelector('.item.message.pedagogic span');
if (spanElement2) {
    if (spanElement2.textContent == "Unit in progress")
        spanElement2.innerHTML = "<span class='traffic_orange'></span><span style='margin-left:18px;'>" + spanElement2.textContent + "</span>";
    if (spanElement2.textContent == "Unit acquired with grade Acquis.")
        spanElement2.innerHTML = "<span class='traffic_green'></span><span style='margin-left:18px;'>Unit passed</span>";
    if (spanElement2.textContent.includes("Unit acquired with grade "))
        spanElement2.innerHTML = "<span class='traffic_green'></span><span style='margin-left:18px;'>Grade <b>" + spanElement2.textContent.replace('Unit acquired with grade ', '') + "</b></span>";
}

const spanElement = document.querySelector('div.nbcredits span');
if (spanElement) {
    var originalText = spanElement.textContent;
    originalText = originalText.replace('(', '');
    originalText = originalText.replace(' credit(s)s)', '');
    originalText = originalText.replace(' credit(s))', '');
    if (Number(originalText) == 0)
        spanElement.textContent = "No credits";
    else if (Number(originalText) == 1)
        spanElement.textContent = originalText + "credit";
    else if (Number(originalText) > 1)
        spanElement.textContent = originalText + " credits";
}

function changeLanguage(ev) {
    document.cookie = 'language=' + this.value;
}

let end_date, start_date;
let show_all_sems = false;

async function get_current_week() {
    let show_days = 14;

    const getStoredDays = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get("event_showNextDays", function (data) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                let storedData = data["event_showNextDays"] || null;
                resolve(storedData);
            });
        });
    };

    try {
        let storedData = await getStoredDays();
        if (storedData && storedData["days"])
            show_days = storedData["days"];
        if (storedData && storedData["show_all"])
            show_all_sems = storedData["show_all"];
    } catch (error) {
        console.error("Error retrieving stored days:", error);
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    start_date = currentYear + "-" + currentMonth + "-" + currentDay;

    const oneWeekAhead = new Date(currentDate);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + Number(show_days));
    const weekAheadYear = oneWeekAhead.getFullYear();
    const weekAheadMonth = oneWeekAhead.getMonth() + 1;
    const weekAheadDay = oneWeekAhead.getDate();
    end_date = weekAheadYear + "-" + weekAheadMonth + "-" + weekAheadDay;
    if (document.getElementById("epiTheme_select_days"))
        document.getElementById("epiTheme_select_days").value = show_days;
}

async function getSemesterNumber() {
    const url_user_url = "https://intra.epitech.eu/user/?format=json";
    try {
        const response = await fetch(url_user_url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let json = await response.json();
        return json["semester"];
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function fetch_schedule() {
    await get_current_week();

    let min_sem = 0;
    let max_sem = 2;
    max_sem = await getSemesterNumber();
    min_sem = max_sem;
    const url_sched_url = "https://intra.epitech.eu/planning/load?format=json&start=" + start_date + "&end=" + end_date;
    try {
        const response = await fetch(url_sched_url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let json = await response.json();
        let json_data = [];

        for (let i = 0; i < json.length; i++) {
            if (show_all_sems || json[i]["semester"] == 0 || (json[i]["semester"] >= min_sem && json[i]["semester"] <= max_sem)) {
                json_data.push(json[i]);
            }
        }
        return json_data;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function get_allData() {
    const url = "https://intra.epitech.eu/?format=json";
    const schedule_data = await fetch_schedule();
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const data_ret = {
                "projects": data["board"]["projets"],
                "schedule": schedule_data
            };
            return data_ret;
        })
        .catch(error => {
            console.log("Core Error:", error);
        });
}

function create_style_class() {
    const style = document.createElement('style');
    style.innerHTML = `
    .selected_item {
        background: #2d366e57;
    }
    .epiTheme_modal {
        position: fixed;
        z-index: 99999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgb(0,0,0);
        background-color: rgba(0,0,0,0.4);
    }
    #epiTheme_searchWrapper > .epiTheme_modal_cont > div > div {
        display: flex;
        gap: 10px;
        padding: 8px 0px;
        color: #aaa;
        font-weight: 600;
        border-bottom: 2px solid #282828;
    }
    #epiTheme_searchWrapper > .epiTheme_modal_cont > div > div > svg {
        fill: #aaa;
        align-items: center;
        width: 16px;
    }
    #epiTheme_searchWrapper > .epiTheme_modal_cont > div > a {
        padding: 6px 12px;
        display: flex;
        text-decoration: none;
        cursor: pointer;
        border-bottom: 1px dashed #252525;
    }

    #epiTheme_searchWrapper > .epiTheme_modal_cont > div > a > span {
        color: #999;
    }

    #epiTheme_searchWrapper > .epiTheme_modal_cont > div > a:hover {
        background: #252525;
    }
    `;
    document.head.appendChild(style);
}
create_style_class();

const keyword = '/';

function cool_date(uncool_date) {
    const d = new Date(uncool_date);
    const currentDate = new Date();

    const timeDifference = d.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    let text = "today";
    if (daysDifference > 0)
        text = `in ${daysDifference} days`;
    else if (daysDifference < 0)
        text = `${Math.abs(daysDifference)} days ago`;
    return d.toLocaleDateString('en-uk', { weekday: "short", year: "numeric", month: "short", day: "numeric" }) + ` (${text})`;
}

function get_itemTitle(item) {
    let mod_reg = item["module_registered"] ? 'Registered to Module' : 'NOT Registered to Module';
    return `Module: ${item["titlemodule"]} (${mod_reg})
    Semester: S${item["semester"]} (${item["scolaryear"]})
    Event Starts: ${cool_date(item["start"])}
    Event Ends: ${cool_date(item["end"])}
    Registration Starts: ${cool_date(item["allowed_planning_start"])}
    Registration Ends: ${cool_date(item["allowed_planning_end"])}`;
}

async function toggleSearch(restart) {
    if (document.getElementById("epiTheme_searchWrapper")) {
        document.getElementById("epiTheme_searchWrapper").remove();
        if (restart)
            toggleSearch();
    } else {
        const newBackground = document.createElement("div");
        const newWrapper = document.createElement("div");
        const newInputWrapper = document.createElement("div");
        const newInput = document.createElement("input");

        let selected_item;
        let selected_index = 0;

        newBackground.classList.add("epiTheme_modal");
        newWrapper.classList.add("epiTheme_modal_cont");
        newBackground.id = "epiTheme_searchWrapper";
        newInputWrapper.style = "display:flex;gap:10px;";

        const new_regBtn = document.createElement("span");
        new_regBtn.style = "outline:none;background:none;border:none;display:flex;cursor:pointer;align-items:center;";

        const new_inputBtn = document.createElement("select");
        new_inputBtn.style = "outline: none; background: none; color: #ccc; border: none;";
        new_inputBtn.id = "epiTheme_select_days";
        new_inputBtn.innerHTML = `
            <option style='background: #222;' value="7">7 days</option>
            <option style='background: #222;' value="14">14 days</option>
            <option style='background: #222;' value="31">1 month</option>
            <option style='background: #222;' value="62">2 months</option>
            <option style='background: #222;' value="93">3 month</option>
            <option style='background: #222;' value="186">6 month</option>
            <option style='background: #222;' value="365">1 year</option>
        `;

        newWrapper.style = "width: 95%; max-width: 650px; position: absolute; left: 50%; top: 20%; transform: translate(-50%, 0); background: #222; border: 2px solid #111; padding: 6px 12px; border-radius: 6px;"
        newInput.autocomplete = "off";
        newInput.placeholder = "Search..";
        newInput.id = "epiTheme_in_searchBar";
        newInput.style = "font-size: 16px; color: #f1f1f1;flex-grow: 1; padding: 12px 16px; border: none; background: none; outline: none;";

        newInputWrapper.appendChild(newInput);
        newInputWrapper.appendChild(new_regBtn);
        newInputWrapper.appendChild(new_inputBtn);
        newWrapper.appendChild(newInputWrapper);
        newBackground.appendChild(newWrapper);
        document.body.appendChild(newBackground);

        const new_dataWrapper = document.createElement("div");
        new_dataWrapper.innerHTML = `<br><center><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#ccc" stroke-dasharray="16" stroke-dashoffset="16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg></center><br>`;
        newWrapper.appendChild(new_dataWrapper);

        setTimeout(function () {
            newInput.focus();
            newInput.value = "";
        }, 10);

        const data = await get_allData();

        new_dataWrapper.style = "display: flex; flex-direction: column;max-height: 50vh; overflow-y: auto;";
        new_dataWrapper.innerHTML = `<div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m297-581 149-243q6-10 15-14.5t19-4.5q10 0 19 4.5t15 14.5l149 243q6 10 6 21t-5 20q-5 9-14 14.5t-21 5.5H331q-12 0-21-5.5T296-540q-5-9-5-20t6-21ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-60v-240q0-17 11.5-28.5T160-420h240q17 0 28.5 11.5T440-380v240q0 17-11.5 28.5T400-100H160q-17 0-28.5-11.5T120-140Zm580-20q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z"/></svg>
        <span>Projects</span></div>`;

        for (let i = 0; i <= data["projects"].length; i++) {
            const item = data["projects"][i];
            if (!item)
                continue;
            new_dataWrapper.innerHTML += `<a data-title="${item["title"]}" href="${item["title_link"]}/project" data-module="Project">${item["title"]}</a>`;
        }

        new_dataWrapper.innerHTML += `<div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>
        <span>Events</span>
        </div>`;

        for (let i = 0; i <= data["schedule"].length; i++) {
            const item = data["schedule"][i];
            if (!item)
                continue;
            try {
                let date_convert = new Date(item["start"]).toLocaleDateString('en-uk', { weekday: "short", year: "numeric", month: "short", day: "numeric" });
                let is_registered = "";
                if (item["event_registered"] && item["module_registered"])
                    is_registered = "<span title='Registred' style='color: #2c9f20;'>⬢&nbsp;&nbsp;</span>";
                else if (item["event_registered"])
                    is_registered = "<span title='Registred to the event, but not to the module' style='color: #9f2020;'>❕⬢&nbsp;&nbsp;</span>";
                new_dataWrapper.innerHTML += `<a title='${get_itemTitle(item)}' href="https://intra.epitech.eu/module/${item["scolaryear"]}/${item["codemodule"]}/${item["codeinstance"]}/${item["codeacti"]}" data-module="${item["codemodule"]}" data-title="${item["acti_title"]}">${is_registered}${item["acti_title"]} <span style='margin-left: auto;'>${item["codemodule"]} · ${date_convert}</span></a>`;
            } catch (error) {
                console.error("Error processing item:", error, item);
            }
        }

        const els = newWrapper.querySelectorAll("a[data-title]");

        if (show_all_sems) {
            new_regBtn.title = `Show all semesters`;
            new_regBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="18px" fill="#ccc"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm360-80h100v-480H520v480Zm-180 0h100v-480H340v480Zm-180 0h100v-480H160v480Zm540 0h100v-480H700v480Z"/></svg>`;
        } else {
            new_regBtn.title = `My semester only`;
            new_regBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="18px" fill="#ccc"><path d="M200-280q-33 0-56.5-23.5T120-360v-240q0-33 23.5-56.5T200-680h560q33 0 56.5 23.5T840-600v240q0 33-23.5 56.5T760-280H200Zm0-80h560v-240H200v240Zm-41-400q-17 0-28-11.5T120-800q0-17 11.5-28.5T160-840h641q17 0 28 11.5t11 28.5q0 17-11.5 28.5T800-760H159Zm0 640q-17 0-28-11.5T120-160q0-17 11.5-28.5T160-200h641q17 0 28 11.5t11 28.5q0 17-11.5 28.5T800-120H159Zm41-480v240-240Z"/></svg>`;
        }

        new_regBtn.addEventListener("click", async function () {
            show_all_sems = !show_all_sems;
            await chrome.storage.local.set({ "event_showNextDays": { "days": new_inputBtn.value, "show_all": show_all_sems } });
            toggleSearch(true);
        });

        new_inputBtn.addEventListener("change", async function () {
            const newData = new_inputBtn.value;
            await chrome.storage.local.set({ "event_showNextDays": { "days": newData, "show_all": show_all_sems } });
            toggleSearch(true);
        });

        window.onclick = function (event) {
            if (event.target == newBackground) {
                newBackground.remove();
            }
        }

        function filter_items_inSearch() {
            const new_val = newInput.value.toUpperCase();

            for (let i = 0; i < els.length; i++) {
                if (new_val.length == 0 || els[i].getAttribute("data-module").toUpperCase().indexOf(new_val) > -1 || els[i].getAttribute("data-title").toUpperCase().indexOf(new_val) > -1) {
                    els[i].style.display = "";
                } else {
                    els[i].style.display = "none";
                }
            }
        }

        select_newItem(0);
        function reset_active_item() {
            const all_sel_class = newWrapper.querySelectorAll(".selected_item");
            for (let i = 0; i < all_sel_class.length; i++) {
                all_sel_class[i].classList.remove("selected_item");
            }
            if (selected_item) {
                selected_item.classList.add("selected_item");
                selected_item.scrollIntoView({ block: "center" });
            }
        }

        function select_newItem(index) {
            let visible_els = [];
            for (let i = 0; i < els.length; i++) {
                if (els[i].style.display != 'none')
                    visible_els.push(els[i]);
            }
            if (index < 0)
                index = visible_els.length;
            if (visible_els.length < index)
                index = 0;
            selected_item = visible_els[index];
            selected_index = index;
            reset_active_item();
        }

        document.addEventListener("keyup", function (e) {
            if (e.key === 'Enter')
                if (selected_item && selected_item.href)
                    window.location = selected_item.href;
            if (e.key === 'ArrowDown')
                select_newItem(selected_index + 1);
            if (e.key === 'ArrowUp')
                select_newItem(selected_index - 1);
        });

        let old_value = newInput.value;
        newInput.addEventListener("keyup", function () {
            if (old_value == newInput.value)
                return;
            filter_items_inSearch();
            select_newItem(0);
        });

        if (newInput.value.length != 0) {
            filter_items_inSearch();
        }
    }
}

document.addEventListener("keypress", async function (e) {
    const activeElement = document.activeElement.toUpperCase();
    if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && activeElement.contentEditable !== 'true'
        && e.key === keyword) {
        toggleSearch();
    }
});

if (document.getElementById("notification")) {
    document.getElementById("notification").style.position = "relative";
    const new_el = document.createElement("div");
    new_el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#CCCCCC"><path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>`;
    new_el.title = `Search event.. (Press ${keyword})`;
    new_el.addEventListener("click", function () {
        toggleSearch();
    });
    new_el.id = "epiTheme_searchBtn";
    new_el.style = "gap: 10px;display: flex; position: absolute;top: 50%; left: 0;transform: translate(-100%, -50%);cursor: pointer;"
    document.getElementById("notification").appendChild(new_el);
}

let url_params = new URLSearchParams(document.location.search);
if (url_params.has("et_pref")) {
    const div = document.createElement("div");
    div.classList.add("et_modalBackground");
    div.innerHTML = "<div class='et_modalContent'><h3>Language</h3><div class='et_sett_cont'><select style='display:block;width:100%;' id='et_changeLang'><option value='en'>English</option><option value='fr'>French</option></select></div></div>";
    document.body.appendChild(div);

    document.getElementById("et_changeLang").addEventListener("change", function (ev) {
        document.cookie = "language=" + ev.target.value + ";Expire=100;path=/";
        console.log("Language changed", ev.target.value);
    });

    document.getElementById("et_changeLang").value = document.cookie
        .split("; ")
        .find((row) => row.startsWith("language="))
        ?.split("=")[1];
}