document.addEventListener("DOMContentLoaded", function () {
  const addUserForm = document.getElementById("add-user-form");
  const editUserForm = document.getElementById("edit-user-form");
  const editButtons = document.querySelectorAll(".edit-user");
  const deleteButtons = document.querySelectorAll(".delete-user");
  const statusMessage = document.getElementById("status-message");
  const modal = document.getElementById("edit-user-modal");
  const closeModal = document.querySelector(".close");

  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = isError ? "error-message" : "success-message";

    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
    }, 5000);
  }

  if (addUserForm) {
    addUserForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const userData = {
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
        surname: formData.get("surname"),
        role: formData.get("role"),
      };

      try {
        const response = await fetch("/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
          showStatus(result.message);
          this.reset();

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showStatus(result.error, true);
        }
      } catch (error) {
        console.error("Error creating user:", error);
        showStatus("Error creating user. Please try again.", true);
      }
    });
  }

  if (editButtons) {
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.getAttribute("data-id");
        const userRow = document.querySelector(`tr[data-user-id="${userId}"]`);

        document.getElementById("edit-user-id").value = userId;
        document.getElementById("edit-email").value =
          userRow.cells[1].textContent;

        const fullName = userRow.cells[2].textContent.trim().split(" ");
        document.getElementById("edit-name").value = fullName[0] || "";
        document.getElementById("edit-surname").value = fullName[1] || "";

        document.getElementById("edit-role").value =
          userRow.cells[3].textContent;

        document.getElementById("edit-password").value = "";

        modal.style.display = "block";
      });
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  if (editUserForm) {
    editUserForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const userId = document.getElementById("edit-user-id").value;
      const formData = new FormData(this);

      const userData = {};
      if (formData.get("email")) userData.email = formData.get("email");
      if (formData.get("name")) userData.name = formData.get("name");
      if (formData.get("surname")) userData.surname = formData.get("surname");
      if (formData.get("password"))
        userData.password = formData.get("password");
      if (formData.get("role")) userData.role = formData.get("role");

      try {
        const response = await fetch(`/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
          modal.style.display = "none";

          showStatus(result.message);

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showStatus(result.error, true);
        }
      } catch (error) {
        console.error("Error updating user:", error);
        showStatus("Error updating user. Please try again.", true);
      }
    });
  }

  if (deleteButtons) {
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async function () {
        const userId = this.getAttribute("data-id");

        if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
          try {
            const response = await fetch(`/admin/users/${userId}`, {
              method: "DELETE",
            });

            const result = await response.json();

            if (response.ok) {
              const userRow = document.querySelector(
                `tr[data-user-id="${userId}"]`
              );
              if (userRow) {
                userRow.remove();
              }

              showStatus(result.message);
            } else {
              showStatus(result.error, true);
            }
          } catch (error) {
            console.error("Error deleting user:", error);
            showStatus("Ошибка при удалении пользователя. Пожалуйста, попробуйте еще раз.", true);
          }
        }
      });
    });
  }
});
