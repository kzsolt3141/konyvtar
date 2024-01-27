// default route /loan
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("../common.js");
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

router.get("/:id?", async (req, res) => {
  if (req.params.id.includes("bid=")) {
    id = req.params.id.split("bid=")[1];
    result = await database.getLoansByBookId(id);
    res.json(result);
  }
});

module.exports = router;
