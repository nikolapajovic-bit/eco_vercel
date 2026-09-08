const jwt = require("jsonwebtoken");

// NOTE: set a real JWT_SECRET in your environment (Render dashboard ->
// Environment). The fallback here is only for local development.
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken, JWT_SECRET };
