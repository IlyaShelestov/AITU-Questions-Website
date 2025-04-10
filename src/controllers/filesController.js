const File = require("../models/File");
const path = require("path");
const fs = require("fs");
const util = require("util");
const unlink = util.promisify(fs.unlink);
const { simplifyMimeType } = require("../utils/fileHelpers");

function sanitizeFilenameForContentDisposition(filename) {
  let sanitized = filename
    .replace(/[\r\n]/g, " ")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/[\u0080-\u009F]/g, "")
    .replace(/"/g, "'");

  sanitized = sanitized.trim();

  return sanitized;
}

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

    let originalname = req.file.originalname;

    try {
      const decoded = decodeURIComponent(escape(originalname));
      if (decoded !== originalname) {
        originalname = decoded;
      }
    } catch (decodeErr) {
      console.log("Could not decode filename:", decodeErr);
    }

    const { mimetype, size, path: filePath } = req.file;
    const { name, surname } = req.user;
    const simplifiedType = simplifyMimeType(mimetype);

    const existingFile = await File.findByName(originalname);

    if (existingFile) {
      const oldFile = await File.findById(existingFile.file_id);
      if (oldFile && oldFile.path) {
        try {
          await unlink(oldFile.path);
        } catch (err) {
          console.error("Error deleting existing file:", err);
        }
      }

      const updatedFile = await File.update(
        existingFile.file_id,
        originalname,
        size,
        simplifiedType,
        filePath
      );

      return res.status(200).json({
        message: "File replaced successfully",
        file: updatedFile,
      });
    } else {
      const file = await File.create(
        originalname,
        size,
        simplifiedType,
        filePath,
        name,
        surname
      );

      return res.status(201).json({
        message: "File uploaded successfully",
        file,
      });
    }
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

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileRow = await File.findById(id);

    if (!fileRow) {
      return res.status(404).render("error", {
        message: "File not found",
      });
    }

    const fileInfo = await File.getFileInfo(id);
    if (!fileInfo) {
      return res.status(404).render("error", {
        message: "File not found",
      });
    }

    const sanitizedFilename = sanitizeFilenameForContentDisposition(
      fileInfo.file_name
    );

    const extension = path.extname(fileInfo.file_name).toLowerCase();
    let contentType = fileInfo.type;
    if (extension === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (extension === ".xlsx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    res.setHeader("Content-Type", contentType);

    return res.download(fileRow.path, sanitizedFilename, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).render("error", {
            message: "Error downloading file",
          });
        }
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return res.status(500).render("error", {
      message: "Error downloading file",
    });
  }
};
