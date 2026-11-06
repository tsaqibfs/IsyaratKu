import { useState } from 'react'

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
        <span className="stage"><span className="status-dot" aria-hidden="true" />Prototipe awal</span>
      </header>
      <main id="utama" tabIndex={-1}>
        <section className="intro" aria-labelledby="judul">
          <div className="intro-copy">
            <p className="eyebrow">SIBI · untuk ruang kelas yang lebih terbuka</p>
            <h1 id="judul">Ruang untuk saling <em>memahami.</em></h1>
            <p>Mulai dari percakapan sederhana. Sebuah ruang untuk menghubungkan isyarat, tulisan, dan kebutuhan belajar.</p>
          </div>
          <aside className="intro-status" aria-label="Status pengembangan">
            <span className="small-label">Sedang dibangun, bersama.</span>
            <p>Editor teks sudah bisa digunakan. Kamera, model, dan klip SIBI masih dalam pengembangan.</p>
            <span className="status-caption">Belum ada pengenalan otomatis</span>
          </aside>
        </section>
        <div className="workspace">
          <section className="panel camera-panel" aria-labelledby="kamera-judul">
            <div className="panel-heading">
              <div><span className="section-index">01 / area isyarat</span><h2 id="kamera-judul">Isyarat ke teks</h2></div>
              <span className="panel-status">Kamera nonaktif</span>
            </div>
            <div className="camera-placeholder">
              <span className="viewfinder-corner corner-start" aria-hidden="true" />
              <span className="viewfinder-corner corner-end" aria-hidden="true" />
              <div className="camera-empty">
                <svg className="camera-symbol" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="10" y="19" width="31" height="27" rx="7" />
                  <path d="m41 28 13-7v23l-13-7M23 27v11m-5-5.5h10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>Di sini, isyarat menjadi awal percakapan.</h3>
                <p>Kamera belum aktif. Area ini akan menampilkan pratinjau saat fitur kamera tersedia.</p>
              </div>
              <span className="viewfinder-caption">Pratinjau kamera · belum tersedia</span>
            </div>
            <div className="camera-actions">
              <button type="button" disabled aria-describedby="kamera-info">Mulai kamera <span aria-hidden="true">↗</span></button>
              <span className="local-note">Tanpa akses mikrofon</span>
            </div>
            <p className="note" id="kamera-info">Belum tersedia. Halaman ini tidak meminta akses kamera atau mikrofon.</p>
          </section>
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
            <p className="note" id="teks-info">Teks hanya ada di halaman ini dan hilang saat dimuat ulang. Belum ada hasil pengenalan otomatis.</p>
            <div className="clip-status">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="6" width="24" height="20" rx="4" /><path d="m13 11 8 5-8 5V11Z" strokeLinejoin="round" /></svg>
              <div><h3>Teks ke klip isyarat</h3><p>Menunggu kosakata dan klip SIBI yang telah divalidasi. Belum ada kata yang didukung.</p></div>
            </div>
          </section>
        </div>
        <section className="guidance" id="panduan" aria-labelledby="batasan">
          <div><p className="eyebrow">Sebelum memulai</p><h2 id="batasan">Langkah kecil.<br />Percakapan lebih terbuka.</h2></div>
          <div className="guidance-copy">
            <p>Target awal adalah 5–10 isyarat terpisah dengan jeda. Kosakata akan diperluas setelah validasi bersama pengguna SIBI.</p>
            <p>Pengenalan ini belum mencakup percakapan bebas atau seluruh SIBI. Untuk saat ini, gunakan editor untuk mengetik secara manual.</p>
          </div>
        </section>
        <aside className="privacy-note" id="privasi" aria-labelledby="privasi-judul">
          <h2 id="privasi-judul">Percakapan tetap di halaman ini.</h2>
          <p>Pada prototipe ini, teks tidak disimpan atau dikirim ke server. Tidak ada akses kamera, mikrofon, atau perekaman. Seluruh font dan aset dimuat dari aplikasi ini.</p>
        </aside>
      </main>
      <footer><span>IsyaratKu <span className="footer-divider">/</span> Belajar, tanpa jarak komunikasi.</span><a href="#privasi">Tentang privasi <span aria-hidden="true">↗</span></a></footer>
    </>
  )
}
