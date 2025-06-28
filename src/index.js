require("./config/environment");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { verifyToken, isAdmin } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const filesRoutes = require("./routes/filesRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userActionsRoutes = require("./routes/userActionsRoutes");
const requestsRoutes = require("./routes/requestsRoutes");

const { metricsMiddleware } = require('./utils/metrics');
const metricsRoutes = require('./routes/metrics');

const app = express();

app.use(metricsMiddleware);

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: [
    "Authorization",
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
  ],
  optionsSuccessStatus: 204,
  maxAge: 600,
};
app.use(cors(corsOptions));

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", "data:"],
//         connectSrc: ["'self'"],
//         frameAncestors: ["'none'"],
//       },
//     },
//     crossOriginOpenerPolicy: { policy: "same-origin" },
//     crossOriginResourcePolicy: { policy: "same-origin" },
//     referrerPolicy: { policy: "strict-origin-when-cross-origin" },
//     hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
//     xFrameOptions: { action: "deny" },
//     xContentTypeOptions: true,
//     xDnsPrefetchControl: { allow: false },
//     permittedCrossDomainPolicies: { policy: "none" },
//     hidePoweredBy: true,
//   })
// );

const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Request limit has been exceeded, please try again later.",
};
app.use("/api", rateLimit(limiterOptions));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/files");
});

app.use("/auth", authRoutes);
app.use("/requests", requestsRoutes);
app.use("/files", verifyToken, filesRoutes);
app.use("/chat", verifyToken, chatRoutes);
app.use("/admin", verifyToken, isAdmin, adminRoutes);
app.use("/admin/actions", verifyToken, isAdmin, userActionsRoutes);
app.use('/metrics', metricsRoutes);

app.use((req, res, next) => {
  res.status(404).render("404");
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
