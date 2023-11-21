const path = require("path");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(path.join(__dirname, "../database/library.db"));

function init() {
  // Create a table for books if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
        isbn TEXT PRIMARY KEY,
        title TEXT,
        author TEXT,
        year TEXT,
        publ TEXT,
        ver TEXT,
        notes TEXT
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS book_pics (
        isbn TEXT PRIMARY KEY,
        link TEXT,
        type TEXT
    )
`);

  //   db.run(`
  //     CREATE TABLE IF NOT EXISTS kolcsonzes (
  //         isbn TEXT PRIMARY KEY,
  //         id INTEGER,
  //         tipus TEXT
  //     )
  // `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        phone TEXT,
        mail TEXT
    )
`);
}

function registerBook(body) {
  db.run(
    `
  INSERT INTO books 
  (isbn, title, author, year, publ, ver, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`,
    [
      body.isbn,
      body.title,
      body.author,
      body.year,
      body.publ,
      body.ver,
      body.notes,
    ],
    (err) => {
      if (err) {
        return;
      }
      console.log("Book data saved successfully");
    }
  );
}

function registerBookPics(isbn, bookPics) {
  bookPics.forEach((bookPic) => {
    db.run(
      `
    INSERT INTO book_pics
    (isbn, link, type)
    VALUES (?, ?, ?)
  `,
      [isbn, bookPic, "none"],
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
  INSERT INTO users 
  (name, address, phone, mail)
  VALUES (?, ?, ?, ?)
`,
    [body.name, body.address, body.phone, body.mail],
    (err) => {
      if (err) {
        return;
      }
      console.log("User data saved successfully");
    }
  );
}

function findBook(body, res) {
  const sql = `SELECT * FROM books WHERE ${body.type} = ?`;
  db.all(sql, [body.key], (err, rows) => {
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
  var sql = `DELETE FROM books WHERE isbn = ?`;
  var resp = "";
  db.run(sql, [body], (err, rows) => {
    if (err) {
      return console.log(err.message);
    }
    resp = `book ${body} deleted successfully`;
  });

  // TODO Search for the saved pictures adn delete

  sql = `DELETE FROM book_pics WHERE isbn = ?`;
  db.run(sql, [body], (err, rows) => {
    if (err) {
      return console.log(err.message);
    }
    res.json(`Book deleted!`);
    console.log(rows);
  });
}

module.exports = {
  init: init,
  registerBook: registerBook,
  registerBookPics: registerBookPics,
  registerUser: registerUser,
  findBook: findBook,
  deleteBook: deleteBook,
};
