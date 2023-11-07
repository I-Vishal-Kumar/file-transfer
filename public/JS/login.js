let popup_tip = document.querySelector("#popup_tip");
let popup_page = document.querySelector("#popup_page");

window.localStorage.getItem("mode") === "light"
  ? document.querySelector("html").setAttribute("data-theme", "light_mode")
  : document.querySelector("html").setAttribute("data-theme", "dark_mode");

document.querySelector("#login").addEventListener("click", async (e) => {
  let user_id = document.querySelector("#l_user_id").value.trim();
  let password = document.querySelector("#l_password").value.trim();
  e.preventDefault();
  popup_page.style.left = "0vw";
  popup_tip.innerText = "loading..";
  if (
    !user_id ||
    typeof user_id === "undefined" ||
    !password ||
    typeof password === "undefined" ||
    !user_id.includes("@gmail.com")
  ) {
    popup_tip.innerText = "invalid entries";
    return;
  }
  let body = {
    user_id,
    password,
  };

  let config = {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
  let res = await fetch("/login", config);
  res = await res.json();
  if (res["status"] === 1) {
    popup_tip.innerText = "loading..";
    window.location.href = window.location.origin + "/sender";
  } else {
    popup_tip.innerText = res["status"];
  }
});

document.querySelector("#signup").addEventListener("click", async (e) => {
  popup_page.style.left = "0vw";
  popup_tip.innerText = "Loading..";
  let s_user_id = document.querySelector("#s_user_id").value.trim();
  let s_password = document.querySelector("#s_password").value.trim();
  let s_name = document.querySelector("#s_name").value.trim();
  let s_conf_password = document.querySelector("#s_conf_password").value.trim();
  let otp = document.querySelector("#s_otp").value.trim();
  e.preventDefault();

  if (
    typeof s_user_id === "undefined" ||
    !s_user_id.includes("@gmail.com") ||
    typeof "s_conf_password" === "undefined" ||
    typeof "s_password" === "undefined" ||
    typeof "s_name" === "undefined" ||
    typeof otp === "undefined" ||
    s_password.localeCompare(s_conf_password) !== 0
  ) {
    popup_tip.innerText = "Enter valid credentials";
    return;
  } else {
    let body = {
      email: s_user_id,
      name: s_name,
      otp: otp,
      password: s_password,
    };
    let config = {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
    let res = await fetch("/signup", config);
    res = await res.json();
    if (res["status"] === 1) {
      window.location.href = window.location.origin + "/sender";
    } else {
      popup_tip.innerText = res["status"];
      return;
    }
  }
});

document.querySelector("#otp_send").addEventListener("click", async (e) => {
  let email = document.querySelector("#s_user_id").value.trim();
  popup_page.style.left = "0vw";
  e.preventDefault();
  if (email && typeof email !== "undefined" && email.includes("@gmail.com")) {
    let res = await fetch("/generate_OTP", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    res = await res.json();
    popup_tip.innerText = res["status"];
  }
});

document.querySelector("#popup_close_btn").addEventListener("click", () => {
  popup_tip.innerText = "Loading";
  popup_page.style.left = "-100vw";
});
