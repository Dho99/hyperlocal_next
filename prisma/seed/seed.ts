import { importCsv } from "./importCsv";
import { logger } from "./utils/logger";
import { prisma } from "../../lib/prisma";
import { seedAccommodations } from "./data/accommodations";
import { seedAcesh } from "./aceshSeeder";
import fs from "fs";
import path from "path";

async function main() {
    logger.info("Starting HyperLocal Tourism Seeder...");

    const rawDir = path.join(process.cwd(), "lib/crawled_data/raw");

    if (fs.existsSync(rawDir)) {
        const files = fs
            .readdirSync(rawDir)
            .filter((f) => f.endsWith(".csv"))
            .sort()
            .reverse();

        if (files.length > 0) {
            const latestFile = path.join(rawDir, files[0]);
            logger.info(`Using latest data: ${files[0]}`);

            try {
                await importCsv(latestFile);
                logger.success("CSV import finished.");
            } catch (error) {
                logger.error("CSV import failed!", error);
            }
        } else {
            logger.info("No CSV files found, skipping CSV import");
        }
    } else {
        logger.info(`Raw data directory not found: ${rawDir}, skipping CSV import`);
    }

    try {
        await seedAcesh();
    } catch (error) {
        logger.error("ACES-H seeding failed!", error);
    }

    try {
        await seedAccommodations();
        logger.success("Accommodation seeding finished successfully.");
    } catch (error) {
        logger.error("Accommodation seeding failed!", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
