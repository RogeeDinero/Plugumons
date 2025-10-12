const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/mystery-box", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mystery-box.html"));
});

app.get("/energy-grid", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "energy-grid.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
