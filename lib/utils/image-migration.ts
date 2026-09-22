import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GOOGLE_IMAGE_HOSTS = ["lh3.googleusercontent.com"];

export function isGoogleImageUrl(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        return GOOGLE_IMAGE_HOSTS.some((h) => hostname.includes(h));
    } catch {
        return false;
    }
}

function addApiKey(url: string): string {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey || !url.includes("lh3.googleusercontent.com")) return url;
    try {
        const u = new URL(url);
        u.searchParams.set("key", apiKey);
        return u.toString();
    } catch {
        return url;
    }
}

export async function downloadAndStoreImage(
    url: string,
    folder: "destinations" | "umkms" | "accommodations" | "evidences" | "acesh" | "validations",
    publicIdPrefix: string
): Promise<string> {
    if (!isGoogleImageUrl(url)) return url;

    const downloadUrl = addApiKey(url);
    const response = await fetch(downloadUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HyperlocalBot/1.0)", "Referer": "https://maps.googleapis.com/" },
    });

    if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `hyperlocal/${folder}`, public_id: `${publicIdPrefix}_${Date.now()}`, resource_type: "auto", quality: "auto", fetch_format: "auto" },
            (err, result) => { err ? reject(err) : result?.secure_url ? resolve(result.secure_url) : reject(new Error("No URL")); }
        );
        stream.end(buffer);
    });
}

export async function downloadAndStoreMultipleImages(
    urls: string[],
    folder: "destinations" | "umkms" | "accommodations" | "evidences" | "acesh" | "validations",
    publicIdPrefix: string
): Promise<string[]> {
    const results = await Promise.allSettled(
        urls.map((url) => downloadAndStoreImage(url, folder, publicIdPrefix))
    );

    return results.map((r, i) => {
        if (r.status === "fulfilled") return r.value;
        console.error(`Failed to migrate ${urls[i]}:`, r.reason);
        return urls[i];
    });
}