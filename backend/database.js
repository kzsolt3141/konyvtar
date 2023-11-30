const path = require("path");
const sqlite3 = require("sqlite3");
const fs = require("fs");

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
        notes TEXT,
        status TEXT
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS book_pics (
        isbn TEXT,
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
        mail TEXT,
        status TEXT,
        notes TEXT
    )
`);
}

function registerBook(body, res) {
  db.run(
    `
  INSERT INTO books 
  (isbn, title, author, year, publ, ver, notes, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, "active")
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
        console.log(err.message);
        res.json(`Book ${body.title} could not be saved`);
        return;
      }
      res.json(`Book ${body.title} saved successfully`);
    }
  );
}

function registerBookImg(isbn, bookImg) {
  db.run(
    `
    INSERT INTO book_pics
    (isbn, link, type)
    VALUES (?, ?, ?)
  `,
    [isbn, bookImg, "none"],
    (err) => {
      if (err) {
        console.log(
          `${bookImg} for ${isbn} could not be saved: ${err.message}`
        );
        return;
      }
      console.log(`Image ${bookImg} for ${isbn} saved successfully`);
    }
  );
}

function registerUser(body, res) {
  var sql = `SELECT * FROM users WHERE phone = ? AND mail = ?`;
  db.all(sql, [body.phone, body.mail], (err, rows) => {
    if (err) {
      console.log(err);
      res.json(`User ${body.name} could not be added`);
      return;
    }
    if (rows && rows.length > 0) {
      res.json(
        `User with phone:${body.phone} and mail ${body.mail} already exists`
      );
      return;
    }
    sql = `INSERT INTO users (name, address, phone, mail, status, notes) VALUES (?, ?, ?, ?, "active", "") `;
    db.run(sql, [body.name, body.address, body.phone, body.mail], (err) => {
      if (err) {
        console.log(err);
        res.json(`User ${body.name} could not be added`);
        return;
      }
      console.log(`User ${body.name} added successfully`);
      res.json(`User ${body.name} added successfully`);
    });
  });
}

function findBook(body, res) {
  const sql = `SELECT * FROM books WHERE ${body.type} LIKE ?`;
  db.all(sql, [`%${body.key}%`], (err, rows) => {
    if (err) {
      res.json("Database error please try again");
      console.log(err.message);
      return;
    }
    if (rows) {
      const resp = [];
      rows.forEach((row, index) => {
        resp.push(row);
      });
      res.json(JSON.stringify(resp));
    } else {
      console.log("Book not found:", body.type, body.key);
      res.json("Book not found:", body.type, body.key);
    }
  });
}

function findBookPic(body, res) {
  const sql = `SELECT link FROM book_pics WHERE isbn = ?`;
  db.all(sql, [body], (err, rows) => {
    if (err) {
      res.json("Database error please try again");
      console.log(err.message);
      return;
    }
    if (rows) {
      const resp = [];
      rows.forEach((row, index) => {
        resp.push(row);
      });
      res.json(JSON.stringify(resp));
    } else {
      console.log("Book pics not found:", body);
      res.json("Book not found:", body);
    }
  });
}

function deactivateBook(body, res) {
  const sql = `UPDATE books SET status = "inactive", notes = ? WHERE isbn = ?`;
  db.run(sql, [body.notes, body.isbn], (err) => {
    if (err) {
      console.error(err.message);
      res.json(`Book isbn ${body.isbn} could not be deactivated`);
      return;
    }
    res.json(`Book isbn ${body.isbn} was deactivated`);
  });
}

function editBook(body, res) {
  console.log(body);
  sql = `UPDATE books 
  SET 
    isbn = ?,
    title= ?,
    author = ?,
    year = ?,
    publ = ?,
    ver = ?,
    notes = ?,
    status = ?
  WHERE isbn = ?`;
  db.run(
    sql,
    [
      body.new_isbn,
      body.title,
      body.author,
      body.year,
      body.publ,
      body.ver,
      body.notes,
      body.status,
      body.isbn,
    ],
    (err) => {
      if (err) {
        console.log(err);
        res.json(`Book ${body.title} could not be modified`);
        return;
      }
      console.log(`Book ${body.title} modified successfully`);
      res.json(`Book ${body.title} modified successfully`);
    }
  );
}

function findUser(body, res) {
  const sql = `SELECT * FROM users WHERE ${body.type} LIKE ?`;
  db.all(sql, [`%${body.key}%`], (err, rows) => {
    if (err) {
      res.json("Database error please try again");
      console.log(err.message);
      return;
    }
    if (rows) {
      const resp = [];
      rows.forEach((row, index) => {
        resp.push(row);
      });
      res.json(JSON.stringify(resp));
    } else {
      console.log("User not found:", body.type, body.key);
      res.json("User not found:", body.type, body.key);
    }
  });
}

function deactivateUser(body, res) {
  const sql = `UPDATE users SET status = "inactive" WHERE id = ?`;
  db.run(sql, [body], (err) => {
    if (err) {
      console.error(err.message);
      res.json(`User id ${body} could not be deactivated`);
      return;
    }
    res.json(`User id ${body} was deactivated`);
  });
}

module.exports = {
  init: init,
  registerBook: registerBook,
  registerBookImg: registerBookImg,
  registerUser: registerUser,
  findBook: findBook,
  findBookPic: findBookPic,
  editBook: editBook,
  deactivateBook: deactivateBook,
  findUser: findUser,
  deactivateUser: deactivateUser,
};
