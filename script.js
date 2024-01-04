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

