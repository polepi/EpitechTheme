let tData = {};
var isTrelloSet = false;

function load_trelloData() {
  chrome.storage.local.get("TrelloData", function(data) {
    tData = data["TrelloData"] || {};
    console.log("Trello > ", tData);
    if (tData.apiKey && tData.token && tData.listId) {
      isTrelloSet = true;
      document.getElementById('t_notset_warn').style.display = "none";
      const rows = document.getElementById('t_infoTable').getElementsByTagName('tr');
      for (let i = 0; i < rows.length; i++) {
        rows[i].classList.remove('t_row_hide');
      }
    } else {
      document.getElementById('t_notset_warn').style.display = "inline-block";
    }
    if (tData && tData.mergestart) {
      document.getElementById('t_merge_onstartup').checked = tData.mergestart;
    }
    if (tData && tData.pushstart) {
      document.getElementById('t_pull_onstartup').checked = tData.pushstart;
    }
  });
}

load_trelloData();

function trello_remove_attachment(id) {
  fetch(`https://api.trello.com/1/cards/${id}?attachments=true&key=${tData.apiKey}&token=${tData.token}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(card => {
    const attachmentToDelete = card.attachments.find(attachment => attachment.name === 'Project page');
    if (attachmentToDelete) {
      fetch(`https://api.trello.com/1/cards/${id}/attachments/${attachmentToDelete.id}?key=${tData.apiKey}&token=${tData.token}`, {
        method: 'DELETE'
      })
      .then(deleteResponse => {
        if (!deleteResponse.ok) {
          throw new Error('Error deleting attachment');
        }
      })
      .catch(error => {
        console.error('There was a problem deleting the attachment:', error);
      });
    }
  })
  .catch(error => {
    console.error('There was a problem fetching the card:', error);
  });
}

function trello_set_attributes(id, url) {
  var cardData = {
    name: "Project page",
    url: url
  };
  trello_remove_attachment(id);
  fetch(` https://api.trello.com/1/cards/${id}/attachments?key=${tData.apiKey}&token=${tData.token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cardData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .catch(error => {
    console.error('There was a problem creating the card:', error);
  });
}

function trello_update_card(id, title, iscomp, due, url) {
  if (iscomp == 0) {
    iscomp = false;
  } else {
    iscomp = true;
  }
  due = new Date(due).toISOString();
  var cardData = {
    name: title,
    dueComplete: iscomp,
    due: due,
    idList: tData.listId
  };
  fetch(`https://api.trello.com/1/cards/${id}?key=${tData.apiKey}&token=${tData.token}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cardData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(newCard => {
    trello_set_attributes(newCard.id, url);
    console.log('(~) Updated trello card:', newCard);
  })
  .catch(error => {
    console.error('There was a problem creating the card:', error);
  });
}

function trello_new_card(title, iscomp, due, url) {
    if (iscomp == 0) {
      iscomp = false;
    } else {
      iscomp = true;
    }
    due = new Date(due).toISOString();
    var cardData = {
      name: title,
      dueComplete: iscomp,
      due: due,
      idList: tData.listId
    };
  fetch(`https://api.trello.com/1/cards?key=${tData.apiKey}&token=${tData.token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cardData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(newCard => {
    trello_set_attributes(newCard.id, url);
    console.log('(+) Added new trello card:', newCard);
  })
  .catch(error => {
    console.error('There was a problem creating the card:', error);
  });
}

function export_to_trello() {
  chrome.storage.local.get("TaskListing", function(data) {
    const storedData = data["TaskListing"];
    if (storedData) {
      Object.keys(storedData).forEach(title => {
        fetch(`https://api.trello.com/1/lists/${tData.listId}/cards?key=${tData.apiKey}&token=${tData.token}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(cards => {
          const existingCard = cards.find(card => card.name === title);
          if (existingCard) {
            trello_update_card(existingCard.id, title, storedData[title].c, storedData[title].d, storedData[title].u);
          } else {
            trello_new_card(title, storedData[title].c, storedData[title].d, storedData[title].u);
          }
        })
        .catch(error => {
          console.error('There was a problem checking for existing cards:', error);
        });
      });
    }
    document.getElementById('s_tupload_btn').style.display = "inline-block";
  });
}

