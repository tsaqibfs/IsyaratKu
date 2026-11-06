# Persiapan data dan training IsyaratKu

Tanggal: 6 November 2026. Status: panduan persiapan; belum ada dataset, model, atau skrip training yang siap dijalankan. Acuan: [PRD](../prd.md), [arsitektur](../archtecture.md), dan [todo](../todo.md).

## Alur yang akan dikerjakan

```text
Data SIBI berizin + label tervalidasi
  -> video/landmark dengan metadata peserta dan sesi
  -> pemeriksaan kualitas dan pembagian peserta
  -> ekstraksi serta preprocessing landmark berversi
  -> training classifier
  -> pemilihan model dan ambang pada validation
  -> ekspor TensorFlow.js dan pemeriksaan kesetaraan hasil
  -> evaluasi final pada peserta test dan sesi webcam nyata
```

MediaPipe Hand Landmarker menyediakan 21 titik per tangan. Kita menggunakan model detektor tersebut, lalu melatih classifier kosakata sendiri. Kata dinamis memerlukan informasi urutan gerakan; satu foto tangan tidak cukup untuk membuktikan pengenalannya.

## Yang bisa dicicil sekarang

| Urutan | Pekerjaan | Hasil yang disiapkan |
| --- | --- | --- |
| 1 | Tentukan 5–10 kandidat kebutuhan kelas | Daftar kata, arti, dan tautan referensi; status belum tervalidasi |
| 2 | Cari sumber data dan pendamping | Permohonan akses dataset atau kontak pengajar/pengguna SIBI |
| 3 | Siapkan tempat rekam | Laptop/webcam atau HP, penyangga stabil, cahaya merata, latar sederhana |
| 4 | Susun tata kelola data | Persetujuan rekaman, izin publikasi terpisah, penyimpanan, dan jadwal penghapusan |
| 5 | Uji teknis mandiri | Sampel latihan berlabel eksplorasi untuk memeriksa framing dan landmark |
| 6 | Kumpulkan data tervalidasi | Peserta berbeda, sesi berbeda, pengulangan, dan sampel negatif |
| 7 | Latih dan uji model | Laporan metrik dan model browser yang dapat dibandingkan dengan training |

Jangan memulai pengumpulan besar sebelum label dan bentuk isyarat diperiksa. Rekaman tiruan sendiri yang belum ditinjau tidak dijadikan bukti bahwa aplikasi mengenali SIBI dengan benar. Membuat rekaman latihan tidak mengubah status validasi kosakata publik aplikasi.

## Sumber data yang sudah diperiksa

