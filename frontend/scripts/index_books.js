import {
  creteGenreSelect,
  getGenreValue,
  genreSelectIsValid,
} from "./genre.js";

import { getUserNameById } from "./index_users.js";
import { lendBook } from "./lend.js";
import {
  reorderData,
  initDetailDiv,
  updateStatus,
  disableMain,
  enableMain,
  LabelNames,
} from "./common.js";

const detailsDiv = document.getElementById("details_div");
function clearPlace(place) {
  place.innerHTML = "";
}

createTypeSelect("book_order", document.getElementById("book_order_div"));

const bookSearchBtn = document.getElementById("search_books_btn");

var BookData = null;

bookSearchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const bookForm = document.getElementById("search_books");
  const bookFormData = new FormData(bookForm);
  searchBook(bookFormData);
});

async function searchBook(bookFormData) {
  disableMain();
  const data = await fetch("/book/find/bulk", {
    method: "POST",
    body: bookFormData,
  }).then((res) => res.json());

  if (data) {
    BookData = JSON.parse(data);
    listBooks(BookData);
  }
  enableMain();
}

/* all books will be listed in the books_div div element
 * each book will have its own table
 */
async function listBooks(books) {
  const booksDiv = document.getElementById("books_div");
  booksDiv.innerHTML = "";

  const avlCheck = document.getElementById("avl");

  books.forEach(async function (bookObj) {
    const book = bookObj[0];
    const available = bookObj[1];

    if (available[0] != avlCheck.checked) return;

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
    radio.disabled = !available[0] || book.status != 1;
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

    const secondLine = [book.publ, book.ver, book.year, book.price + " lej"];

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

  img.addEventListener("click", async (event) => {
    disableMain();
    window.location.href = `/book/full/${id}`;
    enableMain();
  });

  picDiv.appendChild(img);
}

async function details(key) {
  initDetailDiv(detailsDiv, clearPlace, "Reszletek");

  for (const element of BookData) {
    if (element[0].id != key) continue;
    showBookPic(key, detailsDiv, false);

    var detailText = document.createElement("div");
    detailText.className = "detail_text";

    for (const k in element[0]) {
      if (k == "pic") continue;
      if (k == "notes") continue;
      const e = document.createElement("p");
      e.textContent = LabelNames[k];
      detailText.appendChild(e);
      const e2 = document.createElement("p");
      if (k == "id") {
        e2.textContent = parseInt(element[0][k], 10);
      } else {
        e2.textContent = element[0][k];
      }
      detailText.appendChild(e2);
    }

    detailsDiv.appendChild(detailText);

    detailText = document.createElement("div");
    detailText.className = "detail_text2";

    const e = document.createElement("p");
    e.textContent = "Megjegyzesek:";
    detailText.appendChild(e);

    element.slice(2).map((item) => {
      const e = document.createElement("p");
      e.textContent = item.date + ": " + item.notes;
      detailText.appendChild(e);
    });

    detailsDiv.appendChild(detailText);

    detailText = document.createElement("div");
    detailText.className = "detail_text2";
    detailsDiv.appendChild(detailText);

    const p = document.createElement("p");
    detailText.appendChild(p);
    if (element[1][1] != null) {
      p.textContent = "Kiadva: " + (await getUserNameById(element[1][1]));
      detailText.className = "detail_text_red";
    } else if (element[0]["status"] != 1) {
      p.textContent = "Inaktiv konyv";
      detailText.className = "detail_text_red";
    } else {
      p.textContent = "Jelengel Raktaron van";
      detailText.className = "detail_text_green";
    }

    break;
  }
}

async function toggleStatus(id, name, status) {
  initDetailDiv(detailsDiv, okFunction, "Elveszett/Megkerult");
  showBookPic(id, detailsDiv, false);

  const currentStatus = status == 1 ? "Aktiv" : "Elveszett";
  const nextStatus = status == 1 ? "Elveszett" : "Aktiv";

  const detailText = document.createElement("div");
  detailsDiv.appendChild(detailText);
  detailText.className = "detail_text2";

  var p = document.createElement("p");
  p.textContent = name + " Cimu konyv allapotanak megvaltoztatasa:";
  detailText.appendChild(p);

  p = document.createElement("p");
  p.textContent = currentStatus + "-rol";
  detailText.appendChild(p);

  p = document.createElement("p");
  p.textContent = nextStatus + "-ra(e)";
  detailText.appendChild(p);

  const l = document.createElement("label");
  l.textContent = "Allapot valtoztatas oka:";

  const e = document.createElement("input");
  e.value = "";
  e.id = "notes";

  detailText.appendChild(l);
  detailText.appendChild(e);

  function okFunction() {
    const changeForm = new FormData();
    changeForm.append("update", "status");
    changeForm.append("id", id);
    changeForm.append("notes", e.value);

    disableMain();

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        updateStatus(data);
        bookSearchBtn.click();
        detailsDiv.innerHTML = "";
        enableMain();
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

  initDetailDiv(detailsDiv, okFunction, "Konyv Szerkesztese");
  showBookPic(key, detailsDiv, true);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";
  detailsDiv.appendChild(detailText);

  const l = document.createElement("label");
  detailText.appendChild(l);
  l.textContent = LabelNames["genre"];
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
      updateStatus("Kerlek valasz megfelelo TIPUS-t");
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
    disableMain();

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        updateStatus(data);
        detailsDiv.innerHTML = "";
        enableMain();
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
      reorderData(BookData, typeSelect.value, listBooks);
  });

  place.appendChild(typeSelect);
}

export async function getBookTitleById(bid) {
  const rsp = await fetch(`/book/find/id=${bid}`, {
    method: "GET",
  });
  const book = await rsp.json();
  return book.title;
}
