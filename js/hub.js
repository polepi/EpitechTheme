import * as core from './core.js';

var user_data_cache = null;

var limit_max_Workshop = 10;
var limit_max_Hackathon = 0;
var limit_max_Talk = 15;
var limit_max_Project = 0;
var limit_max_Experience = 8;
var max_cred = 8;
const hubTable = document.getElementById("table_hub_recipt");

const hub_data = {
    "G0 - User Groups": {
        "expHour": 1,
        "expHost": 3,
        "expCredit": 10,
        "max_credits": {
            "1": 4,
            "2": 6,
            "3": 4,
            "4": 4,
        },
    },
    "G0 - Talks & Conferences": {
        "expHour": 1,
        "expHost": 2,
        "expCredit": 10,
        "max_credits": {
            "1": 1,
            "2": 2,
            "3": 1,
            "4": 1,
        },
    },
    "G0 - Hackathon": {
        "max_credits": {
            "1": 2,
            "2": 3,
            "3": 3,
            "4": 4,
        },
    },
    "G0 - Free Projects": {
        "max_credits": {
            "1": 4,
            "2": 6,
            "3": 4,
            "4": 4,
        },
    },
}

async function fetch_hubAPI(user_data) {
    let ret_data = [];
    const fetch_data = [
        `https://intra.epitech.eu/module/${user_data["UserYear"]}/G-INN-001/BAR-0-1/?format=json`,
        `https://intra.epitech.eu/module/${user_data["UserYear"]}/G-INN-030/BAR-0-1/?format=json`,
        `https://intra.epitech.eu/module/${user_data["UserYear"]}/G-INN-010/BAR-0-1/?format=json`,
        `https://intra.epitech.eu/module/${user_data["UserYear"]}/G-INN-020/BAR-0-1/?format=json`,
    ];

    for (let i = 0; i < fetch_data.length; i++) {
        await fetch(fetch_data[i])
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                ret_data[data["title"]] = data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    getExpectedEXP(ret_data);
}

function getExpFromItem(act, url, activityBased) {
    const event = act["events"][0];
    const new_tr_element = document.createElement('tr');
    let hours_toAdd = 0;
    if (event.user_status == "present") {
        hours_toAdd = Math.abs(new Date(event["end"]) - new Date(event["begin"])) / 36e5;
        if (activityBased)
            hours_toAdd = 1;
        new_tr_element.innerHTML = `<td><a href="${url}">${act.title}</a></td><td>Present</td><td style='padding-right:10px;'>${hours_toAdd}</td>`;
    }
    event["assistants"].forEach(as => {
        if (user_data_cache["UserId"] == as["login"]) {
            hours_toAdd = (Math.abs(new Date(event["end"]) - new Date(event["begin"])) / 36e5) * hub_data[act["module_title"]]["expHost"];
            if (activityBased)
                hours_toAdd = 2;
            new_tr_element.innerHTML = `<td><a href="${url}">${act.title}</a></td><td>Host</td><td style='padding-right:10px;'>${hours_toAdd}</td>`;
        }
    });
    hubTable.appendChild(new_tr_element);
    return hours_toAdd;
}

function addTableSeparator(name) {
    const new_tr_element = document.createElement('tr');
    new_tr_element.style = `background-color: #f1f1f1 !important;`;
    new_tr_element.innerHTML = `<td><b>${name}</b></td><td colspan="3" style="padding: 2px 2px;" data-cell='${name}_rowValue'></td>`;
    hubTable.appendChild(new_tr_element);
}

function display_expected_credits(cred) {
    cred = Math.trunc(cred / 10);
    if (user_data_cache.UserCourse == 1)
        max_cred = 5;
    if (max_cred < cred)
        cred = max_cred;
    document.getElementById("sub_hub_cred").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 16px;'>auto_awesome</span><b>" + cred + "</b>/" + max_cred;
}

function getExpectedEXP(hub) {
    console.log("init data=>", hub)
    let total_credits = 0;
    const baseURL = `https://intra.epitech.eu/module/${user_data_cache["UserYear"]}/`;

    ["G0 - User Groups", "G0 - Talks & Conferences"].forEach(mod => {
        let tempHours = 0;
        addTableSeparator(mod);
        hub[mod].activites.forEach(act => {
            if (act.events && act.events[0]) {
                tempHours += getExpFromItem(act, `${baseURL}${hub[mod]["codemodule"]}/${hub[mod]["codeinstance"]}/${act["codeacti"]}`);
            }
        });
        const infoRow = hubTable.querySelector(`[data-cell="${mod}_rowValue"]`);
        total_credits += Math.trunc(tempHours / 10);
        if (infoRow) {
            infoRow.innerHTML = `<span class='title-badge'><span class='inner-badge'><span class='material-icons-outlined' style='font-size: 16px;'>timer</span> ${tempHours}</span><span class='inner-badge'><span class='material-icons-outlined' style='font-size: 16px;'>auto_awesome</span> ${Math.trunc(tempHours / 10)} / ${hub_data[mod]["max_credits"][user_data_cache["UserCourse"]]}</span></span>`;
        }
    });

    /* Hackathon */

    let tempHours = 0;
    let mod = "G0 - Hackathon";
    addTableSeparator(mod);
    hub[mod].activites.forEach(act => {
        if (act.events && act.events[0]) {
            tempHours += getExpFromItem(act, `${baseURL}${hub[mod]["codemodule"]}/${hub[mod]["codeinstance"]}/${act["codeacti"]}`, true);
        }
    });
    const infoRow = hubTable.querySelector(`[data-cell="${mod}_rowValue"]`);
    total_credits += Math.trunc(tempHours / 2);
    if (infoRow) {
        infoRow.innerHTML = `<span class='title-badge'><span class='inner-badge'><span class='material-icons-outlined' style='font-size: 16px;'>auto_awesome</span> ${Math.trunc(tempHours / 2)} / ${hub_data[mod]["max_credits"][user_data_cache["UserCourse"]]}</span></span>`;
    }

    document.getElementById("sub_hub_cred").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 16px;'>auto_awesome</span><b>" + total_credits + "</b>";
    document.getElementById("sub_hub_exp").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 16px;'>timer</span><b>" + tempHours + "</b>";

    /* var expected_exp = 0;
    limit_max_Workshop = 10;
    limit_max_Hackathon = 0;
    limit_max_Talk = 15;
    limit_max_Project = 0;
    limit_max_Experience = 8;
    var max_exp_points = 80;

    if (user_data_cache.UserCourse == 1)
        max_exp_points = 50;

    document.getElementById("filterBtn_hubWork").innerHTML = limit_max_Workshop;
    document.getElementById("filterBtn_hubTalk").innerHTML = limit_max_Talk;
    document.getElementById("filterBtn_hubHack").innerHTML = limit_max_Hackathon;
    document.getElementById("filterBtn_hubExp").innerHTML = limit_max_Experience;


    hub.activites.forEach(act => {
        if (act.events && act.events[0]) {
            getExpFromItem(act);
        }
    });

    document.getElementById("filterBtn_hubWork").innerHTML = (document.getElementById("filterBtn_hubWork").innerHTML - limit_max_Workshop) + "/" + document.getElementById("filterBtn_hubWork").innerHTML;
    document.getElementById("filterBtn_hubTalk").innerHTML = (document.getElementById("filterBtn_hubTalk").innerHTML - limit_max_Talk) + "/" + document.getElementById("filterBtn_hubTalk").innerHTML;
    document.getElementById("filterBtn_hubHack").innerHTML = limit_max_Hackathon;
    document.getElementById("filterBtn_hubExp").innerHTML = (document.getElementById("filterBtn_hubExp").innerHTML - limit_max_Experience) + "/" + document.getElementById("filterBtn_hubExp").innerHTML;

    document.getElementById("sub_hub_exp").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 16px;'>local_fire_department</span><b>" + expected_exp + "</b> / " + max_exp_points;
    display_expected_credits(expected_exp); */
    document.getElementById("is_hub_loading").style.display = "none";
}

core.userData_get().then(data => {
    user_data_cache = data;
    fetch_hubAPI(data);
});

/* 
Tek1
User gr : 4
Talks : 1
Hack : 2
Free : 4
Tek 2 
User gr : 6
Talks : 2
hack : 3
Free : 6
Tek 3 
User gr : 4
talks : 1
hack : 3
Free : 4
Tek4 :
User gr : 4
talks : 1
hack : 4
Free : 4
*/