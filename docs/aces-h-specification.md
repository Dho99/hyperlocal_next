# ACES-H (ACES Hyperlocal) — Spesifikasi

> **Versi perhitungan:** `ACES-H-1.0`
> **Status:** Diimplementasikan penuh di SAFAR (admin, traveller, seed, test).

## Latar Belakang

Skor lama (GMTI ACES) hanya menilai 4 dimensi (Shariah, Access, Environment,
Communication) dari data administratif. ACES-H menilai kesiapan destinasi
wisata halal dari **9 kelompok indikator** yang mencakup ACES Readiness dan
**dimensi hiperlokal** (akses spasial, ketersediaan fungsional, jaminan halal,
konektivitas ekosistem, keterlekatan/keberlanjutan), lalu menggabungkannya
dengan **tingkat keyakinan bukti** (Evidence Confidence).

## Prinsip Non-Fungsional

1. **Traveller tidak pernah melihat skor yang belum terverifikasi sebagai
   "resmi".** `verifiedScore` hanya terisi ketika bukti mencukupi
   (confidence ≥ 60 dan minimal 1 rekaman evidence); jika belum, frontend
   menampilkan *base score* dengan label "Skor sementara".
2. **Tidak ada formula di sisi klien.** Semua perhitungan berjalan di
   server (`lib/services/acesh/`); klien hanya merender hasil API.
3. **Bobot wajib** (mandatory weights) — lihat di bawah; perubahan bobot
   harus melalui konfigurasi dan tidak boleh menyimpang dari total 100%.
4. **Satu assessment per destinasi** (`@@unique([destinationId])`);
   setiap perubahan data memicu `calculateAndSaveAssessment` yang menulis
   baris riwayat.
5. **Audit trail** penuh: `acesh_assessment_history` mencatat setiap
   snapshot perhitungan.

## Struktur Skor

```
Indicator (0–4) ──×25──▶ Skor indikator (0–100)
      │ (bobot dalam grup, dinormalisasi)
      ▼
Group score (0–100, round 1 desimal)
      │ × bobot dimensi (dijumlahkan, dinormalisasi 100%)
      ▼
ACES Readiness (4 dimensi)      Hyperlocal (5 dimensi)
   Access              20%        Spatial accessibility   30%
   Communication       15%        Functional availability 25%
   Environment         20%        Halal assurance         20%
   Services            45%        Ecosystem connectivity  15%
                                  Embeddedness continuity 10%
      │                                    │
      └────────── base ────────────────────┘
            base = 0,65 × ACES + 0,35 × Hyperlocal
      │
      ▼
Evidence Confidence (6 komponen) ──▶ factor = 0,70 + 0,30 × confidence/100
      ▼
verifiedScore = base × factor   (round 1 desimal)
      ▼
Klasifikasi 5 level (BELUM_SIAP … SANGAT_SIAP)
```

## Kebijakan Pembulatan (dikunci)

- `round1` di **setiap level**: grup → dimensi → ACES/Hyperlocal → base → verified.
- `round3` hanya untuk evidence factor.
- Base dihitung dari skor ACES/Hyperlocal **yang sudah dibulatkan**.

## Simulasi Resmi (harus direproduksi persis)

| Tahap | Nilai |
|---|---|
| Access (3,3,3; w 0,40/0,35/0,25) | 75,0 |
| Communication (2,2,2) | 50,0 |
| Environment (2,2,2) | 50,0 |
| Services (4,2,3) | 76,3 |
| **ACES Readiness** | **66,8** |
| Spatial (3,3,2) | 68,8 |
| Functional (2,2,2) | 50,0 |
| Halal assurance (2,3,2) | 58,8 |
| Ecosystem (3,2,2) | 60,0 |
| Embeddedness (3,3,0) | 56,3 |
| **Hyperlocal** | **59,5** |
| **Base** (0,65×66,8 + 0,35×59,5) | **64,2** |
| Confidence (70,75,70,65,70,60) | **69,0** |
| Factor (0,70 + 0,30×0,69) | **0,907** |
| **Verified** (64,2 × 0,907) | **58,2** |
| **Klasifikasi** | **BERKEMBANG** |

Simulasi ini dijadikan seed demo (`prisma/seed/aceshSeeder.ts`) dan
diuji ulang oleh `tests/unit` + `tests/integration`.

## Komponen Evidence Confidence

| Komponen | Bobot | Sumber |
|---|---|---|
| Source reliability | 15% | rerata `sourceReliabilityScore` |
| Document evidence | 20% | % rekaman ber-`documentUrl` |
| Photo + geolocation | 15% | % rekaman ber-`photoUrl` + koordinat |
| Management confirmation | 10% | % rekaman `managementConfirmed` |
| Field validation | 25% | % rekaman `fieldValidated` |
| Data freshness | 15% | rerata bucket umur data (≤90/180/365 hari → 100/75/50/25) |

Ambang verifikasi: `confidence ≥ 60` **dan** `≥ 1` rekaman evidence.

## Klasifikasi

| Rentang | Level |
|---|---|
| 85–100 | SANGAT_SIAP |
| 70–84,9 | SIAP |
| 55–69,9 | BERKEMBANG |
| 40–54,9 | PERLU_PENGEMBANGAN |
| 0–39,9 | BELUM_SIAP |

Saat PENDING, klasifikasi memakai base score; saat VERIFIED memakai
verified score.

## Rekayasa Jangkauan (Reachability)

Jarak/waktu tempuh fasilitas dihitung dari koordinat destinasi ke fasilitas:

- Estimasi haversine + kecepatan mode (WALKING 4,8 / CYCLING 15 / DRIVING 40 km/h)
  sebagai fallback; `source: "ESTIMATION"`.
- OSRM bila `OSRM_BASE_URL` tersedia; `source: "ROUTING"`.
- Ambang per tipe fasilitas dikonfigurasikan di tabel `reachability_configs`
  (default: masjid/musala 500 m jalan kaki; restoran/kuliner 15 menit;
  penginapan 30 menit berkendara). Radius pencarian "terdekat" di
  explore juga memakai konfigurasi `DESTINATION_NEARBY` (default 10 km).

## Interaksi dengan Sistem Lama

- Skor lama (`halalScore`, `validatedScore`, `adminScore`, `categoryScores`)
  **tetap ada** dan tidak dihapus, tetapi tidak lagi dijadikan skor utama
  pada permukaan traveller.
- Permukaan traveller menggunakan `publicDisplayScore()`: verified score bila
  VERIFIED, base score bila PENDING, fallback skor lama bila belum ada
  assessment.
- Dashboard lama tetap tampil; ditambahkan seksi "Kesiapan ACES-H".
