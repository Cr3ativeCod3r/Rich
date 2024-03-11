const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

//MODULES
const db = require("./config/db");
const adminRoutes = require("./routes/admin/admin");
const APIroutes = require("./routes/api/api");

//.ENV
require("dotenv").config();
const ADMIN = process.env.ADMIN;
const API = process.env.API;

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", require("ejs").__express);

//VIEWS
app.get("/", (req, res) => {
  res.render("index", { user: req.user, domain: API });
});
app.use(ADMIN + "/", adminRoutes);
app.use(API + "/", APIroutes);

//SERVERLISTEN
app.listen(port, () => {
  console.log(`SERVER LISTEN AT ${port}`);
});
