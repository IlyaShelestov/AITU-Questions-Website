const express = require("express");
const router = express.Router();
const {
  renderChatPage,
  sendMessage,
  clearChatHistory,
  generateFlowchart,
  getFlowchartImage,
  downloadSourceFile,
} = require("../controllers/chatController");

router.get("/", renderChatPage);
router.post("/send", sendMessage);
router.post("/clear", clearChatHistory);
router.post("/flowchart", generateFlowchart);
router.get("/diagram/:format/:encodedDiagram", getFlowchartImage);
router.get("/download-source", downloadSourceFile);

module.exports = router;
