var intra_theme = localStorage.getItem("intra_theme");
var intra_theme_colourScheme = localStorage.getItem("intra_colourScheme");

if (!intra_theme) {
    intra_theme = "🌙 Dark Theme";
}

const observer = new MutationObserver(function (mutations, mutationInstance) {
    const head = document.querySelector('head');
    if (head && intra_theme && intra_theme != "None") {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL("Themes/"+ intra_theme +"/theme.css");
        link.id = 'custom-theme';
        head.appendChild(link);

        if (intra_theme_colourScheme && intra_theme_colourScheme != "undefined") {
            const colour_data = JSON.parse(intra_theme_colourScheme);
            for (const [key, value] of Object.entries(colour_data)) { 
                document.documentElement.style.setProperty(key, value);
            }
        }

        mutationInstance.disconnect();
    }
});

observer.observe(document, {
    childList: true,
    subtree:   true
});