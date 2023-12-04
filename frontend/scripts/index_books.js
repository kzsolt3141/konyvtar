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

function listBooks(data) {
  const booksDiv = document.querySelector(".books_div");
  booksDiv.innerHTML = "";

  data.forEach((value, key) => {
    var bookDiv = document.createElement("div");
    bookDiv.id = value.isbn;

    const table = document.createElement("table");
    var tableRow = table.insertRow();
    for (const k in value) {
      const tableCell = tableRow.insertCell();
      tableCell.textContent = value[k];
    }

    tableRow = table.insertRow();

    var button = document.createElement("button");
    button.textContent = "Deaktivalas";
    button.addEventListener("click", function () {
      deactivateBook(value.isbn);
    });
    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Szerkesztes";
    button.addEventListener("click", function () {
      editBook(value.isbn);
    });
    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    button = document.createElement("button");
    button.textContent = "Reszletek";
    button.addEventListener("click", function () {
      deactivateBook(value.isbn);
    });
    var tableCell = tableRow.insertCell();
    tableCell.appendChild(button);

    bookDiv.appendChild(table);

    showBookPics(value.isbn, bookDiv, false);

    booksDiv.appendChild(bookDiv);
  });
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

const userSearchBtn = document.getElementById("search_user");

userSearchBtn.addEventListener("click", async (event) => {
  const userForm = document.getElementById("search_users");
  const userFormData = new FormData(userForm);
  event.preventDefault();
  searchUser(userFormData);
});

function searchUser(formData) {
  fetch("/user/find", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      listUsers(data);
    });
}

function listUsers(data) {
  const userList = document.querySelector(".user_list");
  userList.innerHTML = "";

  JSON.parse(data).forEach((value, key) => {
    if (userList) {
      var paragraph = document.createElement("p");
      paragraph.textContent =
        value.name + " " + value.phone + " " + value.mail + " " + value.status;
      userList.appendChild(paragraph);

      var button = document.createElement("button");
      button.textContent = "Deaktivalas";
      button.addEventListener("click", function () {
        // TODO: Add textbox to leave deactivation notes
        deactivateUser(value.id);
      });
      userList.appendChild(button);

      button = document.createElement("button");
      button.textContent = "Szerkesztes";
      button.addEventListener("click", function () {
        deactivateUser(value.id);
      });
      userList.appendChild(button);

      button = document.createElement("button");
      button.textContent = "Reszletek";
      button.addEventListener("click", function () {
        deactivateUser(value.id);
      });
      userList.appendChild(button);
    }
    // add to the page
  });
}

function deactivateUser(key) {
  fetch("/user/deactivate", {
    method: "POST",
    body: key,
  }).then((rsp) =>
    rsp.json().then((data) => {
      console.log(data);
      userSearchBtn.click();
    })
  );
}
