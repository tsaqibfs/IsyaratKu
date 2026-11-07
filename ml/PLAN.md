# Training lokal dari video referensi SIBI

Acuan desain: bagian 5, 6, dan 8 pada `../archtecture.md`, T12–T16 pada `../todo.md`, serta konfirmasi pemilik mengenai izin umum, peninjauan bentuk isyarat, pemisahan huruf/kata, dan satu gerakan per video. Ini eksperimen lokal yang diminta pemilik, bukan paket model rilis. Tidak ada perubahan UI atau publikasi.

Pendekatan: ekstraksi MediaPipe Tasks Vision VIDEO, dua slot handedness, penyimpanan landmark mentah dan checksum sumber, preprocessing berversi, dan LSTM 64 unit. MLP satu frame tidak dipakai untuk kata dinamis. Data baru lintas pemeraga belum ada sehingga tidak dibuat validation/test semu. Semua turunan satu klip hanya digunakan untuk train.

Kontrak eksperimen: 15 sampel/detik untuk ekstraksi, lalu seluruh klip satu gerakan dinormalisasi waktunya menjadi 30 langkah. Ini sengaja berbeda dari window streaming dua detik; model hanya menerima klip yang sudah disegmentasi dan tidak boleh langsung digunakan sebagai pengenal live. Interpolasi hanya pada tangan yang terlihat di dua frame berdekatan dengan gap maksimal 200 ms. Fitur 137 dimensi: dua kali 63 koordinat relatif pergelangan/skala telapak, tiga koordinat pergelangan, satu mask, ditambah tiga koordinat selisih kedua pergelangan. X dan Z disetarakan menurut rasio aspek; tidak ada pencerminan otomatis. Preprocessing browser dan parity belum termasuk lingkup.

- [x] T14 sebagian: inventaris rekursif dan tolak label duplikat atau file kosong; simpan provenance dan kualitas ekstraksi di direktori lokal yang diabaikan Git.
- [x] T12 sebagian: uji sebelum implementasi untuk urutan waktu tidak valid, gap/tangan hilang, invariansi skala bentuk, dan lintasan pergelangan yang tetap tersimpan. Implementasikan preprocessing Python eksperimen.
- [x] T16 eksperimen: latih LSTM dari klip kata dan augmentasi train terbatas (noise bentuk kecil, tanpa mirror atau mengubah urutan). Simpan `.keras`, label order, konfigurasi, history, environment, checksum, dan laporan `training_only` tanpa metrik generalisasi.
- [x] Verifikasi: unit test, ekstraksi nyata, training nyata, muat ulang model dengan hasil setara, dan pemeriksaan Git agar dataset/bobot tidak terlacak. Laporkan loss serta kecocokan pada sumber sebagai pemeriksaan hafalan saja.

File: `scripts/data.py` untuk inventaris/preprocessing, `scripts/extract.py` untuk landmark video, `scripts/train.py` untuk training dan verifikasi muat ulang, `tests/test_data.py` untuk kontrak, `configs/experiment.json` untuk pengaturan. Dependensi dikunci di `requirements.lock`; aset unduhan dan semua keluaran masuk ignore. Training dijalankan pada CPU lokal dalam `.venv` Python 3.12.

Keterbatasan yang wajib ikut model: pemeraga/sesi tidak diketahui, satu sumber per label, negatif tidak tersedia, tidak ada validation/test independen, makna tidak diverifikasi agen, izin berasal dari konfirmasi pemilik dan bukan penetapan lisensi oleh agen, ekspor TF.js dan parity browser belum diuji. T12/T14/T16 penuh tetap terbuka.

Hasil 6 November 2026: delapan unit test lulus pada Python 3.12.14, ekstraksi 23 klip berhasil, 100 epoch selesai, loss akhir 0,0008436764, kecocokan sumber 23/23, dan selisih prediksi setelah muat ulang model 0. Review kode menemukan celah perubahan keanggotaan dataset setelah ekstraksi; diperbaiki dengan perbandingan inventaris lengkap dan regression test. Model sekitar 670 KiB. Tidak ada hasil test independen atau klaim kesiapan browser. Ringkasan di `../reports/training-reference-v1.md`.

## Integrasi web yang diminta pemilik

Lingkup T08/T09/T17/T19 sebagian: gunakan model terlatih sebagai eksperimen klip tersegmentasi di web, tanpa mengubah bobot atau mengklaim pengenalan live kontinu. Model, WASM, dan detektor disajikan same-origin. Kamera tanpa mikrofon hanya aktif atas klik, berhenti pada stop/tab tersembunyi/unmount/perangkat hilang. Worker memproses maksimal satu frame aktif; frame ditutup setelah dipakai. Tidak menyimpan atau mengunggah video/landmark/percakapan.

UI mengikuti desain yang sudah ada: Mulai kamera, Rekam satu isyarat, Selesai dan periksa, Batal, serta kandidat dengan konfirmasi Gunakan kata. Rekaman hanya berupa buffer landmark sementara, maksimal 10 detik. Klip minimal satu detik; tangan tidak terdeteksi, gap frame di atas 200 ms, input tidak lengkap, dan skor lemah ditolak. Ambang awal skor 0,85/margin 0,15 bukan hasil kalibrasi. Konfirmasi hanya sekali per hasil. Tidak ada output acak, hardcode, atau auto-commit. Daftar 23 kata adalah label eksperimen, bukan kosakata rilis tervalidasi. Klip balik/suara tetap di luar lingkup.

- [x] Export bobot Keras ke TF.js Layers melalui konstruksi arsitektur dan pemasangan bobot identik, menggunakan format simpan resmi TF.js. Tolak arsitektur yang tidak cocok. Fixture prediksi asli tetap privat di `ml/runs`; fixture sintetis preprocessing boleh dilacak.
- [x] Python/TypeScript preprocessing parity pada fixture sintetis termasuk dua tangan, mask, gap, rasio aspek dan telapak degenerat; toleransi 0,00002. Keras/TF.js parity di browser pada 23 input sumber; toleransi skor 0,0001 dan top-1 harus sama. Tidak menyajikan fixture data sumber di public.
- [x] Worker MediaPipe + TF.js CPU, kontrak model ketat, timeout dan cleanup; controller kamera React dengan ID sesi untuk mengabaikan hasil lama.
- [x] Uji TDD penolakan/kandidat/editor dan lifecycle; browser nyata dengan fake camera untuk otomasi izin/stop/hilang perangkat/visibility, model nyata untuk parity, audit network/storage, benchmark dan screenshot desktop/ponsel. Mock bukan bukti kualitas SIBI.
- [x] Update panduan/arsitektur/todo dengan hasil aktual dan batas evaluasi. Model tetap `releaseEligible: false`; evaluasi lintas peserta dan perangkat kamera fisik dicatat sebagai belum tersedia.

File baru: `ml/scripts/export_web.py`, `scripts/prepare-ml.mjs`, `src/ml/{preprocess,decision,contract,recognition.worker}.ts`, `src/features/camera/{useRecognition,RecognitionPanel}.tsx`, serta unit/e2e relevan. Generated assets di `public/ml/` diabaikan Git; build memeriksa kelengkapannya. Pekerjaan dilakukan pada branch `feat/t17-browser-model-integration` tanpa push/deploy.
