var db_ = null;

//----------------------------------------------------------------
function init(db) {
  if (db === null) return false;
  db_ = db;

  db_.run(`
    CREATE TABLE IF NOT EXISTS loan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bid INTEGER,
        uid INTEGER,
        lend_date DATE,
        lend_notes TEXT,
        back_date DATE,
        back_notes TEXT
    )
`);
}

//----------------------------------------------------------------
async function bookIsAvailable(bid) {
  return new Promise((resolve, reject) => {
    sql = `
      SELECT uid FROM loan 
      WHERE bid = ? AND back_date IS NULL`;
    db_.all(sql, [bid], (err, rows) => {
      if (err) {
        reject(err.message);
      }
      if (rows.length > 0) {
        resolve([false, rows[0].uid]);
      } else {
        resolve([true, null]);
      }
    });
  });
}

//----------------------------------------------------------------
async function lend(body, rsp) {
  try {
    const isAvailable = await bookIsAvailable(body.bid);
    if (!isAvailable[0]) {
      rsp.json(`failed by checking: book is at a user ${isAvailable[1]}`);
      return;
    }

    sql = `
        INSERT INTO loan 
        (bid, uid, lend_date, lend_notes) 
        VALUES (?, ?, ?, ?)`;
    const date = new Date();
    db_.run(
      sql,
      [body.bid, body.uid, date.toISOString().split("T")[0], body.notes],
      (err) => {
        if (err) {
          rsp.json(err.message);
          return;
        }
        rsp.json("Done");
      }
    );
  } catch {
    rsp.json("failed");
  }
}

//----------------------------------------------------------------
async function bring(body, rsp) {
  try {
    const isAvailable = await bookIsAvailable(body.bid);
    if (isAvailable[0]) {
      rsp.json("failed by checking: book is available");
      return;
    }
    sql = `UPDATE loan
        SET back_date = ?, back_notes = ?
        WHERE uid = ? AND bid = ?`;
    const date = new Date();
    db_.run(
      sql,
      [date.toISOString().split("T")[0], body.notes, body.uid, body.bid],
      (err) => {
        if (err) {
          rsp.json(err.message);
          return;
        }
        rsp.json("Done!");
      }
    );
  } catch (err) {
    rsp.json(err.message);
  }
}

async function getLoansByBookId(bid) {
  return new Promise((resolve, reject) => {
    sql = `
    SELECT loan.lend_date, users.name, loan.lend_notes, loan.back_date, loan.back_notes
    FROM loan
    JOIN users ON loan.uid = users.id
    WHERE loan.bid = ?
      `;
    db_.all(sql, [bid], (err, rows) => {
      if (err) {
        reject(err.message);
      }
      resolve(rows);
    });
  });
}
//----------------------------------------------------------------
module.exports = {
  init: init,
  lend: lend,
  bring: bring,
  bookIsAvailable: bookIsAvailable,
  getLoansByBookId: getLoansByBookId,
};
