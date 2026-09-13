import { prisma } from "../../lib/prisma";
import { importCoverageAndCategories } from "./import-coverage-cat";
import { importDestinations } from "./import-destinations";
import { importAccommodations } from "./import-accommodations";
import { importFacilities } from "./import-facilities";
import { importUmkms } from "./import-umkms";
import { importOperationalHours } from "./import-hours";

async function validateAll() {
  await prisma.destination.updateMany({ data: { status: "APPROVED" as any } });
  await prisma.umkm.updateMany({ data: { validationStatus: "APPROVED" } });
  await prisma.accommodation.updateMany({ data: { validationStatus: "APPROVED" } });
  await prisma.halalValidation.updateMany({ data: { status: "APPROVED" as any } });
  await prisma.halalCertification.updateMany({ data: { status: "VALID" as any } });
  console.log("  ✓ All enum-status records validated (APPROVED/VALID)");
}

async function main() {
  console.log("=== START IMPORT PROCESS ===");
  const { coverageAreaId, categories } = await importCoverageAndCategories();
  await importDestinations(coverageAreaId, categories);
  await importAccommodations();
  await importFacilities();
  await importUmkms(coverageAreaId, categories);
  await importOperationalHours();
  await validateAll();
  console.log("=== IMPORT FINISHED ===");
}

main()
  .catch((e) => {
    console.error("IMPORT FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
