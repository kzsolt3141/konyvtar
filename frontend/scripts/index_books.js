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

import { getUserNameById } from "./index_users.js";

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
 */
async function listBooks(books) {
  const booksDiv = document.getElementById("books_div");
  booksDiv.innerHTML = "";

  books.forEach(async function (bookObj) {
    const book = bookObj[0];
    const available = bookObj[1];

    const bookDiv = document.createElement("div");
    booksDiv.appendChild(bookDiv);
    bookDiv.id = book.id;
    bookDiv.className = "book_div";

    if (!available[0]) {
      bookDiv.style.backgroundColor = "#f0c0c0";
    }

    await showBookPics(book.id, bookDiv, false);

    const boodDetailsDiv = document.createElement("div");
    bookDiv.appendChild(boodDetailsDiv);

    const firstLineDiv = document.createElement("div");
    firstLineDiv.className = "book_first_line";
    boodDetailsDiv.appendChild(firstLineDiv);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "book_radio";
    radio.id = book.id;
    radio.disabled = !available[0];
    firstLineDiv.appendChild(radio);

    const firstLine = [book.title, book.author];

    for (const k of firstLine) {
      const element = document.createElement("p");
      element.textContent = k;
      firstLineDiv.appendChild(element);
    }

    const secondLineDiv = document.createElement("div");
    secondLineDiv.className = "book_second_line";
    boodDetailsDiv.appendChild(secondLineDiv);
    const secondLine = [book.publ, book.ver, book.year];
    for (const k of secondLine) {
      const element = document.createElement("p");
      element.textContent = k;
      secondLineDiv.appendChild(element);
    }

    const thirdLineDiv = document.createElement("div");
    thirdLineDiv.className = "book_third_line";
    boodDetailsDiv.appendChild(thirdLineDiv);
    var img = document.createElement("img");
    img.src = "styles/static/edit.png";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      editBook(book.id);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/details.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      details(book.id);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/broken.svg";
    img.className = "detail_options";
    img.id = "lend_" + book.id;
    img.addEventListener("click", function () {
      toggleStatus(book.id, book.title);
    });
    thirdLineDiv.appendChild(img);

    if (!available[0]) {
      // TODO show this only for unavailable cases
      // TODO use form from lend.js (already implemented)
      img = document.createElement("img");
      img.src = "styles/static/ok.svg";
      img.className = "detail_options";
      img.addEventListener("click", function () {
        lendBook(book.id);
      });
      thirdLineDiv.appendChild(img);
    }
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

  if (picDiv.childElementCount == 0) {
    const img = document.createElement("img");
    img.src = "/styles/static/default_book.png";
    img.className = "book_thumbnail";
    picDiv.appendChild(img);
  }
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

  const revertBtn = document.createElement("img");
  detailsDiv.appendChild(revertBtn);
  revertBtn.src = "/styles/static/x.svg";
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

    detailText = document.createElement("div");
    detailsDiv.appendChild(detailText);

    if (element[1][1] != null) {
      const p = document.createElement("p");
      p.textContent = "Kiadva: " + (await getUserNameById(element[1][1]));
      detailText.appendChild(p);
    }

    break;
  }
}

async function toggleStatus(id, name) {
  const bookTable = document.getElementById("details_div");
  bookTable.innerHTML = "";

  await showBookPics(id, bookTable, false);

  var detailText = document.createElement("div");

  const p = document.createElement("h2");
  p.textContent = name + " allapot valtoztatas";

  const l = document.createElement("label");
  l.textContent = "Allapot valtoztatas oka:";
  const e = document.createElement("input");
  e.value = "";
  e.id = "notes";
  detailText.appendChild(p);
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

  const revertBtn = document.createElement("img");
  bookTable.appendChild(revertBtn);
  revertBtn.src = "/styles/static/x.svg";
  revertBtn.className = "revert_btn";
  revertBtn.addEventListener("click", function () {
    bookTable.innerHTML = "";
  });
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

  const revertBtn = document.createElement("img");
  bookTable.appendChild(revertBtn);
  revertBtn.src = "/styles/static/x.svg";
  revertBtn.className = "revert_btn";
  revertBtn.addEventListener("click", function () {
    bookTable.innerHTML = "";
  });
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
