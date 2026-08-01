# ACES-H — Pengujian

## Cara Menjalankan

```bash
npm test              # semua tes (unit + integration)
npm run test:acesh    # hanya unit (tests/unit)
npm run test:integration  # hanya integration (tests/integration)
npm run coverage      # coverage dengan vitest + @vitest/coverage-v8 (jika ada)
```

## Strategi

- **Unit tests** (`tests/unit`) — murni, tanpa DB:
  formula, pembulatan, batas klasifikasi, derivasi evidence, reachability,
  estimasi waktu tempuh (dengan `fetchFn` injeksi untuk OSRM).
- **Integration tests** (`tests/integration`) — mem-mock modul `@/lib/prisma`
  (`tests/integration/mock-prisma.ts`) sehingga tidak butuh database;
  menguji pipeline snapshot, anti-duplikasi, PENDING ≠ VERIFIED, API publik,
  dan fallback skor traveller.

## Daftar Tes (60 total)

### Unit (46)

| File | Pokok bahasan |
|---|---|
| `indicator.test.ts` | round1/round3, clamp, ×25, validasi 0–4, group score (76,3 / 68,8 / 56,3) |
| `aces-readiness-service.test.ts` | dimensi ACES + total resmi 66,8, normalisasi bobot |
| `hyperlocal-scoring-service.test.ts` | dimensi Hyperlocal + total resmi 59,5 |
| `evidence-confidence-service.test.ts` | confidence 69, factor 0,907, batas 0,70–1,00, tolak NaN/out-of-range |
| `acesh-classification-service.test.ts` | seluruh batas: 39,9 / 40 / 54,9 / 55 / 69,9 / 70 / 84,9 / 85 / 100 |
| `acesh-scoring-service.test.ts` | simulasi resmi 58,2 end-to-end + pembulatan base |
| `evidence-derivation.test.ts` | 6 komponen dari 20 rekaman engineered (70/75/70/65/70/60), threshold verifikasi |
| `reachability-config-service.test.ts` | checkReachability, normalisasi tipe |
| `travel-time-service.test.ts` | fallback ESTIMATION, ROUTING via OSRM mock, timeout/failure fallback |

### Integration (14)

| File | Pokok bahasan |
|---|---|
| `assessment-recalculation-service.test.ts` | snapshot resmi 58,2 → VERIFIED; anti-duplikasi upsert; PENDING → verifiedScore null; recalc saat evidence berubah; riwayat per penyimpanan |
| `public-score-service.test.ts` | traveller tidak pernah melihat verifiedScore saat PENDING; fallback legacy |
| `public-acesh-api.test.ts` | GET publik: VERIFIED vs PENDING, tidak ada evidence internal, 404 |

## Simulasi Resmi yang Dijaga

Setiap perubahan rumus harus tetap memenuhi:

```
ACES 66,8 · Hyperlocal 59,5 · Base 64,2 · Confidence 69,0
Factor 0,907 · Verified 58,2 · BERKEMBANG
```

Seed (`prisma/seed/aceshSeeder.ts`) membuat data yang menghasilkan
simulasi ini dan mencetaknya saat dijalankan.
