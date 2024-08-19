import { common } from "./common.js";

const userMessage = document.getElementById("message").getAttribute("content");
common.updateStatus(userMessage);

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

//----------------------------------------------------------------
const isBlank = document.getElementById("blank").getAttribute("content");
const userSts = document.getElementById("sts").getAttribute("content");

if (isBlank === "false") {
  const uid = document.getElementById("uid").getAttribute("content");
  if (uid != "") {
    const userNotes = await common.getUserNotesById(uid);
    const loans = await common.getLoanByUid(uid);

    const userNotesText = document.getElementById("user_notes");
    if (userNotesText && userNotes) {
      userNotes.forEach((userNote) => {
        for (const k in userNote) {
          const e = document.createElement("p");
          e.textContent = userNote[k];
          userNotesText.appendChild(e);
        }
      });
    }

    const userLoanText = document.getElementById("user_loan");
    if (userLoanText && loans) {
      loans.forEach((loan) => {
        for (const k in loan) {
          const e = document.createElement("p");
          e.textContent = loan[k];
          userLoanText.appendChild(e);
        }
      });
    }

    const action_title = document.getElementById("action_title");

    if (action_title) {
      action_title.innerHTML = `A felhasznalo ${
        userSts == true ? "Aktiv" : "Inaktiv"
      }`;
    }

    const toggleStatusBtn = document.getElementById("status_btn");
    if (toggleStatusBtn) {
      toggleStatusBtn.addEventListener("click", function () {
        const actionDetForm = document.getElementById("action_details");
        actionDetForm.style.display = "block";

        const input = document.getElementById("action_notes");
        input.value = "";
        input.placeholder = "Aktivalas/Deaktivalas oka";
      });
    }

    const submitBtn = document.getElementById("submit_action");
    if (submitBtn) {
      submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const actionForm = document.getElementById("action_details");
        const actionFormData = new FormData(actionForm);

        common.disableMain();
        fetch(`/user/${uid}`, {
          method: "PUT",
          body: actionFormData,
        })
          .then((rsp) => {
            return rsp.ok ? rsp.text() : null;
          })
          .then((text) => {
            if (text) {
              data = JSON.parse(text);
              console.log(data);
              const userStatus = data.userStatus == 1 ? "Aktiv" : "Inaktiv";
              common.updateStatus(
                `${data.userName} -> ${data.message}. new status: ${userStatus}`
              );
              document.getElementById("action_details").style.display = "none";
            }
            common.enableMain();
          });
      });
    }

    const cancelBtn = document.getElementById("cancel_action");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        document.getElementById("action_details").style.display = "none";
      });
    }

    //TODO make it nicer: MAX should be RED, book links in a table of 1 row
    const activeLoanDiv = document.getElementById("active_loan");
    const activeLoans = await common.getActiveUserLoan(uid);
    if (activeLoans.length > 2) {
      const h3 = document.createElement("h3");
      h3.textContent = "MAX kolcsonzes!!";
      activeLoanDiv.appendChild(h3);
    }
    activeLoans.forEach((activeLoan) => {
      const a = document.createElement("a");
      a.textContent = `${activeLoan.title} ||  `;
      a.href = `/book/${activeLoan.bid}`;
      activeLoanDiv.appendChild(a);
    });
  }
}
