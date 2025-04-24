const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  renderFilesPage,
  uploadFile,
  deleteFile,
  downloadFile,
  checkFileSimilarity,
} = require("../controllers/filesController");
const { upload } = require("../utils/multer");
const { isManager } = require("../middlewares/authMiddleware");

const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

router.get("/", renderFilesPage);
router.post("/upload", isManager, upload.single("file"), uploadFile);
router.delete("/:id", isManager, deleteFile);
router.get("/download/:id", downloadFile);
router.post(
  "/check-similarity",
  isManager,
  uploadMemory.single("file"),
  checkFileSimilarity
);

module.exports = router;
