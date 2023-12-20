const mainBtn = document.getElementById("main_btn");
mainBtn.addEventListener("click", async (event) => {
  window.location.href = "/";
});

const form = document.getElementById("add_user");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  fetch("/user/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => updateStatus(data));
});

function updateStatus(data) {
  document.querySelector(".submit_status").textContent = data;
}
