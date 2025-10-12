const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/mystery-box", (req, res) => {
  res.sendFile(path.join(__dirname, "mystery-box.html"));
});

app.get("/energy-grid", (req, res) => {
  res.sendFile(path.join(__dirname, "energy-grid.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
