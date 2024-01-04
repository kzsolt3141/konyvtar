import { initDetailDiv } from "./common.js";
import { getBookTitleById, showBookPic } from "./index_books.js";
import { getUserNameById } from "./index_users.js";

const button = document.getElementById("lend_button");
const place = document.getElementById("details_div");
const statusDiv = document.getElementById("global_status");

// button.disabled = true;
button.addEventListener("click", function () {
  place.innerHTML = "";
  var bookRadio = document.querySelector('input[name="book_radio"]:checked');
  var userRadio = document.querySelector('input[name="user_radio"]:checked');

  const message = document.createElement("p");
  statusDiv.appendChild(message);

  if (bookRadio && userRadio) {
    console.log(bookRadio.id, userRadio.id);
    lendBook(bookRadio.id, userRadio.id, place, true);
  } else {
    // TODO show this to the global status DIV
    message.textContent = "Valassz egy konyvet es/vagy egy felhasznalot";
  }
});

// define a new genre and send it back to the DB
export async function lendBook(bid, uid, place, isLend) {
  const bookName = await getBookTitleById(bid);
  const userName = await getUserNameById(uid);

  initDetailDiv(place, okFunction);
  showBookPic(bid, place, false);

  const textDiv = document.createElement("div");
  place.appendChild(textDiv);

  const p = document.createElement("p");
  p.className = "lend_title";
  p.textContent =
    bookName +
    (isLend == true ? " \t kiveszi: " : " visszahozza: \t") +
    userName;
  textDiv.appendChild(p);

  const input = document.createElement("input");
  textDiv.appendChild(input);

  function okFunction(place) {
    const lendForm = new FormData();
    lendForm.append("type", isLend);
    lendForm.append("bid", bid);
    lendForm.append("uid", uid);
    lendForm.append("notes", input.value);

    fetch("/lend/add", {
      method: "POST",
      body: lendForm,
    })
      .then((rsp) => rsp.text())
      .then((data) => {
        console.log(data);
        place.innerHTML = "";
        location.reload();
      });
  }
}
