const express = require("express");
const router = express.Router();
const { upload } = require("../utils/multer");
const {
  renderChatPage,
  sendMessage,
  clearChatHistory,
  generateFlowchart,
  getFlowchartImage,
  downloadSourceFile,
  analyzeDoc,
  generateFile,
} = require("../controllers/chatController");

router.get("/", renderChatPage);
router.post("/send", sendMessage);
router.post("/clear", clearChatHistory);
router.post("/flowchart", generateFlowchart);
router.get("/diagram/:format/:encodedDiagram", getFlowchartImage);
router.get("/download-source", downloadSourceFile);
router.post("/analyze-doc", upload.single("file"), analyzeDoc);
router.post("/generate", express.json(), generateFile);

module.exports = router;
