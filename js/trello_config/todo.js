let trello_data = {};
const table_boards = document.getElementById("trello_list_id").querySelector("table");
const table_lists = document.getElementById("trello_list_id").querySelector("table");
const table_cards = document.getElementById("trello_list_id").querySelector("table");


async function trello_load_lists(board_id) {
    table_boards.parentNode.style.display = "none";

    const req = await fetch(`https://api.trello.com/1/boards/${board_id}/lists?key=${trello_data.apiKey}&token=${trello_data.token}`)
    const res = await req.json();

    table_cards.innerHTML = "";

    const new_tr = document.createElement("tr");
    new_tr.innerHTML = `<td>⬅️ | Select a list</td>`;
    new_tr.style.border = "1px solid #555";
    new_tr.addEventListener("click", function() {
        trello_load_boards();
    });
    table_lists.appendChild(new_tr);

    res.forEach(element => {
        const new_tr = document.createElement("tr");
        new_tr.addEventListener("click", function() {
            document.getElementById("t_trello_lisid").value = element.id;
            document.getElementById("modal_show_trello_list").style.display = "none";
        });
        new_tr.innerHTML = `<td>🗂️ ${element.name}</td><td style="text-align:right;"><a style="color:#222;" href="${element.shortUrl}"><span style="font-size:14px;" class="material-icons-outlined">open_in_new</span></a></td>`;
        table_lists.appendChild(new_tr);
    });

    table_lists.parentNode.style.display = "block";
}

async function trello_load_boards() {
    try {
        const req = await fetch(`https://api.trello.com/1/members/me/boards?key=${trello_data.apiKey}&token=${trello_data.token}`);
        if (!req.ok) {
            if (req.status == 401)
                alert(`401 Invalid credentials\nEither the API Key or/and Token is/are invalid.`);
            else
                alert(`HTTP error: ${req.status}`);
            document.getElementById("modal_show_trello_list").style.display = "none";
            throw new Error(`HTTP error: ${req.status}`);
        }
        const res = await req.json();
        table_lists.innerHTML = "";

        const new_tr = document.createElement("tr");
        new_tr.innerHTML = `<td>⬅️ | Select a board</td>`;
        new_tr.style.border = "1px solid #555";
        new_tr.addEventListener("click", function() {
            document.getElementById("modal_show_trello_list").style.display = "none";
        });
        table_lists.appendChild(new_tr);

        res.forEach(element => {
            const new_tr = document.createElement("tr");
            new_tr.addEventListener("click", function() {
                trello_load_lists(element.id);
            });
            new_tr.innerHTML = `<td>🗃️ ${element.name}</td><td style="text-align:right;"><a style="color:#222;" href="${element.shortUrl}"><span style="font-size:14px;" class="material-icons-outlined">open_in_new</span></a></td>`;
            table_boards.appendChild(new_tr);
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// LOAD TRELLO DATA //

document.getElementById("u_easy_select").addEventListener("click", function() {
    if (document.getElementById("t_trello_apikey").value != "" && document.getElementById("t_trello_token").value) { 
        trello_data["apiKey"] = document.getElementById("t_trello_apikey").value;
        trello_data["token"] = document.getElementById("t_trello_token").value;
        document.getElementById("modal_show_trello_list").style.display = "block";
        trello_load_boards();
    } else {
        alert("You need to set the Token and Key first!");
    }
});

function updt_select_view() {
    if (document.getElementById("t_trello_apikey").value.length < 10 ||
    document.getElementById("t_trello_token").value.length < 10) {
        document.getElementById("u_easy_select").style.display = "none";
    } else {
        document.getElementById("u_easy_select").style.display = "block";
    }
}

chrome.storage.local.get("TrelloData", function(data) {
    document.getElementById("t_trello_apikey").value = data["TrelloData"]["apiKey"];
    document.getElementById("t_trello_token").value = data["TrelloData"]["token"];
    document.getElementById("t_trello_lisid").value = data["TrelloData"]["listId"];
    updt_select_view();
});

document.getElementById("t_trello_apikey").addEventListener("keydown", function() {
    updt_select_view();
});
document.getElementById("t_trello_token").addEventListener("keydown", function() {
    updt_select_view();
});