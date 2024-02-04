var limit_max_Workshop = 10;
var limit_max_Hackathon = 0;
var limit_max_Talk = 0;
var limit_max_Project = 0;
var limit_max_Experience = 8;
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
    .catch(error => {});
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
    if (hub.type_title == "Hackathon" && limit_max_Hackathon > 0) {
        exp += 6;
        limit_max_Hackathon -= 1;
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
    var tek_year = 1;
    var max_cred = 8;
    if (tek_year == 1)
        max_cred = 5;
    if (max_cred < cred)
        cred = max_cred;
    document.getElementById("sub_hub_cred").innerHTML = "<b>"+ cred +"</b>/"+max_cred;
    document.getElementById("sub_hub_cred_bar").style.width = (cred/max_cred) * 100 + "%";
}

function getExpectedEXP(hub) {
    var expected_exp = 0;
    limit_max_Workshop = 10;
    limit_max_Hackathon = 6;
    limit_max_Talk = 15;
    limit_max_Project = 0;
    limit_max_Experience = 0;

    max_exp_points = 50;
    
    hub.activites.forEach(act => {
        if (act.events && act.events[0] && act.events[0].user_status) {
            if (act.events[0].user_status == "present") {
                expected_exp += getExpFromItem(act);
            }
        }
    });
    
    document.getElementById("sub_hub_exp").innerHTML = "<span class='material-icons-outlined' style='margin-top: 2px;margin-right: 10px;font-size: 18px;'>auto_awesome</span><b>" + expected_exp + "</b> / "+ max_exp_points;
    display_expected_credits(expected_exp);
    document.getElementById("is_hub_loading").style.display = "none";
}

fetch_hubAPI();