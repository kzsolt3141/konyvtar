export function initDetailDiv(place, okFunction, title = "") {
  place.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.className = "detail_title";
  h2.textContent = title;
  place.appendChild(h2);

  const okButton = document.createElement("img");
  place.appendChild(okButton);
  okButton.src = "/styles/static/ok.svg";
  okButton.className = "ok_btn";
  okButton.addEventListener("click", function () {
    okFunction(place);
  });

  const cancelButton = document.createElement("img");
  place.appendChild(cancelButton);
  cancelButton.src = "/styles/static/x.svg";
  cancelButton.className = "cancel_btn";
  cancelButton.addEventListener("click", function () {
    place.innerHTML = "";
  });
}

export function updateStatus(data) {
  document.getElementById("global_status").textContent = data;
  setTimeout(() => {
    document.getElementById("global_status").innerHTML = "";
  }, 5000);
}

const backupBtn = document.getElementById("backup_btn");
backupBtn.addEventListener("click", async (event) => {
  fetch("/backup", {
    method: "GET",
  })
    .then((data) => data.blob())
    .then((data) => {
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(data);
      a.download = "BACKUP.zip";
      a.click();
      updateStatus("Backup generated");
    });
});

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

export function disableMain() {
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

export function enableMain() {
  const div = document.getElementById("disable_div");
  div.className = "enable_div";
  div.innerHTML = "";
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
