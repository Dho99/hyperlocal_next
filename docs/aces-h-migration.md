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
npm run seed:dev   # atau npx tsx prisma/seed.ts
```

Catatan: `npx prisma migrate dev` tidak dapat berjalan non-interaktif di
shell ini; gunakan `migrate deploy`.

## Deploy ke Neon (cloud)

1. Di `.env`, komentari URL lokal dan aktifkan URL Neon (line 17).
2. Jalankan migrasi terhadap Neon:
   ```bash
   npx prisma migrate deploy
   ```
3. Jalankan seed (opsional, data demo):
   ```bash
   npm run seed:dev
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
