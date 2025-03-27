const express = require("express");
const Center = require("../models/centers");

const router = express.Router();

app.get("/", async (req, res) => {
  try {
    const centers = await Center.find();
    res.json(centers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
