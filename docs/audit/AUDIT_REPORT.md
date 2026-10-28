# Laporan audit RencanaMampu (2026-10-20)

Branch: `chore/audit-20261020` · baseline: `1916af1` · stack: HTML/CSS/JS vanilla tanpa build, data di `localStorage`.

## 1. Ringkasan eksekutif
Sebelum audit, prototipe sudah rapi (35/35 unit test lulus, tanpa error konsol, helper escape dipakai konsisten), tetapi halaman meluap horizontal di ponsel (30 route pada 360px), ada 5 jenis pelanggaran aksesibilitas axe, ID dirender ke atribut tanpa escape, tidak ada CSP, dan token tautan keluarga dibuat dengan `Math.random` lalu dicatat utuh di log audit. Sesudah audit: 0 pelanggaran axe (WCAG 2.2 AA), 0 overflow pada 320–1366px, 0 eksekusi XSS dari 68 route dengan payload di semua field teks, CSP aktif, dan 35/35 tes tetap lulus. Ada 7 commit perubahan (+56/−73 baris di 9 file, termasuk README dan `.gitignore`), `styles.css` 47.951 → 45.508 B. Tidak ada file yang dihapus, dan tidak ada secret ditemukan. Risiko terbesar yang tersisa bersifat arsitektural (tanpa backend/enkripsi) dan butuh keputusan Anda: lihat `MANUAL_ACTIONS.md`.

## 2. File dan folder yang dihapus
Tidak ada file yang dihapus. Kode mati yang dihapus:
- 29 kelas CSS tak dirujuk: utilitas `od-*` (kecuali `od-icon`, `od-cluster`), `badge-gold`, `grid-3`, `is-current`, `is-disabled`, `nowrap`, `print-actions`. **Bukti:** pemindaian semua token di JS/HTML, termasuk prefiks kelas dinamis (`'cell-' + level`, dst.), lalu dicek ulang dengan `grep`. Perbandingan geometri + style terhitung **setiap elemen** di 260 kombinasi route×lebar menunjukkan **0 perbedaan** setelah penghapusan [TERVERIFIKASI].
- `store.decisionFor()`: tidak ada pemanggil (`grep -rn decisionFor` → hanya definisi).
- Variabel `isLater` (views.js) tidak terpakai (ESLint).

Kandidat yang **sengaja tidak dihapus** (keputusan Anda): `rujuksekali.html`, `document.md`, `sketch-2026-10-20T02-06-33.sketch.json`, `DESIGN-*`. Lihat MANUAL_ACTIONS #6.

## 3. Aset visual
Tidak ada file gambar/font di repo. Semua ikon berupa SVG inline (konsisten satu gaya, `aria-hidden`), favicon berupa data-URI, dan font dimuat dari Google Fonts dengan `display=swap`. Tidak ada yang perlu dipindah, diganti nama, atau dikompres. Self-host font tercatat di MANUAL_ACTIONS #4.

## 4. Struktur direktori
Tidak diubah, selain tambahan `docs/audit/`. Struktur sudah sesuai README dan sederhana; memindahkan `rules-config.js` ke `js/` akan mengubah path yang didokumentasikan tanpa manfaat nyata.
```
index.html  tests.html  styles.css  rules-config.js  .gitignore (baru)
js/        app.js data.js rules.js rules.test.js store.js views.js
docs/      privasi.md schema.sql
docs/audit/ AUDIT_REPORT.md MANUAL_ACTIONS.md DECISIONS.md THREAT_MODEL.md verify/
```

## 5. Standar penamaan
Sudah konsisten dan dipertahankan: file kebab-case/huruf kecil, fungsi/variabel camelCase, konstanta UPPER_SNAKE (`PATHS`, `STEPS`, `KEY`), kelas CSS kebab-case dengan prefiks state `is-`. Tidak ada file yang di-rename.

