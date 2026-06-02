export const UPLOAD_CONFIG = {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    imageMaxWidth: 1920,
    imageQuality: 80,
    validFolders: [
        "destinations",
        "umkm",
        "users",
        "validations",
        "categories",
        "facilities",
        "facility-evidences",
        "accommodations",
    ],
};

export const FOLDER_MAPPING: Record<string, string> = {
    destinations: "hyperlocal/destinations",
    umkm: "hyperlocal/umkm",
    users: "hyperlocal/profiles",
    validations: "hyperlocal/validations",
    categories: "hyperlocal/categories",
    facilities: "hyperlocal/facilities",
    "facility-evidences": "hyperlocal/facility-evidences",
    accommodations: "hyperlocal/accommodations",
};
