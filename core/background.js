var storedData = {};
var trello_data = null;
var send_notifs = false;
var header_auth;
var lastTimeChecked = 0;
var currentDate = new Date();
var targ_year = currentDate.getFullYear() - 1;
var themes_list = {};

// --- UTIL FUNCTIONS --- //

function convertToEpoch(dateString) {
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

// --- TASK TRELLO ADD --- //

function create_add_new_trello_url(id, url) {
	const encodedUrl = encodeURIComponent(url); // Encode the URL
	fetch(`https://api.trello.com/1/cards/${id}/attachments?name=Project&url=${encodedUrl}&key=${trello_data.apiKey}&token=${trello_data.token}`, {
		method: 'POST',
		headers: {
			'Accept': 'application/json'
		}})
		.then(response => {
			return response.text();
	})
	.then()
	.catch(err => console.error(err));
}

async function create_add_new_trello_card(id, card_name, card_due, card_url) {
    await fetch(`https://api.trello.com/1/cards?idList=${id}&name=${card_name}&due=${card_due}&desc="Added from the intranet."&key=${trello_data.apiKey}&token=${trello_data.token}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }})
        .then(response => {
            return response.json();
    })
    .then(res => {
        if (card_url && card_url != null && card_url != "" && res && res["id"]) {
			create_add_new_trello_url(res["id"], card_url);
        }
    })
    .catch(err => console.error(err));
}

// --- TASK LOCALSTORAGE --- //

async function load_lists_data(card_name, card_date, card_url, list_card) {
    await chrome.storage.local.get("TodoLists", function(data) {
        data_lists = data["TodoLists"] || {
            "sel": "Todo",
            "list": {
                "list1": {
                    "name": "Todo",
                    "ctime": Date.now(),
                    "ltime": Date.now(),
                    "is_fav": 0,
                    "is_hid": 0,
                    "cards": []
                }
            }
        };
        if (!data_lists["sel"] || !data_lists["list"][data_lists["sel"]]) {
            const temp_list_fix = Object.entries(data_lists["list"]);
            if (temp_list_fix.length > 0) {
                data_lists["sel"] = temp_list_fix[0][0];
            } else {
				console.log("Error: Unable to select a list..\nTry to manually select a new list");
                return "Error: List couldn't be selected";
            }
        }

		var list_selected = data_lists["list"][data_lists["sel"]];

		if (list_card && data_lists["list"][list_card]) {
			list_selected = data_lists["list"][list_card];
		}

		if (!list_selected) {
			console.log("Error: No list found..\nTry to manually select a new list");
			return "Error: No list found!";
		} else if (list_selected["cards"]) {
			// LOCAL LIST //
			list_selected["cards"].push({
				"completed": 0,
				"desc": "Added from the intranet.",
				"due_date": card_date,
				"labels": [],
				"name": card_name,
				"url": card_url,
			});
			chrome.storage.local.set({"TodoLists": data_lists});
		} else if (list_selected["trello_id"]) {
			// TRELLO //
			chrome.storage.local.get("TrelloData", function(data) {
				trello_data = data["TrelloData"] || null;
				if (trello_data == null) {
					console.log("Error: Unable to load Trello API creds..");
					return "Error: Unable to load Trello API creds";
				}
				create_add_new_trello_card(list_selected["trello_id"], card_name, card_date, card_url);
			});
		}
		return true;
    });
}

// --- NEW TASK HANDLING --- //

async function add_to_calendar(title, endDate, link, list) {
	const res = await load_lists_data(title, convertToEpoch(endDate), link, list);
	return;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'addEventToCalendar') {
		const { title, link, endDate, list } = message;
		add_to_calendar(title, endDate, link, list);
		sendResponse(true);
		return true;
	} else if (message.action === 'request_lists') {
		chrome.storage.local.get("TodoLists", function(data) {
			const data_lists = data["TodoLists"] || {
				"sel": "Todo",
				"list": {
					"list1": {
						"name": "Todo",
						"ctime": Date.now(),
						"ltime": Date.now(),
						"is_fav": 0,
						"is_hid": 0,
						"cards": []
					}
				}
			};
			sendResponse(data_lists);
		});
		return true;
	}
	return false;
});

const iframeHosts = [
	'https://my.epitech.eu/*',
];

chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason == "install") {
        window.open("docs.html?t=new", "_blank")
    }
});

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