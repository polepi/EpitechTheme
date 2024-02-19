function add_to_calendar(event) {
    const article = event.target.parentElement;
    const title = article.querySelector('h3').textContent;
    const endDate = article.querySelectorAll('span')[6].textContent;
    const link = article.querySelector('h3 a').href;
    chrome.runtime.sendMessage({
        action: 'addEventToCalendar',
        title: title,
        link: link,
        endDate: endDate},
        (response) => {
            console.log('Response', response);
    });
}

function add_to_calendar2(event) {
    const title = document.querySelector('#project .bloc.top .data .item.title h1').textContent;
    const endDate = document.querySelector('.date_end.bulle').textContent;
    const link = window.location.href;
    chrome.runtime.sendMessage({
        action: 'addEventToCalendar',
        title: title,
        link: link,
        endDate: endDate},
        (response) => {
            console.log('Response', response);
    });
}

const projButtonsContainer = document.querySelector('#project .bloc.top .data .buttons');
    
if (projButtonsContainer) {
    const button = document.createElement('div');
    button.classList.add('btn_add2');
    button.textContent = "";
    button.addEventListener('click', add_to_calendar2);
    projButtonsContainer.appendChild(button);
} else {
    console.log("No matching container found.");
}

const articles = document.querySelectorAll('.projet .articles article');
articles.forEach(article => {
    const button = document.createElement('button');
    article.style.position = "relative";
    button.textContent = '';
    button.classList.add('btn_add');
    button.addEventListener('click', add_to_calendar);
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