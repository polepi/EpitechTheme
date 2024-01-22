document.getElementById("themes_list").innerHTML = "Open the extension folder at:<br><span class='code_span'>C:/Users/[user_name]/AppData/Local/Google/Chrome/User Data/Default/Extensions/"+chrome.runtime.id+"</span><br>and replace it with your own <span class='code_span'>CSS</span> named <span class='code_span'>theme.css</span>";

document.getElementById("sett_upload_set_theme").addEventListener('click', () => {
    document.getElementById("subtab_theme").style.display = "none";
    document.getElementById("subtab_themes").style.display = "block";
});

document.getElementById("themes_btn_goback").addEventListener('click', () => {
    document.getElementById("subtab_theme").style.display = "block";
    document.getElementById("subtab_themes").style.display = "none";
});