- [Dataset SIBI, Mendeley V3](https://data.mendeley.com/datasets/44pbrbsnkh/3): mencakup angka, alfabet, imbuhan, dan kalimat; dataset lengkap memerlukan DUA serta persetujuan pemilik. Mahasiswa diminta menyertakan rekomendasi pembimbing. Periksa kembali cakupan izin untuk training, model turunan, demo lomba, serta publikasi klip. Sampel yang bisa dilihat tidak otomatis berarti seluruh dataset bebas digunakan.
- Dataset tersebut bukan kumpulan 30 kata kelas terisolasi yang langsung cocok dengan PRD. Inventarisasi label dan kebutuhan anotasi sebelum menentukan penggunaannya. Jangan memberi label satu kata pada seluruh klip kalimat.
- [Kamus SIBI Kemendikdasmen](https://pkplk.kemendikdasmen.go.id/sibi/pencarian/pencariankata) dapat menjadi referensi demonstrasi. Izin pemakaian ulang video untuk training/hosting tetap perlu diperiksa.

Tidak ada video yang diunduh atau dataset yang dikumpulkan oleh pembuatan panduan ini.

## Peralatan dan lingkungan

- Gunakan perangkat yang sudah ada untuk uji awal. CPU dapat dicoba untuk classifier landmark kecil; kebutuhan aktual dinilai setelah ukuran data dan model diketahui. Belum perlu membeli GPU.
- Kamera harus menampilkan seluruh gerakan dan kedua tangan ketika diperlukan. Kamera laptop berguna untuk mendekati kondisi penggunaan akhir; HP boleh menjadi alat rekam tambahan dengan metadata orientasi/resolusi yang jelas.
- Simpan dataset di lokasi terbatas di luar repository, dengan cadangan sesuai persetujuan peserta. Jangan mengunggah ke notebook cloud tanpa memeriksa izin datanya.
- Training direncanakan memakai Python, TensorFlow/Keras, NumPy, utilitas evaluasi, dan converter TensorFlow.js. Dependensi akan dikunci setelah uji training -> ekspor -> browser berhasil; jangan memasang semua versi terbaru secara acak.
- Mesin saat ini memiliki Python 3.14.6. Kompatibilitas lingkungan training belum diuji. Gunakan lingkungan virtual terpisah dengan kombinasi versi Python/TensorFlow/converter yang terbukti cocok; jangan mengganti Python global hanya untuk proyek ini.
- Alat rekam landmark, pipeline preprocessing, dan skrip training masih perlu diimplementasikan. Folder `ml/scripts` belum berisi perintah training yang bisa dijalankan.

## Prosedur rekam yang diusulkan

1. Pelajari referensi yang sudah diperiksa validator. Jelaskan tujuan, jenis data yang disimpan, serta hak peserta sebelum merekam.
2. Gunakan ID peserta pseudonim, misalnya `p001`; simpan pemetaan identitas dan persetujuan terpisah dari sampel.
3. Satu klip merekam satu pengulangan utuh: jeda netral, isyarat, lalu kembali netral. Jangan memotong awal/akhir gerakan. Durasi mengikuti gerakannya, bukan dipaksa sama untuk semua kata.
4. Pertahankan posisi tangan yang diperlukan dalam frame dan hindari backlight. Catat tangan dominan, orientasi, dan apakah koordinat/pratinjau dicerminkan.
5. Rekam beberapa sesi dengan variasi jarak, pencahayaan wajar, dan latar. Hindari merekam satu kata selalu pada latar yang berbeda dari kata lain.
6. Periksa hasil setiap beberapa rekaman agar tangan terpotong atau file rusak diketahui lebih awal.
7. Tambahkan sampel netral, transisi, gerakan biasa, dan isyarat di luar kosakata. Sistem harus belajar kapan tidak menghasilkan kata.

Target awal dari PRD: 6 peserta x 20 pengulangan per kata, tersebar dalam minimal 2 sesi per peserta. Dua puluh adalah total pengulangan per kata per peserta, misalnya 10 pada tiap sesi. Dengan 5 kata, targetnya 600 klip positif; dengan 10 kata, 1.200, di luar sampel negatif. Ini sasaran pengumpulan awal, bukan jaminan kecukupan atau akurasi.

Untuk latihan teknis pribadi, 5 kandidat x 10 pengulangan dapat membantu memeriksa alur rekam dan ekstraksi. Semua tetap ditandai eksplorasi dan belum tervalidasi; jumlah tersebut belum memenuhi evaluasi lintas peserta.

## Metadata dan nama sampel

Contoh nama: `p001_s01_k001_r001.mp4`. Gunakan ID kata stabil, bukan nama peserta. Ekspor landmark kelak menggunakan ID sampel yang sama.

| Informasi | Contoh / tujuan |
| --- | --- |
| ID sampel, peserta, sesi | Menelusuri asal sampel dan menghindari kebocoran split |
| ID kata dan versi referensi | Memastikan arti serta bentuk isyarat konsisten |
| Status validasi | Eksplorasi / menunggu tinjauan / tervalidasi |
| Kondisi kamera | FPS aktual, resolusi, orientasi, konvensi mirror |
| Batas waktu gerakan | Awal/akhir gerakan untuk window dan pengukuran latensi |
| Kualitas | Oklusi, tangan keluar frame, atau alasan penolakan |
| Referensi persetujuan | ID dokumen persetujuan, bukan identitas di dalam sampel |
| Versi skema/fitur | Menjaga kesamaan preprocessing training dan browser |

Saat alat ekspor tersedia, ikuti kontrak resmi di arsitektur. Tabel ini bukan pengganti skema mesin yang sudah diuji.

## Training dan evaluasi

- Pisahkan peserta sebelum membuat window atau augmentasi. Usulan PRD: 3 peserta train, 1 validation, 2 test. Semua sesi/klip/frame turunan satu peserta berada pada split yang sama.
- Bandingkan baseline statis untuk kata statis dan model temporal kecil untuk gerakan dinamis. Pemilihan akhir mengikuti hasil validation dan biaya browser.
- Normalisasi bentuk tangan sambil mempertahankan lintasan pergelangan dan hubungan dua tangan. Gunakan fitur yang sama pada Python dan browser.
- Pilih hyperparameter dan ambang abstain pada validation. Jangan memakai test berulang kali untuk memperbaiki model.
- Laporkan macro-F1, precision/recall tiap kata, confusion matrix, coverage, dan penerimaan salah pada gerakan negatif. Akurasi pada orang yang ikut training belum membuktikan kemampuan pada pengguna baru.
- Uji ekspor ke TF.js sejak subset kecil. Bandingkan hasil Python dan browser pada input identik sebelum memperluas kosakata.
- Setelah evaluasi klip, uji webcam sungguhan: pengulangan kata, tangan hilang, gerakan asing, FPS, latensi, dan sesi panjang.

## Checklist sebelum training serius

- [ ] Label dan referensi 5–10 kata sudah diperiksa bersama validator SIBI.
- [ ] Hak penggunaan dataset dan persetujuan peserta jelas.
- [ ] Peserta/sesi/ID sampel tercatat tanpa identitas dalam dataset kerja.
- [ ] Contoh negatif tersedia dan file rusak/gerakan terpotong ditandai.
- [ ] Split peserta dibekukan tanpa kebocoran frame/klip.
- [ ] Preprocessing berversi dan setara pada training/browser.
- [ ] Lingkungan Python dan converter sudah diuji dengan ekspor model kecil.
- [ ] Target evaluasi PRD disepakati sebelum melihat hasil test.

## Rujukan teknis

- [MediaPipe Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).
- [Instalasi TensorFlow dan kebutuhan lingkungan](https://www.tensorflow.org/install/pip).
- [Konversi model TensorFlow.js](https://www.tensorflow.org/js/guide/conversion).
