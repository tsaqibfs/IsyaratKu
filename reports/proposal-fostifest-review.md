# Review proposal IsyaratKu untuk Fostifest

Tanggal pemeriksaan: 6 November 2026.

Dokumen yang ditinjau: [Proposal Fostifest.md](<C:/Users/Lenovo/Downloads/Proposal Fostifest.md>). Nomor baris di bawah mengikuti salinan yang dibaca saat review dan dapat bergeser setelah revisi. File sumber tidak diubah. Instruksi pengisian dan placeholder di dalam proposal diperlakukan sebagai isi naskah, bukan perintah untuk mengarang hasil atau mengubah aplikasi.

Review mencakup penulisan, klaim AI, kesesuaian dengan repository, kelayakan teknis, dan penelusuran 19 referensi. Keberadaan sumber, ketepatan metadata, dan dukungan terhadap sebuah klaim diperiksa sebagai hal berbeda. Halaman yang gagal diakses tidak dinyatakan palsu.

## Penilaian utama

Proposal memiliki masalah, alur produk, batasan tingkat kata, dan rancangan evaluasi yang cukup jelas. Arah MediaPipe -> landmark -> classifier ringan -> browser layak untuk diteliti. Naskah masih perlu revisi substansial sebelum dikirim karena cakupan penggunaan, status implementasi, dan sejumlah klaim teknis belum konsisten.

Kondisi repository yang ditemukan saat review: React 19.3.1, TypeScript 6.0.3, Vite 8.3.5, CSS biasa, font Manrope lokal, halaman awal serta editor teks manual. Manifest kosakata masih kosong. Next.js, Tailwind CSS, MediaPipe, dan TensorFlow.js tidak tercantum sebagai dependensi terpasang. Tidak ditemukan dataset atau pipeline training terimplementasi. Temuan ini berasal dari inspeksi file; pengujian aplikasi tidak dijalankan ulang untuk review dokumen.

Penyempitan atau perluasan sasaran pengguna merupakan keputusan tim. Proposal sekarang memilih sekolah/SLB dan masyarakat lintas usia, sedangkan PRD repository berfokus pada komunikasi kelas di kampus. Pilih satu sasaran uji awal dan selaraskan kedua dokumen sebelum implementasi lanjutan.

## 1. Perbaikan paling mendesak

| Prioritas | Lokasi proposal | Temuan dan dampak | Revisi yang disarankan |
| --- | --- | --- | --- |
| Tinggi | Ringkasan; §3–6; baris 92–209 | Klaim rumah, sekolah, masyarakat, dan semua usia jauh lebih luas daripada evaluasi 30 kosakata. Penguji utama guru belum mewakili semua pengguna primer. | Tetapkan satu konteks pilot dan pengguna SIBI yang jelas; perluasan lintas usia/lingkungan masuk roadmap. Uji keberhasilan interaksi bersama pasangan pengguna Tuli dan dengar. |
| Tinggi | §6.1, baris 198 | Klaim tidak tersedia alat bantu SIBI terlalu mutlak dan berkonflik dengan keberadaan Bicara Pintar yang dikutip sendiri. | Nyatakan kebutuhan yang belum dibuktikan terpenuhi pada konteks sasaran; tambahkan matriks pembanding dengan kolom yang belum diketahui ditandai belum dilaporkan. |
| Tinggi | §1, §10, §16 | React/Next.js dan Tailwind tidak sesuai stack yang sudah dipakai. Daftar alat mencampur yang terpasang, direncanakan, dan belum ditentukan. | Tulis React + TypeScript + Vite + CSS; tandai paket ML sebagai rencana. Jangan mencantumkan penggunaan Figma/Colab/hosting tanpa bukti penggunaan. |
| Tinggi | §10.3, baris 368; §5 | Web Speech API tidak menjamin suara lokal. Janji seluruh fungsi offline dan tanpa layanan luar belum terpenuhi hanya dengan memilih API ini. | Pilih voice Indonesia dengan `localService === true`; jika tidak tersedia, gunakan teks. Batasi klaim offline pada inferensi setelah seluruh aset berhasil dimuat; reload offline memerlukan pengujian tersendiri. |
| Tinggi | §10.2, baris 350 | Normalisasi terhadap pergelangan pada setiap frame dapat menghilangkan perpindahan tangan. Normalisasi tiap tangan secara independen juga dapat menghapus hubungan dua tangan. | Simpan fitur bentuk lokal, lintasan pergelangan, hubungan dua tangan, serta mask tangan hilang. Jangan finalkan dimensi fitur hanya sebagai 63/126 tanpa skema lengkap. |
| Tinggi | §11–12; §14–15 | Placeholder status, hasil, screenshot, dan petunjuk tombol yang belum tersedia masih ada. Kalimat seolah validasi telah dilakukan muncul di ringkasan dan uraian solusi. | Isi progres dengan kondisi nyata; hasil model/FPS/SUS ditulis belum diuji. Pisahkan rancangan penggunaan dari fitur tersedia. Jangan mengisi mitra atau peserta yang belum dikonfirmasi. |
| Sedang | §5, §11.1, §12.1 | Label negatif dan threshold tidak menjamin semua isyarat di luar kamus akan ditolak. | Tulis penolakan sebagai sasaran evaluasi. Ukur salah terima pada gerakan asing, precision hasil diterima, serta coverage. |
| Sedang | §10.2, baris 352 | Buffer 30 frame disebut sekitar satu detik, sementara target pipeline minimal 15 FPS. | Tentukan laju sampling menurut timestamp. Pada 15 Hz, 30 frame sekitar dua detik; pada 30 Hz sekitar satu detik. Ukur latensi setelah akhir isyarat terpisah dari panjang window. |
| Sedang | §11.1–12.1 | Lima pemeraga dan 3.000 sampel hanya target pengumpulan, belum bukti kecukupan. Istilah leave-speaker-out belum menjelaskan protokol aktual. | Tentukan fixed participant holdout atau LOSO cross-validation, kelompok validation, aturan tuning, dan test yang tidak dipakai tuning. Selaraskan jumlah peserta dengan PRD yang mengusulkan enam. |

