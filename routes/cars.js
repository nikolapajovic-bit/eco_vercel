const express = require("express");
const Cars = require("../models/cars");

const router = express.Router();

app.get("/", async (req, res) => {
  try {
    const cars = await Cars.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
