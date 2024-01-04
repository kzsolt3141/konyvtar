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
  findBookNotes: db_books.findBookNotes,
  getBookNameById: db_books.getBookNameById,
  addGenre: db_books.addGenre,
  getGenres: db_books.getGenres,
  updateBook: db_books.updateBook,

  registerUser: db_users.registerUser,
  findUser: db_users.findUser,
  findUserNotes: db_users.findUserNotes,
  getUserNameById: db_users.getUserNameById,
  getLendedBooks: db_users.getLendedBooks,
  deactivateUser: db_users.deactivateUser,
  editUser: db_users.editUser,

  lend: db_loan.lend,
  bring: db_loan.bring,
  bookIsAvailable: db_loan.bookIsAvailable,
};
