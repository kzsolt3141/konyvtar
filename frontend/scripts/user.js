import { updateStatus } from "./common.js";

const mainBtn = document.getElementById("main_btn");
mainBtn.addEventListener("click", async (event) => {
  window.location.href = "/";
});

const addBookBtn = document.getElementById("add_book_btn");
addBookBtn.addEventListener("click", async (event) => {
  window.location.href = "/book";
});

const addButton = document.getElementById("add");
addButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const form = document.getElementById("add_user");

  const formData = new FormData(form);

  fetch("/user/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => updateStatus(data));
});
