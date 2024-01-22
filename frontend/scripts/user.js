import { common } from "./common.js";

await showNextUserId();

const addButton = document.getElementById("add");
addButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const form = document.getElementById("add_user");

  const formData = new FormData(form);
  common.disableMain();
  const data = await fetch("/user/add", {
    method: "POST",
    body: formData,
  }).then((rsp) => rsp.text());

  common.updateStatus(data);
  await showNextUserId();
  common.enableMain();
});

async function showNextUserId() {
  const rsp = await fetch(`/user/find/next`, {
    method: "GET",
  }).then((rsp) => rsp.text());

  const title = document.getElementById("title");
  title.innerHTML = `<h2>Uj Felhasznalo: ${rsp}<h2>`;
}
