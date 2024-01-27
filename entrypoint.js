const express = require("express");
const path = require("path");
const ejs = require("ejs");

const session = require("express-session");
const flash = require("express-flash");

const database = require("./backend/db_common.js");

//----------------------------------------------------------------
database.init();

//----------------------------------------------------------------
const app = express();

app.use(express.static(path.join(process.cwd(), "frontend")));
app.use(express.static(path.join(process.cwd(), "uploads")));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.text());

//----------------------------------------------------------------
const p = require("./backend/passport_config.js");
p.initialize();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(p.passport.initialize());
app.use(p.passport.session());

//----------------------------------------------------------------
const bookRoute = require("./backend/routes/Book");
const userRoute = require("./backend/routes/User");
const loanRoute = require("./backend/routes/Loan");

app.use((req, res, next) => {
  const timeStamp = Date.now();
  const date = new Date(timeStamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based, so add 1 and pad with '0'
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const clientIp =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  console.log(
    `${year}-${month}-${day}; ${hours}:${minutes}:${seconds} => ` + clientIp
  );
  next();
});

app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/loan", loanRoute);

app.get("/", p.checkAuthenticated, (req, res) => {
  console.log("hello!");
  res.sendFile(path.join(__dirname, "frontend/index_disabled.html"));
});

//----------------------------------------------------------------
app.listen(8080, () => {
  console.log("Server listening on 8080");
});

app.get("/backup", (req, res) => {
  database.saveAllTables(res);
});
