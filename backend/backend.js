const express = require("express");
const path = require("path");
const multer = require("multer");

const database = require("./database.js");

//----------------------------------------------------------------
database.init();

//----------------------------------------------------------------
const app = express();
app.use(express.static("frontend"));
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
const bookImgs = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(base_dir, "uploads"));
  },
  filename: function (req, file, cb) {
    const newName = req.body.isbn + "_" + file.originalname;
    bookImgs.push(newName);
    cb(null, newName);
  },
});

const upload = multer({ storage: storage });

const textMulter = multer();

app.post("/book/add", upload.array("images"), (req, res) => {
  database.registerBook(req.body);
  database.registerBookPics(req.body.isbn, bookImgs);
  res.json(`${req.body.title} was saved successfully!`);
});

app.post("/book/find", upload.none(), (req, res) => {
  database.findBook(req.body, res);
});

app.post("/book/delete", textMulter.none(), (req, res) => {
  database.deleteBook(req.body, res);
});

app.post("/user/add", upload.any(), (req, res) => {
  console.log(req.body);
  database.registerUser(req.body);
  res.json(`${req.body.name} added successfully!`);
});

//----------------------------------------------------------------
app.listen(8080, () => {
  console.log("Server listening on 8080");
});
