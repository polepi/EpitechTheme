// THEME HANDLING: Colours //

const sel_colours_wrapper = document.getElementById("select_theme_colours");

function themeColours_add(name, theme_name, colours) {
	const new_el = document.createElement("span");

	new_el.addEventListener("click", function() {
		loadTheme(theme_name, colours);
	});

	new_el.textContent = name;
	sel_colours_wrapper.appendChild(new_el);
}

function supports_custom_colours(theme) {
    return new Promise((resolve, reject) => {
        chrome.runtime.getPackageDirectoryEntry(function(root) {
            root.getFile(`Themes/${theme}/colours.json`, {}, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        resolve(this.result);
                    };
                    reader.readAsText(file);
                });
            }, function(error) {
                resolve(false);
            });
        });
    });
}

// THEME HANDLING: Information //

async function loadTheme_info(theme) {
	document.getElementById("tab_themes").style.display = "none";
	document.getElementById("seltab_theme_info").textContent = theme;

	var temp_colours = await supports_custom_colours(theme);
	sel_colours_wrapper.innerHTML = "";
	if (temp_colours) {
		temp_colours = JSON.parse(temp_colours);
		const temp_colour_keys = Object.keys(temp_colours);

		for (let i = 0; i < temp_colour_keys.length; i++) {
			if (temp_colour_keys[i] && temp_colour_keys[i].toLowerCase == 'default') {
				themeColours_add(temp_colour_keys[i], theme, null);
			} else {
				themeColours_add(temp_colour_keys[i], theme, temp_colours[temp_colour_keys[i]]);
			}
		}
	} else {
		themeColours_add("Use Theme", theme, null);
	}

	document.getElementById("seltab_theme").style.display = "block";
}

function loadTheme(fileName, colourScheme) {
	const targetUrl = "https://intra.epitech.eu/";

	if (!colourScheme) {
		colourScheme = "undefined";
	} else {
		colourScheme = JSON.stringify(colourScheme);
	}

	chrome.tabs.query({}, function (tabs) {
		const targetTab = tabs.find((tab) => tab.url.includes(targetUrl));
		if (targetTab) {
			chrome.scripting.executeScript({
				target: { tabId: targetTab.id },
				function: (fileName, colourScheme) => {
					localStorage.setItem("intra_colourScheme", colourScheme);
					localStorage.setItem("intra_theme", fileName);
					location.reload();
				},
				args: [fileName, colourScheme],
			});
		} else {
			chrome.tabs.create({
				url: "https://intra.epitech.eu/",
				active: false,
			});
			setTimeout(function () {
				loadTheme(fileName);
			}, 1000);
		}
	});
}

const official_themes = [
	"🌙 Dark Theme",
	"🌘 Dark Theme (old)",
	"🌤️ Light Theme",
];

// THEME HANDLING: Listing themes //

async function theme_getAuthor(theme) {
	return new Promise((resolve, reject) => {
        chrome.runtime.getPackageDirectoryEntry(function(root) {
            root.getFile(`Themes/${theme}/info.json`, {}, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function() {
						const res = JSON.parse(this.result);
						if (res && res["author_name"] && res["github_author"]) {
							resolve(`<a href='https://github.com/${res["author_name"]}' target="_blank">@${res["author_name"]}</a>`);
						} else if (res && res["author_name"]) {
							resolve(`<a href='#'>@${res["author_name"]}</a>`);
						} else {
							resolve("");
						}
                        
                    };
                    reader.readAsText(file);
                });
            }, function(error) {
                resolve("");
            });
        });
    });
}

async function listThemeFiles() {
    chrome.runtime.getPackageDirectoryEntry(function (root) {
        root.getDirectory(
            "Themes",
            {},
            function (themesDir) {
                var reader = themesDir.createReader();
                reader.readEntries(
                    async function (entries) {
                        var files = entries.filter(function (entry) {
                            return entry.isDirectory;
                        });
                        var fileNames = files.map(function (file) {
                            return file.name;
                        });
                        var themesList = document.getElementById("themes_list");
                        themesList.innerHTML = "";
                        for (let fileName of fileNames) {
                            const div = document.createElement("div");

							div.innerHTML =
                                '<div class="sett_btn"><span class="text">' +
                                fileName +
                                `</span><span style="color:#222;float:right;position: relative;margin-right: 5px;">${await theme_getAuthor(fileName)}</span></div>`;
                            div.addEventListener("click", () => {
                                loadTheme_info(fileName);
                            });
                            themesList.appendChild(div);
                        }
                    },
                    function (error) {
                        console.error("Error reading directory:", error);
                    }
                );
            },
            function (error) {
                console.error("Error accessing Themes/ directory:", error);
            }
        );
    });
}

