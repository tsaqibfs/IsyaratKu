# Panduan agen untuk IsyaratKu

Status: aturan kerja proyek, berlaku untuk perubahan berikutnya.  
Dokumen acuan: [prd.md](prd.md), [archtecture.md](archtecture.md), [todo.md](todo.md).

## 1. Tujuan kerja

Bangun MVP pengenalan kosakata SIBI untuk kebutuhan kelas, berjalan di browser dengan privasi kamera. Selesaikan satu alur yang dapat diverifikasi sebelum memperluas jumlah fitur atau kata.

Dokumen ini sengaja bernama `agents.md` sesuai permintaan pemilik proyek. Penemuan otomatis aturan agen dapat bergantung pada nama `AGENTS.md`; saat memindahkan ke lingkungan yang peka huruf besar/kecil, verifikasi mekanisme tersebut dan gunakan satu sumber aturan agar tidak terjadi duplikasi yang berbeda isi.

## 2. Urutan acuan

1. Instruksi terbaru pemilik proyek dan aturan sistem yang berlaku.
2. Panduan kerja dalam dokumen ini.
3. PRD untuk kebutuhan dan batasan produk.
4. Arsitektur untuk kontrak teknis.
5. Todo untuk urutan pekerjaan dan status.

Jika keputusan teknis mengubah kebutuhan produk, catat alasannya dan perbarui dokumen yang terkait. Jangan diam-diam memperluas klaim aplikasi.

## 3. Sebelum mulai tugas

- Baca tugas, dependensi, dan kriteria selesai di todo.
- Periksa keadaan repository dan perubahan pengguna; jangan menimpa pekerjaan yang tidak terkait.
- Pastikan asumsi penting sudah diketahui. Gunakan keputusan awal dalam arsitektur untuk pilihan rutin.
- Jangan menganggap struktur folder usulan atau perintah pemeriksaan sudah tersedia sebelum bootstrap selesai.
- Jika data, validator, atau perangkat belum tersedia, lanjutkan pekerjaan independen dan tandai bagian yang terhambat secara spesifik.

## 4. Aturan implementasi

- Gunakan React, TypeScript, dan Vite untuk MVP; hindari backend tanpa kebutuhan yang dibuktikan.
- Gunakan MediaPipe Tasks Vision Hand Landmarker, bukan mencampur API lama dan baru tanpa keputusan migrasi.
- Pisahkan UI, kamera, preprocessing, inferensi, decoder temporal, suara, serta pemutaran klip.
- Terapkan satu kontrak preprocessing yang berversi pada pengumpulan data, pelatihan, dan browser.
- Jangan melakukan inferensi berat pada setiap render React. Gunakan worker dan batasi frame yang sedang diproses.
- Hentikan media track, worker, dan tensor saat tidak digunakan. Rilis resource frame setelah pemrosesan.
- Kunci versi dependensi dan simpan lockfile setelah kompatibilitas terbukti. Jangan mengarang versi paket yang belum diuji.
- Buat patch kecil dengan lingkup jelas. Hindari refactor di luar tugas aktif.
- Gunakan bahasa Indonesia yang sederhana untuk UI, pesan kesalahan, dan dokumentasi pengguna.

## 5. Batasan produk yang tidak boleh dilanggar

- Jangan menyebut output model sebagai terjemahan bahasa isyarat bebas.
- Jangan mencampur data SIBI dan BISINDO sebagai label yang sama.
- Jangan menetapkan bentuk isyarat hanya berdasarkan tebakan agen atau video yang belum diverifikasi.
- Jangan menyamakan skor softmax dengan probabilitas kebenaran yang telah terkalibrasi.
- Jangan menambahkan kata dari prediksi lemah, tangan hilang, atau window tidak lengkap.
- Model contoh, keluaran acak, dan label hardcoded hanya boleh dipakai untuk pengembangan dengan penanda jelas; tidak boleh tampil sebagai inferensi nyata pada demo akhir.
- Ketik ke isyarat adalah pencocokan klip kosakata, bukan penerjemahan tata bahasa.

## 6. Data dan privasi

