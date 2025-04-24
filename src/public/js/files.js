document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("upload-form");
  const uploadMessage = document.getElementById("upload-message");
  const deleteButtons = document.querySelectorAll(".delete-file");
  const fileRows = document.querySelectorAll(".file-row");
  const filterType = document.getElementById("filter-type");
  const filterAudience = document.getElementById("filter-audience");
  const filterUploader = document.getElementById("filter-uploader");
  const similarityInput = document.getElementById("similarity-file-input");
  const similarityButton = document.getElementById("check-similarity-btn");
  const similarityResult = document.getElementById("similarity-result");

  function applyFilters() {
    const typeFilter = filterType.value;
    const audienceFilter = filterAudience.value;
    const uploaderFilter = filterUploader.value;

    document.querySelectorAll("#files-table tbody tr").forEach((row) => {
      const rowType = row.getAttribute("data-type");
      const rowAudience = row.getAttribute("data-audience");
      const rowUploader = row.getAttribute("data-uploader");

      const typeMatch = typeFilter === "all" || rowType === typeFilter;
      const audienceMatch =
        audienceFilter === "all" || rowAudience === audienceFilter;
      const uploaderMatch =
        uploaderFilter === "all" || rowUploader === uploaderFilter;

      if (typeMatch && audienceMatch && uploaderMatch) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  if (filterType) {
    filterType.addEventListener("change", applyFilters);
  }

  if (filterAudience) {
    filterAudience.addEventListener("change", applyFilters);
  }

  if (filterUploader) {
    filterUploader.addEventListener("change", applyFilters);
  }

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
      button.addEventListener("click", async function (e) {
        e.stopPropagation();
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

  if (fileRows) {
    fileRows.forEach((row) => {
      row.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-file")) {
          return;
        }

        const fileId = this.getAttribute("data-file-id");
        window.location.href = `/files/download/${fileId}`;
      });
    });
  }

  if (similarityButton && similarityInput) {
    similarityButton.addEventListener("click", async function () {
      const file = similarityInput.files[0];
      if (!file) {
        similarityResult.innerHTML = "<p>Please select a file.</p>";
        return;
      }

      const fileName = file.name.toLowerCase();
      if (
        !fileName.endsWith(".docx") &&
        !fileName.endsWith(".xlsx") &&
        !fileName.endsWith(".pdf")
      ) {
        similarityResult.innerHTML =
          "<p>Only .docx, .xlsx, and .pdf files are allowed.</p>";
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      similarityResult.innerHTML = "<p>Checking similarity...</p>";

      try {
        const response = await fetch("/files/check-similarity", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (response.ok && result.possible_duplicates) {
          if (result.possible_duplicates.length === 0) {
            similarityResult.innerHTML = "<p>No similar files found.</p>";
          } else {
            similarityResult.innerHTML =
              "<div class='similarity-results'><strong>Possible duplicates:</strong><ul>" +
              result.possible_duplicates
                .map(
                  (dup) =>
                    `<li>${dup.file} - Similarity: ${dup.similarity}%</li>`
                )
                .join("") +
              "</ul></div>";
          }
        } else {
          similarityResult.innerHTML = `<p class="error-message">Error: ${
            result.error || "Failed to check similarity"
          }</p>`;
        }
      } catch (error) {
        similarityResult.innerHTML =
          "<p class='error-message'>Error checking similarity. Please try again.</p>";
      }
    });
  }
});
