var db_ = null;

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

//--------------------------

// TODO check if book is available
async function checkLoan(bid) {}

function lend(body, rsp) {
  console.log(body);
  sql = `
        INSERT INTO loan 
        (bid, uid, lend_date, lend_notes) 
        VALUES (?, ?, ?, ?)`;
  const date = new Date();
  db_.run(
    sql,
    [body.bid, body.uid, date.toISOString().split("T")[0], body.lend_notes],
    (err) => {
      if (err) {
        rsp.json(err.message);
        return;
      }
      rsp.json("Done");
    }
  );
}

function bring(body, rsp) {
  sql = `UPDATE loan
        SET back_date = ?, back_notes = ?
        WHERE uid = ? AND bid = ?`;
  const date = new Date();
  db_.run(
    sql,
    [date.toISOString().split("T")[0], body.back_notes, body.uid, body.bid],
    (err) => {
      if (err) {
        rsp.json(err.message);
        return;
      }
      rsp.json("Done!");
    }
  );
}

module.exports = {
  init: init,
  lend: lend,
  bring: bring,
};
