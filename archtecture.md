# Arsitektur IsyaratKu

Pembaruan 7 November 2026: paket aktif `words-reference-v2` memakai 31 kelas dan kontrak fitur yang sama. ID model, path konfigurasi training, serta jumlah kelas berasal dari `ml/configs/active-model.json`; exporter/runtime/UI/e2e tidak lagi mengunci 23 kelas. Validasi versi sumber/target, handshake worker, dan query versi mencegah pemakaian paket/worker yang tidak sesuai. Run v1 tetap disimpan; rincian verifikasi di `reports/training-reference-v2.md`. Catatan 6 November berikut adalah riwayat v1.

Nama file mengikuti permintaan: `archtecture.md`.  
Status: kontrak MVP dengan integrasi eksperimen klip utuh; target rilis belum terpenuhi. Rancangan awal 1 November 2026, diperbarui 6 November 2026.
Acuan: [PRD](prd.md), [panduan agen](agents.md), [rencana kerja](todo.md).

Pembaruan setup 2 November 2026: fondasi SPA dan struktur folder mulai diimplementasikan pada T06. Bagian pipeline kamera, worker, preprocessing, classifier, dan pelatihan di bawah tetap merupakan rancangan. `public/vocabulary.json` berisi daftar kosong dengan status `awaiting-validation`; tidak ada kata yang diklaim didukung. Nama file tetap `archtecture.md`, sesuai dokumen awal.

Fondasi teruji: React 19.3.1, TypeScript 6.0.3, Vite 8.3.5, Vitest 5.0.5, dan Playwright 1.64.1 pada Node.js 26.8.2. Semua dependensi langsung dikunci exact dalam `package.json` dan dependensi transitif dalam `package-lock.json`. MediaPipe Tasks Vision 0.10.21 dan TF.js 4.22.0 kini terpasang dan teruji pada worker CPU Chrome untuk eksperimen. Rincian keputusan dan batas evaluasi ada pada bagian 10; validasi perangkat fisik serta target rilis tetap terbuka.

## 1. Keputusan awal

| Area | Keputusan | Alasan |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | SPA statis dengan akses API browser; belum membutuhkan SSR |
| Deteksi tangan | `@mediapipe/tasks-vision`, Hand Landmarker, mode VIDEO, maksimal 2 tangan | Landmark untuk pengenalan kosakata terbatas |
| Klasifikasi | TensorFlow.js; baseline MLP untuk kata statis, model temporal kecil untuk kosakata dinamis | Bentuk tangan saja tidak mewakili seluruh gerakan |
| Pelatihan | Python + TensorFlow/Keras dan converter TF.js dalam lingkungan versi terkunci | Eksperimen terpisah dari aplikasi pengguna |
| Eksekusi | Worker untuk pipeline berat, satu frame aktif | Menjaga respons UI dan menghindari backlog |
| Penyajian | Hosting statis HTTPS, semua aset dari origin yang sama | Tidak perlu server inferensi; kamera memerlukan secure context |
| Suara | Web Speech API, hanya suara Indonesia lokal yang tersedia | Menjaga teks tidak dikirim ke layanan suara jarak jauh |
| Teks ke isyarat | Manifest kosakata dan klip lokal yang telah divalidasi | Cakupan jelas tanpa avatar generatif |
| Penyimpanan | Buffer sesi di memori; ekspor dataset lokal secara manual | Meminimalkan data yang tersimpan |

Versi paket, backend TF.js, dan dukungan worker/GPU harus dipilih berdasarkan spike pada perangkat acuan. “Tanpa GPU server” tidak berarti browser tidak boleh menggunakan GPU perangkat.

## 2. Aliran sistem

```text
Mode komunikasi
Webcam -> pengambil frame -> worker Hand Landmarker
                              -> preprocessing -> buffer temporal
                              -> classifier TF.js -> decoder
                              -> kandidat / kata diterima -> UI teks -> suara lokal opsional

Teks diketik -> normalisasi/tokenisasi -> lookup manifest -> pemutar klip tervalidasi

Mode pengumpulan terpisah
Persetujuan -> sesi rekam -> landmark + metadata -> ekspor lokal manual
                                              -> penyimpanan dataset terbatas

Di lingkungan pelatihan
Dataset -> validasi -> split per peserta -> preprocessing berversi
        -> pelatihan -> validation -> ekspor TF.js -> parity -> evaluasi test
        -> paket model yang dipublikasikan bersama aplikasi
```

Hosting hanya mengirim HTML, JS, WASM, model, dan klip. Tidak ada endpoint unggah kamera atau percakapan dalam MVP.

