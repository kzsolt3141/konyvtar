import { common } from "./common.js";

const bookTable = document.getElementById("book_table");
const naviBackBtn = document.getElementById("navi_back");
const naviNextBtn = document.getElementById("navi_next");
const naviPage = document.getElementById("navi_page");
const naviText = document.getElementById("navi_text");

var tablePage = 0;
var maxPage = 0;
const pageLimit = 50;

async function getOrderedData(orderBy) {
  const bookFormData = new FormData();
  bookFormData.append("order", orderBy);
  bookFormData.append("offset", tablePage);
  bookFormData.append("limit", pageLimit);

  common.disableMain();
  var data = await fetch("/book/table", {
    method: "POST",
    body: bookFormData,
  }).then((res) => res.json());
  common.enableMain();
  common.updateStatus(data.message);

  return data;
}

listAllBooks("id");

common.createOrderingSelector(
  "book_order",
  document.getElementById("book_order_div"),
  common.BookLabelNames,
  listAllBooks
);

async function listAllBooks(key) {
  bookTable.innerHTML = "";
  const data = await getOrderedData(key);
  if (data) {
    const books = data.books;
    maxPage = Math.ceil(data.total / pageLimit);
    naviPage.value = `${tablePage + 1}`;
    naviText.innerText = `/ ${maxPage}`;

    books.forEach(async (book) => {
      const notes = await common.getBookNotesById(book["id"]);
      const register_notes = notes.filter((entry) => /^\d+$/.test(entry.notes));
      var register_note = "";
      if (register_notes.length > 0) register_note = register_notes[0].notes;
      book["register"] = register_note;

      for (const k in book) {
        if (k == "pic") continue;
        if (k == "id") continue;
        if (k == "keys") continue;
        const e = document.createElement(k === "title" ? "a" : "p");
        e.href = `/book/${book.id}`;
        e.textContent = book[k];
        bookTable.appendChild(e);
      }
    });
  }
}

naviBackBtn.addEventListener("click", () => {
  const orderSelect = document.getElementById("book_order");
  const currentPage = parseInt(naviPage.value.match(/\d+/), 10) - 1;
  tablePage = currentPage > 0 ? currentPage - 1 : currentPage;
  listAllBooks(orderSelect.value);
});

naviNextBtn.addEventListener("click", () => {
  const orderSelect = document.getElementById("book_order");
  const currentPage = parseInt(naviPage.value.match(/\d+/), 10) - 1;
  tablePage = currentPage < maxPage - 1 ? currentPage + 1 : currentPage;
  listAllBooks(orderSelect.value);
});
