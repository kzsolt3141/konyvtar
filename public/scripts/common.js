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

document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu img.active").forEach((btn) => {
    btn.classList.remove("active");
  });

  const dropdownBtn = e.target.closest("img");
  if (dropdownBtn) {
    dropdownBtn.classList.add("active");
  }
});

function getCurrentDate() {
  const date = new Date();
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, "0");
  var day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
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

async function getActiveBookLoan(bid) {
  var text = null;
  try {
    text = await fetch(`/loan/book/active/${bid}`, {
      method: "GET",
    }).then((res) => {
      return res.ok ? res.text() : null;
    });
  } catch (err) {
    console.log(err);
  }

  return text ? JSON.parse(text) : null;
}

async function getActiveUserLoan(uid) {
  var text = null;
  try {
    text = await fetch(`/loan/user/active/${uid}`, {
      method: "GET",
    }).then((res) => {
      return res.ok ? res.text() : null;
    });
  } catch (err) {
    console.log(err);
  }

  return text ? JSON.parse(text) : null;
}

async function getBookById(bid) {
  var book = null;
  try {
    book = await fetch(`/book/details/${bid}`, {
      method: "GET",
    }).then((res) => {
      //TODO check if res has json else throw error
      return res.ok ? res.json() : null;
    });
  } catch (err) {
    console.log(err);
  }

  return book;
}

async function getBookNotesById(bid) {
  var bookNotes = null;
  try {
    bookNotes = await fetch(`/book/notes/${bid}`, {
      method: "GET",
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Couldn't get book notes");
      }

      return res.json();
    });
  } catch (err) {
    console.log(err);
  }

  return bookNotes;
}

async function getUserById(bid) {
  var user = null;
  try {
    user = await fetch(`/user/details/${bid}`, {
      method: "GET",
    }).then((res) => {
      //TODO check if res has json else throw error
      return res.ok ? res.json() : null;
    });
  } catch (err) {
    console.log(err);
  }

  return user;
}

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
  var loan = null;
  try {
    loan = await fetch(`/loan/user/${uid}`, {
      method: "GET",
    }).then((res) => {
      return res.ok ? res.json() : null;
    });
  } catch (err) {
    console.log(err);
  }

  return loan;
}

async function getLoanByBid(uid) {
  var loan = null;
  try {
    loan = await fetch(`/loan/book/${uid}`, {
      method: "GET",
    }).then((res) => {
      return res.ok ? res.json() : null;
    });
  } catch (err) {
    console.log(err);
  }

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

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    try {
      const rsp = await fetch("/user/login", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error logging out:", err);
    }
    window.location.reload();
  });
}

export const common = {
  BookLabelNames,
  UserLabelNames,
  getCurrentDate,
  updateStatus,
  showVersion,
  disableMain,
  enableMain,
  showPic,
  getActiveBookLoan,
  getActiveUserLoan,
  getBookById,
  getBookNotesById,
  getUserById,
  getUserNotesById,
  getLoanByBid,
  getLoanByUid,
  createOrderingSelector,
};
