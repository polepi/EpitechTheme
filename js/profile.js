import * as core from './core.js';

var user_loc;
var user_year;

var user_data_cache = null;

function open_tab(evt, tabname) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");

    document.getElementById('subtab_subjectList').style.display = "block";
    document.getElementById('subtab_subjectInfo').style.display = "none";

    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabname).style.display = "block";
    if (evt && evt.currentTarget)
        evt.currentTarget.classList.add("active");
}

var tablinks = document.getElementsByClassName('tablinks');
for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].addEventListener('click', function(event) {
        var dataLinkValue = event.currentTarget.getAttribute('data-link');
        open_tab(event.currentTarget, dataLinkValue);
    });
}

document.getElementById("subj_info_back").addEventListener('click', () => {
    open_tab(null, "tab_grades");
});
open_tab(null, "tab_global");

function convertDateFormat(inputString) {
    const date = new Date(inputString);
  
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function gradeToText(raw_grade, islong) {
    if (raw_grade == "Acquis") {
        if (islong)
            return "Passed";
        return "Pass";
    }
    if (raw_grade == "Echec") {
        if (islong)
            return "Failed";
        return "Fail";
    }
    return raw_grade;
}

function open_subjectInfo(module, data) {
    const ulElement = document.getElementById('ul_subjects_info');

    document.getElementById('subtab_subjectList').style.display = "none";
    document.getElementById("sub_info_name").textContent = module.title;
    document.getElementById("sub_info_cred").textContent = module.credits;
    document.getElementById("sub_info_grade").textContent = gradeToText(module.grade, true);
    ulElement.innerHTML = "";

    data.notes.forEach(grade => {
        if (module.title == grade.titlemodule) {
            const new_tr_element = document.createElement('tr');
            new_tr_element.innerHTML = "<td title='Issued by: "+grade.correcteur+"\n"+grade.comment+"'>"+grade.title+"</td><td>"+convertDateFormat(grade.date)+"</td><td>"+grade.final_note+"</td>";
            ulElement.appendChild(new_tr_element);
        }
    });

    document.getElementById('subtab_subjectInfo').style.display = "block";
}

function getSubjectInfo() {
    const url_subject_info = "https://intra.epitech.eu/course/filter?format=json&preload=1&location%5B%5D="+user_loc+"&course%5B%5D=bachelor%2Fclassic&scolaryear%5B%5D="+user_year;
    
    fetch(url_subject_info)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        var filt_btn_fail = 0;
        var filt_btn_succ = 0;
        var filt_btn_reg = 0;
        var filt_btn_notr = 0;

        data.items.forEach(module => {
            const el = document.querySelectorAll('[id-code="'+module.code+'"]');
            if (el && el[0]) {
                const el2 = el[0].querySelector("td:first-child");
                el2.innerHTML = "<i class='material-icons-outlined' title='Error loading data'>help_outline</i>";
                if (module.status == "notregistered") {
                    el2.innerHTML = "<i class='material-icons-outlined' style='color:LightSalmon;' title='Not registred'>circle</i>";
                    filt_btn_notr += 1;
                }
                if (module.status == "ongoing") {
                    el2.innerHTML = "<i class='material-icons-outlined' title='Registred/Ongoing'>schedule</i>";
                    filt_btn_reg += 1;
                }
                if (module.status == "valid") {
                    el2.innerHTML = "<i class='material-icons-outlined' style='color:#8FBC8F;' title='Module Passed'>check_circle</i>";
                    filt_btn_succ += 1;
                }
                if (module.status == "fail") {
                    el2.innerHTML = "<i class='material-icons-outlined' style='color:IndianRed;' title='Module Failed'>cancel</i>";
                    filt_btn_fail += 1;
                }
            }
        });

        document.getElementById("filterBtn_all").textContent = filt_btn_reg + filt_btn_succ + filt_btn_fail + filt_btn_notr;
        document.getElementById("filterBtn_reg").textContent = filt_btn_reg;
        document.getElementById("filterBtn_pass").textContent = filt_btn_succ;
        document.getElementById("filterBtn_fail").textContent = filt_btn_fail;
        document.getElementById("filterBtn_not").textContent = filt_btn_notr;
    })
    .catch(error => {
        console.log(error);
    });
}

