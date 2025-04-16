const express = require("express");
const router = express.Router();
const {
  renderUserActionsPage,
} = require("../controllers/userActionsController");

router.get("/", renderUserActionsPage);

module.exports = router;
