const express = require("express");
const router = express.Router();
const {
  renderRequestsPage,
  updateRequestStatus,
  receiveRequest,
  answerRequest,
} = require("../controllers/requestsController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, isAdmin, renderRequestsPage);
router.put("/:id/status", verifyToken, isAdmin, updateRequestStatus);
router.post("/:id/answer", verifyToken, isAdmin, answerRequest);

router.post("/api/submit", receiveRequest);

module.exports = router;
