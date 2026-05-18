import { prisma } from "../../lib/prisma";
import { slugify } from "./utils/slugify";

const CATEGORY_MAP: Record<string, { name: string; slug: string }> = {
    tourist_attraction: { name: "Wisata", slug: "wisata" },
    tourism: { name: "Wisata", slug: "wisata" },
    beach: { name: "Wisata Alam", slug: "wisata-alam" },
    mountain: { name: "Wisata Alam", slug: "wisata-alam" },
    waterfall: { name: "Wisata Alam", slug: "wisata-alam" },
    park: { name: "Wisata", slug: "wisata" },
    museum: { name: "Wisata Budaya", slug: "wisata-budaya" },
    attraction: { name: "Wisata", slug: "wisata" },
    nature: { name: "Wisata Alam", slug: "wisata-alam" },
    wisata: { name: "Wisata", slug: "wisata" },
    restaurant: { name: "Kuliner", slug: "kuliner" },
    cafe: { name: "Kuliner", slug: "kuliner" },
    food: { name: "Kuliner", slug: "kuliner" },
    bakery: { name: "Kuliner", slug: "kuliner" },
    lodging: { name: "Penginapan", slug: "penginapan" },
    religious: { name: "Wisata Religi", slug: "wisata-religi" },
    souvenir: { name: "UMKM & Oleh-oleh", slug: "umkm-oleh-oleh" },
    shop: { name: "UMKM & Oleh-oleh", slug: "umkm-oleh-oleh" },
    marketplace: { name: "UMKM & Oleh-oleh", slug: "umkm-oleh-oleh" },
    gift: { name: "UMKM & Oleh-oleh", slug: "umkm-oleh-oleh" },
    local_product: { name: "UMKM & Oleh-oleh", slug: "umkm-oleh-oleh" },
    umkm: { name: "UMKM", slug: "umkm" },
};

const DESTINATION_CATEGORIES = [
    "tourist_attraction",
    "tourism",
    "beach",
    "mountain",
    "waterfall",
    "park",
    "museum",
    "attraction",
    "nature",
    "wisata",
];

export function getEntityType(rawCategory: string): "destination" | "umkm" {
    const normalized = rawCategory.toLowerCase().trim();
    return DESTINATION_CATEGORIES.includes(normalized) ? "destination" : "umkm";
}

const categoryCache: Record<string, string> = {};

export async function resolveCategory(rawCategory: string): Promise<string> {
    const normalized = rawCategory.toLowerCase().trim();
    const mapping = CATEGORY_MAP[normalized] || {
        name: rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1),
        slug: slugify(rawCategory),
    };

    if (categoryCache[mapping.slug]) {
        return categoryCache[mapping.slug];
    }

    const category = await prisma.category.upsert({
        where: { slug: mapping.slug },
        update: {},
        create: {
            name: mapping.name,
            slug: mapping.slug,
        },
    });

    categoryCache[mapping.slug] = category.id;
    return category.id;
}
