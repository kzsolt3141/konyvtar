var db_ = null;

function init(db) {
  if (db === null) return false;
  db_ = db;

  //   db_.run(`
  //     CREATE TABLE IF NOT EXISTS kolcsonzes (
  //         isbn TEXT PRIMARY KEY,
  //         id INTEGER,
  //         tipus TEXT
  //     )
  // `);

  db_.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        phone TEXT,
        mail TEXT,
        pic TEXT,
        status TEXT
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

function registerUser(body, filename) {
  return new Promise((resolve, reject) => {
    // seach for incopatible user data (phone and mail both used by other user)
    var sql = `SELECT * FROM users WHERE phone = ? AND mail = ?`;
    db_.all(sql, [body.phone, body.mail], (err, rows) => {
      if (err) {
        reject(err.message);
      }
      if (rows && rows.length > 0) {
        reject(`Phone:${body.phone} AND mail:${body.mail} used`);
      }

      // additional check for user validation
      if (body.name === "") reject("Empty name");
      if (body.address === "") reject("Empty address");
      if (body.phone === "") reject("Empty phone");

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
        console.log(`Notes coudld not be added to DB`);
        return;
      }
      console.log(`Notes added to DB`);
    });
  }
}

function findUser(body, res) {
  const sql = `SELECT * FROM users WHERE ${body.type} LIKE ?`;
  db_.all(sql, [`%${body.key}%`], (err, rows) => {
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
  db_.run(sql, [body], (err) => {
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
  registerUser: registerUser,
  findUser: findUser,
  deactivateUser: deactivateUser,
};
