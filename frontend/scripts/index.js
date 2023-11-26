const bookSearchBtn = document.getElementById("search_book");

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
      bookSearchBtn.click();
    })
  );
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
        // TODO: Add textbox to leave deactivation cause
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
