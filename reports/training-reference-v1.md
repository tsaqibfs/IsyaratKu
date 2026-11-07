# Hasil training eksperimen kosakata dari video referensi SIBI

Tanggal: 6 November 2026. Status: eksperimen lokal selesai, belum memenuhi syarat model rilis. Branch: `feat/t16-experimental-training`.

## Hasil yang tersedia

Classifier LSTM 64 unit dilatih pada 23 video kata di `ml/dataset/kata/`. Pemilik mengonfirmasi izin penggunaan umum, telah memeriksa bentuk isyarat, dan menyatakan setiap video berisi satu gerakan. Huruf tidak dicampurkan. Agen tidak melakukan verifikasi linguistik atau menetapkan lisensi baru.

| Pemeriksaan | Hasil |
| --- | --- |
| Klip sumber | 23, satu per label |
| Urutan train termasuk augmentasi | 575; tetap berasal dari 23 klip yang sama |
| Input | Seluruh klip tersegmentasi, dinormalisasi menjadi 30 langkah × 137 fitur |
| Epoch | 100 |
| Loss train akhir | 0,000843676447402686 |
| Kecocokan pada klip sumber | 23/23; pemeriksaan hafalan, bukan akurasi test |
| Validation dan test independen | Belum tersedia; metrik test dan macro-F1 bernilai `null` |
| Muat ulang Keras | Selisih maksimum skor 0 pada 23 klip sumber; toleransi 0,000001 |
| Ukuran model | 686.057 byte, sekitar 670 KiB |
| Waktu training dan simpan/verifikasi | 16,75 detik; tidak termasuk setup/unduhan/ekstraksi |
| Unit test | 8 lulus pada lingkungan training |

Artefak lokal yang diabaikan Git berada di `ml/runs/words-reference-v1/`: `model.keras`, `labels.json`, `preprocess.json`, `history.json`, `report.json`, `extraction.json`, `sequences.npz`, dan landmark mentah `raw/`. Konfigurasi, seed, checksum sumber/model, urutan label, versi dependensi, dan batasan tersimpan bersama hasil. SHA-256 model: `00b86306305ecf9610fefec5d5db5fd1b96c22c931a82002a3256c833a361900`.

## Lingkungan dan pemeriksaan kode

Python 3.12.14, TensorFlow 2.19.1, Keras 3.15.1, MediaPipe 0.10.21, NumPy 1.26.4, serta OpenCV contrib 4.11.0.86 pada Windows CPU. Seluruh dependensi hasil resolusi dikunci di `ml/requirements.lock`. Python global tidak diganti.

Unit test memeriksa label duplikat, perubahan inventaris setelah ekstraksi, timestamp tidak valid, gap panjang, tangan hilang, lintasan pergelangan, invariansi skala bentuk, telapak degenerat, dan augmentasi yang menjaga mask serta sumber. Delapan metode uji mencakup beberapa kasus tersebut. Review kode independen menemukan celah inventaris berubah setelah ekstraksi; sudah diperbaiki dan diuji. `git diff --check` serta audit ignore/tracked file dijalankan; data, aset detektor, lingkungan, dan bobot tidak masuk daftar file terlacak.

## Temuan kualitas data

Seluruh 23 video dapat dibaca oleh OpenCV hingga akhir menurut pemeriksaan jumlah frame. Proporsi frame tersampel dengan sedikitnya satu tangan terdeteksi relatif rendah pada `belum` (29%), `saya` (37%), dan `minta` (42%). Angka ini dihitung sepanjang video, termasuk jeda; bukan ukuran langsung ketepatan isyarat. Periksa batas awal/akhir gerakan dan hasil landmark sebelum memakai data ini untuk model berikutnya.

Setelah normalisasi menjadi 30 langkah, `belum` memiliki 8 langkah dengan tangan, `saya` 9, dan `minta` 7. Model bisa mempelajari pola jeda atau kondisi rekaman selain gerakan. Augmentasi noise kecil tidak mengatasi kekurangan variasi pemeraga.

## Batas penggunaan dan langkah berikutnya

Model hanya merupakan eksperimen klip utuh. `releaseEligible` bernilai `false`. Tidak ada data negatif atau uji pengguna baru; semua input tetap menghasilkan skor kelas sehingga model dapat memberi tebakan pada gerakan asing. Skor bukan probabilitas kebenaran terkalibrasi.

Kontrak `hands-clip-normalized-v1` berbeda dari window streaming dua detik pada rancangan browser. Belum ada ekspor TensorFlow.js, parity preprocessing Python/TypeScript, decoder, atau benchmark webcam. Model tidak dipasang ke `public/` atau UI.

Berikutnya: lengkapi metadata serta referensi per label, periksa landmark/batas gerakan, tambah rekaman pemeraga dan sesi baru beserta negatif, lalu buat split peserta sebelum augmentasi. Setelah itu latih/evaluasi kandidat dengan kontrak temporal yang sesuai browser dan buktikan parity ekspor. T12/T14/T16 penuh tetap terbuka. Bukti tertulis serta cakupan publikasi model/klip masih perlu dicatat sebelum distribusi.

Panduan perintah: [ml/README.md](../ml/README.md). Rujukan API: [Hand Landmarker Python](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Python), [instalasi TensorFlow](https://www.tensorflow.org/install/pip), dan [LSTM Keras](https://www.tensorflow.org/api_docs/python/tf/keras/layers/LSTM).
