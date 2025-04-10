const express = require("express");
const router = express.Router();
const {
  renderFilesPage,
  uploadFile,
  deleteFile,
} = require("../controllers/filesController");
const { upload } = require("../utils/multer");

router.get("/", renderFilesPage);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);

module.exports = router;
