var db_ = null;

//----------------------------------------------------------------
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

//----------------------------------------------------------------
function registerBook(req) {
  const body = req.body;
  var file = null;
  if (req.file != null) file = req.file.filename;

  return new Promise((resolve, reject) => {
    if (body.isbn == "") {
      reject("ISBN nem lehet ures");
      return;
    }
    if (body.title == "") {
      reject("Cim nem lehet ures");
      return;
    }
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
      console.log("Genre", err);
      res.json(`Hiba!`);
      return;
    }
    res.json(rows);
  });
}

//----------------------------------------------------------------
async function findBook(body) {
  key = body.key.trim();
  const status = body.status == "on" ? 1 : 0;
  const sql = `
    SELECT * FROM books WHERE 
    LOWER(${body.type}) LIKE LOWER(?) 
    AND 
    status = ?
    ORDER BY ${body.type} ASC
    LIMIT 20`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [`%${key}%`, status], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject("Hiba!");
        return;
      }
      resolve(rows);
    });
  });
}

function getAllBooks(body) {
  order = body.order;
  offset = body.offset * 50;

  const sql = `
    SELECT * FROM books 
    ORDER BY ${order} ASC`;
  //TODO add this when paging is ready
  // LIMIT 50
  // OFFSET ${offset}`;
  return new Promise((resolve, reject) => {
    db_.all(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
        reject("Hiba!");
        return;
      }
      resolve(rows);
    });
  });
}

async function getBookNotesById(id) {
  const sql = ` SELECT date, notes FROM book_notes WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [id], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getBookById(id) {
  const sql = ` SELECT * FROM books WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [id], (err, rows) => {
      if (err) {
        console.log(err.message);
        reject("Hiba!");
        return;
      }
      resolve(rows[0]);
    });
  });
}

function getNextBookId() {
  const sql = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM books`;
  return new Promise((resolve, reject) => {
    db_.all(sql, (err, rows) => {
      if (err) {
        console.log("error", err);
        reject(err);
        return;
      }
      resolve(rows[0].next_id);
    });
  });
}

//----------------------------------------------------------------
async function toggleBookStatus(id, notes) {
  sql = `
  UPDATE books 
  SET status = 
    CASE 
      WHEN status = 0 
        THEN 1 
        ELSE 0
    END 
  WHERE id = ?`;

  return new Promise((resolve, reject) => {
    db_.run(sql, [id], (err) => {
      if (err) {
        console.log(err.message);
        reject(`Book ${id} could not be modified`);
        return;
      }
      const currentDate = new Date();
      registerBookNotes(id, currentDate, notes);
      //TODO generate a meaningful message: current status, book title
      //TODO may require an other querry
      resolve(`Book ${id} modified successfully`);
    });
  });
}

function editBook(body, file) {
  return new Promise((resolve, reject) => {
    if (body == null) {
      reject("empty body");
      return;
    }

    var fileName = null;
    if (file != null) {
      fileName = file.filename;
    }

    if (body.genre == "") body.genre = null;

    sql = `UPDATE books 
      SET 
        isbn = ?,
        title= ?,
        author = ?,
        genre =  COALESCE(?, genre),
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
        fileName,
        body.id,
      ],
      (err) => {
        if (err) {
          reject(`Book ${body.title} could not be modified`);
          return;
        }
        const currentDate = new Date();
        registerBookNotes(body.id, currentDate, body.notes);
        resolve(`Book ${body.title} modified successfully`);
      }
    );
  });
}

module.exports = {
  init: init,
  registerBook: registerBook,
  findBook: findBook,
  getAllBooks: getAllBooks,
  getBookNotesById: getBookNotesById,
  getBookById: getBookById,
  addGenre: addGenre,
  getGenres: getGenres,
  editBook: editBook,
  toggleBookStatus: toggleBookStatus,
  getNextBookId: getNextBookId,
};
