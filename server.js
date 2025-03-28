const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const tipRoutes = require("./routes/tips");
const Tip = require("./models/tips");
const Center = require("./models/centers");
const Cars = require("./models/cars");

const PORT = process.env.PORT || 8080;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecoliving";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

app.get("/", (req, res) => {
  res.send("EcoLiving API is running...");
});

app.get("/api/tips", async (req, res) => {
  try {
    const tips = await Tip.find();
    res.json(tips);
  } catch (error) {
    res.status(500).send("Error fetching tips");
  }
});

app.get("/api/centers", async (req, res) => {
  try {
    const centers = await Center.find();
    res.json(centers);
  } catch (error) {
    res.status(500).send("Error fetching centers");
  }
});

app.get("/api/cars", async (req, res) => {
  try {
    const cars = await Cars.find();
    res.json(cars);
  } catch (error) {
    res.status(500).send("Error fetching cars");
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
