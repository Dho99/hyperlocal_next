# ACES-H — Referensi API

Semua endpoint admin membutuhkan sesi admin (`auth.api.getSession` +
`role === "admin"`). Endpoint publik tidak.

## Admin — Katalog Indikator

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/admin/acesh/indicators` | Daftar indikator aktif (dengan jumlah skor) |
| POST | `/api/admin/acesh/indicators` | Buat indikator (schema `aceshIndicatorSchema`) |
| PATCH | `/api/admin/acesh/indicators/[id]` | Perbarui indikator |
| DELETE | `/api/admin/acesh/indicators/[id]` | Hapus indikator |

## Admin — Penilaian Destinasi

### GET `/api/admin/destinations/[id]/acesh-assessment`

Mengembalikan:

```json
{
  "data": {
    "assessment": { "acesScore", "hyperlocalScore", "baseScore",
                    "evidenceConfidenceScore", "evidenceFactor",
                    "verifiedScore", "classification",
                    "verificationStatus", "calculatedAt",
                    "calculationVersion" },
    "groupBreakdown": [ { "group", "label", "groupScore",
                          "dimensionWeight", "contribution" } ],
    "indicators": [ { "id", "code", "name", "description", "weight",
                      "group", "score": { "id", "value", "notes" } | null } ],
    "evidenceRecords": [ ... ],
    "history": [ ... ]
  }
}
```

`groupBreakdown` dihitung **di server** (klien tidak menjalankan formula).

### PUT `/api/admin/destinations/[id]/acesh-assessment`

Body: `{ "scores": [ { "indicatorId", "value" (0–4), "notes?" } ] }`
(maks 200 item, `aceshIndicatorScoreBatchSchema`).
Upsert per skor (`destinationId_indicatorId`), lalu
`calculateAndSaveAssessment` — respons berisi assessment terbaru.

### POST `/api/admin/destinations/[id]/acesh/recalculate`

Body opsional `{ "notes" }`. Memanggil ulang pipeline perhitungan.

## Admin — Evidence

| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/admin/destinations/[id]/evidence` | Buat evidence (memicu perhitungan ulang; `validatedAt` diisi bila `fieldValidated`) |
| PATCH | `/api/admin/evidence/[id]` | Perbarui evidence (status konfirmasi/validasi, dst; memicu perhitungan ulang) |
| DELETE | `/api/admin/evidence/[id]` | Hapus evidence (memicu perhitungan ulang) |

## Admin — Reachability

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/admin/reachability` | Daftar konfigurasi jangkauan |
| POST | `/api/admin/reachability` | Upsert konfigurasi (`reachabilityConfigSchema`, `facilityType` di-uppercase) |
| PATCH | `/api/admin/reachability/[id]` | Perbarui konfigurasi |
| DELETE | `/api/admin/reachability/[id]` | Hapus konfigurasi |

## Publik — Skor Traveller

### GET `/api/destinations/[id]/acesh`

```json
{
  "data": {
    "verifiedScore": 58.2 | null,
    "baseScore": 64.2,
    "acesScore": 66.8,
    "hyperlocalScore": 59.5,
    "evidenceConfidenceScore": 69.0,
    "evidenceFactor": 0.907,
    "classification": "BERKEMBANG",
    "verificationStatus": "PENDING" | "VERIFIED",
    "calculatedAt": "ISO",
    "calculationVersion": "ACES-H-1.0"
  }
}
```

- `verifiedScore` **null saat PENDING** — klien wajib menampilkan base score
  dengan label "skor sementara".
- Tidak pernah mengekspos detail evidence internal.
- 404 bila belum ada assessment.

## Endpoint Lama yang Diperbarui

| Endpoint | Perubahan |
|---|---|
| `GET/POST /api/explore` | Sorting & fallback pakai `publicDisplayScore` (ACES-H); radius "terdekat" dari `reachability_configs` (`DESTINATION_NEARBY`, default 10 km); respons menambah `aceshScore`, `aceshClassification`, `aceshVerificationStatus` |
| `POST /api/recommendations` | Kandidat & fallback diurutkan dengan skor ACES-H |
| `POST /api/assistant/route-finder` | Menghapus `orderBy: halalScore` (AI memilih dari kandidat) |
| `PUT /api/validations/[id]` | Setelah validasi destinasi, memicu `calculateAndSaveAssessment` |
| `PATCH/DELETE /api/destinations/[id]` (admin) | Menghitung `distanceMeters/travelMinutes/travelMode` fasilitas & memicu perhitungan ulang |
