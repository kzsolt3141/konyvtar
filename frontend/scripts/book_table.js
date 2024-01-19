//TODO remove IdOffset when it is not needed
import { LabelNames, IdOffset } from "./common.js";

const bookTable = document.getElementById("book_table");

const bookFormData = new FormData();
bookFormData.append("order", "id");
bookFormData.append("offset", 0);

const data = await fetch("/book/find/table", {
  method: "POST",
  body: bookFormData,
}).then((res) => res.json());

if (data) {
  data.forEach((book) => {
    for (const k in book) {
      if (k == "pic") continue;
      if (k == "notes") continue;
      const e = document.createElement("p");
      //TODO remove IdOffset when it is not needed
      if (k == "id") {
        e.textContent = parseInt(book[k], 10) + IdOffset;
      } else {
        e.textContent = book[k];
      }
      bookTable.appendChild(e);
    }
  });
}
