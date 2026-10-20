# RencanaMampu: Company Profile

> Versi draf. Bagian bertanda **[isi]** belum tersedia di repo dan perlu diisi tim sebelum profil ini dibagikan ke pihak luar.

## Ringkasan

RencanaMampu adalah alat bantu perencanaan pemulangan pasien. Alat ini memetakan setiap tugas perawatan terhadap kapasitas nyata keluarga, yaitu waktu, keterampilan, pendamping, transportasi, biaya, kondisi rumah, dan akses digital. Hasilnya menunjukkan bagian rencana pulang yang akan sulit dijalankan di rumah, sebelum pasien pulang.

Tagline: **Rencana pulang yang sanggup dijalankan keluarga.**

## Masalah

Instruksi pulang bisa benar secara klinis, tetapi gagal dijalankan di rumah. Pendamping bekerja pada jam suntik insulin, biaya kontrol mingguan melebihi kemampuan keluarga, atau tidak ada kulkas untuk menyimpan obat. Hambatan seperti ini jarang tercatat dan baru terlihat ketika pasien kembali dirawat.

## Solusi

- **Profil kapasitas keluarga**: percakapan lima langkah, sekitar lima menit, dengan persetujuan dicatat lebih dulu dan bisa disimpan sebagian.
- **Tugas perawatan**: 12 templat (insulin, luka, NGT, kontrol, diet, mobilisasi, dan lainnya) yang bisa disesuaikan.
- **Pemetaan konflik**: matriks tugas terhadap tujuh dimensi kapasitas, ditambah aturan beban kumulatif. Setiap temuan memuat alasan, angka aktual terhadap ambang, dan kode aturan (R1 sampai R8) yang bisa ditelusuri.
- **Keputusan klinisi**: sesuaikan rencana, tambah dukungan, terima dengan risiko, atau catat sebagai belum terselesaikan. Pemetaan dihitung ulang dan perbandingan sebelum-sesudah ditampilkan.
- **Ringkasan keluarga dan tindak lanjut**: satu halaman berbahasa sederhana untuk dicetak, lalu tindak lanjut hari ke-7 dan ke-30.
- **Dasbor evaluasi layanan**: konflik per dimensi, persentase temuan yang berujung perubahan layanan, dan waktu pengisian.

## Prinsip

1. **Klinisi tetap memutuskan.** RencanaMampu tidak mengubah dosis, tidak menyarankan terapi, dan tidak mengubah rencana secara otomatis. Efek opsi baru berlaku setelah klinisi menyimpan keputusan, lengkap dengan nama dan tanggal.
2. **Deterministik, tanpa AI.** Mesin aturan adalah fungsi murni dengan ambang yang terlihat dan bisa diatur admin layanan. Fitur AI sengaja dimatikan pada fase ini.
3. **Dapat ditelusuri.** Setiap konflik menyebut tugas, dimensi, tingkat, nilai aktual terhadap ambang, dan aturan yang menghasilkannya.
4. **Privasi sejak awal.** Persetujuan dicatat sebelum profil diisi, tautan keluarga hanya-baca dan kedaluwarsa dalam 3 hari, dan data tidak dikirim ke pihak ketiga oleh aplikasi.
5. **Bahasa keluarga.** Ringkasan ditulis untuk orang awam dan jujur tentang hal yang masih perlu dibicarakan.

## Pengguna

| Peran | Yang dilakukan |
|---|---|
| Perencana pemulangan | Mengisi profil kapasitas, mengelola tugas, melihat pemetaan, membuat tautan keluarga |
| Klinisi penanggung jawab | Meninjau konflik, mencatat keputusan, memberi umpan balik |
| Admin layanan | Mengatur ambang, mengaktifkan opsi katalog dukungan, memantau dasbor |

## Status produk

- **Tahap**: prototipe MVP. Belum digunakan dengan data pasien nyata.
- **Teknologi**: TypeScript (strict) dan Vite, menghasilkan berkas statis. Data disimpan di penyimpanan lokal peramban.
- **Yang belum ada**: server, basis data, autentikasi, enkripsi, dan API. Skema PostgreSQL sudah diusulkan di `docs/schema.sql` sebagai dasar untuk versi produksi.
- **Data**: 10 keluarga fiktif. Kode `RM-xxx` adalah pseudonim.
- **Pengujian**: 35 uji aturan (Vitest dan halaman uji di peramban), audit aksesibilitas WCAG 2.2 AA, dan pemeriksaan keamanan dasar (Content-Security-Policy, escape keluaran). Lihat `docs/audit/`.

## Rencana uji coba

Pilot direncanakan dengan 10 keluarga di satu bangsal atau ruang rawat, dengan pertanyaan utama: apakah temuan konflik menghasilkan perubahan layanan yang berguna, atau hanya menambah formulir?

| Ukuran | Ambang yang disarankan |
|---|---|
| Temuan yang berujung perubahan rencana atau dukungan | ≥ 30% |
| Median waktu untuk satu pasien | ≤ 15 menit |
| Tugas yang disepakati dijalankan pada hari ke-7 | ≥ 70% |
| Skor "berguna" dari klinisi | ≥ 3,5 dari 5 |
| Insiden privasi | 0 |

Angka tersebut adalah target yang diusulkan, bukan hasil yang sudah dicapai.

## Batasan

- Alat bantu perencanaan, **bukan alat klinis**. Tidak menggantikan keputusan klinisi.
- Ambang awal (3 jam per hari, 240 menit per bulan, 7 tugas harian) adalah asumsi, bukan norma klinis. Perlu ditinjau sebelum pilot.
- Belum boleh dipakai dengan data pasien nyata sebelum backend, autentikasi, kontrol akses, dan enkripsi tersedia.

## Peta jalan (usulan)

1. Validasi alur dan aturan melalui pilot 10 keluarga.
2. Keputusan tentang model tautan keluarga dan apakah keluarga boleh mengisi sendiri.
3. Backend dengan autentikasi, kontrol akses berbasis peran, dan enkripsi, sesuai skema di `docs/schema.sql`.
4. Integrasi dengan proses pemulangan rumah sakit, setelah pilot berhasil.

## Informasi perusahaan

| Item | Isi |
|---|---|
| Nama badan hukum | **[isi]** |
| Bentuk usaha dan nomor induk | **[isi]** |
| Tim pendiri dan peran | **[isi]** |
| Alamat | **[isi]** |
| Kontak resmi | **[isi]** |
| Situs web | **[isi]** |
| Mitra uji coba | **[isi]** |

## Catatan privasi dan kepatuhan

Lihat `docs/privasi.md` untuk privasi, persetujuan, dan batas kepatuhan. Data demo bersifat fiktif.

---

Alat bantu perencanaan, bukan alat klinis. Tidak menggantikan keputusan klinisi.
