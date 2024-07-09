chrome.storage.local.get("OnStartUp", function(data) {
    var page = data["OnStartUp"] || "start.html";
    if (page) {
        window.location = page;
    }
});