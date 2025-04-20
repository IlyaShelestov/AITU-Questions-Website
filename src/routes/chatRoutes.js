const express = require("express");
const router = express.Router();
const {
  renderChatPage,
  sendMessage,
  clearChatHistory,
  generateFlowchart,
  getFlowchartImage,
} = require("../controllers/chatController");

router.get("/", renderChatPage);
router.post("/send", sendMessage);
router.post("/clear", clearChatHistory);
router.post("/flowchart", generateFlowchart);
router.get("/diagram/:format/:encodedDiagram", getFlowchartImage);

module.exports = router;
