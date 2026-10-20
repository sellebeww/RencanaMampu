# Privasi, persetujuan, dan batas kepatuhan

Dokumen ini menyertai prototipe **RencanaMampu**. Isinya menjelaskan data apa yang dipakai, kontrol apa yang sudah ada di prototipe, dan apa yang **belum** ada. Ini bukan nasihat hukum. Kepatuhan terhadap **UU No. 27/2022 tentang Pelindungan Data Pribadi** dan ketentuan rekam medis (**Permenkes No. 24/2022**) harus ditinjau oleh penanggung jawab perlindungan data dan unit hukum fasilitas sebelum dipakai dengan pasien nyata.

## 1. Kategori data

| Kelompok | Contoh | Sifat |
|---|---|---|
| Identitas pseudonim | Kode pasien `RM-014`, usia, ruang | Data pribadi |
| Kesehatan | Diagnosis ringkas, tugas perawatan, tingkat kritis | Data pribadi spesifik |
| Sosial-ekonomi | Jam pendamping, moda transportasi, kemampuan biaya, kondisi rumah | Data pribadi spesifik, berpotensi diskriminatif |
| Keputusan & tindak lanjut | Keputusan klinisi, skor beban, rawat ulang | Data pribadi spesifik |
| Audit | Akses, perubahan, aktor, waktu | Metadata kepatuhan |

Prototipe **tidak** menampilkan nama lengkap, nomor rekam medis, NIK, atau alamat di daftar pasien. Data demo sepenuhnya fiktif.

## 2. Kontrol yang sudah ada di prototipe

- **Persetujuan tercatat** sebelum profil disimpan: nama pemberi, tanggal, cakupan; persetujuan wajib dicentang pada langkah pertama.
- **Versi bertanggal**: setiap profil baru menyimpan versi dan riwayat profil sebelumnya.
- **Pemisahan peran**: perencana mengisi, klinisi mencatat keputusan, admin mengubah ambang/katalog. Peran dipilih lewat menu demo.
- **Log audit lokal**: pembukaan data pasien, penyimpanan profil, perubahan tugas, keputusan, tindak lanjut, perubahan pengaturan, dan akses tautan keluarga.
- **Tautan keluarga**: hanya ringkasan, berkedaluwarsa 3 hari, tidak membuka data kapasitas terperinci atau diagnosis rinci.
- **Minimisasi**: formulir meminta kategori biaya, bukan angka pengeluaran rumah tangga; tidak ada catatan bebas untuk identitas lengkap (diberi peringatan di formulir).
- **AI mati secara default**: tidak ada panggilan jaringan. Mesin konflik sepenuhnya aturan deterministik.
- **Data lokal**: prototipe menyimpan state di `localStorage` peramban; tidak ada pengiriman ke server.

## 3. Kontrol yang belum ada (wajib sebelum produksi)

1. **Autentikasi dan sesi** yang nyata, termasuk MFA untuk admin.
2. **Otorisasi sisi server** dan Row Level Security; pembatasan peran di UI bukan kontrol keamanan.
3. **Enkripsi at-rest** dan manajemen kunci; TLS/HTTPS belum relevan pada berkas lokal.
4. **Penghapusan data** yang dapat dieksekusi (pasien, profil, tautan) beserta bukti penghapusan.
5. **Ekspor data** untuk permintaan akses subjek data.
6. **Kebijakan retensi** dan pemusnahan otomatis; audit append-only dengan retensi terpisah.
7. **Pencatatan akses keluarga** di server, pembatasan laju (rate limit), dan pencabutan tautan oleh petugas.
8. **Uji keamanan** (threat model, uji penetrasi) dan **DPIA** untuk data sosial-ekonomi.
9. **Pelatihan pengguna** tentang minimisasi dan larangan menyalin data ke aplikasi pesan pribadi.

## 4. Dasar pemrosesan dan persetujuan

- Persetujuan diminta untuk pemakaian data kapasitas dalam perencanaan pulang, bukan untuk pemasaran atau penelitian sekunder.
- Pasien/keluarga dapat menolak atau mencabut persetujuan; aplikasi harus tetap bisa mencatat “profil tidak tersedia” tanpa menghukum keluarga.
- Untuk penelitian atau publikasi, diperlukan persetujuan terpisah dan peninjauan etik.
- Data anak atau pasien dengan penurunan kapasitas kognitif memerlukan wali yang sah; ini belum diformalkan di prototipe.

## 5. Hak subjek data (target desain)

| Hak | Rencana implementasi |
|---|---|
| Informasi | Ringkasan privasi di awal formulir + tautan dokumen ini |
| Akses | Ekspor ringkasan per pasien (PDF/JSON) oleh petugas berwenang |
| Koreksi | Versi profil baru, bukan penimpaan diam-diam |
| Penghapusan | Tombol hapus per pasien + pembersihan tautan & audit terkait sesuai kebijakan |
| Penarikan consent | Status persetujuan dicabut; pemrosesan baru dihentikan |
| Keberatan | Kanal kontak fasilitas dicantumkan pada ringkasan cetak |

## 6. Retensi (usulan, perlu keputusan fasilitas)

- Profil kapasitas & tugas: selama episode perawatan + periode audit yang ditetapkan fasilitas.
- Tindak lanjut 7/30 hari: sampai evaluasi layanan selesai.
- Tautan keluarga: maksimal 3–7 hari, otomatis kedaluwarsa.
- Audit: minimal 1 tahun, akses terbatas admin/auditor.
- Data demo: boleh dihapus kapan saja; tidak bercampur dengan data nyata.

## 7. Batas klinis

RencanaMampu adalah **alat bantu perencanaan**, bukan alat klinis. Aplikasi tidak:

- mengubah dosis atau terapi;
- menyarankan penggantian obat;
- menentukan tingkat kritis tanpa clinician input;
- menggantikan penilaian klinis atau instruksi tertulis fasilitas.

Semua opsi penyesuaian diberi label **PENYESUAIAN RENCANA** (perlu keputusan klinis) atau **DUKUNGAN TAMBAHAN** (non-klinis). Konflik yang tidak dapat diselesaikan dicatat terbuka dan muncul di ringkasan keluarga.

## 8. Catatan untuk pilot 10 keluarga

Sebelum pilot:

- gunakan hanya data fiktif atau data pasien dengan persetujuan yang tercatat;
- sepakati siapa yang boleh membuka tautan keluarga dan berapa lama;
- siapkan prosedur bila keluarga menarik persetujuan di tengah episode;
- catat insiden privasi (mis. tautan diteruskan ke orang lain) dan tindak lanjutnya;
- tinjau apakah pertanyaan biaya dan pendamping menimbulkan ketidaknyamanan, dan sesuaikan bahasanya.
