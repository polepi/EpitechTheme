var storedData = {};

function convertToEpoch(dateString) {
    const dateParts = dateString.split(/[ ,\/:]+/);
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    const hours = parseInt(dateParts[3], 10);
    const minutes = parseInt(dateParts[4], 10);
    const dateObject = new Date(year, month, day, hours, minutes);
    const epochTime = dateObject.getTime();
    return epochTime;
}

function add_to_calendar(title, endDate, link) {
    chrome.storage.local.get("TaskListing", function(data) {
        let storedData = data["TaskListing"] || {};

        storedData[title] = {
            d: convertToEpoch(endDate),
            u: link
          };

        chrome.storage.local.set({ "TaskListing": storedData }, function() {
            console.log("Data stored in local storage");
        });
    });
}

console.log('background.js running');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'addEventToCalendar') {
        const { title, link, endDate } = message;
        add_to_calendar(title, endDate, link);
        sendResponse(true);
        return true;
    }
    return false;
});