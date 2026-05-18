export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  uploadDir: "public/uploads",
  publicPath: "/uploads",
  imageMaxWidth: 1920,
  imageQuality: 80,
  validFolders: ["destinations", "umkm", "users", "validations", "categories", "facilities"],
};