## 3. Struktur folder yang direncanakan

```text
src/
  app/                  # komposisi halaman dan state sesi
  features/
    camera/             # izin, MediaStream, lifecycle
    recognition/        # orchestration, status, hasil
    conversation/       # editor dan urutan kata
    text-to-sign/       # lookup kosakata dan pemutar klip
    dataset/            # UI rekam lokal khusus pengembangan
  ml/
    contracts.ts        # skema pesan dan metadata
    preprocess.ts       # transformasi fitur
    decoder.ts          # kestabilan dan penerimaan kata
    inference.worker.ts # landmarker dan classifier
  services/speech.ts
  components/           # kontrol UI bersama
public/
  models/               # hanya paket model rilis
  mediapipe/            # WASM dan aset landmarker
  signs/                # klip yang diizinkan untuk publikasi
  vocabulary.json
ml/
  scripts/              # validasi, split, train, export, evaluate
  configs/              # hyperparameter, seed, versi fitur
  fixtures/             # contoh sintetis untuk parity, tanpa identitas
  requirements.txt      # versi terkunci setelah spike
reports/                # metrik agregat tanpa identitas peserta
tests/                  # unit, integrasi, dan e2e yang relevan
data-local/             # data lokal diabaikan Git, tidak dibundel
```

Data mentah dan identitas sebaiknya berada di luar repository. `data-local/` hanya area kerja bila benar-benar dibutuhkan, dengan akses terbatas dan aturan ignore sejak awal. Mode dataset dikecualikan dari build publik atau dinonaktifkan melalui konfigurasi build; flag frontend bukan pengamanan data server.

## 4. Lifecycle kamera dan worker

1. Pengguna menekan mulai; aplikasi meminta `video` saja, bukan audio.
2. UI memuat aset dan menginisialisasi worker; tampilkan status sampai siap.
3. Kirim frame beserta ID sesi dan timestamp monoton. Jangan mengirim frame baru sebelum worker selesai dengan frame sebelumnya.
4. Gunakan ImageBitmap atau mekanisme transferable yang lolos uji browser. Tutup resource setelah digunakan; frame lama dibuang, bukan ditumpuk.
5. Worker mengembalikan hasil ringkas; pembaruan UI dibatasi agar tidak memicu render setiap frame.
6. Saat berhenti, tab tersembunyi, atau komponen dilepas: hentikan track, kosongkan window, batalkan audio, lepaskan tensor, dan hentikan worker. Pengaktifan ulang memerlukan tindakan pengguna.
7. Abaikan hasil worker dari ID sesi lama agar kata tidak muncul setelah kamera dihentikan.

Dokumentasi MediaPipe menyebut operasi deteksi web bersifat sinkron dan dapat memblokir thread pemanggil. Worker adalah rancangan utama, tetapi integrasi harus dibuktikan pada browser acuan. Jika delegate GPU gagal, coba backend CPU/WASM yang kompatibel dan ukur ulang; jangan menyembunyikan penurunan performa.

## 5. Kontrak data dan fitur

### Sampel pengumpulan

Satu sampel adalah satu klip gerakan lengkap. Simpan metadata berikut:

| Field | Isi |
| --- | --- |
| `sampleId`, `participantId`, `sessionId` | ID pseudonim dan pengelompokan sesi |
| `labelId` | ID kata tervalidasi atau label negatif yang disepakati |
| `schemaVersion`, `preprocessVersion` | Versi format dan fitur |
| `frames` | Timestamp relatif, koordinat 21 titik per tangan, mask tangan, dan skor handedness |
| `startMs`, `endMs` | Batas gerakan untuk anotasi dan evaluasi latency |
| `capture` | FPS aktual, resolusi, orientasi, dan konvensi mirror |
| `quality` | Tangan keluar frame, oklusi, atau alasan sampel ditolak |
| `consentRef`, `referenceVersion` | Referensi persetujuan dan versi demonstrasi, tanpa nama peserta |

Normalisasi tidak menggantikan penyimpanan landmark sumber: simpan landmark dengan presisi cukup agar fitur dapat dibentuk ulang. Video mentah tidak direkam secara default; jika diperlukan untuk validasi, minta persetujuan terpisah dan tetapkan masa simpan.

### Preprocessing versi awal

