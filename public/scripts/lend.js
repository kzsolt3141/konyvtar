import { common } from "./common.js";

const button = document.getElementById("lend_button");
const loanDetails = document.getElementById("loan_details");
const submitButton = document.getElementById("submit_loan");
const cancelButton = document.getElementById("cancel_loan");
const notes = document.getElementById("loan_text");
const info = document.getElementById("loan_info");

if (button) {
  button.addEventListener("click", async function () {
    var bookRadio = document.querySelector('input[name="book_radio"]:checked');
    var userRadio = document.querySelector('input[name="user_radio"]:checked');
    // TODO future improvement when USER can loan book directly
    // if (userRadio == null) {
    //   const element = document.getElementById("uid");
    //   if (element) {
    //     userRadio.id = element.getAttribute("content");
    //   }
    // }

    if (!bookRadio || !userRadio) {
      common.updateStatus(
        "Kolcsonzeshez valassz egy konyvet es/vagy felhasznalot"
      );
      return;
    }

    loanDetails.style.display = "block";

    const book = await common.getBookById(bookRadio.id);
    const user = await common.getUserById(userRadio.id);

    const bookTitle = book.title;
    const userName = user.name;
    info.textContent = userName + " kikolcsonzi " + bookTitle + " konyvet";

    submitButton.addEventListener("click", function () {
      lendBook(bookRadio.id, userRadio.id);
    });
  });
}

cancelButton.addEventListener("click", function (event) {
  loanDetails.style.display = "none";
});

// define a new genre and send it back to the DB
export function lendBook(bid, uid) {
  const lendForm = new FormData();
  lendForm.append("bid", bid);
  lendForm.append("uid", uid);
  lendForm.append("notes", notes.value);
  common.disableMain();
  fetch("/loan", {
    method: "POST",
    body: lendForm,
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      loanDetails.style.display = "none";
      common.enableMain();
    });
}
