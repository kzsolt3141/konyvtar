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
    cb(null, path.join(__dirname, "../../uploads"));
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
          path.join(__dirname, "../../uploads", req.file.filename),
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
    } else if (req.params.search == "table") {
      database.getAllBooks(req.body, res);
    } else {
      res.json("HIBA");
    }
  })
  .get(async (req, res) => {
    if (req.params.search.startsWith("id=")) {
      id = req.params.search.split("id=")[1];
      try {
        const book = await database.getBookById(id);
        res.json(book);
      } catch (err) {
        res.json(err.message);
      }
    } else if (req.params.search.startsWith("nid=")) {
      id = req.params.search.split("nid=")[1];
      try {
        const bookNotes = await database.getBookNotesById(id);
        res.json(bookNotes);
      } catch (err) {
        res.json(err.message);
      }
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
        const notes = await database.getBookNotesById(book.id);
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

router.route("/full/:id?").get(async (req, res) => {
  if (req.params.id) {
    res.render("full_book.ejs", {
      bid: req.params.id,
    });
  } else {
    res.json("HIBA");
  }
});

module.exports = router;
