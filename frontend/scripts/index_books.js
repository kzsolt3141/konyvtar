import { creteGenreSelect } from "./genre.js";

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

// TODO find a dynamic solution which supports scalable windows (flexbox maybe?)
function listBooks(books) {
  const booksDiv = document.querySelector(".books_div");
  booksDiv.innerHTML = "";
  const booksTable = document.createElement("table");
  booksTable.innerHTML = "";

  books.forEach((book) => {
    var tableRow = booksTable.insertRow();
    for (const k in book) {
      const tableCell = tableRow.insertCell();
      tableCell.textContent = `${k}: ${book[k]}`;
    }

    tableRow = booksTable.insertRow();

    var button = document.createElement("button");
    button.textContent = "Deaktivalas";
    button.addEventListener("click", function () {
      deactivateBook(book.id);
    });
    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Szerkesztes";
    button.addEventListener("click", function () {
      editBook(book.id);
    });
    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Reszletek";
    button.addEventListener("click", function () {
      deactivateBook(book.id);
    });
    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    tableRow = booksTable.insertRow();

    showBookPics(book.id, tableRow, false);
  });

  booksDiv.appendChild(booksTable);
}

function showBookPics(isbn, bookDiv, deletion) {
  fetch("/book/find_book_pic", {
    method: "POST",
    body: isbn,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      const picDiv = document.createElement("div");
      picDiv.id = "pic" + isbn;
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

function deactivateBook(key) {
  const bookDiv = document.getElementById(`${key}`);
  bookDiv.appendChild(document.createElement("p"));
  input = document.createElement("input");
  input.value = "N/A";
  bookDiv.appendChild(input);

  button = document.createElement("button");
  button.textContent = "Kuldes";

  button.addEventListener("click", function () {
    deactivateForm = new FormData();
    deactivateForm.append("isbn", key);
    deactivateForm.append("notes", input.value);

    fetch("/book/delete", {
      method: "POST",
      body: deactivateForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        bookSearchBtn.click();
      })
    );
  });

  bookDiv.appendChild(button);
}

function editBook(key) {
  const bookDiv = document.getElementById(`${key}`);
  const newDiv = document.createElement("div");
  newDiv.id = `edit_${key}`;
  const book = BookData.find((book) => book.isbn == key);

  for (const key in book) {
    const textbox = document.createElement("input");
    textbox.value = book[key];
    textbox.id = key;

    if (key == "status") {
      textbox.type = "checkbox";
      textbox.checked = book[key] == "active";
    }

    if (key == "genre") {
      creteGenreSelect(key, newDiv);
    } else {
      newDiv.appendChild(textbox);
    }
  }

  const changeBtn = document.createElement("button");
  changeBtn.textContent = "Modositas";
  changeBtn.addEventListener("click", function () {
    const elementsInDiv = document
      .getElementById(`edit_${key}`)
      .querySelectorAll("*");
    const changeForm = new FormData();

    changeForm.append("isbn", key);

    elementsInDiv.forEach((element) => {
      if (element.type === "text") {
        if (element.id === "isbn") {
          changeForm.append("new_isbn", element.value);
        } else {
          changeForm.append(element.id, element.value);
        }
      }

      if (element.type === "select-one") {
        changeForm.append("genre", element.value);
      }

      if (element.type === "checkbox") {
        changeForm.append(element.id, element.checked ? "active" : "inactive");
      }
    });

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

  newDiv.appendChild(changeBtn);

  const revertBtn = document.createElement("button");
  revertBtn.textContent = "Megse";
  revertBtn.addEventListener("click", function () {
    bookSearchBtn.click();
  });
  newDiv.appendChild(revertBtn);

  showBookPics(key, newDiv, true);

  bookDiv.appendChild(newDiv);
}
