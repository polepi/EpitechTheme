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
    new_btn.addEventListener("click", function() {
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
    listRendering.style.top = (pos_top + 45)+"px";
    listRendering.style.left = pos_left+"px";

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
        endDate: endDate},
        (response) => {
            if (response == true) {
                const newchild = document.createElement("div");
                newchild.style = "line-height:18px;border-radius: 3px;z-index: 100000;position:fixed;top:10px;right:10px;background-color:#222;color:#f1f1f1;border:1px solid #111;padding: 8px 6px;";
                newchild.innerHTML = "<span style='display:inline-block;margin-right:5px;font-size:16px;'>✨</span><span style='display:inline-block;'>Added <b>"+title+"</b> to <b>My Projects</b></span>";
                document.body.appendChild(newchild);
                setTimeout(function(){newchild.remove();},5000);
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
        endDate: endDate},
        (response) => {
            if (response == true) {
                const newchild = document.createElement("div");
                newchild.style = "line-height:18px;border-radius: 3px;z-index: 100000;position:fixed;top:10px;right:10px;background-color:#222;color:#f1f1f1;border:1px solid #111;padding: 8px 6px;";
                newchild.innerHTML = "<span style='display:inline-block;margin-right:5px;font-size:16px;'>✨</span><span style='display:inline-block;'>Added <b>"+title+"</b> to <b>My Projects</b></span>";
                document.body.appendChild(newchild);
                setTimeout(function(){newchild.remove();},5000);
            }
    });
}

const projButtonsContainer = document.querySelector('#project .bloc.top .data .buttons');

if (projButtonsContainer) {
    const button = document.createElement('div');
    button.classList.add('btn_add2');
    button.title = "Add this project to an EpiTheme Todo";
    button.textContent = "";
    button.addEventListener('click', function() {
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
    button.addEventListener('click', function(event) {
        render_list_div(button, add_to_calendar, article);
    });
    article.appendChild(button);
});

const spanElement2 = document.querySelector('.item.message.pedagogic span');
if (spanElement2) {
    console.log(spanElement2.textContent)
    if (spanElement2.textContent == "Unit in progress")
        spanElement2.innerHTML = "<span class='traffic_orange'></span><span style='margin-left:18px;'>"+ spanElement2.textContent+"</span>";
    if (spanElement2.textContent == "Unit acquired with grade Acquis.")
        spanElement2.innerHTML = "<span class='traffic_green'></span><span style='margin-left:18px;'>Unit passed</span>";
    if (spanElement2.textContent.includes("Unit acquired with grade "))
        spanElement2.innerHTML = "<span class='traffic_green'></span><span style='margin-left:18px;'>Grade <b>"+spanElement2.textContent.replace('Unit acquired with grade ','')+"</b></span>";
}

const spanElement = document.querySelector('div.nbcredits span');
if (spanElement) {
    var originalText = spanElement.textContent;
    originalText = originalText.replace('(','');
    originalText = originalText.replace(' credit(s)s)','');
    originalText = originalText.replace(' credit(s))','');
    if (Number(originalText) == 0)
        spanElement.textContent = "No credits";
    else if (Number(originalText) == 1)
        spanElement.textContent = originalText + "credit";
    else if (Number(originalText) > 1)
        spanElement.textContent = originalText + " credits";
}

function changeLanguage(ev) {
    document.cookie='language='+this.value;
}

let url_params = new URLSearchParams(document.location.search);
if (url_params.has("et_pref")) {
    const div = document.createElement("div");
    div.classList.add("et_modalBackground");
    div.innerHTML = "<div class='et_modalContent'><h3>Language</h3><div class='et_sett_cont'><select style='display:block;width:100%;' id='et_changeLang'><option value='en'>English</option><option value='fr'>French</option></select></div></div>";
    document.body.appendChild(div);

    document.getElementById("et_changeLang").addEventListener("change", function(ev) {
        document.cookie="language="+ev.target.value+";Expire=100;path=/";
        console.log("Language changed", ev.target.value);
    });

    document.getElementById("et_changeLang").value = document.cookie
    .split("; ")
    .find((row) => row.startsWith("language="))
    ?.split("=")[1];
}
