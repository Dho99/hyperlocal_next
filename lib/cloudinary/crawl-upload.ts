import { createHash } from "crypto";
import { cloudinary } from "./config";
import { FOLDER_MAPPING } from "@/lib/upload/config";

/**
 * Upload gambar hasil crawl (external URL, biasanya lh3.googleusercontent.com)
 * ke Cloudinary dan return secure_url.
 *
 * - Folder: hyperlocal/destinations/<slug> atau hyperlocal/umkm/<slug> dst
 * - public_id deterministic berbasis hash URL agar idempotent (tidak duplikat saat rerun)
 * - resource_type: image, quality auto, fetch_format auto
 */
export interface CrawlUploadOptions {
    slug: string;
    kind?: "destinations" | "umkm" | "accommodations" | "facility-evidences";
    caption?: string | null;
    isPrimary?: boolean;
}

function hashUrl(url: string): string {
    return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function isCloudinaryUrl(url: string): boolean {
    return url.includes("res.cloudinary.com");
}

export async function uploadCrawledImageToCloudinary(
    sourceUrl: string,
    options: CrawlUploadOptions,
): Promise<string> {
    if (!sourceUrl) throw new Error("sourceUrl kosong");
    if (isCloudinaryUrl(sourceUrl)) return sourceUrl;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary config belum lengkap (cloud_name/api_key/api_secret)");
    }

    const kind = options.kind ?? "destinations";
    const baseFolder = FOLDER_MAPPING[kind] ?? `hyperlocal/${kind}`;
    // slugified path: hyperlocal/destinations/<slug>/crawl-<hash>
    const safeSlug = options.slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80);
    const folder = `${baseFolder}/${safeSlug}`;
    const publicId = `crawl-${hashUrl(sourceUrl)}`;

    // Check if already exists to avoid re-upload cost
    try {
        const existing = await cloudinary.api.resource(`${folder}/${publicId}`, {
            resource_type: "image",
        });
        if (existing?.secure_url) return existing.secure_url as string;
    } catch {
        // not found -> will upload
    }

    // Coba remote fetch via Cloudinary dulu (paling efisien).
    // Jika lh3 token sudah expired / 403, fallback ke fetch lokal + upload_stream.
    try {
        const result = await cloudinary.uploader.upload(sourceUrl, {
            folder,
            public_id: publicId,
            resource_type: "image",
            overwrite: false,
            unique_filename: false,
            use_filename: false,
            quality: "auto",
            fetch_format: "auto",
        });
        if (!result.secure_url) throw new Error("Cloudinary upload tidak mengembalikan secure_url");
        return result.secure_url;
    } catch (e: any) {
        const msg = e?.message ?? String(e);
        // Jika 403/Forbidden dari lh3, coba fetch lokal dengan header browser-like
        // supaya dapat error yang lebih deskriptif. Jika masih 403, beri hint re-crawl.
        if (msg.includes("403") || msg.includes("Forbidden")) {
            // Attempt local fetch as last resort
            try {
                const res = await fetch(sourceUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Accept": "image/*,*/*",
                        "Referer": "https://www.google.com/",
                    },
                });
                if (!res.ok) {
                    throw new Error(
                        `Fetch lh3 gagal ${res.status} ${res.statusText} - URL place-photos kemungkinan expired. Re-crawl via Google Places API diperlukan untuk mendapatkan URL fresh. Original: ${msg}`,
                    );
                }
                const buf = Buffer.from(await res.arrayBuffer());
                const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder,
                            public_id: publicId,
                            resource_type: "image",
                            overwrite: false,
                            unique_filename: false,
                            use_filename: false,
                            quality: "auto",
                            fetch_format: "auto",
                        },
                        (err, res) => (err ? reject(err) : resolve(res as any)),
                    );
                    stream.end(buf);
                });
                if (!result.secure_url) throw new Error("Cloudinary upload_stream tidak mengembalikan secure_url");
                return result.secure_url;
            } catch (fetchErr: any) {
                throw new Error(`${msg} | Local fetch also failed: ${fetchErr.message}. Hint: lh3 place-photos URL expired, lakukan re-crawl dengan GOOGLE_MAPS_API_KEY untuk dapat photo_reference fresh.`);
            }
        }
        throw e;
    }
}

export function isAlreadyCloudinary(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.includes("res.cloudinary.com");
}

/**
 * Untuk transisi: jika DB masih menyimpan lh3 URL, render via Cloudinary fetch
 * tanpa harus migrasi DB dulu. Dipakai di UI sebagai fallback.
 * Contoh: https://res.cloudinary.com/<cloud>/image/fetch/<encodedUrl>
 */
export function toCloudinaryFetchUrl(sourceUrl: string | null | undefined): string | null {
    if (!sourceUrl) return null;
    if (isCloudinaryUrl(sourceUrl)) return sourceUrl;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return sourceUrl; // fallback ke original jika config belum ada
    // Cloudinary fetch perlu URL di-encode
    const encoded = encodeURIComponent(sourceUrl);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${encoded}`;
}

// ── Google Places helpers untuk hybrid fallback (expired lh3 → fresh via API) ──
export async function searchPlaceId(query: string): Promise<string | null> {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) throw new Error("GOOGLE_MAPS_API_KEY belum set");
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}&language=id`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TextSearch ${res.status} ${await res.text().then(t=>t.slice(0,300))}`);
    const json: any = await res.json();
    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
        throw new Error(`TextSearch status ${json.status}: ${json.error_message ?? JSON.stringify(json).slice(0,500)}`);
    }
    if (!json.results?.length) return null;
    return json.results[0].place_id as string;
}

export async function getPhotoReferences(placeId: string): Promise<string[]> {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) throw new Error("GOOGLE_MAPS_API_KEY belum set");
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${key}&language=id`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Details ${res.status}`);
    const json: any = await res.json();
    if (json.status !== "OK") {
        if (json.status === "ZERO_RESULTS") return [];
        throw new Error(`Details status ${json.status}: ${json.error_message ?? ""}`);
    }
    const photos = json.result?.photos as Array<{ photo_reference: string }> | undefined;
    if (!photos?.length) return [];
    return photos.map(p => p.photo_reference);
}

export async function fetchPhotoBuffer(photoRef: string): Promise<Buffer> {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) throw new Error("GOOGLE_MAPS_API_KEY belum set");
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoRef}&key=${key}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Photo fetch ${res.status} ${txt.slice(0,300)}`);
    }
    return Buffer.from(await res.arrayBuffer());
}

export async function uploadBufferToCloudinary(buffer: Buffer, slug: string, photoRef: string, kind: CrawlUploadOptions["kind"] = "destinations"): Promise<string> {
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0,80);
    const baseFolder = FOLDER_MAPPING[kind ?? "destinations"] ?? `hyperlocal/${kind ?? "destinations"}`;
    const folder = `${baseFolder}/${safeSlug}`;
    const publicId = `crawl-${hashUrl(photoRef)}`;
    try {
        const existing = await cloudinary.api.resource(`${folder}/${publicId}`, { resource_type: "image" });
        if (existing?.secure_url) return existing.secure_url as string;
    } catch {}
    const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: "image",
            overwrite: false,
            unique_filename: false,
            use_filename: false,
            quality: "auto",
            fetch_format: "auto",
        }, (err, res) => err ? reject(err) : resolve(res));
        stream.end(buffer);
    });
    if (!result.secure_url) throw new Error("No secure_url");
    return result.secure_url;
}
