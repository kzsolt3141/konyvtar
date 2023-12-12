const path = require("path");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(path.join(__dirname, "../database/library.db"));

function init() {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn TEXT UNIQUE NOT NULL,
        title TEXT,
        author TEXT,
        genre TEXT,
        year INTEGER,
        publ TEXT,
        ver TEXT,
        notes TEXT,
        status TEXT
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS book_pics (
        id INTEGER,
        link TEXT,
        type TEXT
    )
`);

  db.run(`
CREATE TABLE IF NOT EXISTS book_genres (
  genre TEXT PRIMARY KEY
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

function registerBook(body, newNames, res) {
  year = parseInt(body.year, 10);
  if (isNaN(year)) {
    console.log(`Book ${body.title} has incorrect year: ${body.year}`);
    res.json(`Book ${body.title} has incorrect year: ${body.year}`);
    return;
  }

  const sql = `INSERT INTO books 
  (isbn, title, author, genre, year, publ, ver, notes, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `;

  const values = [
    body.isbn,
    body.title,
    body.author,
    body.genre,
    year,
    body.publ,
    body.ver,
    body.notes,
    1,
  ];

  db.run(sql, values, function (err) {
    if (err) {
      console.log(err.message);
      res.json(`Book ${body.title} could not be saved`);
      return;
    }

    //TODO: this qlso sqhoud return someting... blokcing maybe?
    registerBookImgs(this.lastID, newNames);

    res.json(`Book ${body.title} saved successfully to ID:${this.lastID}`);
  });
}

function registerBookImgs(id, bookImgs) {
  const sql = `INSERT INTO book_pics
  (id, link, type)
  VALUES (?, ?, ?)`;

  bookImgs.forEach((bookImg) => {
    db.run(sql, [id, bookImg, 0], (err) => {
      if (err) {
        console.log(
          `${bookImg} for ID:${id} could not be saved: ${err.message}`
        );
        return;
      }
      console.log(`Image ${bookImg} for ID:${id} saved successfully`);
    });
  });
}

function addGenre(body, res) {
  console.log(body);
  var sql = `INSERT INTO book_genres (genre) VALUES (?)`;
  db.all(sql, [body], (err, rows) => {
    if (err) {
      console.log(err.message);
      res.json(`Genre ${body} could not be added`);
      return;
    }
    res.json(`Genre ${body} added successfully`);
  });
}

function getGenres(res) {
  var sql = `SELECT * FROM book_genres ORDER BY genre ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.log(err);
      res.json(`Genres could not be listed`);
      return;
    }
    res.json(rows);
  });
}

//--------------------------

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
  const status = body.status == "on" ? "active" : "inactive";
  const sql = `SELECT * FROM books WHERE LOWER(${body.type}) LIKE LOWER(?) AND status = ?`;
  db.all(sql, [`%${body.key}%`, status], (err, rows) => {
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

function deleteBookPic(body, sts) {
  const sql = `DELETE FROM book_pics WHERE link = ?`;
  db.all(sql, [body], (err, rows) => {
    if (err) {
      sts = "Database error please try again";
      console.log(err.message);
      return;
    }
    console.log("Book pic deleted:", body);
    sts = `Book pic deleted: ${body}`;
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

function editBook(body, renameCb, res) {
  console.log(body);
  sql = `UPDATE books 
  SET 
    isbn = ?,
    title= ?,
    author = ?,
    genre = ?,
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
      body.genre,
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
      // TODO if ISBN was chnaged, get all the picture names with that ISBN, use the callback to rename those files
      // TODO update image links table with the new names
      console.log(`Book ${body.title} modified successfully`);
      // update book pic table
      res.json(`Book ${body.title} modified successfully`);
    }
  );
}

// TODO or maybe use something like tis:
// function renameImageTale(oldIsbn, newIsbn) {
//   const sql = `UPDATE book_pics
//   SET isbn = ?,
//   link =
//     CASE
//       WHEN link LIKE ${oldIsbn}% THEN ${newIsbn} || SUBSTR(link, LENGTH(${oldIsbn}) + 1)
//       ELSE link
//   WHERE isbn = ?`;
//   db.run(sql, [newIsbn, oldIsbn], (err) => {
//     if (err) {
//       console.log(err.message);
//       return;
//     }
//   });
// }

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
  registerUser: registerUser,
  findBook: findBook,
  findBookPic: findBookPic,
  addGenre: addGenre,
  getGenres: getGenres,
  deleteBookPic: deleteBookPic,
  editBook: editBook,
  deactivateBook: deactivateBook,
  findUser: findUser,
  deactivateUser: deactivateUser,
};
