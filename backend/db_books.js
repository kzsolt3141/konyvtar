var db_ = null;

function init(db) {
  if (db === null) return false;
  db_ = db;

  db_.run(`
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
        status INTEGER DEFAULT 1 NOT NULL
    )
`);

  db_.run(`
    CREATE TABLE IF NOT EXISTS book_pics (
        id INTEGER,
        link TEXT,
        type INTEGER DEFAULT 1 NOT NULL
    )
`);

  db_.run(`
CREATE TABLE IF NOT EXISTS book_genres (
  genre TEXT PRIMARY KEY
)
`);
}

function getValidYear(textyear) {
  year = parseInt(textyear, 10);
  const currentDate = new Date();

  if (isNaN(year) || year > currentDate.getFullYear()) {
    return { error: new Error(`Invalid year: ${textyear}`) };
  }
  return { value: year };
}

function registerBook(body, newNames) {
  return new Promise((resolve, reject) => {
    year = getValidYear(body.year, 10);
    if (year.error) {
      reject(`Book ${body.title} has incorrect year: ${body.year}`);
    }

    const sql = `INSERT INTO books 
  (isbn, title, author, genre, year, publ, ver, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?) `;

    const values = [
      body.isbn,
      body.title,
      body.author,
      body.genre,
      year.value,
      body.publ,
      body.ver,
      body.notes,
    ];

    db_.run(sql, values, function (err) {
      if (err) {
        console.log(err.message);
        reject(err.message);
        return;
      }
      resolve(this.lastID);

      registerBookImgs(this.lastID, newNames);
    });
  });
}

function registerBookImgs(id, bookImgs) {
  const sql = `INSERT INTO book_pics (id, link, type) VALUES (?, ?, ?)`;

  bookImgs.forEach((bookImg, idx) => {
    db_.run(sql, [id, bookImg, idx == 0 ? 1 : 0], (err) => {
      if (err) {
        console.log(`Image ${bookImg} for ID:${id} was not added to DB`);
        return;
      }
      console.log(`Image ${bookImg} for ID:${id} was  added to DB`);
    });
  });
}

function addGenre(body, res) {
  console.log(body);
  var sql = `INSERT INTO book_genres (genre) VALUES (?)`;
  db_.all(sql, [body], (err, rows) => {
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
  db_.all(sql, [], (err, rows) => {
    if (err) {
      console.log(err);
      res.json(`Genres could not be listed`);
      return;
    }
    res.json(rows);
  });
}

function findBook(body, res) {
  const status = body.status == "on" ? 1 : 0;
  const sql = `SELECT * FROM books WHERE LOWER(${body.type}) LIKE LOWER(?) AND status = ?`;

  db_.all(sql, [`%${body.key}%`, status], (err, rows) => {
    if (err) {
      res.json("Database error please try again");
      console.log(err.message);
      return;
    }
    if (rows) {
      const resp = [];
      rows.forEach((row) => {
        resp.push(row);
      });
      res.json(JSON.stringify(resp));
    } else {
      console.log("Book not found:", body.type, body.key);
      res.json("Book not found:", body.type, body.key);
    }
  });
}

// TODO should use ID and not ISBN
function findBookPic(body, res) {
  const sql = `SELECT link FROM book_pics WHERE id = ?`;
  db_.all(sql, [body], (err, rows) => {
    if (err) {
      res.json("Database error please try again");
      console.log(err.message);
      return;
    }
    if (rows) {
      const resp = [];
      rows.forEach((row) => {
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
  db_.all(sql, [body], (err, rows) => {
    if (err) {
      sts = "Database error please try again";
      console.log(err.message);
      return;
    }
    console.log("Book pic deleted:", body);
    sts = `Book pic deleted: ${body}`;
  });
}

// TODO should use ID and not ISBN
function deactivateBook(body, res) {
  const sql = `UPDATE books SET status = 0, notes = ? WHERE id = ?`;
  db_.run(sql, [body.notes, body.id], (err) => {
    if (err) {
      console.error(err.message);
      res.json(`Book ${body.id} could not be deactivated`);
      return;
    }
    res.json(`Book ${body.id} was deactivated`);
  });
}

//----------------------------------------------------------------

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
  db_.run(
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
      console.log(`Book ${body.title} modified successfully`);
      // update book pic table
      res.json(`Book ${body.title} modified successfully`);
    }
  );
}

module.exports = {
  init: init,
  registerBook: registerBook,
  findBook: findBook,
  findBookPic: findBookPic,
  addGenre: addGenre,
  getGenres: getGenres,
  deleteBookPic: deleteBookPic,
  editBook: editBook,
  deactivateBook: deactivateBook,
};
