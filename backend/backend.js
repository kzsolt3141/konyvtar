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

app.get("/konyv", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/konyv.html"));
});

app.get("/kliens", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/kliens.html"));
});

app.get("/kolcsonzes", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/kolcsonzes.html"));
});

app.get("/lista", (req, res) => {
  res.sendFile(path.join(base_dir, "frontend/lista.html"));
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

app.post("/konyv/mentes", upload.array("kepek"), (req, res) => {
  database.registerBook(req.body);
  database.registerBookImgs(req.body.isbn, bookImgs);
  res.json("Sikeres konyv mentes!");
});

app.post("/konyv/kereses", upload.none(), (req, res) => {
  database.findBook(req.body, res);
});

app.post("/konyv/torles", textMulter.none(), (req, res) => {
  console.log("torles:", req.body);
  database.deleteBook(req.body, res);
});

app.post("/kliens/mentes", upload.any(), (req, res) => {
  console.log(req.body);
  database.registerUser(req.body);
  res.json("Sikeres kliens mentes!");
});

//----------------------------------------------------------------
app.listen(8080, () => {
  console.log("Server listening on 8080");
});
