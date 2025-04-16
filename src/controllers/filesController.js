const File = require("../models/File");
const UserAction = require("../models/UserAction");
const path = require("path");
const fs = require("fs");
const util = require("util");
const unlink = util.promisify(fs.unlink);
const rename = util.promisify(fs.rename);
const { simplifyMimeType } = require("../utils/fileHelpers");
const { staffDir, studentsDir } = require("../utils/multer");

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
    const fileTypes = [...new Set(files.map((file) => file.type))];
    const uploaders = [
      ...new Set(files.map((file) => `${file.user_name} ${file.user_surname}`)),
    ];

    res.render("files", {
      title: "Files Management",
      user: req.user,
      files,
      fileTypes,
      uploaders,
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

    const { audience } = req.body;
    if (!audience || !["students", "staff", "both"].includes(audience)) {
      return res.status(400).json({ error: "Invalid audience selection" });
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

    const { mimetype, size, path: tempPath } = req.file;
    const { id, name, surname } = req.user;
    const simplifiedType = simplifyMimeType(mimetype);

    let finalPath;
    const filename = path.basename(tempPath);

    if (audience === "students") {
      finalPath = path.join(studentsDir, filename);
    } else if (audience === "staff") {
      finalPath = path.join(staffDir, filename);
    } else {
      finalPath = path.join(staffDir, filename);
    }

    if (tempPath !== finalPath) {
      await rename(tempPath, finalPath);
    }

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
        finalPath,
        audience
      );

      // Log the file replacement action
      await UserAction.create(
        id,
        name,
        surname,
        "replace",
        "file",
        existingFile.file_id,
        originalname,
        `File replaced. Size: ${(size / 1024).toFixed(
          2
        )} KB, Type: ${simplifiedType}, Audience: ${audience}`
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
        finalPath,
        name,
        surname,
        audience
      );

      // Log the file upload action
      await UserAction.create(
        id,
        name,
        surname,
        "upload",
        "file",
        file.file_id,
        originalname,
        `File uploaded. Size: ${(size / 1024).toFixed(
          2
        )} KB, Type: ${simplifiedType}, Audience: ${audience}`
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
    const { id: fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileInfo = await File.getFileInfo(fileId);
    const deletedFile = await File.delete(fileId);

    if (!deletedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    await unlink(file.path);

    // Log the file deletion action
    await UserAction.create(
      req.user.id,
      req.user.name,
      req.user.surname,
      "delete",
      "file",
      fileId,
      fileInfo.file_name,
      `File deleted. Type: ${fileInfo.type}, Audience: ${fileInfo.audience}`
    );

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "File deletion failed" });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id: fileId } = req.params;
    const fileRow = await File.findById(fileId);

    if (!fileRow) {
      return res.status(404).render("error", {
        message: "File not found",
      });
    }

    const fileInfo = await File.getFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).render("error", {
        message: "File not found",
      });
    }

    // Log the file download action
    await UserAction.create(
      req.user.id,
      req.user.name,
      req.user.surname,
      "download",
      "file",
      fileId,
      fileInfo.file_name,
      `File downloaded. Type: ${fileInfo.type}, Audience: ${fileInfo.audience}`
    );

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
