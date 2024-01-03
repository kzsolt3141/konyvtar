const LabelNames = {
  id: "Azonosito:",
  isbn: "ISBN:",
  title: "Cim:",
  author: "Szerzo:",
  genre: "Tipus:",
  year: "Kiadasi Ev:",
  publ: "Kiado:",
  ver: "Kiadas:",
  status: "Allapot:",
  notes: "Megjegyzesek:",
  available: "Elerheto:",
};

import {
  creteGenreSelect,
  getGenreValue,
  genreSelectIsValid,
} from "./genre.js";

const addBookBtn = document.getElementById("add_book_btn");
addBookBtn.addEventListener("click", async (event) => {
  window.location.href = "/book";
});

const addUserBtn = document.getElementById("add_user_btn");
addUserBtn.addEventListener("click", async (event) => {
  window.location.href = "/user";
});

createTypeSelect("book_order", document.getElementById("book_order_div"));

const bookSearchBtn = document.getElementById("search_books_btn");

var BookData = null;

bookSearchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const bookForm = document.getElementById("search_books");
  const bookFormData = new FormData(bookForm);
  searchBook(bookFormData);
});

function searchBook(bookFormData) {
  fetch("/book/find", {
    method: "POST",
    body: bookFormData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      BookData = JSON.parse(data);
      listBooks(BookData);
    });
}

/* all books will be listed in the books_div div element
 * each book will have its own table
 * row 0: book pictures
 * row 1; book information
 * row 2; button(s)
 */
function listBooks(books) {
  const booksDiv = document.getElementById("books_div");
  booksDiv.innerHTML = "";

  books.forEach((bookObj) => {
    const book = bookObj[0];
    const available = bookObj[1];

    const bookTable = document.createElement("table");

    bookTable.id = book.id;
    bookTable.className = "book_table";

    var tableRow = bookTable.insertRow();
    showBookPics(book.id, tableRow, false);

    tableRow = bookTable.insertRow();

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "book_radio";
    radio.id = book.id;
    radio.disabled = !available[0];
    tableRow.appendChild(radio);

    for (const k in book) {
      if (
        k == "id" ||
        k == "isbn" ||
        k == "publ" ||
        k == "ver" ||
        k == "status"
      )
        continue;

      const element = document.createElement("p");
      element.textContent = book[k];

      tableRow.appendChild(element);
    }

    tableRow = bookTable.insertRow();
    var img = document.createElement("img");
    img.src = "styles/static/edit.png";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      editBook(book.id);
    });
    tableRow.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/details.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      details(book.id);
    });
    tableRow.appendChild(img);

    if (!available[0]) {
      img = document.createElement("img");
      img.src = "styles/static/broken.svg";
      img.className = "detail_options";
      img.addEventListener("click", function () {
        toggleStatus(book.id);
      });
      tableRow.appendChild(img);

      // TODO show this only for unavailable cases
      // TODO use form from lend.js (already implemented)
      img = document.createElement("img");
      img.src = "styles/static/ok.svg";
      img.className = "detail_options";
      img.addEventListener("click", function () {
        editBook(book.id);
      });
      tableRow.appendChild(img);
    }

    booksDiv.appendChild(bookTable);
  });
}

async function showBookPics(id, bookDiv, deletion) {
  const rsp = await fetch("/book/find_book_pic", {
    method: "POST",
    body: id,
  });

  const data = await rsp.json();

  const picDiv = document.createElement("div");
  picDiv.id = "pic" + id;
  JSON.parse(data).forEach((pic) => {
    const img = document.createElement("img");
    img.src = "/" + pic.link;
    img.className = "book_thumbnail";
    if (deletion) {
      img.addEventListener("click", () => {
        deleteBookPic(pic.link);
      });
    }
    picDiv.appendChild(img);
  });
  bookDiv.appendChild(picDiv);
  return 0;
}

function deleteBookPic(link) {
  fetch("/book/delete_book_pic", {
    method: "POST",
    body: link,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      console.log(data);
      bookSearchBtn.click();
    });
}

