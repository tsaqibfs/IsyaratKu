# Paket model browser untuk build dari Git

Folder ini menyimpan lima file inferensi untuk model aktif: metadata, arsitektur TF.js, bobot, label, dan preprocessing. Ini bagian publik aplikasi yang perlu ikut commit agar Vercel dapat build tanpa dataset atau Python. Tidak berisi video sumber, landmark peserta, optimizer training, atau file Keras.

`npm run prepare:ml` dijalankan lokal setelah training dan memperbarui paket ini. Review perubahan `web-models/<id>/` beserta `ml/configs/active-model.json`, lalu commit bersama. Pada Vercel, `npm run build` menyalin paket ke public, menyiapkan WASM dari npm, mengunduh detektor resmi dengan checksum terkunci bila belum ada, dan membangun worker. Tidak ada training di server hosting.

Model masih eksperimen; baca metadata `releaseEligible: false` dan laporan training. Publikasi paket tidak menjadi bukti kualitas pada pengguna baru.
