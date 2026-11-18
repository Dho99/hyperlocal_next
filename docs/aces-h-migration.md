# ACES-H — Panduan Migrasi & Deployment

## Ringkasan

ACES-H memperkenalkan 6 tabel baru, 4 enum, kolom baru pada 3 tabel lama,
dan satu unique index baru. Semua perubahan dibungkus dalam satu migrasi
Prisma: `20260731210000_acesh_hyperlocal`.

## Cara Menjalankan (Lokal — sudah selesai)

```bash
# 1. Pastikan .env mengarah ke DB lokal (baris aktif DATABASE_URL)
# 2. Terapkan migrasi
npx prisma migrate deploy

# 3. Regenerasi klien
npx prisma generate

# 4. Seed katalog + konfigurasi + demo assessment (opsional)
npm run seed:tourism        # CSV + katalog + config + demo ACES-H + akomodasi
npm run seed:acesh-config   # hanya konfigurasi 3 lapisan (create-if-missing)
```

Catatan: `npx prisma migrate dev` tidak dapat berjalan non-interaktif di
shell ini; gunakan `migrate deploy`.

## Konfigurasi ACES-H (3 lapisan)

Default resmi dibuat otomatis oleh:

1. Migrasi `20261118091000_seed_acesh_scoring_defaults` — berlaku untuk semua
   environment yang menjalankan `migrate deploy` (termasuk Neon).
2. `seedAceshScoringConfig()` — dipanggil dari `seedAceshCatalog()`
   (`seed:tourism` / `acesh:sample`), atau langsung via
   `npm run seed:acesh-config`.

Keduanya *create-if-missing*: baris `acesh_scoring_configs` yang sudah ada
tidak ditimpa, sehingga perubahan bobot dari halaman admin aman saat re-seed.
Setiap perhitungan menyimpan `weights_snapshot` di
`acesh_assessment_history` agar skor lama tetap reproducible.

## Deploy ke Neon (cloud)

1. Di `.env`, komentari URL lokal dan aktifkan URL Neon (line 17).
2. Jalankan migrasi terhadap Neon:
   ```bash
   npx prisma migrate deploy
   ```
3. Konfigurasi ACES-H sudah terisi oleh migrasi; untuk seed demo lengkap
   (opsional):
   ```bash
   npm run seed:tourism
   ```
4. Pastikan `OSRM_BASE_URL` dikosongkan bila tidak tersedia — sistem
   otomatis memakai estimasi haversine.

## Hal yang Harus Diketahui

- **P3015 / migrasi gagal:** folder migrasi harus diawali timestamp 14 digit.
  Folder liar seperti `prisma/migrations/-p` akan memicu error — hapus.
- **Deduplikasi:** migrasi menghapus duplikat
  `(destination_id, facility_id)` pada `destination_halal_facilities`
  sebelum membuat unique index.
- **Rollback:** belum dibuat otomatis; untuk rollback manual, drop tabel
  baru (`acesh_*`, `reachability_configs`) dan kolom baru
  (`distance_meters`, `travel_minutes`, `travel_mode`, `latitude`,
  `longitude` di `halal_facilities`), lalu hapus unique index.
- **Skor lama tidak dihapus:** kolom legacy (`halal_score`,
  `validated_score`, `admin_score`) dibiarkan; hanya tidak lagi menjadi
  skor utama untuk traveller.

## Verifikasi Setelah Migrasi

```bash
npx prisma migrate status        # semua migrasi applied
npm run test                     # 60 tes (unit + integration)
npm run lint                     # bebas error pada modul ACES-H
npx tsc --noEmit                 # tanpa error
```
