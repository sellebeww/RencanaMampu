# Keputusan selama audit (2026-10-20)

| # | Keputusan | Alasan | Alternatif yang ditolak |
|---|---|---|---|
| 1 | Membuat repo git lokal + commit baseline `1916af1`, bekerja di branch `chore/audit-20261020` | Proyek belum memakai git; semua perubahan harus bisa dibatalkan | Arsip zip (lebih sulit ditinjau per tahap) |
| 2 | Tidak menambah npm/ESLint/Prettier ke proyek | README menegaskan "tanpa build step, tanpa npm install"; menambah toolchain mengubah cara kerja tim | Menambah `package.json` + lint config |
| 3 | Lint dan uji browser dijalankan dari folder sementara; skrip disimpan di `docs/audit/verify/` | Bisa diulang tanpa mencemari aplikasi | Menaruh `node_modules` di repo |
| 4 | CSP via `<meta>` dengan `style-src 'unsafe-inline'` | Template memakai banyak atribut `style=""`; memindahkannya ke kelas adalah refactor besar | `style-src 'self'` (merusak tampilan) |
| 5 | `form-action 'none'` di CSP | Semua form ditangani JS (`preventDefault`); tidak ada server penerima | `'self'` |
| 6 | Escape ID di atribut walau ID dibuat aplikasi | Defense-in-depth; perilaku tetap (entity di-decode browser) | Membiarkan karena bukan input pengguna |
| 7 | Token tautan keluarga: format `klg-<kode>-<acak>` dipertahankan, hanya bagian acak diganti `crypto.getRandomValues` | Menjaga kompatibilitas dengan tautan/demo lama | Mengganti format (memutus tautan tersimpan) |
| 8 | Log audit mencatat 10 karakter awal token + `…` | Token adalah kredensial akses; prefiks hanya berisi kode pseudonim | Tidak mencatat sama sekali (kehilangan jejak) |
| 9 | Tidak menghapus `rujuksekali.html` dan file OpenDesign | Bukti tidak terpakai oleh aplikasi kuat, tetapi mungkin masih dipakai alat desain; menyentuh aset milik pengguna | Hapus otomatis |
| 10 | Tidak self-host font | Butuh unduhan aset pihak ketiga dan keputusan privasi | Unduh otomatis |
| 11 | Judul lembar ringkasan diubah dari `h1` ke `h2.sheet-title` (ukuran sama) | Satu `h1` per halaman; tampilan cetak identik (diverifikasi geometri media print) | Menghapus `h1` halaman |
| 12 | Daftar pasien: menghapus `role="list"/"listitem"` dari `<a>` | `listitem` tidak sah pada `<a>` (axe); kehilangan info jumlah item kecil | Membungkus tiap `<a>` dengan `<div role="listitem">` (mengubah DOM/CSS grid) |
| 13 | Di ≤900px label "Peran (demo)" dan tagline merek disembunyikan | Mencegah scroll horizontal di 768px; `<select>` tetap punya `aria-label` | Memperkecil font header |
| 14 | `catch (err)` tanpa pemakaian `err` dibiarkan | Semua blok memberi umpan balik ke pengguna atau fallback; ganti hanya kosmetik | `catch {}` |
| 15 | `.gitignore` minimal ditambahkan | Mencegah `.DS_Store`/`.env` ikut ter-commit | — |