function get_roadblocks(data) {
    const tek_y = user_data_cache.UserCourse;
    var req_roadblocks = {
        "1": {
            "Innovation & Professionalization": {
                "min": 3,
                "current": 0,
                "source":["Epitech JAM", "KYT/CAT"]
            },
            "Soft Skills": {
                "min": 3,
                "current": 0,
                "source":["B-PRO-100", "B-PRO-200", "B-PMP-100", "B-PMP-200", "B-PCP-000"]
            },
            "Technical Foundation": {
                "min": 20,
                "current": 0,
                "source":["B-CPE-100", "B-CPE-101", "B-CPE-110", "B-PSU-100", "B-CPE-200", "B-PSU-200"]
            },
            "Technical Supplement": {
                "min": 8,
                "current": 0,
                "source":["B-MUL-100", "B-MAT-100", "B-NSA-100", "B-MUL-200", "B-AIA-200", "B-WEB-200", "B-MAT-200", "B-SEC-200", "B-DOP-200"]
            }
        },
        "2": {
            "Innovation & Professionalization": {
                "min": 4,
                "current": 0,
                "source":["Epitech JAM", "KYT/CAT"]
            },
            "Soft Skills": {
                "min": 3,
                "current": 0,
                "source":["B-PRO-100", "B-PMP-400", "B-PCP-000"]
            },
            "Technical Foundation": {
                "min": 13,
                "current": 0,
                "source":["B-NWP-400", "B-OOP-400", "B-PDG-300", "B-CCP-400", "B-YEP-400"]
            },
            "Technical Supplement": {
                "min": 6,
                "current": 0,
                "source": ["B-FUN-400", "B-CNA-410", "B-MAT-400", "B-DOP-400", "B-SEC-400", "B-ASM-400", "B-PSU-400"]
            }
        }
    };

    if (req_roadblocks[tek_y] == null) {
        document.getElementById("rblk_container").innerHTML = `No roadblocks found for TEK${tek_y}`
        return;
    }

    data.modules.forEach(module => {
        Object.keys(req_roadblocks[tek_y]).forEach(category => {
            req_roadblocks[tek_y][category].source.forEach(sourceItem => {
                if (module.title.includes(sourceItem) || module.codemodule.includes(sourceItem)) {
                    const new_el = document.createElement('p');
                    const new_el2 = document.createElement('span');
                    new_el2.style.float = "right";
                    new_el.innerHTML = `${module.title}`;
                    if (module.grade == 'Acquis' || (module.grade >= 'A' && module.grade <= 'D')) {
                        if (module.grade == 'Acquis')
                            module.grade = '-';
                        new_el2.innerHTML += `<span class='rdbl_credit_outline'>${module.credits}/${module.credits}</span><span style='margin-left:5px;border-color:#26a324;background:#c3cfb4;' class='rdbl_credit_outline'>${module.grade}</span></span>`;
                        req_roadblocks[tek_y][category]["current"] += module.credits;
                    } else if(module.grade == '-') {
                        new_el2.innerHTML += `<span class='rdbl_credit_outline'>0/${module.credits}</span> <span title="Module ongoing" class='rdbl_credit_outline'><span class="material-icons-outlined" style="font-size: 16px;">update</span></span></span>`;
                    } else {
                        new_el2.innerHTML += `<span class='rdbl_credit_outline'>0/${module.credits}</span><span style='margin-left:5px;border-color:#ff4d00;background-color:#e0bfbc;' class='rdbl_credit_outline'>F</span></span>`;
                    }
                    new_el.appendChild(new_el2);
                    document.getElementById(`rdbl_sect_${category}`).appendChild(new_el);
                }
            });
        });
    });

    if (document.getElementById("sub_hub_cred") != null && document.getElementById("sub_hub_cred").querySelector("b") != null) {
        var hub_pred = document.getElementById("sub_hub_cred");
        var hub_pred_creds = parseInt(hub_pred.querySelector("b").textContent);

        if (hub_pred.textContent.split('/')[1] && hub_pred_creds > parseInt(hub_pred.textContent.split('/')[1]))
            hub_pred_creds = parseInt(hub_pred.textContent.split('/')[1]);
        const new_el = document.createElement('p');
        const new_el2 = document.createElement('span');
        new_el2.style.float = "right";
        new_el.innerHTML = "HUB";
        new_el2.innerHTML += `<span class='rdbl_credit_outline'>${hub_pred.querySelector("b").textContent}/${hub_pred.textContent.split('/')[1]}</span></span>`;
        new_el.appendChild(new_el2);
        document.getElementById("rdbl_sect_Innovation & Professionalization").appendChild(new_el);
        req_roadblocks[tek_y]["Innovation & Professionalization"]["current"] += hub_pred_creds;
    } else {
        console.log("Not found");
        const new_el = document.createElement('p');
        const new_el2 = document.createElement('span');
        new_el2.style.float = "right";
        new_el.innerHTML = "HUB";
        new_el2.innerHTML += `<span class='rdbl_credit_outline'>ERROR</span></span>`;
        new_el.appendChild(new_el2);
        document.getElementById("rdbl_sect_Innovation & Professionalization").appendChild(new_el);
    }

    Object.keys(req_roadblocks[tek_y]).forEach(category => {
        const data = req_roadblocks[tek_y][category];
        const max_size = 100.0;
        var bar_colour = "green";
        var colour_font = "#fff";
        var barsize = Math.trunc((data.current/data.min) * 100);
        if (barsize > max_size)
            barsize = max_size;

        if (barsize <= 33)
            colour_font = "#333";
        bar_colour = "#ff4d00";
        if (barsize > 30)
            bar_colour = "#ff9100";
        if (barsize > 50)
            bar_colour = "#e3d409";
        if (barsize > 65)
            bar_colour = "#90b31e";
        if (barsize >= 100) {
            bar_colour = "#a71ac4";
        }
        document.getElementById(`rdbl_sect_${category}`).parentNode.querySelector(".roadblock_header > span").innerHTML = `<span><span class="material-icons-outlined" style="margin-top: 2px;margin-right: 3px;font-size: 14px;">auto_awesome</span> ${data.current}/${data.min}</span><span style='width:${max_size+2}px;border-color:${bar_colour};'><span style='background-color:${bar_colour};color:${colour_font};width:${barsize}px;'>${barsize}%</span></span>`;
    });
    document.getElementById("is_road_loading").style.display = "none";
}

