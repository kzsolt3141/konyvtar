import { creteGenreSelect } from "./genre.js";

const addBookBtn = document.getElementById("add_book_btn");
addBookBtn.addEventListener("click", async (event) => {
  window.location.href = "/book";
});

const addUserBtn = document.getElementById("add_user_btn");
addUserBtn.addEventListener("click", async (event) => {
  window.location.href = "/user";
});

const bookSearchBtn = document.getElementById("search_books_btn");

var BookData = null;

bookSearchBtn.addEventListener("click", async (event) => {
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

function listBooks(books) {
  const booksDiv = document.querySelector(".books_div");
  booksDiv.innerHTML = "";

  books.forEach((book) => {
    const bookTable = document.createElement("table");
    bookTable.id = book.id;

    var tableRow = bookTable.insertRow();
    for (const k in book) {
      const tableCell = tableRow.insertCell();
      tableCell.textContent = book[k];
      tableCell.id = k;
    }

    tableRow = bookTable.insertRow();

    showBookPics(book.id, tableRow, false);

    tableRow = bookTable.insertRow();

    const button = document.createElement("button");
    button.textContent = "Szerkesztes";
    button.addEventListener("click", function () {
      editBook(book.id);
    });

    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    booksDiv.appendChild(bookTable);
  });
}

function showBookPics(id, bookDiv, deletion) {
  fetch("/book/find_book_pic", {
    method: "POST",
    body: id,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      const picDiv = document.createElement("div");
      picDiv.id = "pic" + id;
      JSON.parse(data).forEach((pic) => {
        const img = document.createElement("img");
        img.src = "/" + pic.link;
        img.width = 100;
        if (deletion) {
          img.addEventListener("click", () => {
            deleteBookPic(pic.link);
          });
        }
        picDiv.appendChild(img);
      });
      bookDiv.appendChild(picDiv);
    });
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

// TODO transfer edit to the book page, should simplify the things...
function editBook(key) {
  // table id with all the book data
  const booktable = document.getElementById(key);

  let row = booktable.rows[0];
  for (let c = 0; c < row.cells.length; c++) {
    const cell = row.cells[c];

    const label = document.createElement("label");
    label.setAttribute("for", cell.id);
    label.textContent = cell.id;

    const textbox = document.createElement("input");
    textbox.value = cell.textContent;
    textbox.id = cell.id;

    if (cell.id == "status") {
      textbox.type = "checkbox";
      textbox.checked = cell.textContent == 1;
    }

    if (cell.id == "id") {
      textbox.disabled = true;
    }

    if (cell.id == "notes") {
      textbox.value = "";
    }

    cell.textContent = "";
    if (cell.id == "genre") {
      creteGenreSelect(cell.id, cell);
    } else {
      cell.appendChild(label);
      cell.appendChild(textbox);
    }
  }

  row = booktable.rows[1];
  row.innerHTML = "";
  showBookPics(key, row, true);

  row = booktable.rows[2];
  row.innerHTML = "";
  const changeBtn = document.createElement("button");
  changeBtn.textContent = "Modositas";
  changeBtn.addEventListener("click", function () {
    const changeForm = new FormData();

    for (let c = 0; c < booktable.rows[0].cells.length; c++) {
      const cell = booktable.rows[0].cells[c];
      for (let i = 0; i < cell.children.length; i++) {
        const element = cell.children[i];

        if (element.type === "text") {
          changeForm.append(element.id, element.value);
        }

        if (element.type === "select-one") {
          changeForm.append("genre", element.value);
        }

        if (element.type === "checkbox") {
          changeForm.append(element.id, element.checked ? 1 : 0);
        }
      }
    }

    fetch("/book/change", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        bookSearchBtn.click();
      })
    );
  });

  row.appendChild(changeBtn);

  const revertBtn = document.createElement("button");
  revertBtn.textContent = "Megse";
  revertBtn.addEventListener("click", function () {
    bookSearchBtn.click();
  });
  row.appendChild(revertBtn);
}
