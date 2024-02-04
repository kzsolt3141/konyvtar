// default route /book
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("../db_books.js");
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
  .route("/table")
  .get(async (req, res) => {
    res.render("book_table", {});
  })
  .post(upload.none(), async (req, res) => {
    const books = await database.getAllBooks(req.body);
    res.json(JSON.stringify(books));
  });

//----------------------------------------------------------------
router
  .route("/details/:id?")
  .get(async (req, res) => {
    const nextBookId = await database.getNextBookId();
    if (isNaN(req.params.search) || req.params.search >= nextBookId) {
      res.json(`hiba a ${req.params.search} keresese kozben`);
    }

    try {
      const book = await database.getBookById(id);
      res.json(book);
    } catch (err) {
      res.json(err);
    }
  })
  .post(upload.none(), async (req, res) => {
    const books = await database.findBook(req.body);
    res.json(books);
  });

//----------------------------------------------------------------
router.route("/notes/:id").get(async (req, res) => {
  const nextBookId = await database.getNextBookId();
  if (isNaN(req.params.id) || req.params.id >= nextBookId) {
    res.json(`hiba a jegyzet ${req.params.id} keresese kozben`);
    return;
  }

  try {
    const notes = await database.getBookNotesById(req.params.id);
    res.json(notes);
  } catch (err) {
    res.json(err);
  }
});
//----------------------------------------------------------------

router.post("/genres/:genre?", upload.none(), (req, res) => {
  if (req.params.genre) {
    database.addGenre(req.params.genre, res);
  } else {
    database.getGenres(res);
  }
});

//----------------------------------------------------------------
router
  .route("/:id")
  .get(p.checkAuthAdmin, async (req, res) => {
    const nextBookId = await database.getNextBookId();

    if (isNaN(req.params.id)) {
      res.render("book", { bid: nextBookId });
    } else if (req.params.id < nextBookId) {
      const book = await database.getBookById(req.params.id);
      res.render("book", {
        bid: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        year: book.year,
        publ: book.publ,
        ver: book.ver,
        keys: book.keys,
        price: book.price,
        pic: book.pic,
      });
    } else {
      res.redirect("/");
    }
  })
  .post(p.checkAuthAdmin, upload.single("image"), async (req, res) => {
    var message = "";
    var bid = "/book/";
    if (!isNaN(req.params.id)) {
      try {
        message = await database.editBook(req.body, req.file);
      } catch (err) {
        message = err.message;
      }
      bid += req.params.id;
    }
    res.redirect(bid);
  });
//TODO add toggle status as a PUT method here

//----------------------------------------------------------------
router
  .route("/")
  .get(p.checkAuthAdmin, async (req, res) => {
    const nextBookId = await database.getNextBookId();
    res.render("book", { bid: nextBookId });
  })
  .post(p.checkAuthAdmin, upload.single("image"), async (req, res) => {
    const nextBookId = await database.getNextBookId();
    var message = "";
    try {
      message = await database.registerBook(req);
    } catch (err) {
      message = err.message;
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
    }

    res.render("book", { message: message, bid: nextBookId + 1 });
  });

module.exports = router;
