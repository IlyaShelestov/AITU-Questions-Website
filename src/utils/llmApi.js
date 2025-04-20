const axios = require("axios");

class LlmApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || process.env.LLM_API_URL;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async sendMessage(message, sessionId = "default") {
    try {
      const endpoint = "/api/teacher/chat";

      const payload = {
        query: message,
        session_id: sessionId,
      };

      const response = await this.axios.post(endpoint, payload);

      let sources = [];
      if (response.data.sources && response.data.sources.length > 0) {
        sources = response.data.sources.map((source) => {
          const cleanName = source.replace(/^\d+-\d+-/, "");
          return cleanName;
        });
      }

      return {
        answer: response.data.answer,
        sources: sources,
      };
    } catch (error) {
      console.error("Error communicating with LLM API:", error);

      if (error.response) {
        console.error("LLM API response error:", error.response.data);
        throw new Error(
          error.response.data.detail || "Invalid response from LLM API"
        );
      } else if (error.request) {
        throw new Error(
          "No response received from LLM API. Service might be down."
        );
      } else {
        throw new Error(
          "Error setting up request to LLM API: " + error.message
        );
      }
    }
  }

  async clearChatHistory(sessionId = "default") {
    try {
      const response = await this.axios.get(
        `/api/teacher/chat/clear?session_id=${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error clearing chat history:", error);
      throw new Error("Failed to clear chat history");
    }
  }

  async getChatHistory(sessionId = "default") {
    try {
      const response = await this.axios.get(
        `/api/teacher/chat/history?session_id=${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw new Error("Failed to fetch chat history");
    }
  }

  async generateFlowchart(query, sessionId = "default") {
    try {
      const response = await this.axios.post("/api/teacher/flowchart", {
        query,
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating flowchart:", error);
      throw new Error("Failed to generate flowchart");
    }
  }
}

module.exports = LlmApiClient;
