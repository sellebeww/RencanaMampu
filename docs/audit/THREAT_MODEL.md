# Model ancaman singkat (2026-10-20)

**Sistem:** prototipe statis HTML/CSS/JS, tanpa server, tanpa build. Semua data ada di `localStorage` peramban (`rencanamampu.state.v1`). Satu-satunya permintaan jaringan keluar adalah Google Fonts.

## Aset paling berharga
1. Profil kapasitas keluarga: data sosial-ekonomi, rumah, pendamping, keterbatasan. Termasuk data kesehatan/sensitif bila diisi data nyata.
2. Daftar tugas perawatan dan diagnosis pasien (kode `RM-xxx` adalah pseudonim).
3. Keputusan klinisi dan log audit (integritas jejak keputusan).
4. Tautan keluarga (token akses hanya-baca).

## Titik masuk
- Isian formulir (profil, tugas, keputusan, tindak lanjut, umpan balik, pengaturan admin).
- Hash URL (`#/pasien/<id>/…`, `#/keluarga/<token>`).
- Isi `localStorage` (bisa diubah siapa pun yang memakai peramban yang sama).
- Stylesheet pihak ketiga (fonts.googleapis.com / fonts.gstatic.com).
- Kelak: impor data/backend (lihat `docs/schema.sql`).

## Batas kepercayaan
- Peramban = satu-satunya lingkungan. **Tidak ada batas kepercayaan antar-pengguna**: peran (perencana/klinisi/admin) hanya simulasi di UI, dan siapa pun yang membuka peramban itu bisa membaca/mengubah semua data.
- Antara aplikasi dan Google Fonts (IP pengunjung terkirim ke Google).

## Ancaman teratas (urut prioritas) → status
| # | Ancaman | Status |
|---|---|---|
| 1 | Data pasien nyata disimpan tanpa enkripsi di `localStorage` komputer bersama | Di luar jangkauan prototipe, jadi keputusan manual (MANUAL_ACTIONS #1) |
| 2 | Kontrol peran hanya di UI (bisa dilewati via DevTools) | Didokumentasikan, perlu backend (MANUAL_ACTIONS #2) |
| 3 | XSS stored lewat data yang dirender ke `innerHTML` | Diuji dinamis di 68 route: field UI sudah di-escape; ID di atribut kini juga di-escape; CSP `script-src 'self'` sebagai lapisan kedua |
| 4 | Token tautan keluarga mudah ditebak / bocor di log | Token kini dari `crypto.getRandomValues`; log audit hanya mencatat prefiks |
| 5 | Tautan keluarga dikira bisa dibuka di perangkat keluarga (padahal data lokal) | Batasan fungsional, keputusan pilot (MANUAL_ACTIONS #3) |
| 6 | Kebocoran IP/metadata ke Google Fonts pada aplikasi kesehatan | Keputusan manual: self-host font (MANUAL_ACTIONS #4) |
| 7 | Clickjacking / tanpa HSTS saat di-deploy | Perlu header server (`frame-ancestors`, HSTS), tidak bisa lewat `<meta>` (MANUAL_ACTIONS #5) |
| 8 | Porting skema tanpa RLS aktif | RLS masih contoh berkomentar di `docs/schema.sql` (MANUAL_ACTIONS #2) |

## Lingkungan uji yang tersedia
Node 25, Python 3 (`http.server`), Google Chrome + Playwright-core (headless), axe-core. Tidak ada Docker, DB, ataupun backend. Semua verifikasi dilakukan lokal di `127.0.0.1`.
