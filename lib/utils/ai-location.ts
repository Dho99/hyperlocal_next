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
    return knownLocations.find((loc) => {
        const locLower = loc.toLowerCase().trim();
        if (lower.includes(locLower)) return true;
        if (words.some((word) => locLower.includes(word))) return true;
        return false;
    }) ?? null;
}
