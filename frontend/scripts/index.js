const bookSearchBtn = document.getElementById("search_book");

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
      listBooks(data);
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
  console.log(book);

  // TODO refactor, make it prettier and functional

  newDiv.innerHTML = `<form id="add_book">
  <label for="isbn">ISBN</label>
  <input type="text" id="isbn" name="isbn" value=${book.isbn} required />

  <label for="title">Cim:</label>
  <input type="text" id="title" name="title" value=${book.name}  required />

  <label for="author">Szerzo</label>
  <input type="text" id="author" name="author" value=${book.author}  required />

  <label for="year">Kiadas eve</label>
  <input type="text" id="year" name="year" value="${book.year}  required />

  <label for="publ">Kiado:</label>
  <input type="text" id="publ" name="publ" value=${book.publ}  />

  <label for="ver">Kiadas</label>
  <input type="text" id="ver" name="ver" value=${book.ver}  />

  <label for="notes">Megjegyes</label>
  <input type="text" id="notes" name="notes" value=${book.notes}  />

  <label for="images">Kep(ek) hozzasadasa:</label>
  <input type="file" id="images" name="images" accept="image/*" multiple />

  <button type="submit" id="add">Mentes</button>
</form>`;
  bookDiv.appendChild(newDiv);
  // bookDiv.appendChild(document.createElement("p"));

  // bookDiv.appendChild(bookForm);

  // button.addEventListener("click", function () {
  //   deactivateForm = new FormData();
  //   deactivateForm.append("isbn", key);
  //   deactivateForm.append("notes", input.value);

  //   fetch("/book/delete", {
  //     method: "POST",
  //     body: deactivateForm,
  //   }).then((rsp) =>
  //     rsp.json().then((data) => {
  //       console.log(data);
  //       bookSearchBtn.click();
  //     })
  //   );
  // });

  // bookDiv.appendChild(button);
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