## 6. Kode dan dependensi
- Tidak ada dependensi (tanpa `package.json`), sehingga audit dependensi tidak relevan. Satu-satunya pihak ketiga: Google Fonts.
- ESLint `recommended` (ad-hoc, di luar repo): 0 error nyata. `RM_CONFIG = {…}` adalah penugasan global implisit (hanya jalan di mode non-strict) dan diganti `window.RM_CONFIG`; variabel mati dihapus. Tidak ada `console.log`, `TODO`, `eval`, maupun handler inline.

## 7. Temuan keamanan
| Keparahan | Lokasi | Deskripsi | Status |
|---|---|---|---|
| Tinggi* | arsitektur (`js/store.js`) | Data kapasitas/diagnosis di `localStorage` tanpa enkripsi; peran hanya simulasi UI | Perlu keputusan manual (#1, #2). *Kritis bila dipakai dengan data nyata |
| Sedang | `index.html`, `tests.html` | Tidak ada CSP | **Diperbaiki:** CSP `<meta>` (`script-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `connect-src 'none'`, `form-action 'none'`) + `referrer no-referrer`. 0 pelanggaran CSP di 134 render [TERVERIFIKASI]; injeksi skrip inline oleh alat uji ikut diblokir, membuktikan CSP aktif |
| Sedang | `docs/schema.sql:232-234` | Contoh RLS masih berkomentar | Keputusan manual (#2) |
| Rendah | `js/views.js:576,595,596,774,927,1094` | ID tugas/opsi/templat dimasukkan ke atribut tanpa escape. Terbukti dapat dieksploitasi bila ID berasal dari data tak tepercaya (2 elemen `<img onerror>` tersuntik di `#/pasien/P01/tugas`); ID saat ini dibuat aplikasi | **Diperbaiki** dengan `e()`. Uji ulang: 0 hit [TERVERIFIKASI] |
| Rendah | `js/store.js:204` | Token tautan keluarga dari `Math.random` (4 karakter) | **Diperbaiki:** `crypto.getRandomValues` (2×32 bit) [TERVERIFIKASI: format `klg-rm014-…`, tautan terbuka] |
| Rendah | `js/app.js:96` | Token tautan keluarga dicatat utuh di log audit | **Diperbaiki:** hanya prefiks 10 karakter + `…` [TERVERIFIKASI via flow.js] |
| Rendah | `index.html` | Muat Google Fonts mengirim IP pengguna ke pihak ketiga | Keputusan manual (#4) |
| Info | deploy | Clickjacking/HSTS butuh header server | Manual (#5) |
| Info | `#/keluarga/<token>` | Tautan hanya berlaku di peramban pembuatnya | Manual (#3) |
| Info | `DESIGN-HANDOFF.md` | Berisi instruksi untuk "AI coding tools" (ekspor OpenDesign). Tidak berbahaya, diperlakukan sebagai data, tidak dituruti | — |

**Yang diperiksa dan tidak bermasalah:** pemindaian pola secret (API key, token, kunci privat, string koneksi, webhook) di seluruh file → tidak ada (satu-satunya email adalah alamat contoh di `rujuksekali.html`). Tidak ada `eval`/`new Function`/handler inline/permintaan jaringan selain font. Semua form ditangani `preventDefault`. Input angka di-coerce `Number()`. Field teks yang bisa diisi lewat UI (nama, catatan, kendala, keterbatasan, layanan, label katalog, umpan balik) selalu di-escape: 0 hit XSS. Riwayat git tidak relevan (repo baru dibuat).

## 8. UI/UX dan aksesibilitas
| Masalah | Sebelum | Sesudah |
|---|---|---|
| Scroll horizontal | 30 route pada 360px (Pengaturan, Profil, Pemetaan, Ringkasan, tautan keluarga); header meluap pada 320px dan 768px | 0 pada 320/360/390/600/768/820/1024/1366px. Penyebab: item grid `1fr` (min-width auto) diganti `minmax(0,1fr)`; lembar ringkasan diberi `width:100%`; header dipadatkan |
| `h1` per halaman | Ringkasan: 2; not-found / tautan tidak valid: 0 | Tepat 1 di semua route |
| axe-core (WCAG 2.2 AA + best practice, 84 kombinasi route×lebar×peran) | 5 jenis: `color-contrast` (3,84:1 pada riwayat profil karena `opacity:.8`), `scrollable-region-focusable`, `landmark-complementary-is-top-level`, `aria-allowed-role`, `page-has-heading-one` | **0 pelanggaran** |
| Notice Pengaturan | "Admin layanan" terpecah ke baris sendiri (`strong` menjadi block) | Menyatu dalam kalimat |

Sudah baik sejak awal (diverifikasi otomatis): semua kontrol punya nama aksesibel, semua input punya label, tanpa `id` ganda, tanpa `href="#"`, ada skip link, `lang="id"`, `prefers-reduced-motion`, gaya cetak A4, serta state kosong/error. Aplikasi tidak menyediakan mode gelap (sesuai README).
Performa: tanpa bundler, sehingga ukuran = file statis. CSS −2,4 KB; JS praktis tetap.

## 9. Hasil verifikasi
Semua dijalankan lokal (`python3 -m http.server`, Chrome headless via Playwright). Skrip ada di `docs/audit/verify/`.

| Pemeriksaan | Perintah | Baseline | Sesudah |
|---|---|---|---|
| Unit test aturan | `check.js` → `tests.html` | 35/35 | 35/35 [TERVERIFIKASI] |
| Render 67 route × 2 lebar, error konsol/HTTP/CSP | `check.js` | 0 error | 0 error [TERVERIFIKASI] |
| Overflow 360px | `check.js` | 30 route | 0 [TERVERIFIKASI] |
| XSS (payload di semua field teks + ID, 68 route) | `check.js` | tereksekusi via ID | 0 [TERVERIFIKASI] |
| Alur klik (tambah/hapus tugas, keputusan, tautan keluarga, tindak lanjut, pengaturan, langkah formulir) | `flow.js` | lulus | lulus, identik kecuali token tersamar [TERVERIFIKASI] |
| Regresi visual (geometri + style setiap elemen, 65 route × 4 lebar, animasi dimatikan) | `geom.js` | — | 0 perbedaan setelah pembersihan CSS; sesudah perbaikan UI hanya berubah di tempat yang disengaja; media print identik [TERVERIFIKASI] |
| Aksesibilitas | `axe.js` | 5 jenis pelanggaran | 0 [TERVERIFIKASI] |
| Error konsol `tests.html` | red-team pass | 1 (404 `favicon.ico`, kegagalan lama) | 0 [TERVERIFIKASI] |
| Clone bersih | `git clone` → semua skrip di atas | — | 35/35, 0 error, 0 overflow, 0 XSS, axe 0 [TERVERIFIKASI] |
| Lint | ESLint 9 recommended (ad-hoc) | 1 global implisit, 1 variabel mati | 0 temuan nyata [TERVERIFIKASI] |
| Build / type-check / audit dependensi | — | tidak ada (tanpa build, tanpa TS, tanpa dependensi) | [TIDAK DIUJI]: tidak berlaku |
| Perangkat fisik & pembaca layar | — | — | [TIDAK DIUJI]: butuh manusia (MANUAL_ACTIONS #7) |

Catatan metodologi: perbandingan piksel screenshot terbukti tidak andal di sini (baseline vs baseline pun berbeda karena font jaringan dan animasi), sehingga bukti regresi memakai perbandingan geometri DOM dengan animasi dimatikan.

## 10. Masalah tersisa dan rekomendasi (urut prioritas)
1. Jangan pakai data nyata sebelum ada backend + auth + RLS + enkripsi (MANUAL #1–2).
2. Putuskan model tautan keluarga (MANUAL #3).
3. Self-host font, lalu perketat CSP (MANUAL #4).
4. Header keamanan saat deploy (MANUAL #5).
5. Rapikan file non-aplikasi (MANUAL #6).
6. Saran lanjutan (di luar lingkup, tidak dikerjakan): pindahkan atribut `style=""` di template ke kelas CSS agar CSP bisa tanpa `'unsafe-inline'`; tambahkan CI ringan yang menjalankan `docs/audit/verify/check.js` + `axe.js`.

## 11. Cara membatalkan
Gunakan `git revert <commit>` untuk membatalkan satu tahap.
