export function creteGenreSelect(id, place) {
  const selectLabel = document.createElement("p");
  selectLabel.textContent = "Tipus:";

  const genreSelect = document.createElement("select");
  genreSelect.id = id;

  place.appendChild(selectLabel);
  place.appendChild(genreSelect);

  genreSelect.addEventListener("change", () => {
    if (genreSelect.value === "+") addGenre();
  });

  const option = document.createElement("option");
  option.value = "down";
  option.text = "\u2193";
  genreSelect.add(option);

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

export function genreSelectIsValid(id) {
  const bookGenre = document.getElementById(id);
  if (bookGenre === null) {
    return false;
  }
  if (bookGenre.value === "+" || bookGenre.value === "down") {
    return false;
  }

  return true;
}

function addGenre() {
  const genreDiv = document.getElementById("genre_div");
  const input = document.createElement("input");
  genreDiv.appendChild(input);
  const addButton = document.createElement("button");
  addButton.textContent = "Hozzaad";
  genreDiv.appendChild(addButton);
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Megse";
  genreDiv.appendChild(cancelButton);

  addButton.addEventListener("click", function (event) {
    event.preventDefault();
    if (input.value.trim() === "") {
      console.log("Input field empty");
      return;
    }
    fetch("/book/genres", {
      method: "POST",
      body: input.value,
    })
      .then((rsp) => rsp.text())
      .then((data) => {
        console.log(data);
        location.reload();
      });
  });

  cancelButton.addEventListener("click", function (event) {
    location.reload();
  });
}
