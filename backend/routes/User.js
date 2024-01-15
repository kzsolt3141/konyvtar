// default route /user
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("../db_common.js");

//----------------------------------------------------------------
const router = express.Router();

//----------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(base_dir, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const newName = Date.now() + "_" + file.originalname;
    cb(null, newName);
  },
});

const upload = multer({ storage: storage });

//----------------------------------------------------------------
router.post("/add", upload.single("image"), (req, res) => {
  database
    .registerUser(req)
    .then((message) => {
      res.json(message);
    })
    .catch((err) => {
      if (req.file) {
        fs.unlink(
          path.join(base_dir, "../../uploads", req.file.filename),
          (err) => {
            if (err) console.log(err.message);
          }
        );
      }
      res.json(err);
    });
});

//----------------------------------------------------------------
router
  .route("/find/:search?")
  .post(upload.none(), (req, res) => {
    if (req.params.search == "bulk") {
      findUserHandler(req, res);
    } else {
      res.json("HIBA");
    }
  })
  .get((req, res) => {
    if (req.params.search.includes("id=")) {
      id = req.params.search.split("id=")[1];
      database.getUserNameById(id, res);
    } else if (req.params.search.includes("loan=")) {
      id = req.params.search.split("loan=")[1];
      database.getLendedBooks(id, res);
    } else {
      res.json("HIBA");
    }
  });

async function findUserHandler(req, res) {
  try {
    const users = await database.findUser(req.body);
    result = [];

    const userPromises = users.map(async function (user) {
      try {
        const notes = await database.findUserNotes(user.id);
        return [user, ...notes];
      } catch (err) {
        throw err; // or handle the error as needed
      }
    });

    Promise.all(userPromises)
      .then((result) => {
        res.json(JSON.stringify(result));
      })
      .catch((err) => {
        res.json(err);
      });
  } catch (err) {
    res.json(err);
  }
}

//----------------------------------------------------------------
// TODO USE parameter for bulk/staus
router.post("/edit", upload.single("image"), (req, res) => {
  database.updateUser(req, res);
});

module.exports = router;
