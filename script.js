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

const articles = document.querySelectorAll('.projet .articles article');
articles.forEach(article => {
    const button = document.createElement('button');
    article.style.position = "relative";
    button.textContent = '';
    button.classList.add('btn_add');
    button.addEventListener('click', add_to_calendar);
    article.appendChild(button);
});
