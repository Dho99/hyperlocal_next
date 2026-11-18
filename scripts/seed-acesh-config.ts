/**
 * seed-acesh-config.ts
 * --------------------
 * Ensures the ACES-H scoring configuration exists with the official 1.0
 * defaults for all three layers (ACES readiness, hyperlocal, evidence).
 *
 * Safe to run repeatedly: an existing configuration is never overwritten.
 *
 * Usage:
 *   npm run seed:acesh-config
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { seedAceshScoringConfig } from "../prisma/seed/aceshConfigSeeder";

async function main() {
    await seedAceshScoringConfig();
}

main()
    .catch((error) => {
        console.error("Gagal menyiapkan konfigurasi ACES-H:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
