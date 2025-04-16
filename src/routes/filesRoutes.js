const express = require("express");
const router = express.Router();
const {
  renderFilesPage,
  uploadFile,
  deleteFile,
  downloadFile,
} = require("../controllers/filesController");
const { upload } = require("../utils/multer");
const { isManager } = require("../middlewares/authMiddleware");

router.get("/", renderFilesPage);
router.post("/upload", isManager, upload.single("file"), uploadFile);
router.delete("/:id", isManager, deleteFile);
router.get("/download/:id", downloadFile);

module.exports = router;
