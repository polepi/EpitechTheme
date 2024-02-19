var intra_theme = localStorage.getItem("intra_theme");
if (!intra_theme) {
    intra_theme = "🌙 Dark Theme";
}

const observer = new MutationObserver(function (mutations, mutationInstance) {
    const head = document.querySelector('head');
    if (head) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL("Themes/"+ intra_theme +"/theme.css");
        link.id = 'custom-theme';
        head.appendChild(link);
        mutationInstance.disconnect();
    }
});

observer.observe(document, {
    childList: true,
    subtree:   true
});