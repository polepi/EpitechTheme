var header_auth;
var last_check;
var targ_year;
var selected_shite;
var selected_subject;

var user_data_cache = null;

const iframeHosts = ['https://my.epitech.eu/*'];
import * as core from './core.js';

chrome.runtime.onInstalled.addListener(() => {
    const RULE = {
        id: 1,
        condition: {
            initiatorDomains: [chrome.runtime.id],
            requestDomains: iframeHosts,
            resourceTypes: ['sub_frame'],
        },
        action: {
            type: 'modifyHeaders',
            responseHeaders: [
                {header: 'X-Frame-Options', operation: 'remove'},
                {header: 'Frame-Options', operation: 'remove'},
            ],
        },
    };

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE.id],
        addRules: [RULE],
    });
});

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
        document.getElementById("btn_mark_read").style.backgroundColor = "#a36a6a";
        document.getElementById("btn_mark_read").style.color = "#fff";
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
    var months = Math.floor(days / 31);

    if (months >= 1) {
        return months + "mo ago";
    } else if (days >= 1) {
        return days + "d ago";
    } else if (hours >= 1) {
        return (minutes / 60).toFixed(1) + "h ago";
    } else {
        return minutes + "m ago";
    }
}

function get_correct_per(item) {
    var iscrashed = item["results"]["externalItems"];
    item = Object.values(item["results"]["skills"]);
    var len = item.length;
    var completedItems = 0;
    var countItems = 0;

    for (var i = 0; i < len; i++) {
        var res = item[i];
        countItems += res["count"];
        completedItems += res["passed"];
    }
    var completionPercentage = 100;
    if (len > 0)
        completionPercentage = ((completedItems / countItems) * 100).toFixed(0);
    if (isNaN(completionPercentage)) {
        return "<span style='margin-right: 15px;'>—</span>";
    }
    for (var i = 0; i < iscrashed.length; i++) {
        if (iscrashed[i]["type"] == "crash" && iscrashed[i]["value"] > 0 && completionPercentage == 0)
            return "<span title='Why are we still here.. just to suffer..' style='margin-right:10px;font-size:18px;text-align:left;'>😭</span><span style='text-align:left;width:104px;border: 1px solid #bbb;padding: 1px;border-radius: 6px; display: inline-block;'><span class='legendary_result' style='color:#111;display:inline-block;width:100px;background-color:#ccc;'>Crashed</span></span>";
        if (iscrashed[i]["type"] == "crash" && iscrashed[i]["value"] > 0 && completionPercentage > 0)
            return "<span title='Why are we still here.. just to suffer..' style='margin-right:10px;font-size:18px;;text-align:left;'>😭</span><span style='text-align:left;width:104px;border: 1px solid #bbb;padding: 1px;border-radius: 6px; display: inline-block;'><span class='legendary_result' style='color:#111;display:inline-block;width:100px;background-color:#ccc;'>"+completionPercentage+"% (Crash)</span></span>";
        if (iscrashed[i]["type"] == "banned")
            return "<span title='I still don`t understand why printf is banned..' style='margin-right:10px;font-size:18px;;text-align:left;'>😒</span><span style='text-align:left;width:104px;border: 1px solid #bbb;padding: 1px;border-radius: 6px; display: inline-block;'><span class='legendary_result' style='color:#111;display:inline-block;width:100px;background-color:#ccc;'>Banned</span></span>";
        if (iscrashed[i]["type"] == "coding-style-fail")
            return "<span title='It sucks, I feel your pain' style='margin-right:10px;font-size:18px;;text-align:left;'>😤</span><span style='text-align:left;width:104px;border: 1px solid #bbb;padding: 1px;border-radius: 6px; display: inline-block;'><span class='legendary_result' style='color:#111;display:inline-block;width:100px;background-color:#ccc;'>Coding Style</span></span>";
        if (iscrashed[i]["type"] == "no-test-passed")
            return "<span title='It sucks, I feel your pain' style='margin-right:10px;font-size:18px;;text-align:left;'>😩</span><span style='text-align:left;width:104px;border: 1px solid #bbb;padding: 1px;border-radius: 6px; display: inline-block;'><span class='legendary_result' style='color:#222;display:inline-block;width:0px;background-color:#e35d5d;'><b>0%</b></span></span>";
    }
    var colour_bar = "#e35d5d";
    var colour_font = "#f1f1f1";
    var emoji_font = "☹️";
    var emoji_tooltip = "RIP, time to ask <Teacher Name here> ig";
    if (completionPercentage <= 33) {
        colour_font = "#333";
    }
    if (completionPercentage > 10) {
        colour_bar = "#ff4d00";
        emoji_font = "😕";
        emoji_tooltip = "Ouch.. That hurts..";
    }
    if (completionPercentage > 30) {
        colour_bar = "#ff9100";
        emoji_font = "😐";
        emoji_tooltip = "Pain.. just pain..";
    }
    if (completionPercentage > 50) {
        colour_bar = "#e3d409";
        emoji_font = "🤔";
        emoji_tooltip = "Oh well, at least some tests passed!";
    }
    if (completionPercentage > 65) {
        colour_bar = "#90b31e";
        emoji_font = "😮";
        emoji_tooltip = "Hey, that`s pretty good!";
    }
    if (completionPercentage > 75) {
        colour_bar = "#26a324";
        emoji_font = "🤗";
        emoji_tooltip = "Amazing! That`s prob a `B` prob?";
    }
    if (completionPercentage >= 100) {
        colour_bar = "#a71ac4";
        emoji_font = "🔥";
        emoji_tooltip = "Oustanding job! No more pain from THIS project?";
    }
    return "<span title='"+emoji_tooltip+"' style='margin-right:10px;font-size:18px;text-align:left;'>"+emoji_font+"</span><span style='text-align:left;width:104px;border: 1px solid "+colour_bar+";padding: 1px;border-radius: 6px; display: inline-block;'><b class='legendary_result' style='color: "+colour_font+";display:inline-block;width:"+completionPercentage+"px;background-color:"+colour_bar+";'>"+completionPercentage+"%</b></span>";
}

