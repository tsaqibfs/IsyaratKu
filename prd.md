# IsyaratKu — kebutuhan produk

Pembaruan 7 November 2026: model eksperimen di browser bertambah menjadi 31 label atas permintaan pemilik. Ini belum 31 kosakata rilis yang tervalidasi lintas peserta. Target dan batas MVP tetap dibedakan dari kemampuan eksperimen; lihat `reports/training-reference-v2.md`.

Status: rancangan awal untuk MVP lomba, belum tervalidasi oleh pengguna.  
Tanggal: 1 November 2026.  
Dokumen terkait: [arsitektur](archtecture.md), [panduan agen](agents.md), [rencana kerja](todo.md).

Pembaruan implementasi 6 November 2026: model eksperimen 23 kata sudah terhubung ke kamera/editor di browser melalui alur rekam satu isyarat dan konfirmasi kandidat. Input masih klip utuh tersegmentasi, belum pengenalan kontinu. Tidak ada evaluasi peserta baru; suara/klip balasan serta kriteria rilis di bawah belum terpenuhi. Rincian hasil dan batas pengujian ada di [laporan integrasi](reports/browser-integration-v1.md). Target MVP pada dokumen ini tetap menjadi acuan, bukan klaim kemampuan versi eksperimen.

## 1. Ringkasan

IsyaratKu membantu komunikasi sederhana antara mahasiswa Tuli pengguna SIBI dan dosen atau teman dengar di kelas. Aplikasi mengenali kosakata SIBI terbatas dari webcam menjadi teks, dengan pembacaan suara opsional. Pengguna dengar dapat mengetik kosakata yang didukung untuk menampilkan klip demonstrasi isyarat.

Pemrosesan kamera dan pengenalan berlangsung di browser. Tidak diperlukan server inferensi atau GPU server. Pelatihan model dilakukan terpisah sebelum aplikasi dirilis.

Judul presentasi yang disarankan: **IsyaratKu: pengenal kosakata SIBI untuk komunikasi kelas di browser**. Istilah “penerjemah real-time” harus disertai penjelasan bahwa MVP mengenali isyarat terpisah dengan jeda, bukan percakapan SIBI bebas.

## 2. Masalah dan sasaran

- Mahasiswa Tuli kesulitan menyampaikan kebutuhan kelas kepada orang yang belum memahami isyarat.
- Lawan bicara memerlukan hasil teks yang jelas dan cara memberikan balasan sederhana.
- Mengunggah video ke server menambah ketergantungan jaringan dan risiko privasi.

Tujuan MVP adalah membuktikan komunikasi dua arah pada skenario kelas terbatas, memakai perangkat yang tersedia untuk demo lomba.

Kaitan SDG merupakan tujuan dampak, bukan hasil yang sudah terbukti:

| Sasaran | Kontribusi yang diharapkan | Bukti yang dikumpulkan |
| --- | --- | --- |
| SDG 4: pendidikan berkualitas | Mempermudah penyampaian kebutuhan belajar | Keberhasilan menyelesaikan skenario kelas |
| SDG 10: berkurangnya kesenjangan | Mengurangi hambatan komunikasi sederhana | Umpan balik pengguna Tuli dan pasangan komunikasi |

## 3. Pengguna dan asumsi

| Pengguna | Kebutuhan |
| --- | --- |
| Mahasiswa Tuli pengguna SIBI | Hasil yang bisa dikoreksi dan kendali atas kamera serta suara |
| Dosen dan mahasiswa dengar | Teks terbaca dan demonstrasi balasan yang mudah dipahami |
| Tim proyek | Alur rekam data, evaluasi, dan demo yang dapat diulang |

Asumsi yang wajib diuji sebelum pengumpulan data besar:

