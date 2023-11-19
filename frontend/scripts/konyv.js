const form = document.getElementById("uj_konyv");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  formData.forEach((value, key) => {
    console.log(key + ": " + value);
  });

  fetch("/konyv/mentes", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => alert(data));
});
