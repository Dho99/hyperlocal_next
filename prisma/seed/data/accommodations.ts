import { prisma } from "@/lib/prisma";
import { slugify } from "../utils/slugify";

const accommodationData = [
    {
        name: "Hotel Syariah Al-Haramain",
        city: "Jakarta",
        province: "DKI Jakarta",
        address: "Jl. MH Thamrin No. 10, Jakarta Pusat",
        phone: "021-12345678",
        description: {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Hotel syariah dengan fasilitas lengkap di pusat kota Jakarta. Menyediakan restoran halal, musala, dan kolam renang terpisah pria dan wanita." }] },
            ],
        },
        validationStatus: "APPROVED",
    },
    {
        name: "Villa Pantai Indah",
        city: "Anyer",
        province: "Banten",
        address: "Jl. Raya Anyer, KM 15",
        phone: "0254-987654",
        description: {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Villa tepi pantai dengan pemandangan laut yang indah. Dilengkapi dapur halal, musala, dan area bermain anak." }] },
            ],
        },
        validationStatus: "APPROVED",
    },
    {
        name: "Homestay Ramah Muslim Bandung",
        city: "Bandung",
        province: "Jawa Barat",
        address: "Jl. Dago No. 55, Bandung",
        phone: "022-5678901",
        description: {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Homestay nyaman di kawasan Dago dengan suasana asri. Dilengkapi fasilitas ibadah dan makanan halal." }] },
            ],
        },
        validationStatus: "APPROVED",
    },
    {
        name: "Resort Muslim Keluarga", 
        city: "Puncak",
        province: "Jawa Barat",
        address: "Jl. Raya Puncak, KM 83",
        phone: "0251-2345678",
        description: {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Resort keluarga dengan konsep islami di kawasan Puncak. Kolam renang terpisah, restoran halal, dan area bermain anak." }] },
            ],
        },
        status: "APPROVED",
    },
    {
        name: "Guesthouse Syariah Malioboro",
        city: "Yogyakarta",
        province: "DI Yogyakarta",
        address: "Jl. Malioboro No. 25, Yogyakarta",
        phone: "0274-345678",
        description: {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Guesthouse syariah strategis di pusat kota Yogyakarta. Berdekatan dengan destinasi wisata dan kuliner halal." }] },
            ],
        },
        validationStatus: "APPROVED",
    },
];

export async function seedAccommodations() {
    const halalFacilities = await prisma.halalFacility.findMany();

    for (const data of accommodationData) {
        const existing = await prisma.accommodation.findFirst({
            where: { name: data.name },
        });

        if (existing) {
            console.log(`Accommodation already exists: ${data.name}`);
            continue;
        }

        const slug = slugify(data.name);

        const accommodation = await prisma.accommodation.create({
            data: {
                name: data.name,
                slug,
                city: data.city,
                province: data.province,
                address: data.address,
                phone: data.phone,
                description: data.description,
                validationStatus: data.validationStatus,
                rating: Math.floor(Math.random() * 20 + 30) / 10,
                reviewCount: Math.floor(Math.random() * 50 + 5),
            },
        });

        if (halalFacilities.length > 0) {
            const numFacilities = Math.min(
                Math.floor(Math.random() * 3) + 1,
                halalFacilities.length,
            );
            const shuffled = [...halalFacilities].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, numFacilities);

            for (const facility of selected) {
                await prisma.accommodationHalalFacility.create({
                    data: {
                        accommodationId: accommodation.id,
                        facilityId: facility.id,
                    },
                });
            }
        }

        console.log(`Seeded accommodation: ${data.name}`);
    }

    console.log("Accommodation seeding complete");
}
