import { prisma } from "../../lib/prisma";
import { cleanString, createSlug, parseCoordinate, readExcelSheet } from "./_utils";

export async function importFacilities() {
  console.log("--> Importing Halal Facilities (Tempat Ibadah & Toilet Wudhu)...");

  // Load destinations from DB to get IDs
  const destinations = await prisma.destination.findMany({
    select: { id: true, name: true, slug: true },
  });
  const destMap = new Map<string, string>();
  for (const d of destinations) {
    destMap.set(d.name.toLowerCase().trim(), d.id);
    destMap.set(d.slug, d.id);
  }

  // 1. Tempat Ibadah
  const ibadahAmenity = await readExcelSheet("Amenity.xlsx", "Tempat_Ibadah");
  const ibadahKoordinat = await readExcelSheet("Koordinat.xlsx", "Tempat_Ibadah");
  const ibadahRows = [...ibadahAmenity, ...ibadahKoordinat];

  let facilityCount = 0;
  let relCount = 0;

  for (const row of ibadahRows) {
    const destName = cleanString(row["Destinasi"]);
    const facilityName = cleanString(row["Nama Fasilitas"]);
    if (!facilityName) continue;

    const lat = parseCoordinate(row["Lat Fasilitas"]);
    const lon = parseCoordinate(row["Lon Fasilitas"]);
    const jarakKm = parseCoordinate(row["Jarak Lurus (km)"]);
    const urlSumber = cleanString(row["URL Sumber"]);
    const catatan = cleanString(row["Catatan"]);

    // Find destination
    let destinationId: string | undefined;
    if (destName) {
      destinationId = destMap.get(destName.toLowerCase().trim()) || destMap.get(createSlug(destName));
    }

    // Upsert HalalFacility
    let facility = await prisma.halalFacility.findFirst({
      where: { name: facilityName },
    });

    if (!facility) {
      facility = await prisma.halalFacility.create({
        data: {
          name: facilityName,
          facilityType: "ibadah",
          latitude: lat,
          longitude: lon,
          description: `Fasilitas ibadah terverifikasi dinas. ${catatan || ""}`.trim(),
          externalSource: urlSumber || "Dinas Pariwisata",
          weight: 25,
          maxDistance: 2.0,
        },
      });
      facilityCount++;
    } else if (lat && lon && !facility.latitude) {
      facility = await prisma.halalFacility.update({
        where: { id: facility.id },
        data: {
          latitude: lat,
          longitude: lon,
          description: `Fasilitas ibadah terverifikasi dinas. ${catatan || ""}`.trim(),
        },
      });
    }

    // Connect to Destination
    if (destinationId && facility) {
      const distanceMeters = jarakKm ? Math.round(jarakKm * 1000) : (lat && lon ? 200 : null);
      await prisma.destinationHalalFacility.upsert({
        where: {
          destinationId_facilityId: {
            destinationId,
            facilityId: facility.id,
          },
        },
        update: {
          name: facilityName,
          latitude: lat ? Number(lat) : null,
          longitude: lon ? Number(lon) : null,
          distanceMeters,
          travelMode: "WALKING",
        },
        create: {
          destinationId,
          facilityId: facility.id,
          name: facilityName,
          latitude: lat ? Number(lat) : null,
          longitude: lon ? Number(lon) : null,
          distanceMeters,
          travelMode: "WALKING",
        },
      });
      relCount++;
    }
  }

  // 2. Toilet & Wudhu
  const toiletAmenity = await readExcelSheet("Amenity.xlsx", "Toilet_Wudhu");
  const toiletKoordinat = await readExcelSheet("Koordinat.xlsx", "Toilet_Wudhu");
  const toiletRows = [...toiletAmenity, ...toiletKoordinat];

  for (const row of toiletRows) {
    const destName = cleanString(row["Destinasi"]);
    const unitName = cleanString(row["Nama/Unit"]);
    if (!unitName) continue;

    const fullFacilityName = `${unitName}${destName ? ` - ${destName}` : ""}`;
    const urlSumber = cleanString(row["URL Sumber"]);
    const catatan = cleanString(row["Catatan"]);
    const aksesibilitas = cleanString(row["Aksesibilitas"]);

    let destinationId: string | undefined;
    if (destName) {
      destinationId = destMap.get(destName.toLowerCase().trim()) || destMap.get(createSlug(destName));
    }

    let facility = await prisma.halalFacility.findFirst({
      where: { name: fullFacilityName },
    });

    if (!facility) {
      facility = await prisma.halalFacility.create({
        data: {
          name: fullFacilityName,
          facilityType: "sanitasi",
          description: `Fasilitas sanitasi & wudhu terverifikasi dinas. ${aksesibilitas || ""} ${catatan || ""}`.trim(),
          externalSource: urlSumber || "Dinas Pariwisata",
          weight: 20,
          maxDistance: 0.5,
        },
      });
      facilityCount++;
    }

    if (destinationId && facility) {
      await prisma.destinationHalalFacility.upsert({
        where: {
          destinationId_facilityId: {
            destinationId,
            facilityId: facility.id,
          },
        },
        update: {
          name: fullFacilityName,
          distanceMeters: 50,
          travelMode: "WALKING",
        },
        create: {
          destinationId,
          facilityId: facility.id,
          name: fullFacilityName,
          distanceMeters: 50,
          travelMode: "WALKING",
        },
      });
      relCount++;
    }
  }

  console.log(`  ✓ HalalFacilities created/updated: ${facilityCount}`);
  console.log(`  ✓ DestinationHalalFacility relations upserted: ${relCount}`);
}
