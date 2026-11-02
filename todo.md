# Rencana kerja Isyaratku AI

Status per 2 November 2026: setup T06 selesai; halaman awal T07 tersedia sebagian. Dataset, model, dan pipeline kamera belum diimplementasikan.
Acuan: [PRD](prd.md), [arsitektur](archtecture.md), [panduan agen](agents.md).

## Cara menggunakan

Kerjakan fase secara berurutan sampai gerbang penerimaannya lolos. Tugas dalam fase yang sama boleh berjalan bersamaan bila dependensinya terpenuhi. Kotak hanya dicentang setelah bukti selesai tersedia.

Peran yang dipakai: produk/SIBI, frontend, ML/data, dan QA/demo. Pembagian ini belum menunjuk anggota tertentu; satu orang boleh menjalankan beberapa peran.

Prioritas: P0 wajib untuk alur MVP, P1 wajib sebelum demo final, P2 pengembangan setelah MVP. Semua angka performa adalah target dari PRD, belum capaian.

## Fase 0 — validasi kebutuhan dan batasan

- [ ] T01 · P0 · Produk/SIBI — Catat tenggat, format penilaian, anggota, dan aturan penggunaan dataset lomba. Selesai jika batasan dan penanggung jawab tercatat. Dependensi: tidak ada.
- [ ] T02 · P0 · Produk/SIBI — Temui minimal satu calon pengguna Tuli pengguna SIBI dan validator SIBI; sepakati lima skenario kelas. Selesai jika kebutuhan, pilihan bahasa, dan batasan komunikasi dikonfirmasi. Dependensi: tidak ada.
- [ ] T03 · P0 · Produk/SIBI + ML — Pilih 5–10 kata awal dari kandidat, tentukan referensi dan bentuk gerakan. Selesai jika setiap kata memiliki ID, klip/referensi tervalidasi, jenis gerakan, dan alasan dapat diamati lewat tangan. Dependensi: T02.
- [ ] T04 · P0 · ML/data — Siapkan persetujuan partisipasi, izin publikasi terpisah, akses penyimpanan, dan jadwal penghapusan. Selesai jika penanggung jawab dan mekanisme penarikan data jelas sebelum rekaman. Dependensi: T02.
- [ ] T05 · P0 · QA/demo — Tentukan laptop, webcam, browser, dan kondisi acuan. Selesai jika spesifikasi, versi browser, dan prosedur ukur awal tercatat. Dependensi: T01.

**Gerbang G0:** kebutuhan pengguna SIBI relevan, validator tersedia, kata awal disepakati, dan tata kelola data siap. Jika belum ada validator, kerjakan infrastruktur tanpa mengklaim label telah benar.

## Fase 1 — aplikasi dasar dan spike browser

- [x] T06 · P0 · Frontend — Bootstrap React + TypeScript + Vite dan struktur folder. Selesai jika skrip dev, lint, typecheck, test sekali jalan, build, preview, dan e2e tersedia serta lockfile disimpan. Dependensi: tidak ada. Bukti: semua skrip tersedia, lint/typecheck/build lulus, 2 unit test dan 2 e2e Chrome lulus; versi dan batasan audit dicatat di README.
- [ ] T07 · P0 · Frontend — Buat layar utama, panel teks, panel ketik ke isyarat, petunjuk, dan status. Selesai jika seluruh kontrol inti dapat dipakai dengan keyboard dan mock ditandai jelas. Dependensi: T06.
- [ ] T08 · P0 · Frontend — Implementasikan lifecycle webcam tanpa mikrofon. Selesai jika mulai/stop, izin ditolak, kamera sibuk, tab tersembunyi, dan unmount ditangani serta track benar-benar berhenti. Dependensi: T06.
- [ ] T09 · P0 · Frontend + ML — Jalankan Hand Landmarker dua tangan dalam worker. Selesai jika aset same-origin termuat, handedness/mirror diperiksa, hanya satu frame aktif, dan resource frame dilepas. Dependensi: T05, T08.
- [ ] T10 · P0 · ML + QA — Uji TF.js kecil di worker dan jalur ekspor Python ke browser. Selesai jika format loader benar, parity fixture terbukti, backend diuji, dan versi lingkungan dikunci. Dependensi: T06, T09.
- [ ] T11 · P0 · QA/demo — Ukur FPS, waktu per tahap, dan respons UI pada laptop acuan. Selesai jika hasil spike dan keputusan backend dicatat di arsitektur. Dependensi: T09, T10.

