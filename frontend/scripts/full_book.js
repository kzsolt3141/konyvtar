import { LabelNames } from "./common.js";

const bid = document.getElementById("bid").getAttribute("content");
console.log("generate the full list based on:" + bid);

await fillBookPage();

async function fillBookPage() {
  const book = await getBookById(bid);
  const bookNotes = await getBookNotesById(bid);
  const loans = await getLoanById(bid);

  document.getElementById("book_thumbnail").src = "/" + book.pic;

  const bookText = document.getElementById("full_book_text");

  for (const k in book) {
    if (k == "pic") continue;
    if (k == "notes") continue;
    const e = document.createElement("p");
    e.textContent = LabelNames[k];
    bookText.appendChild(e);
    const e2 = document.createElement("p");
    e2.textContent = book[k];
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

async function getBookById(bid) {
  const rsp = await fetch(`/book/find/id=${bid}`, {
    method: "GET",
  });
  const book = await rsp.json();
  return book;
}

async function getBookNotesById(bid) {
  const rsp = await fetch(`/book/find/nid=${bid}`, {
    method: "GET",
  });
  const bookNotes = await rsp.json();

  return bookNotes;
}

async function getLoanById(uid) {
  const rsp = await fetch(`/loan/bid=${uid}`, {
    method: "GET",
  });
  const loan = await rsp.json();

  return loan;
}
