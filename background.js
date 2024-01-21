var storedData = {};
var send_notifs = false;
var header_auth;
var lastTimeChecked = 0;
var currentDate = new Date();
var targ_year = currentDate.getFullYear() - 1;

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

// SHITE CHECKING //

function set_check_interval() {
    setInterval(function() {
        if (send_notifs && header_auth) {
            //requestLogIn();
            send_shite_request();
        }
    }, 60000);
}

chrome.storage.local.get("SendNotifs", function(data) {
    currentDate = new Date();
    send_notifs = data["SendNotifs"] || true;

    chrome.storage.local.get("LastTimeNotifs", function(data) {
        lastTimeChecked = data["LastTimeNotifs"] || Date.now();

        chrome.storage.local.get('curr_year', function(data) {
            targ_year = data["curr_year"];
            if (targ_year == null) {
                targ_year = currentDate.getFullYear() - 1;
            }

            chrome.storage.local.get('shite-key', function(data) {
                header_auth = data["shite-key"];
                header_auth = header_auth.substring(1, header_auth.length - 1);
                set_check_interval();
            });
        });
    });    
});

function send_notification(proj_name) {
    chrome.notifications.create('EpiTheme_Shite', {
        type: 'basic',
        iconUrl: 'icons/ico32.png',
        title: 'EpiTheme',
        message: 'Hey! Sorry to bother you, but a new moulinette correction for `'+proj_name+'` is out.',
        priority: 2,
        buttons: [
            {title: 'Details'},
            {title: 'Shush'}
        ]
    });
}

function requestLogIn() {
    fetch('https://login.microsoftonline.com/common/oauth2/authorize?client_id=c3728513-e7f6-497b-b319-619aa86f5b50&nonce=6331191b-0d47-4293-b2ad-b5b064bd2a3a&redirect_uri=https%3A%2F%2Fmy.epitech.eu%2Findex.html&response_type=id_token&state=', {
        method: 'GET',
        headers: {}
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function send_shite_request() {
    fetch('https://api.epitest.eu/me/'+targ_year, {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en;q=0.9',
            'Authorization': `Bearer ${header_auth}`,
            'Connection': 'keep-alive',
            'DNT': '1',
            'Host': 'api.epitest.eu',
            'Origin': 'https://my.epitech.eu',
            'Referer': 'https://my.epitech.eu/'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.forEach((item) => {
            var dateObject = new Date(item["date"]);
            var lastObject = new Date(lastTimeChecked);
            if (lastObject <= dateObject) {
                send_notification(item["project"]["name"]);
                lastTimeChecked = Date.now();
                chrome.storage.local.set({"LastTimeNotifs": Date.now()});
                return;
            }
        });
    })
    .catch(error => {});
}

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'EpiTheme_Shite') {
        if (buttonIndex === 0) {
            chrome.tabs.create({url: 'shite.html'});
        } else if (buttonIndex === 1) {
            chrome.storage.local.set({"SendNotifs": false});
        }
    }
});