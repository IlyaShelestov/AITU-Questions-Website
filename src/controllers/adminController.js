const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.renderAdminPage = async (req, res) => {
  try {
    const users = await User.findAll();

    res.render("admin", {
      title: "Admin Dashboard",
      user: req.user,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).render("error", {
      message: "Error loading admin page",
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, surname, role } = req.body;

    if (!email || !password || !name || !surname) {
      return res.status(400).json({
        error: "Email, password, name, and surname are required",
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(
      email,
      hashedPassword,
      name,
      surname,
      role || "user"
    );

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "User creation failed" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, surname, password, role } = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let hashedPassword = existingUser.password_hash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.update(
      id,
      email || existingUser.email,
      name || existingUser.name,
      surname || existingUser.surname,
      hashedPassword,
      role || existingUser.role
    );

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "User update failed" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id.toString() === id) {
      return res.status(403).json({ error: "Cannot delete your own account" });
    }

    const deletedUser = await User.delete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "User deletion failed" });
  }
};
