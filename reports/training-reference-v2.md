# Pembaruan model IsyaratKu menjadi 31 label

Tanggal 7 November 2026. Branch `codex/update-31-word-model`. Proyek sekarang berada di `D:/Lomba/Isyaratku`.

Model aktif diperbarui dari `words-reference-v1` (23 kelas) menjadi `words-reference-v2` (31 kelas) mengikuti tambahan data pemilik. Tambahan delapan label: jumpa, kasih, pagi, paham-mengerti, sampai, selamat, terima, ujian. `terima` dan `kasih` berasal dari dua video dan tetap menjadi dua kelas; tidak ada kelas frasa gabungan yang dibuat otomatis. `paham-mengerti` tetap satu label.

## Hasil training dan ekspor

| Pemeriksaan | Hasil |
| --- | --- |
| Video kata | 31, satu video sumber per kelas |
| Urutan train termasuk augmentasi | 775 |
| Arsitektur | LSTM 64, Dense 32, Dropout, Dense 31 |
| Input | Klip utuh dinormalisasi menjadi 30 langkah × 137 fitur |
| Epoch / seed | 100 / 42 |
| Loss akhir train | 0.0013577247 |
| Kecocokan klip sumber | 31/31; pemeriksaan hafalan, bukan akurasi test independen |
| Selisih setelah muat ulang Keras | 0.0 |
| Parity Python/TF.js Node | 1.192092896e-07; top-1 sama seluruhnya |
| Parity Python/TF.js Chrome | 1.192092896e-07; 31 input, top-1 sama seluruhnya |
| Tensor pada uji 30 inferensi Chrome | Pertambahan 0 |
| Benchmark classifier Chrome | Mean 9.00 ms; P95 11.40 ms, bukan latensi kamera end-to-end |
| Unit frontend / e2e | 13 / 6 lulus |
| Lint, typecheck, build | Lulus |

Model Keras: `ml/runs/words-reference-v2/model.keras`. SHA-256: `4b7661afda1c1c43c74414db650615c16013be8a1fc9e148ee5af884af3109a9`. Konfigurasi training, history, metadata, landmark, fixture model dan laporan numerik tetap berada di direktori run lokal yang diabaikan Git. Hasil browser juga diarsipkan ke `ml/runs/words-reference-v2/web-export/browser-parity.json`.

Seluruh label: apa, bantu, belum, buku, guru, halo, jadwal, jumpa, kamu, kasih, kelas, maaf, minta, mulai, nama, pagi, paham-mengerti, sampai, saya, sekolah, selamat, selesai, siapa, tanya, terima, tidak, tugas, ujian, ulang, waktu, ya.

## Perubahan web dan perlindungan versi

`ml/configs/active-model.json` menjadi acuan bersama ID model, konfigurasi training dan jumlah kelas. Exporter, pengecekan aset, worker, UI, serta e2e mengikuti konfigurasi tersebut. Ekstraksi menolak jumlah video yang tidak sesuai `expectedLabelCount`.

Sumber run dan target paket wajib memiliki ID versi dan jumlah label yang konsisten sebelum ekspor. Worker memakai query versi pada URL dan mengirim `modelId` saat siap. Controller menolak worker dengan versi/jumlah label yang berbeda, menghentikan kamera dan meminta reload. Regression test penolakan worker lama diperiksa gagal sebelum perbaikan, lalu lulus.

Model v1 tetap ada. Checksum model Keras v1 serta aset paket publik v1 diperiksa dan cocok dengan manifest asal. Tidak ada penggabungan atau penghapusan run v1. Tidak ada push/deploy dalam pembaruan ini.

## Batas hasil

Model tetap eksperimen (`releaseEligible: false`). Seluruh kelas masih berasal dari satu video; augmentasi bukan pemeraga baru. Validation/test independen, data negatif, dan evaluasi webcam fisik belum tersedia. Uji kamera Chrome memakai MediaStream kanvas sintetis, bukan peserta baru. Ketepatan 31/31 pada sumber tidak membuktikan kemampuan pada pengguna baru.

Alur web tetap rekam satu isyarat → periksa kandidat → konfirmasi kata, bukan pengenalan percakapan kontinu. Parity numerik tidak membuktikan kesetaraan penuh video-ke-landmark Python/WASM. Perlu rekaman baru untuk menilai kualitas kosakata tambahan.

## Menjalankan

Restart `npm run dev` dari folder proyek baru dan muat ulang browser. Aset v2 sudah disiapkan. Untuk mengekspor ulang dari model lokal, jalankan `npm run prepare:ml`. Worker dibangun otomatis oleh predev/prebuild.