## 2. Penulisan dan kesan teks berbantuan AI

Asal teks dan persentase penggunaan AI tidak dapat ditentukan secara andal dari gaya tulisan saja. Yang bisa dinilai adalah kekhususan, konsistensi, dukungan bukti, dan sisa templat.

Temuan konkret:

- Frasa persis “anak-anak, pelajar, dan orang dewasa” muncul enam kali. Cukup tetapkan definisi pengguna pada satu bagian lalu gunakan istilah yang konsisten.
- Masih ada delapan placeholder `[Status]`, sepuluh `[isi]`, dan empat awalan `[sesuaikan...]`, di luar placeholder lain. Bagian progres, hasil awal, screenshot, AI tools, dan lampiran belum siap dikirim.
- Ada salah ketik `Kelas6` pada baris 301. Tabel kosakata menjadikan enam kata pertama sebagai header; gunakan kolom ID, glos/ungkapan, makna, sumber, jenis gerakan, dan status validasi.
- “Belum mengerti”, “Terima kasih”, dan “Sampai jumpa” perlu didefinisikan sebagai label ungkapan atau dipecah sesuai referensi yang divalidasi. Jangan mengasumsikan satu frasa Indonesia selalu satu isyarat tunggal.
- Heading kosong `#`, heading seluruhnya tebal, tabel satu sel sebagai paragraf, bullet campuran, dan penomoran `1\.` membuat struktur terasa seperti ekspor templat. Rapikan format sesuai panduan resmi lomba.
- URL berisi escape seperti `https\://www\.who.int/...`. Gunakan hyperlink Markdown yang normal agar rujukan dapat dibuka dan disalin.
- Frasa “menjaga akurasi model tetap tinggi”, “memastikan fitur sesuai kebutuhan”, “tanpa biaya infrastruktur tambahan”, dan “dapat berlangsung di semua kalangan” perlu diganti dengan target serta kondisi pengujian.
- Metafora judul “Mendengar Lewat Mata” adalah pilihan editorial, bukan kesalahan teknis. Namun, subjudul yang menyebut fungsi, kosakata terbatas, dan konteks pilot akan lebih mudah dipertanggungjawabkan daripada janji penggunaan sangat luas.
- Statistik seluruh penyandang disabilitas atau seluruh gangguan pendengaran tidak sama dengan jumlah pengguna SIBI. Gunakan sebagai konteks umum, bukan ukuran langsung calon pengguna IsyaratKu.

Contoh judul yang lebih terukur, bila tim memilih pilot kelas: **IsyaratKu: pengenal kosakata SIBI berbasis browser untuk membantu komunikasi di kelas**.

