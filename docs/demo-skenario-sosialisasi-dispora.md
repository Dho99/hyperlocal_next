# Skenario Demo Sosialisasi & Workshop

## SAFAR — Priangan Halal · Dispora Tasikmalaya

| Item | Detail |
| --- | --- |
| Nama dokumen | Skenario Demo Terstruktur (dua peran) |
| Acara | Sosialisasi & workshop bersama Dispora Tasikmalaya |
| Audiens | Kabid Dispora, staf dinas, stakeholder pariwisata & halal |
| Tujuan pertemuan awal | Menyepakati jadwal workshop dengan stakeholder |
| Durasi demo | 40 menit (31 menit demo + 9 menit diskusi) |
| Versi | 1.0 |
| Status | Siap diuji (dry run) |
| Basis fitur | Repository `hyperlocal_next`, branch `development` |
| Dokumen terkait | `docs/SAFAR.md`, `docs/feasibility-study-teknis-safar.md`, `docs/aces-h-specification.md` |

> Catatan keamanan: dokumen ini **tidak** memuat kredensial, token, `DATABASE_URL`, atau data pribadi. Akun demo disiapkan terpisah oleh penanggung jawab teknis (lihat §13).

---

## 1. Tujuan dokumen

Dokumen ini mengubah rencana sosialisasi menjadi **naskah demo yang bisa dijalankan tanpa improvisasi**. Isinya:

1. Urutan demo per menit beserta pembicara.
2. Aksi klik-per-klik untuk dua peran: **pengunjung** dan **operator/admin dinas**.
3. Kalimat narasi inti yang harus disampaikan di tiap segmen.
4. Daftar fitur yang benar-benar berjalan vs yang perlu dijelaskan sebagai simulasi.
5. Rencana cadangan bila jaringan, AI, atau data demo bermasalah.

## 2. Hasil yang ingin dicapai

Setelah demo, audiens diharapkan memahami tiga hal:

| # | Pesan kunci | Bukti yang ditunjukkan |
| --- | --- | --- |
| 1 | Sistem bukan sekadar katalog, tapi **alur kerja dinas** dari data mentah → validasi → publikasi → pemantauan | Validasi destinasi + dashboard + statistik |
| 2 | **Masyarakat ikut mengawasi kualitas data** | Penilaian pengunjung + laporan masalah |
| 3 | Dinas memegang **data resmi dan dapat diekspor** untuk kebutuhan laporan | Export CSV/Excel/PDF + skor ACES-H |

## 3. Ruang lingkup demo

### 3.1 Yang didemokan

| Peran | Cakupan wajib |
| --- | --- |
| Pengunjung | Rekomendasi berbasis AI, melihat detail destinasi, memberi penilaian (survey), mengirim laporan/feedback |
| Operator/Admin Dinas | Dashboard, data master (area cakupan, destinasi, fasilitas, UMKM), validasi awal, pemantauan statistik, export Excel/PDF, rekomendasi berbasis aturan |

### 3.2 Yang **tidak** didemokan (sengaja)

| Item | Alasan | Bila ditanya |
| --- | --- | --- |
| Import data Excel massal (`/import`) | Berisiko mengubah data live saat acara | Sebut sebagai fitur pendukung, tunjukkan setelah acara |
| Pengaturan sistem (`/settings`) | Tidak relevan untuk audiens | Jelaskan singkat |
| Laporan lama tanpa target (orphan) | Akan tampil "Data tidak ditemukan" | Jangan dibuka saat demo |
| Login/registrasi pengunjung dari nol | Memakan waktu | Gunakan akun demo yang sudah siap |
| Pengelolaan akun & role | Di luar topik sosialisasi | Tawarkan sesi terpisah |

## 4. Peserta & pembagian peran

| Peran | Jumlah | Tugas |
| --- | --- | --- |
| Narator / pembicara utama | 1 | Membuka, menjelaskan nilai, menjaga waktu |
| Demo driver (pengunjung) | 1 | Menjalankan alur sisi publik |
| Operator admin | 1 | Menjalankan alur dinas |
| Timekeeper | 1 | Memberi isyarat waktu tiap segmen |
| Penanggung jawab teknis | 1 | Jaringan, akun, data, cadangan rekaman |

