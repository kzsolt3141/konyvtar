const form = document.getElementById("konyv_kereses");
var listaDiv = document.querySelector(".lista");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  listaDiv.innerHTML = "";

  const formData = new FormData(form);

  formData.forEach((value, key) => {
    console.log(key + ": " + value);
  });

  fetch("/konyv/kereses", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      JSON.parse(data).forEach((value, key) => {
        console.log(value);
        if (listaDiv) {
          var paragraph = document.createElement("p");
          paragraph.textContent = value.konyv_cim + " " + value.szerzo;
          listaDiv.appendChild(paragraph);
          var button = document.createElement("button");
          button.textContent = "Torles";
          button.addEventListener("click", function () {
            konyv_torles(value.isbn);
          });
          listaDiv.appendChild(button);
          button = document.createElement("button");
          button.textContent = "Szerkesztes";
          button.addEventListener("click", function () {
            konyv_torles(value.isbn);
          });
          listaDiv.appendChild(button);
          button = document.createElement("button");
          button.textContent = "Reszletek";
          button.addEventListener("click", function () {
            konyv_torles(value.isbn);
          });
          listaDiv.appendChild(button);
        }
        // add to the page
      });
    });
});

function konyv_torles(key) {
  fetch("/konyv/torles", {
    method: "POST",
    body: key,
  }).then((rsp) =>
    rsp.json().then((data) => {
      console.log(data);
      //TODO @Zsolt refresh the list of books
    })
  );
}
