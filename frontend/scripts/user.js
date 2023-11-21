const form = document.getElementById("add_user");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  fetch("/user/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => console.log(data));
});