async function details(key) {
  const detailsDiv = document.getElementById("details_div");
  detailsDiv.innerHTML = "";

  const revertBtn = document.createElement("button");
  detailsDiv.appendChild(revertBtn);
  revertBtn.textContent = "Bezar";
  revertBtn.className = "revert_btn";
  revertBtn.addEventListener("click", function () {
    detailsDiv.innerHTML = "";
  });

  for (const element of BookData) {
    if (element[0].id != key) continue;
    await showBookPics(key, detailsDiv, false);

    var detailText = document.createElement("div");

    for (const k in element[0]) {
      const e = document.createElement("p");
      e.textContent = LabelNames[k] + element[0][k];
      detailText.appendChild(e);
    }

    detailsDiv.appendChild(detailText);

    detailText = document.createElement("div");

    element.slice(2).map((item) => {
      const e = document.createElement("p");
      e.textContent = item.date + ": " + item.notes;
      detailText.appendChild(e);
    });

    detailsDiv.appendChild(detailText);
    break;
  }
}

async function toggleStatus(id) {
  const bookTable = document.getElementById("details_div");
  bookTable.innerHTML = "";

  await showBookPics(id, bookTable, false);

  var detailText = document.createElement("div");

  const l = document.createElement("label");
  l.textContent = "Megjegyzes";
  const e = document.createElement("input");
  e.value = "";
  e.id = "notes";
  detailText.appendChild(l);
  detailText.appendChild(e);

  bookTable.appendChild(detailText);

  const changeBtn = document.createElement("button");
  changeBtn.textContent = "Modositas";
  changeBtn.className = "approve_btn";
  changeBtn.addEventListener("click", function () {
    const changeForm = new FormData();
    changeForm.append("update", "status");
    changeForm.append("id", id);
    changeForm.append("notes", e.value);

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        bookTable.innerHTML = "";
      })
    );
  });

  bookTable.appendChild(changeBtn);

  const revertBtn = document.createElement("button");
  revertBtn.textContent = "Megse";
  revertBtn.className = "revert_btn";
  revertBtn.addEventListener("click", function () {
    bookTable.innerHTML = "";
  });
  bookTable.appendChild(revertBtn);
}
// TODO transfer edit to the book page, should simplify the things...
async function editBook(key) {
  // table id with all the book data
  const bookTable = document.getElementById("details_div");
  bookTable.innerHTML = "";

  await showBookPics(key, bookTable, true);

  var detailText = document.createElement("div");

  creteGenreSelect("changeForm", detailText);

  bookTable.appendChild(detailText);

  for (const element of BookData) {
    if (element[0].id != key) continue;
    element[0].notes = "";

    for (const k in element[0]) {
      if (k == "id" || k == "status" || k == "genre") continue;
      const l = document.createElement("label");
      l.textContent = LabelNames[k];
      const e = document.createElement("input");
      e.value = element[0][k];
      e.id = k;
      detailText.appendChild(l);
      detailText.appendChild(e);
    }

    bookTable.appendChild(detailText);

    break;
  }

  const changeBtn = document.createElement("button");
  changeBtn.textContent = "Modositas";
  changeBtn.className = "approve_btn";
  changeBtn.addEventListener("click", function () {
    if (!genreSelectIsValid("changeForm")) {
      return;
    }
    const changeForm = new FormData();
    changeForm.append("update", "bulk");

    for (var i = 0; i < detailText.children.length; i++) {
      const currentElement = detailText.children[i];

      if (currentElement.tagName.toLowerCase() == "input") {
        changeForm.append(currentElement.id, currentElement.value);
      }
    }

    changeForm.append("genre", getGenreValue("changeForm"));
    changeForm.append("id", key);

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        bookTable.innerHTML = "";
        bookSearchBtn.click();
      })
    );
  });

  bookTable.appendChild(changeBtn);

  const revertBtn = document.createElement("button");
  revertBtn.textContent = "Megse";
  revertBtn.className = "revert_btn";
  revertBtn.addEventListener("click", function () {
    bookTable.innerHTML = "";
  });
  bookTable.appendChild(revertBtn);
}

function createTypeSelect(id, place) {
  const typeSelect = document.createElement("select");
  typeSelect.id = id;

  const option = document.createElement("option");
  option.value = "";
  option.text = "Rendezes";
  typeSelect.add(option);

  for (const key in LabelNames) {
    const option = document.createElement("option");
    option.value = key;
    option.text = LabelNames[key];
    typeSelect.add(option);
  }

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value !== "Rendezes")
      reorderBooks(BookData, typeSelect.value);
  });

  place.appendChild(typeSelect);
}

function reorderBooks(BookData, prop) {
  BookData.sort((a, b) => {
    const propA = a[0][prop]; // Convert to uppercase for case-insensitive comparison
    const propB = b[0][prop];

    if (propA < propB) {
      return -1;
    }

    if (propA > propB) {
      return 1;
    }

    return 0;
  });
  listBooks(BookData);
}
