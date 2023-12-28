const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("./db_common.js");
const { findBookNotes } = require("./db_books.js");

//----------------------------------------------------------------
database.init();

//----------------------------------------------------------------
const app = express();
app.use(express.static("frontend"));
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
const base_dir = path.join(__dirname, "../");

app.get("/", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/index.html"));
});

app.get("/book", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/book.html"));
});

app.get("/user", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/user.html"));
});

//TODO implement this
// app.get("/lend", (req, res) => {
//   res.sendFile(path.join(base_dir, "frontend/lend.html"));
// });

//TODO implement this
// app.get("/list", (req, res) => {
//   res.sendFile(path.join(base_dir, "frontend/list.html"));
// });

//----------------------------------------------------------------
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
const textMulter = multer();

//----------------------------------------------------------------

app.post("/book/add", upload.array("images"), (req, res) => {
  newNames = [];
  req.files.forEach((file) => {
    newNames.push(file.filename);
  });

  // TODO update with meaningful res messages + start using HTTP status codes
  database
    .registerBook(req.body, newNames)
    .then((message) => {
      res.json(message);
    })
    .catch((err) => {
      newNames.forEach((newName) => {
        fs.unlink(path.join(base_dir, "uploads", newName), (err) => {
          if (err) {
            console.log(err.message);
            sts = `Could not delete picture: ${req.body}`;
          } else {
            console.log("deleted:", newName);
          }
        });
      });
      res.json(err);
    });
});

//----------------------------------------------------------------

app.post("/book/find", upload.none(), (req, res) => {
  findBookHandler(req, res);
});

async function findBookHandler(req, res) {
  try {
    const books = await database.findBook(req.body);
    result = [];

    const bookPromises = books.map(async function (book) {
      try {
        const notes = await findBookNotes(book.id);
        return [book, ...notes];
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

app.post("/book/find_book_pic", textMulter.none(), (req, res) => {
  database.findBookPic(req.body, res);
});

//----------------------------------------------------------------
app.post("/book/delete_book_pic", textMulter.none(), (req, res) => {
  const sts = "";
  fs.unlink(path.join(base_dir, "uploads", req.body), (err) => {
    if (err) {
      console.log(err.message);
      sts = `Could not delete picture: ${req.body}`;
    } else {
      database.deleteBookPic(req.body, sts);
    }
  });
  res.json(sts);
});

//----------------------------------------------------------------

app.post("/book/change", upload.none(), (req, res) => {
  database.editBook(req.body, res);
});

//----------------------------------------------------------------

app.post("/book/genres", textMulter.none(), (req, res) => {
  if (Object.keys(req.body).length == 0) {
    database.getGenres(res);
  } else {
    database.addGenre(req.body, res);
  }
});

//----------------------------------------------------------------
//----------------------------------------------------------------

app.post("/user/add", upload.single("image"), (req, res) => {
  // TODO update with meaningful res messages + start using HTTP status codes
  database
    .registerUser(req.body, req.file.filename)
    .then((message) => {
      res.json(message);
    })
    .catch((err) => {
      fs.unlink(path.join(base_dir, "uploads", req.file.filename), (err) => {
        if (err) console.log(err.message);
      });
      res.json(err);
    });
});

//----------------------------------------------------------------
app.post("/user/find", upload.none(), (req, res) => {
  findUserHandler(req, res);
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

// TODO implement
app.post("/user/edit", upload.none(), (req, res) => {
  database.editUser(req.body, res);
});
//----------------------------------------------------------------
app.listen(8080, () => {
  console.log("Server listening on 8080");
});

//----------------------------------------------------------------
app.post("/lend/add", upload.none(), (req, res) => {
  database.lend(req.body, res);
});
