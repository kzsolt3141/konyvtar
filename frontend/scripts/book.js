//import genre related functions
import {
  creteGenreSelect,
  genreSelectIsValid,
  getGenreValue,
} from "./genre.js";

import { updateStatus, disableMain, enableMain } from "./common.js";

await showNextBookId();

//create genre selection drop-down
const genreDiv = document.getElementById("genre_div");
creteGenreSelect("genre", genreDiv);

//add button will prepare formData and send it to backend
const formBtn = document.getElementById("add_button");
formBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  if (!genreSelectIsValid("genre")) {
    updateStatus("Kivalasztott 'Tipus' nem megfelelo");
    return;
  }

  const form = document.getElementById("add_book");

  const formData = new FormData(form);
  const genre = getGenreValue("genre");

  formData.append("genre", genre);
  disableMain();
  const status = await fetch("/book/add", {
    method: "POST",
    body: formData,
  }).then((rsp) => rsp.text());

  updateStatus(status);
  await showNextBookId();
  enableMain();
});

async function showNextBookId() {
  const rsp = await fetch(`/book/find/next`, {
    method: "GET",
  }).then((rsp) => rsp.text());

  const title = document.getElementById("title");
  title.innerHTML = `<h2>Uj konyv: ${rsp}<h2>`;
}