- Urutkan slot tangan secara konsisten berdasarkan konvensi handedness yang diuji, bukan urutan deteksi array. Gunakan pelacakan kontinuitas bila skor handedness ambigu.
- Cerminkan pratinjau hanya untuk kenyamanan UI. Koordinat model mengikuti konvensi yang sama pada dataset dan browser; uji pengguna bertangan dominan kiri dan kanan tanpa menganggap mirroring selalu sah secara linguistik.
- Representasikan bentuk lokal: posisi relatif terhadap pergelangan masing-masing tangan, dinormalisasi dengan skala telapak yang tahan pembagian nol.
- Pertahankan posisi relatif antarpergelangan dan perpindahan pergelangan sepanjang window. Jangan melakukan centering per frame yang menghapus lintasan gerak atau posisi relatif dua tangan.
- Pertahankan mask tangan hilang. Jangan menyamakan koordinat nol hasil padding dengan tangan valid.
- Window temporal awal 30 frame pada laju sampel target 15 Hz, sekitar 2 detik, dengan stride awal 5 frame. Angka ini hipotesis yang harus dituning menggunakan validation.
- Gunakan timestamp untuk resampling. Tolak/reset window dengan gap panjang; jangan menyambungkan dua gerakan yang terputus.
- Tetapkan dimensi fitur dan kebijakan padding di konfigurasi sebelum training; ukuran input harus diperiksa saat memuat model.
- Jika perlu mean/std, hitung hanya dari train dan ekspor statistiknya. Augmentasi hanya pada train dan harus menjaga arti isyarat.

MVP tidak memiliki fitur wajah atau landmark tubuh. Kata yang memerlukan posisi absolut terhadap tubuh dan tidak dapat dibedakan oleh fitur ini dikeluarkan dari lingkup, kecuali ada perubahan arsitektur yang disepakati.

### Paket model rilis

Satu direktori versi berisi `model.json`, shard bobot, `labels.json`, `preprocess.json`, dan `metadata.json`. Metadata minimal mencakup versi model, bentuk input, urutan label, versi kosakata, versi fitur, konfigurasi window, ambang decoder, backend teruji, versi lingkungan pelatihan, checksum aset, dan ringkasan evaluasi.

Untuk format TF.js Layers, gunakan loader Layers; bila memilih GraphModel, ubah loader dan kontraknya secara eksplisit. Jangan menganggap semua operasi LSTM atau semua kombinasi versi Keras/converter pasti kompatibel: buktikan lewat ekspor dan parity awal.

### Pesan worker

| Arah | Pesan | Isi penting |
| --- | --- | --- |
| UI ke worker | `INIT` | Lokasi aset dan versi kontrak |
| UI ke worker | `FRAME` | ID sesi, ID frame, timestamp, frame transferable |
| UI ke worker | `RESET` / `DISPOSE` | Reset decoder atau pelepasan resource |
| Worker ke UI | `READY` | Versi model dan backend aktif |
| Worker ke UI | `RESULT` | Status, kandidat, skor, kata diterima opsional, durasi tahap |
| Worker ke UI | `ERROR` | Kode kesalahan dan apakah dapat dicoba ulang |

Runtime harus menolak label order, dimensi fitur, atau versi preprocessing yang tidak cocok. Jangan melanjutkan dengan keluaran yang mungkin salah pemetaan.

## 6. Model dan penerimaan kata

### Tahap model

1. Baseline MLP untuk subset statis menguji alur landmark, training, dan TF.js.
2. Untuk kosakata dinamis, bandingkan LSTM kecil atau temporal model ringan pada window yang sama. Pilih berdasarkan kualitas lintas peserta dan biaya browser.
3. Model rilis untuk kosakata campuran harus menggunakan bukti temporal yang memadai; jangan menganggap MLP satu frame cukup untuk semua kata.
4. Sertakan data negatif pada training dan lakukan pengujian unknown. Label negatif serta ambang tidak menjamin semua gerakan asing akan ditolak.

### State decoder

```text
idle -> collecting -> candidate -> committed -> wait-neutral -> collecting
                    |                           |
                    +-> collecting/unknown      +-> idle saat kamera berhenti
```

- Deteksi tangan saja tidak cukup untuk menerima kata.
- Kandidat perlu melewati ambang skor, selisih skor dua kelas teratas, dan kestabilan beberapa window.
- Nilai awal eksperimen: skor 0,85, margin 0,15, kestabilan 3 window; semua dituning hanya pada validation dan disimpan dalam metadata.
- `committed` menambahkan satu kata. Output berikutnya terkunci sampai kondisi netral/jeda terdeteksi selama durasi minimum.
- Nilai awal jeda netral 400 ms. Bedakan jeda antar-kata dari tangan teroklusi di tengah gerakan menggunakan reset buffer dan window baru yang lengkap.
- Cooldown waktu saja tidak cukup: menahan satu isyarat tidak boleh menghasilkan kata berulang.
- Skor rendah menghasilkan “belum dikenali”, bukan kata tebakan. Teks diterima tetap dapat dikoreksi pengguna.

