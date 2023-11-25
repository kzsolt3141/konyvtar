const bookForm = document.getElementById("search_books");
const bookSearchBtn = document.getElementById("search_book");
const bookFormData = new FormData(bookForm);

bookSearchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  searchBook(bookFormData);
});

function searchBook(bookFormData) {
  fetch("/book/find", {
    method: "POST",
    body: bookFormData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      listBooks(data);
    });
}

function listBooks(data) {
  const bookList = document.querySelector(".book_list");
  bookList.innerHTML = "";

  JSON.parse(data).forEach((value, key) => {
    if (bookList) {
      var paragraph = document.createElement("p");
      paragraph.textContent =
        value.isbn + " " + value.title + " " + value.author;
      bookList.appendChild(paragraph);

      var button = document.createElement("button");
      button.textContent = "Torles";
      button.addEventListener("click", function () {
        deleteBook(value.isbn);
      });

      bookList.appendChild(button);
      button = document.createElement("button");
      button.textContent = "Szerkesztes";
      button.addEventListener("click", function () {
        deleteBook(value.isbn);
      });

      bookList.appendChild(button);
      button = document.createElement("button");
      button.textContent = "Reszletek";
      button.addEventListener("click", function () {
        deleteBook(value.isbn);
      });
      bookList.appendChild(button);
    }
    // add to the page
  });
}

function deleteBook(key) {
  fetch("/book/delete", {
    method: "POST",
    body: key,
  }).then((rsp) =>
    rsp.json().then((data) => {
      console.log(data);
      searchBook(bookFormData);
    })
  );
}

const userForm = document.getElementById("search_users");
const userSearchBtn = document.getElementById("search_user");
const userFormData = new FormData(userForm);

userSearchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  console.log(userForm);
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
        value.nev + " " + value.telefon + " " + value.mail;
      userList.appendChild(paragraph);

      var button = document.createElement("button");
      button.textContent = "Torles";
      button.addEventListener("click", function () {
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
      searchUser(userFormData);
    })
  );
}