**Gerbang G1:** deteksi dan inferensi model uji berjalan di browser dengan UI responsif. Model uji bukan model SIBI dan tidak memenuhi syarat demo produk.

## Fase 2 — alat pengumpulan dan data awal

- [ ] T12 · P0 · ML/data — Bekukan skema sampel, konvensi koordinat, mask, dan preprocessing v1. Selesai jika fixture sintetis menghasilkan fitur setara di Python dan TypeScript, termasuk dua tangan/hilang satu tangan. Dependensi: T03, T09.
- [ ] T13 · P0 · Frontend + ML/data — Buat mode rekam lokal dengan label, countdown, quality check, preview, stop, dan ekspor manual. Selesai jika mode normal tidak merekam dan metadata sampel lengkap. Dependensi: T04, T12.
- [ ] T14 · P0 · ML/data — Buat validator dataset dan manifest split peserta. Selesai jika format rusak, label asing, timestamp tidak valid, serta kebocoran peserta antar-split dapat dideteksi. Dependensi: T12.
- [ ] T15 · P0 · Produk/SIBI + ML/data — Rekam 5–10 kata awal beserta netral, transisi, dan gerakan asing. Target rencana 6 peserta, 20 pengulangan/kata/peserta, minimal 2 sesi; jika tidak tercapai, catat batas evaluasi. Selesai jika data berizin, dianotasi, diperiksa validator, dan dibagi per peserta. Dependensi: T03, T04, T13, T14.

**Gerbang G2:** tersedia data awal bermutu dengan peserta train/validation/test terpisah. Jangan mengganti evaluasi lintas peserta dengan split frame acak ketika peserta kurang.

## Fase 3 — model awal dan alur pengenalan nyata

- [ ] T16 · P0 · ML/data — Latih baseline statis dan model temporal kecil untuk kata dinamis. Selesai jika konfigurasi, seed, dataset version, label order, serta metrik validation tersimpan. Dependensi: T10, T15.
- [ ] T17 · P0 · ML + Frontend — Ekspor kandidat ke paket model berversi dan integrasikan browser. Selesai jika parity preprocessing/model lolos dan mismatch metadata ditolak. Dependensi: T12, T16.
- [ ] T18 · P0 · ML + Frontend — Implementasikan decoder, abstain, jeda netral, dan reset. Selesai jika tahan isyarat tidak menggandakan kata, ulang setelah netral dapat diterima, serta tangan hilang tidak memicu hasil. Dependensi: T17.
- [ ] T19 · P0 · Frontend — Hubungkan output nyata ke editor teks, hapus kata, dan bersihkan sesi. Selesai jika kandidat terpisah dari kata diterima dan hasil worker sesi lama diabaikan. Dependensi: T07, T18.
- [ ] T20 · P0 · QA + Produk/SIBI — Uji pilot live kata awal dan tentukan kelayakan perluasan memakai validation. Selesai jika error dominan, coverage, precision, dan performa dicatat tanpa menggunakan test untuk tuning. Dependensi: T11, T19.

**Gerbang G3:** alur kamera → kata nyata → koreksi berjalan untuk subset awal. Jika belum andal, perbaiki data/fitur atau kurangi lingkup sebelum menambah kata.

## Fase 4 — komunikasi dua arah dan perluasan kosakata

