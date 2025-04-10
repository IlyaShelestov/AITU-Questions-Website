const express = require("express");
const router = express.Router();
const {
  renderAdminPage,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

router.get("/", renderAdminPage);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
