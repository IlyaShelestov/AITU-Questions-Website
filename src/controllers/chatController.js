const axios = require("axios");

exports.renderChatPage = (req, res) => {
  res.render("chat", {
    title: "Chat with AI",
    user: req.user,
    messages: [],
  });
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(process.env.LLM_API_URL, {
      message,
      user: `${req.user.name} ${req.user.surname}`,
    });

    if (response.data && response.data.answer) {
      return res.status(200).json({ answer: response.data.answer });
    } else {
      return res.status(500).json({ error: "Invalid response from LLM API" });
    }
  } catch (error) {
    console.error("Error sending message to LLM:", error);
    return res.status(500).json({ error: "Failed to get response from AI" });
  }
};
