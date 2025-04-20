document.addEventListener("DOMContentLoaded", function () {
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const messagesContainer = document.getElementById("messages");
  const chatBox = document.getElementById("chat-box");

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
        const imgContainer = document.createElement("div");
        imgContainer.className = "mermaid-image-container";

        const imgElement = document.createElement("img");
        imgElement.src = content.imageUrl;
        imgElement.className = "mermaid-image";
        imgElement.alt = "Flowchart";

        imgElement.onload = function () {
          console.log("Flowchart image loaded successfully");
        };
        imgElement.onerror = function (e) {
          console.error("Error loading flowchart image:", e);
          const errorMsg = document.createElement("p");
          errorMsg.textContent =
            "Flowchart image could not be displayed. Please use the download link.";
          errorMsg.className = "image-error-message";
          imgContainer.appendChild(errorMsg);
        };

        const downloadLink = document.createElement("a");
        downloadLink.href = content.imageUrl;
        downloadLink.className = "download-link";
        downloadLink.textContent = "Download Diagram";
        downloadLink.download = "flowchart.svg";
        downloadLink.target = "_blank";

        imgContainer.appendChild(imgElement);
        contentDiv.appendChild(imgContainer);
        contentDiv.appendChild(downloadLink);
      }
    } else {
      if (isUser) {
        contentDiv.textContent = content;
      } else {
        const trimmedContent =
          typeof content.answer === "string"
            ? content.answer.replace(/^\s+/, "")
            : content.answer;
        const parsedMarkdown = marked.parse(trimmedContent);
        contentDiv.innerHTML = DOMPurify.sanitize(parsedMarkdown);
      }
    }

    if (content.sources && content.sources.length > 0) {
      const sourcesDiv = document.createElement("div");
      sourcesDiv.className = "sources";
      sourcesDiv.innerHTML = "<strong>Sources:</strong><br>";

      const sourcesList = document.createElement("ul");
      sourcesList.className = "sources-list";

      content.sources.forEach((source) => {
        const sourceItem = document.createElement("li");
        const sourceLink = document.createElement("a");
        sourceLink.href = `/chat/download-source?filename=${encodeURIComponent(
          source
        )}`;
        sourceLink.textContent = source;
        sourceLink.className = "source-download-link";

        sourceItem.appendChild(sourceLink);
        sourcesList.appendChild(sourceItem);
      });

      sourcesDiv.appendChild(sourcesList);
      contentDiv.appendChild(sourcesDiv);
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
          const loadingMessage = document.createElement("div");
          loadingMessage.className = "message ai";
          loadingMessage.innerHTML =
            "<div class='message-content'>Searching for the answer...</div>";
          messagesContainer.appendChild(loadingMessage);
          chatBox.scrollTop = chatBox.scrollHeight;

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

          messagesContainer.removeChild(loadingMessage);

          if (response.ok && result.answer) {
            addMessage(result, false);
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

        try {
          const loadingMessages = document.querySelectorAll(".message.ai");
          for (const msg of loadingMessages) {
            if (
              msg.textContent.includes("Searching for an answer") ||
              msg.textContent.includes("Generating flowchart")
            ) {
              messagesContainer.removeChild(msg);
            }
          }
        } catch (e) {
          console.error("Error removing loading message:", e);
        }

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

  document
    .querySelectorAll('.message-content[data-is-user="false"]')
    .forEach((content) => {
      const rawContent = content.textContent;
      const trimmedContent = rawContent.replace(/^\s+/, "");
      const parsedMarkdown = marked.parse(trimmedContent);
      content.innerHTML = DOMPurify.sanitize(parsedMarkdown);
    });
});
