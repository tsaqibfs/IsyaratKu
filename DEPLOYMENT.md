# Auto deploy IsyaratKu dari GitHub ke Vercel

Disiapkan 7 November 2026 pada branch `codex/vercel-github-autodeploy`. Konfigurasi dan build lokal sudah diperiksa; repository belum dipush dan project Vercel belum dihubungkan oleh penyiapan ini.

## Isi repository yang diperlukan

Commit seluruh source aplikasi yang diperlukan, `package.json`/lockfile, konfigurasi TypeScript/Vite/ESLint, `scripts/`, `tests/`, `ml/configs/`, fixture sintetis, `vercel.json`, serta `web-models/words-reference-v2/`. Ada perubahan aplikasi dari pekerjaan sebelumnya yang masih belum di-commit; jangan hanya mengunggah file vercel.json.

Folder `web-models` berisi lima file inferensi model aktif (sekitar 224 KB). Inilah model browser yang harus ikut Git. Dataset, landmark sumber, `.keras`, `.venv`, `ml/runs`, `ml/assets`, `public/ml`, `node_modules`, dan `dist` tetap diabaikan. `.vercelignore` juga melindungi file lokal bila kelak memakai CLI dari root proyek. Jangan mengunggah formulir persetujuan atau pemetaan identitas peserta.

Review `git status` dan daftar file yang akan di-commit. Contoh subjek commit: `chore(deploy): enable github vercel builds`. Setelah commit, push branch yang berisi seluruh perubahan ke repository GitHub. Penyiapan ini tidak menjalankan push, merge, atau deploy otomatis.

## Pengaturan di Vercel

1. Login Vercel, hubungkan GitHub, dan beri akses ke repository IsyaratKu.
2. Pilih Add New Project dan import repository tersebut dari GitHub.
3. Gunakan pengaturan berikut. File `vercel.json` sudah memuat framework dan perintah build.

| Pengaturan | Nilai |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | Root repository / `./`, bukan `dist` |
| Install Command | `npm ci` |
| Build Command | `npm run check` |
| Output Directory | `dist` |
| Node.js Version | `26.x` |
| Environment variables aplikasi | Tidak diperlukan |
| Production Branch | Branch yang sudah berisi kode ini; saat ini `codex/vercel-github-autodeploy`, atau `main` setelah digabung |

4. Pilih Deploy. Hosting akan memasang paket Node, menjalankan pemeriksaan, menyiapkan aset, dan membangun aplikasi. Tidak ada training/Python di Vercel.
5. Buka URL production melalui HTTPS. Uji izin kamera, daftar 31 label, penolakan tanpa tangan, hasil kandidat, dan stop kamera. Coba juga jendela incognito untuk memastikan juri tidak diminta login Vercel.

Setiap push berikutnya ke Production Branch akan membangun ulang versi production melalui integrasi GitHub Vercel. Jika kode baru hanya ada di branch tugas, jangan memilih branch production yang masih berisi kode lama. Setelah main diperbarui, pengaturan Production Branch dapat dialihkan ke main.

## Cara aset ML tersedia di server build

`npm run check` menjalankan lint, lima tes paket deployment, 13 unit test frontend, lalu build. Prebuild menyalin paket aktif dari `web-models/<id>/` ke `public/ml/<id>/`, menyiapkan WASM dari versi MediaPipe npm yang terkunci, serta mengunduh Hand Landmarker resmi bila belum ada. URL detektor dipatok ke versi 1 dan SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`. Worker klasik dibangun dari source. Semua aset runtime kemudian disajikan oleh origin web sendiri.

Paket model diperiksa versi, jumlah/urutan label, kontrak preprocessing, dan checksum sebelum disalin. JSON hasil ekspor dinormalisasi ke LF sebelum hashing, sehingga checkout Git pada Linux tidak mengubah checksum. Bobot `.bin` tetap diperlakukan sebagai binary oleh `.gitattributes`.

Untuk memperbarui model, lakukan training dan ekspor lokal (`npm run prepare:ml`), lalu commit folder `web-models/<id>/` dan konfigurasi aktif yang bersesuaian bersama perubahan lainnya. Model tidak dilatih ulang karena sekadar push frontend. Jangan mengedit file paket ber-checksum secara manual.

## Hasil pemeriksaan lokal

- Build dari salinan source Git-eligible tanpa dataset, run training, Python environment, atau generated public/ml berhasil. Dependency Node yang sudah terpasang dipakai melalui junction; ini simulasi source bersih, bukan bukti npm ci di server Linux atau deployment remote. Unduhan detektor resmi dan checksum-nya benar-benar diuji.
- Hash byte lima file paket model tetap identik setelah filter Git sesuai `.gitattributes`.
- Lima tes paket deployment, 13 unit frontend, lint/typecheck/build, dan enam e2e Chrome lulus.
- Uji e2e memakai kamera kanvas sintetis dan model nyata. Kualitas pengguna baru serta webcam fisik tetap belum dibuktikan. Model masih eksperimen.

## Jika build gagal

Jika paket browser tidak ditemukan, pastikan `web-models/<modelId>/` ikut commit dan ID-nya cocok dengan `ml/configs/active-model.json`. Untuk kegagalan checksum, ekspor ulang lokal dan commit seluruh paket yang terkait, bukan hanya satu file. Jika unduhan detektor gagal, periksa log/network build dan retry; jangan menonaktifkan pemeriksaan checksum. Log build Vercel menjadi bukti akhir kompatibilitas lingkungan hosting.

Rujukan: [Vite di Vercel](https://vercel.com/docs/frameworks/frontend/vite), [integrasi GitHub](https://vercel.com/docs/git/vercel-for-github), [versi Node](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), dan [konfigurasi vercel.json](https://vercel.com/docs/project-configuration/vercel-json).
