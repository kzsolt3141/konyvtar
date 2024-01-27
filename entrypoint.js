const express = require("express");
const path = require("path");
const ejs = require("ejs");

const session = require("express-session");
const flash = require("express-flash");

const common = require("./backend/common.js");

//----------------------------------------------------------------
common.db_init();

//----------------------------------------------------------------
const app = express();

app.use(express.static(path.join(process.cwd(), "public")));
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

app.use(common.ipLoggerMW);

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
  common.saveAllTables(res);
});
