const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = process.env.FILES_DIR || "files";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = [".docx", ".xlsx", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const originalNameWithoutExt = path.basename(file.originalname, extension);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueSuffix + "-" + originalNameWithoutExt + extension);
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
