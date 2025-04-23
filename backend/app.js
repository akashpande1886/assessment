const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyparser = require("body-parser");
const db = require("./db/db");
const router = require("./Routes/router");
const PORT = 8000;

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "frontend")));

// Set up routes or other configurations
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.use(express.json());
app.use(router);
// app.use(bodyparser.json());

app.get("/", (req, res) => {
  res.send("Server start");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
