import { importCsv } from "./importCsv";
import { logger } from "./utils/logger";
import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
    logger.info("Starting Hyperlocal Tourism Seeder...");

    const rawDir = path.join(process.cwd(), "lib/crawled_data/raw");

    if (!fs.existsSync(rawDir)) {
        logger.error(`Raw data directory not found: ${rawDir}`);
        process.exit(1);
    }

    const files = fs
        .readdirSync(rawDir)
        .filter((f) => f.endsWith(".csv"))
        .sort() // Simple alphabetical sort works for ISO timestamps
        .reverse();

    if (files.length === 0) {
        logger.error("No CSV files found in lib/seeder/raw");
        process.exit(1);
    }

    const latestFile = path.join(rawDir, files[0]);
    logger.info(`Using latest data: ${files[0]}`);

    try {
        await importCsv(latestFile);
        logger.success("Seeding process finished successfully.");
    } catch (error) {
        logger.error("Seeding failed!", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
