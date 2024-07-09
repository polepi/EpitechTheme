import * as core from './core.js';

var user_data_cache = null;

var limit_max_Workshop = 10;
var limit_max_Hackathon = 0;
var limit_max_Talk = 15;
var limit_max_Project = 0;
var limit_max_Experience = 8;
var max_cred = 8;
const hubTable = document.getElementById("table_hub_recipt")

function fetch_hubAPI() {
    const url_hub_json = "https://intra.epitech.eu/module/2023/B-INN-000/BAR-0-1/?format=json";
    fetch(url_hub_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        getExpectedEXP(data);
    })
    .catch(error => {
        console.log(error);
    });
}

function getExpFromItem(hub) {
    var exp = 0;

    if (hub.type_title == "Workshop" && limit_max_Workshop > 0) {
        exp += 2;
        limit_max_Workshop -= 1;
        const new_tr_element = document.createElement('tr');
        new_tr_element.innerHTML = "<td>"+hub.title+"</td><td>Present</td><td>Workshop</td><td style='padding-right:10px;'>"+exp+"</td>";
        hubTable.appendChild(new_tr_element);
    }
    if (hub.type_title == "Hackathon") {
        exp += 6;
        limit_max_Hackathon += 1;
        const new_tr_element = document.createElement('tr');
        new_tr_element.innerHTML = "<td>"+hub.title+"</td><td>Present</td><td>Hackathon</td><td style='padding-right:10px;'>"+exp+"</td>";
        hubTable.appendChild(new_tr_element);
    }
    if (hub.type_title == "Talk" && limit_max_Talk > 0) {
        exp += 1;
        limit_max_Talk -= 1;
        const new_tr_element = document.createElement('tr');
        new_tr_element.innerHTML = "<td>"+hub.title+"</td><td>Present</td><td>Talk</td><td style='padding-right:10px;'>"+exp+"</td>";
        hubTable.appendChild(new_tr_element);
    }
    if (hub.type_title == "Project") {
        const timeDifference = new Date(hub.end) - new Date(hub.start);
        const days = timeDifference / (1000 * 60 * 60 * 24);
        exp += (days * 2);
        const new_tr_element = document.createElement('tr');
        new_tr_element.innerHTML = "<td>"+hub.title+"</td><td>Present</td><td>Project</td><td style='padding-right:10px;'>"+exp+"</td>";
        hubTable.appendChild(new_tr_element);
    }
    return exp;
}

function display_expected_credits(cred) {
    cred = Math.trunc(cred / 10);
    if (user_data_cache.UserCourse == 1)
        max_cred = 5;
    if (max_cred < cred)
        cred = max_cred;
    document.getElementById("sub_hub_cred").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 16px;'>auto_awesome</span><b>"+ cred +"</b>/"+max_cred;
}

function getExpectedEXP(hub) {
    var expected_exp = 0;
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
        if (act.events && act.events[0] && act.events[0].user_status) {
            if (act.events[0].user_status == "present") {
                expected_exp += getExpFromItem(act);
            }
        }
    });

    document.getElementById("filterBtn_hubWork").innerHTML = (document.getElementById("filterBtn_hubWork").innerHTML - limit_max_Workshop) + "/" + document.getElementById("filterBtn_hubWork").innerHTML;
    document.getElementById("filterBtn_hubTalk").innerHTML = (document.getElementById("filterBtn_hubTalk").innerHTML - limit_max_Talk) + "/" + document.getElementById("filterBtn_hubTalk").innerHTML;
    document.getElementById("filterBtn_hubHack").innerHTML = limit_max_Hackathon;
    document.getElementById("filterBtn_hubExp").innerHTML = (document.getElementById("filterBtn_hubExp").innerHTML - limit_max_Experience) + "/" + document.getElementById("filterBtn_hubExp").innerHTML;
    
    document.getElementById("sub_hub_exp").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 16px;'>local_fire_department</span><b>" + expected_exp + "</b> / "+ max_exp_points;
    display_expected_credits(expected_exp);
    document.getElementById("is_hub_loading").style.display = "none";
}

core.userData_get().then(data => {
    user_data_cache = data;
    fetch_hubAPI();
});