// default route /loan
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("../db_common.js");
//----------------------------------------------------------------
const router = express.Router();

//----------------------------------------------------------------
const base_dir = __dirname;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(base_dir, "uploads"));
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

module.exports = router;
