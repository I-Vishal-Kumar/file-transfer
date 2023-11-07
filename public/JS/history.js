function select(element) {
  return document.querySelector(element);
}
function selectAll(element) {
  return document.querySelector(element);
}

// getting this user data
let file_type = {
  music: '<ion-icon name="musical-notes-outline"></ion-icon>',
  video: '<ion-icon name="videocam-outline"></ion-icon>',
  image: '<ion-icon name="image-outline"></ion-icon>',
  text: '<ion-icon name="document-text-outline"></ion-icon>',
  other: '<ion-icon name="document-outline"></ion-icon>',
};

let popup_tip = document.querySelector("#popup_tip");
let popup_page = document.querySelector("#popup_page");

let cards_data = [];

async function get_data() {
  let data = await fetch("/user_history_data");
  data = await data.json();

  let parent = document.querySelector(".contents");

  if (data["status"] === 1) {
    data["data"].forEach((element) => {
      let data_obj = {
        name: element.file_name,
        time: element.time,
        type: element.type,
        date: element.date,
        size: element.size,
        item_id: element.item_id,
      };
      cards_data.push(data_obj);
      parent.insertAdjacentHTML(
        "beforeend",
        `<div class="cards"><div>${
          file_type[data_obj["type"]]
        }</div><div class="history_file_description"><h5>${
          data_obj["name"].slice(0, 15) + "..."
        }</h5><div class="card_description"><h6>${
          data_obj["date"]
        }</h6><div>l</div><h6>${
          data_obj["time"]
        }</h6></div></div><div class="history_delete_btn"></div><div><h6>${
          data_obj["size"]
        } Mb</h6></div></div>`
      );
    });
    set_listeners();
  } else {
    window.location.href = window.location.origin + "/login";
  }
}
get_data();

function set_listeners() {
  document.querySelectorAll(".history_delete_btn").forEach((item, i) => {
    item.addEventListener("click", async () => {
      let config = {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ item_id: cards_data[i].item_id }),
      };
      let res = await fetch("/delete_history", config);
      res = await res.json();

      if (res["status"] === 1) {
        popup_tip.innerText = "deleted , refresh";
        return;
      } else {
        popup_tip.innerText = res["status"];
        return;
      }
    });
  });
}

(function () {
  let current_mode = window.localStorage.getItem("mode");
  if (current_mode === "light") {
    select("#sun > svg").classList.add("light_mode_sun");
    select("#moon > svg").classList.add("light_mode_moon");
    select("html").setAttribute("data-theme", "light_mode");
  } else {
    select("#sun > svg").classList.add("dark_mode_sun");
    select("#moon > svg").classList.add("dark_mode_moon");
    select("html").setAttribute("data-theme", "dark_mode");
  }

  select("#d_l_mode_toggle_box").addEventListener("click", () => {
    if (typeof window.localStorage.getItem("mode") !== "undefined") {
      if (window.localStorage.getItem("mode") === "light") {
        window.localStorage.setItem("mode", "dark");
        select("#sun > svg").classList.add("dark_mode_sun");
        select("#moon > svg").classList.add("dark_mode_moon");
        select("#moon > svg").classList.remove("light_mode_moon");
        select("#sun > svg").classList.remove("light_mode_sun");
        select("html").setAttribute("data-theme", "dark_mode");
      } else {
        window.localStorage.setItem("mode", "light");
        select("#moon > svg").classList.add("light_mode_moon");
        select("#sun > svg").classList.add("light_mode_sun");
        select("#sun > svg").classList.remove("dark_mode_sun");
        select("#moon > svg").classList.remove("dark_mode_moon");
        select("html").setAttribute("data-theme", "light_mode");
      }
    } else {
      localStorage.setItem("mode", "light");
      select("html").setAttribute("data-theme", "light_mode");
    }
    window.localStorage.getItem("mode") === "light"
      ? qr_code("#dedede")
      : qr_code("#33343b");
  });
})();