1. Ada calon pengguna yang menggunakan atau memahami SIBI. Jangan menganggap semua pengguna Tuli menggunakan SIBI; BISINDO tidak diperlakukan sebagai label yang dapat dipertukarkan.
2. Ada validator SIBI dan peserta yang bersedia terlibat secara sukarela.
3. Kosakata terpilih dapat dibedakan dari gerakan tangan dalam bidang kamera. Kata yang memerlukan ekspresi wajah atau posisi tubuh yang tidak tercakup harus diganti atau ditunda.
4. Laptop demo memiliki webcam dan browser yang dapat menjalankan pipeline dengan lancar.
5. Tenggat, anggota tim, perangkat acuan, dan aturan lomba belum diketahui. Jadwal dalam todo adalah usulan relatif.

## 4. Lingkup MVP

### Wajib

- Satu pengguna di depan kamera, maksimal dua tangan, kosakata terpisah dengan jeda netral.
- Target awal 5–10 isyarat untuk membuktikan pipeline; target perluasan 30 kata setelah lolos evaluasi.
- Kamera dengan izin eksplisit, pratinjau, petunjuk posisi tangan, dan tombol berhenti.
- Teks kandidat, status keyakinan rendah, dan hasil yang telah diterima dipisahkan.
- Perakitan urutan kata, koreksi manual, hapus kata terakhir, dan bersihkan sesi.
- Pembacaan teks melalui tombol; pembacaan otomatis opsional dan mati secara default.
- Ketik ke klip isyarat untuk kosakata yang telah divalidasi. Kata tak dikenal ditandai.
- Daftar kosakata didukung, petunjuk penggunaan, batasan kemampuan, dan penjelasan privasi.
- Mode rekam dataset lokal yang terpisah dari mode penggunaan biasa.

### Di luar MVP

- Penerjemahan kalimat bebas, pemahaman tata bahasa, dan pengenalan isyarat kontinu tanpa jeda.
- Mengklaim dukungan seluruh SIBI atau dukungan BISINDO.
- Avatar generatif, penerjemahan otomatis teks bebas ke tata bahasa SIBI, atau speech-to-sign.
- Akun, sinkronisasi cloud, penyimpanan percakapan di server, dan analitik pihak ketiga.
- Penggunaan sebagai pengganti juru bahasa pada ujian, layanan medis, atau situasi penting lainnya.
- Dukungan semua perangkat, pemasangan PWA, dan jaminan pemuatan pertama tanpa jaringan.

## 5. Kandidat kosakata

Daftar berikut adalah **kandidat kata bahasa Indonesia**, bukan penetapan bentuk isyarat SIBI. Validator harus menentukan padanan, gerakan, varian, dan kelayakannya sebelum menjadi label model.

| Kelompok | Kandidat |
| --- | --- |
| Interaksi | saya, kamu, dosen, teman, tolong, terima kasih |
| Belajar | belajar, buku, tugas, ujian, kelas, materi |
| Klarifikasi | tanya, jawab, ulang, paham, belum, pelan |
| Kebutuhan | izin, toilet, minum, sakit, bantuan, selesai |
| Waktu dan respons | sekarang, nanti, ya, tidak, hadir, terlambat |

Setiap kata memiliki ID stabil, glos, arti dalam konteks kelas, jenis statis/dinamis, jumlah tangan, klip referensi, sumber, status validasi, dan validator. Daftar final boleh berbeda dari kandidat. Jangan memaksakan 30 kata jika kualitas data atau keterbedaan gerakan belum memadai.

## 6. Alur utama dan kebutuhan fungsional

