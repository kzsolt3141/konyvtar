import { common } from "./common.js";

let UserData = [];

// TODO fixme: listUsers and reorder function are no longer supported in selector event, see book_table.js
common.createOrderingSelector(
  "user_order",
  document.getElementById("user_order_div"),
  common.UserLabelNames,
  listUsers
);

const userSearchBtn = document.getElementById("search_user");
if (userSearchBtn) {
  userSearchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const userForm = document.getElementById("search_users");
    const userFormData = new FormData(userForm);
    event.preventDefault();
    searchUser(userFormData);
  });
}

function userClickCb(id) {
  common.disableMain();
  window.location.href = `/user/${id}`;
  common.enableMain();
}

async function searchUser(formData) {
  common.disableMain();
  UserData.length = 0;

  const users = await fetch("/user/details", {
    method: "POST",
    body: formData,
  }).then((rsp) => rsp.json());

  UserData.push(users);

  if (UserData.length > 0) {
    listUsers(UserData[0]);
  }
  common.enableMain();
}

function listUsers(users) {
  if (!users) return;
  const usersDiv = document.getElementById("users_div");
  usersDiv.innerHTML = "";

  users.forEach((user) => {
    const userDiv = document.createElement("div");
    usersDiv.appendChild(userDiv);
    userDiv.id = user.id;
    userDiv.className = "book_div";

    common.showPic(user.id, user.pic, userDiv, userClickCb);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "user_radio";
    radio.id = user.id;
    radio.disabled = user.status == 0;
    userDiv.appendChild(radio);

    const userDetailsDiv = document.createElement("div");
    userDetailsDiv.className = "book_details_div";
    userDiv.appendChild(userDetailsDiv);

    const firstLineDiv = document.createElement("div");
    firstLineDiv.className = "book_first_line";
    userDetailsDiv.appendChild(firstLineDiv);

    const firstLine = [user.name, user.address];
    for (const k of firstLine) {
      const element = document.createElement("p");
      element.textContent = k;
      firstLineDiv.appendChild(element);
    }

    const secondLineDiv = document.createElement("div");
    secondLineDiv.className = "book_first_line";
    userDetailsDiv.appendChild(secondLineDiv);

    const secondLine = [user.phone, user.email];

    for (const k of secondLine) {
      const element = document.createElement("p");
      element.textContent = k;
      secondLineDiv.appendChild(element);
    }
  });
}
