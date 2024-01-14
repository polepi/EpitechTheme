var userid;

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
    if (evt)
        evt.currentTarget.className += " active";
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

function fetch_mail() {
    const url_mail_json = "https://intra.epitech.eu/user/?format=json";
    
    fetch(url_mail_json)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("1 => ", data.internal_email);
        chrome.storage.local.set({"UserId": data.internal_email}, function() {
            userid = data.internal_email;
            fetch_main();
        });
    })
    .catch(error => {
        console.log(error);
        setTimeout(() => {
            fetch_mail();
        }, 500);
    });
}

chrome.storage.local.get("UserId", function(data) {
    userid = data.UserId;
    if (!userid) {
        fetch_mail();
    } else {
        fetch_main();
    }
});

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

function fetch_grades() {
    document.getElementById('is_grades_loading').style.display = "block";
    const url_grades_json = "https://intra.epitech.eu/user/"+userid+"/notes?format=json";
    const ulElement = document.getElementById('ul_show_subjects');

    fetch(url_grades_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.modules.forEach(module => {
            console.log(module);
            const new_tr_element = document.createElement('tr');
            new_tr_element.innerHTML = "<td><i class='material-icons-outlined' title='Add/Remove favourite'>star_border</i></td><td>"+module.title+"</td><td>"+module.codemodule+"</td><td>"+module.credits+"</td><td class='td_tabl_grade'>"+gradeToText(module.grade)+"</td>";
            new_tr_element.addEventListener('click', () => {
                open_subjectInfo(module, data);
            });
            ulElement.appendChild(new_tr_element);
        });
        
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

function fetch_main() {
    const url_user_json = "https://intra.epitech.eu/user/"+userid+"/?format=json";
    fetch(url_user_json)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("p_info_credits").textContent = data.credits;
        document.getElementById("p_info_gpa").textContent = data.gpa[0].gpa;
        document.getElementById("p_info_mail").textContent = data.internal_email;
        document.getElementById("p_info_name").textContent = data.title;
        document.getElementById("p_info_loc").textContent = data.groups[0].name;
        document.getElementById("p_info_sem").textContent = data.semester_code;
        fetch_grades();
    })
    .catch(error => {
        console.error('Fetch error:', error);
        fetch_main();
    });
}