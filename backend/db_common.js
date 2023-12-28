const path = require("path");
const sqlite3 = require("sqlite3");

const db_books = require("./db_books.js");
const db_users = require("./db_users.js");
const db_loan = require("./db_loan.js");

const db = new sqlite3.Database(path.join(__dirname, "../database/library.db"));

function init() {
  db_books.init(db);
  db_users.init(db);
  db_loan.init(db);
}

module.exports = {
  init: init,
  registerBook: db_books.registerBook,
  findBook: db_books.findBook,
  findBookPic: db_books.findBookPic,
  findBookNotes: db_books.findBookNotes,
  addGenre: db_books.addGenre,
  getGenres: db_books.getGenres,
  deleteBookPic: db_books.deleteBookPic,
  editBook: db_books.editBook,

  registerUser: db_users.registerUser,
  findUser: db_users.findUser,
  findUserNotes: db_users.findUserNotes,
  deactivateUser: db_users.deactivateUser,
  editUser: db_users.editUser,

  lend: db_loan.lend,
  bring: db_loan.bring,
};