- Mode normal tidak mengunggah kamera, landmark, atau teks percakapan dan tidak merekam dataset.
- Mode pengumpulan harus memiliki persetujuan, indikator rekaman, kontrol stop, dan ekspor manual.
- Simpan data mentah, formulir persetujuan, dan pemetaan identitas di penyimpanan terbatas di luar folder publik/repository.
- Gunakan ID peserta pseudonim. Jangan menulis nama, wajah, atau data percakapan ke log.
- `.gitignore` harus melindungi data lokal dan identitas; jangan mengabaikan seluruh JSON karena manifest dan konfigurasi perlu dilacak.
- Jangan mengunduh atau menerbitkan dataset/klip tanpa kejelasan izin penggunaan dan publikasi.
- Jangan menambahkan layanan suara jarak jauh atau analitik pihak ketiga sebagai fallback tersembunyi.
- Pertahankan split peserta: augmentasi dan turunan klip mengikuti split sumbernya.

## 7. Pemeriksaan perubahan

Bootstrap harus menyediakan skrip berikut; sebelum tersedia, nyatakan bahwa pemeriksaan belum dapat dijalankan:

| Perintah rencana | Tujuan |
| --- | --- |
| `npm run dev` | Menjalankan aplikasi pengembangan |
| `npm run lint` | Pemeriksaan aturan kode |
| `npm run typecheck` | Pemeriksaan TypeScript tanpa emit |
| `npm run test` | Unit test yang selesai sekali jalan |
| `npm run test:e2e` | Pengujian alur browser yang relevan |
| `npm run build` | Build produksi |
| `npm run preview` | Memeriksa build produksi secara lokal |

- Perubahan preprocessing memerlukan fixture parity training/browser dan pemeriksaan kompatibilitas model.
- Perubahan decoder memerlukan uji penolakan, kestabilan, kata berulang, dan reset saat tangan hilang.
- Perubahan kamera memerlukan uji izin ditolak, perangkat hilang, stop, dan cleanup pada browser nyata.
- Perubahan model memerlukan evaluasi lintas peserta, parity model hasil ekspor, dan benchmark browser.
- Perubahan privasi memerlukan pemeriksaan network dan penyimpanan browser.
- Hindari test yang hanya menyalin detail implementasi. Mock kamera membantu otomasi, tetapi bukan bukti kualitas model di dunia nyata.
- Dokumentasi saja cukup diperiksa konsistensi, tautan, dan kelengkapan; jangan membuat test kode untuk perubahan teks sederhana.

## 8. Definisi selesai satu tugas

Sebuah tugas boleh ditandai selesai jika hasil sesuai kriteria penerimaan, pemeriksaan relevan dijalankan, keterbatasan dicatat, dan dokumen/kontrak yang terpengaruh sudah diperbarui. Jangan mencentang tugas karena kerangka kosong atau mock sudah dibuat.

Laporan penyelesaian memuat: hasil konkret, lokasi perubahan, pemeriksaan yang benar-benar dijalankan, dan hambatan tersisa. Jangan menyatakan “lulus” untuk pemeriksaan yang tidak dijalankan.

## 9. Cara memelihara rencana

- Gunakan ID tugas tetap dari todo; catat dependensi tambahan bila ditemukan.
- `[ ]` berarti belum selesai, `[x]` berarti selesai terverifikasi. Untuk pekerjaan aktif/terhambat, tambahkan catatan status tanpa mencentang kotaknya.
- Peran pemilik adalah usulan; satu orang dapat menjalankan beberapa peran. Jangan mengarang pembagian anggota tim.
- Jika target 30 kata gagal, dokumentasikan jumlah kata yang benar-benar tervalidasi dan hasil evaluasinya.
- Simpan keputusan penting dalam bagian keputusan arsitektur; jangan membuka tumpukan dokumen baru tanpa kebutuhan.

## 10. Penamaan Git

- Gunakan branch utama `main` dan branch tugas `<jenis>/<id-tugas>-<ringkasan-kebab-case>` dalam huruf kecil, misalnya `chore/t06-project-setup` atau `feat/t08-camera-lifecycle`.
- Gunakan Conventional Commits: `<jenis>(<lingkup>): <perubahan>`, misalnya `feat(camera): release media tracks when session stops`.
- Jenis yang dipakai: `feat`, `fix`, `docs`, `test`, `chore`, dan `refactor`. Pisahkan perubahan yang tidak terkait agar riwayat mudah diperiksa.
- Review daftar file yang di-stage dan pastikan data peserta, kredensial, serta artefak lokal tidak ikut commit. Jangan menganggap `.gitignore` cukup melindungi file yang sudah terlacak.
- Jangan menambahkan remote, push, atau menerbitkan repository tanpa tujuan yang diberikan pengguna.