Minimal 2 orang bila tim kecil: narator sekaligus driver pengunjung, satu operator admin. **Jangan** satu orang menjalankan semuanya — presentasi jadi lambat dan rawan salah klik.

## 5. Prasyarat

### 5.1 Teknis

- [ ] Aplikasi berjalan di environment yang disepakati (disarankan **staging**, bukan data produksi sensitif).
- [ ] Dua browser profile terpisah: **Profil A = pengunjung**, **Profil B = admin** (agar sesi tidak saling menimpa).
- [ ] Kedua profil sudah login sebelum acara dimulai.
- [ ] Koneksi internet stabil + hotspot cadangan.
- [ ] Zoom browser 100%, resolusi layar proyektor diuji (minimal 1366×768).
- [ ] Notifikasi desktop & tab pribadi ditutup.
- [ ] Data demo sudah di-seed dan **tidak** berubah sejak gladi.

### 5.2 Data minimum yang harus tersedia

| Data | Jumlah minimum | Dipakai untuk |
| --- | --- | --- |
| Area cakupan | 2–3 | Demo master data + filter |
| Destinasi terbit dengan bukti foto | 5–8 | Rekomendasi AI, katalog, statistik |
| Destinasi menunggu validasi | 2 | Demo antrean validasi |
| UMKM menunggu validasi | 2 | Demo validasi UMKM |
| Fasilitas halal | 5–8 | Master data fasilitas |
| Laporan pengunjung berstatus `PENDING` | 1–2 | Demo penanganan laporan |
| Penginapan | 2–3 | Sekilas master data |

Syarat penting: **destinasi yang dipakai untuk rekomendasi AI harus sudah tayang** dan punya nama/kategori yang mudah dikenali agar hasil AI terasa relevan.

## 6. Klasifikasi fitur: nyata, berbasis aturan, atau simulasi

Bagian ini wajib dipahami tim agar tidak salah klaim di depan dinas.

| Fitur | Cara kerja sebenarnya | Label saat demo |
| --- | --- | --- |
| Rekomendasi AI pencarian | LLM (Groq) memahami intent → mengarahkan ke hasil pencarian/itinerary. **Ada fallback deterministik** bila LLM gagal, jadi demo tetap jalan | "Rekomendasi berbasis AI, dengan cadangan aturan" |
| Itinerary otomatis | Disusun dari kandidat destinasi + intent AI, divalidasi terhadap data nyata | "Rekomendasi AI yang dibatasi data resmi" |
| Penilaian pengunjung (survey) | Skor per indikator ACES-H, digabung dua arah dengan nilai resmi dinas | "Penilaian masyarakat, bukan menggantikan nilai dinas" |
| Laporan pengunjung | Masuk antrean admin, status `PENDING → INVESTIGATING → RESOLVED/REJECTED` | "Kanal pengaduan data" |
| Skor ACES-H dua arah | `round(rata-rata(nilai admin + seluruh nilai pengunjung yang tidak disembunyikan))` per indikator | "Nilai resmi + suara publik, dirata-rata" |
| Validasi awal dinas | Admin memeriksa bukti, memberi skor resmi, menyetujui/menolak | "Validasi berbasis bukti" |
| Rekomendasi tindakan admin | **Rule-based**, bukan AI generatif: memicu dari gap indikator, bukti kurang, data belum lengkap | "Rekomendasi berbasis aturan" |
| Export laporan | CSV, Excel (xlsx), PDF dibuat di sisi klien | "Export siap pakai" |
| Statistik | Agregasi dari data nyata (kunjungan, distribusi, ranking, tren) | "Data nyata, bukan angka contoh" |

Aturan bicara: **jangan menyebut "AI" untuk menu rekomendasi admin.** Sebut "rekomendasi berbasis aturan/indikator".

## 7. Rundown 40 menit