- [ ] T21 · P0 · Frontend — Tambahkan suara lokal Indonesia dan kontrol baca/stop. Selesai jika kandidat tidak dibaca, antrean tidak menumpuk, dan ketiadaan voice lokal memiliki fallback teks. Dependensi: T19.
- [ ] T22 · P0 · Produk/SIBI + Frontend — Buat manifest dan klip berizin untuk subset awal. Selesai jika lookup, pemutaran berurutan, replay, dan kata tidak dikenal bekerja tanpa klaim terjemahan bebas. Dependensi: T03, T04, T07.
- [ ] T23 · P1 · Produk/SIBI + ML/data — Validasi target hingga 30 kata atau tetapkan subset final yang realistis. Selesai jika seluruh entri memiliki referensi, arti, izin, dan keputusan kelayakan tangan saja. Dependensi: T20, T22.
- [ ] T24 · P1 · ML/data — Lengkapi data kosakata final dan negatif, tetap dengan split peserta. Untuk 30 kata, rencana 3.600 klip positif belum termasuk negatif; laporkan realisasi dan ketimpangan kelas. Dependensi: T23, T14.
- [ ] T25 · P1 · ML/data — Latih ulang, pilih kandidat dan ambang memakai validation, lalu bekukan paket rilis. Selesai jika reproducibility, parity browser, dan konfigurasi decoder terdokumentasi. Dependensi: T24, T18.
- [ ] T26 · P1 · Produk/SIBI + Frontend — Lengkapi klip semua kata final dan panduan penggunaan. Selesai jika jumlah kata aplikasi/model/manifest selaras dan tidak ada aset tanpa izin. Dependensi: T23, T22.

**Gerbang G4:** kedua arah bekerja untuk kosakata final. Jika kata final kurang dari 30, revisi PRD dan materi presentasi agar sesuai kemampuan aktual.

## Fase 5 — evaluasi final dan kesiapan rilis

- [ ] T27 · P1 · ML + QA — Jalankan test final lintas peserta setelah model dibekukan. Selesai jika macro-F1, per-class precision/recall, confusion matrix, dan hasil per peserta dilaporkan; target macro-F1 ≥ 0,85. Dependensi: T25.
- [ ] T28 · P1 · QA/demo — Uji live: precision hasil diterima ≥ 0,90, coverage ≥ 0,70, dan maksimal 1 penerimaan salah/menit pada sedikitnya 10 menit data negatif. Selesai jika jumlah trial, kondisi, dan kegagalan dilaporkan, termasuk kata mirip dan gerakan asing. Dependensi: T25, T27.
- [ ] T29 · P1 · QA/demo — Benchmark produksi dan sesi 10 menit. Selesai jika processed FPS ≥ 15, p95 setelah akhir isyarat ≤ 1.000 ms, tidak crash, dan memori stabil setelah warm-up; laporkan cold/warm load dan ukuran aset. Dependensi: T25, T05.
- [ ] T30 · P1 · QA + Frontend — Periksa network, storage, dan lifecycle pada build produksi. Selesai jika tidak ada unggahan video/landmark/teks, aset same-origin, kamera berhenti, dan mode dataset tidak aktif pada build publik. Dependensi: T21, T26, T25.
- [ ] T31 · P1 · QA + Produk/SIBI — Uji lima skenario dengan sedikitnya tiga pasangan pengguna. Selesai jika keberhasilan ≥ 80%, umpan balik pengguna Tuli dicatat, serta keyboard, label, kontras, dan status teks diperiksa. Dependensi: T21, T26, T28.
- [ ] T32 · P1 · Frontend + QA — Perbaiki masalah penghalang dan jalankan pemeriksaan relevan. Selesai jika lint, typecheck, unit/integrasi relevan, e2e inti, build, dan smoke test kamera nyata lolos. Perubahan model setelah test harus dicatat dan dievaluasi ulang secara jujur. Dependensi: T27–T31.

**Gerbang G5:** target PRD terpenuhi dengan bukti. Jika tidak, revisi lingkup secara terbuka dan ulangi pemeriksaan bagian yang terdampak. Tidak boleh menggantinya dengan hasil mock.

## Fase 6 — paket lomba dan demo

