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
async function lend(uid, bid, notes) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAvailable = await bookIsAvailable(bid);
      if (!isAvailable[0]) {
        reject(`failed by checking: book is at a user ${isAvailable[1]}`);
        return;
      }

      sql = `
        INSERT INTO loan 
        (bid, uid, lend_date, lend_notes) 
        VALUES (?, ?, ?, ?)`;
      const date = new Date();

      db_.run(
        sql,
        [bid, uid, date.toISOString().split("T")[0], notes],
        (err) => {
          if (err) {
            reject(err.message);
            return;
          }
          resolve("Done");
        }
      );
    } catch {
      reject("failed");
    }
  });
}

//----------------------------------------------------------------
async function bring(bid, notes) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAvailable = await bookIsAvailable(bid);
      if (isAvailable[0]) {
        reject("failed by checking: book is available");
        return;
      }
      sql = `UPDATE loan
        SET back_date = ?, back_notes = ?
        WHERE uid = ? AND bid = ? AND back_date IS NULL`;
      const date = new Date();

      db_.run(
        sql,
        [date.toISOString().split("T")[0], notes, isAvailable[1], bid],
        (err) => {
          if (err) {
            reject(err.message);
            return;
          }
          resolve("Done!");
        }
      );
    } catch (err) {
      reject(err.message);
    }
  });
}

async function getLoanByBid(bid) {
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

async function getLoanByUid(uid) {
  return new Promise((resolve, reject) => {
    sql = `
    SELECT loan.lend_date, books.title, loan.lend_notes, loan.back_date, loan.back_notes
    FROM loan
    JOIN books ON loan.bid = books.id
    WHERE loan.uid = ?
      `;
    db_.all(sql, [uid], (err, rows) => {
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
  getLoanByBid: getLoanByBid,
  getLoanByUid: getLoanByUid,
};
