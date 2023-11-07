function select(element) {
  return document.querySelector(element);
}
function selectAll(element) {
  return document.querySelector(element);
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
  });
})();
