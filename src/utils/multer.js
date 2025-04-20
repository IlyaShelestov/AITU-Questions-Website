const multer = require("multer");
const path = require("path");
const fs = require("fs");

const staffDir = process.env.FILES_DIR_STAFF || "files/staff";
const studentsDir = process.env.FILES_DIR_STUDENTS || "files/students";

[staffDir, studentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const allowedExtensions = [".docx", ".xlsx", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, staffDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const originalNameWithoutExt = path.basename(file.originalname, extension);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const encodedName = Buffer.from(originalNameWithoutExt, "ascii").toString();
    cb(null, uniqueSuffix + "-" + encodedName + extension);
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
  staffDir,
  studentsDir,
};
