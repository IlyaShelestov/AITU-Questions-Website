const express = require("express");
const router = express.Router();
const {
  renderChatPage,
  sendMessage,
} = require("../controllers/chatController");

router.get("/", renderChatPage);
router.post("/send", sendMessage);

module.exports = router;
