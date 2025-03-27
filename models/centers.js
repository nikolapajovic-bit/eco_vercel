const mongoose = require("mongoose");

const centerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  material: String,
  latitude: String,
  longitude: String,
});

module.exports = mongoose.model("Center", centerSchema);