function get_result_label(info) {
    if (info["passed"] == true)
        return "<span class='span_result_box' style='background-color:#90b31e;color:white;'>Passed</span>";
    if (info["crashed"] == true)
        return "<span class='span_result_box' style='background-color:#ff9100;color:#222;'>Crashed</span>"
    if (info["skipped"] == true)
        return "<span class='span_result_box' style='background-color:#bbb;color:#333;'>Skipped</span>"
    return "<span class='span_result_box' style='background-color:#e35d5d;color:#f1f1f1;'>Failed</span>"
}

function proccess_result(raw) {
    raw = raw.replace(/'([^']+)'/g, (_, match) => {
        return `<span style="padding: 2px 6px;border:1px solid #ccc;background-color:#ddd;border-radius:5px;display:inline-block;">${match}</span>`;
    });
    return raw;
}

function did_crash(is_crashed) {
    if (is_crashed == 1) {
        return "<span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'><span class='material-icons-outlined' style='margin-right:4px;font-size:16px;'>sync_problem</span>Crashed</span>";
    }
    return "";
}

function remove_specials(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#x27;")
              .replace(/\//g, "&#x2F;");
  }

function print_details(det, url) {
    const new_tr_element = document.createElement('div');
    document.getElementById("shite_details_name").textContent = det["instance"]["projectName"]; 
    document.getElementById("shite_response").style.display = "none";
    document.getElementById("info_badge_banned_functs").style.display = "none";
    document.getElementById("shite_details").style.display = "block";
    document.getElementById("shite_det_direct_link").href = url;

    document.getElementById("sub_info_minor").textContent = "0";
    document.getElementById("sub_info_major").textContent = "0";
    document.getElementById("sub_info_info").textContent = "0";
    document.getElementById("sub_info_fatal").textContent = "0";

    det["externalItems"].forEach((skill) => {
        if (skill["type"] == "banned") {
            document.getElementById("info_badge_banned_functs_list").textContent = skill["comment"].replace("Functions used but not allowed: ", "");
            document.getElementById("info_badge_banned_functs").style.display = "inline-block";
        }
        if (skill["type"] == "no-test-passed") {
            new_tr_element.innerHTML = new_tr_element.innerHTML+"<div class='tr_test_global' style='position:relative;'><div class='tr_test_desc'><span style='font-size:14px;display:block;margin-bottom:5px;color:#444;'><span class='material-icons-outlined' style='margin-right:4px;font-size:18px;margin-top:2px;'>assignment_late</span> No tests passed.</span></div></div>";
        }
        if (skill["type"] == "coding-style-fail") {
            new_tr_element.innerHTML = new_tr_element.innerHTML+"<div class='tr_test_global' style='position:relative;'><div class='tr_test_desc'><span style='font-size:14px;display:block;margin-bottom:5px;color:#444;'><span class='material-icons-outlined' style='margin-right:4px;font-size:18px;margin-top:2px;'>warning</span> Coding style failure.</span></div></div>";
        }
    });

    if (det["style"] && det["style"]["Details"]) {
        var style_count = 0;
        if (det["style"]["Details"]["major"]) {
            style_count = 0;
            const minorObject = det["style"]["Details"]["major"];
            for (const key in minorObject) {
                if (minorObject.hasOwnProperty(key) && Array.isArray(minorObject[key])) {
                    style_count += minorObject[key].length;
                }
            }
            document.getElementById("sub_info_major").textContent = style_count;

        }
        if (det["style"]["Details"]["minor"]) {
            style_count = 0;
            const minorObject = det["style"]["Details"]["minor"];
            for (const key in minorObject) {
                if (minorObject.hasOwnProperty(key) && Array.isArray(minorObject[key])) {
                    style_count += minorObject[key].length;
                }
            }
            document.getElementById("sub_info_minor").textContent = style_count;
        }
        if (det["style"]["Details"]["info"]) {
            style_count = 0;
            const minorObject = det["style"]["Details"]["info"];
            for (const key in minorObject) {
                if (minorObject.hasOwnProperty(key) && Array.isArray(minorObject[key])) {
                    style_count += minorObject[key].length;
                }
            }
            document.getElementById("sub_info_info").textContent = style_count;
        }
        if (det["style"]["Details"]["fatal"]) {
            style_count = 0;
            const minorObject = det["style"]["Details"]["fatal"];
            for (const key in minorObject) {
                if (minorObject.hasOwnProperty(key) && Array.isArray(minorObject[key])) {
                    style_count += minorObject[key].length;
                }
            }
            document.getElementById("sub_info_fatal").textContent = style_count;
        }
    }
    if (det["style"] && det["style"]["Counts"]) {
        var style_count = 0;
        if (det["style"]["Counts"]["major"]) {
            style_count = 0;
            const minorObject = det["style"]["Counts"]["major"];
            for (const key in minorObject) {
                style_count += minorObject[key];
            }
            document.getElementById("sub_info_major").textContent = style_count;

        }
        if (det["style"]["Counts"]["minor"]) {
            style_count = 0;
            const minorObject = det["style"]["Counts"]["minor"];
            for (const key in minorObject) {
                style_count += minorObject[key];
            }
            document.getElementById("sub_info_minor").textContent = style_count;
        }
        if (det["style"]["Counts"]["info"]) {
            style_count = 0;
            const minorObject = det["style"]["Counts"]["info"];
            for (const key in minorObject) {
                style_count += minorObject[key];
            }
            document.getElementById("sub_info_info").textContent = style_count;
        }
        if (det["style"]["Counts"]["fatal"]) {
            style_count = 0;
            const minorObject = det["style"]["Counts"]["fatal"];
            for (const key in minorObject) {
                style_count += minorObject[key];
            }
            document.getElementById("sub_info_fatal").textContent = style_count;
        }
    }
    var tot_itms = 0;
    det["skills"].forEach((skill) => {
        var colour_bar = "#e35d5d";
        var colour_font = "#f1f1f1";
        var completedItems = 0;
        var countItems = 0;
        var is_crashed = 0;
        tot_itms += 1;
        if (skill["FullSkillReport"] && skill["FullSkillReport"]["tests"]) {
            skill["FullSkillReport"]["tests"].forEach((test) => {
                countItems++;
                if (test["crashed"] == true)
                    is_crashed = 1;
                if (test["passed"] == true)
                    completedItems++;
            });
            var completionPercentage = ((completedItems / countItems) * 100).toFixed(0);
            if (completionPercentage <= 33)
                colour_font = "#333";
            if (completionPercentage > 10)
                colour_bar = "#ff4d00";
            if (completionPercentage > 30)
                colour_bar = "#ff9100";
            if (completionPercentage > 50)
                colour_bar = "#e3d409";
            if (completionPercentage > 65)
                colour_bar = "#90b31e";
            if (completionPercentage > 75)
                colour_bar = "#26a324";
            if (completionPercentage >= 100) {
                colour_bar = "#a71ac4";
                new_tr_element.innerHTML = new_tr_element.innerHTML+"<div style='padding:12px 16px;margin:5px;border-radius:5px;margin-bottom:0px;background:#ddd;border:1px solid #ccc;position:relative;'>"+skill["FullSkillReport"]["name"]+"<span style='position:absolute;right:5px;top:5px;'>"+did_crash(is_crashed)+"<span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'>"+completedItems+"/"+countItems+"</span><span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'><span class='material-icons-outlined' style='margin-right:4px;font-size:16px;'>done_all</span>100%</span></span></div>";
            } else {
                new_tr_element.innerHTML = new_tr_element.innerHTML+"<div style='padding:12px 16px;margin:5px;border-radius:5px;margin-bottom:0px;background:#ddd;border:1px solid #ccc;position:relative;'>"+skill["FullSkillReport"]["name"]+"<span style='position:absolute;right:5px;top:5px;'>"+did_crash(is_crashed)+"<span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'>"+completedItems+"/"+countItems+"</span><span style='width:104px;background:#eee;border: 1px solid #ccc;padding: 1px; border-radius: 6px; display: inline-block;'><b class='legendary_result' style='color: "+colour_font+";display:inline-block;width:"+completionPercentage+"px;background-color:"+colour_bar+";'>"+completionPercentage+"%</b></span></span></div>";
            }
            
            skill["FullSkillReport"]["tests"].forEach((test) => {
                new_tr_element.innerHTML = new_tr_element.innerHTML+"<div class='tr_test_global' style='position:relative;'><div class='tr_test_desc'><b style='font-size:14px;display:block;margin-bottom:5px;color:#111;'>"+test["name"]+"</b>"+proccess_result(test["comment"])+"</div>"+get_result_label(test)+`<span class='span_copy_box' data-copy="`+remove_specials(test[`name`])+`:\n`+remove_specials(test[`comment`])+`"><span class='material-icons-outlined'>content_copy</span></span></div>`;
            });
        } else if (skill["BreakdownSkillReport"] && skill["BreakdownSkillReport"]["breakdown"]) {
            countItems = skill["BreakdownSkillReport"]["breakdown"].count;
            completedItems = skill["BreakdownSkillReport"]["breakdown"].passed;
            var completionPercentage = ((completedItems / countItems) * 100).toFixed(0);
            if (completionPercentage <= 33)
                colour_font = "#333";
            if (completionPercentage > 10)
                colour_bar = "#ff4d00";
            if (completionPercentage > 30)
                colour_bar = "#ff9100";
            if (completionPercentage > 50)
                colour_bar = "#e3d409";
            if (completionPercentage > 65)
                colour_bar = "#90b31e";
            if (completionPercentage > 75)
                colour_bar = "#26a324";
            if (completionPercentage >= 100) {
                colour_bar = "#a71ac4";
                new_tr_element.innerHTML = new_tr_element.innerHTML+"<div style='padding:12px 16px;margin:5px;border-radius:5px;margin-bottom:0px;background:#ddd;border:1px solid #ccc;position:relative;'>"+skill["BreakdownSkillReport"]["name"]+"<span style='position:absolute;right:5px;top:5px;'>"+did_crash(skill["BreakdownSkillReport"]["breakdown"].crashed)+"<span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'>"+completedItems+"/"+countItems+"</span><span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'><span class='material-icons-outlined' style='margin-right:4px;font-size:16px;'>done_all</span>100%</span></span></div>";
            } else {
                new_tr_element.innerHTML = new_tr_element.innerHTML+"<div style='padding:12px 16px;margin:5px;border-radius:5px;margin-bottom:0px;background:#ddd;border:1px solid #ccc;position:relative;'>"+skill["BreakdownSkillReport"]["name"]+"<span style='position:absolute;right:5px;top:5px;'>"+did_crash(skill["BreakdownSkillReport"]["breakdown"].crashed)+"<span style='border-radius:7px;display:inline-block;background:#eee;padding:5px 7px;margin-right:6px;border:1px solid #ccc;'>"+completedItems+"/"+countItems+"</span><span style='width:104px;background:#eee;border: 1px solid #ccc;padding: 1px; border-radius: 6px; display: inline-block;'><b class='legendary_result' style='color: "+colour_font+";display:inline-block;width:"+completionPercentage+"px;background-color:"+colour_bar+";'>"+completionPercentage+"%</b></span></span></div>";
            }
            new_tr_element.innerHTML = new_tr_element.innerHTML+"<div class='tr_test_global' style='position:relative;'><div class='tr_test_desc'><i style='font-size:14px;display:block;margin-bottom:5px;color:#444;'>This part has no tests to be displayed.</i></div><span class='span_copy_box' data-copy='No tests'><span class='material-icons-outlined'>content_copy</span></span></div>";
        }
    });
    if (tot_itms == 0) {
        new_tr_element.innerHTML = new_tr_element.innerHTML+"<div class='tr_test_global' style='position:relative;'><div class='tr_test_desc'><span style='font-size:14px;display:block;margin-bottom:5px;color:#444;'>No tests to be displayed.</span></div></div>";
    }
    document.getElementById("tab_shite_subject_details2").appendChild(new_tr_element);

    // Assign copy_btn //

    document.querySelectorAll('.span_copy_box').forEach(function(element) {
        element.addEventListener('click', function() {
            var textToCopy = this.getAttribute('data-copy');
            var textarea = document.createElement('textarea');
            textarea.value = textToCopy;

            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.querySelector('.material-icons-outlined').textContent = "check";
        });
    });
}

tab_shite_subject_back.addEventListener("click", function () {
    selected_shite = null;
    selected_subject = null;
    document.getElementById("shite_details").style.display = "none";
    document.getElementById("shite_response").style.display = "block";
});

function open_details(id, url, url2) {
    selected_shite = id;
    selected_subject = url;
    document.getElementById("t_history_warn").style.display = "none";
    document.getElementById('tab_shite_subject_details2').innerHTML = "";
    fetch('https://api.epitest.eu/me/details/'+id, {
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
        if (data && data == "") {
            const new_tr_element = document.createElement('tr');
            new_tr_element.innerHTML = "<td>No data found</td>";
            document.getElementById('tab_shite_subject_details2').appendChild(new_tr_element);
        } else {
            print_details(send_data, "https://my.epitech.eu/index.html#d/"+url+"/"+url2);
        }
    })
    .catch(error => {
        document.getElementById("t_logginset_warn").style.display = "none";
        document.getElementById('t_notset_warn').style.display = 'block';
        console.error('Error:', error);
    });
}

function load_subject_list(data) {
    const ulElement = document.getElementById('shite_subject_list');
    ulElement.innerHTML = "";
    data.forEach((item) => {
        const new_tr_element = document.createElement('tr');
        const isnew = is_object_new(item["date"]);

        new_tr_element.setAttribute('date-index', Date.parse(item["date"]));
        new_tr_element.innerHTML = "<td title='Display info'><a title='Moulinette link' target='_blank' href='https://my.epitech.eu/index.html#d/"+targ_year+"/"+item['project']['module']['code']+"/"+item['project']['slug']+'/'+item['results']['testRunId']+"'>"+item["project"]["name"]+"</a></td><td title='Mark as read to hide'>"+isnew+"</td><td style='text-align:right;width:165px;padding-right:25px;'>"+get_correct_per(item)+"</td><td>"+daysSince(item["date"])+"</td>";
        if (item["project"] && item["project"]["module"] && item["project"]["module"]["code"]) {
            new_tr_element.addEventListener("click", function () {
                open_details(item["results"]["testRunId"], targ_year+"/"+item['project']['module']['code']+"/"+item['project']['slug'], item['results']['testRunId']);
            });
        }
        ulElement.appendChild(new_tr_element);
    });
    sortTable();
}
    
function get_shite_data(isTest) {
    document.getElementById("info_badge_text").textContent = "Awaiting Moulinette...";
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
        document.getElementById("t_logginset_warn").style.display = "none";
        document.getElementById('t_notset_warn').style.display = 'none';
        document.getElementById("iframe_login_shite_frame").style.display = "none";
        document.getElementById("iframe_login_shite_frame").innerHTML = "";
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
            document.getElementById("t_logginset_warn").style.display = "none";
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

function force_login_shite() {
    var loginbtn = document.querySelector("#app-wrapper>.mdl-color-text--primary>a.mdl-js-ripple-effect.mdl-js-button.mdl-button.mdl-button--colored.mdl-button--raised")
    if (loginbtn) {
        loginbtn.click();
        clearInterval(intervalId);
    }
    return 1;
}

function update_api() {
    document.getElementById("info_badge_text").textContent = "Attemping to log into the Moulinette...";
    document.getElementById("iframe_login_shite_frame").style.display = "block";
    setTimeout(function(){
        document.getElementById("iframe_login_shite_frame").style.display = "none";
        document.getElementById("iframe_login_shite_frame").innerHTML = "";
        get_header_auth(false);
    }, 4000);
}

function get_stored_data() {
    var currentDate = new Date();
    document.getElementById("date_input").value = targ_year;
    if (user_data_cache && user_data_cache.UserYear)
        document.getElementById("date_input").max = user_data_cache.UserYear;
    else
        document.getElementById("date_input").max = currentDate.getFullYear();
    document.getElementById("date_input").addEventListener('blur', function() {
        if (targ_year != document.getElementById("date_input").value) {
            targ_year = document.getElementById("date_input").value;
            chrome.storage.local.set({'curr_year': targ_year}, () => {
                location.reload();
            });
        }
    });
    chrome.storage.local.get('last_time', function(data) {
        last_check = data["last_time"];
        if (last_check == null) {
            last_check = new Date().getTime();
            chrome.storage.local.set({'last_time': last_check});
        }
        last_check = new Date(last_check);
        document.getElementById("info_badge_text").textContent = "Loading...";
        document.getElementById("t_logginset_warn").style.display = "block";
        get_header_auth(true);
    });
}

chrome.storage.local.get('curr_year', function(data) {
    targ_year = data["curr_year"] || null;

    core.userData_get().then(data2 => {
        if (targ_year == null)
            targ_year = data2.UserYear;
        user_data_cache = data2;
        get_stored_data();
    }).catch(error => {
        console.error("Error:", error);
    });
});

document.getElementById("btn_mark_read").addEventListener('click', function() {
    last_check = new Date().getTime();
    chrome.storage.local.set({'last_time': last_check}, () => {
        location.reload();
    });
});

function go_fullscreen() {
    if (!selected_shite)
        window.open("shite.html", "_blank");
    else
        window.open("shite.html?sel="+selected_shite, "_blank");
}

function load_history() {
    if (!selected_subject)
        return;
        document.getElementById("shite_details").style.display = "none";
        document.getElementById("span_history_name").textContent = selected_subject;
        document.getElementById("t_history_warn").style.display = "block";
    fetch('https://api.epitest.eu/me/'+selected_subject, {
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
        document.getElementById("t_logginset_warn").style.display = "none";
        document.getElementById('t_notset_warn').style.display = 'none';
        document.getElementById("iframe_login_shite_frame").style.display = "none";
        document.getElementById("iframe_login_shite_frame").innerHTML = "";
        if (data && data == "") {
            const new_tr_element = document.createElement('tr');
            new_tr_element.innerHTML = "<td>No data, try a different year</td>";
            document.getElementById('shite_subject_list').appendChild(new_tr_element);
        }
        load_subject_list(send_data);
        document.getElementById("shite_response").style.display = "block";
    })
    .catch(error => {
        if (isTest == true) {
            update_api();
        } else {
            document.getElementById("t_logginset_warn").style.display = "none";
            document.getElementById('t_notset_warn').style.display = 'block';
            console.error('Error:', error);
        }
    });
}

document.getElementById("open_history").addEventListener("click", load_history);
document.getElementById("go_full_screen").addEventListener("click", go_fullscreen);
document.getElementById("go_full_screen2").addEventListener("click", go_fullscreen);

document.getElementById("btn_clear_history").addEventListener("click", function() {
    location.reload();
});

if (window.outerHeight > 800) {
    document.getElementById("go_full_screen").style.display = "none";
    document.getElementById("go_full_screen2").style.display = "none";
    document.getElementById("tab_shite_subjects_table").style.height = "calc(100vh - 82px)";
    document.getElementById("shite_overflow_data").style.height = "calc(100vh - 92px)";
}