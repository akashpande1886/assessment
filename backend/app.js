const express = require("express");
const cors = require("cors");

const db = require("./db/db");
const router = require("./Routes/router");
const PORT = 8000;

const app = express();
app.use(cors());

app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  res.send("Server start");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
