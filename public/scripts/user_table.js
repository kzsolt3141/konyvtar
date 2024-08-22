import { common } from "./common.js";

const bookTable = document.getElementById("book_table");
const naviBackBtn = document.getElementById("navi_back");
const naviNextBtn = document.getElementById("navi_next");
const naviPage = document.getElementById("navi_page");
const naviText = document.getElementById("navi_text");

var tablePage = 0;
var maxPage = 0;
const pageLimit = 50;

async function getOrderedData(orderBy) {
  const bookFormData = new FormData();
  bookFormData.append("order", orderBy);
  bookFormData.append("offset", tablePage);
  bookFormData.append("limit", pageLimit);

  common.disableMain();
  var data = null;
  try {
    data = await fetch("/user/table", {
      method: "POST",
      body: bookFormData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load book data from database`);
      }
      const contentType = res.headers.get("content-type");
      if (contentType.includes("application/json")) {
        return res.json();
      } else {
        throw new Error(res.text());
      }
    });
  } catch (error) {
    console.error(error);
  }
  common.enableMain();
  if (data && "message" in data) {
    common.updateStatus(data.message);
  }

  return data;
}

listAllUsers("id");

common.createOrderingSelector(
  "user_order",
  document.getElementById("user_order_div"),
  common.UserLabelNames,
  listAllUsers
);

async function listAllUsers(key) {
  bookTable.innerHTML = "";
  const data = await getOrderedData(key);
  if (data) {
    const users = data.users;
    maxPage = Math.ceil(data.total / pageLimit);
    naviPage.value = `${tablePage + 1}`;
    naviText.innerText = `/ ${maxPage}`;

    users.forEach(async (user) => {
      for (const k in user) {
        if (k == "pic") continue;
        if (k == "keys") continue;
        const e = document.createElement(k === "name" ? "a" : "p");
        e.href = `/user/${user.id}`;
        e.textContent = user[k];
        bookTable.appendChild(e);
      }
    });
  }
}

naviBackBtn.addEventListener("click", () => {
  const orderSelect = document.getElementById("user_order");
  const currentPage = parseInt(naviPage.value.match(/\d+/), 10) - 1;
  tablePage = currentPage > 0 ? currentPage - 1 : currentPage;
  listAllUsers(orderSelect.value);
});

naviNextBtn.addEventListener("click", () => {
  const orderSelect = document.getElementById("user_order");
  const currentPage = parseInt(naviPage.value.match(/\d+/), 10) - 1;
  tablePage = currentPage < maxPage - 1 ? currentPage + 1 : currentPage;
  listAllUsers(orderSelect.value);
});
