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
        pic TEXT,
        keys TEXT,
        price REAL,
        status INTEGER DEFAULT 1 NOT NULL
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

function registerBook(req) {
  const body = req.body;
  var file = null;
  if (req.file != null) file = req.file.filename;

  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO books 
      (isbn, title, author, genre, year, publ, ver, keys, price, pic)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

    const values = [
      body.isbn,
      body.title,
      body.author,
      body.genre,
      body.year,
      body.publ,
      body.ver,
      body.keys,
      body.price,
      file,
    ];

    db_.run(sql, values, function (err) {
      if (err) {
        console.log(err.message);
        reject("Konyv hozzaadasa SIKERTELEN (egyedi ISBN szukseges)");
        return;
      }
      resolve(
        `Konyv sikeresen hozzaadva az adatbazishoz, azonosito:${this.lastID}`
      );

      body.notes = body.notes === "" ? "Init" : body.notes;
      const currentDate = new Date();
      registerBookNotes(this.lastID, currentDate, body.notes);
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
        console.log(`Notes could not be added to DB`);
        return;
      }
    });
  }
}

function addGenre(body, res) {
  var sql = `INSERT INTO book_genres (genre) VALUES (?)`;
  db_.all(sql, [body], (err, rows) => {
    if (err) {
      console.log(err.message);
      res.json(`Tipus ${body} hozzaadasa sikertelen`);
      return;
    }
    res.json(`Tipus ${body} hozzaadva`);
  });
}

function getGenres(res) {
  var sql = `SELECT * FROM book_genres ORDER BY genre ASC`;
  db_.all(sql, [], (err, rows) => {
    if (err) {
      console.log(err.message);
      res.json(`Hiba!`);
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
    status = ?
    LIMIT 100`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [`%${body.key}%`, status], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject("Hiba!");
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
        console.log(err.message);
        reject("Hiba!");
        return;
      }
      resolve(rows);
    });
  });
}

function getBookNameById(id, res) {
  const sql = ` SELECT title FROM books WHERE id = ?`;

  db_.all(sql, [id], (err, rows) => {
    if (err) {
      console.log(err.message);
      reject("Hiba!");
      return;
    }
    res.json(rows[0]);
  });
}

function updateBook(req, res) {
  switch (req.body.update) {
    case "bulk":
      editBook(req, res);
      break;
    case "status":
      toggleBookStatus(req.body, res);
      break;
    default:
      res.json(`unknown instruction: ${body.update}`);
  }
}

function toggleBookStatus(body, res) {
  sql = `
  UPDATE books 
  SET status = 
    CASE 
      WHEN status = 0 
        THEN 1 
        ELSE 0
      END 
  WHERE id = ?`;
  db_.run(sql, [body.id], (err) => {
    if (err) {
      console.log(err.message);
      res.json(`Book ${body.title} could not be modified`);
      return;
    }
    const currentDate = new Date();
    registerBookNotes(body.id, currentDate, body.notes);
    // update book pic table
    res.json(`Book ${body.id} modified successfully`);
  });
}

function editBook(req, res) {
  const body = req.body;
  var file = null;
  if (req.file != null) {
    file = req.file.filename;
  }

  sql = `UPDATE books 
  SET 
    isbn = ?,
    title= ?,
    author = ?,
    genre = ?,
    year = ?,
    publ = ?,
    ver = ?,
    keys = ?,
    price = ?,
    pic = COALESCE(?, pic)
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
      body.keys,
      body.price,
      file,
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
      res.json(`Book ${body.title} modified successfully`);
    }
  );
}

function getNextBookId(res) {
  const sql = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM books`;
  db_.all(sql, (err, rows) => {
    if (err) {
      console.log(err.message);
      res.json("Hiba!");
      return;
    }
    res.json(rows[0].next_id);
  });
}

module.exports = {
  init: init,
  registerBook: registerBook,
  findBook: findBook,
  findBookNotes: findBookNotes,
  getBookNameById: getBookNameById,
  addGenre: addGenre,
  getGenres: getGenres,
  updateBook: updateBook,
  getNextBookId: getNextBookId,
};
