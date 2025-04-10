const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  renderLoginPage,
} = require("../controllers/authController");
const {
  preventLoggedIn,
  verifyToken,
} = require("../middlewares/authMiddleware");

router.get("/login", preventLoggedIn, renderLoginPage);
router.post("/login", preventLoggedIn, login);
router.post("/logout", verifyToken, logout);

module.exports = router;
