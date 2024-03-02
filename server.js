const express = require("express");
const mariadb = require("mariadb");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");
const session = require("express-session");

require('dotenv').config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//CONNECT BASE
const db = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

//ADMIN PANEL
app.use(
  session({
    secret: "bardzoTajnyKlucz",
    resave: false,
    saveUninitialized: true,
  })
);
function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/login");
  }
}
app.post("/admin/login", (req, res) => {
  const adminPassword = "1234";
  if (req.body.password === adminPassword) {
    req.session.isAuthenticated = true;
    res.redirect("/admin");
  } else {
    res.send("Niepoprawne hasło!");
  }
});
app.use("/admin", checkAuth, express.static(path.join(__dirname, "public")));
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/admin/edit.js", function (req, res) {
  res.set("Content-Type", "text/javascript");
  res.sendFile(__dirname + "/public/edit.js");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});
app.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect("/admin");
    }
  });
});

//API
app.get("/rich", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const rows = await connection.query("SELECT * FROM ludzie");
    res.json(rows);
    connection.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd serwera");
  }
});

//FORM
app.post("/submit-form", (req, res) => {
  const { name, phone, email, message } = req.body;
  console.log("Otrzymano dane z formularza:", req.body);
  res.send("Dziękujemy za przesłanie formularza!");
});

// Dodawanie danych
app.post("/edit/add", (req, res) => {
  const { imie, wiek, majatek, kraj, link_do_zdjecia, krotki_opis } = req.body;
  const sql = `INSERT INTO ludzie (imie, wiek, majatek, kraj, link_do_zdjecia, krotki_opis) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [imie, wiek, majatek, kraj, link_do_zdjecia, krotki_opis],
    (err, result) => {
      if (err) throw err;
      res.send("Dane dodane do bazy");
    }
  );
});

// Usuwanie danych
app.delete("/edit/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM ludzie WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send("Dane usunięte z bazy");
  });
});

// Modyfikowanie danych
app.put("/edit/update/:id", (req, res) => {
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
    return res.send("Brak danych do aktualizacji.");
  }

  const sql = `UPDATE ludzie SET ${updates.join(", ")} WHERE id = ?`;
  const values = allowedFields
    .filter((field) => req.body[field] !== undefined)
    .map((field) => req.body[field]);
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      res.send("Nie znaleziono rekordu z podanym ID.");
    } else {
      res.send("Dane zaktualizowane pomyślnie.");
    }
  });
});

//SERVER
app.listen(port, () => {
  console.log(`Serwer słucha na porcie ${port}`);
});

