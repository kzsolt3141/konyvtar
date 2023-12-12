//import genre related functions
import { creteGenreSelect, genreSelectIsValid } from "./genre.js";

//use date for initial notes in form
const currentDate = new Date().toISOString().split("T")[0];
document.getElementById("notes").value = `Init: ${currentDate}`;

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

  const formData = new FormData();

  for (const element of form.elements) {
    formData.append(element.id, element.value);
  }

  fetch("/book/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => updateStatus(data));
});

function updateStatus(data) {
  document.querySelector(".submit_status").textContent = data;
}
