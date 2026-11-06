# IsyaratKu

Prototipe pengenal kosakata SIBI untuk komunikasi sederhana di kelas. Stack awal: React, TypeScript, dan Vite, tanpa backend.

**Status saat ini:** setup T06. Halaman awal dan editor teks manual sudah tersedia. Kamera, model SIBI, pengenalan, suara, serta klip belum tersedia. Manifest kosakata sengaja kosong sampai ada validasi. Ini belum demo penerjemahan.

Pembaruan desain T07: workspace memakai palet sage/ivory, font Manrope yang dibundel lokal dan judul serif, area kamera yang lebih dominan, serta navigasi ke panduan dan penjelasan privasi. Interaksi editor tetap sama; status fitur yang belum tersedia ditampilkan secara eksplisit. Reduced motion mengikuti preferensi sistem. Favicon dan aset pratinjau sosial tersedia secara lokal; URL absolut `og:image` perlu disesuaikan dengan domain/base path saat deployment.

Manrope © The Manrope Project Authors, didistribusikan dengan [SIL Open Font License 1.1](public/licenses/manrope-OFL.txt). Pemeriksaan setelah redesign: lint, typecheck, build, 2 unit test, dan 2 e2e Chrome lulus; screenshot desktop 1440 px dan ponsel 390 px ditinjau. Pengujian keyboard juga berjalan pada lebar 375 px.

## Menjalankan

Gunakan Node.js yang memenuhi `engines` di `package.json` dan npm. Versi mesin saat setup: Node.js `26.8.2` (juga tercatat dalam `.node-version`) dan npm `11.19.1`; rentang versi lain belum diuji. Untuk instalasi baru dari lockfile:

```sh
npm ci
npm run dev
```

Buka URL localhost yang ditampilkan Vite. Tidak ada `.env` atau akun layanan yang diperlukan. Kamera tidak diminta pada tahap ini.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`test:e2e` membangun aplikasi dan menjalankan Playwright pada build produksi dengan Google Chrome lokal (`channel: chrome`). Pasang Google Chrome terlebih dahulu jika belum tersedia. `npm run preview` dapat dipakai untuk meninjau build secara manual. `npm run check` menggabungkan lint, unit test, typecheck, dan build.

Unit test memeriksa perilaku dasar dan batasan tahap setup. E2E memeriksa reload tanpa menyimpan teks, permintaan same-origin, keyboard, dan viewport kecil. Pemeriksaan ini belum membuktikan privasi pipeline kamera atau kualitas model yang belum dibuat.

Hasil pemeriksaan 2 November 2026: lint dan typecheck lulus, 2 unit test lulus, build produksi berhasil, dan 2 e2e lulus pada Google Chrome lokal. Preview build digunakan otomatis oleh Playwright; kompatibilitas browser lain belum diuji.

Audit npm pada tanggal yang sama: dependensi produksi memiliki 0 temuan; audit seluruh dependensi melaporkan 12 temuan tingkat sedang pada rantai tooling ESLint/typescript-eslint melalui `minimatch` (advisory `GHSA-g3hv-75wg-m249`). Ini tetap merupakan keterbatasan setup, walaupun tidak dibundel sebagai dependensi runtime aplikasi. Tidak digunakan `audit fix --force`, downgrade besar, atau override lintas versi mayor yang belum diuji. Tinjau kembali saat rilis perbaikan kompatibel tersedia.

## Struktur

- `src/app`: halaman dan komposisi aplikasi.
- `src/features`: area fitur kamera, pengenalan, percakapan, teks ke isyarat, dan dataset.
- `src/ml`: lokasi pipeline browser yang akan dikerjakan pada tugas berikutnya.
- `public`: aset publik berizin dan manifest kosakata.
- `ml`: lokasi konfigurasi, fixture sintetis, dan skrip pelatihan; lingkungan Python belum dikunci.
- `tests`: unit dan e2e.
- `reports`: laporan agregat, tanpa identitas peserta.

Folder yang belum diimplementasikan hanya memiliki `.gitkeep`. Tidak ada model, preprocessing, atau worker kosong yang berpura-pura berfungsi. Jangan menaruh rekaman, formulir persetujuan, atau identitas peserta dalam `public` atau Git. Aturan ignore adalah perlindungan tambahan, bukan pengganti pemeriksaan isi commit.

## Alur Git

Nama repository yang disarankan: `isyaratku`. Branch utama: `main`. Gunakan huruf kecil dan kebab-case:

```text
chore/t06-project-setup
feat/t08-camera-lifecycle
feat/t09-hand-landmarker-worker
fix/t18-duplicate-prediction
docs/t03-vocabulary-validation
test/t30-browser-privacy
```

Format commit mengikuti Conventional Commits, dengan subjek ringkas yang menjelaskan perubahan:

```text
chore(project): bootstrap react typescript workspace
feat(camera): release media tracks when session stops
fix(recognition): reject predictions from previous sessions
docs(planning): record validated vocabulary scope
```

Kerjakan satu tugas pada branch terkait, jalankan pemeriksaan relevan, lalu review diff sebelum commit. Merge ke `main` setelah diperiksa. Jangan gunakan force push atau mengubah riwayat bersama tanpa kebutuhan yang disepakati. Remote dan push belum dikonfigurasi pada setup lokal ini.

## Dokumen acuan

- [Kebutuhan produk](prd.md)
- [Arsitektur](archtecture.md) — nama file asli dipertahankan agar tautan tetap konsisten.
- [Panduan agen](agents.md)
- [Urutan tugas](todo.md)
- [Persiapan data dan training](ml/README.md)

## Rujukan setup

- [Vite](https://vite.dev/guide/)
- [Vitest](https://vitest.dev/guide/)
- [Playwright web server](https://playwright.dev/docs/test-webserver)
