const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  models: [
    {
      name: { type: String, required: true },
      year: { type: String, required: true },
      fuel_type: {
        type: String,
        required: true,
        enum: ["Gasoline", "Diesel", "Hybrid", "Electric"],
      },
      fuel_consumption: {
        type: Number,
        required: function () {
          return ["Gasoline", "Diesel", "Hybrid"].includes(this.fuel_type);
        },
      },
      energy_consumption: {
        type: Number,
        required: function () {
          return this.fuel_type === "Electric";
        },
      },
    },
  ],
});

module.exports = mongoose.model("Cars", carSchema);