## 7. Ketik ke isyarat dan suara

Manifest kosakata memetakan `labelId`, glos, variasi ejaan yang disetujui, arti, jenis gerakan, status validasi, versi referensi, serta lokasi klip berizin.

Normalisasi teks mencakup huruf kecil, spasi, dan tanda baca. Jika terdapat entri multi-kata, gunakan pencocokan frasa terpanjang yang deterministik. Kata tidak didukung diberi penanda dan tidak hilang diam-diam. Urutan klip mengikuti token input; aplikasi menjelaskan bahwa urutan ini bukan penerjemahan struktur bahasa.

Untuk suara, muat daftar voice dan tangani `voiceschanged`. Pilih `id-ID` atau varian Indonesia lokal yang kompatibel. Jika tidak ada voice lokal, nonaktifkan pembacaan dengan penjelasan dan pertahankan teks. Batalkan antrean lama saat stop/bersihkan; jangan membacakan kandidat yang berubah tiap window. Pilihan remote TTS memerlukan perubahan kebijakan privasi, bukan fallback otomatis.

## 8. Evaluasi dan pengujian

- Buat manifest split sebelum pelatihan; seluruh sampel satu peserta berada di satu split.
- Simpan konfigurasi, seed, versi dataset, dan daftar label setiap eksperimen.
- Pilih model/ambang pada validation. Jalankan test final setelah keputusan dibekukan; jika iterasi dilakukan setelah melihat test, catat kontaminasi dan siapkan test baru untuk klaim final.
- Bandingkan prediksi Python dan TF.js pada fixture identik dengan toleransi numerik yang ditetapkan sebelum pengukuran. Selidiki perubahan top-1 dan perbedaan besar, bukan hanya apakah file model dapat dimuat.
- Uji preprocessing parity terpisah dari parity classifier.
- Ukur macro-F1 klip tersegmentasi dan evaluasi sesi live decoder secara terpisah; nilai klip tidak membuktikan kualitas streaming.
- Benchmark mencakup cold load, warm load, waktu per tahap, processed FPS, p95 waktu setelah akhir isyarat, memori, dan total ukuran aset. Ukur model classifier terpisah dari landmarker/WASM.
- Uji kamera nyata dan network pada build produksi HTTPS atau localhost, bukan hanya mock.

## 9. Distribusi dan kegagalan

- Build statis dapat di-host pada layanan yang mendukung HTTPS; provider dipilih nanti sesuai aturan lomba.
- Aset WASM dan model menggunakan URL yang kompatibel dengan base path deploy dan tipe MIME yang tepat.
- Gunakan paket model berversi dengan manifest konsisten; jangan menyajikan bobot baru bersama metadata lama dari cache.
- Jangan mengklaim offline penuh. Setelah aset termuat, pengenalan tidak memerlukan request inferensi; reload offline harus diuji terpisah jika caching ditambahkan.
- Izin kamera ditolak: tampilkan langkah membuka izin dan pertahankan mode ketik.
- Model gagal: retry dan pesan jelas; jangan beralih ke hasil simulasi tanpa penanda.
- Backend lambat: turunkan laju sampling secara terkendali tanpa mengubah kontrak temporal diam-diam.
- Aset klip hilang: tampilkan kata dan pesan tidak tersedia, bukan demonstrasi yang salah.

## 10. Catatan keputusan yang perlu dilengkapi

| ID | Keputusan lanjutan | Waktu penyelesaian |
| --- | --- | --- |
| D-01 | Validator, peserta, kosakata final, izin klip | Sebelum rekam data |
| D-02 | Perangkat acuan dan versi browser | Sebelum benchmark awal |
| D-03 | Versi paket dan backend worker teruji | Saat spike pipeline |
| D-04 | Dimensi fitur, window, model temporal | Sebelum perluasan 30 kata |
| D-05 | Penanggung jawab dan tanggal penghapusan data | Sebelum rekam pertama |
| D-06 | Provider hosting dan aturan lomba | Sebelum demo publik |

### Eksperimen lokal 6 November 2026

Atas permintaan pemilik, video referensi kata dipakai untuk training eksperimen lokal setelah pemilik mengonfirmasi izin umum, bentuk isyarat yang sudah diperiksa, dan satu gerakan per video. Rincian eksekusi di `ml/PLAN.md` dan `ml/README.md`. Model, data, serta aset detektor tetap lokal dan diabaikan Git.

