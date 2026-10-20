# RencanaMampu

MVP aplikasi web untuk membantu tenaga kesehatan menemukan bagian rencana perawatan yang **sulit dijalankan keluarga** sebelum pasien pulang. Aplikasi memetakan tuntutan tugas terhadap kapasitas keluarga, menampilkan konflik beserta alasannya, lalu mencatat keputusan klinisi: menyesuaikan rencana atau menambah dukungan.

> **Alat bantu perencanaan, bukan alat klinis.** RencanaMampu tidak mengubah dosis, menyarankan terapi, atau menggantikan keputusan klinisi. Semua penyesuaian dicatat manual oleh klinisi.

## Cara menjalankan

Prototipe berupa HTML/CSS/JavaScript tanpa build step. Dua pilihan:

1. **Langsung**: buka `index.html` di peramban modern (Chrome, Edge, Safari, Firefox). Data tersimpan di `localStorage` peramban.
2. **Disarankan** (agar `localStorage` dan tautan keluarga berperilaku konsisten):

   ```bash
   cd <folder-proyek>
   python3 -m http.server 8080
   # buka http://localhost:8080
   ```

Halaman uji aturan: `http://localhost:8080/tests.html` (35 uji, tanpa server).

Tidak perlu `npm install`, database, atau kunci API.

## Peran demo

Gunakan menu **Peran (demo)** di kanan atas:

| Peran | Bisa melakukan |
|---|---|
| Perencana pemulangan | Mengisi profil kapasitas, mengelola tugas, melihat pemetaan, membuat tautan keluarga |
| Klinisi penanggung jawab | Semua di atas + mencatat keputusan konflik + umpan balik |
| Admin layanan | Mengubah ambang, mengaktifkan/menonaktifkan opsi, mengatur ulang data demo |

Pembatasan peran di UI adalah **simulasi alur**, bukan kontrol keamanan. Backend belum ada.

## Alur 15 menit

1. **Daftar pasien** → pilih pasien (10 keluarga fiktif).
2. **Profil kapasitas** — formulir percakapan 5 langkah, ± 5 menit, bisa disimpan sebagian (`Simpan & lanjutkan nanti`). Persetujuan dicatat lebih dulu.
3. **Tugas perawatan** — tambah dari 12 templat (insulin, luka, NGT, kontrol, diet, mobilisasi, dll.), lalu sesuaikan.
4. **Pemetaan** — matriks tugas × 7 dimensi, konflik diurutkan berdasarkan kritis tugas lalu keparahan, alasan + angka + `ruleId`.
5. **Keputusan klinisi** — rencana disesuaikan / dukungan ditambah / diterima dengan risiko / tidak bisa diselesaikan. Pemetaan dihitung ulang; muncul “sebelum vs sesudah”.
6. **Ringkasan keluarga** — satu halaman bahasa sederhana, siap **Cetak / Simpan PDF** lewat dialog cetak peramban.
7. **Tindak lanjut hari 7 & 30** — tugas yang benar-benar dijalankan, kendala, skor beban 1–5, rawat ulang.
8. **Dasbor** — konflik per dimensi, persentase yang berujung perubahan layanan, konflik tak terselesaikan, beban sebelum/sesudah, waktu pengisian, umpan balik klinisi.

## Aturan konflik

Semua ambang berada di **`rules-config.js`** dan dapat diubah dari halaman **Pengaturan** (sebagai admin). Mesin berada di `js/rules.js` — fungsi murni, deterministik, tanpa AI.

| Kode | Aturan | Tingkat |
|---|---|---|
| R1 | Total tuntutan tugas harian > jam pendamping tersedia pada hari itu, atau melewati batas jam layanan | konflik; perhatian bila ≥ 85% atau melewati batas |
| R2 | Tugas “terlatih” tanpa pendamping dengan keterampilan sejenis; literasi terbatas untuk tugas dasar | konflik / perhatian |
| R3 | Tugas butuh pendamping, tetapi hanya ada pendamping yang bekerja pada slot itu / tidak ada pendamping | perhatian / konflik |
| R4 | Tidak ada moda transportasi, atau menit perjalanan kontrol/bulan > ambang, atau pasien tidak bisa sendiri tanpa pendamping | konflik / perhatian |
| R5 | Total biaya tugas + transport/bulan > kemampuan keluarga | konflik; perhatian bila ≥ 85% |
| R6 | Syarat rumah (listrik, kulkas, air, ruang) tidak tersedia | konflik |
| R7 | Tugas butuh ponsel/WhatsApp/video call yang tidak tersedia | konflik |
| R8 | Jumlah tugas harian > ambang beban kumulatif | perhatian |
| — | Data kapasitas > 14 hari | peringatan + tombol perbarui |

Setiap temuan memuat: tugas terdampak, dimensi, tingkat, alasan berbahasa Indonesia, nilai aktual vs ambang, dan `ruleId` yang dapat ditelusuri.

### Efek keputusan

