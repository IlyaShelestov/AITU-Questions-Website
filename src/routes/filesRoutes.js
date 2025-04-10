const express = require("express");
const router = express.Router();
const {
  renderFilesPage,
  uploadFile,
  deleteFile,
  downloadFile,
} = require("../controllers/filesController");
const { upload } = require("../utils/multer");

router.get("/", renderFilesPage);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);
router.get("/download/:id", downloadFile);

module.exports = router;
