# Persiapan data dan training IsyaratKu

## Pembaruan 7 November 2026

Dataset lokal kini 57 video (51.07 MiB): 26 huruf dan 31 kata. Model aktif `words-reference-v2` memiliki 31 kelas. Delapan tambahan dibanding v1: jumpa, kasih, pagi, paham-mengerti, sampai, selamat, terima, ujian. Terima dan Kasih adalah dua label terpisah. Seluruh input sumber v2 cocok pada uji parity Keras/TF.js Chrome; model tetap eksperimen tanpa test peserta baru. Bagian bertanggal 6 November di bawah adalah riwayat v1, bukan inventaris terbaru.

Konfigurasi aktif di `ml/configs/active-model.json` menunjuk `ml/configs/experiment-v2.json`. Run baru tersimpan di `ml/runs/words-reference-v2/`; run dan paket v1 tetap tersedia. Jalankan `npm run prepare:ml` untuk ekspor sesuai konfigurasi aktif, lalu `npm run dev` dan reload browser. Lihat [laporan v2](../reports/training-reference-v2.md).

Untuk menambah label lagi, buat konfigurasi training dengan `outputDir` versi baru dan `expectedLabelCount` yang sesuai, ekstrak/train pada versi tersebut, lalu ubah `modelId`, `configPath`, dan `expectedLabelCount` di konfigurasi aktif sebelum ekspor. Nama akhir direktori run harus sama dengan `modelId`. Jangan menimpa run lama. Jumlah langkah temporal tetap 30; angka itu berbeda dari jumlah kelas kata.

Tanggal: 6 November 2026. Status: video referensi tersedia secara lokal; pemilik mengonfirmasi izin umum, peninjauan bentuk isyarat, pemisahan huruf/kata, dan satu gerakan per video. Pipeline eksperimen training lokal ditambahkan; hasil dijelaskan pada laporan run setelah dijalankan. Acuan: [PRD](../prd.md), [arsitektur](../archtecture.md), dan [todo](../todo.md).

## Inventaris video lokal

Pemilik proyek menambahkan 49 file MP4 di `ml/dataset/`, berukuran total sekitar 44,36 MiB. Berdasarkan nama file, terdapat 26 label huruf A–Z dan 23 label kata, masing-masing satu file. Total durasi menurut metadata kontainer adalah 245,40 detik, dengan rentang 3,236–9,910 detik per file.

Label kata: Apa, Bantu, Belum, Buku, Guru, Halo, Jadwal, Kamu, Kelas, Maaf, Minta, Mulai, Nama, Saya, Sekolah, Selesai, Siapa, Tanya, Tidak, Tugas, Ulang, Waktu, dan Ya.

