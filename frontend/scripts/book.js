const currentDate = new Date().toISOString().split("T")[0];
document.getElementById("notes").value = `Init: ${currentDate}`;

const form = document.getElementById("add_book");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  fetch("/book/add", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.text())
    .then((data) => updateStatus(data));
});

function updateStatus(data) {
  document.querySelector(".submit_status").textContent = data;
}
