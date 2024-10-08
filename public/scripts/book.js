//import genre related functions
import { common } from "./common.js";

const bookMessage = document.getElementById("message").getAttribute("content");
common.updateStatus(bookMessage);

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
          if (k == "id") continue;
          const e = document.createElement("p");
          e.textContent = loan[k];
          bookLoanText.appendChild(e);
        }
      });
    }

    var fetch_link = "";
    const activeLoan = await common.getActiveBookLoan(bid);
    const loanBtn = document.getElementById("lend_btn");
    const action_title = document.getElementById("action_title");

    if (bookSts == true && !activeLoan) {
      action_title.innerHTML = "A konyv elerheto";
      loanBtn.style.display = "none";
    } else if (bookSts == true && activeLoan) {
      loanBtn.addEventListener("click", function () {
        const actionDetForm = document.getElementById("action_details");
        actionDetForm.style.display = "block";

        const input = document.getElementById("action_notes");
        input.value = "";
        input.placeholder = "Kolcsonzes/visszahozas oka";

        fetch_link = `/loan/book/${bid}`;
      });

      action_title.innerHTML = `A konyv kiadva <a href="/user/${activeLoan.uid}">${activeLoan.name}</a> felhasznalonak`;
    } else {
      loanBtn.style.display = "none";
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
          .then((rsp) => {
            if (rsp.ok) {
              return rsp.json();
            } else {
              throw new Error(`HTTP error! Status: ${rsp.status}`);
            }
          })
          .then((data) => {
            common.updateStatus(data);
            document.getElementById("action_details").style.display = "none";
            common.enableMain();
          })
          .catch((error) => {
            console.error("Error:", error);
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

  try {
    fetch("/book/genres", {
      method: "GET",
    })
      .then((rsp) => {
        if (rsp.ok) {
          const contentType = rsp.headers.get("content-type");
          if (contentType.includes("application/json")) {
            return rsp.json();
          } else {
            throw new Error(rsp.text());
          }
        } else {
          throw new Error("Couldn't get genres from database");
        }
      })
      .then((data) => {
        if (!data) {
          throw new Error("Couldn't get genres from database");
        }
        data.forEach((opt, idx) => {
          const option = document.createElement("option");
          option.value = opt["genre"];
          option.text = opt["genre"];
          selector.add(option);
        });
      });
  } catch (e) {
    console.error("Error fetching genres:", e);
  }
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
  try {
    fetch("/book/genres/" + input.value, {
      method: "POST",
    }).then((rsp) => {
      if (!rsp.ok) {
        throw new Error("Could not add genre to database");
      }
      addGenreDiv.style.display = "none";
      fillGenreSelect(document.getElementById("genre"));
    });
  } catch (e) {
    console.log(" error: " + e);
  }
  common.enableMain();
});

cancelButton.addEventListener("click", function (event) {
  addGenreDiv.style.display = "none";
});
