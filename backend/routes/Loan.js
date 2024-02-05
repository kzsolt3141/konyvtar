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

router.get("/book/:id", async (req, res) => {
  // TODO check param is valid
  if (isNaN(req.params.id)) {
    res.json("Hiba tortet");
    return;
  }

  result = await database.getLoanByBid(req.params.id);
  res.json(result);
});

router.get("/user/:id", async (req, res) => {
  // TODO check param is valid
  // TODO see: db_users.getLendedBooks(id, res);
  if (isNaN(req.params.id)) {
    res.json("Hiba tortet");
    return;
  }

  result = await database.getLoanByUid(id);
  res.json(result);
});

//----------------------------------------------------------------
router
  .route("/")
  // new loan posted by the user
  // TODO future imporvement: if body.user is empty, use req.user.id
  .post(upload.none(), (req, res) => {
    console.log(req.body);
    database.lend(req.body, res);
  });

module.exports = router;
