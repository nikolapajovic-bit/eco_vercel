const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  icon: String,
});

module.exports = mongoose.model("Tip", tipSchema);
