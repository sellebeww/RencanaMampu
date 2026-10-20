# Panduan pilot & catatan desain

Dokumen pendamping [README](../README.md): asumsi, definisi metrik, protokol uji coba 10 keluarga, status kriteria penerimaan, dan keputusan desain yang masih terbuka.

## Asumsi dan penyimpangan dari brief

1. **Stack**: brief menyarankan Next.js + PostgreSQL + Prisma + Zod. Prototipe memakai TypeScript + Vite dan menghasilkan artefak statis (belum Next.js, karena belum ada server). Skema PostgreSQL disertakan di `docs/schema.sql` untuk porting. Yang belum ada: server, database, autentikasi, enkripsi, API.
2. **PDF**: memakai dialog cetak peramban (Cetak → Simpan sebagai PDF), bukan pustaka PDF server. Tata letak A4 sudah disiapkan.
3. **Validasi**: validasi formulir ditulis manual; Zod belum dipakai karena tidak ada runtime Node di aplikasi.
4. **AI fase 2**: tidak diimplementasikan dan tidak ada panggilan jaringan. Sesuai brief, default mati.
5. **Peran**: dipilih lewat menu demo; bukan autentikasi.
6. **Waktu pengisian**: diukur dari lama formulir terbuka sampai disimpan, disimpan pada `meta`; angka awal pada data demo adalah contoh.
7. **Ambang awal** (3 jam, 240 menit/bulan, 7 tugas) adalah asumsi, bukan norma klinis. Ubah di Pengaturan sebelum pilot.
8. **Tautan keluarga** hanya-baca dan berkedaluwarsa 3 hari (dibuat saat tombol ditekan). Keputusan apakah keluarga boleh mengisi sendiri masih terbuka.

## Metrik dan definisi

- **Temuan terdeteksi**: temuan aktif (konflik dan perhatian) pada profil tanpa efek keputusan (baseline), dihitung per temuan, bukan per pasien.
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

## Keputusan desain yang perlu dikonfirmasi

1. **Efek opsi otomatis**: saat klinisi menyetujui “gabung jadwal”, frekuensi kontrol langsung turun 50%. Apakah sebaiknya sistem hanya mengusulkan dan klinisi mengedit tugas manual?
2. **Tautan keluarga**: hanya-baca (sekarang) atau keluarga boleh mengisi kapasitas sendiri? Bila boleh, perlu identitas dan consent terpisah.
3. **Status “diterima dengan risiko”**: dihitung sebagai temuan yang sudah diputuskan atau tetap “belum terselesaikan” dalam metrik utama?
4. **Ambang awal** 3 jam / 240 menit / 7 tugas: perlu disesuaikan per layanan oleh klinisi sebelum pilot.
5. **Retensi audit dan data kapasitas**: berapa lama, dan siapa yang berwenang menghapus?
6. **Definisi “perubahan layanan”** untuk metrik utama: apakah mencakup rujukan puskesmas dan pinjam alat, atau hanya perubahan jadwal/dukungan?
