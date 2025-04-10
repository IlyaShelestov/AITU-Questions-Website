document.addEventListener("DOMContentLoaded", function () {
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const messagesContainer = document.getElementById("messages");
  const chatBox = document.getElementById("chat-box");

  function addMessage(content, isUser = true) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user" : "ai"}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = content;

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    const now = new Date();
    timeDiv.textContent = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

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
        const response = await fetch("/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
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
      } catch (error) {
        console.error("Chat error:", error);
        addMessage(
          "Sorry, I encountered an error processing your request.",
          false
        );
      }
    });
  }
});
