//document.getElementById("themes_list").innerHTML = "Open the extension folder at:<br><span class='code_span'>C:/Users/[user_name]/AppData/Local/Google/Chrome/User Data/Default/Extensions/"+chrome.runtime.id+"</span><br>and replace it with your own <span class='code_span'>CSS</span> named <span class='code_span'>theme.css</span>";

document.getElementById("sett_upload_set_theme").addEventListener('click', () => {
  window.open('https://intra.epitech.eu/pref/?et_pref', '_blank');
});

function loadTheme(fileName) {
  const targetUrl = 'https://intra.epitech.eu/';

  chrome.tabs.query({}, function(tabs) {
    const targetTab = tabs.find(tab => tab.url.includes(targetUrl));
    if (targetTab) {
      chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        function: (fileName) => {
          localStorage.setItem("intra_theme", fileName);
          location.reload();
        },
        args: [fileName]
      });
    } else {
      chrome.tabs.create({url: "https://intra.epitech.eu/", active: false});
      setTimeout(function() {
        loadTheme(fileName);
      }, 1000);
    }
  });
}

function listThemeFiles() {
    chrome.runtime.getPackageDirectoryEntry(function(root) {
      root.getDirectory('Themes', {}, function(themesDir) {
        var reader = themesDir.createReader();
        reader.readEntries(function(entries) {
            var files = entries.filter(function(entry) {
              return entry.isDirectory;
            });
            var fileNames = files.map(function(file) {
              return file.name;
            });
            var themesList = document.getElementById('themes_list');
            themesList.innerHTML = "";
            fileNames.forEach(function(fileName) {
                const div = document.createElement('div');
                div.innerHTML = '<div class="sett_btn"><span class="text">'+fileName+'</span><span style="color:#222;float:right;margin-right: 5px;">@polepi</span></div>';
                div.addEventListener('click', () => {
                    loadTheme(fileName);
                });
                themesList.appendChild(div);
            });
          }, function(error) {
          console.error("Error reading directory:", error);
        });
      }, function(error) {
        console.error("Error accessing Themes/ directory:", error);
      });
    });
}

document.getElementById("sett_expand_sett").addEventListener('click', () => {
  document.getElementById("tab_pref").style.display = "block";
  document.getElementById("subtab_trello").style.display = "none";
  document.getElementById("tab_btns").style.display = "none";
});

document.getElementById("sett_expand_repo").addEventListener('click', () => {
  window.open("https://github.com/polepi/EpitechTheme/", '_blank');
});

document.getElementById("sett_expand_trello").addEventListener('click', () => {
  document.getElementById("tab_pref").style.display = "none";
  document.getElementById("subtab_trello").style.display = "block";
  document.getElementById("tab_btns").style.display = "none";
});

document.getElementById("themes_btn_goback").addEventListener('click', () => {
  document.getElementById("tab_pref").style.display = "none";
  document.getElementById("subtab_trello").style.display = "none";
  document.getElementById("tab_btns").style.display = "block";
});

document.getElementById("themes_btn_goback2").addEventListener('click', () => {
  document.getElementById("tab_pref").style.display = "none";
  document.getElementById("subtab_trello").style.display = "none";
  document.getElementById("tab_btns").style.display = "block";
});

listThemeFiles();