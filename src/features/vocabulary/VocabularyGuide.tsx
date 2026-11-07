import { useRef, useState } from 'react'
import { vocabulary } from '../../data/vocabulary'

const normalize = (value: string) => value.trim().toLocaleLowerCase('id-ID').replace(/[-\s/]+/g, ' ')
const display = (label: string) => label.charAt(0).toLocaleUpperCase('id-ID') + label.slice(1).replaceAll('-', ' / ')

export function VocabularyGuide() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const search = useRef<HTMLInputElement>(null)
  const filtered = vocabulary.filter(label => normalize(label).includes(normalize(query)))

  return <section className="vocabulary-guide" id="kosakata" aria-labelledby="kosakata-judul">
    <div className="vocabulary-heading">
      <div><p className="eyebrow">Mulai dari satu kata</p><h2 id="kosakata-judul">Kata yang dapat dicoba</h2><p>Cari kata, lalu pilih untuk melihat panduan mencoba.</p></div>
      <span className="vocabulary-count" aria-live="polite">{query.trim() ? `${filtered.length} kata ditemukan` : `${vocabulary.length} kata tersedia`}</span>
    </div>
    <div className="vocabulary-search">
      <label htmlFor="cari-kata">Cari kata</label>
      <div><input ref={search} id="cari-kata" type="search" value={query} placeholder="Contoh: buku atau selamat" onChange={event => { setQuery(event.target.value); setSelected(null) }} aria-controls="daftar-kata" />
        {query && <button type="button" className="text-button" onClick={() => { setQuery(''); setSelected(null); search.current?.focus() }}>Bersihkan pencarian</button>}
      </div>
    </div>
    {filtered.length > 0 ? <ul id="daftar-kata" className="word-list" aria-label="Daftar kata">{filtered.map(label => <li key={label}><button type="button" className="word-choice" aria-pressed={selected === label} aria-controls="panduan-kata" onClick={() => setSelected(label)}>{display(label)}</button></li>)}</ul>
      : <p id="daftar-kata" className="note">{vocabulary.length ? 'Kata belum ada dalam daftar. Coba kata lain.' : 'Daftar kata belum tersedia. Coba muat ulang halaman.'}</p>}
    <div className="word-guidance" id="panduan-kata" aria-live="polite">
      {selected && <>
        <h3>Mencoba kata {display(selected)}</h3>
        <p>Pelajari bentuk isyaratnya melalui rujukan Kamus SIBI. Setelah siap, tampilkan seluruh gerakan di kamera dan lakukan satu isyarat utuh.</p>
        <a href="https://pkplk.kemendikdasmen.go.id/sibi/pencarian/advance" target="_blank" rel="noopener noreferrer">Lihat rujukan di Kamus SIBI<span className="visually-hidden"> (membuka tab baru)</span></a>
        <p className="note">Pilihan kata ini hanya sebagai panduan mencoba. Selalu periksa kata yang terbaca sebelum menggunakannya.</p>
      </>}
    </div>
  </section>
}