Opsi katalog membawa efek terstruktur (mis. kunjungan rumah menghapus kebutuhan transport; penggabungan jadwal memotong frekuensi kontrol). Efek **hanya** diterapkan bila klinisi menyimpan keputusan `sesuaikan` atau `dukungan`. Status `risiko` dan `tidak_selesai` tidak mengubah data.

## Data demo

10 keluarga fiktif (`js/data.js`) dengan variasi:

- kapasitas cukup, satu konflik, banyak konflik, dan pasien tanpa profil;
- konflik waktu, keterampilan, pendamping, transportasi, biaya, alat, digital, beban kumulatif;
- data kapasitas kedaluwarsa (22 hari) dan draf profil;
- keputusan tersimpan: penyesuaian jadwal (RM-021), konflik tidak terselesaikan (RM-014), risiko diterima (RM-046);
- tindak lanjut hari 7/30 untuk dua pasien (RM-021, RM-046).

Akun demo tidak memakai nama pasien nyata. Kode `RM-xxx` adalah pseudonim.

## Struktur berkas

```
index.html            entri aplikasi + router hash
styles.css            design system, layout responsif, gaya cetak
rules-config.js       SEMUA ambang + katalog opsi (satu tempat)
tests.html            halaman unit test
js/rules.js           mesin aturan murni + format angka/tanggal
js/data.js            10 keluarga fiktif + 12 templat tugas
js/store.js           localStorage berversi, audit, consent, tautan keluarga
js/views.js           tampilan daftar, pasien, formulir, tugas, pemetaan, cetak, dasbor, pengaturan
js/app.js             router, delegasi event, validasi formulir
js/rules.test.js      35 unit test aturan
docs/schema.sql       usulan skema PostgreSQL
docs/privasi.md       privasi, consent, batas kepatuhan
```

## Asumsi dan penyimpangan dari brief

1. **Stack**: brief menyarankan Next.js + PostgreSQL + Prisma + Zod. Runtime ini menghasilkan artefak statis, sehingga prototipe dibangun dengan HTML/CSS/JS modular tanpa build step. Skema PostgreSQL disertakan di `docs/schema.sql` untuk porting. Yang belum ada: server, database, autentikasi, enkripsi, API.
2. **PDF**: memakai dialog cetak peramban (Cetak → Simpan sebagai PDF), bukan pustaka PDF server. Tata letak A4 sudah disiapkan.
3. **Validasi**: validasi formulir ditulis manual; Zod belum dipakai karena tidak ada runtime Node di aplikasi.
4. **AI fase 2**: tidak diimplementasikan dan tidak ada panggilan jaringan. Sesuai brief, default mati.
5. **Peran**: dipilih lewat menu demo; bukan autentikasi.
6. **Waktu pengisian**: diukur dari lama formulir terbuka sampai disimpan, disimpan pada `meta`; angka awal pada data demo adalah contoh.
7. **Ambang awal** (3 jam, 240 menit/bulan, 7 tugas) adalah asumsi, bukan norma klinis. Ubah di Pengaturan sebelum pilot.
8. **Tautan keluarga** hanya-baca dan berkedaluwarsa 3 hari (dibuat saat tombol ditekan). Keputusan apakah keluarga boleh mengisi sendiri masih terbuka.

## Metrik dan definisi

- **Konflik terdeteksi**: temuan aktif pada profil tanpa efek keputusan (baseline), dihitung per temuan, bukan per pasien.
- **Berujung perubahan layanan**: keputusan `sesuaikan` atau `dukungan` ÷ temuan terdeteksi. Satu temuan bisa menghasilkan satu keputusan.
- **Tidak terselesaikan**: temuan yang masih aktif tanpa keputusan, atau diputuskan `tidak_selesai`, ÷ temuan terdeteksi.
- **Tuntas dengan perubahan**: keputusan perubahan yang membuat temuan hilang dari pemetaan.
- **Masih berjalan**: temuan yang masih aktif meski sudah ada keputusan (mis. perhatian tersisa).
- **Beban keluarga**: skor 1–5 dari keluarga pada profil awal, hari 7, dan hari 30.
- **Tugas dijalankan**: jumlah tugas yang dicentang pada tindak lanjut ÷ total tugas pada isian.
- **Waktu pengisian / tinjauan**: rata-rata menit dari sesi yang tersimpan.
- **Umpan balik klinisi**: satu pertanyaan 1–5 di akhir tinjauan tiap pasien.

Dengan 10 keluarga, angka ini untuk pembelajaran alur — bukan bukti efektivitas.

## Protokol uji coba 10 keluarga

**Tujuan:** menguji apakah temuan konflik menghasilkan perubahan layanan yang **berguna**, bukan menambah formulir.

