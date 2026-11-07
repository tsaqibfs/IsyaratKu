# IsyaratKu

Pembaruan 7 November 2026: model v2 dengan 31 label sudah dilatih dan terhubung ke web. Konfigurasi aktif berada di `ml/configs/active-model.json`. Lint/typecheck/build, 13 unit test dan 6 e2e Chrome lulus. Lihat [hasil model v2](reports/training-reference-v2.md). Hasil 23 kelas di bawah merupakan riwayat model v1.

Aplikasi web pengenal kosakata SIBI untuk komunikasi sederhana di kelas. React, TypeScript, dan Vite, dengan inferensi lokal tanpa backend.

**Status 7 November 2026:** model eksperimen 31 kata sudah terhubung ke kamera dan editor melalui MediaPipe Tasks Vision serta TensorFlow.js di worker. Alurnya berupa satu klip gerakan yang direkam secara eksplisit, bukan pengenalan percakapan kontinu. Kandidat hanya masuk editor setelah konfirmasi. Data training masih satu video per label; kualitas pada pengguna baru belum diketahui. Suara dan klip balasan belum tersedia. Manifest kosakata rilis sengaja tetap kosong; label eksperimen disediakan oleh metadata model yang terpisah.

Pembaruan desain T07: workspace memakai palet sage/ivory, font Manrope yang dibundel lokal dan judul serif, area kamera yang lebih dominan, serta navigasi ke panduan dan penjelasan privasi. Interaksi editor tetap sama; status fitur yang belum tersedia ditampilkan secara eksplisit. Reduced motion mengikuti preferensi sistem. Favicon dan aset pratinjau sosial tersedia secara lokal; URL absolut `og:image` perlu disesuaikan dengan domain/base path saat deployment.

Manrope © The Manrope Project Authors, didistribusikan dengan [SIL Open Font License 1.1](public/licenses/manrope-OFL.txt). Pemeriksaan setelah redesign: lint, typecheck, build, 2 unit test, dan 2 e2e Chrome lulus; screenshot desktop 1440 px dan ponsel 390 px ditinjau. Pengujian keyboard juga berjalan pada lebar 375 px.

## Menjalankan

Gunakan Node.js yang memenuhi `engines` di `package.json` dan npm. Versi mesin saat setup: Node.js `26.8.2` (juga tercatat dalam `.node-version`) dan npm `11.19.1`; rentang versi lain belum diuji. Untuk instalasi baru dari lockfile:

```sh
npm ci
npm run prepare:ml
npm run dev
```

`prepare:ml` memerlukan `.venv` dan artefak training lokal yang sudah ada; lihat [panduan ML](ml/README.md). Aset model, bobot, detektor, serta WASM di `public/ml/` dihasilkan secara lokal dan tidak masuk Git. Pada workspace yang sudah disiapkan, cukup `npm run dev`. Build worker klasik berjalan otomatis sebelum dev/build; restart dev setelah mengubah kode worker. Tidak diperlukan `.env`, akun, atau server GPU.

Buka URL localhost dari Vite. Pilih **Mulai kamera → Rekam satu isyarat → Selesai dan periksa → Gunakan kata**. Peragakan satu gerakan utuh selama 1–10 detik dengan jeda singkat. Kandidat lemah, tanpa tangan, frame terputus, atau kehilangan tangan di tengah gerakan lebih dari 400 ms ditolak. Ambang skor belum terkalibrasi dan tidak menjamin penolakan semua gerakan asing. Gunakan koreksi/ketik jika hasil tidak sesuai.

Kamera hanya diminta atas klik dan tidak meminta mikrofon. Video tidak disimpan; buffer landmark sementara dibuang setelah selesai, batal, atau stop. Track dan worker dilepas saat stop, unmount, tab tersembunyi, atau perangkat berakhir. Semua aset same-origin; tidak ada unggahan video/landmark/teks atau penyimpanan percakapan secara persisten.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`test:e2e` membangun aplikasi dan menjalankan Playwright pada build produksi dengan Google Chrome lokal (`channel: chrome`). Pasang Google Chrome terlebih dahulu jika belum tersedia. `npm run preview` dapat dipakai untuk meninjau build secara manual. `npm run check` menggabungkan lint, unit test, typecheck, dan build.

Pemeriksaan integrasi 6 November 2026: lint/typecheck/build lulus, 11 unit test dan 6 e2e Chrome lulus. Preprocessing TypeScript setara dengan fixture sintetis Python (toleransi 0,00002). Prediksi TF.js di Chrome setara dengan Keras pada 23 input sumber (selisih maksimum 0,0000001192 dan top-1 sama). Uji inferensi 30 kali tidak menambah tensor aktif. Kamera kanvas sintetis dipakai untuk menguji video dan worker nyata, penolakan tanpa tangan, stop, serta event simulasi hidden/perangkat terputus. Izin ditolak diuji melalui API mock. Ini bukan pengujian webcam fisik atau kualitas SIBI pada pengguna baru.

Mode development juga diperiksa: model siap, rekaman tanpa tangan ditolak, tanpa page error. Audit jaringan mode kamera tidak menemukan request lintas origin atau upload, dan local/session storage tetap kosong. Rincian benchmark, hasil, serta batasan ada di [laporan integrasi](reports/browser-integration-v1.md).

Hasil pemeriksaan 2 November 2026: lint dan typecheck lulus, 2 unit test lulus, build produksi berhasil, dan 2 e2e lulus pada Google Chrome lokal. Preview build digunakan otomatis oleh Playwright; kompatibilitas browser lain belum diuji.

Audit npm pada tanggal yang sama: dependensi produksi memiliki 0 temuan; audit seluruh dependensi melaporkan 12 temuan tingkat sedang pada rantai tooling ESLint/typescript-eslint melalui `minimatch` (advisory `GHSA-g3hv-75wg-m249`). Ini tetap merupakan keterbatasan setup, walaupun tidak dibundel sebagai dependensi runtime aplikasi. Tidak digunakan `audit fix --force`, downgrade besar, atau override lintas versi mayor yang belum diuji. Tinjau kembali saat rilis perbaikan kompatibel tersedia.

## Struktur

- `src/app`: halaman dan komposisi aplikasi.
- `src/features`: area fitur kamera, pengenalan, percakapan, teks ke isyarat, dan dataset.
- `src/ml`: preprocessing, kontrak model, keputusan kandidat, dan worker browser.
- `public`: aset publik berizin dan manifest kosakata.
- `ml`: konfigurasi, fixture sintetis, skrip ekstraksi/training/ekspor, dan lockfile lingkungan Python.
- `tests`: unit dan e2e.
- `reports`: laporan agregat, tanpa identitas peserta.

`src/ml` berisi preprocessing, kontrak, keputusan kandidat, dan worker nyata. `scripts` menyiapkan paket TF.js serta membangun worker klasik agar loader WASM bekerja pada dev maupun produksi. Jangan menaruh rekaman, formulir persetujuan, atau identitas peserta dalam `public` atau Git. Aturan ignore adalah perlindungan tambahan, bukan pengganti pemeriksaan isi commit.

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

Kerjakan satu tugas pada branch terkait, jalankan pemeriksaan relevan, lalu review diff sebelum commit. Merge ke `main` setelah diperiksa. Jangan gunakan force push atau mengubah riwayat bersama tanpa kebutuhan yang disepakati. Pengaturan remote dan publikasi mengikuti izin pemilik proyek.

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
