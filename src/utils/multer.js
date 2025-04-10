const multer = require("multer");
const path = require("path");

const allowedExtensions = [".docx", ".xlsx", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILES_DIR || "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error("Only .docx, .xlsx, and .pdf files are allowed."),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = {
  upload,
};
