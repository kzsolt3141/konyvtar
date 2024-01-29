import { common } from "./common.js";

// genre select creates a new diw with all the requred elements:
// - label, ganre drop-down, input fields, buttons
export function fillGenreSelect(selector) {
  if (!selector) return;
  // additional elements if "+" is selected
  selector.addEventListener("change", () => {
    if (selector.value === "+") addGenre(selector);
  });

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
        selector.add(option);
      });
      const option = document.createElement("option");
      option.value = "+";
      option.text = "+";
      selector.add(option);
    });
}

// a selected genre is valid if it is not "+" or "down"
export function genreSelectIsValid(selector) {
  if (!selector) return false;
  if (selector.value === "+" || selector.value === "down") return false;

  return true;
}

export function getGenreValue(selector) {
  if (selector && selector.value != "down") return selector.value;
  else return "";
}

// define a new genre and send it back to the DB
//TODO: solve this, place no longer exists
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
