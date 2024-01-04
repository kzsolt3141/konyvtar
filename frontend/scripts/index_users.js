const LabelNames = {
  id: "Azonosito:",
  name: "Nev:",
  address: "Cim:",
  phone: "Telefonszam:",
  mail: "E-Mail:",
  status: "Allapot:",
  notes: "Megjegyzesek:",
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

function showUserPic(id, place) {
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
  img.className = "book_thumbnail";

  if (user.pic == null) {
    img.src = "/styles/static/default_book.png";
  } else {
    img.src = "/" + user.pic;
  }
  picDiv.appendChild(img);
}

async function details(id) {
  var element = null;
  for (const e of UserData) {
    if (e[0].id == id) {
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
  var element = null;
  for (const e of UserData) {
    if (e[0].id == key) {
      element = e;
      break;
    }
  }
  initDetailDiv(detailsDiv, okFunction);
  showUserPic(key, detailsDiv, true);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";
  detailsDiv.appendChild(detailText);

  element[0].notes = "";

  for (const k in element[0]) {
    if (k == "id" || k == "status" || k == "pic") continue;
    const l = document.createElement("label");
    l.textContent = LabelNames[k];
    const e = document.createElement("input");
    e.value = element[0][k];
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
    changeForm.append("id", key);
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

    fetch("/user/edit", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        detailsDiv.innerHTML = "";
        userSearchBtn.click();
      })
    );
  }
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
