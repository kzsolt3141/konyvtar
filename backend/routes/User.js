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
  .route("/details/:id?")
  .get(async (req, res) => {
    const nextUserId = await db_users.getNextUserId();
    if (isNaN(req.params.id) || req.params.id >= nextUserId) {
      res.json(`hiba a ${req.params.id} keresese kozben`);
    }

    try {
      const user = await db_users.getUserById(id);
      res.json(user);
    } catch (err) {
      res.json(err);
    }
  })
  .post(upload.none(), async (req, res) => {
    const users = await db_users.findUser(req.body);
    res.json(users);
  });

//----------------------------------------------------------------
router.route("/notes/:id").get(async (req, res) => {
  const nextUserId = await db_users.getNextUserId();
  if (isNaN(req.params.id) || req.params.id >= nextUserId) {
    res.json(`hiba a jegyzet ${req.params.id} keresese kozben`);
    return;
  }

  try {
    const notes = await db_users.getUserNotesById(req.params.id);
    res.json(notes);
  } catch (err) {
    res.json(err);
  }
});

//----------------------------------------------------------------
router
  .route("/:id")
  // GET: require page to show used information (ID)
  .get(p.checkAuthenticated, async (req, res) => {
    const nextUserId = await db_users.getNextUserId();

    if (
      !isNaN(req.params.id) &&
      req.params.id < nextUserId &&
      (req.params.id == req.user.id || req.user.admin == 1)
    ) {
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
    } else {
      res.redirect("/");
    }
  })
  // POST: update user information
  .post(p.checkAuthenticated, upload.single("image"), async (req, res) => {
    if (req.body.password != "") {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else req.body.password = null;

    if (isNaN(req.params.id)) {
      res.redirect("/");
    } else if (req.params.id == req.user.id || req.user.admin == 1) {
      const message = await db_users.editUser(req.body, req.file);
      console.log(message);
      res.redirect("/user/" + req.params.id);
    } else {
      res.redirect("/");
    }
  });
//TODO add toggle status as a PUT method here

router
  .route("/")
  // GET: require page to add new user to the database
  .get(async (req, res) => {
    res.render("user");
  })
  // POST: upload new user data to the database
  .post(upload.single("image"), async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    db_users
      .registerUser(req.body, req.file)
      .then((message) => {
        res.render("user", { message: message });
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
        res.render("user", { message: err });
      });
  });
module.exports = router;
