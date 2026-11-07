# IsyaratKu

IsyaratKu membantu pengguna SIBI dan lawan bicara memeriksa kata dari satu gerakan tangan melalui kamera. Hasilnya dapat diperbaiki, ditampilkan sebagai teks besar, atau dibacakan jika perangkat mendukung.

Fokus awalnya adalah komunikasi singkat terkait kegiatan belajar bersama guru SLB dan pengguna SIBI dewasa.

**[Buka demo](https://isyaratku-zeta.vercel.app/)** · [Panduan pemasangan di Vercel](DEPLOYMENT.md) · [Panduan data dan pelatihan model](ml/README.md)

> **Status 8 November 2026:** model memuat 31 kata percobaan. Ketepatannya pada pengguna baru belum diukur. Pencarian kata dan pembaca pesan sudah diuji pada versi lokal, tetapi belum tersedia pada demo publik saat pemeriksaan terakhir.

## Apa yang bisa dilakukan?

| Fitur | Cara kerjanya |
| --- | --- |
| Membaca satu isyarat | Nyalakan kamera, tunggu hitung mundur, lalu lakukan satu gerakan utuh. |
| Memeriksa hasil | Kata masuk ke pesan hanya setelah kamu memilih **Gunakan kata**. |
| Memperbaiki pesan | Ketik, ubah, atau bersihkan pesan secara langsung. |
| Menampilkan teks besar | Perbesar pesan agar mudah dibaca lawan bicara. |
| Mencari kosakata | Cari dari 31 kata yang dapat dicoba tanpa menyalakan kamera. Pilih kata untuk membuka panduan dan tautan Kamus SIBI. |
| Membacakan pesan | Pilih **Bacakan pesan** jika suara bahasa Indonesia tersedia di perangkat. Pilih **Hentikan suara** untuk berhenti. |

Memilih kata pada daftar panduan tidak mengisi pesan dan tidak mengubah hasil pengenalan kamera. Aplikasi menyediakan tautan rujukan, belum menampilkan video contoh isyarat di halaman sendiri.

## Cara menggunakan

1. Buka aplikasi melalui laptop atau komputer dengan kamera. Pilih tempat yang terang.
2. Bila perlu, buka **Kosakata** untuk mencari kata yang ingin dicoba.
3. Pilih **Mulai kamera** dan izinkan akses kamera. Mikrofon tidak diperlukan.
4. Posisikan tangan agar seluruh gerakan terlihat. Pilih **Rekam satu isyarat**, lalu tunggu hitung mundur 3 detik selesai.
5. Lakukan satu isyarat utuh, kemudian pilih **Selesai dan periksa**. Rekaman berhenti otomatis setelah 10 detik.
6. Periksa kata yang terbaca. Pilih **Gunakan kata** hanya jika sesuai. Jika keliru, pilih **Ulangi gerakan** atau **Perbaiki pesan**.
7. Perbaiki pesan di ruang percakapan. Gunakan **Tampilkan teks besar** atau **Bacakan pesan** sesuai kebutuhan.
8. Pilih **Hentikan kamera** setelah selesai.

Kamu tetap dapat mengetik dan menampilkan pesan tanpa kamera. Pesan hilang saat halaman dimuat ulang.

## Batas kemampuan saat ini

- Aplikasi membaca satu isyarat tingkat kata per rekaman. Aplikasi belum menerjemahkan kalimat atau percakapan isyarat secara terus-menerus.
- Model belajar dari satu video sumber untuk setiap kata. Variasi gerakan, pengguna, posisi kamera, dan pencahayaan dapat menghasilkan kata yang keliru. Hasil selalu perlu diperiksa.
- Model hanya mencakup 31 label percobaan, bukan seluruh SIBI. Data huruf terpisah tidak digunakan oleh model kata aktif.
- Pembaca pesan hanya memakai suara bahasa Indonesia yang berjalan di perangkat. Jika suara tersebut tidak tersedia, tombol dinonaktifkan dengan penjelasan. Aplikasi tidak menggantinya dengan layanan suara daring.
- Teks menjadi video isyarat, pengenalan percakapan berkelanjutan, dan pengumpulan data melalui aplikasi masih menjadi rencana pengembangan.
- Tampilan ponsel sudah diperiksa. Ketepatan pengenalan melalui kamera ponsel, seluruh browser, dan penggunaan tanpa internet belum dijamin.

## Privasi dan sumber data

Kamera menyala setelah dipilih pengguna, tanpa mikrofon. Video, data gerakan, dan pesan diproses di perangkat serta tidak diunggah atau disimpan sebagai riwayat percakapan. Kamera dan pembacaan suara berhenti saat pengguna berpindah tab. Pembacaan juga berhenti ketika pesan diubah atau dibersihkan.

Internet dipakai untuk memuat aplikasi dan asetnya. Tautan Kamus SIBI membuka situs pihak ketiga hanya saat dipilih.

Video pelatihan berasal dari [Kamus SIBI Kemendikdasmen](https://pkplk.kemendikdasmen.go.id/sibi/pencarian/advance). Dokumentasi izin tertulis untuk pelatihan dan distribusi model belum tersedia. Akses publik ke sumber tidak dijadikan dasar untuk mengklaim bahwa seluruh hak penggunaan sudah terpenuhi.

Jangan unggah rekaman pribadi, identitas peserta, atau formulir persetujuan ke repositori maupun folder publik. Pengumpulan data baru perlu disertai persetujuan penggunaan yang jelas.

## Menjalankan di komputer sendiri

Bagian ini untuk anggota tim yang ingin menjalankan atau mengembangkan kode. Siapkan Node.js dan npm; versi Node proyek tercatat di `.node-version`, sedangkan rentang yang didukung tercantum di `package.json`.

Di folder proyek, jalankan:

```sh
npm ci
npm run dev
```

Buka alamat lokal yang ditampilkan di terminal. Tidak diperlukan akun, berkas `.env`, Python, pelatihan ulang, atau server GPU untuk menjalankan web dengan model yang sudah tersedia.

Model browser disertakan di `web-models/`. Perintah pengembangan dan build menyiapkan asetnya secara otomatis. Persiapan pertama memerlukan internet untuk mengambil detektor tangan resmi dan memeriksa keutuhan berkasnya.

`npm run prepare:ml` hanya digunakan saat mengekspor hasil pelatihan baru dari lingkungan Python lokal. Perintah tersebut **bukan langkah instalasi web biasa**. Lihat [panduan ML](ml/README.md) untuk pekerjaan pelatihan.

## Pemeriksaan sebelum mengirim perubahan

```sh
npm run check
npm run test:e2e
```

`check` menjalankan pemeriksaan kode, paket model, tes aplikasi, dan build. `test:e2e` menguji aplikasi di Google Chrome; Chrome perlu terpasang. Untuk melihat hasil build secara manual, jalankan `npm run preview`.

Pemeriksaan lokal terakhir pada 8 November 2026: **26 tes aplikasi, 5 tes paket model, dan 11 tes Chrome lulus**, beserta pemeriksaan kode, tipe data, dan build. Pemeriksaan ini menguji fungsi aplikasi; hasilnya bukan ukuran ketepatan pengenalan pada pengguna baru.

Uji Chrome pada perangkat pemeriksaan belum menemukan suara bahasa Indonesia lokal. Alur pembaca pesan diuji dengan suara pengganti yang terkontrol; kualitas suara pada perangkat yang mendukung masih perlu dicoba langsung.

## Teknologi dan susunan proyek

Antarmuka memakai React, TypeScript, Vite, dan CSS. MediaPipe mendeteksi titik tangan; model LSTM mengenali kata melalui TensorFlow.js. Pengolahan kamera dan model dipisahkan dari tampilan menggunakan Web Worker. Aplikasi disajikan melalui Vercel.

| Folder | Isi |
| --- | --- |
| `src/app/` | Halaman utama dan tampilan aplikasi. |
| `src/features/` | Kamera, pembaca pesan, dan panduan kosakata. |
| `src/data/` | Daftar kata yang mengikuti model aktif. |
| `src/ml/` | Pengolahan gerakan dan pengenalan kata di browser. |
| `web-models/` | Paket model yang dibutuhkan web dan disertakan di Git. |
| `ml/` | Konfigurasi dan skrip pelatihan lokal. Dataset pribadi tidak ikut Git. |
| `scripts/` | Persiapan aset dan proses build. |
| `tests/` | Pemeriksaan otomatis. |
| `reports/` | Hasil dan keterbatasan pengujian model. |

Perancangan, kode, pengujian, dan dokumentasi dibantu OpenAI Codex serta ChatGPT. Tim tetap bertanggung jawab untuk memahami, meninjau, dan menjelaskan hasilnya. Font Manrope menggunakan [SIL Open Font License 1.1](public/licenses/manrope-OFL.txt); hak komponen lain mengikuti ketentuan masing-masing.

## Pengembangan dan dokumentasi

Gunakan nama branch yang menjelaskan pekerjaan, misalnya `codex/add-speech-and-word-guide` atau `codex/update-readme-and-proposal`. Gunakan commit ringkas seperti `feat(ui): add searchable vocabulary` atau `docs(readme): simplify project guide`. Periksa perubahan dan hasil tes sebelum menggabungkannya. Pengiriman ke GitHub dan penerbitan ke Vercel dilakukan terpisah dari penyimpanan lokal.

- [Kebutuhan produk](prd.md)
- [Arsitektur sistem](archtecture.md)
- [Daftar tugas](todo.md)
- [Persiapan data dan pelatihan](ml/README.md)
- [Hasil pelatihan model 31 kata](reports/training-reference-v2.md)
- [Paket model browser](web-models/README.md)
- [Pemasangan di Vercel](DEPLOYMENT.md)

Dokumen perencanaan dan laporan lama mencatat tahap pengembangan masing-masing. Gunakan kode dan hasil pengujian terbaru untuk memastikan kemampuan versi yang akan diterbitkan.