// EVENTS //

document.getElementById("sett_expand_sett").addEventListener("click", () => {
	document.getElementById("tab_pref").style.display = "block";
	document.getElementById("tab_themes").style.display = "none";
	document.getElementById("tab_btns").style.display = "none";
});

document.getElementById("sett_expand_themes").addEventListener("click", () => {
	document.getElementById("tab_pref").style.display = "none";
	document.getElementById("tab_themes").style.display = "block";
	document.getElementById("tab_btns").style.display = "none";
});

document.getElementById("sett_expand_repo").addEventListener("click", () => {
	window.open("https://github.com/polepi/EpitechTheme/", "_blank");
});

document.getElementById("sett_expand_trello").addEventListener("click", () => {
	window.open("trello.html", '_blank');
});

document.getElementById("themes_btn_goback").addEventListener("click", () => {
	document.getElementById("tab_pref").style.display = "none";
	document.getElementById("tab_themes").style.display = "none";
	document.getElementById("tab_btns").style.display = "block";
});

document.getElementById("themes_btn_goback2").addEventListener("click", () => {
	document.getElementById("tab_pref").style.display = "none";
	document.getElementById("tab_themes").style.display = "none";
	document.getElementById("tab_btns").style.display = "block";
});

document.getElementById("themes_btn_goback3").addEventListener("click", () => {
	document.getElementById("seltab_theme").style.display = "none";
	document.getElementById("tab_themes").style.display = "block";
});

document.getElementById("sett_upload_set_theme").addEventListener("click", () => {
	window.open("https://intra.epitech.eu/pref/?et_pref", "_blank");
});

document.getElementById("sett_expand_doc").addEventListener("click", () => {
	window.open("docs.html", "_blank")
});

// SETTINGS //

chrome.storage.local.get("OnStartUp", function (data) {
	var page = data["OnStartUp"] || "start.html";
	if (page) {
		document.getElementById("sett_startup").value = page;
	}
});

document.getElementById("sett_startup").addEventListener("change", () => {
	const sett_val_startup = document.getElementById("sett_startup").value;
	chrome.storage.local.set({ OnStartUp: sett_val_startup });
});

chrome.storage.local.get("OnAPIFail", function (data) {
	var page = data["OnAPIFail"] || false;
	document.getElementById("sett_force_open").checked = page;
});

document.getElementById("sett_force_open").addEventListener("change", () => {
	const sett_val_startup = document.getElementById("sett_force_open").checked;
	chrome.storage.local.set({ OnAPIFail: sett_val_startup });
});

// CHECK FOR UPDATES //

function checkForUpdates() {
	fetch(
		"https://raw.githubusercontent.com/polepi/EpitechTheme/main/version.txt"
	)
		.then((response) => response.text())
		.then((data) => {
			const latestVersion = data.trim();
			fetch("version.txt")
				.then((response) => response.text())
				.then((data) => {
					const currentVersion = data.trim();
					if (latestVersion !== currentVersion) {
						const div = document.createElement("div");
						div.innerHTML =
							'<a href="https://github.com/polepi/EpitechTheme/archive/refs/heads/main.zip" target="_blank"><div class="update_btn"><span class="text">A newer version has been released</span><span style="right:15px;position:absolute;top: 10px;"><i class="material-icons-outlined">download</i></span></div></a>';
						document.body.appendChild(div);
					}
				})
				.catch((error) =>
					console.error("Error reading local version:", error)
				);
		})
		.catch((error) =>
			console.error("Error fetching latest version:", error)
		);
}

checkForUpdates();
listThemeFiles();
