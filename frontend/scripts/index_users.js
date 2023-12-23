const LabelNames = {
  id: "Azonosito:",
  name: "Nev:",
  address: "Cim:",
  phone: "Telefonszam:",
  mail: "E-Mail:",
  status: "Allapot",
};

let UserData = [];

const userSearchBtn = document.getElementById("search_user");
userSearchBtn.addEventListener("click", async (event) => {
  const userForm = document.getElementById("search_users");
  const userFormData = new FormData(userForm);
  event.preventDefault();
  searchUser(userFormData);
});

function createLendButton(place) {
  const lendDiv = document.getElementById("users_div");

  const button = document.createElement("button");
  button.textContent = "Kolcsonzes";
  button.addEventListener("click", function () {
    var bookRadio = document.querySelector('input[name="book_radio"]:checked');
    var userRadio = document.querySelector('input[name="user_radio"]:checked');
    if (bookRadio && userRadio) {
      console.log(bookRadio.id, userRadio.id);
    }
    //check if both radio buttons are selected
  });
  lendDiv.appendChild(button);
}

function searchUser(formData) {
  fetch("/user/find", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      UserData = JSON.parse(data);
      listUsers(UserData);
    });
}

/* all users will be listed in the users_div div element
 * each user will have its own table
 * row 0: user information
 * row 1; user profile picture pictures
 * row 2; button(s)
 */
function listUsers(users) {
  const userList = document.querySelector(".users_div");
  userList.innerHTML = "";

  users.forEach((userObj) => {
    const user = userObj[0];
    const userTable = document.createElement("table");
    userTable.id = user.id;
    userList.appendChild(userTable);

    var tableRow = userTable.insertRow();

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "user_radio";
    radio.id = user.id;
    tableRow.appendChild(radio);

    for (const k in user) {
      if (k === "pic") continue;
      const element = document.createElement("input");
      element.disabled = true;
      element.id = k;
      element.value = user[k];

      const label = document.createElement("p");
      label.textContent = LabelNames[k];

      if (k == "status") {
        element.type = "checkbox";
        element.checked = user[k] == 1;
      }

      tableRow.appendChild(label);
      tableRow.appendChild(element);
    }

    const element = document.createElement("input");
    userObj.forEach((notes, index) => {
      if (index > 0) {
        element.value += notes.date + ":" + notes.notes + ";";
      }
    });
    element.disabled = true;
    element.id = "notes";
    tableRow.appendChild(element);

    tableRow = userTable.insertRow();
    showUserPic(user.pic, tableRow, false);

    tableRow = userTable.insertRow();

    // var button = document.createElement("button");
    // button.textContent = "Deaktivalas";
    // button.addEventListener("click", function () {
    //   // TODO: Add textbox to leave deactivation notes
    //   deactivateUser(value.id);
    // });
    // tableRow.appendChild(button);

    const button = document.createElement("button");
    button.textContent = "Szerkesztes";
    button.addEventListener("click", function () {
      editUser(user.id);
    });
    tableRow.appendChild(button);
  });

  createLendButton(userList);
}

function showUserPic(link, place, deletion) {
  const img = document.createElement("img");
  img.src = "/" + link;
  img.width = 100;
  if (deletion) {
    img.addEventListener("click", () => {
      deleteBookPic(link);
    });
  }
  place.appendChild(img);
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

function editUser(key) {
  const usertable = document.getElementById(key);

  let row = usertable.rows[0];
  for (let c = 0; c < row.children.length; c++) {
    const cell = row.children[c];

    cell.disabled = false;

    if (cell.id == "id") {
      cell.disabled = true;
    }

    if (cell.id == "notes") {
      cell.value = "Modositva";
    }
  }

  // TODO edit profile picture

  row = usertable.rows[2];
  row.innerHTML = "";
  const changeBtn = document.createElement("button");
  changeBtn.textContent = "Modositas";
  changeBtn.addEventListener("click", function () {
    const changeForm = new FormData();

    for (let c = 0; c < usertable.rows[0].children.length; c++) {
      const element = usertable.rows[0].children[c];

      if (element.tagName.toLowerCase() === "label") continue;

      if (element.type === "text") {
        changeForm.append(element.id, element.value);
      }

      if (element.type === "checkbox") {
        changeForm.append(element.id, element.checked ? 1 : 0);
      }
    }

    fetch("/user/edit", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        userSearchBtn.click();
      })
    );
  });

  row.appendChild(changeBtn);

  const revertBtn = document.createElement("button");
  revertBtn.textContent = "Megse";
  revertBtn.addEventListener("click", function () {
    userSearchBtn.click();
  });
  row.appendChild(revertBtn);
}

function createTypeSelect(id, place) {
  const typeSelect = document.createElement("select");
  typeSelect.id = id;

  const option = document.createElement("option");
  option.value = "";
  option.text = "Rendezes";
  typeSelect.add(option);

  for (const key in LabelNames) {
    const option = document.createElement("option");
    option.value = key;
    option.text = LabelNames[key];
    typeSelect.add(option);
  }

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value !== "Rendezes")
      reorderBooks(UserData, typeSelect.value);
  });

  place.appendChild(typeSelect);
}

function reorderBooks(UserData, prop) {
  UserData.sort((a, b) => {
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
  listUsers(UserData);
}
