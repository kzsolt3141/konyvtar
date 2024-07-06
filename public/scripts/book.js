//import genre related functions
import { common } from "./common.js";

//----------------------------------------------------------------
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
const bookSts = document.getElementById("sts").getAttribute("content");

if (isBlank === "false") {
  const bid = document.getElementById("bid").getAttribute("content");
  if (bid != "") {
    const bookNotes = await common.getBookNotesById(bid);
    const loans = await common.getLoanByBid(bid);

    const bookNotesText = document.getElementById("book_notes");
    if (bookNotesText && bookNotes) {
      bookNotes.forEach((bookNote) => {
        for (const k in bookNote) {
          const e = document.createElement("p");
          e.textContent = bookNote[k];
          bookNotesText.appendChild(e);
        }
      });
    }

    const bookLoanText = document.getElementById("book_loan");
    if (bookLoanText && loans) {
      loans.forEach((loan) => {
        for (const k in loan) {
          const e = document.createElement("p");
          e.textContent = loan[k];
          bookLoanText.appendChild(e);
        }
      });
    }

    var fetch_link = "";
    const avl = await common.bookIsAvailableById(bid);
    const loanBtn = document.getElementById("lend_btn");
    const action_title = document.getElementById("action_title");

    if (bookSts == true && avl[0] == true) {
      action_title.innerHTML = "A konyv elerheto";
      loanBtn.style.display = "none";
    } else if (bookSts == true && avl[0] == false) {
      loanBtn.addEventListener("click", function () {
        const actionDetForm = document.getElementById("action_details");
        actionDetForm.style.display = "block";

        const input = document.getElementById("action_notes");
        input.value = "";
        input.placeholder = "Kolcsonzes/visszahozas oka";

        fetch_link = `/loan/book/${bid}`;
      });

      // TODO use user name in the message
      // TODO make it hyperlink -> to user page
      action_title.innerHTML = `A konyv kiadva a ${avl[1]} felhasznalonak`;
    } else {
      action_title.innerHTML = `A konyv inaktiv`;
    }

    const toggleStatusBtn = document.getElementById("status_btn");
    if (toggleStatusBtn) {
      toggleStatusBtn.addEventListener("click", function () {
        const actionDetForm = document.getElementById("action_details");
        actionDetForm.style.display = "block";

        const input = document.getElementById("action_notes");
        input.value = "";
        input.placeholder = "Aktivalas/Deaktivalas oka";

        fetch_link = `/book/${bid}`;
      });
    }

    const submitBtn = document.getElementById("submit_action");
    if (submitBtn) {
      submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        const actionForm = document.getElementById("action_details");
        const actionFormData = new FormData(actionForm);

        common.disableMain();
        fetch(fetch_link, {
          method: "PUT",
          body: actionFormData,
        })
          .then((rsp) => rsp.json())
          .then((data) => {
            console.log(data);
            const bookStatus = data.bookStatus == 1 ? "Aktiv" : "Inaktiv";
            common.updateStatus(
              `${data.bookTitle} -> ${data.message}. new status: ${bookStatus}`
            );
            document.getElementById("action_details").style.display = "none";
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
  }
}

//----------------------------------------------------------------
fillGenreSelect(document.getElementById("genre"));

function fillGenreSelect(selector) {
  if (!selector) return;

  selector.innerHTML = "";

  fetch("/book/genres", {
    method: "POST",
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      JSON.parse(data).forEach((opt, idx) => {
        const option = document.createElement("option");
        option.value = opt["genre"];
        option.text = opt["genre"];
        selector.add(option);
      });
    });
}

const addGenreBtn = document.getElementById("add_genre_btn");
const addGenreDiv = document.getElementById("genre_add_div");

const input = document.getElementById("add_genre_text");
const addButton = document.getElementById("submit_add_genre");
const cancelButton = document.getElementById("cancel_add_genre");

addGenreBtn.addEventListener("click", function (event) {
  event.preventDefault();
  addGenreDiv.style.display = "block";
});

addButton.addEventListener("click", function (event) {
  event.preventDefault();
  if (input.value.trim() === "") {
    console.log("Input field empty");
    return;
  }
  common.disableMain();

  fetch("/book/genres/" + input.value, {
    method: "POST",
  })
    .then((rsp) => rsp.text())
    .then((data) => {
      common.enableMain();
      addGenreDiv.style.display = "none";
      fillGenreSelect(document.getElementById("genre"));
    });
});

cancelButton.addEventListener("click", function (event) {
  addGenreDiv.style.display = "none";
});
