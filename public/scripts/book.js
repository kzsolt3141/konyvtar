//import genre related functions
import { fillGenreSelect } from "./genre.js";
import { common } from "./common.js";

//create genre selection drop-down
fillGenreSelect(document.getElementById("genre"));

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
