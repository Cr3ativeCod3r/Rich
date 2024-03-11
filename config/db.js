const dotenv = require("dotenv");
const mariadb = require("mariadb");
dotenv.config();

const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;


const db = mariadb.createPool({
    host,
    user,
    password,
    database
  });


  module.exports = db;