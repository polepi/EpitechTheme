const api_key = localStorage.getItem('argos-api.oidc-token');
if (api_key)
    chrome.storage.local.set({'shite-key': api_key});
setTimeout(function(){
    var loginbtn = document.querySelector("#app-wrapper>.mdl-color-text--primary>a.mdl-js-ripple-effect.mdl-js-button.mdl-button.mdl-button--colored.mdl-button--raised")
    if (loginbtn) {
        console.log("Auto-login..");
        loginbtn.click();
    } else {
        console.log("Not found");
    }
}, 1000);
