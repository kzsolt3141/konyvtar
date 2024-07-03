// default route /loan
const express = require("express");
const path = require("path");
const multer = require("multer");

const database = require("../db_loan.js");
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

router.get("/available/:id", async (req, res) => {
  result = await database.bookIsAvailable(req.params.id);
  res.json(result);
});

router
  .route("/book/:id")
  .get(async (req, res) => {
    // TODO check param is valid
    if (isNaN(req.params.id)) {
      res.json("Hiba tortet");
      return;
    }

    result = await database.getLoanByBid(req.params.id);
    res.json(result);
  })
  .put(upload.none(), async (req, res) => {
    message = await database.bring(req.params.id, req.body.action_notes);
    res.json(message);
  });

router
  .route("/user/:id")
  .get(async (req, res) => {
    // TODO check param is valid
    // TODO see: db_users.getLendedBooks(id, res);
    if (isNaN(req.params.id)) {
      res.json("Hiba tortet");
      return;
    }

    result = await database.getLoanByUid(id);
    res.json(result);
  })
  .put(upload.none(), async (req, res) => {
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
