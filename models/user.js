const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    }, // absent for accounts created via Google/Apple only
    provider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    appleId: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    streak: {
      count: { type: Number, default: 0 },
      lastCheckIn: { type: Date },
    },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

userSchema.methods.comparePassword = function (password) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
