import { common } from "./common.js";

common.createOrderingSelector(
  "book_type",
  document.getElementById("book_key_div"),
  common.BookLabelNames,
  null
);

common.createOrderingSelector(
  "book_order",
  document.getElementById("book_order_div"),
  common.BookLabelNames,
  null
);

const bookSearchBtn = document.getElementById("search_books_btn");
if (bookSearchBtn) {
  bookSearchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const bookForm = document.getElementById("search_books");
    const bookFormData = new FormData(bookForm);
    searchBook(bookFormData);
  });
}

function bookClickCb(id) {
  common.disableMain();
  window.location.href = `/book/${id}`;
  common.enableMain();
}

async function searchBook(bookFormData) {
  common.disableMain();
  const books = await fetch("/book/details", {
    method: "POST",
    body: bookFormData,
  }).then((res) => res.json());

  if (books) {
    listBooks(books);
  }
  common.enableMain();
}

async function listBooks(books) {
  if (!books) return;
  const booksDiv = document.getElementById("books_div");
  booksDiv.innerHTML = "";

  const avlCheck = document.getElementById("avl");

  books.forEach(async function (book) {
    const activeLoan = await common.getActiveBookLoan(book.id);

    if ((activeLoan && avlCheck.checked) || (!activeLoan && !avlCheck.checked))
      return;

    const bookDiv = document.createElement("div");
    booksDiv.appendChild(bookDiv);
    bookDiv.id = book.id;
    bookDiv.className = "book_div";

    common.showPic(book.id, book.pic, bookDiv, bookClickCb);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "book_radio";
    radio.id = book.id;
    radio.disabled = activeLoan || book.status != 1;
    bookDiv.appendChild(radio);

    const boodDetailsDiv = document.createElement("div");
    boodDetailsDiv.className = "book_details_div";
    bookDiv.appendChild(boodDetailsDiv);

    const firstLineDiv = document.createElement("div");
    firstLineDiv.className = "book_first_line";
    boodDetailsDiv.appendChild(firstLineDiv);

    const firstLine = [book.isbn, book.title, book.author, book.genre];

    for (const k of firstLine) {
      const element = document.createElement("p");
      element.textContent = k;
      firstLineDiv.appendChild(element);
    }

    const secondLineDiv = document.createElement("div");
    secondLineDiv.className = "book_first_line";
    boodDetailsDiv.appendChild(secondLineDiv);

    const secondLine = [book.publ, book.ver, book.year, book.price + " lej"];

    for (const k of secondLine) {
      const element = document.createElement("p");
      element.textContent = k;
      secondLineDiv.appendChild(element);
    }
  });
}
