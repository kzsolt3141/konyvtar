import { common } from "./common.js";

// genre select creates a new diw with all the requred elements:
// - label, ganre drop-down, input fields, buttons
export function creteGenreSelect(id, place) {
  const genreDiv = document.createElement("div");
  genreDiv.id = id;
  place.appendChild(genreDiv);

  // actual genre dropdown
  const genreSelect = document.createElement("select");
  genreSelect.id = id + "_select";

  genreDiv.appendChild(genreSelect);

  // additional elements if "+" is selected
  genreSelect.addEventListener("change", () => {
    if (genreSelect.value === "+") addGenre(genreDiv);
  });

  // create additional optin
  const option = document.createElement("option");
  option.value = "down";
  option.text = "\u2193";
  genreSelect.add(option);

  // fetch all known genres and fill the dropdown
  fetch("/book/genres", {
    method: "POST",
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      JSON.parse(data).forEach((opt, idx) => {
        const option = document.createElement("option");
        option.value = opt["genre"];
        option.text = opt["genre"];
        genreSelect.add(option);
      });
      const option = document.createElement("option");
      option.value = "+";
      option.text = "+";
      genreSelect.add(option);
    });
}

// a selected genre is valid if it is not "+" or "down"
export function genreSelectIsValid(id) {
  const bookGenre = document.getElementById(id + "_select");
  if (bookGenre === null) {
    return false;
  }
  if (bookGenre.value === "+" || bookGenre.value === "down") {
    return false;
  }

  return true;
}

export function getGenreValue(id) {
  const bookGenre = document.getElementById(id + "_select");
  if (bookGenre && bookGenre.value != "down") return bookGenre.value;
  else return "";
}

// define a new genre and send it back to the DB
function addGenre(place) {
  const input = document.createElement("input");
  place.appendChild(input);
  const addButton = document.createElement("button");
  addButton.textContent = "Hozzaad";
  place.appendChild(addButton);
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Megse";
  place.appendChild(cancelButton);

  addButton.addEventListener("click", function (event) {
    event.preventDefault();
    if (input.value.trim() === "") {
      console.log("Input field empty");
      return;
    }
    common.disableMain();

    fetch("/book/genres/" + input.value, {
      method: "POST",
    })
      .then((rsp) => rsp.text())
      .then((data) => {
        common.enableMain();
        location.reload();
      });
  });

  cancelButton.addEventListener("click", function (event) {
    location.reload();
  });
}
