import { common } from "./common.js";

await fillBookPage();

async function fillBookPage() {
  const element = document.getElementById("bid");
  if (!element) return;

  const bid = element.getAttribute("content");
  console.log("generate the full list based on:" + bid);

  const book = await common.getBookById(bid);
  const bookNotes = await common.getBookNotesById(bid);
  const loans = await common.getLoanById(bid);

  book.pic = book.pic == null ? "styles/static/default_book.png" : book.pic;
  document.getElementById("book_thumbnail").src = "/" + book.pic;

  const bookText = document.getElementById("full_book_text");

  for (const k in book) {
    if (k == "pic") continue;
    if (k == "notes") continue;
    const e = document.createElement("p");
    e.textContent = common.BookLabelNames[k];
    bookText.appendChild(e);
    const e2 = document.createElement("p");
    if (k == "id") {
      e2.textContent = parseInt(book[k], 10);
    } else {
      e2.textContent = book[k];
    }
    bookText.appendChild(e2);
  }

  const bookNotesText = document.getElementById("full_book_notes");
  bookNotes.forEach((bookNote) => {
    for (const k in bookNote) {
      const e = document.createElement("p");
      e.textContent = bookNote[k];
      bookNotesText.appendChild(e);
    }
  });

  const bookLoanText = document.getElementById("full_book_lend");
  loans.forEach((loan) => {
    for (const k in loan) {
      const e = document.createElement("p");
      e.textContent = loan[k];
      bookLoanText.appendChild(e);
    }
  });
}
