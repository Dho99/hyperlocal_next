import { mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_CONFIG } from "./config";

/**
 * Ensures that the target directory exists within the public uploads folder.
 * @param folderName The subfolder name (e.g., 'destinations')
 */
export async function ensureUploadDir(folderName: string): Promise<string> {
  if (!UPLOAD_CONFIG.validFolders.includes(folderName)) {
    throw new Error(`Invalid upload folder: ${folderName}`);
  }

  const targetDir = path.join(process.cwd(), UPLOAD_CONFIG.uploadDir, folderName);
  
  await mkdir(targetDir, { recursive: true });
  
  return targetDir;
}

/**
 * Generates a unique filename for the uploaded image.
 * @param folderName Prefix for the filename
 * @param originalExtension Original extension or desired extension
 */
export function generateUniqueFilename(folderName: string, extension: string = "webp"): string {
  const { v4: uuidv4 } = require("uuid");
  const timestamp = Date.now();
  const uuid = uuidv4();
  
  return `${folderName}-${timestamp}-${uuid}.${extension}`;
}

/**
 * Validates the file URL to prevent directory traversal attacks during deletion.
 * @param fileUrl The public URL of the file (e.g., '/uploads/destinations/file.webp')
 */
export function validateSafePath(fileUrl: string): string {
  if (!fileUrl.startsWith(UPLOAD_CONFIG.publicPath)) {
    throw new Error("Invalid file path: Must start with /uploads");
  }

  // Sanitize path to prevent directory traversal
  const relativePath = fileUrl.replace(UPLOAD_CONFIG.publicPath, "");
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  
  const fullPath = path.join(process.cwd(), UPLOAD_CONFIG.uploadDir, normalizedPath);
  
  // Ensure the resolved path is still inside the upload directory
  const absoluteUploadDir = path.join(process.cwd(), UPLOAD_CONFIG.uploadDir);
  if (!fullPath.startsWith(absoluteUploadDir)) {
    throw new Error("Invalid file path: Access denied");
  }

  return fullPath;
}
