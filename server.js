const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const session = require("express-session");
const db = require("./config/db");

//login
require("dotenv").config();
const passport = require("passport");
const enpoint_ = process.env.ADDITIONAL_ENDPOINT;
const domain_ = process.env.DOMAIN;

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
  res.render("index", { user: req.user, domain: domain_ });
});

app.get(enpoint_ + "/admin", checkAuth, (req, res) => {
  res.render("admin", { domain: domain_ });
});
app.get(enpoint_ + "/login", (req, res) => {
  res.render("login", { optional: enpoint_ });
});

//DYNAMIC TEXT

let dynamicContent = "Welcome rich people enjoyers";
let dynamicContent2 = "Have Fun";

app.put("/api/dynamic-content/edit", (req, res) => {
  const newContent = req.body;
  dynamicContent = newContent.content;
  dynamicContent2 = newContent.content2;
  console.log(dynamicContent);
  res.send("succes");
});

app.get("/api/dynamic-content", (req, res) => {
  res.json({ content: dynamicContent, content2: dynamicContent2 });
});

//ADMIN PANEL

app.post(enpoint_ + "/admin/login", (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (req.body.password === adminPassword) {
    req.session.isAuthenticated = true;
    res.redirect(enpoint_ + "/admin");
  } else {
    res.send(alert("Wrong Password"));
  }
});

//Middleware

function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect(enpoint_ + "/login");
  }
}

app.get(enpoint_ + "/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect(enpoint_ + "/");
    }
  });
});

//RESTFULAPI

app.get(domain_ + "/rich", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const rows = await connection.query(
      "SELECT * FROM ludzie ORDER BY id DESC"
    );
    res.json(rows);
    connection.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("SERVER_ERROR");
  }
});

//1-Comments

app.get(domain_ + "/all", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const rows = await connection.query("SELECT * FROM post ORDER BY id DESC");
    res.json(rows);
    connection.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("SERVER_ERROR");
  }
});
app.post(domain_ + "/post/add", (req, res) => {
  const { nick, tresc } = req.body;
  var now = new Date();
  var czas = `${(now.getHours() < 10 ? "0" : "") + now.getHours()}:${
    (now.getMinutes() < 10 ? "0" : "") + now.getMinutes()
  }, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const sql = `INSERT INTO post (nick, tresc, czas) VALUES (?, ?, ?)`;
  db.query(sql, [nick, tresc, czas], (err, result) => {
    if (err) {
      console.error("Error while adding the post:", err);
      res.status(500).send("SERVER_ERROR");
    } else {
      console.log("The post has been added successfully.");
      res.send("SUCCESS");
    }
  });
});

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

app.delete(domain_ + "/post/delete/:id", (req, res) => {
  const postId = req.params.id;
  db.query("DELETE FROM post WHERE id = ?", [postId], (err, result) => {
    if (err) {
      res.status(500).send("SERVER_ERROR");
    } else {
      res.send("SUCCES");
    }
  });
});

//2-ContactWithMe

app.post(domain_ + "/submit-form", (req, res) => {
  const { name, phone, email, message } = req.body;
  console.log("INFO:", req.body);
  //U CAN USE NODEMAILER
});

//3-RichPeople

app.post(domain_ + "/edit/add", (req, res) => {
  const { imie, wiek, majatek, kraj, link_do_zdjecia, krotki_opis } = req.body;
  const sql = `INSERT INTO ludzie (imie, wiek, majatek, kraj, link_do_zdjecia, krotki_opis) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [imie, wiek, majatek, kraj, link_do_zdjecia, krotki_opis],
    (err, result) => {
      if (err) throw err;
    }
  );
});

app.delete(domain_ + "/edit/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM ludzie WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
  });
});

app.put(domain_ + "/edit/update/:id", (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    "imie",
    "wiek",
    "majatek",
    "kraj",
    "link_do_zdjecia",
    "krotki_opis",
  ];
  const updates = [];

  for (let field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
    }
  }

  if (updates.length === 0) {
    return res.send("NO DATA");
  }

  const sql = `UPDATE ludzie SET ${updates.join(", ")} WHERE id = ?`;
  const values = allowedFields
    .filter((field) => req.body[field] !== undefined)
    .map((field) => req.body[field]);
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      res.send("WRONG ID");
    } else {
      res.send("SUCCES");
    }
  });
});

//Check
app.listen(port, () => {
  console.log(`SERVER LISTEN AT ${port}`);
});
