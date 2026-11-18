import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
    const destCount = await prisma.destination.count();
    const destNoImg = await prisma.destination.count({ where: { images: { none: {} } } });
    console.log("destinations:", destCount, "| tanpa gambar:", destNoImg);

    const dests = await prisma.destination.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        select: {
            name: true,
            city: true,
            createdAt: true,
            images: { select: { imageUrl: true, isPrimary: true }, take: 3 },
        },
    });
    for (const d of dests) {
        const urls = d.images.map((i) => i.imageUrl.slice(0, 70) + (i.isPrimary ? "*" : "").trim());
        console.log(`- ${d.name} (${d.city}, ${(d.createdAt as Date).toISOString().slice(0, 10)}) imgs:${d.images.length}`, urls.join(" || ") || "(kosong)");
    }

    const uCount = await prisma.umkm.count();
    const uNoImg = await prisma.umkm.count({ where: { images: { none: {} } } });
    const aCount = await prisma.accommodation.count();
    const aNoImg = await prisma.accommodation.count({ where: { images: { none: {} } } });
    console.log("umkm:", uCount, "| tanpa gambar:", uNoImg, "|| penginapan:", aCount, "| tanpa gambar:", aNoImg);

    const withEmpty = await prisma.destinationImage.count({ where: { imageUrl: "" } });
    console.log("destinationImage dengan imageUrl kosong:", withEmpty);
}

main()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
