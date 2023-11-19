const path = require("path");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(
  path.join(__dirname, "../database/konyvtar.db")
);

function init() {
  // Create a table for books if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS konyvek (
        isbn TEXT PRIMARY KEY,
        konyv_cim TEXT,
        szerzo TEXT,
        kiadasi_ev TEXT,
        kiado TEXT,
        kiadas TEXT,
        megjegyzes TEXT
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS konyv_kepek (
        isbn TEXT PRIMARY KEY,
        kep_link TEXT,
        tipus TEXT
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS kolcsonzes (
        isbn TEXT PRIMARY KEY,
        id INTEGER,
        tipus TEXT
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS kliens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nev TEXT,
        cim TEXT,
        tel TEXT,
        mail TEXT
    )
`);
}

function registerBook(body) {
  db.run(
    `
  INSERT INTO konyvek 
  (isbn, konyv_cim, szerzo, kiadasi_ev, kiado, kiadas, megjegyzes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`,
    [
      body.isbn,
      body.konyv_cim,
      body.szerzo,
      body.kiadasi_ev,
      body.kiado,
      body.kiadas,
      body.megjegyzes,
    ],
    (err) => {
      if (err) {
        return;
      }
      console.log("Book data saved successfully");
    }
  );
}

function registerBookImgs(isbn, bookImgs) {
  bookImgs.forEach((bookImage) => {
    db.run(
      `
    INSERT INTO konyv_kepek 
    (isbn, kep_link, tipus)
    VALUES (?, ?, ?)
  `,
      [isbn, bookImage, "none"],
      (err) => {
        if (err) {
          return;
        }
        console.log("Book data saved successfully");
      }
    );
  });
}

function registerUser(body) {
  db.run(
    `
  INSERT INTO kliens 
  (nev, cim, tel, mail)
  VALUES (?, ?, ?, ?)
`,
    [body.nev, body.lakcim, body.telefon, body.mail],
    (err) => {
      if (err) {
        return;
      }
      console.log("Book data saved successfully");
    }
  );
}

function findBook(body, res) {
  const sql = `SELECT * FROM konyvek WHERE ${body.tipus} = ?`;
  db.all(sql, [body.kulcsszo], (err, rows) => {
    if (err) {
      console.log(err);
      return;
    }
    if (rows) {
      const resp = [];
      rows.forEach((row, index) => {
        resp.push(row);
      });
      res.json(JSON.stringify(resp));
    } else {
      console.log("Book not found:", body.tipus, body.kulcsszo);
      res.json("fail");
    }
  });
}

function deleteBook(body, res) {
  const sql = `DELETE FROM konyvek WHERE isbn = ?`;
  db.run(sql, [body], (err, rows) => {
    if (err) {
      return console.log(err.message);
    }
    console.log(`Row(s) deleted!`);
  });
}

module.exports = {
  init: init,
  registerBook: registerBook,
  registerBookImgs: registerBookImgs,
  registerUser: registerUser,
  findBook: findBook,
  deleteBook: deleteBook,
};
