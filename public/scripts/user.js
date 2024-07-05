import { common } from "./common.js";

const password = document.getElementById("password");
const confirm_password = document.getElementById("confirm_password");

function validatePassword() {
  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity("");
  }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;

document.getElementById("image").addEventListener("change", function (event) {
  const fileInput = event.target;
  const imagePreview = document.getElementById("book_thumbnail");

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };

    reader.readAsDataURL(fileInput.files[0]);
  }
});

//TODO finish the implementation: see book notes, loans and status update
const element = document.getElementById("uid");
if (element) {
  const uid = element.getAttribute("content");
  if (uid != "") {
    const userNotes = await common.getUserNotesById(uid);
    const loans = await common.getLoanByUid(uid);

    const userNotesText = document.getElementById("user_notes");
    userNotes.forEach((userNote) => {
      for (const k in userNote) {
        const e = document.createElement("p");
        e.textContent = userNote[k];
        userNotesText.appendChild(e);
      }
    });

    const userLoanText = document.getElementById("user_loan");
    loans.forEach((loan) => {
      for (const k in loan) {
        const e = document.createElement("p");
        e.textContent = loan[k];
        userLoanText.appendChild(e);
      }
    });
  }
}

//TODO finish the implementation
async function toggleStatus(id) {
  const changeForm = new FormData();
  changeForm.append("update", "status");
  changeForm.append("notes", e.value);

  common.disableMain();

  fetch("/user/" + book.id, {
    method: "PUT",
    body: changeForm,
  }).then((rsp) =>
    rsp.json().then((data) => {
      common.updateStatus(data);
      common.enableMain();
    })
  );
}
