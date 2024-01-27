const fs = require("fs");
const zip = require("express-zip");
const sqlite3 = require("sqlite3");

const db_books = require("./db_books.js");
const db_users = require("./db_users.js");
const db_loan = require("./db_loan.js");
const db_saver = require("./db_saver.js");

const db = new sqlite3.Database("./database/library.db");

function db_init() {
  db_books.init(db);
  db_users.init(db);
  db_loan.init(db);
}

function saveAllTables(res) {
  db_saver.saveAllTables(res, db);
}

function ipLoggerMW(req, res, next) {
  const timeStamp = Date.now();
  const date = new Date(timeStamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based, so add 1 and pad with '0'
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  console.log(
    `${year}-${month}-${day}; ${hours}:${minutes}:${seconds} => ` + clientIp
  );
  next();
}

module.exports = {
  db_init,
  saveAllTables,
  ipLoggerMW,
};
