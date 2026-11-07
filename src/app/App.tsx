import activeModel from '../../ml/configs/active-model.json'
import { useRef, useState } from 'react'
import { RecognitionPanel } from '../features/camera/RecognitionPanel'
import { SpeechControls } from '../features/speech/SpeechControls'
import { VocabularyGuide } from '../features/vocabulary/VocabularyGuide'

export function App() {
  const [text, setText] = useState('')
  const editor = useRef<HTMLTextAreaElement>(null)
  const largeText = useRef<HTMLDialogElement>(null)
  const showText = useRef<HTMLButtonElement>(null)
  const correct = () => { editor.current?.focus(); editor.current?.scrollIntoView?.({ block: 'center' }) }

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
          <a href="#kosakata">Kosakata</a>
          <a href="#panduan">Panduan</a>
        </nav>
        <span className="stage"><span className="status-dot" aria-hidden="true" />Dalam pengembangan</span>
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
            <p>Ada {activeModel.expectedLabelCount} kata yang dapat dicoba. Lakukan satu isyarat, lalu periksa kata yang terbaca sebelum menggunakannya.</p>
            <span className="status-caption">Hasil masih bisa keliru. Kamu tetap bisa menulis pesan.</span>
          </aside>
        </section>
        <div className="workspace">
          <RecognitionPanel onCorrect={correct} onCommit={word => setText(current => `${current.trimEnd()}${current.trim() ? ' ' : ''}${word}`)} />
          <section className="panel conversation-panel" aria-labelledby="teks-judul">
            <div className="panel-heading">
              <div><span className="section-index">02 / tulis pesan</span><h2 id="teks-judul">Ruang percakapan</h2></div>
              <span className="panel-status">Bisa ditulis dan diperbaiki</span>
            </div>
            <label htmlFor="percakapan">Teks percakapan</label>
            <textarea ref={editor} id="percakapan" value={text} onChange={(event) => setText(event.target.value)} placeholder={'Ada yang ingin disampaikan?\nTulis pesan Anda di sini…'} aria-describedby="teks-info" rows={6} />
            <div className="editor-actions">
              <span className="character-count">{text.length} karakter</span>
              <button className="text-button" type="button" disabled={!text} onClick={() => setText('')}>Bersihkan teks</button>
            </div>
            <SpeechControls text={text} />
            <button ref={showText} type="button" className="large-text-button secondary-button" disabled={!text.trim()} onClick={() => largeText.current?.showModal()}>Tampilkan teks besar</button>
            <p className="note" id="teks-info">Periksa dan perbaiki pesan sebelum menunjukkannya kepada lawan bicara. Kata ditambahkan setelah kamu memilih Gunakan kata. Pesan hilang saat halaman dimuat ulang.</p>
            <div className="clip-status">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="6" width="24" height="20" rx="4" /><path d="m13 11 8 5-8 5V11Z" strokeLinejoin="round" /></svg>
              <div><h3>Pesan menjadi peragaan isyarat</h3><p>Fitur ini belum tersedia. Untuk saat ini, tunjukkan pesan melalui tampilan teks besar.</p></div>
            </div>
          </section>
        </div>
        <VocabularyGuide />
        <section className="guidance" id="panduan" aria-labelledby="batasan">
          <div><p className="eyebrow">Sebelum memulai</p><h2 id="batasan">Langkah kecil.<br />Percakapan lebih terbuka.</h2></div>
          <div className="guidance-copy">
            <p>Nyalakan kamera, pilih Rekam satu isyarat, lalu tunggu hitung mundur selesai. Lakukan satu gerakan utuh dan pilih Selesai dan periksa. Gunakan kata hanya jika sesuai maksudmu.</p>
            <p>Aplikasi belum memahami percakapan bebas atau seluruh SIBI. Jika hasil meragukan, ulangi gerakan atau tulis pesan sendiri. Tampilkan teks besar agar mudah dibaca bersama.</p>
          </div>
        </section>
        <aside className="privacy-note" id="privasi" aria-labelledby="privasi-judul">
          <h2 id="privasi-judul">Percakapan tetap di halaman ini.</h2>
          <p>Kamera hanya menyala atas pilihanmu, tanpa mikrofon. Gerakan dibaca di perangkatmu. Video tidak disimpan; video, gerakan, dan pesan tidak dikirim keluar perangkat. Pembacaan pesan memakai suara yang tersedia di perangkat. Kamera dan suara berhenti saat kamu menghentikannya atau berpindah tab. Pesan hilang saat halaman dimuat ulang.</p>
        </aside>
      </main>
      <dialog ref={largeText} className="large-text-dialog" aria-labelledby="pesan-besar-judul" onClose={() => showText.current?.focus()} onKeyDown={event => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, [tabindex="0"]')
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}>
        <div className="large-text-heading"><h2 id="pesan-besar-judul">Pesan untuk lawan bicara</h2><button type="button" className="secondary-button" onClick={() => largeText.current?.close()}>Kembali ke percakapan</button></div>
        <p className="large-text-content" tabIndex={0}>{text}</p>
        <p className="large-text-hint">Tekan Escape atau pilih kembali untuk memperbaiki pesan.</p>
      </dialog>
      <footer><span>IsyaratKu <span className="footer-divider">/</span> Belajar, tanpa jarak komunikasi.</span><a href="#privasi">Tentang privasi <span aria-hidden="true">↗</span></a></footer>
    </>
  )
}
