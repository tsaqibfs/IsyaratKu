import { useRecognition } from './useRecognition'

export function RecognitionPanel({ onCommit, onCorrect }: { onCommit: (word: string) => void; onCorrect: () => void }) {
  const { videoRef, phase, message, labels, candidate, stats, countdown, hasResult, start, stop, record, finish, cancel, consume, dismiss } = useRecognition()
  const active = !['idle', 'error'].includes(phase)
  const phaseLabel = { idle: 'Kamera nonaktif', loading: 'Menyiapkan kamera', ready: 'Siap mencoba', countdown: 'Bersiap', recording: 'Membaca isyarat', analyzing: 'Memeriksa gerakan', error: 'Perlu diperiksa' }[phase]
  const step = hasResult || phase === 'analyzing' ? 3 : ['countdown', 'recording'].includes(phase) ? 2 : 1
  const correct = () => { dismiss(); onCorrect() }
  const unclear = !candidate && /Tangan/.test(message) ? 'Tangan belum terlihat dengan jelas. Ulangi gerakan atau tulis pesan sendiri.'
    : !candidate && /pendek/.test(message) ? 'Gerakan terlalu pendek. Lakukan satu gerakan utuh, lalu periksa lagi.'
      : !candidate && /terputus|hilang/.test(message) ? 'Gerakan sempat terputus. Pastikan tangan tetap terlihat, lalu coba lagi.'
        : 'Hasil belum jelas. Kamu bisa mengulangi gerakan atau menulis pesan sendiri.'
  return <section className="panel camera-panel" aria-labelledby="kamera-judul">
    <div className="panel-heading">
      <div><span className="section-index">01 / area isyarat</span><h2 id="kamera-judul">Isyarat ke teks</h2></div>
      <span className="panel-status">{phaseLabel}</span>
    </div>
    <ol className="recognition-steps" aria-label="Langkah pengenalan">
      <li aria-current={step === 1 ? 'step' : undefined}><span>1</span><div><strong>Posisikan tangan</strong><small>Nyalakan kamera dan bersiap.</small></div></li>
      <li aria-current={step === 2 ? 'step' : undefined}><span>2</span><div><strong>Lakukan satu isyarat</strong><small>Mulai setelah hitung mundur.</small></div></li>
      <li aria-current={step === 3 ? 'step' : undefined}><span>3</span><div><strong>Periksa hasilnya</strong><small>Gunakan atau perbaiki kata.</small></div></li>
    </ol>
    <div className={`camera-placeholder${active ? ' camera-live' : ''}`}>
      <video ref={videoRef} muted playsInline className={active ? 'camera-video' : 'camera-video camera-hidden'} aria-label="Pratinjau kamera lokal" />
      {!active && <div className="camera-empty"><h3>Satu gerakan, lalu periksa bersama.</h3><p>Nyalakan kamera untuk membaca satu isyarat. Kamu tetap bisa menulis pesan sendiri.</p></div>}
      {phase === 'countdown' && <div className="countdown-overlay"><div role="timer" aria-label="Hitung mundur" aria-live="polite"><span>Mulai dalam</span><strong>{countdown}</strong><span>detik</span></div></div>}
      <span className="viewfinder-caption">{active ? `${stats.hands} tangan terlihat · tampilan seperti cermin` : 'Kamera hanya aktif setelah kamu memilih mulai'}</span>
    </div>
    {active && phase !== 'loading' && <p className={`hand-readiness${stats.hands > 0 ? ' hands-visible' : ''}`}><span aria-hidden="true" />{stats.hands > 0 ? 'Tangan terlihat. Pastikan seluruh gerakan tetap di dalam gambar.' : 'Belum ada tangan terlihat. Posisikan tangan di depan kamera.'}</p>}
    <div className="camera-actions">
      {!active ? <button type="button" onClick={() => void start()}>Mulai kamera</button> : <button type="button" className="secondary-button" onClick={() => stop()}>Hentikan kamera</button>}
      <span className="local-note">Tanpa akses mikrofon</span>
    </div>
    {phase === 'recording' && <div className="recording-progress"><div><strong>Sedang membaca gerakan</strong><span>{(stats.durationMs / 1000).toFixed(1)} / 10 detik</span></div><progress aria-label="Durasi rekaman" max={10000} value={stats.durationMs} /><p>Pilih selesai setelah satu gerakan utuh. Berhenti otomatis setelah 10 detik.</p></div>}
    {(phase === 'ready' || phase === 'countdown' || phase === 'recording' || phase === 'analyzing') && <div className="recognition-actions">
      {phase === 'countdown' ? <button type="button" className="secondary-button" onClick={cancel}>Batal</button> : phase === 'recording' ? <><button type="button" disabled={stats.samples < 15 || stats.capturedMs < 1000} onClick={finish}>Selesai dan periksa</button><button type="button" className="text-button" onClick={cancel}>Batal</button></> : <button type="button" disabled={phase === 'analyzing'} onClick={record}>{phase === 'analyzing' ? 'Memeriksa…' : hasResult ? 'Ulangi gerakan' : 'Rekam satu isyarat'}</button>}
    </div>}
    <p className="note recognition-message" role="status" aria-live="polite">{hasResult ? candidate?.accepted ? 'Apakah kata ini sesuai maksudmu? Periksa sebelum menambahkannya ke pesan.' : unclear : message}</p>
    {hasResult && <div className="recognition-result">
      <span className="small-label">{candidate ? 'Kata yang terbaca' : 'Belum ada kata yang terbaca'}</span>
      {candidate && <><strong>{candidate.label}</strong><p>{candidate.accepted ? 'Gunakan hanya jika sesuai dengan yang ingin kamu sampaikan.' : 'Kata ini masih meragukan. Tulis sendiri jika belum sesuai.'}</p></>}
      <div className="result-actions">
        {candidate && <button type="button" disabled={!candidate.accepted} onClick={() => { const label = consume(); if (label) onCommit(label) }}>Gunakan kata</button>}
        <button type="button" className="secondary-button" onClick={correct}>Perbaiki pesan</button>
      </div>
    </div>}
    {labels.length > 0 && <details className="vocabulary-list"><summary>{labels.length} kata yang dapat dicoba</summary><p>{labels.join(', ')}.</p></details>}
    <p className="note experiment-note">Pengenalan isyarat masih dalam pengembangan dan bisa keliru. Selalu periksa hasilnya. Kamu dapat menulis pesan sendiri kapan saja.</p>
  </section>
}
