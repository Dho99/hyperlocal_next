/**
 * Helper terpusat untuk normalisasi URL gambar destinasi/umkm.
 * Pastikan output selalu Cloudinary jika sudah di-migrasi.
 * - Jika sudah res.cloudinary.com -> return apa adanya (origin Cloudinary)
 * - Jika masih lh3/googleusercontent -> return URL asli untuk sementara.
 *   Alasan: URL lh3 place-photos dengan token AJRVUZ... tidak bisa di-fetch
 *   server-side (Cloudinary remote fetch maupun Node fetch return 403).
 *   Token tersebut hanya valid di browser atau saat crawl fresh via Places API.
 *   Setelah migrasi/re-crawl sukses, DB akan berisi res.cloudinary.com dan
 *   fungsi ini otomatis jadi pass-through Cloudinary.
 *   Opsi fetch via Cloudinary (`/image/fetch/`) sengaja dimatikan agar tidak
 *   memicu 403 tambahan; aktifkan kembali setelah crawl baru jika diperlukan.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

export function isCloudinaryUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.includes(CLOUDINARY_HOST);
}

export function normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (isCloudinaryUrl(url)) return url;
    // Belum migrasi -> kembalikan URL asli (browser akan hit lh3 langsung).
    // Ini menghindari 403 saat Cloudinary mencoba fetch lh3 yang sudah expired.
    // Setelah script migrate-images-to-cloudinary berhasil (re-crawl fresh),
    // URL akan menjadi res.cloudinary.com dan tidak masuk cabang ini.
    return url;
}

/**
 * Varian yang menghasilkan Cloudinary Fetch URL (untuk future use jika
 * ingin browser tetap hit Cloudinary CDN meski DB masih lh3).
 * Tidak dipakai default karena lh3 place-photos saat ini 403 untuk fetch remote.
 */
export function toCloudinaryFetchUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (isCloudinaryUrl(url)) return url;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return url;
    try {
        new URL(url);
    } catch {
        return url;
    }
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${encodeURIComponent(url)}`;
}

/**
 * Untuk array images (destination.images, umkm.images)
 */
export function normalizeImageUrls<T extends { imageUrl: string }>(images: T[] | null | undefined): T[] {
    if (!images?.length) return [];
    return images.map((img) => ({
        ...img,
        imageUrl: normalizeImageUrl(img.imageUrl) ?? img.imageUrl,
    }));
}
