import { updateStatus, disableMain, enableMain } from "./common.js";

const addButton = document.getElementById("add");
addButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const form = document.getElementById("add_user");

  const formData = new FormData(form);
  disableMain();
  fetch("/user/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      updateStatus(data);
      enableMain();
    });
});
