# ACES-H — Audit Trail Implementasi

Ringkasan keputusan dan jejak implementasi ACES-H di SAFAR.

## Keputusan Kunci

1. **Migrasi dibangun di lokal** (`localhost:5432/hyperlocaldb`) dan siap
   diaplikasikan ke Neon dengan `npx prisma migrate deploy`.
2. **Integration tests memakai mock Prisma** — tanpa database nyata.
3. **`verifiedScore` nullable**; hanya terisi saat VERIFIED. Traveller
   melihat base score berlabel "skor sementara" bila PENDING.
4. **Round1 di setiap level** (grup → dimensi → ACES/Hyperlocal → base →
   verified), factor round3, base dari skor yang sudah dibulatkan.
5. **Bobot wajib**: ACES 20/15/20/45 · Hyperlocal 30/25/20/15/10 ·
   Evidence 15/20/15/10/25/15 (dijaga `sumWeights` = 1,0).
6. **Skor lama tidak dihapus** — `halalScore`/`validatedScore`/`adminScore`
   tetap, hanya bukan lagi sumber utama untuk traveller.
7. **Tidak ada hardcode radius**: radius explore memakai
   `reachability_configs` (`DESTINATION_NEARBY`, default 10 km).
8. **Seed legacy (`facilityType` = `ibadah/kuliner/sanitasi`) tidak diubah**;
   pemetaan mode perjalanan dilakukan lewat `defaultTravelModeForType`
   (mengenali `IBADAH` sebagai WALKING).

## Jejak Perbaikan Selama Implementasi

| Masalah | Perbaikan |
|---|---|
| Folder migrasi liar `prisma/migrations/-p` → P3015 | Dihapus |
| Duplikat `(destination_id, facility_id)` di data lama | `DELETE` deduplikasi di dalam migrasi sebelum unique index |
| `prisma migrate dev` tidak jalan non-interaktif | Pakai `migrate deploy` |
| TypeScript error `AceshClassificationKey` | Re-export tipe |
| TypeScript error enum zod (`z.enum` vs generics) | `z.nativeEnum` via helper |
| `AceshAssessmentSnapshot.verifiedScore` tipe | `Omit<AceshScoringResult,"verifiedScore">` + nullable |
| Prisma client tidak ditemukan di skrip CJS | Generate path `lib/generated/prisma/client` |
| ReachabilityConfig tidak punya kolom `description` | Dihapus dari seed |
| Group score dibulatkan 76,25 → 76,3 | Dikunci sebagai kebijakan round1 per level; simulasi akhir tetap 66,8/59,5 |
| Boundary 90 hari pada freshness (seed vs unit test) | Test memakai `now + 60s`; integration fixture tanpa `validatedAt` agar deterministik |
| Lint `set-state-in-effect` pada tabs | Effect dijadikan async IIFE + cancel flag |
| Lint unused imports | Dibersihkan |
| `HalalFacility.type` tidak ada (types) | Pakai `facilityType` |

## Verifikasi Hasil (DB lokal, 2026-08-01)

```
[ACES-H SIMULASI] "Pantai Karang Tawulan" → ACES 66.8 | Hyperlocal 59.5 |
Dasar 64.2 | Confidence 69 | Faktor 0.907 | Terverifikasi 58.2 |
BERKEMBANG (VERIFIED)
```

Hasil verifikasi akhir (Fase 10, 2026-08-01):

| Pemeriksaan | Hasil |
|---|---|
| `npx tsc --noEmit` | ✅ bersih |
| `npm run lint` | ✅ 0 masalah di modul ACES-H (error tersisa hanya legacy) |
| `npm test` | ✅ 12 files / 60 tests |
| `npm run build` | ✅ compiled + semua route ter-generate |
| `npx prisma migrate status` | ✅ Database schema is up to date |
| DB check (`scratch/check-acesh.cjs`) | ✅ indikator 27, konfigurasi 8, assessment 58.2 BERKEMBANG VERIFIED, evidence 20 |

Keputusan tambahan Fase 10:

- `scratch/**` masuk eslint global ignores (folder skrip verifikasi
  sementara tidak di-lint).
- Script `npm run coverage` ditambahkan (`vitest run --coverage`).

## Status Fase

| Fase | Status |
|---|---|
| 0 Infra test (vitest, scripts, config) | ✅ |
| 1 Schema + migrasi + generate | ✅ |
| 2 Services skor + zod | ✅ |
| 3 API routes | ✅ |
| 4 Admin UI (6 tab) | ✅ |
| 5 Traveller UI | ✅ |
| 6 Dashboard | ✅ |
| 7 Seed (27 indikator + konfigurasi + simasi 58.2) | ✅ |
| 8 Automated tests (60 tes) | ✅ |
| 9 Docs | ✅ |
| 10 Verifikasi akhir | ✅ (tsc clean, lint ACES-H clean, build sukses, 60/60 tes, migrasi up-to-date, DB 58.2) |
