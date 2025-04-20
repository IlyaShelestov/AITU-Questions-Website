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
