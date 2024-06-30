var db_ = null;

//----------------------------------------------------------------
function init(db) {
  if (db === null) return false;
  db_ = db;

  db_.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT,
        address TEXT,
        phone TEXT,
        birth_date DATE,
        occupancy TEXT,
        pic TEXT,
        admin BOOLEAN,
        status BOOLEAN
        
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

//----------------------------------------------------------------
function registerUser(body, file) {
  var filename = null;
  if (file) filename = file.filename;

  return new Promise((resolve, reject) => {
    // seach for incompatible user data (phone and email both used by other user)
    var sql = `SELECT * FROM users WHERE email = ?`;
    db_.all(sql, [body.email], (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      if (rows && rows.length > 0) {
        reject(`Email:${body.email} is used`);
        return;
      }

      // it's ok to start adding the user
      sql = `
        INSERT INTO users 
        (name, email, password, address, phone, birth_date, occupancy, pic, admin, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE) `;
      db_.run(
        sql,
        [
          body.name,
          body.email,
          body.password,
          body.address,
          body.phone,
          body.birth_date,
          body.occupancy,
          filename,
        ],
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
  if (!notes || notes == "") notes = "Init";
  const sql = `
    INSERT INTO user_notes (id, date, notes) 
    VALUES (?, ?, ?)`;

  db_.run(sql, [id, date.toISOString().split("T")[0], notes], (err) => {
    if (err) {
      return;
    }
  });
}

//----------------------------------------------------------------
async function findUser(body) {
  key = body.key.trim();
  const status = body.status == "on" ? 1 : 0;
  const sql = `
    SELECT id, name, address, phone, email, pic, status
    FROM users
    WHERE 
      LOWER(${body.type}) LIKE LOWER(?) 
        AND 
      status = ?
    LIMIT 100`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [`%${key}%`, status], (err, rows) => {
      if (err) {
        reject(err.message);
        return;
      }
      resolve(rows);
    });
  });
}

async function getUserNotesById(id) {
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

  return new Promise((resolve, reject) => {
    db_.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      // TODO delete rows[0].password;
      resolve(rows[0]);
    });
  });
}

function getUserByEmail(email) {
  const sql = `SELECT * FROM users WHERE email = ?`;

  return new Promise((resolve, reject) => {
    db_.all(sql, [email], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows[0]);
    });
  });
}

function getNextUserId(res) {
  const sql = `SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users`;
  return new Promise((resolve, reject) => {
    db_.all(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
        reject("Hiba!");
        return;
      }
      resolve(rows[0].next_id);
    });
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

function editUser(body, file) {
  return new Promise((resolve, reject) => {
    if (body == null) {
      reject("empty body");
      return;
    }

    var fileName = null;
    if (file != null) {
      fileName = file.filename;
    }

    sql = `UPDATE users 
      SET 
        name = ?,
        email = ?,
        password = COALESCE(?, password),
        address = ?,
        phone = ?,
        birth_date = ?,
        occupancy = ?,
        pic = COALESCE(?, pic)
      WHERE id = ?`;
    db_.run(
      sql,
      [
        body.name,
        body.email,
        body.password,
        body.address,
        body.phone,
        body.birth_date,
        body.occupancy,
        fileName,
        body.id,
      ],
      (err) => {
        if (err) {
          reject(err.message);
          return;
        }
        const currentDate = new Date();
        registerUserNotes(body.id, currentDate, body.notes);
        resolve(`User ${body.name} modified successfully`);
      }
    );
  });
}

module.exports = {
  init: init,
  registerUser: registerUser,
  findUser: findUser,
  getUserNotesById: getUserNotesById,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
  getLendedBooks: getLendedBooks,
  getNextUserId: getNextUserId,
  editUser: editUser,
};
