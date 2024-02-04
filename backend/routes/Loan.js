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

//----------------------------------------------------------------
router.post("/add", upload.none(), (req, res) => {
  if (req.body.type == "true") {
    database.lend(req.body, res);
  } else {
    database.bring(req.body, res);
  }
});

router.get("/available/:id", async (req, res) => {
  result = await database.bookIsAvailable(req.params.id);
  res.json(result);
});

router.get("/book/:id", async (req, res) => {
  // TODO check param is valid
  if (isNaN(req.params.id)) {
    res.json("Hiba tortet");
    return;
  }

  result = await database.getLoanByBookId(id);
  res.json(result);
});

router.get("/user/:id", async (req, res) => {
  // TODO check param is valid
  // TODO see: db_users.getLendedBooks(id, res);
  if (isNaN(req.params.id)) {
    res.json("Hiba tortet");
    return;
  }

  result = await database.getLoanByUserId(id);
  res.json(result);
});

module.exports = router;
