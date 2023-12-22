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

  db_.run(`
    CREATE TABLE IF NOT EXISTS book_notes (
      id INTEGER,
      date DATE,
      notes TEXT
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
      return;
    }

    const sql = `INSERT INTO books 
      (isbn, title, author, genre, year, publ, ver)
      VALUES (?, ?, ?, ?, ?, ?, ?) `;

    const values = [
      body.isbn,
      body.title,
      body.author,
      body.genre,
      year.value,
      body.publ,
      body.ver,
    ];

    db_.run(sql, values, function (err) {
      if (err) {
        console.log(err.message);
        reject(err.message);
        return;
      }
      resolve(this.lastID);

      registerBookImgs(this.lastID, newNames);
      body.notes = body.notes === "" ? "Init" : body.notes;
      const currentDate = new Date();
      registerBookNotes(this.lastID, currentDate, body.notes);
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

function registerBookNotes(id, date, notes) {
  if (notes !== "") {
    const sql = `
    INSERT INTO book_notes (id, date, notes) 
    VALUES (?, ?, ?)`;

    db_.run(sql, [id, date.toISOString().split("T")[0], notes], (err) => {
      if (err) {
        console.log(`Notes coudld not be added to DB`);
        return;
      }
      console.log(`Notes added to DB`);
    });
  }
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

async function findBook(body) {
  const status = body.status == "on" ? 1 : 0;
  const sql = `
    SELECT * FROM books WHERE 
    LOWER(${body.type}) LIKE LOWER(?) 
    AND 
    status = ?`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [`%${body.key}%`, status], (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(rows);
    });
  });
}

async function findBookNotes(id) {
  const sql = ` SELECT date, notes FROM book_notes WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(rows);
    });
  });
}

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

//----------------------------------------------------------------

function editBook(body, res) {
  sql = `UPDATE books 
  SET 
    isbn = ?,
    title= ?,
    author = ?,
    genre = ?,
    year = ?,
    publ = ?,
    ver = ?,
    status = ?
  WHERE id = ?`;
  db_.run(
    sql,
    [
      body.isbn,
      body.title,
      body.author,
      body.genre,
      body.year,
      body.publ,
      body.ver,
      body.status,
      body.id,
    ],
    (err) => {
      if (err) {
        console.log(err);
        res.json(`Book ${body.title} could not be modified`);
        return;
      }
      const currentDate = new Date();
      registerBookNotes(body.id, currentDate, body.notes);
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
  findBookNotes: findBookNotes,
  addGenre: addGenre,
  getGenres: getGenres,
  deleteBookPic: deleteBookPic,
  editBook: editBook,
};
