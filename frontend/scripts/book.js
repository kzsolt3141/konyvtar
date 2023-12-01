const currentDate = new Date().toISOString().split("T")[0];
document.getElementById("notes").value = `Init: ${currentDate}`;

updateGenres();

const formBtn = document.getElementById("add_button");
formBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  bookGenre = document.getElementById("genre");
  if (bookGenre.value === "+" || bookGenre.value === "valassz") {
    updateStatus("Kivalasztott 'Tipus' nem megfelelo");
    return;
  }

  const form = document.getElementById("add_book");

  const formData = new FormData(form);

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

function updateGenres() {
  bookGenre = document.getElementById("genre");
  bookGenre.addEventListener("change", () => {
    if (bookGenre.value === "+") addGenre();
  });

  const option = document.createElement("option");
  option.value = `valassz`;
  option.text = `valassz`;
  bookGenre.add(option);

  fetch("/book/genres", {
    method: "POST",
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      JSON.parse(data).forEach((opt, idx) => {
        const option = document.createElement("option");
        option.value = opt["genre"];
        option.text = opt["genre"];
        bookGenre.add(option);
      });
      const option = document.createElement("option");
      option.value = "+";
      option.text = "+";
      bookGenre.add(option);
    });
}

function addGenre() {
  genreDiv = document.getElementById("genre_div");
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
      });
  });

  cancelButton.addEventListener("click", function (event) {
    event.preventDefault();
    genre = document.getElementById("genre");
    genre.value = "valassz";
    genreDiv = document.getElementById("genre_div");
    genreDiv.innerHTML = "";
    genreDiv.appendChild(genre);
  });
}
