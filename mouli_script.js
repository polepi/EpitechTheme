const api_key = localStorage.getItem('argos-api.oidc-token');
window.onload = function() {
    var loginbtn = document.querySelector("#app-wrapper>.mdl-color-text--primary>a.mdl-js-ripple-effect.mdl-js-button.mdl-button.mdl-button--colored.mdl-button--raised")
    if (loginbtn) {
        console.log("Auto-login..");
        loginbtn.click();
    }
}
chrome.storage.local.set({'shite-key': api_key});