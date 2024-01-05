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
import { lendBook } from "./lend.js";
import { initDetailDiv } from "./common.js";

const detailsDiv = document.getElementById("details_div");
function clearPlace(place) {
  place.innerHTML = "";
}

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
  bookFormData.append("search", "bulk");
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

    showBookPic(book.id, bookDiv, false);

    const boodDetailsDiv = document.createElement("div");
    boodDetailsDiv.className = "book_details_div";
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
      toggleStatus(book.id, book.title, book.status);
    });
    thirdLineDiv.appendChild(img);

    if (!available[0]) {
      img = document.createElement("img");
      img.src = "styles/static/bring.svg";
      img.className = "detail_options";
      img.addEventListener("click", function () {
        lendBook(book.id, available[1], detailsDiv, false);
      });
      thirdLineDiv.appendChild(img);
    }
  });
}

export function showBookPic(id, bookDiv, deletion) {
  const picDiv = document.createElement("div");
  bookDiv.appendChild(picDiv);

  var book = null;
  for (const element of BookData) {
    if (element[0].id == id) {
      book = element[0];
      break;
    }
  }

  const img = document.createElement("img");
  img.className = "book_thumbnail";

  if (book.pic == null) {
    img.src = "/styles/static/default_book.png";
  } else {
    img.src = "/" + book.pic;
  }
  picDiv.appendChild(img);
}

async function details(key) {
  initDetailDiv(detailsDiv, clearPlace);

  for (const element of BookData) {
    if (element[0].id != key) continue;
    showBookPic(key, detailsDiv, false);

    var detailText = document.createElement("div");

    for (const k in element[0]) {
      if (k == "pic") continue;
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

async function toggleStatus(id, name, status) {
  initDetailDiv(detailsDiv, okFunction);
  showBookPic(id, detailsDiv, false);

  const currentStatus = status == 1 ? "Aktiv" : "Elveszett";
  const nextStatus = status == 1 ? "Elveszett" : "Aktiv";

  const detailText = document.createElement("div");
  detailsDiv.appendChild(detailText);

  const p = document.createElement("p");
  p.textContent = `${name} allapot valtoztatasa ${currentStatus} -rol ${nextStatus} -ra`;

  const l = document.createElement("label");
  l.textContent = "Allapot valtoztatas oka:";

  const e = document.createElement("input");
  e.value = "";
  e.id = "notes";

  detailText.appendChild(p);
  detailText.appendChild(l);
  detailText.appendChild(e);

  function okFunction() {
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
        detailsDiv.innerHTML = "";
      })
    );
  }
}

async function editBook(key) {
  var element = null;
  for (const e of BookData) {
    if (e[0].id == key) {
      element = e;
      break;
    }
  }

  initDetailDiv(detailsDiv, okFunction);
  showBookPic(key, detailsDiv, true);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";
  detailsDiv.appendChild(detailText);

  creteGenreSelect("changeForm", detailText);

  element[0].notes = "";

  for (const k in element[0]) {
    if (k == "id" || k == "status" || k == "genre" || k == "pic") continue;
    const l = document.createElement("label");
    l.textContent = LabelNames[k];
    const e = document.createElement("input");
    e.value = element[0][k];
    e.id = k;
    detailText.appendChild(l);
    detailText.appendChild(e);
  }

  const pic = document.createElement("input");
  pic.type = "file";
  pic.name = "image";
  detailText.appendChild(pic);

  detailsDiv.appendChild(detailText);

  function okFunction() {
    if (!genreSelectIsValid("changeForm")) {
      console.log("Please select genre!");
      return;
    }
    const changeForm = new FormData();
    changeForm.append("update", "bulk");
    changeForm.append("genre", getGenreValue("changeForm"));
    changeForm.append("id", key);
    changeForm.append("image", pic.files[0]);

    for (var i = 0; i < detailText.children.length; i++) {
      const currentElement = detailText.children[i];

      if (currentElement.tagName.toLowerCase() == "input") {
        if (currentElement.type == "file") {
          continue;
        }
        changeForm.append(currentElement.id, currentElement.value);
      }
    }

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        detailsDiv.innerHTML = "";
        bookSearchBtn.click();
      })
    );
  }
}

function createTypeSelect(id, place) {
  const typeSelect = document.createElement("select");
  typeSelect.id = id;

  const option = document.createElement("option");
  option.value = "";
  option.text = "Rendezes";
  typeSelect.add(option);

  for (const key in LabelNames) {
    if (key == "available" || key == "notes" || key == "status") continue;
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

export async function getBookTitleById(bid) {
  const frm = new FormData();
  frm.append("id", bid);
  frm.append("search", "single");

  const rsp = await fetch("/book/find", {
    method: "POST",
    body: frm,
  });
  const title = await rsp.json();
  return title.title;
}
