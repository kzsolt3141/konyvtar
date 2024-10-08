// default route /loan
const express = require("express");
const path = require("path");
const multer = require("multer");

const database = require("../db_loan.js");
const bookDB = require("../db_books.js");
const userDB = require("../db_users.js");
const p = require("../passport_config.js");
//----------------------------------------------------------------
const router = express.Router();

//----------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const newName = Date.now() + "_" + file.originalname;
    cb(null, newName);
  },
});

const upload = multer({ storage: storage });

router
  .route("/book/active/:bid")
  // return active loan of a book: if the book is in stock, return null
  // if not, return the user info (one row) who has the book
  .get(p.checkAuthenticated, async (req, res) => {
    var result = null;
    var sts = 200;
    try {
      const nextBookId = await bookDB.getNextBookId();
      if (isNaN(req.params.bid) || req.params.bid >= nextBookId) {
        throw new Error("Invalid input");
      }

      result = await database.getActiveLoanByBid(req.params.bid);
    } catch (err) {
      result = err.message;
      sts = 400;
    }

    res.status(sts).json(result);
  });

router
  .route("/user/active/:uid")
  // return active loan of a user: if tthere is none, return null
  // if not, return the book info one row for each book
  .get(p.checkAuthenticated, async (req, res) => {
    var result = null;
    var sts = 200;
    try {
      const nextUserId = await userDB.getNextUserId();

      if (isNaN(req.params.uid) || req.params.uid >= nextUserId) {
        throw new Error("Invalid input");
      }

      result = await database.getActiveLoanByUid(req.params.uid);
    } catch (err) {
      result = err.message;
      sts = 400;
    }
    res.status(sts).json(result);
  });

router
  .route("/book/:bid")
  // return all the loan hitory of a book
  .get(p.checkAuthAdmin, async (req, res) => {
    var result = null;
    var sts = 200;
    try {
      const nextBookId = await bookDB.getNextBookId();
      if (isNaN(req.params.bid) || req.params.bid >= nextBookId) {
        throw new Error("Invalid input");
      }

      result = await database.getLoanByBid(req.params.bid);
    } catch (err) {
      sts = 400;
      result = err.message;
    }
    res.status(sts).json(result);
  })
  // bring back lended book in stock from user
  .put(p.checkAuthAdmin, upload.none(), async (req, res) => {
    var message = null;
    var sts = 200;

    try {
      const nextBookId = await bookDB.getNextBookId();
      if (
        isNaN(req.params.bid) ||
        req.params.bid >= nextBookId ||
        Object.keys(req.body).length == 0 ||
        !("action_notes" in req.body)
      ) {
        throw new Error("Invalid input");
      }

      const activeLoan = await database.getActiveLoanByBid(req.params.bid);
      if (activeLoan === null) {
        throw new Error("No active loan found for the given bid");
      }
      message = await database.bring(
        activeLoan.uid,
        req.params.bid,
        req.body.action_notes
      );

      const book = await bookDB.getBookById(req.params.bid);

      message = `${book.title} ${message} by ${activeLoan.name}`;
    } catch (err) {
      if (err.message) {
        message = err.message;
      } else {
        message = err;
      }
      sts = 500;
    }
    res.status(sts).json(message);
  });

router
  .route("/user/:uid")
  // return all the loan hitory of a user
  .get(p.checkAuthAdmin, async (req, res) => {
    var result = null;
    var sts = 200;

    try {
      const nextUserId = await userDB.getNextUserId();

      if (isNaN(req.params.uid) || req.params.uid >= nextUserId) {
        throw new Error("Invalid input");
      }

      result = await database.getLoanByUid(req.params.uid);
    } catch (err) {
      sts = 400;
      result = err.message;
    }

    res.status(sts).json(result);
  })
  // give available book from stock to user
  //TODO future inmpovement: is the one who sends this request is NOT admin, put the data into a waiting list (queue)
  .put(p.checkAuthAdmin, upload.none(), async (req, res) => {
    var message = "";
    var sts = 200;

    try {
      const nextUserId = await userDB.getNextUserId();
      const nextBookId = await bookDB.getNextBookId();

      if (
        isNaN(req.params.uid) ||
        req.params.uid >= nextUserId ||
        Object.keys(req.body).length == 0 ||
        !("bid" in req.body) ||
        !("loan_text" in req.body) ||
        isNaN(req.body.bid) ||
        req.body.bid >= nextBookId
      ) {
        throw new Error("Invalid input");
      }

      message = await database.lend(
        req.params.uid,
        req.body.bid,
        req.body.loan_text
      );

      const book = await bookDB.getBookById(req.body.bid);
      const user = await userDB.getUserById(req.params.uid);

      message = `${book.title} ${message} to ${user.name}`;
    } catch (err) {
      message = err.message;
      sts = 500;
    }

    res.status(sts).json(message);
  });

module.exports = router;
