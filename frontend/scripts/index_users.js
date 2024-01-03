const LabelNames = {
  id: "Azonosito:",
  name: "Nev:",
  address: "Cim:",
  phone: "Telefonszam:",
  mail: "E-Mail:",
  status: "Allapot:",
};

import { initDetailDiv } from "./common.js";

const detailsDiv = document.getElementById("details_div");
function clearPlace(place) {
  place.innerHTML = "";
}

createTypeSelect("user_order", document.getElementById("user_order_div"));

let UserData = [];

const userSearchBtn = document.getElementById("search_user");
userSearchBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const userForm = document.getElementById("search_users");
  const userFormData = new FormData(userForm);
  userFormData.append("search", "bulk");
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
      UserData = JSON.parse(data);
      listUsers(UserData);
    });
}

function listUsers(users) {
  const usersDiv = document.getElementById("users_div");
  usersDiv.innerHTML = "";

  users.forEach((userObj) => {
    const user = userObj[0];

    const userDiv = document.createElement("div");
    usersDiv.appendChild(userDiv);
    userDiv.id = user.id;
    userDiv.className = "book_div";

    showUserPic(user.id, userDiv, false);

    const userDetailsDiv = document.createElement("div");
    userDiv.appendChild(userDetailsDiv);

    const firstLineDiv = document.createElement("div");
    firstLineDiv.className = "book_first_line";
    userDetailsDiv.appendChild(firstLineDiv);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "user_radio";
    radio.id = user.id;
    firstLineDiv.appendChild(radio);

    const firstLine = [user.name, user.address];
    for (const k of firstLine) {
      const element = document.createElement("p");
      element.textContent = k;
      firstLineDiv.appendChild(element);
    }

    const secondLineDiv = document.createElement("div");
    secondLineDiv.className = "book_second_line";
    userDetailsDiv.appendChild(secondLineDiv);

    const secondLine = [user.phone, user.mail];

    for (const k of secondLine) {
      const element = document.createElement("p");
      element.textContent = k;
      secondLineDiv.appendChild(element);
    }

    const thirdLineDiv = document.createElement("div");
    thirdLineDiv.className = "book_third_line";
    userDetailsDiv.appendChild(thirdLineDiv);
    var img = document.createElement("img");
    img.src = "styles/static/edit.png";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      editUser(user.id);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/details.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      details(user.id);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/broken.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      toggleStatus(user.id, user.name, user.status);
    });
    thirdLineDiv.appendChild(img);
  });
}

function showUserPic(id, place, deletion) {
  const picDiv = document.createElement("div");
  place.appendChild(picDiv);

  var user = null;
  for (const element of UserData) {
    if (element[0].id == id) {
      user = element[0];
      break;
    }
  }

  const img = document.createElement("img");
  img.src = "/" + user.pic;
  img.className = "book_thumbnail";
  if (deletion) {
    img.className = "book_thumbnail_red";
    img.addEventListener("click", () => {
      deleteBookPic(user.pic);
    });
  }
  picDiv.appendChild(img);
}

async function details(id) {
  var element = null;
  for (const e of UserData) {
    if (e[0].id != id) {
      element = e;
      break;
    }
  }

  initDetailDiv(detailsDiv, clearPlace);

  showUserPic(id, detailsDiv, false);

  var detailText = document.createElement("div");

  for (const k in element[0]) {
    if (k == "pic") continue;
    const e = document.createElement("p");
    e.textContent = LabelNames[k] + " " + element[0][k];
    detailText.appendChild(e);
  }

  detailsDiv.appendChild(detailText);

  detailText = document.createElement("div");

  element.slice(1).map((item) => {
    const e = document.createElement("p");
    e.textContent = item.date + ": " + item.notes;
    detailText.appendChild(e);
  });

  detailsDiv.appendChild(detailText);

  detailText = document.createElement("div");
  detailsDiv.appendChild(detailText);
  const list = await getLendedBookList(id);
  for (const book of list) {
    const element = document.createElement("p");
    element.textContent = book;
    detailText.appendChild(element);
  }

  //TODO list all active books
}

async function getLendedBookList(uid) {
  const frm = new FormData();
  frm.append("id", uid);
  frm.append("search", "lend");

  const rsp = await fetch("/user/find", {
    method: "POST",
    body: frm,
  });
  const bookList = await rsp.json();

  return bookList;
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

export async function getUserNameById(uid) {
  const frm = new FormData();
  frm.append("id", uid);
  frm.append("search", "single");

  const rsp = await fetch("/user/find", {
    method: "POST",
    body: frm,
  });
  const name = await rsp.json();

  return name.name;
}