| ID | Kebutuhan | Kriteria penerimaan |
| --- | --- | --- |
| FR-01 | Memulai dan menghentikan kamera | Izin diminta setelah tindakan pengguna; berhenti melepaskan seluruh track kamera; mikrofon tidak diminta |
| FR-02 | Panduan kesiapan | Ada status memuat model, siap, tangan tidak terlihat, dan petunjuk pencahayaan/posisi |
| FR-03 | Mengenali isyarat | Kandidat muncul setelah window cukup; kata hanya diterima setelah aturan kestabilan lolos |
| FR-04 | Menolak prediksi meragukan | Tangan hilang, gerakan transisi, atau skor di bawah ambang tidak menambahkan kata |
| FR-05 | Mencegah pengulangan | Menahan isyarat tidak menghasilkan kata berulang; kembali netral lalu mengulang dapat menghasilkan kata yang sama |
| FR-06 | Mengelola teks | Hasil dapat diedit, kata terakhir dihapus, dan sesi dibersihkan; tidak otomatis tersimpan setelah reload |
| FR-07 | Membaca hasil | Tombol baca/stop tersedia; hanya teks yang telah diterima atau dikoreksi dibaca; antrean dibatasi |
| FR-08 | Menampilkan isyarat dari teks | Pencocokan kosakata menampilkan klip berurutan dengan label dan kontrol putar ulang; kata tak dikenal tetap terlihat |
| FR-09 | Mode dataset | Mulai/stop/ekspor hanya setelah persetujuan khusus; mode normal tidak merekam atau mengekspor data |
| FR-10 | Menghadapi kegagalan | Penolakan izin, kamera sibuk, model gagal dimuat, dan suara tidak tersedia memiliki pesan serta tindakan pemulihan |
| FR-11 | Menjelaskan batasan | Daftar kata, kebutuhan jeda, dan batasan model dapat dibuka sebelum kamera dinyalakan |

Skenario demo utama:

1. Pengguna membuka aplikasi dan menyalakan kamera.
2. Pengguna melakukan kata tervalidasi, kembali netral, kemudian melakukan kata berikutnya.
3. Teks hasil terkumpul; pengguna memperbaiki hasil bila perlu lalu menekan baca.
4. Pasangan komunikasi mengetik balasan dari kosakata didukung dan memutar klip isyarat.
5. Pengguna menghentikan kamera dan membersihkan sesi.

## 7. Data dan evaluasi model

- Unit sampel: satu pengambilan isyarat lengkap, bukan satu frame.
- Usulan pengumpulan: sedikitnya 6 peserta, 20 pengulangan per kata per peserta, pada sedikitnya 2 sesi. Untuk 30 kata, ini berarti 3.600 klip positif; kecukupannya tetap harus ditentukan dari evaluasi.
- Tambahkan rekaman netral, transisi, gerakan biasa, dan isyarat di luar kosakata sebagai data negatif. Tangan tidak terdeteksi adalah kondisi sistem tersendiri.
- Rencana awal pembagian peserta: 3 train, 1 validation, 2 test. Semua sesi dan turunan sampel dari peserta yang sama harus berada di split yang sama.
- Gunakan validation untuk pemilihan model dan ambang. Test hanya untuk evaluasi akhir; jangan menggunakannya berulang kali untuk menyetel sistem.
- Laporkan macro-F1, precision/recall tiap kata, confusion matrix, tingkat abstain, penerimaan salah, dan hasil per peserta. Banyak frame dari klip yang sama bukan banyak sampel independen.
- Persetujuan pengumpulan data dan persetujuan publikasi klip harus terpisah. Ekspor landmark tetap diperlakukan sebagai data peserta yang dilindungi.

## 8. Target keberhasilan

Semua angka berikut adalah **target awal**, belum hasil pengukuran. Catat perangkat, browser, kondisi, jumlah peserta, dan jumlah pengulangan ketika melaporkan hasil.

