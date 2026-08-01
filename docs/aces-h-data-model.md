# ACES-H — Model Data & Migrasi

## Model Baru (`prisma/schema.prisma`)

### Enumerasi

| Enum | Nilai |
|---|---|
| `AceshIndicatorGroup` | ACCESS, COMMUNICATION, ENVIRONMENT, SERVICES, SPATIAL_ACCESSIBILITY, FUNCTIONAL_AVAILABILITY, HALAL_ASSURANCE, ECOSYSTEM_CONNECTIVITY, EMBEDDEDNESS_CONTINUITY |
| `AceshEvidenceType` | SOURCE, DOCUMENT, PHOTO, GEOLOCATION, MANAGEMENT_CONFIRMATION, FIELD_VALIDATION, OTHER |
| `AceshTravelMode` | WALKING, DRIVING, CYCLING |
| `AceshVerificationStatus` | PENDING, VERIFIED |

### `AceshIndicator` → `acesh_indicators`

Katalog indikator global (di-seed 27 baris). Kolom kunci: `code` (unique),
`group`, `weight`, `isActive`.

### `AceshIndicatorScore` → `acesh_indicator_scores`

Skor indikator per destinasi. `value` (0–4), `convertedScore` (0–100 = value×25),
`notes`, `assessedBy`, `assessedAt`.
**Anti-duplikasi:** `@@unique([destinationId, indicatorId])` — satu skor per
(indikator, destinasi); batch update memakai `upsert` pada komposit ini.

### `AceshEvidenceRecord` → `acesh_evidence_records`

Rekaman bukti per destinasi: tipe, sumber, skor reliabilitas, URL dokumen/foto,
koordinat, `managementConfirmed`, `fieldValidated`, `dataDate`, `validatedAt`,
`validatorId` → `User` (nullable, SetNull).

### `AceshAssessment` → `acesh_assessments`

Hasil perhitungan akhir per destinasi: semua komponen skor +
`verificationStatus`, `classification`, `calculationVersion`, `calculatedAt`.
**Anti-duplikasi:** `@@unique([destinationId])` (satu assessment per destinasi,
diperbarui dengan `upsert`).

### `AceshAssessmentHistory` → `acesh_assessment_history`

Snapshot setiap perhitungan (audit trail): komponen skor + `calculatedBy`,
`notes`, `calculatedAt`. Satu baris baru setiap kali
`calculateAndSaveAssessment` dipanggil.

### `ReachabilityConfig` → `reachability_configs`

Ambang jangkauan per tipe fasilitas (`facilityType` unique): jarak maks,
waktu tempuh maks, mode, aktif.

## Kolom Baru pada Model Lama

| Model | Kolom | Catatan |
|---|---|---|
| `HalalFacility` | `latitude`, `longitude` `Decimal(10,7)?` | untuk perhitungan jarak |
| `DestinationHalalFacility` | `distanceMeters?`, `travelMinutes?`, `travelMode?` | dihitung saat create/update destinasi |
| `DestinationHalalFacility` | `@@unique([destinationId, facilityId])` | deduplikasi relasi (migrasi menghapus duplikat yang ada) |
| `User` | relasi `aceshEvidenceValidations` | validator evidence |

## Migrasi

- Folder: `prisma/migrations/20260731210000_acesh_hyperlocal/`
- Berisi: `CREATE TYPE` × 4, `ALTER TABLE` × 2, `CREATE TABLE` × 6,
  `DELETE` deduplikasi sebelum `CREATE UNIQUE INDEX`.
- Sudah diaplikasikan ke database lokal (`npx prisma migrate deploy`).
- Untuk deploy Neon: jalankan `npx prisma migrate deploy` dengan
  `DATABASE_URL` menunjuk ke Neon (aktifkan URL Neon di `.env`).

## Hubungan (Ringkas)

```
Destination 1─N AceshIndicatorScore N─1 AceshIndicator
Destination 1─N AceshEvidenceRecord N─1 User (validator)
Destination 1─1 AceshAssessment
Destination 1─N AceshAssessmentHistory
ReachabilityConfig (global, by facilityType)
```
