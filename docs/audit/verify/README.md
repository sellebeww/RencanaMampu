# Skrip verifikasi audit

Dipakai untuk membuktikan tidak ada regresi selama audit 2026-10-20. Bukan bagian aplikasi, dan aplikasi tetap tanpa build step maupun npm.

```bash
# 1. Siapkan alat di folder sementara di LUAR proyek
mkdir -p /tmp/rm-verify && cd /tmp/rm-verify
npm init -y >/dev/null
npm i playwright-core@1.56.1 axe-core@4.10.3      # memakai Google Chrome terpasang (channel: 'chrome')
cp <folder-proyek>/docs/audit/verify/*.js .

# 2. Sajikan aplikasi (port 8765). Untuk geom.js, sajikan juga commit baseline di port 8766:
#    git worktree add /tmp/rm-base 1916af1 && (cd /tmp/rm-base && python3 -m http.server 8766)
(cd <folder-proyek> && python3 -m http.server 8765 --bind 127.0.0.1) &

# 3. Jalankan
node check.js http://127.0.0.1:8765/ hasil.json   # 35 unit test, 134 render route, konsol, overflow 360px, label, XSS
node flow.js  http://127.0.0.1:8765/              # alur klik: tugas, keputusan, tautan keluarga, tindak lanjut, pengaturan
node axe.js 8765                                  # axe-core WCAG 2.2 A/AA + best practice
node geom.js                                      # geometri + style setiap elemen: baseline (8766) vs saat ini (8765)
```

Hasil yang diharapkan: `35/35`, `errors=0`, `overflow=[]`, `xss=0`, `axe: 0 pelanggaran`.
