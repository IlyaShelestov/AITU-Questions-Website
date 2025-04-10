const File = require("../models/File");
const fs = require("fs");
const util = require("util");
const unlink = util.promisify(fs.unlink);

exports.renderFilesPage = async (req, res) => {
  try {
    const files = await File.findAll();
    res.render("files", {
      title: "Files Management",
      user: req.user,
      files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).render("error", {
      message: "Error loading files page",
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;
    const { name, surname } = req.user;

    const file = await File.create(
      originalname,
      size,
      mimetype,
      filePath,
      name,
      surname
    );

    return res.status(201).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const deletedFile = await File.delete(id);
    if (!deletedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    await unlink(file.path);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "File deletion failed" });
  }
};
