document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("upload-form");
  const uploadMessage = document.getElementById("upload-message");
  const deleteButtons = document.querySelectorAll(".delete-file");

  if (uploadForm) {
    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      try {
        uploadMessage.innerHTML = "<p>Uploading file...</p>";
        uploadMessage.className = "";

        const response = await fetch("/files/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          uploadMessage.innerHTML = `<p>${result.message}</p>`;
          uploadMessage.className = "success-message";
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          uploadMessage.innerHTML = `<p>Error: ${result.error}</p>`;
          uploadMessage.className = "error-message";
        }
      } catch (error) {
        console.error("Upload error:", error);
        uploadMessage.innerHTML =
          "<p>Error uploading file. Please try again.</p>";
        uploadMessage.className = "error-message";
      }
    });
  }

  if (deleteButtons) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        const fileId = this.getAttribute("data-id");

        if (confirm("Are you sure you want to delete this file?")) {
          try {
            const response = await fetch(`/files/${fileId}`, {
              method: "DELETE",
            });

            const result = await response.json();

            if (response.ok) {
              const fileRow = document.querySelector(
                `tr[data-file-id="${fileId}"]`
              );
              if (fileRow) {
                fileRow.remove();
              }

              const messageDiv = document.createElement("div");
              messageDiv.className = "success-message";
              messageDiv.textContent = result.message;
              document.querySelector(".files-section").prepend(messageDiv);

              setTimeout(() => {
                messageDiv.remove();
              }, 3000);
            } else {
              alert(`Error: ${result.error}`);
            }
          } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting file. Please try again.");
          }
        }
      });
    });
  }
});
