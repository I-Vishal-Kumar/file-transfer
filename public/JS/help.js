let sending = document.querySelector("#sending_btn");
let executable = document.querySelector("#executable_btn");
let sending_solution = document.querySelector(".sending_solutions");
let executable_solution = document.querySelector(".executable_solutions");
sending.addEventListener("click", () => {
  sending_solution.style.left = "0vw";
  executable_solution.style.left = "-100vw";
  sending.style.backgroundColor = "#005fff";
  executable.style.backgroundColor = "rgb(72 97 187)";
});
executable.addEventListener("click", () => {
  sending_solution.style.left = "-100vw";
  executable_solution.style.left = "0vw";
  sending.style.backgroundColor = "rgb(72 97 187)";
  executable.style.backgroundColor = "#005fff";
});