| Menit | Segmen | Aktor | Fitur | Pesan inti |
| ---: | --- | --- | --- | --- |
| 0–3 | Pembukaan | Narator | — | Masalah: info wisata halal tersebar & sulit diverifikasi |
| 3–5 | Gambaran sistem | Narator | Peta fitur di slide | Dua sisi: publik & dinas |
| 5–13 | Skenario pengunjung | Driver | AI, detail destinasi, survey, laporan | Masyarakat terbantu sekaligus ikut mengawasi |
| 13–15 | Jeda transisi | Narator | Ganti profil admin | "Sekarang sisi dinas" |
| 15–19 | Dashboard & data master | Operator | `/dashboard`, area cakupan, destinasi, fasilitas, UMKM | Dinas pemilik data |
| 19–24 | Validasi awal | Operator | `/validasi/destinasi` + `/validasi/umkm` | Validasi berbasis bukti |
| 24–28 | Statistik & export | Operator | `/statistics`, `/laporan` | Monitoring + laporan siap kirim |
| 28–31 | Rekomendasi aturan & laporan masuk | Operator | `/rekomendasi`, `/reports` | Sistem menyarankan tindakan |
| 31–40 | Diskusi & penutup | Narator + semua | — | Jadwal workshop, stakeholder, kebutuhan data |

Jika waktu molor: potong **validasi UMKM** dan **master data penginapan**. Jangan potong segmen AI atau validasi destinasi.

---

## 8. Naskah Skenario A — Pengunjung (8 menit)

### A1. Rekomendasi berbasis AI (2,5 menit)

**Buka:** beranda publik.

**Aksi:**
1. Ketik di kolom pencarian, contoh: `wisata halal ramah keluarga di Tasikmalaya`.
2. Tekan Enter, tunggu proses analisis.
3. Tunjukkan halaman hasil (`/explore`) dan jelaskan bahwa sistem memahami **maksud** pencarian, bukan hanya mencocokkan kata.
4. Ulangi sekali dengan permintaan itinerary, contoh: `rencana 1 hari kuliner halal dan wisata alam`.

**Narasi:**
> "Pengunjung tidak perlu tahu nama destinasi. Cukup tulis kebutuhan. Sistem menerjemahkan maksud tersebut menjadi daftar destinasi yang datanya sudah divalidasi dinas."

**Hasil yang diharapkan:** hasil relevan, muncul nama destinasi nyata dari data demo. Jika AI gagal, sistem otomatis memakai pencarian cadangan — hasil tetap muncul.

**Jebakan:** jangan memakai kata kueri yang terlalu umum ("wisata") karena hasil bisa terasa tidak fokus.

### A2. Melihat detail destinasi (2 menit)

**Aksi:**
1. Klik satu destinasi dari hasil.
2. Tunjukkan bagian: foto, fasilitas halal, skor ACES-H, UMKM sekitar, peta.
3. Sorot skor ACES-H dan jelaskan artinya secara singkat.

**Narasi:**
> "Setiap destinasi punya skor keterpenuhan halal yang bisa dipertanggungjawabkan per indikator, bukan sekadar label 'halal'."

### A3. Memberi penilaian (2 menit)

**Aksi:**
1. Klik tombol survey/penilaian pada halaman destinasi.
2. Isi nilai beberapa indikator + komentar singkat.
3. Kirim, tunjukkan notifikasi berhasil.

**Narasi:**
> "Pengunjung yang sudah mengalami langsung bisa menilai. Nilai mereka **tidak menimpa** nilai resmi dinas — keduanya dirata-rata per indikator. Nilai dinas tetap menjadi acuan utama."

**Prasyarat:** survey memerlukan **login pengunjung**. Pastikan Profil A sudah login sebelum naik ke panggung.

### A4. Mengirim laporan (1,5 menit)

**Aksi:**
1. Klik tombol **Laporkan** pada halaman destinasi.
2. Pilih alasan (mis. fasilitas tidak sesuai), isi deskripsi.
3. Kirim.

**Narasi:**
> "Kalau pengunjung menemukan data yang tidak sesuai, mereka bisa melapor. Laporan ini masuk ke meja dinas, bukan hilang di kolom komentar."

**Catatan teknis:** laporan dapat dikirim tanpa login; bila login, laporan tertaut ke akun. Ini poin bagus untuk disampaikan: **warga tidak dipaksa mendaftar untuk melapor**.

---

## 9. Naskah Skenario B — Operator/Admin Dinas (16 menit)

### B1. Dashboard (2 menit)

**Buka:** `/dashboard` lalu `/dashboard/acesh`.

**Tunjukkan:** KPI utama, kondisi data, ringkasan skor ACES-H.

