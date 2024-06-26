var storedData = {};
var send_notifs = false;
var header_auth;
var lastTimeChecked = 0;
var currentDate = new Date();
var targ_year = currentDate.getFullYear() - 1;
var themes_list = {};

function convertToEpoch(dateString) {
    console.log("The date is:", dateString);
    const dateParts = dateString.split(/[ ,\/:-]+/);
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
            u: link,
            c: 0,
            desc: "No description set.",
            label: {}
        };
        chrome.storage.local.set({ "TaskListing": storedData }, function() {
            console.log("Data stored in local storage");
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'addEventToCalendar') {
        const { title, link, endDate } = message;
        add_to_calendar(title, endDate, link);
        sendResponse(true);
        return true;
    }
    return false;
});

const iframeHosts = [
    'https://my.epitech.eu/*',
];

/*
chrome.runtime.onInstalled.addListener(() => {
    const RULE = {
      id: 1,
      condition: {
        initiatorDomains: [chrome.runtime.id],
        requestDomains: iframeHosts,
        resourceTypes: ['sub_frame'],
      },
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          {header: 'X-Frame-Options', operation: 'remove'},
          {header: 'Frame-Options', operation: 'remove'},
        ],
      },
    };
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE.id],
      addRules: [RULE],
    });
  });
  */