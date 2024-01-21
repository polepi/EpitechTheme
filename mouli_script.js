const api_key = localStorage.getItem('argos-api.oidc-token');
if (api_key)
    chrome.storage.local.set({'shite-key': api_key});

function update_login() {
    var loginbtn = document.querySelector("#app-wrapper>.mdl-color-text--primary>a.mdl-js-ripple-effect.mdl-js-button.mdl-button.mdl-button--colored.mdl-button--raised")
    if (loginbtn) {
        loginbtn.click();
    }
}

window.onload = function() {
    update_login();
}

setTimeout(function(){
    update_login()
}, 500);