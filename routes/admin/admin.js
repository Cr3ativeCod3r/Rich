const { Router } = require("express");
const router = Router();

require("dotenv").config();
const ADMIN = process.env.ADMIN;
const API = process.env.API;

router.get("/admin", checkAuth, (req, res) => {
  res.render("admin", { domain: API });
});

router.get("/login", (req, res) => {
  res.render("login", { optional: ADMIN });
});

router.post("/admin/login", (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (req.body.password === adminPassword) {
    req.session.isAuthenticated = true;
    res.redirect(ADMIN + "/admin");
  } else {
    res.send(alert("Wrong Password"));
  }
});

function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect(ADMIN + "/login");
  }
}

router.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect(ADMIN + "/");
    }
  });
});

module.exports = router;
