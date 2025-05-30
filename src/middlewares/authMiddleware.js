const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).redirect("/auth/login");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).redirect("/auth/login");
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

exports.isManager = (req, res, next) => {
  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

exports.preventLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({ message: "Already logged in" });
    } catch (err) {
      next();
    }
  } else {
    next();
  }
};
