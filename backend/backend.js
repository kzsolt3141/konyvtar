const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("./database.js");

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

app.get("/lend", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/lend.html"));
});

app.get("/list", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/list.html"));
});

//----------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(base_dir, "uploads"));
  },
  filename: function (req, file, cb) {
    const newName = req.body.isbn + "_" + file.originalname;
    cb(null, newName);
  },
});

const upload = multer({ storage: storage });

const textMulter = multer();

app.post("/book/add", upload.array("images"), (req, res) => {
  var sts = null;
  newNames = [];
  req.files.forEach((file) => {
    newNames.push(file.filename);
  });

  database.registerBook(req.body, newNames, res);
});

app.post("/book/find", upload.none(), (req, res) => {
  database.findBook(req.body, res);
});

app.post("/book/find_book_pic", textMulter.none(), (req, res) => {
  database.findBookPic(req.body, res);
});

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

app.post("/book/delete", upload.none(), (req, res) => {
  database.deactivateBook(req.body, res);
});

app.post("/book/change", upload.none(), (req, res) => {
  database.editBook(req.body, res);
});

app.post("/book/get_genres", textMulter.none(), (req, res) => {
  database.getGenres(res);
});

app.post("/book/add_genre", textMulter.none(), (req, res) => {
  database.addGenre(req.body, res);
});

app.post("/user/add", upload.any(), (req, res) => {
  database.registerUser(req.body, res);
});

app.post("/user/deactivate", upload.any(), (req, res) => {
  database.deactivateUser(req.body, res);
});

app.post("/user/find", upload.none(), (req, res) => {
  database.findUser(req.body, res);
});
//----------------------------------------------------------------
app.listen(8080, () => {
  console.log("Server listening on 8080");
});
