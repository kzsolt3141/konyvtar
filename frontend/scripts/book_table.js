import { LabelNames, getBookNotesById } from "./common.js";

const bookTable = document.getElementById("book_table");

const bookFormData = new FormData();
bookFormData.append("order", "id");
bookFormData.append("offset", 0);

const data = await fetch("/book/find/table", {
  method: "POST",
  body: bookFormData,
}).then((res) => res.json());

listAllBooks(data);

function listAllBooks(data) {
  if (data) {
    data.forEach(async (book) => {
      const notes = await getBookNotesById(book["id"]);
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