Pemilik menyatakan sumbernya dari [Kamus SIBI](https://pkplk.kemendikdasmen.go.id/sibi/pencarian/advance) dan mengonfirmasi izin penggunaan umum. Eksperimen lokal dilakukan atas konfirmasi tersebut; agen tidak menetapkan lisensi baru. Bukti tertulis dan cakupan distribusi model/klip belum dilampirkan. Pemilik telah memeriksa bentuk isyarat dan menyatakan satu video berisi satu gerakan. Data kini terpisah di `ml/dataset/huruf/` dan `ml/dataset/kata/`. Catat URL entri serta makna spesifik untuk ketertelusuran berikutnya.

Pemeriksaan awal hanya mencakup jumlah, nama, ukuran, header MP4, dan durasi. Seluruh 49 file mempunyai header MP4 dan metadata durasi yang terbaca. Pemeriksaan ini belum membuktikan semua frame dapat didekode, kualitas gerakan, jumlah pemeraga/pengulangan dalam video, atau kesesuaian dengan fitur tangan.

Folder lokal ini diabaikan Git dan belum menjadi dataset training tervalidasi. Jangan menyalinnya ke `public/`. Untuk penyimpanan jangka panjang, gunakan lokasi terbatas di luar repository sesuai aturan proyek. Tidak ada file yang dipindahkan oleh pemeriksaan ini.

Satu video per label belum menyediakan split lintas peserta yang dapat diverifikasi. Jangan membagi frame satu video secara acak ke train dan test. Sebelum training yang dilaporkan sebagai hasil produk, lengkapi izin, metadata pemeraga/sesi, peninjauan label, variasi sampel, serta data negatif. Video referensi dapat menjadi bahan uji teknis setelah cakupan penggunaannya jelas; hasil pada video yang sama bukan bukti generalisasi ke webcam pengguna baru.

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

Panduan ini tidak mengunduh video. Video lokal pada inventaris di atas ditambahkan oleh pemilik proyek.

## Peralatan dan lingkungan

- Gunakan perangkat yang sudah ada untuk uji awal. CPU dapat dicoba untuk classifier landmark kecil; kebutuhan aktual dinilai setelah ukuran data dan model diketahui. Belum perlu membeli GPU.
- Kamera harus menampilkan seluruh gerakan dan kedua tangan ketika diperlukan. Kamera laptop berguna untuk mendekati kondisi penggunaan akhir; HP boleh menjadi alat rekam tambahan dengan metadata orientasi/resolusi yang jelas.
- Simpan dataset di lokasi terbatas di luar repository, dengan cadangan sesuai persetujuan peserta. Jangan mengunggah ke notebook cloud tanpa memeriksa izin datanya.
- Training direncanakan memakai Python, TensorFlow/Keras, NumPy, utilitas evaluasi, dan converter TensorFlow.js. Dependensi akan dikunci setelah uji training -> ekspor -> browser berhasil; jangan memasang semua versi terbaru secara acak.
- Eksperimen memakai `.venv` Python 3.12 terpisah; dependensi tercantum di `requirements.in` dan seluruh hasil resolusi dikunci di `requirements.lock`. Python global tidak diganti. Converter TF.js belum termasuk lingkungan ini.
- `ml/scripts/extract.py` dan `ml/scripts/train.py` menyediakan jalur ekstraksi serta training eksperimen dari video lokal. Alat rekam peserta dan preprocessing browser belum diimplementasikan.

## Menjalankan eksperimen lokal

Jalankan PowerShell dari root repository. Setup pertama membutuhkan unduhan Python/paket dan model detektor resmi; video tidak diunggah.

```powershell
uv venv --python 3.12 .venv
uv pip sync ml/requirements.lock --python .venv/Scripts/python.exe
New-Item -ItemType Directory -Path ml/assets -Force | Out-Null
Invoke-WebRequest -Uri 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task' -OutFile ml/assets/hand_landmarker.task
```

Ekstraksi dan training:

```powershell
& .venv/Scripts/python.exe -m unittest discover -s ml/tests -v
& .venv/Scripts/python.exe ml/scripts/extract.py --config ml/configs/experiment.json
& .venv/Scripts/python.exe ml/scripts/train.py --config ml/configs/experiment.json
```

Konfigurasi bawaan memakai semua 23 kata yang ada di folder `kata`, LSTM 64 unit, seed 42, dan 100 epoch pada CPU. `labels: []` berarti semua label; isi daftar huruf kecil untuk subset. Huruf tidak dicampurkan ke model kata. Untuk run berikutnya, salin konfigurasi dan ganti `outputDir`; skrip menolak menimpa ekstraksi/model yang sudah ada.

Hasil lokal di `ml/runs/words-reference-v1/`:

- `raw/*.npz`: landmark, timestamp, mask, dan skor handedness per klip.
- `extraction.json`: provenance, checksum, dimensi, serta kualitas deteksi.
- `sequences.npz`: fitur urutan untuk training.
- `model.keras`: classifier terlatih; `labels.json` adalah urutan output wajib.
- `preprocess.json`, `history.json`, dan `report.json`: kontrak, loss, lingkungan, serta batasan model.

Eksperimen mengambil landmark pada 15 Hz lalu meresample SELURUH klip gerakan menjadi 30 langkah. Input memiliki 137 fitur per langkah. Kontrak ini bernama `hands-clip-normalized-v1` dan berbeda dari window live dua detik pada rancangan rilis. Model memerlukan klip tersegmentasi; tidak dipasang ke aplikasi atau `public/`. Kesetaraan preprocessing Python/TypeScript dan ekspor TF.js belum dibuktikan.

Tidak ada validation/test independen. Seluruh augmentasi hanya ditambahkan ke train dan bukan dihitung sebagai pemeraga baru. `sourceClipMemorizationAccuracy` pada laporan hanya memeriksa kecocokan dengan sumber yang ikut dilatih. Nilai `testAccuracy` dan `macroF1` sengaja `null`; skor softmax tidak dianggap probabilitas kebenaran. Jangan gunakan model ini sebagai bukti pengenalan pengguna baru atau kesiapan rilis.

### Hasil run pertama

Run `words-reference-v1` pada 6 November 2026 selesai: 23 klip sumber, 575 urutan termasuk augmentasi, 100 epoch, loss akhir 0,0008436764. Model cocok dengan 23/23 klip sumber yang ikut training. Selisih maksimum skor setelah menyimpan dan memuat ulang Keras adalah 0. Delapan unit test lulus pada lingkungan training. Ini belum akurasi test. Rincian dan kualitas ekstraksi ada di [laporan eksperimen](../reports/training-reference-v1.md).

## Integrasi browser eksperimen

Pemilik meminta model dihubungkan ke web. Jalankan dari root setelah training tersedia:

```powershell
npm run prepare:ml
npm run dev
```

`export_web.py` memeriksa arsitektur Keras, mengekspor bobot float32 dan fixture prediksi ke folder privat run. `prepare-ml.mjs` membuat arsitektur TF.js identik, memasang bobot asli, membandingkan 23 prediksi, lalu memakai API simpan Layers TF.js untuk menulis `model.json`/`weights.bin`. Ini tidak menggunakan converter Python tambahan. Label order, preprocessing, checksum, status eksperimen, dan ambang awal ikut paket. Semua aset termasuk detektor dan WASM disalin lokal ke `public/ml/` yang diabaikan Git. Fixture model berbasis data sumber tidak disalin ke public; fixture preprocessing yang dilacak sepenuhnya sintetis.

`predev` dan `prebuild` membangun worker klasik dan memeriksa kelengkapan aset. Worker klasik digunakan karena loader WASM MediaPipe memakai `importScripts`; kode worker yang sama dipakai pada dev dan produksi. Restart dev setelah mengubah worker. Tidak ada backend atau upload kamera.

Gunakan rekaman satu isyarat utuh 1–10 detik, lalu periksa kandidat dan konfirmasi manual. Pengambilan landmark memakai target 15 Hz dengan satu frame aktif, normalisasi klip utuh menjadi 30 langkah, dan preprocessing yang sama dengan Python. Gap frame di atas 200 ms, tanpa tangan, serta tangan hilang di tengah interval aktif lebih dari 400 ms ditolak. Jeda netral awal/akhir diperbolehkan. Gate ini tidak membuktikan seluruh gerakan sudah terekam atau menjamin penolakan semua unknown.

Pada 6 November 2026, fixture preprocessing sintetis lolos Python/TS dan classifier TF.js di Chrome cocok dengan Keras pada seluruh 23 input sumber (max error 1,1921e-7). Ini parity numerik classifier, bukan akurasi pengguna baru atau parity penuh video-ke-landmark antara platform. Field `browserParityVerified: false` pada kontrak training tetap menandai belum adanya validasi penuh tersebut. Tidak mengubah `releaseEligible: false`. Lihat [laporan integrasi](../reports/browser-integration-v1.md).

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


## Build dari GitHub untuk Vercel

`npm run prepare:ml` kini juga menulis paket inferensi ke `web-models/<modelId>/`. Folder ini harus di-commit bersama konfigurasi aktif. `public/ml/` tetap generated dan diabaikan Git. Pada hosting, `npm run check` menyiapkan aset dari paket tersebut, SDK npm, dan detektor resmi ber-checksum; tidak memakai dataset, `.keras`, atau Python. Lihat [panduan deployment](../DEPLOYMENT.md).
