const express = require("express");
const Tip = require("../models/tips");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tips = await Tip.find();
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
