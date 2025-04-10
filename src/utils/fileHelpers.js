/**
 * Simplifies complex MIME types to more user-friendly formats
 * @param {string} mimeType - The original MIME type
 * @returns {string} - A simplified MIME type
 */
exports.simplifyMimeType = (mimeType) => {
  const mimeMap = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word Document (.docx)",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel Spreadsheet (.xlsx)",
    "application/pdf": "PDF Document (.pdf)",
    "text/plain": "Text File (.txt)",
    "application/msword": "Word Document (.doc)",
    "application/vnd.ms-excel": "Excel Spreadsheet (.xls)",
  };

  return mimeMap[mimeType] || mimeType;
};

/**
 * Encodes a filename for Content-Disposition header to handle non-Latin characters
 * @param {string} filename - The original filename
 * @returns {string} - An encoded filename safe for headers
 */
exports.encodeFilename = (filename) => {
  const encodedFilename = encodeURIComponent(filename).replace(/%20/g, " ");
  return `filename*=UTF-8''${encodedFilename}; filename="${filename}"`;
};
