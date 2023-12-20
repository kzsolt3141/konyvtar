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
        pic TEXT
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

function registerUser(body, filename, res) {
  var sql = `SELECT * FROM users WHERE phone = ? AND mail = ?`;
  db_.all(sql, [body.phone, body.mail], (err, rows) => {
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
    sql = `INSERT INTO users (name, address, phone, mail, status) VALUES (?, ?, ?, ?, ?, 1) `;
    db_.run(
      sql,
      [body.name, body.address, body.phone, body.mail, filename],
      (err) => {
        if (err) {
          console.log(err);
          res.json(`User ${body.name} could not be added`);
          return;
        }
        console.log(`User ${body.name} added successfully`);
        res.json(`User ${body.name} added successfully`);
      }
    );
  });
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
