document.querySelectorAll("#sidebar_content > span").forEach(el => {
    el.addEventListener("click", () => {
        document.querySelector("#sidebar_content > span.active").classList.remove("active");
        document.querySelector(".modal-content > div.tab_content.active").classList.remove("active");

        el.classList.add("active");
        document.querySelector(`.modal-content > div[name=${el.getAttribute("name")}].tab_content`).classList.add("active");
    });
});

let url_params = new URLSearchParams(document.location.search);
if (url_params.has("t")) {
    const el = document.querySelector(`#sidebar_content > span[name=${url_params.get("t")}]`);
    if (el) {
        document.querySelector("#sidebar_content > span.active").classList.remove("active");
        document.querySelector(".modal-content > div.tab_content.active").classList.remove("active");
        el.classList.add("active");
        document.querySelector(`.modal-content > div[name=${el.getAttribute("name")}].tab_content`).classList.add("active");
    }
    
}

document.querySelectorAll(".ext_id").forEach(el => {
    el.textContent = chrome.runtime.id;
});