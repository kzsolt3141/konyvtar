// default route /book
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
    .registerBook(req)
    .then((message) => {
      res.json(message);
    })
    .catch((err) => {
      if (req.file) {
        fs.unlink(
          path.join(base_dir, "../../uploads", req.file.filename),
          (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("deleted:", req.file.filename);
            }
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
      findBookHandler(req, res);
    } else {
      res.json("HIBA");
    }
  })
  .get((req, res) => {
    if (req.params.search.includes("id=")) {
      id = req.params.search.split("id=")[1];
      database.getBookById(id, res);
    } else if (req.params.search == "next") {
      database.getNextBookId(res);
    } else {
      res.json("HIBA");
    }
  });

async function findBookHandler(req, res) {
  try {
    const books = await database.findBook(req.body);
    result = [];

    const bookPromises = books.map(async function (book) {
      try {
        const notes = await database.findBookNotes(book.id);
        const available = await database.bookIsAvailable(book.id);
        return [book, available, ...notes];
      } catch (err) {
        throw err; // or handle the error as needed
      }
    });

    Promise.all(bookPromises)
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
router.post("/change", upload.single("image"), (req, res) => {
  database.updateBook(req, res);
});

//----------------------------------------------------------------

router.post("/genres/:genre?", upload.none(), (req, res) => {
  if (req.params.genre) {
    database.addGenre(req.params.genre, res);
  } else {
    database.getGenres(res);
  }
});

router.route("/full/:id?").get((req, res) => {
  if (req.params.id) {
    // TODO gat all data about book
    // TODO get all book notes (date + notes)
    // TODO get all loans (date + name + <-/-> + notes)
    res.render("full_book.ejs", { id: req.params.id });
  } else {
    res.json("HIBA");
  }
});

module.exports = router;
