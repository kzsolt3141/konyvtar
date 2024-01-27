const fs = require("fs");
const zip = require("express-zip");
csv = require("csv-stringify");

async function saveAllTables(res, db) {
  let date = new Date();
  date = date.toISOString().split("T")[0];
  var fileNames = [
    { name: "library.db", path: "database/library.db" },
    await saveBooks(db, date),
    await saveBookGenres(db, date),
    await saveBookNotes(db, date),
    await saveLoan(db, date),
    await saveUsers(db, date),
    await saveUserNotes(db, date),
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

async function saveBooks(db, date) {
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
async function saveBookGenres(db, date) {
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
async function saveBookNotes(db, date) {
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
async function saveLoan(db, date) {
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
async function saveUsers(db, date) {
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
async function saveUserNotes(db, date) {
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
  saveAllTables: saveAllTables,
};