**Persiapan (H-7 hingga H-1)**
- Pilih satu bangsal/ruang rawat dengan 10 pasien rencana pulang dalam 2–3 minggu.
- Tunjuk 2 perencana, 1–2 klinisi, 1 admin; sepakati ambang layanan di halaman Pengaturan.
- Siapkan alur consent dan kanal bantuan; gunakan data fiktif untuk latihan 2 pasien.
- Sepakati definisi “perubahan layanan”: perubahan jadwal, penambahan dukungan, rujukan, atau alat baru.

**Pelaksanaan (per pasien)**
1. Perencana mengisi profil kapasitas bersama keluarga (target ≤ 5 menit; catat bila lebih).
2. Perencana menambahkan tugas dari templat (target total ≤ 15 menit).
3. Klinisi meninjau konflik, memilih keputusan, menulis catatan. Catat waktu tinjauan.
4. Ringkasan dicetak/disimpan PDF dan diberikan ke keluarga.
5. Hari 7 dan 30: perencana mengisi tindak lanjut (tugas dijalankan, kendala, beban, rawat ulang).
6. Klinisi mengisi satu pertanyaan umpan balik.

**Pertanyaan validasi utama**
> Apakah temuan konflik menghasilkan perubahan layanan yang berguna bagi pasien/keluarga?

Pertanyaan pendukung:
1. Apakah ada konflik yang terlewat atau terasa tidak relevan?
2. Apakah alasan konflik dapat dipahami keluarga tanpa penjelasan tambahan?
3. Apakah rekomendasi dukungan benar-benar tersedia di layanan?
4. Berapa waktu nyata yang dipakai — apakah terasa seperti formulir tambahan?
5. Apakah ringkasan cetak dipakai di rumah (atau hanya disimpan)?

**Ambang keberhasilan yang disarankan**
- ≥ 30% temuan berujung perubahan rencana/dukungan yang tercatat.
- Median waktu satu pasien ≤ 15 menit.
- ≥ 70% tugas yang disepakati benar-benar dijalankan pada hari ke-7.
- Skor “berguna” rata-rata ≥ 3,5/5.
- Tidak ada insiden privasi (tautan salah sasaran, data terbaca orang tak berhak).

**Setelah pilot**
- Tinjau konflik “tidak terselesaikan” dan alasan strukturalnya (dukungan tidak ada, biaya, transport).
- Putuskan opsi katalog mana yang layak diaktifkan permanen.
- Perbaiki bahasa formulir berdasarkan komentar keluarga, lalu ulangi dengan 10 keluarga berikutnya.

## Kriteria penerimaan — status di prototipe

| Kriteria | Status |
|---|---|
| Profil + tugas satu pasien < 15 menit | Dapat dicapai: form 5 langkah + 12 templat; waktu diukur di dasbor |
| Setiap konflik punya alasan & jejak aturan | Ya: alasan, angka, `ruleId`, teks aturan |
| Tidak ada perubahan terapi otomatis | Ya: opsi berlabel jenis; efek hanya setelah keputusan klinisi |
| Keputusan tercatat & pemetaan dihitung ulang | Ya: aktor, tanggal, catatan, sebelum vs sesudah |
| Ringkasan cetak dapat dipahami awam | Ya: bahasa sederhana + bagian “masih perlu dibicarakan” |
| ≥ 10 keluarga fiktif, ≥ 3 skenario konflik | Ya: 10 keluarga, 8 aturan terpicu |

## Yang belum dikerjakan

- Backend, database tersentral, autentikasi/otorisasi nyata, enkripsi at-rest, API.
- Penghapusan/ekspor data dan pencabutan tautan oleh petugas (UI belum ada).
- Pembuatan PDF di server (sekarang lewat dialog cetak).
- AI fase 2 (draf tugas dari teks pulang, penyederhanaan bahasa) — sengaja mati.
- Mode gelap, internasionalisasi, dan pengujian aksesibilitas bersama pengguna.
- Notifikasi WhatsApp, integrasi SIMRS/SATUSEHAT, pembayaran, aplikasi native.
- Uji lapangan dan validasi klinis.

## Keputusan desain yang perlu dikonfirmasi

1. **Efek opsi otomatis**: saat klinisi menyetujui “gabung jadwal”, frekuensi kontrol langsung turun 50%. Apakah sebaiknya sistem hanya mengusulkan dan klinisi mengedit tugas manual?
2. **Tautan keluarga**: hanya-baca (sekarang) atau keluarga boleh mengisi kapasitas sendiri? Bila boleh, perlu identitas dan consent terpisah.
3. **Status “diterima dengan risiko”**: dihitung sebagai temuan yang sudah diputuskan atau tetap “belum terselesaikan” dalam metrik utama?
4. **Ambang awal** 3 jam / 240 menit / 7 tugas: perlu disesuaikan per layanan oleh klinisi sebelum pilot.
5. **Retensi audit dan data kapasitas**: berapa lama, dan siapa yang berwenang menghapus?
6. **Definisi “perubahan layanan”** untuk metrik utama: apakah mencakup rujukan puskesmas dan pinjam alat, atau hanya perubahan jadwal/dukungan?