Kontrak `hands-clip-normalized-v1` memakai ekstraksi Hand Landmarker Tasks Vision VIDEO pada 15 Hz, dua slot handedness, fitur 137 dimensi, dan 30 langkah hasil normalisasi waktu seluruh klip. Fitur menyimpan bentuk relatif telapak, koordinat pergelangan, mask, serta selisih posisi kedua pergelangan. Interpolasi tidak melewati tangan hilang atau gap di atas 200 ms. LSTM 64 unit menjadi model eksperimen kata dinamis. Huruf tidak dicampurkan.

Ini bukan pengganti kontrak streaming rilis: klip disegmentasi dari awal dan durasinya dinormalisasi, sedangkan pipeline browser membutuhkan window serta decoder. Tidak dibuat split frame acak atau metrik test karena hanya ada satu klip per label dan metadata pemeraga belum tersedia. Semua turunan hanya train; model diberi `releaseEligible: false`. Parity muat ulang Keras diperiksa, tetapi parity Python/browser, ekspor TF.js, validasi lintas peserta, dan data negatif tetap diperlukan sebelum integrasi nyata. T12/T14/T16 penuh tetap terbuka.

### Integrasi browser eksperimen 6 November 2026

Atas permintaan pemilik, `words-reference-v1` kini dipakai pada web dengan batas klip tersegmentasi yang sama dengan training. Alur eksplisit mulai kamera → rekam satu isyarat → selesai/periksa → konfirmasi satu kata menggantikan auto-commit streaming untuk eksperimen ini. Tidak mengklaim penerjemahan bebas, model rilis, atau kualitas pada pengguna baru. Manifest kosakata rilis tetap kosong; metadata model memuat 23 label eksperimen.

Model Keras diekspor melalui bobot identik ke arsitektur TF.js Layers, disimpan memakai API resmi TF.js, dan diuji parity pada 23 input sumber (toleransi 0,0001; max error Chrome 1,1921e-7). Preprocessing `hands-clip-normalized-v1` dipakai di Python dan TypeScript dengan fixture sintetis dua tangan/mask/gap/aspek/telapak degenerat (toleransi 0,00002). Ini belum membuktikan parity penuh video-ke-landmark atau kualitas lintas peserta.

MediaPipe JS 0.10.21 dan TF.js 4.22.0 terkunci di lockfile npm. Worker klasik dibangun terpisah melalui Vite library IIFE, `publicDir: false`, ke `public/ml/runtime/recognition.worker.js`; loader WASM memakai `importScripts`, sehingga worker klasik yang sama disajikan pada dev dan produksi. `predev`/`prebuild` membangun worker lalu memeriksa aset. Model, WASM, dan detektor same-origin; paket model memeriksa hash, versi fitur, bentuk input/output, dan label order sebelum dipakai. Aset generated berada di ignore; tidak ada data mentah atau fixture sumber di public.

Controller membatasi satu frame aktif, menutup ImageBitmap setelah pemrosesan, memakai ID sesi/klip untuk menolak hasil lama, dan melepas track/worker saat stop/unmount/visibility hidden/perangkat berakhir. Model CPU hanya mengeluarkan kandidat setelah klip selesai. Ambang eksperimen skor 0,85/margin 0,15 belum dikalibrasi. Durasi 1–10 detik, gap frame maksimal 200 ms, minimal lima frame tangan, dan proporsi kehadiran tangan minimal 20%. Jeda netral awal/akhir diperbolehkan, tetapi tangan hilang di tengah interval aktif di atas 400 ms ditolak. Kualitas ini tidak menjamin kelengkapan semantik gerakan. Tidak ada auto-append; pengguna harus mengonfirmasi sekali per kandidat yang memenuhi ambang.

Pemeriksaan: 11 unit dan 6 e2e Chrome lulus, termasuk worker/model nyata dengan stream kanvas sintetis. Izin ditolak dan event hidden/perangkat terputus disimulasikan. Device fake bawaan Chrome berhenti sendiri bahkan pada contoh minimal; webcam fisik belum diuji. Uji 30 inferensi classifier tidak menambah tensor aktif; benchmark end-to-end/10 menit dan evaluasi lintas peserta tetap terbuka. Rincian di `reports/browser-integration-v1.md`; tugas T08/T09/T17/T19 penuh belum ditandai selesai.

## 11. Rujukan

- [Hand Landmarker web: setup, mode video, dan worker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js).
- [TensorFlow.js: konversi model](https://www.tensorflow.org/js/guide/conversion).
- [TensorFlow.js: menyimpan dan memuat model](https://www.tensorflow.org/js/guide/save_load).
- [MDN: getUserMedia dan secure context](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
- [MDN: localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).
- [MDN: voiceschanged](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event).
