import { common } from "./common.js";

const detailsDiv = document.getElementById("details_div");
function clearPlace(place) {
  place.innerHTML = "";
}

let UserData = [];

common.createOrderingSelector(
  "user_order",
  document.getElementById("user_order_div"),
  UserData,
  common.UserLabelNames,
  common.reorderData,
  listUsers
);

const userSearchBtn = document.getElementById("search_user");
if (userSearchBtn) {
  userSearchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const userForm = document.getElementById("search_users");
    const userFormData = new FormData(userForm);
    event.preventDefault();
    searchUser(userFormData);
  });
}
function userClickCb(id) {
  common.disableMain();
  window.location.href = `/user/full/${id}`;
  common.enableMain();
}

function searchUser(formData) {
  common.disableMain();
  UserData.length = 0;
  fetch("/user/find/bulk", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      UserData.push(JSON.parse(data));
      common.enableMain();
      listUsers(UserData);
    });
}

function listUsers(userData) {
  const usersDiv = document.getElementById("users_div");
  usersDiv.innerHTML = "";

  const users = UserData[0];

  users.forEach((userObj) => {
    const user = userObj[0];

    const userDiv = document.createElement("div");
    usersDiv.appendChild(userDiv);
    userDiv.id = user.id;
    userDiv.className = "book_div";

    common.showPic(user.id, user.pic, userDiv, userClickCb);

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
      editUser(user);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/details.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      details(userObj);
    });
    thirdLineDiv.appendChild(img);

    img = document.createElement("img");
    img.src = "styles/static/broken.svg";
    img.className = "detail_options";
    img.addEventListener("click", function () {
      toggleStatus(user);
    });
    thirdLineDiv.appendChild(img);
  });
}

async function details(userObj) {
  const user = userObj[0];
  common.initDetailDiv(detailsDiv, clearPlace, "Reszletek");

  common.showPic(user.id, user.pic, detailsDiv, userClickCb);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";

  for (const k in user) {
    if (k == "pic") continue;
    if (k == "notes") continue;
    const e = document.createElement("p");
    e.textContent = common.UserLabelNames[k];
    detailText.appendChild(e);
    const e2 = document.createElement("p");
    e2.textContent = user[k];
    detailText.appendChild(e2);
  }

  detailsDiv.appendChild(detailText);

  detailText = document.createElement("div");
  detailText.className = "detail_text2";

  userObj.slice(1).map((item) => {
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
  const list = await getLendedBookList(user.id);
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
  const rsp = await fetch(`/user/find/loan=${uid}`, {
    method: "GET",
  });
  const bookList = await rsp.json();

  return bookList;
}

async function toggleStatus(user) {
  common.initDetailDiv(
    detailsDiv,
    okFunction,
    "Felhasznalo Deaktivalas/Aktivalas"
  );
  common.showPic(user.id, user.pic, detailsDiv, userClickCb);

  const currentStatus = user.status == 1 ? "Aktiv" : "Inaktiv";
  const nextStatus = user.status == 1 ? "Inaktiv" : "Aktiv";

  const detailText = document.createElement("div");
  detailText.className = "detail_text2";
  detailsDiv.appendChild(detailText);

  var p = document.createElement("p");
  p.textContent = user.name + " nevul felhasznalo allapot valtoztatasa";
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
    changeForm.append("id", user.id);
    changeForm.append("notes", e.value);
    common.disableMain();
    fetch("/user/edit", {
      method: "POST",
      body: changeForm,
    }).then((rsp) =>
      rsp.json().then((data) => {
        common.enableMain();
        detailsDiv.innerHTML = "";
        userSearchBtn.click();
      })
    );
  }
}

function editUser(user) {
  common.initDetailDiv(detailsDiv, okFunction, "Profil Szerkesztes");
  common.showPic(user.id, user.pic, detailsDiv, userClickCb);

  var detailText = document.createElement("div");
  detailText.className = "detail_text";
  detailsDiv.appendChild(detailText);

  user.notes = "";

  for (const k in user) {
    if (k == "id" || k == "status" || k == "pic") continue;
    const l = document.createElement("label");
    l.textContent = common.UserLabelNames[k];
    const e = document.createElement("input");
    e.value = user[k];
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
    changeForm.append("id", user.id);
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

  for (const key in common.UserLabelNames) {
    const option = document.createElement("option");
    option.value = key;
    option.text = common.UserLabelNames[key];
    typeSelect.add(option);
  }

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value !== "Rendezes")
      common.reorderData(UserData, typeSelect.value, listUsers);
  });

  place.appendChild(typeSelect);
}
