const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const appleSignin = require("apple-signin-auth");
const User = require("../models/user");
const { signToken } = require("../utils/jwt");
const requireAuth = require("../middleware/auth");

// NOTE: set GOOGLE_CLIENT_ID and APPLE_CLIENT_ID (your app's bundle ID /
// Services ID) as environment variables once you've created them.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    streak: user.streak,
  };
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Email + password ──

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const user = new User({ name, email, provider: "local" });
    await user.setPassword(password);
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── Google sign-in ── body: { idToken }
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email: payload.email });
      if (user) {
        user.googleId = payload.sub;
      } else {
        user = new User({
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          avatarUrl: payload.picture,
          provider: "google",
        });
      }
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Google sign-in error:", err);
    res.status(401).json({ error: "Google sign-in failed" });
  }
});

// ── Apple sign-in ── body: { identityToken, fullName? }
router.post("/apple", async (req, res) => {
  try {
    const { identityToken, fullName } = req.body;
    const applePayload = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
    });

    let user = await User.findOne({ appleId: applePayload.sub });
    if (!user) {
      user = await User.findOne({ email: applePayload.email });
      if (user) {
        user.appleId = applePayload.sub;
      } else {
        // Apple only sends the user's name on the very first sign-in
        user = new User({
          name: fullName || "Apple User",
          email: applePayload.email,
          appleId: applePayload.sub,
          provider: "apple",
        });
      }
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Apple sign-in error:", err);
    res.status(401).json({ error: "Apple sign-in failed" });
  }
});

// ── Profile ──
router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ── Streak check-in ──
router.post("/streak/checkin", requireAuth, async (req, res) => {
  const user = req.user;
  const today = startOfDay(new Date());
  const last = user.streak.lastCheckIn
    ? startOfDay(user.streak.lastCheckIn)
    : null;

  if (!last) {
    user.streak.count = 1;
  } else {
    const diffDays = Math.round((today - last) / 86400000);
    if (diffDays === 0) {
      // already checked in today — no change
    } else if (diffDays === 1) {
      user.streak.count += 1;
    } else {
      user.streak.count = 1; // streak broken, restart
    }
  }

  user.streak.lastCheckIn = new Date();
  await user.save();
  res.json({ streak: user.streak });
});

module.exports = router;
