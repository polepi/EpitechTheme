var intra_theme = localStorage.getItem("intra_theme");
var intra_theme_colourScheme = localStorage.getItem("intra_colourScheme");

if (!intra_theme) {
    intra_theme = "🌙 Dark Theme";
}

let cooldown = false;
let cooldown_script = false;
function attach_themeScript() {
    if (cooldown_script)
        return;
    cooldown_script = true;

    const url = chrome.runtime.getURL("Themes/" + intra_theme + "/script.js");

    fetch(url)
        .then(response => {
            if (response.ok) {
                const new_script = document.createElement('script');
                new_script.setAttribute("epiTheme-extId", chrome.runtime.id);
                new_script.src = url;
                new_script.defer;
                document.head.appendChild(new_script);
            } else {
                console.log("Script not found:", url);
            }
        })
        .catch(error => {
            if (!error.message.includes('ERR_FILE_NOT_FOUND')) {
                console.error("Attach script error:", error);
            }
        });
}

const observer = new MutationObserver(function (mutations, mutationInstance) {
    const head = document.querySelector('head');
    if (head && intra_theme && intra_theme != "None") {
        if (cooldown)
            return;
        cooldown = true;
        mutationInstance.disconnect();
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL("Themes/" + intra_theme + "/theme.css");
        link.id = 'custom-theme';
        head.appendChild(link);
        
        if (intra_theme_colourScheme && intra_theme_colourScheme != "undefined") {
            const colour_data = JSON.parse(intra_theme_colourScheme);
            for (const [key, value] of Object.entries(colour_data)) {
                document.documentElement.style.setProperty(key, value);
            }
        }
        
        setTimeout(function() {
            attach_themeScript();
        }, 250)
    }

});

observer.observe(document, {
    childList: true,
    subtree: true
});