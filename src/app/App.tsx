import activeModel from '../../ml/configs/active-model.json'
import { useState } from 'react'
import { RecognitionPanel } from '../features/camera/RecognitionPanel'

export function App() {
  const [text, setText] = useState('')

  return (
    <>
      <a className="skip-link" href="#utama">Lewati ke konten utama</a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="IsyaratKu, beranda">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="36" height="36" />
          IsyaratKu
        </a>
        <nav aria-label="Navigasi utama">
          <a className="nav-current" href="#utama" aria-current="page">Ruang komunikasi</a>
          <a href="#panduan">Panduan</a>
        </nav>
        <span className="stage"><span className="status-dot" aria-hidden="true" />Model eksperimen</span>
      </header>
      <main id="utama" tabIndex={-1}>
        <section className="intro" aria-labelledby="judul">
          <div className="intro-copy">
            <p className="eyebrow">SIBI · untuk ruang kelas yang lebih terbuka</p>
            <h1 id="judul">Ruang untuk saling <em>memahami.</em></h1>
            <p>Mulai dari percakapan sederhana. Sebuah ruang untuk menghubungkan isyarat, tulisan, dan kebutuhan belajar.</p>
          </div>
          <aside className="intro-status" aria-label="Status pengembangan">
            <span className="small-label">Coba satu isyarat, periksa hasilnya.</span>
            <p>Model {activeModel.expectedLabelCount} kata kini berjalan di browser. Rekam satu gerakan dan periksa kandidat sebelum menambahkannya ke percakapan.</p>
            <span className="status-caption">Eksperimen · belum diuji pada pengguna baru</span>
          </aside>
        </section>
        <div className="workspace">
          <RecognitionPanel onCommit={word => setText(current => `${current.trimEnd()}${current.trim() ? ' ' : ''}${word}`)} />
          <section className="panel conversation-panel" aria-labelledby="teks-judul">
            <div className="panel-heading">
              <div><span className="section-index">02 / tulis pesan</span><h2 id="teks-judul">Ruang percakapan</h2></div>
              <span className="panel-status">Teks manual</span>
            </div>
            <label htmlFor="percakapan">Teks percakapan</label>
            <textarea id="percakapan" value={text} onChange={(event) => setText(event.target.value)} placeholder={'Ada yang ingin disampaikan?\nTulis pesan Anda di sini…'} aria-describedby="teks-info" rows={6} />
            <div className="editor-actions">
              <span className="character-count">{text.length} karakter</span>
              <button className="text-button" type="button" disabled={!text} onClick={() => setText('')}>Bersihkan teks</button>
            </div>
            <p className="note" id="teks-info">Teks hanya ada di halaman ini dan hilang saat dimuat ulang. Kandidat baru ditambahkan setelah kamu memilih Gunakan kata.</p>
            <div className="clip-status">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="6" width="24" height="20" rx="4" /><path d="m13 11 8 5-8 5V11Z" strokeLinejoin="round" /></svg>
              <div><h3>Teks ke klip isyarat</h3><p>Menunggu kosakata dan klip SIBI yang telah divalidasi. Belum ada kata yang didukung.</p></div>
            </div>
          </section>
        </div>
        <section className="guidance" id="panduan" aria-labelledby="batasan">
          <div><p className="eyebrow">Sebelum memulai</p><h2 id="batasan">Langkah kecil.<br />Percakapan lebih terbuka.</h2></div>
          <div className="guidance-copy">
            <p>Nyalakan kamera, pilih Rekam satu isyarat, lakukan gerakan utuh, lalu pilih Selesai dan periksa. Periksa kandidat dan gunakan kata jika sesuai maksudmu.</p>
            <p>Model eksperimen belum mengenali percakapan bebas atau seluruh SIBI. Data training masih terbatas. Jika hasil meragukan, ulangi gerakan atau ketik pesan secara manual.</p>
          </div>
        </section>
        <aside className="privacy-note" id="privasi" aria-labelledby="privasi-judul">
          <h2 id="privasi-judul">Percakapan tetap di halaman ini.</h2>
          <p>Kamera aktif atas pilihanmu, tanpa mikrofon. Tombol rekam hanya menampung landmark sementara untuk satu isyarat; video tidak disimpan. Video, landmark, dan teks tidak diunggah atau disimpan secara persisten. Kamera berhenti saat dihentikan atau tab tidak aktif. Seluruh model, font, dan aset dimuat dari aplikasi ini.</p>
        </aside>
      </main>
      <footer><span>IsyaratKu <span className="footer-divider">/</span> Belajar, tanpa jarak komunikasi.</span><a href="#privasi">Tentang privasi <span aria-hidden="true">↗</span></a></footer>
    </>
  )
}
