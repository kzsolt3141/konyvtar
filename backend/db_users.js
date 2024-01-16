var db_ = null;

function init(db) {
  if (db === null) return false;
  db_ = db;

  //TODO: password and salt is for future improvements
  db_.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        phone TEXT,
        mail TEXT,
        pic TEXT,
        status TEXT,
        password TEXT,
        salt TEXT
    )
`);

  db_.run(`
CREATE TABLE IF NOT EXISTS user_notes (
  id INTEGER,
  date DATE,
  notes TEXT
)
`);
}

//--------------------------

function registerUser(req) {
  const body = req.body;
  var filename = null;
  if (req.file) filename = req.file.filename;

  // TODO check how should Promise work (probably without return ?)
  return new Promise((resolve, reject) => {
    // seach for incopatible user data (phone and mail both used by other user)
    var sql = `SELECT * FROM users WHERE phone = ? AND mail = ?`;
    db_.all(sql, [body.phone, body.mail], (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      if (rows && rows.length > 0) {
        reject(`Phone:${body.phone} AND mail:${body.mail} used`);
        return;
      }

      // additional check for user validation
      if (body.name === "") {
        reject("Empty name");
        return;
      }
      if (body.address === "") {
        reject("Empty address");
        return;
      }
      if (body.phone === "") {
        reject("Empty phone");
        return;
      }

      // it's ok to start adding the user
      sql = `
        INSERT INTO users 
        (name, address, phone, mail, pic, status) 
        VALUES (?, ?, ?, ?, ?, 1) `;
      db_.run(
        sql,
        [body.name, body.address, body.phone, body.mail, filename],
        function (err) {
          if (err) {
            reject(err.message);
            return;
          }
          const currentDate = new Date();
          registerUserNotes(this.lastID, currentDate, body.notes);
          resolve(`User ${body.name} added successfully`);
        }
      );
    });
  });
}

function registerUserNotes(id, date, notes) {
  if (notes !== "") {
    const sql = `
    INSERT INTO user_notes (id, date, notes) 
    VALUES (?, ?, ?)`;

    db_.run(sql, [id, date.toISOString().split("T")[0], notes], (err) => {
      if (err) {
        return;
      }
    });
  }
}

async function findUser(body) {
  const status = body.status == "on" ? 1 : 0;
  const sql = `
    SELECT id, name, address, phone, mail, pic, status
    FROM users
    WHERE 
      LOWER(${body.type}) LIKE LOWER(?) 
        AND 
      status = ?
    LIMIT 100`;

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

async function findUserNotes(id) {
  const sql = ` SELECT date, notes FROM user_notes WHERE id = ?`;

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

function getUserById(id, res) {
  const sql = ` SELECT * FROM users WHERE id = ?`;

  db_.all(sql, [id], (err, rows) => {
    if (err) {
      res.json(err.message);
      return;
    }
    res.json(rows[0]);
  });
}

function getLendedBooks(id, res) {
  const sql = `
    SELECT books.title
    FROM loan
    JOIN books 
      ON loan.bid = books.id
    WHERE loan.uid = ? AND loan.back_date IS NULL;`;

  db_.all(sql, [id], (err, rows) => {
    if (err) {
      res.json(err.message);
      return;
    }
    list = [];
    rows.forEach((element) => {
      list.push(element.title);
    });
    res.json(list);
  });
}

function updateUser(req, res) {
  switch (req.body.update) {
    case "bulk":
      editUser(req, res);
      break;
    case "status":
      toggleUserStatus(req.body, res);
      break;
    default:
      res.json(`unknown instruction: ${body.update}`);
  }
}

function toggleUserStatus(body, res) {
  sql = `
  UPDATE users 
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
      res.json(`User ${body.id} could not be modified`);
      return;
    }
    const currentDate = new Date();
    registerUserNotes(body.id, currentDate, body.notes);
    // update book pic table
    res.json(`User ${body.id} modified successfully`);
  });
}

function editUser(req, res) {
  const body = req.body;
  var file = null;
  if (req.file != null) {
    file = req.file.filename;
  }

  sql = `UPDATE users 
  SET 
  name = ?,
  address = ?,
  phone = ?,
  mail = ?,
  pic = COALESCE(?, pic)
  WHERE id = ?`;
  db_.run(
    sql,
    [body.name, body.address, body.phone, body.mail, file, body.id],
    (err) => {
      if (err) {
        res.json(err.message);
        return;
      }
      const currentDate = new Date();
      registerUserNotes(body.id, currentDate, body.notes);
      res.json(`User ${body.name} modified successfully`);
    }
  );
}

function getNextUserId(res) {
  const sql = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users`;
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
  registerUser: registerUser,
  findUser: findUser,
  findUserNotes: findUserNotes,
  getUserById: getUserById,
  getLendedBooks: getLendedBooks,
  updateUser: updateUser,
  getNextUserId: getNextUserId,
};
