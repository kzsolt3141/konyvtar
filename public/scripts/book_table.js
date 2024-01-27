import { common } from "./common.js";

const bookTable = document.getElementById("book_table");

const bookFormData = new FormData();
bookFormData.append("order", "id");
bookFormData.append("offset", 0);

const data = await fetch("/book/find/table", {
  method: "POST",
  body: bookFormData,
}).then((res) => res.json());

listAllBooks(data);

common.createOrderingSelector(
  "book_order",
  document.getElementById("book_order_div"),
  data,
  common.BookLabelNames,
  reorderData,
  listAllBooks
);

function reorderData(data, prop, cb = null) {
  if (!data) return;

  //TODO use uppercase for not INT data
  data.sort((a, b) => {
    const propA = a[prop];
    const propB = b[prop];

    if (propA < propB) {
      return -1;
    }

    if (propA > propB) {
      return 1;
    }

    return 0;
  });
  if (cb) cb(data);
}

function listAllBooks(data) {
  bookTable.innerHTML = "";
  if (data) {
    data.forEach(async (book) => {
      const notes = await common.getBookNotesById(book["id"]);
      const register_notes = notes.filter((entry) => /^\d+$/.test(entry.notes));
      var register_note = "";
      if (register_notes.length > 0) register_note = register_notes[0].notes;
      book["register"] = register_note;

      for (const k in book) {
        if (k == "pic") continue;
        if (k == "id") continue;
        const e = document.createElement("p");
        e.textContent = book[k];
        bookTable.appendChild(e);
      }
    });
  }
}