Ubah klaim yang terlalu pasti:

| Kalimat/ide sekarang | Usulan kalimat |
| --- | --- |
| Pembatasan 30 kata menjaga akurasi tetap tinggi. | Kosakata dibatasi agar pengumpulan data dan evaluasi dapat dilakukan bertahap; kualitas pengenalan akan diukur pada peserta yang tidak digunakan dalam pelatihan. |
| Pengujian bersama guru SLB memastikan fitur sesuai kebutuhan nyata. | Tim merencanakan validasi kebutuhan dan kosakata bersama pengajar serta pengguna SIBI setelah mitra tersedia. |
| Isyarat di luar kosakata tidak dikenali dan akan ditandai. | Sistem dirancang menahan prediksi yang tidak memenuhi kriteria penerimaan; efektivitas penolakan akan diuji pada gerakan di luar kosakata. |
| Model menyusun kata menjadi kalimat. | Aplikasi menampilkan urutan kata yang diterima dan menyediakan koreksi manual; penyusunan tata bahasa tidak termasuk lingkup awal. |
| Tanpa biaya infrastruktur tambahan. | Inferensi tidak memerlukan server GPU; biaya hosting statis, penyimpanan, pengumpulan data, dan pemeliharaan tetap perlu diperhitungkan. |

Untuk pengungkapan bantuan AI, cantumkan alat yang benar-benar dipakai. Dalam pekerjaan proyek ini Codex telah membantu kode, dokumen, dan penelusuran; tetap jelaskan pemeriksaan tim terhadap keluaran dan patuhi ketentuan lomba bila tersedia. Jangan mencantumkan AI sebagai pengganti validasi bahasa atau pencipta data uji nyata.

## 3. Pemeriksaan referensi 1–19

Status “terverifikasi” di bawah dibatasi pada metadata atau klaim yang disebut; bukan penilaian bahwa seluruh isi artikel pasti benar.

