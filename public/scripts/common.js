const BookLabelNames = {
  id: "Azonosito:",
  isbn: "ISBN:",
  title: "Cim:",
  author: "Szerzo:",
  genre: "Tipus:",
  year: "Megjelent:",
  publ: "Kiado:",
  ver: "Kiadas:",
  status: "Allapot:",
  keys: "Kulcsszavak",
  notes: "Megjegyzesek:",
  available: "Elerheto:",
  price: "Ar(lej):",
};

const UserLabelNames = {
  id: "Azonosito:",
  name: "Nev:",
  address: "Cim:",
  phone: "Telefonszam:",
  mail: "E-Mail:",
  status: "Allapot:",
  notes: "Megjegyzesek:",
};

function getCurrentDate() {
  const date = new Date();
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0");
  var day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function reorderData(dataArr, prop, cb = null) {
  if (!dataArr[0]) return;

  const data = dataArr[0];
  //TODO use uppercase for not INT data
  data.sort((a, b) => {
    const propA = a[0][prop];
    const propB = b[0][prop];

    if (propA < propB) {
      return -1;
    }

    if (propA > propB) {
      return 1;
    }

    return 0;
  });
  if (cb) cb(data);
}

function initDetailDiv(place, okFunction, title = "") {
  place.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.className = "detail_title";
  h2.textContent = title;
  place.appendChild(h2);

  const okButton = document.createElement("img");
  place.appendChild(okButton);
  okButton.src = "styles/static/ok.svg";
  okButton.className = "ok_btn";
  okButton.addEventListener("click", function () {
    okFunction(place);
  });

  const cancelButton = document.createElement("img");
  place.appendChild(cancelButton);
  cancelButton.src = "styles/static/x.svg";
  cancelButton.className = "cancel_btn";
  cancelButton.addEventListener("click", function () {
    place.innerHTML = "";
  });
}

function updateStatus(data) {
  document.getElementById("global_status").textContent = data;
  setTimeout(() => {
    document.getElementById("global_status").innerHTML = "";
  }, 5000);
}

const backupBtn = document.getElementById("backup_btn");
if (backupBtn) {
  backupBtn.addEventListener("click", async (event) => {
    fetch("/backup", {
      method: "GET",
    })
      .then((data) => data.blob())
      .then((data) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = getCurrentDate() + "-BACKUP.zip";
        a.click();
        updateStatus("Backup generated");
      });
  });
}

function showVersion(file = "/VERSION") {
  const ver = document.getElementById("version");
  fetch(file)
    .then((response) => response.text())
    .then((version) => {
      console.log(version);
      // Display the version at the bottom of the page
      const versionElement = document.createElement("p");
      versionElement.innerText = "Version: " + version;
      ver.appendChild(versionElement);
    })
    .catch((error) => console.error("Error fetching version:", error));
}

showVersion();

function disableMain() {
  const div = document.getElementById("disable_div");
  div.className = "disable_div";

  const p = document.createElement("p");
  p.textContent = "Kerlek varj...";
  p.className = "disable_text";

  const img = document.createElement("img");
  img.src = "styles/static/progress.svg";
  img.className = "disable_thumbnail";

  div.appendChild(p);
  div.appendChild(img);
}

function enableMain() {
  const div = document.getElementById("disable_div");
  div.className = "enable_div";
  div.innerHTML = "";
}

function showPic(id, pic, place, cb) {
  const picDiv = document.createElement("div");
  place.appendChild(picDiv);

  const img = document.createElement("img");
  img.className = "thumbnail";

  if (pic == null) {
    img.src = "/styles/static/default_book.png";
  } else {
    img.src = "/" + pic;
  }

  img.addEventListener("click", (event) => {
    if (cb) cb(id);
  });

  picDiv.appendChild(img);
}

async function getBookById(bid) {
  const rsp = await fetch(`/book/find/id=${bid}`, {
    method: "GET",
  });
  const book = await rsp.json();
  return book;
}

async function getBookNotesById(bid) {
  const rsp = await fetch(`/book/find/nid=${bid}`, {
    method: "GET",
  });
  const bookNotes = await rsp.json();

  return bookNotes;
}

async function getUserById(bid) {
  const rsp = await fetch(`/user/find/id=${bid}`, {
    method: "GET",
  });
  const book = await rsp.json();
  return book;
}

async function getLoanById(uid) {
  const rsp = await fetch(`/loan/bid=${uid}`, {
    method: "GET",
  });
  const loan = await rsp.json();

  return loan;
}

function createOrderingSelector(id, place, data, label, sortcb, nextcb) {
  const typeSelect = document.createElement("select");
  typeSelect.id = id;

  const option = document.createElement("option");
  option.value = "";
  option.text = "Rendezes";
  typeSelect.add(option);

  for (const key in label) {
    if (key == "available" || key == "notes" || key == "status") continue;
    const option = document.createElement("option");
    option.value = key;
    option.text = label[key];
    typeSelect.add(option);
  }

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value !== "Rendezes") {
      sortcb(data, typeSelect.value, nextcb);
    }
  });

  place.appendChild(typeSelect);
}

const mainBtn = document.getElementById("main_btn");
if (mainBtn) {
  mainBtn.addEventListener("click", async (event) => {
    window.location.href = "/";
  });
}

const addBookBtn = document.getElementById("add_book_btn");
if (addBookBtn) {
  addBookBtn.addEventListener("click", async (event) => {
    window.location.href = "/book.html";
  });
}

const addUserBtn = document.getElementById("add_user_btn");
if (addUserBtn) {
  addUserBtn.addEventListener("click", async (event) => {
    window.location.href = "/user.html";
  });
}

const bookTableBtn = document.getElementById("book_table_btn");
if (bookTableBtn) {
  bookTableBtn.addEventListener("click", async (event) => {
    window.location.href = "/book_table.html";
  });
}

export const common = {
  BookLabelNames,
  UserLabelNames,
  getCurrentDate,
  reorderData,
  initDetailDiv,
  updateStatus,
  showVersion,
  disableMain,
  enableMain,
  showPic,
  getBookById,
  getBookNotesById,
  getUserById,
  getLoanById,
  createOrderingSelector,
};
