document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("upload-form");
  const uploadMessage = document.getElementById("upload-message");
  const deleteButtons = document.querySelectorAll(".delete-file");
  const fileRows = document.querySelectorAll(".document-row");
  const searchInput = document.getElementById("search-input");
  const filterBtn = document.getElementById("filter-btn");
  const filterDropdown = document.getElementById("filter-dropdown");
  const filterOptions = document.querySelectorAll(".filter-option");
  const similarityInput = document.getElementById("similarity-file-input");
  const similarityButton = document.getElementById("check-similarity-btn");
  const similarityResult = document.getElementById("similarity-result");

  let currentFilter = "all";

  // Filter dropdown functionality
  if (filterBtn && filterDropdown) {
    filterBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      filterDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function () {
      filterDropdown.classList.remove("show");
    });

    filterOptions.forEach((option) => {
      option.addEventListener("click", function () {
        // Remove active class from all options
        filterOptions.forEach((opt) => opt.classList.remove("active"));
        // Add active class to clicked option
        this.classList.add("active");

        currentFilter = this.dataset.filter;
        filterBtn.querySelector("span").textContent = this.textContent;
        filterDropdown.classList.remove("show");

        applyFilters();
      });
    });
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    fileRows.forEach((row) => {
      const fileName = row
        .querySelector(".document-name")
        .textContent.toLowerCase();
      const fileType = row.dataset.type;
      const audience = row.dataset.audience;

      const matchesSearch = fileName.includes(searchTerm);
      const matchesFilter =
        currentFilter === "all" ||
        fileType === currentFilter ||
        audience === currentFilter;

      row.style.display = matchesSearch && matchesFilter ? "" : "none";
    });
  }

  // File row click to download
  fileRows.forEach((row) => {
    row.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-file")) {
        return;
      }

      const fileId = this.getAttribute("data-file-id");
      window.location.href = `/files/download/${fileId}`;
    });
  });

  // Upload form
  if (uploadForm) {
    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      showUploadMessage("Загрузка файла...", "info");

      try {
        const response = await fetch("/files/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          showUploadMessage(result.message, "success");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showUploadMessage(`Ошибка: ${result.error}`, "error");
        }
      } catch (error) {
        console.error("Upload error:", error);
        showUploadMessage(
          "Ошибка загрузки файла. Попробуйте еще раз.",
          "error"
        );
      }
    });
  }

  function showUploadMessage(message, type) {
    if (uploadMessage) {
      uploadMessage.textContent = message;
      uploadMessage.className = `upload-message ${type}`;
      uploadMessage.style.display = "block";

      if (type !== "info") {
        setTimeout(() => {
          uploadMessage.style.display = "none";
        }, 5000);
      }
    }
  }

  // Delete functionality
  if (deleteButtons) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async function (e) {
        e.stopPropagation();

        if (!confirm("Вы уверены, что хотите удалить этот файл?")) {
          return;
        }

        const fileId = this.getAttribute("data-id");

        try {
          const response = await fetch(`/files/delete/${fileId}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (response.ok) {
            window.location.reload();
          } else {
            alert(`Ошибка: ${result.error}`);
          }
        } catch (error) {
          console.error("Delete error:", error);
          alert("Ошибка удаления файла. Попробуйте еще раз.");
        }
      });
    });
  }

  // Similarity check
  if (similarityButton && similarityInput) {
    similarityButton.addEventListener("click", async function () {
      const file = similarityInput.files[0];
      if (!file) {
        showSimilarityResult("Пожалуйста, выберите файл.", "error");
        return;
      }

      const fileName = file.name.toLowerCase();
      if (
        !fileName.endsWith(".docx") &&
        !fileName.endsWith(".xlsx") &&
        !fileName.endsWith(".pdf")
      ) {
        showSimilarityResult(
          "Разрешены только файлы .docx, .xlsx и .pdf.",
          "error"
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      showSimilarityResult("Проверка схожести...", "info");

      try {
        const response = await fetch("/files/check-similarity", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          if (result.similar_files && result.similar_files.length > 0) {
            let html = "<strong>Найдены схожие файлы:</strong><ul>";
            result.similar_files.forEach((file) => {
              html += `<li>${file.filename} (схожесть: ${(
                file.similarity * 100
              ).toFixed(1)}%)</li>`;
            });
            html += "</ul>";
            showSimilarityResult(html, "success");
          } else {
            showSimilarityResult("Схожие файлы не найдены.", "success");
          }
        } else {
          showSimilarityResult(`Ошибка: ${result.error}`, "error");
        }
      } catch (error) {
        console.error("Similarity check error:", error);
        showSimilarityResult("Ошибка проверки схожести.", "error");
      }
    });
  }

  function showSimilarityResult(message, type) {
    if (similarityResult) {
      similarityResult.innerHTML = message;
      similarityResult.style.display = "block";

      // Remove existing type classes
      similarityResult.classList.remove("success", "error", "info");

      if (type === "error") {
        similarityResult.style.borderLeftColor = "#f44336";
        similarityResult.style.backgroundColor = "#ffebee";
      } else if (type === "success") {
        similarityResult.style.borderLeftColor = "#4caf50";
        similarityResult.style.backgroundColor = "#e8f5e9";
      } else {
        similarityResult.style.borderLeftColor = "var(--primary-blue)";
        similarityResult.style.backgroundColor = "#f1f3f4";
      }
    }
  }
});
