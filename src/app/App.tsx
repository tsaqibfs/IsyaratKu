import { useState } from 'react'

export function App() {
  const [text, setText] = useState('')

  return (
    <>
      <a className="skip-link" href="#utama">Lewati ke konten utama</a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Isyaratku AI, beranda">isyaratku<span>ai</span></a>
        <span className="stage">Prototipe · tahap setup</span>
      </header>
      <main id="utama" tabIndex={-1}>
        <section className="intro" aria-labelledby="judul">
          <p className="eyebrow">Komunikasi sederhana di kelas</p>
          <h1 id="judul">Ruang untuk saling memahami.</h1>
          <p>Fondasi aplikasi pengenal kosakata SIBI di browser. Model dan klip isyarat belum tersedia pada tahap ini.</p>
        </section>
        <div className="workspace">
          <section className="panel" aria-labelledby="kamera-judul">
            <div className="panel-heading"><h2 id="kamera-judul">Isyarat ke teks</h2><span>01</span></div>
            <div className="camera-placeholder">
              <span className="camera-symbol" aria-hidden="true">↗</span>
              <h3>Kamera belum aktif</h3>
              <p>Integrasi kamera dan pengenalan akan ditambahkan pada tahap berikutnya.</p>
            </div>
            <button type="button" disabled aria-describedby="kamera-info">Mulai kamera</button>
            <p className="note" id="kamera-info">Belum tersedia. Halaman ini tidak meminta akses kamera atau mikrofon.</p>
          </section>
          <section className="panel" aria-labelledby="teks-judul">
            <div className="panel-heading"><h2 id="teks-judul">Ruang percakapan</h2><span>02</span></div>
            <label htmlFor="percakapan">Teks percakapan</label>
            <textarea id="percakapan" value={text} onChange={(event) => setText(event.target.value)} placeholder="Anda sudah bisa mengetik di sini…" aria-describedby="teks-info" rows={7} />
            <p className="note" id="teks-info">Teks hanya ada di memori halaman dan hilang saat dimuat ulang. Belum ada hasil pengenalan otomatis.</p>
            <button className="secondary" type="button" disabled={!text} onClick={() => setText('')}>Bersihkan teks</button>
            <div className="clip-status">
              <h3>Teks ke klip isyarat</h3>
              <p>Menunggu kosakata dan klip SIBI yang telah divalidasi. Belum ada kata yang didukung.</p>
            </div>
          </section>
        </div>
        <section className="guidance" aria-labelledby="batasan">
          <h2 id="batasan">Kenali batasannya sejak awal</h2>
          <p>Target MVP adalah 5–10 isyarat terpisah dengan jeda, kemudian diperluas setelah evaluasi. Pengenalan ini belum mencakup percakapan bebas atau seluruh SIBI.</p>
        </section>
      </main>
      <footer>Isyaratku AI <span>Dirancang untuk pemrosesan kamera di perangkat.</span></footer>
    </>
  )
}
