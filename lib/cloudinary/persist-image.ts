import { createHash } from "node:crypto";
import { cloudinary } from "@/lib/cloudinary/config";
import { FOLDER_MAPPING } from "@/lib/upload/config";

export type ImageEntityKind = "destinations" | "umkm" | "accommodations";

export type UploadedImage = {
    imageUrl: string;
    publicId: string;
    format: string;
    bytes: number;
};

export type UploadImageOptions = {
    kind: ImageEntityKind;
    slug: string;
    sourceKey: string;
    prefix?: "crawl" | "illustration" | "legacy";
    /** Override the computed folder, e.g. shared fallback illustrations. */
    folder?: string;
};

function safeSegment(value: string, max = 80): string {
    return value.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, max);
}

function hashKey(value: string): string {
    return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function isCloudinaryUrl(url: string | null | undefined): boolean {
    return Boolean(url && /^https:\/\/res\.cloudinary\.com\//i.test(url));
}

export function cloudinaryFolder(kind: ImageEntityKind, slug: string): string {
    const base = FOLDER_MAPPING[kind] ?? `hyperlocal/${kind}`;
    return `${base}/${safeSegment(slug)}`;
}

export function publicIdFor(
    kind: ImageEntityKind,
    slug: string,
    sourceKey: string,
    prefix: UploadImageOptions["prefix"] = "crawl",
): string {
    return `${cloudinaryFolder(kind, slug)}/${prefix}-${hashKey(sourceKey)}`;
}

/**
 * Uploads a processed image buffer to Cloudinary.
 * Callers must write the returned publicId + imageUrl to the database only
 * after this function resolves successfully.
 */
export async function uploadImageToCloudinary(
    buffer: Buffer,
    options: UploadImageOptions,
): Promise<UploadedImage> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME belum diset");
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary credentials belum lengkap");
    }
    if (buffer.length === 0) throw new Error("Buffer gambar kosong");

    const folder = options.folder ?? cloudinaryFolder(options.kind, options.slug);
    const shortId = `${options.prefix ?? "crawl"}-${hashKey(options.sourceKey)}`;
    const resourceId = `${folder}/${shortId}`;

    try {
        const existing = await cloudinary.api.resource(resourceId, {
            resource_type: "image",
        });
        if (existing?.secure_url && isCloudinaryUrl(existing.secure_url)) {
            return {
                imageUrl: existing.secure_url,
                publicId: resourceId,
                format: String(existing.format ?? "jpg"),
                bytes: Number(existing.bytes ?? buffer.length),
            };
        }
    } catch {
        // Not found -> upload below.
    }

    const result = await new Promise<{
        secure_url?: string;
        public_id?: string;
        format?: string;
        bytes?: number;
    }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: shortId,
                resource_type: "image",
                overwrite: false,
                unique_filename: false,
                use_filename: false,
                quality: "auto",
                fetch_format: "auto",
            },
            (error, uploaded) => {
                if (error) return reject(error);
                resolve(uploaded ?? {});
            },
        );
        stream.end(buffer);
    });

    if (!result.secure_url || !isCloudinaryUrl(result.secure_url)) {
        throw new Error("Cloudinary tidak mengembalikan secure_url yang valid");
    }
    if (!result.public_id) {
        throw new Error("Cloudinary tidak mengembalikan public_id");
    }

    return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        format: String(result.format ?? "jpg"),
        bytes: Number(result.bytes ?? buffer.length),
    };
}

/**
 * Best-effort cleanup when the database write fails after an upload.
 */
export async function destroyCloudinaryImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch {
        // Orphan assets are reported by the caller; never mask the DB error.
    }
}

export function publicIdFromCloudinaryUrl(url: string): string | null {
    const match = url.match(/\/image\/upload\/v\d+\/(.+)\.[a-z0-9]+$/i);
    return match?.[1] ?? null;
}
