// default route /loan
const express = require("express");
const path = require("path");
const multer = require("multer");

const database = require("../db_loan.js");
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
  .route("/active/:id")
  // return active loan of a book: if the book is in stock, return null
  // if not, return the user info (one row) who has the book
  .get(p.checkAuthenticated, async (req, res) => {
    try {
      result = await database.getActiveLoanByBid(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(500).json(err.message);
    }
  });

router
  .route("/book/:id")
  // return all the loan hitory of a book
  .get(p.checkAuthAdmin, async (req, res) => {
    if (isNaN(req.params.id)) {
      res.json("Hiba tortet");
      return;
    }

    result = await database.getLoanByBid(req.params.id);
    res.json(result);
  })
  // bring back lended book in stock from user
  .put(p.checkAuthAdmin, upload.none(), async (req, res) => {
    // TODO use try and catch error
    // TODO add json response Book title and User name
    message = await database.bring(req.params.id, req.body.action_notes);
    res.json(message);
  });

router
  .route("/user/:id")
  // return all the loan hitory of a user
  .get(p.checkAuthAdmin, async (req, res) => {
    // TODO check param is valid
    // TODO see: db_users.getLendedBooks(id, res);
    if (isNaN(req.params.id)) {
      res.json("Hiba tortet");
      return;
    }

    result = await database.getLoanByUid(req.params.id);
    res.json(result);
  })
  // give available book from stock to user
  //TODO future inmpovement: is the one who sends this request is NOT admin, put the data into a waiting list (queue)
  .put(p.checkAuthAdmin, upload.none(), async (req, res) => {
    // TODO check param is valid (see max user ID and others ?)
    // TODO check if has message loan_text ?)
    if (isNaN(req.params.id)) {
      res.json("Hiba tortet");
      return;
    }

    const message = await database.lend(
      req.params.id,
      req.body.bid,
      req.body.loan_text
    );
    res.json(message);
  });

module.exports = router;
