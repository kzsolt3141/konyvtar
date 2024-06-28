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

    const avl = await common.bookIsAvailableById(bid);
    if (avl[0] == true) {
      document.getElementById("action_title").innerHTML = "A konyv elerheto";
      document.getElementById("lend_btn").style.display = "none";
    } else {
      const loanBtn = document.getElementById("lend_btn");
      if (loanBtn) {
        loanBtn.addEventListener("click", function () {
          document.getElementById("action_details").style.display = "block";
          const input = document.getElementById("action_notes");
          document.getElementById("action_details").action =
            "/loan/book/" + bid;
          console.log(document.getElementById("action_details"));
          input.value = "";
          input.placeholder = "Visszahozott konyv; megjegyzes";
        });
      }
      // TODO make this nicer
      document.getElementById("action_title").innerHTML = avl[1];
    }
  }
}
//----------------------------------------------------------------

//TODO update form action to: book/status/1 to toggle it SEE toggleStatus(id)
const toggleStatusBtn = document.getElementById("status_btn");
if (toggleStatusBtn) {
  toggleStatusBtn.addEventListener("click", function () {
    document.getElementById("action_details").style.display = "block";
    const input = document.getElementById("action_notes");
    input.value = "";
    input.placeholder = "Aktivalas/Deaktivalas oka";
  });
}

const cancelBtn = document.getElementById("cancel_action");
if (cancelBtn) {
  cancelBtn.addEventListener("click", function () {
    document.getElementById("action_details").style.display = "none";
  });
}

//TODO finish the implementation
async function toggleStatus(id) {
  const changeForm = new FormData();
  changeForm.append("update", "status");
  changeForm.append("notes", e.value);

  common.disableMain();

  fetch("/book/" + book.id, {
    method: "PUT",
    body: changeForm,
  }).then((rsp) =>
    rsp.json().then((data) => {
      common.updateStatus(data);
      common.enableMain();
    })
  );
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
