import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const GOOGLE_IMAGE_HOSTS = [
    "lh3.googleusercontent.com",
];

function isGoogleImageUrl(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        return GOOGLE_IMAGE_HOSTS.some((h) => hostname.includes(h));
    } catch {
        return false;
    }
}

async function checkDestinationImages() {
    const images = await prisma.destinationImage.findMany();
    const googleImages = images.filter((img) => isGoogleImageUrl(img.imageUrl));
    console.log(`Destination Images: ${images.length} total, ${googleImages.length} Google URLs`);
    return googleImages.length;
}

async function checkUmkmImages() {
    const images = await prisma.umkmImage.findMany();
    const googleImages = images.filter((img) => isGoogleImageUrl(img.imageUrl));
    console.log(`UMKM Images: ${images.length} total, ${googleImages.length} Google URLs`);
    return googleImages.length;
}

async function checkAccommodationImages() {
    const images = await prisma.accommodationImage.findMany();
    const googleImages = images.filter((img) => isGoogleImageUrl(img.imageUrl));
    console.log(`Accommodation Images: ${images.length} total, ${googleImages.length} Google URLs`);
    return googleImages.length;
}

async function checkFacilityEvidences() {
    const evidences = await prisma.destinationFacilityEvidence.findMany();
    const googleEvidences = evidences.filter((ev) => isGoogleImageUrl(ev.imageUrl));
    console.log(`Facility Evidences: ${evidences.length} total, ${googleEvidences.length} Google URLs`);
    return googleEvidences.length;
}

async function checkAceshRecords() {
    const records = await prisma.aceshEvidenceRecord.findMany({
        where: { photoUrl: { not: null } },
    });
    const googleRecords = records.filter((r) => r.photoUrl && isGoogleImageUrl(r.photoUrl));
    console.log(`ACESH Records: ${records.length} total, ${googleRecords.length} Google URLs`);
    return googleRecords.length;
}

async function checkValidationEvidences() {
    const evidences = await prisma.validationEvidence.findMany();
    const googleEvidences = evidences.filter((ev) => isGoogleImageUrl(ev.fileUrl));
    console.log(`Validation Evidences: ${evidences.length} total, ${googleEvidences.length} Google URLs`);
    return googleEvidences.length;
}

async function main() {
    console.log("Checking Google Images in Database");
    console.log("==================================\n");

    const results = await Promise.all([
        checkDestinationImages(),
        checkUmkmImages(),
        checkAccommodationImages(),
        checkFacilityEvidences(),
        checkAceshRecords(),
        checkValidationEvidences(),
    ]);

    const total = results.reduce((sum, n) => sum + n, 0);

    console.log("\n==================================");
    console.log(`TOTAL Google Images: ${total}`);
    console.log("==================================");

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error("Check failed:", e);
    process.exit(1);
});