var fetch_grades_cooldown = 0;
function fetch_grades() {
    document.getElementById('is_grades_loading').style.display = "block";
    const url_grades_json = "https://intra.epitech.eu/user/"+user_data_cache.UserId+"/notes?format=json";
    const ulElement = document.getElementById('ul_show_subjects');

    fetch(url_grades_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (fetch_grades_cooldown == 0) {
            fetch_grades_cooldown = 1;
            data.modules.forEach(module => {
                const new_tr_element = document.createElement('tr');
                new_tr_element.innerHTML = "<td>-</td><td>"+module.title+"</td><td>"+module.codemodule+"</td><td>"+module.credits+"</td><td class='td_tabl_grade'>"+gradeToText(module.grade)+"</td>";
                new_tr_element.addEventListener('click', () => {
                    open_subjectInfo(module, data);
                });
                new_tr_element.setAttribute("id-sem", module.title.slice(1, 2))
                new_tr_element.setAttribute("id-code", module.codemodule);
                ulElement.appendChild(new_tr_element);
            });
            getSubjectInfo();
            setTimeout(() => {
                get_roadblocks(data);
            }, 500);
        }
        document.getElementById('is_grades_loading').style.display = "none";
    })
    .catch(error => {
        document.getElementById('is_grades_loading').style.borderTop = '4px solid #682828';
        setTimeout(() => {
            document.getElementById('is_grades_loading').style.borderTop = '4px solid rgb(45, 54, 110);';
            fetch_grades();
        }, 500);
    });
}

core.userData_get().then(data => {
    user_data_cache = data;
    const needed_credits = data.UserCourse * 60;
    if (document.getElementById("t_failedlogin_warn"))
        document.getElementById("t_failedlogin_warn").style.display = "none";
    document.getElementById("p_info_credits").innerHTML = "<b>"+ data.UserCredits + "</b>&nbsp;<span style='color:#666;'>/ "+needed_credits+"</span>";
    if (data.UserCredits >= data.UserCourse * 60) {
        document.getElementById("p_info_credits").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>🎉</span>`;
    }

    document.getElementById("p_info_gpa").innerHTML = "<b>"+data.UserGpa + "</b>&nbsp;<span style='color:#666;'>/ 4.00</span>";
    if (data.UserGpa <= 0.25)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>🤣</span>`;
    else if (data.UserGpa <= 0.5)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>😂</span>`;
    else if (data.UserGpa <= 1.0)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>😭</span>`;
    else if (data.UserGpa <= 1.5)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>😔</span>`;
    else if (data.UserGpa <= 2.0)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>👍</span>`;
    else if (data.UserGpa <= 2.25)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>🙂</span>`;
    else if (data.UserGpa <= 2.25)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>😃</span>`;
    else if (data.UserGpa <= 2.5)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>😮</span>`;
    else if (data.UserGpa <= 3.0)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>🎉</span>`;
    else if (data.UserGpa < 3.5)
        document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>🥇</span>`;
    else
    document.getElementById("p_info_gpa").innerHTML += `<span style='font-size: 18px;float: right;margin-right:10px;'>🤓</span>`;

    document.getElementById("p_info_mail").textContent = data.UserId;
    document.getElementById("p_info_name").textContent = data.UserName;
    document.getElementById("p_info_loc").textContent = data.UserLocation;
    document.getElementById("p_info_sem").textContent = `B${data.UserSemester}   (TEK${data.UserCourse})`;

    document.getElementById("p_info_name").textContent =  data.UserName.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

    user_loc = data.location;
    user_year = data.scolaryear
    fetch_grades();
}).catch(error => {
    console.error("Error:", error);
});

document.getElementById("filter_input").addEventListener("keyup", filterTableNames);
function filterTableNames() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("filter_input");
    filter = input.value.toUpperCase();
    table = document.getElementById("ul_show_subjects");
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

if (window.outerHeight > 800) {
    document.getElementById("nv_overflow_data").style.height = "100vh";
    document.getElementById("subtab_subjectList").style.height = "calc(100vh - 44px)";
    document.getElementById("subtab_subjectList").style.maxHeight = "100vh";
}

var url = new URL(window.location.href);
var url_c = url.searchParams.get("t");
if (url_c) {
    document.getElementById('tab_global').style.display = "none";
    document.getElementById('tab_grades').style.display = "none";
    document.getElementById('tab_hub').style.display = "none";
    document.getElementById('tab_road').style.display = "none";
    document.getElementById(url_c).style.display = "block";
}