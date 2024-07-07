const BookLabelNames = {
  id: "Azonosito",
  isbn: "ISBN",
  title: "Cim",
  author: "Szerzo",
  genre: "Tipus",
  year: "Megjelent",
  publ: "Kiado",
  ver: "Kiadas",
  status: "Allapot",
  keys: "Kulcsszavak",
  notes: "Megjegyzesek",
  available: "Elerheto",
  price: "Ar(lej)",
};

const UserLabelNames = {
  id: "Azonosito",
  name: "Nev",
  address: "Cim",
  phone: "Telefonszam",
  email: "E-Mail",
  status: "Allapot",
  notes: "Megjegyzesek",
};

function getCurrentDate() {
  const date = new Date();
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0");
  var day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function reorderData(dataArr, prop, cb = null) {
  if (!dataArr) return;

  const data = dataArr[0];
  //TODO use uppercase for not INT data
  data.sort((a, b) => {
    const propA = a[prop];
    const propB = b[prop];

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
  img.src = "/styles/static/progress.svg";
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

async function bookIsAvailableById(bid) {
  const rsp = await fetch(`/loan/available/${bid}`, {
    method: "GET",
  });
  const available = await rsp.json();
  return available;
}

async function getBookById(bid) {
  const rsp = await fetch(`/book/details/${bid}`, {
    method: "GET",
  });
  const book = await rsp.json();
  return book;
}

//TODO secure all fetches like this
async function getBookNotesById(bid) {
  var bookNotes = null;
  try {
    const rsp = await fetch(`/book/notes/${bid}`, {
      method: "GET",
    });

    if (rsp.ok) {
      bookNotes = await rsp.json();
    } else {
      rsp.text().then((text) => console.log(text));
    }
  } catch (err) {
    console.log(err);
  }

  return bookNotes;
}

async function getUserById(bid) {
  const rsp = await fetch(`/user/details/${bid}`, {
    method: "GET",
  });
  const user = await rsp.json();
  return user;
}

//TODO secure all fetches like this
async function getUserNotesById(uid) {
  var userNotes = null;
  try {
    const rsp = await fetch(`/user/notes/${uid}`, {
      method: "GET",
    });

    if (rsp.ok) {
      userNotes = await rsp.json();
    } else {
      rsp.text().then((text) => console.log(text));
    }
  } catch (err) {
    console.log(err);
  }

  return userNotes;
}

async function getLoanByUid(uid) {
  const rsp = await fetch(`/loan/user/${uid}`, {
    method: "GET",
  });
  const loan = await rsp.json();

  return loan;
}

async function getLoanByBid(uid) {
  const rsp = await fetch(`/loan/book/${uid}`, {
    method: "GET",
  });
  const loan = await rsp.json();

  return loan;
}

function createOrderingSelector(id, place, label, sortcb) {
  if (!place) return;
  const typeSelect = document.createElement("select");
  typeSelect.id = id;
  typeSelect.name = id;

  for (const key in label) {
    if (key == "id" || key == "available" || key == "notes" || key == "status")
      continue;
    const option = document.createElement("option");
    option.value = key;
    option.text = label[key];
    typeSelect.add(option);
  }

  typeSelect.addEventListener("change", () => {
    if (sortcb) {
      sortcb(typeSelect.value);
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
    window.location.href = "/book";
  });
}

const bookTableBtn = document.getElementById("book_table_btn");
if (bookTableBtn) {
  bookTableBtn.addEventListener("click", async (event) => {
    window.location.href = "/book/table";
  });
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    const rsp = await fetch("/user/login", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (rsp) window.location.reload();
  });
}

export const common = {
  BookLabelNames,
  UserLabelNames,
  getCurrentDate,
  reorderData,
  updateStatus,
  showVersion,
  disableMain,
  enableMain,
  showPic,
  bookIsAvailableById,
  getBookById,
  getBookNotesById,
  getUserById,
  getUserNotesById,
  getLoanByBid,
  getLoanByUid,
  createOrderingSelector,
};
