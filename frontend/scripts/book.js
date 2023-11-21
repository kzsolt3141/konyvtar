const form = document.getElementById("add_book");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  formData.forEach((value, key) => {
    console.log(key + ": " + value);
  });

  fetch("/book/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => alert(data));
});
