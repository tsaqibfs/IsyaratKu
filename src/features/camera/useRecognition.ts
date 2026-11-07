import activeModel from '../../../ml/configs/active-model.json'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FromWorker } from '../../ml/contract'
import type { Candidate } from '../../ml/decision'

type Phase = 'idle' | 'loading' | 'ready' | 'recording' | 'analyzing' | 'error'
type Resources = {
  session: number; worker: Worker | null; stream: MediaStream | null; raf: number;
  busy: boolean; lastFrame: number; clipId: number; phase: Phase;
  timer: ReturnType<typeof setTimeout> | null; deadline: ReturnType<typeof setTimeout> | null;
  frameDeadline: ReturnType<typeof setTimeout> | null; lastUI: number;
}

export function useRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const r = useRef<Resources>({ session: 0, worker: null, stream: null, raf: 0, busy: false, lastFrame: 0, clipId: 0, phase: 'idle', timer: null, deadline: null, frameDeadline: null, lastUI: 0 })
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('Nyalakan kamera, lalu rekam satu gerakan utuh. Video tidak disimpan.')
  const [labels, setLabels] = useState<string[]>([])
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const pendingCandidate = useRef<Candidate | null>(null)
  const [stats, setStats] = useState({ hands: 0, samples: 0, durationMs: 0 })
  const transition = useCallback((next: Phase) => { r.current.phase = next; setPhase(next) }, [])
  const stop = useCallback((reason?: string) => {
    const resource = r.current
    resource.session++
    cancelAnimationFrame(resource.raf)
    for (const timer of [resource.timer, resource.deadline, resource.frameDeadline]) if (timer) clearTimeout(timer)
    resource.timer = resource.deadline = resource.frameDeadline = null
    resource.stream?.getTracks().forEach(track => { track.onended = null; track.stop() })
    resource.stream = null
    resource.worker?.terminate()
    resource.worker = null
    resource.busy = false
    const video = videoRef.current
    if (video) video.srcObject = null
    pendingCandidate.current = null
    setCandidate(null)
    setStats({ hands: 0, samples: 0, durationMs: 0 })
    transition(reason ? 'error' : 'idle')
    setMessage(reason ?? 'Kamera dihentikan. Rekaman sementara sudah dibuang.')
  }, [transition])

  const finish = useCallback(() => {
    if (r.current.phase !== 'recording') return
    if (r.current.timer) clearTimeout(r.current.timer)
    transition('analyzing')
    setMessage('Memeriksa gerakan di perangkat ini…')
    r.current.worker?.postMessage({ type: 'END', clipId: r.current.clipId })
    r.current.deadline = setTimeout(() => stop('Pemeriksaan terlalu lama. Coba nyalakan kamera kembali.'), 20000)
  }, [stop, transition])

  const start = useCallback(async () => {
    if (!['idle', 'error'].includes(r.current.phase)) return
    const session = ++r.current.session
    transition('loading')
    setMessage('Meminta izin kamera dan memuat model lokal…')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Kamera memerlukan HTTPS atau localhost dan browser yang mendukung.')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } })
      if (r.current.session !== session) { stream.getTracks().forEach(t => t.stop()); return }
      r.current.stream = stream
      stream.getVideoTracks().forEach(track => { track.onended = () => stop('Kamera terputus. Periksa perangkat lalu coba lagi.') })
      const video = videoRef.current
      if (!video) throw new Error('Pratinjau kamera tidak tersedia.')
      video.srcObject = stream
      await video.play()
      if (r.current.session !== session) return
      const worker = new Worker(new URL(`${import.meta.env.BASE_URL}ml/runtime/recognition.worker.js?model=${activeModel.modelId}`, window.location.href))
      r.current.worker = worker
      r.current.deadline = setTimeout(() => stop('Model belum berhasil dimuat. Periksa aset lokal lalu coba lagi.'), 45000)
      worker.onerror = () => { if (r.current.session === session) stop('Pemroses model gagal. Hentikan lalu nyalakan kamera kembali.') }
      worker.onmessage = (event: MessageEvent<FromWorker>) => {
        if (r.current.session !== session) return
        const data = event.data
        if (data.type === 'ERROR') { stop(data.message); return }
        if (data.type === 'READY') {
          if (data.modelId !== activeModel.modelId || data.labels.length !== activeModel.expectedLabelCount || new Set(data.labels).size !== activeModel.expectedLabelCount) {
            stop('Versi model berbeda. Muat ulang halaman untuk menggunakan model terbaru.'); return
          }
          if (r.current.deadline) clearTimeout(r.current.deadline)
          setLabels(data.labels)
          transition('ready')
          setMessage('Model eksperimen siap. Posisikan seluruh gerakan dan kedua tangan di kamera.')
        }
        if (data.type === 'FRAME_DONE') {
          r.current.busy = false
          if (r.current.frameDeadline) clearTimeout(r.current.frameDeadline)
          if (performance.now() - r.current.lastUI > 200) {
            r.current.lastUI = performance.now()
            setStats(old => ({ hands: data.hands, samples: data.clipId === r.current.clipId ? data.samples : old.samples, durationMs: data.clipId === r.current.clipId ? data.durationMs : old.durationMs }))
          }
        }
        if (data.type === 'RESULT' && data.clipId === r.current.clipId && r.current.phase === 'analyzing') {
          if (r.current.deadline) clearTimeout(r.current.deadline)
          pendingCandidate.current = data.candidate
          setCandidate(data.candidate)
          setMessage(data.message)
          transition('ready')
        }
      }
      worker.postMessage({ type: 'INIT', base: new URL(`${import.meta.env.BASE_URL}ml/`, window.location.href).href })
      const tick = (now: number) => {
        if (r.current.session !== session) return
        r.current.raf = requestAnimationFrame(tick)
        if (!['ready', 'recording'].includes(r.current.phase) || r.current.busy || now - r.current.lastFrame < 1000 / 15 || video.readyState < 2) return
        r.current.lastFrame = now
        r.current.busy = true
        const clipId = r.current.phase === 'recording' ? r.current.clipId : null
        r.current.frameDeadline = setTimeout(() => stop('Pemrosesan kamera tidak merespons. Coba ulangi sesi.'), 10000)
        void createImageBitmap(video).then(bitmap => {
          if (r.current.session !== session) { bitmap.close(); return }
          try { worker.postMessage({ type: 'FRAME', bitmap, timestamp: now, clipId }, [bitmap]) }
          catch { bitmap.close(); stop('Frame kamera gagal dikirim ke pemroses.') }
        }).catch(() => { if (r.current.session === session) stop('Frame kamera tidak dapat dibaca.') })
      }
      r.current.raf = requestAnimationFrame(tick)
    } catch (error) {
      if (r.current.session !== session) return
      const name = error instanceof DOMException ? error.name : ''
      stop(name === 'NotAllowedError' ? 'Izin kamera ditolak. Izinkan kamera pada browser untuk mencoba lagi.' : name === 'NotFoundError' ? 'Kamera tidak ditemukan. Hubungkan webcam lalu coba lagi.' : name === 'NotReadableError' ? 'Kamera sedang digunakan atau tidak dapat dibuka.' : error instanceof Error ? error.message : 'Kamera gagal dimulai.')
    }
  }, [stop, transition])

  const record = useCallback(() => {
    if (r.current.phase !== 'ready') return
    r.current.clipId++
    pendingCandidate.current = null; setCandidate(null)
    setStats(old => ({ ...old, samples: 0, durationMs: 0 }))
    r.current.worker?.postMessage({ type: 'BEGIN', clipId: r.current.clipId })
    transition('recording')
    setMessage('Merekam landmark sementara. Peragakan satu isyarat, lalu pilih Selesai dan periksa.')
    r.current.timer = setTimeout(finish, 10000)
  }, [finish, transition])

  const cancel = useCallback(() => {
    if (r.current.phase !== 'recording') return
    if (r.current.timer) clearTimeout(r.current.timer)
    r.current.worker?.postMessage({ type: 'CANCEL', clipId: r.current.clipId })
    transition('ready')
    setStats(old => ({ ...old, samples: 0, durationMs: 0 }))
    setMessage('Rekaman dibatalkan dan buffer dibuang. Kamu bisa mencoba lagi.')
  }, [transition])

  const consume = () => {
    const value = pendingCandidate.current
    if (!value?.accepted || r.current.phase !== 'ready') return null
    pendingCandidate.current = null; setCandidate(null)
    setMessage('Kata ditambahkan. Periksa dan koreksi di ruang percakapan bila perlu.')
    return value.label
  }

  useEffect(() => {
    const visibility = () => { if (document.hidden && !['idle', 'error'].includes(r.current.phase)) stop('Kamera dihentikan karena tab tidak aktif. Mulai kembali saat siap.') }
    document.addEventListener('visibilitychange', visibility)
    return () => { document.removeEventListener('visibilitychange', visibility); stop() }
  }, [stop])

  return { videoRef, phase, message, labels, candidate, stats, start, stop, record, finish, cancel, consume }
}
