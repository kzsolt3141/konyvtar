const form = document.getElementById("uj_kliens");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  formData.forEach((value, key) => {
    console.log(key + ": " + value);
  });

  fetch("/kliens/mentes", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => console.log(data));
});