| No. | Hasil penelusuran | Tindakan |
| --- | --- | --- |
| 1 | [SIGN BRIDGE, Atlantis Press](https://www.atlantis-press.com/proceedings/ctfc-25/126023108) ditemukan. Penulis, judul, tahun 2026, halaman 120–129, dan DOI sesuai. Sistem menggunakan MediaPipe Holistic dan ONNX Runtime dalam browser. | Layak untuk kelayakan teknis browser, bukan bukti akurasi SIBI. Sumber ini sekaligus menunjukkan bahwa inferensi browser sudah diteliti. |
| 2 | Judul, DOI, volume, dan halaman cocok dengan metadata yang terindeks; [laman DOI IEEE](https://doi.org/10.1109/ACCESS.2024.3398806) dan Crossref tidak berhasil diakses langsung dalam pemeriksaan ini. | Belum memverifikasi full text primer. Referensi tidak disitasi di badan naskah; gunakan pada tinjauan pustaka bila benar-benar dibaca atau keluarkan. |
| 3 | [Catatan University of Johannesburg](https://pure.uj.ac.za/en/publications/real-time-south-african-sign-language-interpretation-using-comput/) mencantumkan Precious Magodi dan Tevin Moodley, berupa bab prosiding, halaman 377–386, DOI 10.1007/978-3-032-13196-6_35. | Koreksi penulis dan jenis publikasi. Referensi sekarang menulis Moodley saja dan artikel jurnal. Tidak disitasi di badan naskah. |
| 4 | [arXiv 2506.11154](https://arxiv.org/abs/2506.11154) benar: Sharvari Kamble, 2025, SLRNet, preprint. Objeknya ASL dan nilai 86,7% adalah validation accuracy. | Boleh sebagai rujukan model temporal, jangan diperlakukan sebagai hasil SIBI atau test pada pengguna baru. Belum disitasi di badan naskah. |
| 5 | Judul dan metadata volume 54(3), halaman 392–409, tahun 2022 ditemukan dalam penelusuran; [laman penerbit melalui DOI](https://doi.org/10.1080/15391523.2020.1867938) mengembalikan 403. | Full text primer belum diverifikasi. Jangan menganggap sumber ini otomatis membuktikan ambang 68 universal. Tulis target SUS sebagai kriteria tim; “minimal 68” juga tidak berarti semua nilai di atas rata-rata. |
| 6 | [Agenda 2030 PBB](https://sdgs.un.org/2030agenda) sesuai. | Tambahkan tautan dan sitasi pada bagian SDG; belum disitasi di badan naskah. |
| 7 | [UU 8/2016 pada JDIH BPK](https://peraturan.bpk.go.id/Details/37251/uu-no-8-tahun-2016) sesuai judul dan tahun. | Tambahkan tautan resmi; kutip ketentuan pendidikan secara spesifik bila menjelaskan kewajiban hukum. |
| 8 | Sitasi buku tidak memuat tahun/edisi/penerbit yang lengkap. [Kamus SIBI daring](https://pkplk.kemendikdasmen.go.id/sibi/) memang tersedia. | Jika memakai website, sitasi sebagai sumber web beserta tanggal akses; jika memakai buku, cocokkan halaman bibliografinya. Jangan menebak edisi. |
| 9 | [WHO, 3 Maret 2026](https://www.who.int/news-room/fact-sheets/detail/deafness-and-hearing-loss) cocok. Angka 430 juta, 34 juta anak, 95,1 juta usia 5–19, proyeksi 2050, proporsi hampir 80%, dan biaya hampir US$1 triliun ada. Angka 1,5 miliar tidak ditemukan pada versi halaman yang dibaca. | Pertahankan angka yang bisa ditunjuk pada sumber dan bedakan hearing loss umum dari disabling hearing loss. Beri sumber lain untuk 1,5 miliar atau hapus. Jangan menyamakannya dengan populasi pengguna SIBI. |
| 10 | URL siaran pers yang dicantumkan mengembalikan 403. Angka 2,17% dan 0,41% dapat ditemukan pada [tabel primer BPS untuk penduduk usia 5+ tahun 2025](https://www.bps.go.id/id/statistics-table/1/MjMwMyMx/prevalensi-disabilitas-penduduk-berumur-5-tahun-ke-atas-menurut-provinsi-dan-jenis-kesulitan.html). | Gunakan tabel langsung dan tanggal akses. Definisi tingkat kesulitan/Washington Group perlu rujukan metodologi terpisah. |
| 11 | [Berita BPS 7 Agustus 2026](https://www.bps.go.id/id/news/2026/08/07/927/supas-2025-jadi-fondasi-penguatan-kebijakan-penurunan-kematian-ibu-dan-anak.html) memang menyebut 284,67 juta jiwa. | Angka itu seluruh umur. Untuk mengubah 0,41% usia 5+ menjadi jumlah orang, gunakan penyebut penduduk usia 5+ dari sumber yang konsisten. |
| 12 | Laman DataIndonesia yang dicantumkan tidak memberikan isi yang dapat diperiksa. Atribusi 73,38% versus 35,21% ke Susenas Maret 2024 belum terverifikasi dari tabel BPS. | Tahan kedua angka sampai ada nama tabel, halaman, tahun, batas umur, dan definisi disabilitas yang dapat diperiksa. Jangan menganggap judul tautan sudah membuktikan tahun datanya. |
| 13 | Angka 245,3 ribu per Oktober 2025 muncul pada [artikel GoodStats](https://data.goodstats.id/statistic/jumlah-peserta-didik-disabilitas-berdasarkan-jenjang-2025-eA0G4). [Dasbor primer](https://referensi.data.kemendikdasmen.go.id/berkebutuhan_khusus/total/wilayah?kelas=semua) kini menampilkan kondisi 4 November 2026. | Jika mempertahankan snapshot Oktober 2025, kutip sumber/salinan snapshot tersebut secara jelas. Jangan menganggap dasbor dinamis sekarang mengembalikan data historis itu. Data seluruh disabilitas bukan khusus Tuli. |
| 14 | [Publikasi resmi SLB 2024/2025](https://data.kemendikdasmen.go.id/publikasi/p/pauddasmen-buku-statistik/statistik-sekolah-luar-biasa-slb-tahun-2024-2025-2025) ada, diunggah 18 Maret 2025 dan memakai data per 30 November 2024. Angka 2.366 dan 575 cocok dengan [artikel sekunder yang dicantumkan](https://goodstats.id/article/jumlah-sekolah-luar-biasa-di-indonesia-meningkat-selama-3-tahun-terakhir-YMqZg). | Tabel dalam PDF primer belum diperiksa. Tambahkan halaman/tabel primer sebelum mengatribusikan langsung ke publikasi pemerintah. Pastikan tanggal artikel sesuai byline artikel, bukan tanggal konten lain di halaman. |
| 15 | [Bicara Pintar, PDF primer](https://ejurnalmalahayati.ac.id/index.php/kreativitas/article/download/25071/Download%20Artikel) sesuai. Nilai 46,33%/92,66% untuk siswa, 46%/95% untuk guru/tim, dan 20% menilai kosakata cukup memang ada. Kisah 3 dari 13 pengajar juga tercantum. | Pertahankan konteks studi tunggal. Tabel 4 dan narasi sumber memiliki beberapa persentase interpretasi yang berbeda, sehingga selalu sebut tabel/metode yang dipakai. Penulis keenam–ketujuh dan bentuk nama terakhir perlu dicocokkan dengan ekspor bibliografi resmi. |
| 16 | [Artikel Kembuan dkk., PDF primer](https://ijai.iaescore.com/index.php/IJAI/article/download/27519/14876) sesuai judul, tahun, volume, halaman, dan DOI. Artikel membahas 26 huruf statis berbasis citra. | Cocok untuk mendukung adanya riset dan keterbatasan data, bukan bukti pengenalan 30 kata dinamis di browser atau keberhasilan populasi lintas usia. |
| 17 | [Repository UGM](https://etd.repository.ugm.ac.id/penelitian/detail/246277) sesuai judul/tahun dan melaporkan rata-rata akurasi di atas 94%. Metadata juga memuat Moh. Edi Wibowo. | Periksa halaman judul untuk membedakan penulis skripsi dan pembimbing sebelum menentukan format dua penulis. Jelaskan protokol sebelum membandingkan angkanya dengan studi lain. |
| 18 | [Laman artikel INOTEK](https://proceeding.unpkediri.ac.id/index.php/inotek/article/view/7377) terverifikasi. Angkanya SVM 95,1%, MLP 97,3%, RF 96,5%, CNN 98,2%; dataset alfabet 1.000 citra. DOI 10.29407/9esmzh27, 9(1), 665–678. | Lengkapi DOI/halaman. Kalimat 95–97% perlu menyebut algoritma yang dimaksud. Tambahkan dokumentasi MediaPipe primer untuk menjelaskan 21 landmark. |
| 19 | [UU 27/2022 pada JDIH BPK](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022.) sesuai judul dan tahun. | Tambahkan tautan resmi. Kebijakan persetujuan, akses, masa simpan, dan penarikan data perlu dijelaskan operasional; menyebut UU tidak membuktikan kepatuhan implementasi. |

Contoh koreksi referensi 3 berdasarkan metadata primer:

Magodi, P., & Moodley, T. (2026). Real-time South African sign language interpretation using computer vision methods. Dalam A. Iglesias, J. Shin, N. Bhatt, & A. Joshi (Eds.), *Information systems for intelligent systems: Proceedings of ISBM 2025* (pp. 377–386). Springer. https://doi.org/10.1007/978-3-032-13196-6_35

Referensi 2, 3, 4, dan 6 belum memiliki sitasi numerik pada badan proposal. Tambahkan hanya jika benar-benar digunakan; jangan mempertahankan daftar panjang untuk memberi kesan kelengkapan.

### Perbaikan statistik dan pemetaan dampak

- Hilangkan estimasi jumlah orang dari perkalian proporsi usia 5+ dengan populasi semua umur sampai tersedia penyebut yang cocok. Data kesulitan mendengar juga tidak langsung menunjukkan kemampuan atau preferensi menggunakan SIBI.
- Jangan menyimpulkan kekurangan kemampuan guru secara nasional dari satu sekolah. Contoh YPAC cukup sebagai ilustrasi kasus yang diberi sumber.
- Pemetaan ke [target SDG 4.5 dan 4.a](https://sdgs.un.org/goals/goal4) serta [10.2](https://sdgs.un.org/goals/goal10) masuk akal sebagai kontribusi yang diharapkan. Jumlah kosakata, skor SUS, dan keberhasilan skenario adalah indikator proyek, bukan indikator resmi capaian nasional SDG.
- Ukur hasil langsung seperti tugas komunikasi selesai, kebutuhan koreksi, serta waktu menyampaikan pesan. Perubahan kesenjangan pendidikan atau inklusi sosial belum dapat dinyatakan tercapai dari satu uji aplikasi.

## 4. Kesesuaian sistem dan framework

| Komponen | Status yang terlihat di repository | Penulisan yang lebih tepat di proposal |
| --- | --- | --- |
| React | Terpasang | Library UI yang digunakan. |
| TypeScript | Terpasang | Bahasa pengembangan antarmuka dan modul browser. |
| Vite | Terpasang | Build tool dan server pengembangan; hasil produksi berupa aset statis. |
| CSS biasa + Manrope lokal | Digunakan | Styling yang digunakan saat ini. Hapus Tailwind dari daftar penggunaan aktual. |
| Next.js | Tidak ditemukan | Tidak diperlukan oleh rancangan SPA saat ini. React dan Next.js bukan dua nama untuk pilihan yang sama. |
| MediaPipe Tasks Vision Hand Landmarker | Direncanakan | Tulis `Hand Landmarker dari @mediapipe/tasks-vision`; jangan mencampur API lama `@mediapipe/hands` dengan Tasks Vision. |
| TensorFlow.js | Direncanakan | Runtime classifier browser yang akan diuji; belum ada model terintegrasi. |
| TensorFlow/Keras dan converter | Direncanakan | Lingkungan training terpisah; kombinasi versi belum dikunci. |
| NumPy/scikit-learn | Direncanakan | Pengolahan fitur dan evaluasi, sesuai kebutuhan skrip yang benar-benar dibuat. Pandas/seaborn bersifat opsional. |
| Web Worker | Sudah dirancang dalam arsitektur, belum diimplementasikan | Tempat pemrosesan berat dengan satu frame aktif agar UI responsif. |
| getUserMedia | Direncanakan | API browser, bukan layanan web eksternal; perlu secure context, izin eksplisit, audio dimatikan, dan penghentian track. |
| SpeechSynthesis | Direncanakan | API pembacaan teks dengan pemeriksaan voice lokal dan fallback teks. |
| Vitest, Testing Library, Playwright, ESLint | Terpasang | Alat pengujian dan kualitas kode yang relevan untuk bagian tools. |
| Git | Repository tersedia | Kontrol versi digunakan; status remote bukan bukti aplikasi telah dideploy publik. |
| Dataset tim | Belum tersedia | Rencana pengumpulan; jangan tulis seolah sudah direkam. |
| Figma, Colab/Jupyter, VS Code, hosting | Penggunaannya tidak terkonfirmasi lewat berkas yang ditinjau | Nyatakan sesuai penggunaan aktual tim atau tandai rencana/belum dipilih. |
| Codex | Membantu pekerjaan pada percakapan proyek ini | Ungkap bantuan kode/dokumentasi/penelusuran secara jujur beserta verifikasi tim. |

Rujukan API utama: [Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js), [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [konversi TensorFlow.js](https://www.tensorflow.org/js/guide/conversion), dan [voice lokal/jarak jauh](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).

### Koreksi rancangan AI

1. **Tetapkan kontrak fitur.** Skema memuat handedness/slot dua tangan, mask, timestamp, bentuk lokal, lintasan, dan hubungan tangan. Pernyataan 126 fitur hanya menghitung koordinat mentah, bukan skema lengkap yang otomatis cukup.
2. **Jaga informasi gerakan.** Uji bahwa normalisasi tidak menghapus perpindahan atau orientasi yang membedakan label. Profil resmi [SIBI](https://pkplk.kemendikdasmen.go.id/sibi/profil) mencantumkan posisi, tempat pada tubuh, arah, dan frekuensi sebagai komponen pembeda makna. Landmark tangan saja membatasi kata yang dapat didukung.
3. **Jelaskan pemilihan model.** MLP dapat menjadi baseline kata statis. Untuk kamus campuran, perlu model temporal yang memadai atau mekanisme pemilihan model yang dijelaskan dan diuji. Penulisan MLP/LSTM tanpa keputusan alur input/output belum cukup.
4. **Tentukan sampling.** Gunakan timestamp/resampling; FPS kamera, processed FPS, dan laju input classifier bukan selalu angka yang sama. Panjang window berbeda dari latensi setelah akhir isyarat.
5. **Tambahkan decoder penerimaan.** Satu kandidat diterima sekali setelah stabil; pengulangan baru setelah jeda netral; reset saat tangan hilang; hasil lama diabaikan setelah sesi berhenti. Voting saja tidak menangani semua kasus ini.
6. **Evaluasi penolakan.** Softmax bukan probabilitas kebenaran yang sudah terkalibrasi. Kelas negatif membantu tetapi tidak menutup seluruh kemungkinan gerakan asing. Ukur false acceptance dan coverage secara terpisah dari F1 klip.
7. **Uji ekspor lebih awal.** Converter dapat gagal pada operasi yang tidak didukung. Buktikan preprocessing dan prediksi Python/TF.js setara pada fixture identik sebelum pengumpulan data besar. Format Layers dan GraphModel membutuhkan loader yang berbeda. [Dokumentasi konversi](https://www.tensorflow.org/js/guide/conversion).
8. **Hindari alternatif yang digambarkan tidak adil.** Server tidak selalu membutuhkan GPU. Transformer tidak selalu terlalu berat untuk browser. Artikel SIGN BRIDGE yang dikutip sudah menunjukkan alternatif ONNX dalam browser. Pilih baseline berdasarkan sumber daya tim dan hasil benchmark.

### Privasi, suara, dan data

- Perjelas perbedaan mode komunikasi biasa, mode rekam dataset, dan lingkungan training. Uji privasi juga mencakup landmark serta teks, bukan hanya video.
- `SpeechSynthesisVoice.localService` membedakan voice lokal dan remote. Klaim tanpa pengiriman teks ke layanan luar harus disertai pemilihan voice lokal; jika tidak tersedia, suara dinonaktifkan dengan penjelasan. [MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).
- Sajikan model, WASM, font, dan klip dari origin aplikasi. Jangan memakai CDN runtime yang tidak disebutkan sambil mengklaim seluruh akses bersifat lokal. Pemuatan aset dan pemrosesan isi percakapan perlu dibedakan.
- Tentukan akses, ID pseudonim, masa simpan, serta prosedur penghapusan data. Landmark bukan otomatis data anonim.
- Janji penarikan data “kapan saja” perlu menjelaskan cara menghapus sampel, waktu pembaruan model, dan keterbatasan menarik kembali salinan yang sudah diterbitkan. Jangan menjanjikan penghapusan seluruh pengaruh dari model/salinan publik tanpa mekanisme.
- Jika menggunakan Colab/cloud untuk training, periksa izin pemrosesan data di sana secara terpisah dari janji privasi inferensi pengguna.

## 5. Kelayakan pengumpulan data dan evaluasi

Target 30 x 5 x 20 = 3.000 klip positif benar secara aritmetika. Nilai itu belum mencakup kelas negatif, sesi tambahan, atau data yang ditolak karena kualitas buruk. Dalam PRD repository, usulan awal adalah enam peserta dengan minimal dua sesi, diawali subset 5–10 kata.

Karena tim belum memiliki dataset dan pendamping SIBI, kebutuhan mitra/validator merupakan dependensi utama. Nyatakan sebagai status menunggu mitra dan sertakan jalur alternatif. [Dataset SIBI Mendeley](https://data.mendeley.com/datasets/44pbrbsnkh/3) menyediakan prosedur akses berizin, tetapi cakupannya angka/alfabet/imbuhan/kalimat perlu diperiksa sebelum dipakai untuk kata terisolasi. Kamus daring adalah referensi; izin training dan publikasi klip tetap harus dipastikan.

Tambahkan ke evaluasi:

- Peserta train/validation/test dan aturan turunan frame/augmentasi mengikuti peserta sumber.
- Perbedaan fixed holdout dengan LOSO, seed, dan cara pemilihan model/threshold tanpa melihat test.
- Macro-F1 per klip serta precision hasil diterima, coverage, dan salah terima per menit pada sesi live.
- Laptop, CPU, RAM, browser, backend, resolusi, ukuran seluruh aset, warm-up, dan jumlah pengulangan benchmark.
- P95 latensi sejak akhir gerakan, bukan hanya lama pemanggilan `predict`.
- Uji interaksi bersama pengguna Tuli yang memakai SIBI, tidak hanya pendapat guru.
- Jika mengklaim dukungan anak, evaluasi yang sesuai kelompok tersebut; training orang dewasa tidak otomatis membuktikan generalisasi ke anak.
- Skor SUS diperlakukan sebagai skor, bukan persentase. Sertakan jumlah responden, adaptasi bahasa, instrumen, dan interpretasi yang digunakan. Jangan memaksakan instrumen dewasa kepada anak tanpa pertimbangan kesesuaian.

## 6. Contoh teks pengganti yang siap disunting

### Ringkasan eksekutif

IsyaratKu merupakan aplikasi web yang dirancang untuk membantu komunikasi sederhana antara pengguna SIBI dan lawan bicara yang belum memahami isyarat. Aplikasi akan mengenali kosakata terbatas dari webcam menjadi teks yang dapat dikoreksi dan dibacakan menggunakan suara lokal apabila tersedia. Balasan tertulis dapat dipetakan ke klip kosakata yang telah divalidasi. Pengenalan mencakup isyarat terpisah dengan jeda; penerjemahan tata bahasa dan percakapan bebas belum termasuk lingkup awal.

Pengembangan menggunakan React, TypeScript, dan Vite. Deteksi tangan direncanakan menggunakan MediaPipe Tasks Vision Hand Landmarker, sedangkan classifier kosakata dijalankan melalui TensorFlow.js di browser. Video pada mode komunikasi dirancang diproses di perangkat tanpa diunggah ke server. Implementasi saat ini mencakup halaman awal dan editor manual; pengenalan, suara, dataset, serta klip belum tersedia.

Tim merencanakan validasi kebutuhan dan bentuk isyarat bersama pengguna serta pengajar SIBI setelah mitra diperoleh. Pengembangan dimulai dari 5–10 label tervalidasi, lalu diperluas menuju 30 label berdasarkan hasil evaluasi. Kelayakan akan dinilai melalui kualitas pengenalan pada peserta baru, salah terima pada gerakan di luar kosakata, kinerja perangkat, dan keberhasilan skenario komunikasi yang disepakati bersama pengguna.

Catatan: paragraf tersebut merupakan usulan penyelarasan dengan repository, bukan pengganti keputusan tim tentang konteks pilot.

### Status implementasi yang dapat dipertanggungjawabkan

| Modul | Status berdasarkan repository saat review |
| --- | --- |
| Setup React + TypeScript + Vite dan Git | Tersedia |
| Tampilan awal dan editor teks manual | Tersedia |
| Pengujian frontend | Konfigurasi dan test ada; hasil lulus sebelumnya tercatat di README, tidak dijalankan ulang pada review ini |
| Validasi kebutuhan dengan pengguna/mitra SLB | Belum ada bukti pelaksanaan yang diberikan |
| Kosakata tervalidasi | Belum tersedia; manifest kosong |
| Kamera dan Hand Landmarker | Belum diimplementasikan |
| Dataset dan classifier SIBI | Belum tersedia |
| Integrasi TF.js, suara lokal, dan klip | Belum diimplementasikan |
| Hasil akurasi/F1/FPS/SUS | Belum diuji untuk pipeline pengenalan |
| Deployment publik | Belum terkonfirmasi melalui berkas yang diperiksa |

### Posisi keunikan

Kontribusi yang diusulkan adalah evaluasi pengenalan kosakata SIBI sesuai konteks pilot, pemrosesan lokal, dan alur komunikasi yang menyediakan koreksi serta penolakan prediksi meragukan. Setiap unsur sudah memiliki penelitian terkait; nilai tambah harus dibuktikan melalui kombinasi kebutuhan pengguna dan hasil evaluasi. Hindari klaim pertama, paling akurat, atau satu-satunya tanpa studi pembanding yang memadai.

## 7. Urutan revisi sebelum pengiriman

1. Pilih konteks pilot dan selaraskan proposal dengan PRD, termasuk jumlah peserta serta tahapan kosakata.
2. Isi progres dengan bukti aktual dan hasil yang belum ada dengan “belum diuji”.
3. Perbaiki stack, model input/temporal, voice lokal, dan definisi penolakan.
4. Koreksi referensi 3; tahan angka referensi 12 sampai sumber primer jelas; perbaiki penyebut estimasi BPS; lengkapi sumber primer teknis.
5. Tambahkan pembanding yang paling dekat, termasuk Bicara Pintar, dan rumuskan kontribusi yang dapat diuji.
6. Ganti placeholder dengan isi yang benar-benar tersedia atau hapus bagian yang belum diperlukan; beri label rancangan pada gambar/petunjuk fitur mendatang.
7. Rapikan istilah, URL, penomoran, daftar pustaka, dan pengungkapan bantuan AI; periksa aturan Fostifest dari dokumen resmi yang belum diberikan pada review ini.

Tidak ada perubahan pada kode produk, dataset, model, atau proposal asli sebagai bagian dari review ini.