**Narasi:**
> "Begitu dinas masuk, terlihat kondisi data hari ini: berapa destinasi terbit, berapa menunggu validasi, bagaimana kualitas datanya."

### B2. Data master (3 menit)

Urutan yang disarankan — dari yang paling mudah dipahami:

1. **`/coverage-areas`** — "dinas menentukan wilayah kerja; semua data terikat ke area."
2. **`/destinations`** — tunjukkan tabel, status terbit/draf, dan buka satu data. **Jangan** simpan perubahan saat demo kecuali sudah disiapkan.
3. **`/facilities`** — "fasilitas halal adalah kamus bersama; dipakai destinasi, UMKM, dan penginapan."
4. **`/umkms`** — tunjukkan daftar UMKM dan status sertifikasi halal.

**Narasi:**
> "Semua modul memakai kamus data yang sama. Tidak ada penulisan ganda, dan tidak ada istilah yang berbeda antar halaman."

**Aturan aman:** saat demo, gunakan tombol **Batal** setelah membuka form. Perubahan data hanya dilakukan pada data yang memang disiapkan untuk demo.

### B3. Validasi awal dinas (5 menit)

**Buka:** `/validasi/destinasi`.

**Aksi:**
1. Pilih satu destinasi berstatus menunggu validasi.
2. Buka detail, tunjukkan **bukti unggahan** (foto) dan metadata.
3. Beri skor resmi pada beberapa indikator.
4. Setujui atau minta revisi.

Lalu singkat ke `/validasi/umkm`:
5. Tunjukkan bahwa UMKM memakai **pilihan fasilitas halal (checkbox)** dan **sertifikasi halal**, tanpa unggah bukti foto.

**Narasi:**
> "Validasi bukan sekadar menekan tombol setuju. Ada bukti, ada penilaian per indikator, dan ada jejak siapa yang menilai. Untuk UMKM, pendekatannya lebih ringan: cukup fasilitas dan sertifikasi."

**Jangan didemokan:** unggah bukti baru dengan validasi GPS/EXIF waktu — rawan gagal di ruangan tertutup. Cukup buka bukti yang **sudah ada**.

### B4. Statistik (2 menit)

**Buka:** `/statistics`.

**Tunjukkan:** kartu KPI, distribusi kategori, ranking, tren kunjungan, dan peta.

**Narasi:**
> "Ini yang dipakai dinas untuk melihat dampak: destinasi mana yang ramai, kategori apa yang kurang, tren naik atau turun."

### B5. Export laporan (2 menit)

**Buka:** `/laporan`.

**Aksi:**
1. Pilih filter (mis. kategori/area).
2. Klik **Export Excel** → tunjukkan file terunduh.
3. Klik **Export PDF** → tunjukkan pratinjau.

**Narasi:**
> "Laporan untuk rapat atau pengajuan anggaran bisa dibuat langsung, tanpa rekap manual."

**Siapkan:** file hasil export sebagai cadangan bila unduhan gagal di laptop acara.

### B6. Rekomendasi aturan & laporan masuk (2 menit)

**Buka:** `/rekomendasi`.

**Tunjukkan:** daftar rekomendasi tindakan yang muncul dari kondisi data (indikator lemah, bukti kurang, data belum lengkap).

**Narasi:**
> "Sistem tidak hanya menampilkan data, tapi menunjukkan prioritas: bagian mana yang perlu dibenahi lebih dulu. Ini berbasis aturan indikator, sehingga alasannya bisa dijelaskan."

Lalu **`/reports`** (Kelola Laporan):
1. Buka laporan yang baru dikirim di Segmen A4.
2. Tunjukkan nama target laporan terbaca jelas.
3. Ubah status `PENDING → INVESTIGATING`, lalu `RESOLVED`.

**Narasi:**
> "Laporan warga punya alur status yang jelas, dan dinas bisa menutupnya dengan tanggung jawab."

---

## 10. Poin bicara untuk Dispora

