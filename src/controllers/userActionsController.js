const UserAction = require("../models/UserAction");
const User = require("../models/User");

exports.renderUserActionsPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.actionType) filters.actionType = req.query.actionType;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.resourceType) filters.resourceType = req.query.resourceType;
    if (req.query.startDate && req.query.endDate) {
      filters.startDate = req.query.startDate;
      filters.endDate = req.query.endDate;
    }

    const actions = await UserAction.findAll(limit, offset, filters);
    const totalLogs = await UserAction.countAll(filters);
    const totalPages = Math.ceil(totalLogs / limit);

    const users = await User.findAll();

    const actionTypes = ["upload", "download", "delete", "replace"];

    res.render("userActions", {
      title: "User Actions Panel",
      user: req.user,
      actions,
      users,
      actionTypes,
      filters: req.query,
      pagination: {
        current: page,
        total: totalPages,
        prev: page > 1 ? page - 1 : null,
        next: page < totalPages ? page + 1 : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user actions:", error);
    res.status(500).render("error", {
      message: "Error loading user actions panel",
    });
  }
};