function merge_from_trello() {
  chrome.storage.local.get("TaskListing", function(data) {
    let storedData = data["TaskListing"] || {};

    fetch(`https://api.trello.com/1/lists/${tData.listId}/cards?key=${tData.apiKey}&token=${tData.token}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(cards => {
        cards.forEach(card => {
            let iscomp = 0;
            const dateObject = new Date(card.due);
            const epochTime = dateObject.getTime();
            if (card.dueComplete == true) {
              iscomp = 1;
            }
            storedData[card.name] = {
              d: epochTime,
              c: card.dueComplete,
              u: "https://intra.epitech.eu/"
            }
            fetch(`https://api.trello.com/1/cards/${card.id}/attachments?key=${tData.apiKey}&token=${tData.token}`)
            .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(attachments => {
              attachments.forEach(att => {
                if (att.name == "Project page") {
                  storedData[card.name].u = att.url;
                }
              });
            })
        });
        chrome.storage.local.set({"TaskListing": storedData}, function() {
          console.log("(+) Merged data from Trello ", storedData);
          createTaskList();
        });
      })
      .catch(error => {
        console.error('There was a problem fetching the cards:', error);
    });
    document.getElementById('s_tdownload_btn').style.display = "inline-block";
  });
}

function replace_from_trello() {
  let storedData = {};
    fetch(`https://api.trello.com/1/lists/${tData.listId}/cards?key=${tData.apiKey}&token=${tData.token}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(cards => {
        cards.forEach(card => {
            let iscomp = 0;
            const dateObject = new Date(card.due);
            const epochTime = dateObject.getTime();
            if (card.dueComplete == true) {
              iscomp = 1;
            }
            storedData[card.name] = {
              d: epochTime,
              c: card.dueComplete,
              u: "https://intra.epitech.eu/"
            }
            fetch(`https://api.trello.com/1/cards/${card.id}/attachments?key=${tData.apiKey}&token=${tData.token}`)
            .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(attachments => {
              attachments.forEach(att => {
                if (att.name == "Project page") {
                  storedData[card.name].u = att.url;
                }
              });
            })
        });
        chrome.storage.local.set({"TaskListing": storedData}, function() {
          console.log("(+) Merged data from Trello ", storedData);
          createTaskList();
        });
      })
  .catch(error => {
    console.error('There was a problem fetching the cards:', error);
  });
}

function remove_trello_cards() {
  fetch(`https://api.trello.com/1/lists/${tData.listId}/cards?key=${tData.apiKey}&token=${tData.token}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(cards => {
    cards.forEach(card => {
      fetch(`https://api.trello.com/1/cards/${card.id}?key=${tData.apiKey}&token=${tData.token}`, {
        method: 'DELETE'
      })
      .then(deleteResponse => {
        if (!deleteResponse.ok) {
          throw new Error('Error deleting card');
        }
        console.log(`Card with ID ${card.id} deleted.`);
      })
      .catch(error => {
        console.error('There was a problem deleting the card:', error);
      });
    });
  })
  .catch(error => {
    console.error('There was a problem fetching the cards:', error);
  });
}

function saveAPIInput() {
  chrome.storage.local.get("TrelloData", function(data) {
    tData = data["TrelloData"] || {};
    console.log(document.getElementById('t_merge_onstartup').checked, document.getElementById('t_pull_onstartup').checked);
    tData.mergestart = document.getElementById('t_merge_onstartup').checked;
    tData.pushstart = document.getElementById('t_pull_onstartup').checked;
    chrome.storage.local.set({"TrelloData": tData}, function() {
      console.log("(!) Updated", tData);
    });
  });
}

document.getElementById('t_merge_onstartup').addEventListener('change', (event) => {
  saveAPIInput();
});

document.getElementById('t_pull_onstartup').addEventListener('change', (event) => {
  saveAPIInput();
});

function validateAPIInput() {
  const t_trello_apikey = document.getElementById('t_trello_apikey').value;
  const t_trello_token = document.getElementById('t_trello_token').value;
  const t_trello_lisid = document.getElementById('t_trello_lisid').value;

  const t_trello_mergestart = document.getElementById('t_merge_onstartup').value;
  const t_trello_pushstart = document.getElementById('t_pull_onstartup').value;

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
      location.reload();
    });
  }
}

document.getElementById('e_merge_trello').addEventListener('click', () => {
  document.getElementById('e_merge_trello').style.display = "none";
  merge_from_trello();
});

document.getElementById('s_tdownload_btn').addEventListener('click', () => {
  document.getElementById('s_tdownload_btn').style.display = "none";
  merge_from_trello();
});

document.getElementById('e_export_trello').addEventListener('click', () => {
  document.getElementById('e_export_trello').style.display = "none";
  export_to_trello();
});

document.getElementById('s_tupload_btn').addEventListener('click', () => {
  document.getElementById('s_tupload_btn').style.display = "none";
  export_to_trello();
});

document.getElementById('e_removeall_trello').addEventListener('click', () => {
  document.getElementById('e_removeall_trello').style.display = "none";
  remove_trello_cards();
});

document.getElementById('form_trello_config').addEventListener('submit', (event) => {
  event.preventDefault();
  validateAPIInput();
});
