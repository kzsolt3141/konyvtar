//import genre related functions
import {
  creteGenreSelect,
  genreSelectIsValid,
  getGenreValue,
} from "./genre.js";

import { updateStatus, disableMain, enableMain } from "./common.js";

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
  fetch("/book/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      updateStatus(data);
      enableMain();
    });
});
