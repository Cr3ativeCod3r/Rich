const express = require("express");
const mariadb = require("mariadb");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000 ;
const cors = require("cors");
const session = require("express-session");

require("dotenv").config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(__dirname + "/assets"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", require("ejs").__express);

//VIEWS

app.get(process.env.DOMAIN, (req, res) => {
  res.render("index", { domain: process.env.DOMAIN });
});
app.get(process.env.ADDITIONAL_ENDPOINT + "/admin", checkAuth, (req, res) => {
  res.render("admin", { domain: process.env.DOMAIN });
});
app.get(process.env.ADDITIONAL_ENDPOINT + "/login", (req, res) => {
  res.render("login", { optional: process.env.ADDITIONAL_ENDPOINT });
});

//CONNECT BASE

const db = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

//DYNAMIC TEXT

let dynamicContent = "Welcome rich people enjoyers";
let dynamicContent2 = "Have Fun";

app.put(process.env.DOMAIN + "/api/dynamic-content/edit", (req, res) => {
  const newContent = req.body;
  dynamicContent = newContent.content;
  dynamicContent2 = newContent.content2;
  res.send("succes");
});

app.get(process.env.DOMAIN + "/api/dynamic-content", (req, res) => {
  res.json({ content: dynamicContent, content2: dynamicContent2 });
});

//ADMIN PANEL

app.post(process.env.ADDITIONAL_ENDPOINT + "/admin/login", (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (req.body.password === adminPassword) {
    req.session.isAuthenticated = true;
    res.redirect(process.env.ADDITIONAL_ENDPOINT + "/admin");
  } else {
    res.send(alert("Wrong Password"));
  }
});

//Middleware

function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect(process.env.ADDITIONAL_ENDPOINT + "/login");
  }
}

app.get(process.env.ADDITIONAL_ENDPOINT + "/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect(process.env.ADDITIONAL_ENDPOINT + "/login");
    }
  });
});

//RESTFULAPI

app.get(process.env.DOMAIN + "/rich", async (req, res) => {
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

app.get(process.env.DOMAIN + "/all", async (req, res) => {
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
app.post(process.env.DOMAIN + "/post/add", (req, res) => {
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

app.delete(process.env.DOMAIN + "/post/delete/:id", (req, res) => {
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

app.post(process.env.DOMAIN + "/submit-form", (req, res) => {
  const { name, phone, email, message } = req.body;
  console.log("INFO:", req.body);
  //U CAN USE NODEMAILER
});

//3-RichPeople

app.post(process.env.DOMAIN + "/edit/add", (req, res) => {
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

app.delete(process.env.DOMAIN + "/edit/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM ludzie WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
  });
});

app.put(process.env.DOMAIN + "/edit/update/:id", (req, res) => {
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
