var showtypes = {
    "Review": true,
    "BTTF": true,
    "Mini-project": true,
    "Stumper": true,
    "Project": true,
    "Kick-off": true,
    "Bootstrap": true,
    "Follow-up": true,
    "Meetup": false,
    "Workshop": false,
    "Accompagnement": true,
}
var show_hub_proj = 0;
var reg_only = 0;
var show_next_days = 14;

function fetch_timeline() {
  const timeline = document.getElementById('timeline_holder');
  const daysContainer = document.getElementById('timeline_holder');
  timeline.innerHTML = "";
  const today = new Date();
  const next15Days = new Date(today);
  next15Days.setDate(today.getDate() + (show_next_days + 1));

  const startDate = today.toISOString().split('T')[0];
  const endDate = next15Days.toISOString().split('T')[0];

  let currentDate = new Date(today);
  while (currentDate <= next15Days) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day_line';
    const left = ((currentDate - today) / (next15Days - today)) * 100;
    dayElement.style.left = `${left}%`;
    daysContainer.appendChild(dayElement);
    currentDate.setDate(currentDate.getDate() + 1);
    dayElement.title = `In ${Math.floor((currentDate - today) / 86400000) - 1} day(s)`;
  }

  fetch(`https://intra.epitech.eu/module/board/?format=json&start=${startDate}&end=${endDate}`)
    .then(response => response.json())
    .then(data => {
      const eventsByModule = {};

      data.forEach(event => {
        if (!eventsByModule[event.title_module]) {
          eventsByModule[event.title_module] = [];
          const new_elsubject = document.createElement('div');
          const new_elsubject2 = document.createElement('div');
          new_elsubject2.className = 'subjectheader';
          new_elsubject.className = 'timeline_subject';
          new_elsubject.id = `subjecttime_${event.title_module}`;
          new_elsubject2.textContent = event.title_module;
          new_elsubject.appendChild(new_elsubject2);
          new_elsubject.innerHTML += `<div class="tl_sub_holder"></div>`;
          timeline.appendChild(new_elsubject);
          
        }
        eventsByModule[event.title_module].push(event);
      });

      const conflict = (event1, event2) => {
        const beginDate1 = new Date(event1.begin_acti);
        const endDate1 = new Date(event1.end_acti);
        const beginDate2 = new Date(event2.begin_acti);
        const endDate2 = new Date(event2.end_acti);
        
        return (beginDate1 < endDate2 && endDate1 > beginDate2);
      };
      
      let top = 10;
      Object.values(eventsByModule).forEach(events => {
        events.sort((a, b) => new Date(a.begin_acti) - new Date(b.begin_acti));
        events.forEach((event, index) => {
          if (!document.getElementById(`tl_event_${event.title_module}_${event.acti_title}`) && (event.registered == 1 || reg_only == 0)
      && ((showtypes[event.type_acti] && showtypes[event.type_acti] == true && event.title_module != "B0 - Hub")) || show_hub_proj == 1) {
              const eventElement = document.createElement('div');
              eventElement.className = 'timeline_event';
              var beginDate = new Date(event.begin_acti);
              var endDate = new Date(event.end_acti);
              if (["Kick-off", "Bootstrap", "Follow-up"].includes(event.type_acti)) {
                beginDate = new Date(event.begin_event);
                endDate = new Date(event.end_event);
                eventElement.style.backgroundColor = "#dbc1c1";
              }
  
              let left = ((beginDate - today) / (next15Days - today)) * 100;
              let width = ((endDate - beginDate) / (next15Days - today)) * 100;

              if (left < 0) left = 0;
              if (width > 100) width = 100;
              
              for (let i = 0; i < index; i++) {
              const prevEvent = events[i];
              if (conflict(prevEvent, event)) {
                  top += 50;
                  break;
              }
              }
              eventElement.id = `tl_event_${event.title_module}_${event.acti_title}`;
              eventElement.style.marginLeft = `${left}%`;
              eventElement.style.width = `${width}%`;
              eventElement.innerHTML = `${event.acti_title}`;
              eventElement.title = `${event.acti_title}\nStarts at ${beginDate}\nEnds at ${endDate}`;
              eventElement.addEventListener('click', function() {
                window.open(`https://intra.epitech.eu/module/${event.scolaryear}/${event.codemodule}/${event.codeinstance}/${event.codeacti}`, '_blank');
              });
              document.getElementById(`subjecttime_${event.title_module}`).querySelector(`.tl_sub_holder`).appendChild(eventElement);
              document.getElementById(`subjecttime_${event.title_module}`).style.display = "block";
              if (event.registered == 1)
                  eventElement.style.borderColor = "rgb(45, 54, 110)";
          }
        });
      });
    })
    .catch(error => console.error('Error fetching data:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    fetch_timeline();
});
  
document.getElementById("is_grades_loading").style.display = "none";

document.getElementById("btn_show_reg").addEventListener("click", function () {
  if (reg_only == 1) {
    reg_only = 0;
    document.getElementById("icon_visibility").textContent = "visibility";
  } else {
    reg_only = 1;
    document.getElementById("icon_visibility").textContent = "visibility_off";
  }
  fetch_timeline();
});

document.getElementById("list_settings_btn").addEventListener("click", function () {
  if (show_hub_proj == 1) {
    show_hub_proj = 0;
    document.getElementById("txt_show_all").textContent = "Show all";
    document.getElementById("icon_show_all").textContent = "layers";
  } else {
    show_hub_proj = 1;
    document.getElementById("txt_show_all").textContent = "Projects only";
    document.getElementById("icon_show_all").textContent = "layers_clear";
  }
  fetch_timeline();
});

document.getElementById("go_full_screen").addEventListener("click", function () {
    window.open("timeline.html", "_blank");
});

document.getElementById("btn_goto_schedule").addEventListener("click", function () {
    window.location = "events.html";
});

document.getElementById("btn_goto_calendar").addEventListener("click", function () {
    window.location = "calendar.html";
});

document.getElementById("btn_goto_timeline").addEventListener("click", function () {
    window.location = "timeline.html";
});

document.getElementById('select_val_days').addEventListener('change', function() {
  show_next_days = parseInt(this.value);
  fetch_timeline();
});

if (window.outerHeight > 800) {
    document.getElementById("go_full_screen").style.display = "none";
}
