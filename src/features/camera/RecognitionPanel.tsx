import { useRecognition } from './useRecognition'

export function RecognitionPanel({ onCommit }: { onCommit: (word: string) => void }) {
  const { videoRef, phase, message, labels, candidate, stats, start, stop, record, finish, cancel, consume } = useRecognition()
  const active = !['idle', 'error'].includes(phase)
  const phaseLabel = { idle: 'Kamera nonaktif', loading: 'Menyiapkan kamera', ready: 'Siap mencoba', recording: 'Merekam isyarat', analyzing: 'Memeriksa gerakan', error: 'Perlu diperiksa' }[phase]
  return <section className="panel camera-panel" aria-labelledby="kamera-judul">
    <div className="panel-heading">
      <div><span className="section-index">01 / area isyarat</span><h2 id="kamera-judul">Isyarat ke teks</h2></div>
      <span className="panel-status">{phaseLabel}</span>
    </div>
    <div className={`camera-placeholder${active ? ' camera-live' : ''}`}>
      <video ref={videoRef} muted playsInline className={active ? 'camera-video' : 'camera-video camera-hidden'} aria-label="Pratinjau kamera lokal" />
      {!active && <div className="camera-empty"><h3>Satu gerakan, lalu periksa bersama.</h3><p>Nyalakan kamera untuk mencoba model kosakata eksperimen. Kamu tetap bisa mengetik pesan.</p></div>}
      <span className="viewfinder-caption">{phase === 'recording' ? `● ${(stats.durationMs / 1000).toFixed(1)} / 10 detik` : active ? `${stats.hands} tangan terdeteksi · pratinjau cermin` : 'Kamera hanya aktif setelah kamu memilih mulai'}</span>
    </div>
    <div className="camera-actions">
      {!active ? <button type="button" onClick={() => void start()}>Mulai kamera</button> : <button type="button" className="secondary-button" onClick={() => stop()}>Hentikan kamera</button>}
      <span className="local-note">Tanpa akses mikrofon</span>
    </div>
    {(phase === 'ready' || phase === 'recording' || phase === 'analyzing') && <div className="recognition-actions">
      {phase === 'recording' ? <><button type="button" disabled={stats.durationMs < 1000} onClick={finish}>Selesai dan periksa</button><button type="button" className="text-button" onClick={cancel}>Batal</button></> : <button type="button" disabled={phase === 'analyzing'} onClick={record}>{phase === 'analyzing' ? 'Memeriksa…' : 'Rekam satu isyarat'}</button>}
    </div>}
    <p className="note recognition-message" role="status" aria-live="polite">{message}</p>
    {candidate && <div className="recognition-result">
      <span className="small-label">Kandidat eksperimen</span>
      <strong>{candidate.label}</strong>
      <p>Skor model {candidate.score.toFixed(3)} · bukan probabilitas kebenaran.</p>
      <button type="button" disabled={!candidate.accepted} onClick={() => { const label = consume(); if (label) onCommit(label) }}>Gunakan kata</button>
    </div>}
    {labels.length > 0 && <details className="vocabulary-list"><summary>{labels.length} kata dalam model eksperimen</summary><p>{labels.join(', ')}.</p></details>}
    <p className="note experiment-note">Model dilatih dari satu video per kata. Belum diuji pada pengguna baru; hasil dapat keliru. Rekam gerakan utuh 1–10 detik dengan jeda singkat sebelum dan sesudahnya.</p>
  </section>
}
