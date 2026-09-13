import { prisma } from "../../lib/prisma";

export async function importCoverageAndCategories() {
  console.log("--> Importing CoverageArea & Categories...");

  // 1. Coverage Area Default
  const coverageArea = await prisma.coverageArea.upsert({
    where: { id: "coverage-pangandaran" },
    update: {
      name: "Kabupaten Pangandaran",
      level: "KABUPATEN",
      colorHex: "#0D9488",
      geoJsonData: {},
      isActive: true,
    },
    create: {
      id: "coverage-pangandaran",
      name: "Kabupaten Pangandaran",
      level: "KABUPATEN",
      colorHex: "#0D9488",
      geoJsonData: {},
      isActive: true,
    },
  });

  // 2. Default Categories
  const categoryData = [
    { name: "Wisata Alam", slug: "wisata-alam", type: "DESTINATION" as const, description: "Wisata alam, pegunungan, curug, dan rekreasi alam." },
    { name: "Pantai", slug: "pantai", type: "DESTINATION" as const, description: "Wisata pantai dan pesisir Pangandaran." },
    { name: "Taman & Rekreasi", slug: "taman-rekreasi", type: "DESTINATION" as const, description: "Taman rekreasi, wahana air, dan cagar alam." },
    { name: "Wisata Religi", slug: "wisata-religi", type: "DESTINATION" as const, description: "Destinasi religi dan tempat ibadah bersejarah." },
    { name: "Kuliner Halal", slug: "kuliner-halal", type: "UMKM" as const, description: "Restoran, rumah makan, dan warung kuliner." },
    { name: "Oleh-Oleh & Souvenir", slug: "oleh-oleh-souvenir", type: "UMKM" as const, description: "Pusat oleh-oleh khas Pangandaran." },
    { name: "Hotel Syariah", slug: "hotel-syariah", type: "ACCOMMODATION" as const, description: "Hotel dan penginapan ramah muslim." },
    { name: "Villa & Homestay", slug: "villa-homestay", type: "ACCOMMODATION" as const, description: "Villa dan homestay sekitar tempat wisata." },
    { name: "Penginapan Murah", slug: "penginapan-murah", type: "ACCOMMODATION" as const, description: "Penginapan budget untuk wisatawan." },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: {
        slug_type: {
          slug: cat.slug,
          type: cat.type,
        },
      },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
        description: cat.description,
      },
    });
    categories[`${cat.slug}_${cat.type}`] = created.id;
  }

  console.log("  ✓ CoverageArea created/updated:", coverageArea.name);
  console.log("  ✓ Categories created/updated:", Object.keys(categories).length);

  return { coverageAreaId: coverageArea.id, categories };
}
