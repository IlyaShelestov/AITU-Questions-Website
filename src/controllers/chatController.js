const axios = require("axios");
const LlmApiClient = require("../utils/llmApi");
const { getMermaidImageUrl } = require("../utils/krokiClient");
const File = require("../models/File");
const path = require("path");
const UserAction = require("../models/UserAction");

const llmClient = new LlmApiClient(process.env.LLM_API_URL);

exports.renderChatPage = async (req, res) => {
  try {
    let sessionId = req.cookies.chatSessionId;
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 12)}`;
      res.cookie("chatSessionId", sessionId, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    }

    let messages = [];
    try {
      const historyData = await llmClient.getChatHistory(sessionId);
      if (
        historyData &&
        historyData.history &&
        historyData.history.length > 0
      ) {
        messages = historyData.history.map((msg) => ({
          content: msg.content,
          isUser: msg.role === "user",
          timestamp: msg.time || "",
          sources: msg.sources || []
        }));
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }

    res.render("chat", {
      title: "Chat with AI",
      user: req.user,
      messages: messages,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error("Error rendering chat page:", error);
    res.status(500).render("error", {
      message: "Error loading chat page",
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

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
    const { message, sessionId, format = "svg" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await llmClient.generateFlowchart(
      message,
      sessionId || "default"
    );

    if (response.mermaid) {
      response.imageUrl = getMermaidImageUrl(response.mermaid, format);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error generating flowchart:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to generate flowchart" });
  }
};

exports.getFlowchartImage = async (req, res) => {
  try {
    const { encodedDiagram, format = "svg" } = req.params;

    const url = `https://kroki.io/mermaid/${format}/${encodedDiagram}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    res.set("Content-Type", format === "svg" ? "image/svg+xml" : "image/png");
    res.set("Cache-Control", "public, max-age=86400");

    return res.send(response.data);
  } catch (error) {
    console.error("Error fetching diagram:", error);
    return res.status(500).send("Error fetching diagram");
  }
};

exports.downloadSourceFile = async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).render("error", {
        message: "No filename provided",
      });
    }

    const cleanFilename = filename.replace(/^\d+-\d+-/, "");

    const fileByName = await File.findByName(cleanFilename, "staff");

    if (!fileByName) {
      return res.status(404).render("error", {
        message: "File not found",
      });
    }

    const fileInfo = await File.getFileInfo(fileByName.file_id);

    if (!fileInfo || !fileInfo.path) {
      return res.status(404).render("error", {
        message: "File information not found",
      });
    }

    const extension = path.extname(fileInfo.file_name).toLowerCase();
    let contentType = fileInfo.type;

    if (extension === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (extension === ".xlsx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    res.setHeader("Content-Type", contentType);

    await UserAction.create(
      req.user.id,
      req.user.name,
      req.user.surname,
      "download",
      "source_file",
      fileByName.file_id,
      cleanFilename,
      `Source file downloaded from chat. Type: ${fileInfo.type}`
    );

    return res.download(fileInfo.path, cleanFilename, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).render("error", {
            message: "Error downloading file",
          });
        }
      }
    });
  } catch (error) {
    console.error("Error downloading source file:", error);
    return res.status(500).render("error", {
      message: "Error downloading source file",
    });
  }
};
