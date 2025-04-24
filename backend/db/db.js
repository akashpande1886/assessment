const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "inventory",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Db connected.");
});
module.exports = db;
