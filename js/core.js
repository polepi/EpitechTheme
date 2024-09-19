var userData_cache = null;

chrome.storage.session.get("userData", function(data) {
    userData_cache = data["userData"] || null;
});

var has_user_warned_ddos = 0;
function pass_ddos() {
    if (has_user_warned_ddos)
        return;
    chrome.storage.local.get("OnAPIFail", function(data) {
        var page = data["OnAPIFail"] || false;
        if (page && page == true) {
            chrome.tabs.create({ url: "https://intra.epitech.eu/" });
        }
    });
    has_user_warned_ddos = true;
    var warn_div = document.createElement('div');
    warn_div.setAttribute("id", "t_failedlogin_warn")
    warn_div.style = "position:absolute;top:120px;padding: 6px 10px;background-color: #f1f1f1;border:1px solid #ccc;border-radius:3px;color: #333;font-size:14px;"
    var warn_btns = document.createElement('p');

    var warn_notice = document.createElement('div');
    warn_notice.innerHTML = `<span style="display: block;font-size:16px;padding:8px 10px;border-bottom:1px solid #ccc;margin-bottom:6px;" class="noselect">😭&nbsp;&nbsp;Unable to connect</span>
    <span>We are experiencing issues while trying to reach the Intranet API: The intranet might be down, or you might be logged out!<br><br>
    <span style="padding:8px 10px;background-color:#ddd;border-radius:3px;"><span style='font-size: 19px;margin-top: 0px;' class='material-icons-outlined'>info</span>&nbsp;<b>Possible fix:</b> Log into the intranet and try again!</span></span><br><br>`

    var warn_btn_intra = document.createElement('a');
    warn_btn_intra.target = "_blank";
    warn_btn_intra.href = "https://intra.epitech.eu/";
    warn_btn_intra.style = "padding: 6px 8px;border-radius:3px;background-color:#2d366e;cursor:pointer;color:#f1f1f1;text-decoration:none;";
    warn_btn_intra.innerHTML = `<span style='font-size: 18px;margin-top: 0px;' class='material-icons'>open_in_new</span>&nbsp;&nbsp;Open intranet`;

    var warn_btn_diss = document.createElement('span');
    warn_btn_diss.style = "margin-left:5px;padding: 6px 8px;border-radius:3px;background-color:#ddd;cursor:pointer;color:#333;text-decoration:none;";
    warn_btn_diss.innerHTML = `<span style='font-size: 18px;margin-top: 0px;' class='material-icons'>close</span>&nbsp;&nbsp;Dismiss`;
    warn_btn_diss.addEventListener('click', () => {
        warn_div.style.display = "none";
    });

    warn_btns.appendChild(warn_btn_intra);
    warn_btns.appendChild(warn_btn_diss);
    warn_div.appendChild(warn_notice);
    warn_div.appendChild(warn_btns);
    document.body.appendChild(warn_div);
}

async function userData_fetch() {
    const url = "https://intra.epitech.eu/user/?format=json";

    if (userData_cache !== null) {
        console.log("userData_cache");
        return userData_cache;
    }
    console.log("Getting data..")
    
    return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let returnData = {
            "UserId": data.internal_email,
            "UserName": data.title,
            "UserPicture": data.picture,
            "UserYear": data.scolaryear,
            "UserPromotion": data.promo,
            "UserLocation": data.location,
            "UserSemester": data.semester,
            "UserCredits": data.credits,
            "UserGpa": data.gpa[0].gpa || 0,
            "UserCourse": data.studentyear
        };
        //chrome.storage.session.set({userData: returnData});
        userData_cache = returnData;
        return returnData;
    })
    .catch(error => {
        console.log("Core Error:",error);
        if (error.message.includes('HTTP error: 503')) {
            pass_ddos();
        }
    });
}

export async function userData_get() {
    return await userData_fetch();
}