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
    userDetailsDiv.className = "book_details_div";
    userDiv.appendChild(userDetailsDiv);

    const firstLineDiv = document.createElement("div");
    firstLineDiv.className = "book_first_line";
    userDetailsDiv.appendChild(firstLineDiv);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "user_radio";
    radio.id = user.id;
    radio.disabled = user.status == 0;
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
  img.className = "user_thumbnail";

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

  initDetailDiv(detailsDiv, clearPlace, "Reszletek");

  showUserPic(id, detailsDiv, false);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";

  for (const k in element[0]) {
    if (k == "pic") continue;
    if (k == "notes") continue;
    const e = document.createElement("p");
    e.textContent = LabelNames[k];
    detailText.appendChild(e);
    const e2 = document.createElement("p");
    e2.textContent = element[0][k];
    detailText.appendChild(e2);
  }

  detailsDiv.appendChild(detailText);

  detailText = document.createElement("div");
  detailText.className = "detail_text2";

  element.slice(1).map((item) => {
    const e = document.createElement("p");
    e.textContent = item.date + ": " + item.notes;
    detailText.appendChild(e);
  });

  detailsDiv.appendChild(detailText);

  detailText = document.createElement("div");
  detailsDiv.appendChild(detailText);
  detailText.className = "detail_text2";

  var e = document.createElement("p");
  e.textContent = "Kikolcsonzott konyvek listaja:";
  detailText.appendChild(e);

  const d = document.createElement("div");
  const list = await getLendedBookList(id);
  if (list.length == 0) {
    const e = document.createElement("p");
    e.textContent = "Jelenleg nincs kikolcsonzott konyv";
    d.className = "detail_text_green";
    d.appendChild(e);
  } else {
    d.className = "detail_text_red";
    for (const book of list) {
      const e = document.createElement("p");
      e.textContent += book;
      d.appendChild(e);
    }
  }
  detailText.appendChild(d);
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

async function toggleStatus(id, name, status) {
  initDetailDiv(detailsDiv, okFunction, "Felhasznalo Deaktivalas/Aktivalas");
  showUserPic(id, detailsDiv, false);

  const currentStatus = status == 1 ? "Aktiv" : "Inaktiv";
  const nextStatus = status == 1 ? "Inaktiv" : "Aktiv";

  const detailText = document.createElement("div");
  detailText.className = "detail_text2";
  detailsDiv.appendChild(detailText);

  var p = document.createElement("p");
  p.textContent = name + " nevul felhasznalo allapot valtoztatasa";
  detailText.appendChild(p);

  p = document.createElement("p");
  p.textContent = currentStatus + "-rol";
  detailText.appendChild(p);

  p = document.createElement("p");
  p.textContent = nextStatus + "-ra";
  detailText.appendChild(p);

  const l = document.createElement("label");
  l.textContent = "Allapot valtoztatas oka:";

  const e = document.createElement("input");
  e.value = "";
  e.id = "notes";

  detailText.appendChild(l);
  detailText.appendChild(e);

  function okFunction() {
    const changeForm = new FormData();
    changeForm.append("update", "status");
    changeForm.append("id", id);
    changeForm.append("notes", e.value);

    fetch("/user/edit", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        console.log(data);
        detailsDiv.innerHTML = "";
      })
    );
  }
}

function editUser(key) {
  var element = null;
  for (const e of UserData) {
    if (e[0].id == key) {
      element = e;
      break;
    }
  }
  initDetailDiv(detailsDiv, okFunction, "Profil Szerkesztes");
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
