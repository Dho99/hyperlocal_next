import sharp from "sharp";
import { UPLOAD_CONFIG } from "./config";

/**
 * Optimizes an image using Sharp: resizes, converts to WebP, and compresses.
 * @param buffer The raw file buffer
 * @returns Optimized image buffer
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize({
      width: UPLOAD_CONFIG.imageMaxWidth,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: UPLOAD_CONFIG.imageQuality })
    .toBuffer();
}
