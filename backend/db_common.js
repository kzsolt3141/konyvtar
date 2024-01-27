const fs = require("fs");
const zip = require("express-zip");
const sqlite3 = require("sqlite3");

const db_books = require("./db_books.js");
const db_users = require("./db_users.js");
const db_loan = require("./db_loan.js");
const db_saver = require("./db_saver.js");

const db = new sqlite3.Database("./database/library.db");

function init() {
  db_books.init(db);
  db_users.init(db);
  db_loan.init(db);
}

function saveAllTables(res) {
  db_saver.saveAllTables(res, db);
}

csv = require("csv-stringify");

module.exports = {
  init: init,
  saveAllTables: saveAllTables,
};
