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
    method: "POST",
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      updateStatus(data);
    });
});

function showVersion(file = "VERSION") {
  const ver = document.getElementById("version");
  fetch(file)
    .then((response) => response.text())
    .then((version) => {
      // Display the version at the bottom of the page
      const versionElement = document.createElement("p");
      versionElement.innerText = "Version: " + version;
      ver.appendChild(versionElement);
    })
    .catch((error) => console.error("Error fetching version:", error));
}

showVersion();
