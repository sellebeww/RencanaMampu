# Cara membatalkan perubahan audit

Baseline (kondisi asli sebelum audit): commit `1916af1` di branch `main`. Semua perubahan ada di branch `chore/audit-20261020`; `main` tidak disentuh.

| Commit | Fase | Isi |
|---|---|---|
| `af6fe08` | 1 Keamanan | Escape ID di atribut, CSP `<meta>`, token `crypto`, token tersamar di log audit, `.gitignore` |
| `482ae09` | 2 Pembersihan | Hapus 29 kelas CSS tak terpakai + `store.decisionFor` |
| `381d7f8` | 6 UI | Tanpa scroll horizontal 320–900px, satu `h1` per halaman, notice Pengaturan |
| `06a2a28` | 6 Aksesibilitas | Kontras, wadah gulir fokus-keyboard, landmark, role list |
| `f0ec282` | 5 Kualitas | `window.RM_CONFIG` eksplisit, hapus variabel mati |
| (terakhir) | 7 Dokumentasi | `docs/audit/*`, README |

```bash
# Batalkan semuanya (kembali ke kondisi asli):
git switch main            # main = baseline, tidak berubah

# Batalkan satu tahap saja, tetap di branch audit:
git revert <commit>        # mis. git revert 381d7f8

# Buang branch audit sepenuhnya:
git switch main && git branch -D chore/audit-20261020

# Hapus git sama sekali (kembali seperti sebelum audit, folder tanpa .git):
#   PERHATIAN: menghapus seluruh riwayat. Pastikan berada di `main` dulu.
git switch main && rm -rf .git .gitignore docs/audit
```