| Aspek | Target penerimaan |
| --- | --- |
| Kualitas klasifikasi | Macro-F1 minimal 0,85 pada klip test peserta yang tidak digunakan dalam pelatihan |
| Kualitas hasil diterima | Precision minimal 0,90 dan coverage minimal 0,70 pada percobaan kata yang didukung; laporkan keduanya agar abstain tidak menyamarkan kegagalan |
| Gerakan negatif | Maksimal 1 kata salah diterima per 60 detik pada sedikitnya 10 menit pengujian negatif |
| Respons | P95 waktu dari akhir isyarat hingga kata diterima maksimal 1.000 ms; durasi window dilaporkan terpisah |
| Performa | Minimal 15 frame diproses/detik pada perangkat acuan; antarmuka tetap dapat dioperasikan |
| Stabilitas | Sesi 10 menit tanpa crash atau pertumbuhan memori terus-menerus setelah pemanasan |
| Pemakaian | Minimal 80% berhasil pada 5 skenario yang disepakati, diuji dengan sedikitnya 3 pasangan pengguna |
| Privasi | Tidak ada unggahan frame, landmark, atau percakapan pada mode normal, dibuktikan melalui pemeriksaan jaringan |

Coverage = percobaan kata didukung yang menghasilkan output dibagi seluruh percobaan kata didukung. Precision hasil diterima = output benar dibagi seluruh output yang diterima. Kegagalan model melewati target mengharuskan pengurangan kosakata atau perbaikan data sebelum klaim siap demo.

## 9. Aksesibilitas dan privasi

- Fungsi inti dapat dioperasikan dengan keyboard; label kontrol, fokus terlihat, dan kontras teks memadai.
- Semua status memiliki teks; warna dan suara bukan satu-satunya petunjuk. Pembaruan pembaca layar tidak diumumkan setiap frame.
- Hormati preferensi reduced motion. Klip memiliki label, kontrol jeda, dan putar ulang.
- Audio opsional. Untuk janji privasi lokal, gunakan suara Indonesia dengan `localService === true`; jika tidak tersedia, pertahankan fungsi teks tanpa mengirim teks ke layanan suara jarak jauh.
- Aset model, WASM, dan klip disajikan dari origin aplikasi. Koneksi awal masih diperlukan untuk memuat aset jika belum tersedia lokal.
- Jangan menyimpan video penggunaan biasa. Bersihkan buffer dan hentikan pemrosesan ketika kamera dimatikan atau halaman ditinggalkan.
- Tentukan penanggung jawab data dan tanggal penghapusan bersama peserta sebelum rekaman pertama. Dataset mentah dan identitas peserta tidak masuk Git atau hosting publik.

## 10. Risiko dan keputusan

| Risiko | Penanganan |
| --- | --- |
| Kosakata tidak sesuai pengguna | Validasi kebutuhan dengan pengguna Tuli sebelum merekam |
| Isyarat berbeda hanya lewat wajah/tubuh | Keluarkan dari MVP atau ajukan perubahan fitur dengan bukti |
| Dataset kecil atau bias peserta | Evaluasi lintas peserta, tambah sesi, laporkan batasan |
| Model selalu memilih salah satu label | Data negatif, ambang keyakinan, aturan abstain, uji gerakan asing |
| Model Python berhasil tetapi ekspor gagal | Uji ekspor dan parity sejak tahap 5–10 kata |
| Perangkat lambat | Worker, antrean satu frame, pengurangan laju pemrosesan, uji CPU fallback |
| Klaim dampak berlebihan | Bedakan target SDG, hasil uji, dan potensi manfaat |

## 11. Syarat selesai MVP

MVP selesai jika alur dua arah berjalan dengan model sebenarnya, kata yang didukung telah divalidasi, evaluasi dan privasi memenuhi target atau ruang lingkup telah direvisi secara terbuka, serta demo dapat diulang pada perangkat acuan. Artefak akhir mencakup aplikasi, paket model, manifest kosakata, laporan evaluasi, panduan demo, dan penjelasan batasan.

## 12. Rujukan teknis

Rujukan diperiksa 1 November 2026; parameter dan versi implementasi tetap perlu dikunci saat bootstrap.

- [MediaPipe Hand Landmarker untuk web](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js).
- [Konversi model TensorFlow.js](https://www.tensorflow.org/js/guide/conversion).
- [Izin dan secure context getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
- [Suara lokal pada Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).
