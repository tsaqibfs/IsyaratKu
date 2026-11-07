# Integrasi model kosakata SIBI ke web IsyaratKu

Tanggal: 6 November 2026. Branch `feat/t17-browser-model-integration`. Status: integrasi eksperimen klip utuh berfungsi di development dan build produksi; belum model rilis atau penerjemahan kontinu.

## Perilaku aplikasi

Pengguna memilih Mulai kamera, Rekam satu isyarat, Selesai dan periksa, lalu Gunakan kata. Video hanya menjadi input lokal; yang ditampung sementara adalah landmark. Tidak ada mikrofon, unggahan, simpan video, atau percakapan persisten. Kandidat lemah tidak bisa ditambahkan. Konfirmasi berlaku satu kali, mempertahankan teks manual yang sudah ada. Stop, batal, unmount, tab hidden, dan track berakhir membuang sesi/buffer terkait.

Model yang dipakai adalah LSTM terlatih `words-reference-v1`, bukan mock atau output acak. Ia dilatih dari satu video per masing-masing 23 kata. Pipeline memakai TF.js CPU dan MediaPipe Tasks Vision di worker klasik same-origin, dengan satu frame aktif. Pratinjau dicerminkan, koordinat model tidak dicerminkan. Teks ke klip dan suara belum diintegrasikan.

## Hasil verifikasi

| Pemeriksaan | Hasil aktual |
| --- | --- |
| Lint dan typecheck | Lulus |
| Build produksi | Berhasil; worker klasik sekitar 1,02 MB dan aset ML sekitar 28,49 MB termasuk dua varian WASM |
| Unit frontend | 11 lulus; mencakup preprocessing/penolakan, kandidat sekali, sesi lama, izin terlambat, stop/unmount |
| E2E Chrome | 6 lulus pada build produksi |
| Parity preprocessing | Fixture sintetis Python/TS lolos toleransi 0,00002 |
| Parity classifier | 23 input sumber Keras/TF.js di Chrome; max error 1,1920929e-7, top-1 seluruhnya sama; toleransi 0,0001 |
| Pengelolaan tensor | 30 forward classifier tidak menambah jumlah tensor aktif |
| Benchmark classifier | Mean 13,18 ms, P95 18,40 ms pada 30 forward satu klip di Chrome 156 CPU; ini bukan latensi webcam end-to-end |
| Privasi saat kamera uji aktif | Tidak ditemukan upload/request lintas origin; localStorage/sessionStorage kosong |
| Lifecycle browser | Stop melepas track native; hidden dan perangkat berakhir disimulasikan; worker/model nyata |
| Development | Model siap, rekaman tanpa tangan ditolak, tidak ada page error |
| UI | Screenshot desktop 1280 px dan ponsel 375 px diperiksa; keyboard dan overflow diuji |
| Audit dependensi produksi | `npm audit --omit=dev --json`: 0 temuan |

Artefak pengujian lokal berada di `test-results/` (diabaikan Git), termasuk `browser-parity.json` dan screenshot. Fixture prediksi dari data sumber tetap privat di `ml/runs/words-reference-v1/web-export/`. Fixture sintetis `ml/fixtures/preprocess-v1.json` boleh dilacak.

Kamera kanvas sintetis digunakan setelah perangkat fake bawaan Chrome 156 berakhir sendiri pada pemanggilan getUserMedia minimal tanpa alur aplikasi. Kanvas menghasilkan MediaStreamTrack native dan input video nyata untuk Hand Landmarker; ini tetap fixture kamera, bukan pengujian webcam fisik atau bukti kualitas SIBI. Izin ditolak memakai mock API; event hidden/perangkat berakhir dipicu secara terkontrol. Uji konfirmasi kandidat memakai worker mock di unit, sedangkan model nyata diverifikasi terpisah melalui parity numerik. Tidak ada hasil mock yang dipasang sebagai output aplikasi.

## Kontrak dan batasan

Model menerima satu klip tersegmentasi yang waktunya dinormalisasi menjadi 30 langkah × 137 fitur. Streaming dua detik/decoder otomatis belum diimplementasikan. Kamera memerlukan HTTPS atau localhost. Data yang tidak memadai ditolak sebelum classifier: durasi 1–10 detik, minimal 15 frame sampel, gap antar-frame maksimal 200 ms, minimal lima frame dengan tangan dan kehadiran tangan minimal 20%. Jeda netral awal/akhir diperbolehkan; celah tangan hilang di tengah interval aktif lebih dari 400 ms ditolak. Gate tersebut tidak dapat membuktikan bahwa setiap isyarat utuh atau valid secara linguistik.

Ambang skor 0,85 dan margin 0,15 merupakan nilai awal, belum terkalibrasi. Skor softmax bukan probabilitas kebenaran. Tidak ada data negatif atau evaluasi peserta baru, sehingga gerakan asing masih dapat menghasilkan kandidat salah. Konfirmasi manual dan editor diperlukan. `releaseEligible` tetap `false`; label eksperimen terpisah dari manifest kosakata rilis.

Parity classifier dan fixture preprocessing tidak membuktikan parity penuh video-ke-landmark Python/WASM, kualitas lintas peserta, ketahanan tangan dominan/mirror, kinerja webcam fisik, stabilitas sepuluh menit, atau target PRD. Hasil end-to-end pada pengguna baru tetap harus dikumpulkan sebelum klaim produk akhir. T08/T09/T17/T19 penuh tetap terbuka; hanya bagian integrasi eksperimen yang selesai.

## Menjalankan

Workspace ini sudah memiliki aset ML lokal. Jalankan `npm run dev`. Pada setup baru, siapkan `.venv` dan hasil training sesuai `ml/README.md`, lalu `npm run prepare:ml`. Aset generated di `public/ml/` diabaikan Git dan dibangun ulang; `predev`/`prebuild` menyiapkan worker dan menolak aset yang tidak lengkap. Restart dev setelah mengubah kode worker.

Tidak ada push atau deployment pada pekerjaan ini. Dataset mentah, bobot lokal, persetujuan, dan fixture data sumber tidak masuk daftar file terlacak.
