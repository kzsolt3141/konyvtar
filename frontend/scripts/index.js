const bookSearchBtn = document.getElementById("search_book");

var BookData = null;
var BookPics = null;

bookSearchBtn.addEventListener("click", async (event) => {
  const bookForm = document.getElementById("search_books");
  const bookFormData = new FormData(bookForm);
  searchBook(bookFormData);
});

async function searchBook(bookFormData) {
  await fetch("/book/find", {
    method: "POST",
    body: bookFormData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      BookData = JSON.parse(data);
      listBooks(data);
    });
}

function createBookPics(isbn, bookDiv, deletion) {
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
        img.width = 300;
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

function listBooks(data) {
  const bookList = document.querySelector(".book_list");
  bookList.innerHTML = "";

  JSON.parse(data).forEach((value, key) => {
    if (bookList) {
      var bookDiv = document.createElement("div");
      bookDiv.id = value.isbn;

      var paragraph = document.createElement("p");
      paragraph.textContent =
        value.isbn + " " + value.title + " " + value.author;
      bookDiv.appendChild(paragraph);

      var button = document.createElement("button");
      button.textContent = "Deaktivalas";
      button.addEventListener("click", function () {
        deactivateBook(value.isbn);
      });
      bookDiv.appendChild(button);

      button = document.createElement("button");
      button.textContent = "Szerkesztes";
      button.addEventListener("click", function () {
        editBook(value.isbn);
      });
      bookDiv.appendChild(button);

      button = document.createElement("button");
      button.textContent = "Reszletek";
      button.addEventListener("click", function () {
        deactivateBook(value.isbn);
      });
      bookDiv.appendChild(button);

      createBookPics(value.isbn, bookDiv, false);

      bookList.appendChild(bookDiv);
    }
    // add to the page
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
  const book = BookData.find((book) => book.isbn == key);

  isbn = document.createElement("input");
  isbn.value = book.isbn;
  newDiv.appendChild(isbn);

  title = document.createElement("input");
  title.value = book.title;
  newDiv.appendChild(title);

  author = document.createElement("input");
  author.value = book.author;
  newDiv.appendChild(author);

  year = document.createElement("input");
  year.value = book.year;
  newDiv.appendChild(year);

  publ = document.createElement("input");
  publ.value = book.publ;
  newDiv.appendChild(publ);

  ver = document.createElement("input");
  ver.value = book.ver;
  newDiv.appendChild(ver);

  notes = document.createElement("input");
  notes.value = book.notes;
  newDiv.appendChild(notes);

  sts = document.createElement("input");
  sts.type = "checkbox";
  sts.checked = book.status === "active" ? true : false;
  newDiv.appendChild(sts);

  changeBtn = document.createElement("button");
  changeBtn.textContent = "Modositas";
  changeBtn.addEventListener("click", function () {
    changeForm = new FormData();
    changeForm.append("new_isbn", isbn.value);
    changeForm.append("title", title.value);
    changeForm.append("author", author.value);
    changeForm.append("year", year.value);
    changeForm.append("publ", publ.value);
    changeForm.append("ver", ver.value);
    changeForm.append("notes", notes.value);
    changeForm.append("status", sts.checked ? "active" : "inactive");
    changeForm.append("isbn", key);

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

  revertBtn = document.createElement("button");
  revertBtn.textContent = "Megse";
  revertBtn.addEventListener("click", function () {
    bookSearchBtn.click();
  });
  newDiv.appendChild(revertBtn);

  createBookPics(key, newDiv, true);

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
