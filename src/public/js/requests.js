document.addEventListener("DOMContentLoaded", function () {
  const statusButtons = document.querySelectorAll(".update-status");
  const answerButtons = document.querySelectorAll(".answer-request");
  const answerModal = document.getElementById("answer-modal");
  const closeButtons = document.querySelectorAll('[data-dismiss="modal"]');
  const sendAnswerButton = document.getElementById("send-answer");

  statusButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const requestId = this.closest("tr").dataset.requestId;
      const newStatus = this.dataset.status;
      const row = this.closest("tr");
      const telegramId = row.querySelector(".answer-request")?.dataset.telegram;
      const userName =
        row.querySelector(".answer-request")?.dataset.username || "Student";

      try {
        if (newStatus === "rejected" || newStatus === "completed") {
          const messageText =
            newStatus === "rejected"
              ? `We're sorry, but we cannot process your request at this time.`
              : `Your request has been completed successfully!`;
          console.log(newStatus, messageText);
          if (telegramId) {
            const messageResponse = await fetch(
              `/requests/${requestId}/answer`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  telegramId,
                  answer: messageText,
                }),
              }
            );

            if (!messageResponse.ok) {
              console.error("Failed to send automated message");
            }
          }
        }

        const response = await fetch(`/requests/${requestId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();

        if (response.ok) {
          window.location.reload();
        } else {
          alert(result.error || "Failed to update request status");
        }
      } catch (error) {
        console.error("Error updating request status:", error);
        alert("An error occurred while updating the request status.");
      }
    });
  });

  answerButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const requestId = this.dataset.id;
      const telegramId = this.dataset.telegram;
      const userName = this.dataset.username;

      document.getElementById("request-id").value = requestId;
      document.getElementById("telegram-id").value = telegramId;
      document.getElementById("student-name").value = userName;
      document.getElementById("answer-text").value = "";

      answerModal.style.display = "block";
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      answerModal.style.display = "none";
    });
  });

  window.addEventListener("click", function (e) {
    if (e.target === answerModal) {
      answerModal.style.display = "none";
    }
  });

  sendAnswerButton.addEventListener("click", async function () {
    const requestId = document.getElementById("request-id").value;
    const telegramId = document.getElementById("telegram-id").value;
    const answerText = document.getElementById("answer-text").value;

    if (!answerText.trim()) {
      alert("Please enter an answer");
      return;
    }

    try {
      const response = await fetch(`/requests/${requestId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId,
          answer: answerText,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        answerModal.style.display = "none";
        const statusResponse = await fetch(`/requests/${requestId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "completed" }),
        });

        if (statusResponse.ok) {
          window.location.reload();
        }
      } else {
        alert(result.error || "Failed to send answer");
      }
    } catch (error) {
      console.error("Error sending answer:", error);
      alert("An error occurred while sending the answer.");
    }
  });
});
