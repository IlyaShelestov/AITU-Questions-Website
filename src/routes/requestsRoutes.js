const express = require("express");
const router = express.Router();
const {
  renderRequestsPage,
  updateRequestStatus,
  receiveRequest,
  answerRequest,
} = require("../controllers/requestsController");
const { verifyToken, isManager } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, isManager, renderRequestsPage);
router.put("/:id/status", verifyToken, isManager, updateRequestStatus);
router.post("/:id/answer", verifyToken, isManager, answerRequest);

router.post("/api/submit", receiveRequest);

module.exports = router;
