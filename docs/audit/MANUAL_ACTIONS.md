# Tindakan manual (hanya hal yang tidak bisa diotomasi)

Urut prioritas. **[BLOKIR RILIS]** = jangan dipakai dengan data pasien nyata sebelum selesai.

## 1. [BLOKIR RILIS] Putuskan: prototipe ini hanya untuk data fiktif
- **Apa:** tegaskan secara tertulis ke tim pilot bahwa versi ini tidak boleh berisi data pasien nyata.
- **Kenapa:** semua data tersimpan tanpa enkripsi di `localStorage` peramban. Siapa pun yang memakai komputer yang sama bisa membacanya (DevTools → Application → Local Storage), dan peran hanya simulasi.
- **Langkah:** tambahkan ke SOP pilot. Bila pilot memakai data nyata, kerjakan #2 dulu.
- **Waktu:** 15 menit (keputusan).
- **Laporkan balik:** "data fiktif saja" atau "butuh backend sebelum pilot".

## 2. [BLOKIR RILIS untuk data nyata] Backend dengan autentikasi, otorisasi server, dan RLS
- **Apa:** porting ke backend sesuai `docs/schema.sql`. Aktifkan RLS (contoh di akhir file masih berupa komentar), simpan hash token tautan keluarga, dan tentukan enkripsi kolom sensitif.
- **Kenapa:** kontrol akses saat ini hanya di UI. Ini keputusan arsitektur, biaya, dan hukum (UU PDP).
- **Langkah:** pilih stack/hosting bersama tim TI; tinjau `docs/privasi.md` bersama DPO/bagian hukum.
- **Waktu:** keputusan 1–2 jam; implementasi beberapa minggu.
- **Laporkan balik:** stack terpilih dan siapa pemilik data.

## 3. Putuskan model tautan keluarga
- **Apa:** tautan `#/keluarga/<token>` hanya berfungsi **di peramban yang sama** dengan yang membuatnya (data ada di `localStorage`). Keluarga tidak bisa membukanya dari ponsel mereka. Token juga memuat kode pseudonim pasien (`klg-rm014-…`).
- **Langkah:** pilih (a) tetap memakai cetak/PDF untuk keluarga selama prototipe (paling aman), atau (b) tunda fitur tautan sampai ada backend.
- **Waktu:** 15 menit.
- **Laporkan balik:** pilihan a/b.

## 4. Self-host font (privasi)
- **Apa:** setiap pembukaan halaman memuat font dari Google, sehingga IP pengguna rumah sakit terkirim ke Google.
- **Langkah:** unduh `woff2` Newsreader dan Plus Jakarta Sans (lisensi OFL) dari https://fonts.google.com, taruh di `assets/fonts/`, ganti `<link>` Google di `index.html`/`tests.html` dengan `@font-face` di `styles.css`, lalu perketat CSP (`style-src 'self' 'unsafe-inline'; font-src 'self'`). Saya dapat mengerjakannya bila diizinkan mengunduh file font.
- **Waktu:** 30 menit.
- **Laporkan balik:** izin ya/tidak.

## 5. Header keamanan saat deploy
- **Apa:** `<meta>` CSP sudah dipasang, tetapi `frame-ancestors`, HSTS, `X-Content-Type-Options`, dan `Permissions-Policy` hanya berlaku sebagai header HTTP.
- **Langkah (contoh Netlify `_headers` / Nginx `add_header`):**
  ```
  Content-Security-Policy: frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
- **Waktu:** 15 menit setelah target hosting dipilih.
- **Laporkan balik:** URL deploy (agar bisa saya periksa).

## 6. Putuskan nasib file non-aplikasi
- **Apa:** `rujuksekali.html` (prototipe produk lain, *RujukSekali*, 100 KB), serta ekspor OpenDesign (`DESIGN-HANDOFF.md`, `DESIGN-MANIFEST.json`, `document.md` berisi templat kosong, `sketch-2026-10-20T02-06-33.sketch.json` berisi kanvas kosong). Tidak ada yang dirujuk oleh aplikasi.
- **Kenapa tidak saya hapus:** semuanya dibuat oleh alat desain yang mungkin masih Anda pakai; `DESIGN-MANIFEST.json` merujuk ke semuanya.
- **Langkah:** bila tidak dipakai: `git rm rujuksekali.html document.md sketch-2026-10-20T02-06-33.sketch.json` (dan perbarui/hapus `DESIGN-*`), atau pindahkan `rujuksekali.html` ke repo sendiri.
- **Waktu:** 5 menit.

## 7. Uji perangkat nyata dan pembaca layar
- **Apa:** uji di 1 ponsel Android + 1 iPhone, serta NVDA (Windows) atau VoiceOver (macOS/iOS) pada alur: profil → tugas → pemetaan → ringkasan → cetak.
- **Kenapa:** axe-core dan tes headless sudah lulus, tetapi tidak menggantikan uji manusia.
- **Waktu:** 1–2 jam.
- **Laporkan balik:** kendala yang ditemukan (halaman + langkah).

## 8. Gabungkan branch
- **Langkah:** tinjau `git log main..chore/audit-20261020`, lalu `git switch main && git merge --ff-only chore/audit-20261020`. Repo ini belum punya remote; push hanya bila Anda membuat remote sendiri.
- **Waktu:** 10 menit.
