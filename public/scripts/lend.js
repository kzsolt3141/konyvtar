import { common } from "./common.js";

const button = document.getElementById("lend_button");

if (button) {
  button.addEventListener("click", async function () {
    const loanDetails = document.getElementById("loan_details");
    const cancelButton = document.getElementById("cancel_loan");
    const submitButton = document.getElementById("submit_loan");
    const info = document.getElementById("loan_info");

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

    //TODO check if book and user are valid responses
    const book = await common.getBookById(bookRadio.id);
    const user = await common.getUserById(userRadio.id);

    const bookTitle = book.title;
    const userName = user.name;
    info.innerHTML = userName + " kikolcsonzi " + bookTitle + " konyvet";

    submitButton.addEventListener("click", async (event) => {
      event.preventDefault();
      const loanForm = document.getElementById("loan_form");
      const loanFormData = new FormData(loanForm);

      loanFormData.append("bid", bookRadio.id);

      // lendBook(bookRadio.id, userRadio.id);
      common.disableMain();
      fetch(`/loan/user/${userRadio.id}`, {
        method: "PUT",
        body: loanFormData,
      })
        .then((rsp) => rsp.text())
        .then((data) => {
          common.updateStatus(data);
          loanDetails.style.display = "none";
          common.enableMain();
        });
    });

    cancelButton.addEventListener("click", function (event) {
      loanDetails.style.display = "none";
    });
  });
}
