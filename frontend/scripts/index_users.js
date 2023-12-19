const userSearchBtn = document.getElementById("search_user");

userSearchBtn.addEventListener("click", async (event) => {
  const userForm = document.getElementById("search_users");
  const userFormData = new FormData(userForm);
  event.preventDefault();
  searchUser(userFormData);
});

function searchUser(formData) {
  fetch("/user/find", {
    method: "POST",
    body: formData,
  })
    .then((rsp) => rsp.json())
    .then((data) => {
      listUsers(data);
    });
}

function listUsers(data) {
  const userList = document.querySelector(".user_list");
  userList.innerHTML = "";

  JSON.parse(data).forEach((value, key) => {
    if (userList) {
      var paragraph = document.createElement("p");
      paragraph.textContent =
        value.name + " " + value.phone + " " + value.mail + " " + value.status;
      userList.appendChild(paragraph);

      var button = document.createElement("button");
      button.textContent = "Deaktivalas";
      button.addEventListener("click", function () {
        // TODO: Add textbox to leave deactivation notes
        deactivateUser(value.id);
      });
      userList.appendChild(button);

      button = document.createElement("button");
      button.textContent = "Szerkesztes";
      button.addEventListener("click", function () {
        deactivateUser(value.id);
      });
      userList.appendChild(button);

      button = document.createElement("button");
      button.textContent = "Reszletek";
      button.addEventListener("click", function () {
        deactivateUser(value.id);
      });
      userList.appendChild(button);
    }
    // add to the page
  });
}

function deactivateUser(key) {
  fetch("/user/deactivate", {
    method: "POST",
    body: key,
  }).then((rsp) =>
    rsp.json().then((data) => {
      console.log(data);
      userSearchBtn.click();
    })
  );
}
