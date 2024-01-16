const fs = require("fs");
const zip = require("express-zip");
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

async function saveAllTables(res) {
  let date = new Date();
  date = date.toISOString().split("T")[0];
  var fileNames = [
    { name: "library.db", path: "database/library.db" },
    await saveBooks(date),
    await saveBookGenres(date),
    await saveBookNotes(date),
    await saveLoan(date),
    await saveUsers(date),
    await saveUserNotes(date),
  ];

  const images = fs.readdirSync("uploads").map((pic) => ({
    name: pic,
    path: "uploads/" + pic,
  }));

  fileNames = fileNames.concat(images);

  res.zip(fileNames, "backup.zip", (err) => {
    if (err) {
      console.log("backup failed for this files", fileNames);
      console.log(err.message);
    }
  });
}

async function saveBooks(date) {
  const fileName = `${date}-konyvek.csv`;
  fs.writeFileSync(fileName, "");
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM books", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(fileName, output);
        });
      });
      resolve({ name: fileName, path: fileName });
    });
  });
}
async function saveBookGenres(date) {
  const fileName = `${date}-konyv-tipusok.csv`;
  fs.writeFileSync(fileName, "");
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM book_genres", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(fileName, output);
        });
      });
      resolve({ name: fileName, path: fileName });
    });
  });
}
async function saveBookNotes(date) {
  const fileName = `${date}-konyv-jegyzetek.csv`;
  fs.writeFileSync(fileName, "");
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM book_notes", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(fileName, output);
        });
      });
      resolve({ name: fileName, path: fileName });
    });
  });
}
async function saveLoan(date) {
  const fileName = `${date}-kolcsonzesek.csv`;
  fs.writeFileSync(fileName, "");
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM loan", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(fileName, output);
        });
      });
      resolve({ name: fileName, path: fileName });
    });
  });
}
async function saveUsers(date) {
  const fileName = `${date}-felhasznalok.csv`;

  fs.writeFileSync(fileName, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(fileName, output);
        });
      });
      resolve({ name: fileName, path: fileName });
    });
  });
}
async function saveUserNotes(date) {
  const fileName = `${date}-felh-jegyzetek.csv`;

  fs.writeFileSync(fileName, "");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM book_notes", (err, rows) => {
      rows.forEach((row) => {
        row = Object.values(row);
        csv.stringify([row], (err, output) => {
          fs.appendFileSync(fileName, output);
        });
      });
      resolve({ name: fileName, path: fileName });
    });
  });
}

module.exports = {
  init: init,
  saveAllTables: saveAllTables,

  registerBook: db_books.registerBook,
  findBook: db_books.findBook,
  findBookNotes: db_books.findBookNotes,
  getBookById: db_books.getBookById,
  addGenre: db_books.addGenre,
  getGenres: db_books.getGenres,
  updateBook: db_books.updateBook,
  getNextBookId: db_books.getNextBookId,

  registerUser: db_users.registerUser,
  findUser: db_users.findUser,
  findUserNotes: db_users.findUserNotes,
  getUserById: db_users.getUserById,
  getLendedBooks: db_users.getLendedBooks,
  updateUser: db_users.updateUser,
  getNextUserId: db_users.getNextUserId,

  lend: db_loan.lend,
  bring: db_loan.bring,
  bookIsAvailable: db_loan.bookIsAvailable,
};
