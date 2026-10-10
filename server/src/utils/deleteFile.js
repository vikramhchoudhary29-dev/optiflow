import fs from "fs";
import path from "path";

/* ============================================================
   DELETE FILE
============================================================ */

export default function deleteFile(filePath) {
  try {
    if (!filePath) return;

    // Remove leading slash if present
    const normalizedPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;

    const fullPath = path.resolve(normalizedPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Error deleting file:", error.message);
  }
}