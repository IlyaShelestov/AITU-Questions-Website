const express = require("express");
const router = express.Router();
const {
  renderChatPage,
  sendMessage,
  clearChatHistory,
  generateFlowchart,
} = require("../controllers/chatController");

router.get("/", renderChatPage);
router.post("/send", sendMessage);
router.post("/clear", clearChatHistory);
router.post("/flowchart", generateFlowchart);

module.exports = router;
