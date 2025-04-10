const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.renderLoginPage = (req, res) => {
  res.render("login", { title: "Login", error: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("login", {
        title: "Login",
        error: "Email and password are required",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.role,
        name: user.name,
        surname: user.surname,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect("/files");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("login", {
      title: "Login",
      error: "An error occurred during login",
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  return res.redirect("/auth/login");
};