| Kekhawatiran yang biasa muncul | Jawaban ringkas |
| --- | --- |
| "Datanya dari siapa?" | Data masuk lewat dinas, divalidasi dinas, dan skor resmi dipegang dinas |
| "Kalau warga memberi nilai sembarangan?" | Nilai warga dirata-rata, tidak menimpa nilai resmi; ada moderasi |
| "Apakah ini menggantikan tugas dinas?" | Tidak. Ini alat bantu verifikasi, pemantauan, dan pelaporan |
| "Apakah bisa dipakai untuk laporan resmi?" | Ya, export CSV/Excel/PDF dengan filter |
| "Siapa yang merawat data?" | Perlu kesepakatan peran: operator data, verifikator, pimpinan |
| "Bagaimana keberlanjutan setelah acara?" | Usulan: pilot terbatas pada 1–2 area cakupan, lalu evaluasi |

## 11. Rencana cadangan (fallback)

| Gangguan | Tanda | Tindakan | Aset cadangan |
| --- | --- | --- | --- |
| Internet putus | Halaman gagal memuat | Beralih ke hotspot; jika tetap gagal, jalankan mode offline/rekaman | Rekaman layar 5 menit |
| AI lambat/gagal | Loading lama / hasil generik | Jelaskan fallback yang aktif, lanjut ke hasil pencarian | Tangkapan layar hasil ideal |
| Login bermasalah | Survey tidak bisa dibuka | Gunakan profil yang sudah login; jika gagal, lewati A3 dan kembali di akhir | Rekaman alur survey |
| Data demo berubah | Daftar kosong / status aneh | Jangan memperbaiki di panggung; lanjut ke segmen berikut | Dump data & screenshot |
| Export gagal | File tidak terunduh | Tunjukkan file hasil export yang disiapkan | Folder `demo-assets/` |
| Proyektor bermasalah | Teks tidak terbaca | Perbesar zoom, pindah ke layar laptop | PDF ringkasan 2 halaman |

Prinsip: **jangan debug di panggung.** Jika satu segmen gagal lebih dari 30 detik, pindah ke cadangan.

## 12. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Demo terasa seperti "jualan fitur" | Dinas tidak melihat relevansi | Selalu kaitkan fitur ke tugas dinas |
| Waktu molor | Diskusi jadwal workshop terpotong | Timekeeper aktif; siap potong 2 segmen |
| Perubahan data tak sengaja | Data demo rusak | Hanya gunakan tombol Batal; snapshot DB sebelum acara |
| Salah menyebut AI untuk rules | Kredibilitas turun | Ikuti tabel §6 |
| Menampilkan data sensitif | Masalah etika/keamanan | Data demo saja; tutup tab pribadi |
| Laporan demo tidak muncul di admin | Alur terputus | Kirim laporan uji 10 menit sebelum acara, atau gunakan yang sudah ada |

## 13. Checklist

### H-3 (tiga hari sebelum)

- [ ] Environment demo ditentukan dan dapat diakses dari lokasi acara.
- [ ] Data demo di-seed dan dibekukan (snapshot DB).
- [ ] Akun demo pengunjung & admin dibuat dan diuji.
- [ ] Daftar destinasi/UMKM yang dipakai demo disepakati.
- [ ] File export cadangan (CSV/Excel/PDF) disiapkan.
- [ ] Rekaman layar cadangan direkam.

### H-1

- [ ] Gladi penuh 40 menit dengan timekeeper.
- [ ] Uji di jaringan yang berbeda dari kantor.
- [ ] Uji tampilan di proyektor/resolusi rendah.
- [ ] Cek ulang antrean validasi & laporan demo.
- [ ] Pastikan tidak ada laporan orphan di daftar yang akan dibuka.

### Hari-H (30 menit sebelum)

- [ ] Dua profil browser siap & login.
- [ ] Notifikasi dimatikan.
- [ ] Hotspot cadangan aktif.
- [ ] Kirim 1 laporan uji, pastikan muncul di `/reports`.
- [ ] Buka tab yang akan dipakai sesuai urutan rundown (jangan membuka tab baru di panggung).
- [ ] Timekeeper mengaktifkan timer.

### Pasca-acara

- [ ] Catat pertanyaan yang belum terjawab.
- [ ] Hitung mundur jadwal workshop.
- [ ] Reset data demo bila environment dipakai lagi.
- [ ] Simpan rekaman & materi presentasi ke folder tim.

## 14. Gladi (dry run)

Lakukan **dua kali**:

