const Request = require("../models/Request");
const axios = require("axios");

exports.renderRequestsPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    const requests = await Request.findAll(limit, offset, status);
    const totalCount = await Request.countAll(status);
    const totalPages = Math.ceil(totalCount / limit);

    res.render("requests", {
      title: "Student Requests",
      user: req.user,
      requests,
      currentStatus: status,
      pagination: {
        current: page,
        total: totalPages,
        prev: page > 1 ? page - 1 : null,
        next: page < totalPages ? page + 1 : null,
      },
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).render("error", {
      message: "Error loading requests page",
    });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "in_progress", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await Request.updateStatus(id, status);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (status === "in_progress") {
      try {
        await axios.post(`${process.env.BOT_API_URL}/notify`, {
          telegramId: request.telegram_id,
          message: `Your request #${id} is now in progress. A staff member is working on it.`,
        });
      } catch (notifyError) {
        console.error("Error notifying student:", notifyError);
      }
    }

    res.status(200).json({
      message: "Request status updated successfully",
      request,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

exports.receiveRequest = async (req, res) => {
  try {
    const { telegramId, userName, message } = req.body;

    if (!telegramId || !userName || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = null;
    const request = await Request.create(userId, userName, telegramId, message);

    res.status(201).json({
      message: "Request received successfully",
      requestId: request.request_id,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
};

exports.answerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { telegramId, answer } = req.body;

    if (!telegramId || !answer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    try {
      await axios.post(`${process.env.BOT_API_URL}/send-answer`, {
        telegramId,
        message: `(Request #${id}) ` + answer,
      });
    } catch (botError) {
      console.error("Error sending answer to Telegram bot:", botError);
      return res
        .status(500)
        .json({ error: "Failed to send answer to Telegram bot" });
    }

    res.status(200).json({
      message: "Answer sent successfully",
    });
  } catch (error) {
    console.error("Error answering request:", error);
    res.status(500).json({ error: "Failed to answer request" });
  }
};
