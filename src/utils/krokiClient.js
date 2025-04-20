function getMermaidImageUrl(mermaidDef, format = "svg") {
  try {
    const zlib = require("zlib");
    const buffer = Buffer.from(mermaidDef, "utf8");
    const compressed = zlib.deflateSync(buffer);
    const encoded = compressed
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return `/chat/diagram/${format}/${encoded}`;
  } catch (error) {
    console.error("Error creating Kroki URL:", error);
    throw new Error("Failed to generate diagram URL");
  }
}

module.exports = {
  getMermaidImageUrl,
};
