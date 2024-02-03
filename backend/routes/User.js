// default route /user
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");

const db_users = require("../db_users.js");
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

//----------------------------------------------------------------
router
  .route("/login")
  .get(p.checkNotAuthenticated, (req, res) => {
    res.render("user_login", {});
  })
  .post(
    p.checkNotAuthenticated,
    p.passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/user/login",
      failureFlash: true,
    })
  )
  .delete((req, res) => {
    req.logOut(() => {});
    res.json("logout");
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
        const user = await db_users.getUserById(id);
        res.json(user);
      } catch (err) {
        res.json(err.message);
      }
    } else if (req.params.search.startsWith("nid=")) {
      id = req.params.search.split("nid=")[1];
      try {
        const userNotes = await db_users.getUserNotesById(id);
        res.json(userNotes);
      } catch (err) {
        res.json(err.message);
      }
    } else if (req.params.search.includes("loan=")) {
      id = req.params.search.split("loan=")[1];
      db_users.getLendedBooks(id, res);
    } else if (req.params.search == "next") {
      db_users.getNextUserId(res);
    } else {
      res.json("HIBA");
    }
  });

async function findUserHandler(req, res) {
  try {
    const users = await db_users.findUser(req.body);
    result = [];

    const userPromises = users.map(async function (user) {
      try {
        const notes = await db_users.getUserNotesById(user.id);
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
router.post("/edit", upload.single("image"), (req, res) => {
  db_users.updateUser(req, res);
});

//----------------------------------------------------------------
router
  .route("/:id?")
  .get(async (req, res) => {
    const nextUserId = await db_users.getNextUserId();

    if (
      isNaN(req.params.id) ||
      req.user == null ||
      req.params.id == req.user.id
    ) {
      res.render("user");
    } else if (req.params.id < nextUserId) {
      const user = await db_users.getUserById(req.params.id);
      res.render("user", {
        uid: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        birth_date: user.birth_date,
        occupancy: user.occupancy,
        pic: user.pic,
      });
    }
  })
  .post(upload.single("image"), async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    db_users
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

module.exports = router;
