const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const database = require("./backend/db_common.js");

//----------------------------------------------------------------
database.init();

//----------------------------------------------------------------
const app = express();
app.use(express.static("frontend"));
app.use(express.static("uploads"));

app.use(express.urlencoded({ extended: true }));
app.use(express.text());

//----------------------------------------------------------------
const bookRoute = require("./backend/routes/Book");
const userRoute = require("./backend/routes/User");
const loanRoute = require("./backend/routes/Loan");

app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/loan", loanRoute);

//----------------------------------------------------------------
app.listen(8080, () => {
  console.log("Server listening on 8080");
});

app.post("/backup", (req, res) => {
  database.saveAllTables(fs, res);
  //TODO archive the file then send back to user
});