- [ ] T33 · P1 · Frontend — Deploy build ke hosting HTTPS sesuai aturan lomba. Selesai jika kamera, URL aset, base path, dan kompatibilitas cache diuji dari URL final. Dependensi: T01, T32.
- [ ] T34 · P1 · Produk + QA/demo — Susun panduan demo 3–5 menit, daftar kata, laporan metrik, batasan, dan narasi SDG berbasis hasil. Selesai jika semua klaim cocok dengan bukti dan jumlah kata rilis. Dependensi: T27–T33.
- [ ] T35 · P1 · QA/demo — Latihan demo di lokasi/kondisi menyerupai lomba. Siapkan build lokal dengan aset lengkap dan rekaman demo berizin yang ditandai sebagai rekaman. Selesai jika jalur utama dan pemulihan saat kamera/jaringan gagal dapat diulang. Dependensi: T33, T34.
- [ ] T36 · P1 · Produk + ML/data — Bekukan versi aplikasi/model dan audit paket yang dibagikan. Selesai jika tidak ada dataset mentah, identitas, atau klip tanpa izin, serta jadwal penghapusan data ditinjau. Dependensi: T35, T04.

**Gerbang G6:** URL demo, build cadangan, paket model konsisten, panduan, dan bukti evaluasi siap diserahkan.

## Setelah MVP

- [ ] T37 · P2 — Evaluasi caching/PWA bila kebutuhan offline terbukti; uji reload offline seluruh aset dan kebijakan update model.
- [ ] T38 · P2 — Perluas variasi peserta dan perangkat berdasarkan kesalahan yang paling sering dialami pengguna.
- [ ] T39 · P2 — Kajian fitur pose/wajah hanya jika kata yang diperlukan tidak dapat dibedakan dengan tangan; bahas biaya performa dan privasi.
- [ ] T40 · P2 — Kajian dukungan bahasa isyarat lain bersama komunitas terkait, sebagai dataset dan lingkup terpisah.

## Usulan waktu relatif

Ini perkiraan untuk perencanaan, bukan janji selesai. Rekrutmen peserta dan validasi dapat memperpanjangnya.

| Periode | Fokus |
| --- | --- |
| Minggu 1 | Fase 0–1: kebutuhan, kosakata awal, pipeline browser |
| Minggu 2 | Fase 2: alat rekam dan pengumpulan awal |
| Minggu 3 | Fase 3: model awal dan pengenalan nyata |
| Minggu 4 | Fase 4: komunikasi dua arah dan data perluasan |
| Minggu 5 | Fase 5: evaluasi, perbaikan, dan pengujian pengguna |
| Minggu 6 | Fase 6: deployment dan latihan demo |

Jika tenggat lebih dekat, prioritaskan 5–10 kata tervalidasi dengan alur dua arah yang terbukti sebelum mengejar 30 kata.

## Catatan progres

| Tanggal | Tugas | Status | Bukti / hambatan / langkah berikutnya |
| --- | --- | --- | --- |
| 2026-11-01 | Dokumen awal | Selesai | PRD, panduan agen, arsitektur, dan todo tersedia; seluruh tugas implementasi masih terbuka |
| 2026-11-02 | T06 | Selesai | React 19.3.1, TypeScript 6.0.3, Vite 8.3.5; dependensi exact dan lockfile tersedia; lint, typecheck, 2 unit test, build, dan 2 e2e pada Chrome lokal lulus |
| 2026-11-02 | T07 | Sebagian | Halaman awal, editor manual, status kosong, petunjuk dan keyboard tersedia; integrasi panel ketik ke klip serta status pipeline belum selesai; tugas tetap terbuka |
| 2026-11-02 | T01–T05 | Menunggu informasi/validasi | Tenggat, validator, peserta, izin rekaman, dan perangkat benchmark belum dikonfirmasi; infrastruktur T06 dikerjakan secara independen |

Format pembaruan: tanggal, ID tugas, status aktif/terhambat/selesai, hasil yang bisa diperiksa, dan dependensi yang masih diperlukan.
