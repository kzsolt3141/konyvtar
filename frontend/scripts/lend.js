function createLendButton(place) {
  const title = document.createElement("h1");
  const button = document.createElement("button");
  button.id = "lend_button";

  place.appendChild(title);
  place.appendChild(button);

  title.textContent = "Kolcsonzes";

  button.textContent = "Kolcsonzes";
  // button.disabled = true;
  button.addEventListener("click", function () {
    var bookRadio = document.querySelector('input[name="book_radio"]:checked');
    var userRadio = document.querySelector('input[name="user_radio"]:checked');
    if (bookRadio && userRadio) {
      console.log(bookRadio.id, userRadio.id);
      createLendForm(bookRadio.id, userRadio.id, place);
    } else {
      const statusDiv = document.getElementById("global_status");
      const message = document.createElement("p");
      message.textContent =
        "Kolcsonzeshez valass egy konyvet es egy felhasznalot";
      statusDiv.appendChild(message);
    }
  });
}

const lendDiv = document.getElementById("lend_div");

createLendButton(lendDiv);

// define a new genre and send it back to the DB
function createLendForm(bid, uid, place) {
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
    lendForm.append("bid", bid);
    lendForm.append("uid", uid);
    lendForm.append("lend_notes", input.value);

    fetch("/lend/add", {
      method: "POST",
      body: lendForm,
    })
      .then((rsp) => rsp.text())
      .then((data) => {
        console.log(data);
        // location.reload();
      });
  });

  cancelButton.addEventListener("click", function (event) {
    // location.reload();
  });
}
