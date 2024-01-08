let tData = {};

function validateAPIInput() {
  const t_trello_apikey = document.getElementById('t_trello_apikey').value;
  const t_trello_token = document.getElementById('t_trello_token').value;
  const t_trello_lisid = document.getElementById('t_trello_lisid').value;

  const t_trello_mergestart = false;
  const t_trello_pushstart = false;

  if (t_trello_apikey && t_trello_token && t_trello_lisid) {
    document.getElementById('e_save_trello').style.display = "none";
    tData = {
      apiKey: t_trello_apikey,
      token: t_trello_token,
      listId: t_trello_lisid,
      mergestart: t_trello_mergestart,
      pushstart: t_trello_pushstart
    };
    chrome.storage.local.set({"TrelloData": tData}, function() {
      window.close();
    });
  }
}

document.getElementById('form_trello_config').addEventListener('submit', (event) => {
  event.preventDefault();
  validateAPIInput();
});
