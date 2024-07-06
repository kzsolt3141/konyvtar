import { common } from "./common.js";

const bookTable = document.getElementById("book_table");
const naviBackBtn = document.getElementById("navi_back");
const naviNextBtn = document.getElementById("navi_next");
const naviPage = document.getElementById("navi_page");
var tablePage = 0;
var maxBookCount = 0;
var globalOrderKey = "";

async function getOrderedData(orderBy) {
  const bookFormData = new FormData();
  bookFormData.append("order", orderBy);
  bookFormData.append("offset", tablePage);

  //TODO add waiting window here (enable / disable main)
  var data = await fetch("/book/table", {
    method: "POST",
    body: bookFormData,
  }).then((res) => res.json());

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
    maxBookCount = data.total;
    naviPage.value = `${tablePage} ${maxBookCount}`;
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
        const e = document.createElement("p");
        e.textContent = book[k];
        bookTable.appendChild(e);
      }
    });
  }
}

naviBackBtn.addEventListener("click", () => {
  //TODO keep order value, do something with createOrderingSelector
  tablePage = tablePage > 0 ? tablePage - 1 : tablePage;
  listAllBooks("id");
});

naviNextBtn.addEventListener("click", () => {
  //TODO implement pagination
  tablePage = tablePage < maxBookCount ? tablePage + 1 : tablePage;
  listAllBooks("id");
});
