import { prisma } from "@/lib/prisma";

export async function getLocationNames(): Promise<string[]> {
    const locations = await prisma.destination.findMany({
        where: { status: "APPROVED" },
        select: { city: true, province: true },
    });
    const set = new Set<string>();
    for (const l of locations) {
        if (l.city) set.add(l.city);
        if (l.province) set.add(l.province);
    }
    return Array.from(set);
}

export function extractCityFromQuery(
    query: string,
    knownLocations: string[],
): string | null {
    const lower = query.toLowerCase();
    const words = lower.split(/\s+/).filter((w) => w.length > 2);
    return (
        knownLocations.find((loc) => {
            const locLower = loc.toLowerCase().trim();
            if (lower.includes(locLower)) return true;
            if (words.some((word) => locLower.includes(word))) return true;
            return false;
        }) ?? null
    );
}

export function isWithinLocation(
    city: string | null | undefined,
    province: string | null | undefined,
    location: string,
): boolean {
    if (!city && !province) return true;
    const loc = location.toLowerCase().trim();
    const c = city?.toLowerCase().trim() ?? "";
    const p = province?.toLowerCase().trim() ?? "";
    return c.includes(loc) || p.includes(loc);
}

const GENERIC_WORDS = new Set([
    "indonesia", "jawa",
    "jalan", "jl", "gang", "gg", "komplek", "perumahan",
    "blok", "nomor", "no", "kavling", "dusun", "desa",
    "kecamatan", "kec", "kelurahan", "kel", "kabupaten", "kab",
    "provinsi", "sebelah", "selatan", "utara", "timur", "barat",
    "depan", "belakang", "samping", "atas",
    "pantai", "gunung", "sungai", "danau", "pulau", "lembah",
    "taman", "wisata", "alam", "rekreasi", "agrowisata",
]);

export function isAddressWithinLocation(
    address: string | null,
    matchedLocation: string,
): boolean {
    if (!address) return true;
    const addr = address.toLowerCase();
    const loc = matchedLocation.toLowerCase();

    // If address explicitly contains the matched location, it's valid
    if (addr.includes(loc)) return true;

    // Split address by comma and scan each segment
    const tokens = address
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 3);

    for (const token of tokens) {
        if (token.includes(loc)) continue;
        if (GENERIC_WORDS.has(token)) continue;
        // This looks like a different city/kecamatan — address conflicts
        return false;
    }

    return true;
}

export function isNameWithinLocation(
    name: string,
    description: string | null,
    matchedLocation: string,
    knowLocations: string[],
): boolean {
    const nameLower = name.toLowerCase();
    const descLower = description?.toLowerCase() ?? "";
    const matchLoc = matchedLocation.toLowerCase().trim();

    if (nameLower.includes(matchLoc)) return true;
    if (descLower.includes(matchLoc)) return true;

    for (const loc of knowLocations) {
        const locLower = loc.toLowerCase().trim();
        if (locLower === matchLoc) continue;
        if (nameLower.includes(locLower)) return false;
        if (descLower.includes(locLower)) return false;
    }

    return true;
}
