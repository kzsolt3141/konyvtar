import { lendBook } from "./lend.js";

import { common } from "./common.js";

const detailsDiv = document.getElementById("details_div");
function clearPlace(place) {
  place.innerHTML = "";
}

const bookSearchBtn = document.getElementById("search_books_btn");

const BookData = [];

common.createOrderingSelector(
  "book_order",
  document.getElementById("book_order_div"),
  BookData,
  common.BookLabelNames,
  common.reorderData,
  listBooks
);

bookSearchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const bookForm = document.getElementById("search_books");
  const bookFormData = new FormData(bookForm);
  searchBook(bookFormData);
});

function bookClickCb(id) {
  common.disableMain();
  window.location.href = `/book/${id}`;
  common.enableMain();
}

async function searchBook(bookFormData) {
  common.disableMain();
  const data = await fetch("/book/find/bulk", {
    method: "POST",
    body: bookFormData,
  }).then((res) => res.json());

  BookData.length = 0;

  if (data) {
    BookData.push(JSON.parse(data));
    if (BookData.length > 0) {
      listBooks(BookData[0]);
    }
  }
  common.enableMain();
}

async function listBooks(books) {
  if (!books) return;
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

    common.showPic(book.id, book.pic, bookDiv, bookClickCb);

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
      editBook(book);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/details.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      details(bookObj);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/broken.svg";
    img.className = "detail_options";
    img.id = "lend_" + book.id;
    img.addEventListener("click", function () {
      toggleStatus(book);
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

async function details(bookObj) {
  const book = bookObj[0];
  const loan = bookObj[1];

  common.initDetailDiv(detailsDiv, clearPlace, "Reszletek");
  common.showPic(book.id, book.pic, detailsDiv, bookClickCb);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";

  for (const k in book) {
    if (k == "pic") continue;
    if (k == "notes") continue;
    const e = document.createElement("p");
    e.textContent = common.BookLabelNames[k];
    detailText.appendChild(e);
    const e2 = document.createElement("p");
    if (k == "id") {
      e2.textContent = parseInt(book[k], 10);
    } else {
      e2.textContent = book[k];
    }
    detailText.appendChild(e2);
  }

  detailsDiv.appendChild(detailText);

  detailText = document.createElement("div");
  detailText.className = "detail_text2";

  const e = document.createElement("p");
  e.textContent = "Megjegyzesek:";
  detailText.appendChild(e);

  bookObj.slice(2).map((item) => {
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
  if (loan[1] != null) {
    const user = await common.getUserById(loan[1]);
    p.textContent = "Kiadva: " + user.name;
    detailText.className = "detail_text_red";
  } else if (book.status != 1) {
    p.textContent = "Inaktiv konyv";
    detailText.className = "detail_text_red";
  } else {
    p.textContent = "Jelengel Raktaron van";
    detailText.className = "detail_text_green";
  }
}

async function toggleStatus(book) {
  common.initDetailDiv(detailsDiv, okFunction, "Elveszett/Megkerult");
  common.showPic(book.id, book.pic, detailsDiv, bookClickCb);

  const currentStatus = book.status == 1 ? "Aktiv" : "Elveszett";
  const nextStatus = book.status == 1 ? "Elveszett" : "Aktiv";

  const detailText = document.createElement("div");
  detailsDiv.appendChild(detailText);
  detailText.className = "detail_text2";

  var p = document.createElement("p");
  p.textContent = book.title + " Cimu konyv allapotanak megvaltoztatasa:";
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
    changeForm.append("id", book.id);
    changeForm.append("notes", e.value);

    common.disableMain();

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        common.updateStatus(data);
        bookSearchBtn.click();
        detailsDiv.innerHTML = "";
        common.enableMain();
      })
    );
  }
}

async function editBook(book) {
  common.initDetailDiv(detailsDiv, okFunction, "Konyv Szerkesztese");
  common.showPic(book.id, book.pic, detailsDiv, bookClickCb);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";
  detailsDiv.appendChild(detailText);

  const l = document.createElement("label");
  detailText.appendChild(l);
  l.textContent = common.BookLabelNames["genre"];
  creteGenreSelect("changeForm", detailText);

  book.notes = "";

  for (const k in book) {
    if (k == "id" || k == "status" || k == "genre" || k == "pic") continue;
    const l = document.createElement("label");
    l.textContent = common.BookLabelNames[k];
    const e = document.createElement("input");
    e.value = book[k];
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
    const changeForm = new FormData();
    changeForm.append("update", "bulk");
    changeForm.append("genre", getGenreValue("changeForm"));
    changeForm.append("id", book.id);
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
    common.disableMain();

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        common.updateStatus(data);
        detailsDiv.innerHTML = "";
        common.enableMain();
        bookSearchBtn.click();
      })
    );
  }
}
