//import genre related functions
import { common } from "./common.js";

document.getElementById("image").addEventListener("change", function (event) {
  const fileInput = event.target;
  const imagePreview = document.getElementById("book_thumbnail");

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };

    reader.readAsDataURL(fileInput.files[0]);
  }
});

const element = document.getElementById("bid");
if (element) {
  const bid = element.getAttribute("content");
  if (bid != "") {
    const bookNotes = await common.getBookNotesById(bid);
    const loans = await common.getLoanById(bid);

    const bookNotesText = document.getElementById("book_notes");
    bookNotes.forEach((bookNote) => {
      for (const k in bookNote) {
        const e = document.createElement("p");
        e.textContent = bookNote[k];
        bookNotesText.appendChild(e);
      }
    });

    const bookLoanText = document.getElementById("book_loan");
    loans.forEach((loan) => {
      for (const k in loan) {
        const e = document.createElement("p");
        e.textContent = loan[k];
        bookLoanText.appendChild(e);
      }
    });
  }
}

//TODO this should be implemented in book.js
async function toggleStatus(id) {
  const changeForm = new FormData();
  changeForm.append("update", "status");
  changeForm.append("notes", e.value);

  common.disableMain();

  fetch("/book/" + book.id, {
    method: "PUT",
    body: changeForm,
  }).then((rsp) =>
    rsp.json().then((data) => {
      common.updateStatus(data);
      common.enableMain();
    })
  );
}

//----------------------------------------------------------------
fillGenreSelect(document.getElementById("genre"));
const addGenreDiv = document.getElementById("genre_add_div");

function fillGenreSelect(selector) {
  if (!selector) return;

  selector.innerHTML = "";
  selector.addEventListener("change", () => {
    if (selector.value === "+") addGenreDiv.style.display = "block";
  });

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

const input = document.getElementById("add_genre_text");
const addButton = document.getElementById("submit_add_genre");
const cancelButton = document.getElementById("cancel_add_genre");

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
      addGenreDiv.style.display = "none";
      fillGenreSelect(document.getElementById("genre"));
    });
});

cancelButton.addEventListener("click", function (event) {
  addGenreDiv.style.display = "none";
});
