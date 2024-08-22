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
// user profile pictures will be placed in uploads folder
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
// login should happen only when the user is not logged in
router
  .route("/login")
  // route to login page the unauthenticated user
  .get(p.checkNotAuthenticated, (req, res) => {
    res.render("user_login", {});
  })
  // authenticate with the posted email and password, for datils see
  // passport_config.js initialize
  .post(
    p.checkNotAuthenticated,
    p.passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/user/login",
      failureFlash: true,
    })
  )
  // logout current user
  .delete((req, res) => {
    req.logOut(() => {});
    res.json("logout");
  });

//----------------------------------------------------------------
//TODO implement feedback page and handling here
router
  .route("/feedback")
  // return all books in a simple table
  .get(p.checkAuthenticated, async (req, res) => {
    res.render("feedback", {
      admin: req.user.admin,
      user_id: req.user.id,
      user_pic: req.user.pic,
      user_name: req.user.name,
    });
  })
  // do the same but return it in json, will be used to display books in frontend
  .post(p.checkAuthenticated, upload.none(), async (req, res) => {
    let message = "Done!";
    let total = 0;
    let users = null;
    let sts = 200;

    try {
      users = await db_users.getAllUsers(req.body);
      total = await db_users.getTotalUserNumber();
    } catch (err) {
      message = err.message;
      sts = 500;
    }

    res.status(sts).json({ total, users, message });
  });

//----------------------------------------------------------------
router
  .route("/table")
  // return all books in a simple table
  .get(p.checkAuthenticated, async (req, res) => {
    res.render("user_table", {
      admin: req.user.admin,
      user_id: req.user.id,
      user_pic: req.user.pic,
      user_name: req.user.name,
    });
  })
  // do the same but return it in json, will be used to display books in frontend
  .post(p.checkAuthenticated, upload.none(), async (req, res) => {
    //TODO receive a message with a feedback for the page
    res.status(sts).json({});
  });

//----------------------------------------------------------------
// [ADMIN] retreive user details in JSON
router
  .route("/details/:id?")
  // [ADMIN] retreive an existing user by it's ID
  .get(p.checkAuthAdmin, async (req, res) => {
    const nextUserId = await db_users.getNextUserId();
    if (isNaN(req.params.id) || req.params.id >= nextUserId) {
      res.json(`hiba a ${req.params.id} keresese kozben`);
    }

    try {
      const user = await db_users.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      res.json(err);
    }
  })
  // [ADMIN] find a user by its details and return all the other details
  .post(p.checkAuthAdmin, upload.none(), async (req, res) => {
    const users = await db_users.findUser(req.body);
    res.json(users);
  });

//----------------------------------------------------------------
// [ADMIN] return user notes
router
  .route("/notes/:id")
  // [ADMIN] find all notes for a user ID
  .get(p.checkAuthenticated, async (req, res) => {
    const nextUserId = await db_users.getNextUserId();

    if (
      isNaN(req.params.id) ||
      req.params.id >= nextUserId ||
      (req.params.id != req.user.id && req.user.admin != 1)
    ) {
      res.status(500).render("user", {
        uid: nextUserId,
        blank: true,
        message: "Invalid user ID! Redirecting...",
      });
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
  // [ADMIN] require page to show used information (ID)
  .get(p.checkAuthenticated, async (req, res) => {
    const nextUserId = await db_users.getNextUserId();
    if (
      isNaN(req.params.id) ||
      req.params.id >= nextUserId ||
      (req.params.id != req.user.id && req.user.admin != 1)
    ) {
      res.status(500).render("user", {
        uid: nextUserId,
        blank: true,
        message: "Invalid book ID! Redirecting...",
      });
    } else {
      const user = await db_users.getUserById(req.params.id);
      res.render("user", {
        uid: user.id,
        useradmin: req.user.admin,
        admin: user.admin,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        birth_date: user.birth_date,
        occupancy: user.occupancy,
        status: user.status,
        pic: user.pic,
        message: `Required user with ID ${user.id}`,

        admin: req.user.admin,
        user_id: req.user.id,
        user_pic: req.user.pic,
        user_name: req.user.name,
      });
    }
  })
  // [ADMIN] update user information
  .post(p.checkAuthenticated, upload.single("image"), async (req, res) => {
    const nextUserId = await db_users.getNextUserId();
    var message = "";
    if (req.body.password != "") {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else req.body.password = null;

    if (
      isNaN(req.params.id) ||
      req.params.id >= nextUserId ||
      (req.params.id != req.user.id && req.user.admin != 1)
    ) {
      res.status(500).render("user", {
        uid: nextUserId,
        blank: true,
        message: "Invalid user ID! Redirecting...",
      });
    } else {
      try {
        message = await db_users.editUser(req.body, req.file);
      } catch (err) {
        message = err.message;
      }
      console.log(message);
      const user = await db_users.getUserById(req.params.id);
      res.render("user", {
        uid: user.id,
        useradmin: req.user.admin,
        admin: user.admin,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        birth_date: user.birth_date,
        occupancy: user.occupancy,
        status: user.status,
        pic: user.pic,
        message: message,

        admin: req.user.admin,
        user_id: req.user.id,
        user_pic: req.user.pic,
        user_name: req.user.name,
      });
    }
  })
  .put(p.checkAuthAdmin, upload.none(), async (req, res) => {
    const nextUserId = await db_users.getNextUserId();
    var message = "init";
    var user = "";
    var status = 200;
    if (
      !isNaN(req.params.id) &&
      req.params.id < nextUserId &&
      Object.keys(req.body).length &&
      "action_notes" in req.body
    ) {
      try {
        message = await db_users.toggleUserStatus(
          req.params.id,
          req.body.action_notes
        );

        user = await db_users.getUserById(req.params.id);
      } catch (err) {
        message = err.message;
        status = 500;
      }
    }
    res.status(status).json({
      message: message,
      userName: user.name,
      userStatus: user.status,
    });
  });

router
  .route("/")
  // [PUBLIC] require page to add new user to the database
  .get(async (req, res) => {
    if (req.user == null) {
      res.render("user", {
        blank: true,
      });
    } else {
      res.render("user", {
        blank: true,

        admin: req.user.admin,
        user_id: req.user.id,
        user_pic: req.user.pic,
        user_name: req.user.name,
      });
    }
  })
  // [PUBLIC] upload new user data to the database
  .post(upload.single("image"), async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    db_users
      .registerUser(req.body, req.file)
      .then((message) => {
        res.render("user_login", { message: message });
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
        res.render("user", {
          message: err,
        });
      });
  });
module.exports = router;
