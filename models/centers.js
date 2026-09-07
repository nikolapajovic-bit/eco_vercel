const mongoose = require("mongoose");

const centerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  material: String,
  latitude: String,
  longitude: String,
  country: String, // added to support filtering by country in the app
});

module.exports = mongoose.model("Center", centerSchema);
