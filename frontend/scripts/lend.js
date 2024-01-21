import {
  initDetailDiv,
  updateStatus,
  disableMain,
  enableMain,
  getBookById,
  getUserById,
} from "./common.js";
import { showBookPic } from "./index_books.js";

const button = document.getElementById("lend_button");
const place = document.getElementById("details_div");
const statusDiv = document.getElementById("global_status");

// button.disabled = true;
button.addEventListener("click", async function () {
  place.innerHTML = "";
  var bookRadio = document.querySelector('input[name="book_radio"]:checked');
  var userRadio = document.querySelector('input[name="user_radio"]:checked');

  const message = document.createElement("p");
  statusDiv.appendChild(message);

  if (bookRadio && userRadio) {
    await lendBook(bookRadio.id, userRadio.id, place, true);
  } else {
    updateStatus("Kolcsonzeshez valassz egy konyvet es felhasznalot");
  }
});

// define a new genre and send it back to the DB
export async function lendBook(bid, uid, place, isLend) {
  const book = await getBookById(bid);
  const user = await getUserById(uid);

  const bookTitle = book.title;
  const userName = user.name;

  initDetailDiv(place, okFunction, "Visszahozott konyv");
  showBookPic(book.id, book.pic, place, false);

  const textDiv = document.createElement("div");
  place.appendChild(textDiv);
  textDiv.className = "detail_text2";

  var p = document.createElement("p");
  p.textContent = bookTitle + " cimu konyvet";
  textDiv.appendChild(p);

  p = document.createElement("p");
  p.textContent = isLend == true ? "kiveszi " : " visszahozza";
  textDiv.appendChild(p);

  p = document.createElement("p");
  p.textContent = userName + " nevu felhasznalo";
  textDiv.appendChild(p);

  const input = document.createElement("input");
  textDiv.appendChild(input);

  function okFunction(place) {
    const lendForm = new FormData();
    lendForm.append("type", isLend);
    lendForm.append("bid", bid);
    lendForm.append("uid", uid);
    lendForm.append("notes", input.value);
    disableMain();
    fetch("/loan/add", {
      method: "POST",
      body: lendForm,
    })
      .then((rsp) => rsp.text())
      .then((data) => {
        place.innerHTML = "";
        enableMain();
        location.reload();
      });
  }
}