1. **Gladi teknis** — tanpa audiens, fokus pada klik dan waktu. Catat tiap segmen yang melebihi batas.
2. **Gladi naratif** — satu orang berpura-pura menjadi Kabid dan mengajukan pertanyaan sulit.

Kriteria lulus: seluruh alur selesai ≤ 31 menit tanpa debug, dan setiap segmen punya cadangan.

---

## Lampiran A — Peta rute demo

| Rute | Fungsi | Segmen |
| --- | --- | --- |
| `/` | Beranda + pencarian | A1 |
| `/explore` | Hasil rekomendasi/pencarian | A1 |
| `/destinasi/[id]` | Detail destinasi (menerima id/slug) | A2–A4 |
| `/itinerary-recommendation` | Rencana perjalanan | A1 (opsional) |
| `/dashboard` | Ringkasan admin | B1 |
| `/dashboard/acesh` | Dashboard ACES-H | B1 |
| `/coverage-areas` | Master area cakupan | B2 |
| `/destinations` | Master destinasi | B2 |
| `/facilities` | Master fasilitas halal | B2 |
| `/umkms` | Master UMKM | B2 |
| `/accommodations` | Master penginapan | B2 (opsional) |
| `/validasi/destinasi` | Antrean validasi destinasi | B3 |
| `/validasi/umkm` | Antrean validasi UMKM | B3 |
| `/validasi/penginapan` | Antrean validasi penginapan | B3 (opsional) |
| `/statistics` | Statistik & tren | B4 |
| `/laporan` | Export CSV/Excel/PDF | B5 |
| `/rekomendasi` | Rekomendasi berbasis aturan | B6 |
| `/reports` | Kelola laporan pengunjung | B6 |

## Lampiran B — Dua menu laporan yang mudah tertukar

| Menu | Nama di UI | Isi | Dipakai untuk |
| --- | --- | --- | --- |
| `/reports` | **Kelola Laporan** | Laporan/feedback pengunjung | Menanggapi laporan warga |
| `/laporan` | **Generate Laporan** | Export data destinasi/UMKM/akomodasi | Laporan dinas |

Sebutkan perbedaan ini **sebelum** membuka salah satunya, agar audiens tidak bingung.

## Lampiran C — Istilah yang perlu diterjemahkan

| Istilah | Penjelasan untuk audiens |
| --- | --- |
| ACES-H | Rangkaian indikator penilaian kesiapan halal sebuah destinasi |
| Skor dua arah | Nilai resmi dinas dirata-rata dengan nilai pengunjung per indikator |
| Evidence confidence | Tingkat keyakinan bukti yang diunggah |
| Rule-based recommendation | Saran tindakan yang muncul dari aturan indikator, bukan tebakan AI |
| Validasi awal | Pemeriksaan dan pemberian nilai resmi oleh dinas sebelum data tayang |

## Lampiran D — Antisipasi pertanyaan

1. **"Apakah data lama bisa diimpor?"** Ya, ada modul import; didemokan terpisah agar data acara tidak berubah.
2. **"Bisakah satu destinasi punya banyak foto?"** Ya, dan bukti divalidasi lokasi/waktu unggah.
3. **"Apakah pengunjung harus daftar?"** Untuk menilai ya; untuk melapor tidak.
4. **"Siapa yang boleh mengubah skor resmi?"** Hanya admin/dinas.
5. **"Apakah skor pengunjung bisa disalahgunakan?"** Ada moderasi; nilai yang disembunyikan tidak dihitung.
6. **"Apakah bisa diakses lewat HP?"** Ya, antarmuka responsif dan mendukung mode PWA.
7. **"Bagaimana biaya operasionalnya?"** Jelaskan komponen hosting, database, dan AI; sampaikan sebagai bahan studi lanjut, bukan angka final.
8. **"Kapan bisa mulai dipakai?"** Bergantung kesepakatan pilot, ketersediaan data, dan penunjukan operator.

## Lampiran E — Aturan tampil aman

- Jangan membuka `/settings`, file `.env`, log server, atau terminal di layar proyektor.
- Jangan menampilkan email pribadi, nomor telepon warga, atau isi laporan sensitif.
- Jangan menulis kredensial di slide, dokumen ini, atau chat.
- Gunakan akun demo dengan nama yang jelas (mis. "Demo Pengunjung", "Operator Dinas").
