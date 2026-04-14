require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "abhi",
  database: process.env.DB_NAME || "biblio"
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected ✅");
});

module.exports = db;