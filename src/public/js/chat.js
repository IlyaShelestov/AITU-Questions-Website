document.addEventListener("DOMContentLoaded", function () {
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const messagesContainer = document.getElementById("messages");
  const chatBox = document.getElementById("chat-box");
  const mermaidScript = document.createElement("script");
  mermaidScript.src =
    "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
  document.head.appendChild(mermaidScript);

  mermaidScript.onload = function () {
    mermaid.initialize({ startOnLoad: true });
  };

  let sessionId;
  const serverSessionId = chatBox.dataset.sessionId;

  if (serverSessionId) {
    sessionId = serverSessionId;
    localStorage.setItem("chatSessionId", sessionId);
  } else {
    sessionId = localStorage.getItem("chatSessionId");
    if (!sessionId) {
      sessionId =
        "session_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 12);
      localStorage.setItem("chatSessionId", sessionId);
    }
  }

  function addMessage(content, isUser = true) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user" : "ai"}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    if (!isUser && typeof content === "object" && content.mermaid) {
      if (content.imageUrl) {
        const imgElement = document.createElement("img");
        imgElement.src = content.imageUrl;
        imgElement.className = "mermaid-image";
        imgElement.alt = "Flowchart";

        const downloadLink = document.createElement("a");
        downloadLink.href = content.imageUrl;
        downloadLink.className = "download-link";
        downloadLink.textContent = "Download Diagram";
        downloadLink.download = "flowchart.svg";

        contentDiv.appendChild(imgElement);
        contentDiv.appendChild(downloadLink);
      } else {
        const mermaidDiv = document.createElement("div");
        mermaidDiv.className = "mermaid";
        mermaidDiv.textContent = content.mermaid;
        contentDiv.appendChild(mermaidDiv);

        setTimeout(() => {
          mermaid.init(undefined, ".mermaid");
        }, 100);
      }

      if (content.sources && content.sources.length > 0) {
        const sourcesDiv = document.createElement("div");
        sourcesDiv.className = "sources";
        sourcesDiv.innerHTML =
          "<strong>Sources:</strong><br>" +
          content.sources.map((source) => `- ${source}`).join("<br>");
        contentDiv.appendChild(sourcesDiv);
      }
    } else {
      contentDiv.textContent = content;
    }

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    const now = new Date();
    timeDiv.textContent = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    messagesContainer.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  if (chatForm) {
    chatForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const message = messageInput.value.trim();
      if (!message) return;

      addMessage(message, true);

      messageInput.value = "";

      try {
        if (message.startsWith("/flowchart ")) {
          const flowchartQuery = message.substring("/flowchart ".length);

          const loadingMessage = document.createElement("div");
          loadingMessage.className = "message ai";
          loadingMessage.innerHTML =
            "<div class='message-content'>Generating flowchart...</div>";
          messagesContainer.appendChild(loadingMessage);
          chatBox.scrollTop = chatBox.scrollHeight;

          const response = await fetch("/chat/flowchart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: flowchartQuery,
              sessionId,
              format: "svg",
            }),
          });

          const result = await response.json();

          messagesContainer.removeChild(loadingMessage);

          if (response.ok && result.mermaid) {
            addMessage(result, false);
          } else {
            addMessage(
              "Sorry, I encountered an error generating the flowchart.",
              false
            );
            console.error("API error:", result.error);
          }
        } else {
          const response = await fetch("/chat/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              sessionId,
            }),
          });

          const result = await response.json();

          if (response.ok && result.answer) {
            addMessage(result.answer, false);
          } else {
            addMessage(
              "Sorry, I encountered an error processing your request.",
              false
            );
            console.error("API error:", result.error);
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        addMessage(
          "Sorry, I encountered an error processing your request.",
          false
        );
      }
    });
  }

  const clearButton = document.getElementById("clear-chat");
  if (clearButton) {
    clearButton.addEventListener("click", async () => {
      try {
        await fetch("/chat/clear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });
        messagesContainer.innerHTML = "";
      } catch (error) {
        console.error("Error clearing chat history:", error);
      }
    });
  }
});
