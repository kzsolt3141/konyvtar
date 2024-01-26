// default route /user
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const bcrypt = require("bcrypt");

const database = require("../db_common.js");

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
router
  .route("/login")
  .get((req, res) => {
    res.render("user_login", {});
  })
  .post(async (req, res) => {
    console.log("login post:", req.body);
    const user = await database.getUserByEmail(req.body.email);
    console.log(user);
    const auth = await bcrypt.compare(req.body.password, user.password);
    console.log("auth:", auth);
    res.json(200);
  });

router
  .route("/register")
  .get((req, res) => {
    res.render("user_register");
  })
  .post(upload.single("image"), async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    database
      .registerUser(req.body, req.file)
      .then((message) => {
        res.json(message);
      })
      .catch((err) => {
        if (req.file) {
          fs.unlink(
            path.join(__dirname, "../../uploads", req.file.filename),
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
  .get(async (req, res) => {
    if (req.params.search.startsWith("id=")) {
      id = req.params.search.split("id=")[1];
      try {
        const user = await database.getUserById(id);
        res.json(user);
      } catch (err) {
        res.json(err.message);
      }
    } else if (req.params.search.startsWith("nid=")) {
      id = req.params.search.split("nid=")[1];
      try {
        const userNotes = await database.getUserNotesById(id);
        res.json(userNotes);
      } catch (err) {
        res.json(err.message);
      }
    } else if (req.params.search.includes("loan=")) {
      id = req.params.search.split("loan=")[1];
      database.getLendedBooks(id, res);
    } else if (req.params.search == "next") {
      database.getNextUserId(res);
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
        const notes = await database.getUserNotesById(user.id);
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
