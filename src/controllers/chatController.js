const axios = require("axios");
const LlmApiClient = require("../utils/llmApi");

const llmClient = new LlmApiClient(process.env.LLM_API_URL);

exports.renderChatPage = (req, res) => {
  res.render("chat", {
    title: "Chat with AI",
    user: req.user,
    messages: [],
  });
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(sessionId);
    const response = await llmClient.sendMessage(
      message,
      sessionId || "default"
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error sending message to LLM:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get response from AI" });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.body;
    await llmClient.clearChatHistory(sessionId || "default");
    return res
      .status(200)
      .json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return res.status(500).json({ error: "Failed to clear chat history" });
  }
};

exports.generateFlowchart = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await llmClient.generateFlowchart(
      message,
      sessionId || "default"
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error generating flowchart:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to generate flowchart" });
  }
};
