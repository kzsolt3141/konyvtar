const path = require("path");
const sqlite3 = require("sqlite3");

const db_books = require("./db_books.js");
const db_users = require("./db_users.js");
const db_loan = require("./db_loan.js");

const db = new sqlite3.Database("./database/library.db");

function init() {
  db_books.init(db);
  db_users.init(db);
  db_loan.init(db);
}

csv = require("csv-stringify");

async function saveAllTables(fs, res) {
  let date = new Date();
  date = date.toISOString().split("T")[0];
  await saveBooks(fs, date);
  await saveBookGenres(fs, date);
  await saveBookNotes(fs, date);
  await saveLoan(fs, date);
  await saveUsers(fs, date);
  await saveUserNotes(fs, date);
  res.json("Adatbazis exportalva!");
}

async function saveBooks(fs, date) {
  fs.writeFileSync(`${date}-konyvek.csv`, "");
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM books", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(`${date}-konyvek.csv`, output);
        });
      });
      resolve("");
    });
  });
}
async function saveBookGenres(fs, date) {
  fs.writeFileSync(`${date}-konyv-tipusok.csv`, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM book_genres", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(`${date}-konyv-tipusok.csv`, output);
        });
      });
      resolve("");
    });
  });
}
async function saveBookNotes(fs, date) {
  fs.writeFileSync(`${date}-konyv-jegyzetek.csv`, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM book_notes", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(`${date}-konyv-jegyzetek.csv`, output);
        });
      });
      resolve("");
    });
  });
}
async function saveLoan(fs, date) {
  fs.writeFileSync(`${date}-kolcsonzesek.csv`, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM loan", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(`${date}-kolcsonzesek.csv`, output);
        });
      });
      resolve("");
    });
  });
}
async function saveUsers(fs, date) {
  fs.writeFileSync(`${date}-felhasznalok.csv`, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(`${date}-felhasznalok.csv`, output);
        });
      });
      resolve("");
    });
  });
}
async function saveUserNotes(fs, date) {
  fs.writeFileSync(`${date}-felh-jegyzetek.csv`, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM book_notes", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(`${date}-felh-jegyzetek.csv`, output);
        });
      });
      resolve("");
    });
  });
}

module.exports = {
  init: init,
  saveAllTables: saveAllTables,

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
  updateUser: db_users.updateUser,

  lend: db_loan.lend,
  bring: db_loan.bring,
  bookIsAvailable: db_loan.bookIsAvailable,
};
