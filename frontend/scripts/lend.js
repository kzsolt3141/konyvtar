const button = document.getElementById("lend_button");
const place = document.getElementById("lend_div");
// button.disabled = true;
button.addEventListener("click", function () {
  var bookRadio = document.querySelector('input[name="book_radio"]:checked');
  var userRadio = document.querySelector('input[name="user_radio"]:checked');

  const statusDiv = document.getElementById("global_status");
  const message = document.createElement("p");
  statusDiv.appendChild(message);

  if (bookRadio && userRadio) {
    console.log(bookRadio.id, userRadio.id);
    createForm(bookRadio.id, userRadio.id, place, true);
  } else if (bookRadio) {
    const usedBook = document.getElementById("lend" + bookRadio.id);
    createForm(bookRadio.id, usedBook.value, place, false);
  } else {
    message.textContent = "Valassz egy konyvet es/vagy egy felhasznalot";
  }
});

// define a new genre and send it back to the DB
function createForm(bid, uid, place, isLend) {
  const input = document.createElement("input");
  place.appendChild(input);
  const addButton = document.createElement("button");
  addButton.textContent = "Hozzaad";
  place.appendChild(addButton);
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Megse";
  place.appendChild(cancelButton);

  addButton.addEventListener("click", function (event) {
    event.preventDefault();
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
        input.remove();
        addButton.remove();
        cancelButton.remove();
      });
  });

  cancelButton.addEventListener("click", function (event) {
    input.remove();
    addButton.remove();
    cancelButton.remove();
  });
}
