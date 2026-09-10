const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String }, // absent for accounts created via Google/Apple only
    provider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    googleId: { type: String },
    appleId: { type: String },
    avatarUrl: { type: String },
    streak: {
      count: { type: Number, default: 0 },
      lastCheckIn: { type: Date },
    },
    // Subscription: "trial" is the default state for every new account —
    // access is computed from createdAt + 7 days until this becomes
    // "active" via a real purchase. subscriptionExpiresAt is only set once
    // a real (or, for now, simulated) subscription starts.
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "expired", "canceled"],
      default: "trial",
    },
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },
    subscriptionExpiresAt: { type: Date },
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
