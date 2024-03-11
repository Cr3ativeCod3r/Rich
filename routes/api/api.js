const { Router } = require("express");
const router = Router();
const db = require("../../config/db");

require("dotenv").config();

let dynamicContent = "Welcome rich people enjoyers";
let dynamicContent2 = "Have Fun";

router.put("/dynamic-content/edit", (req, res) => {
  const newContent = req.body;
  dynamicContent = newContent.content;
  dynamicContent2 = newContent.content2;
  console.log(dynamicContent);
  res.send("succes");
});

router.get("/dynamic-content", (req, res) => {
  res.json({ content: dynamicContent, content2: dynamicContent2 });
  console.log(dynamicContent)
});

router.get("/rich", async (req, res) => {
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

router.get("/all", async (req, res) => {
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
router.post("/post/add", (req, res) => {
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

router.delete("/post/delete/:id", (req, res) => {
  const postId = req.params.id;
  db.query("DELETE FROM post WHERE id = ?", [postId], (err, result) => {
    if (err) {
      res.status(500).send("SERVER_ERROR");
    } else {
      res.send("SUCCES");
    }
  });
});

router.post("/submit-form", (req, res) => {
  const { name, phone, email, message } = req.body;
  console.log("INFO:", req.body);
  //U CAN USE NODEMAILER
});

router.post("/edit/add", (req, res) => {
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

router.delete("/edit/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM ludzie WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
  });
});

router.put("/edit/update/:id", (req, res) => {
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

module.exports = router;
