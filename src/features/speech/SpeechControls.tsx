import { useCallback, useEffect, useRef, useState } from 'react'

function localIndonesianVoice(): SpeechSynthesisVoice | undefined {
  try {
    const voices = window.speechSynthesis?.getVoices().filter(voice => voice.localService === true && /^id(?:[-_]|$)/i.test(voice.lang)) ?? []
    return voices.find(voice => voice.default) ?? voices[0]
  } catch { return undefined }
}

export function SpeechControls({ text }: { text: string }) {
  const synthesis = window.speechSynthesis
  const supported = Boolean(synthesis && typeof window.SpeechSynthesisUtterance === 'function')
  const [voice, setVoice] = useState(localIndonesianVoice)
  const [playing, setPlaying] = useState(false)
  const [feedback, setFeedback] = useState('')
  const current = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (!current.current) return
    current.current = null
    try { synthesis?.cancel() } catch { /* The text remains available if the device stops responding. */ }
    setPlaying(false)
    setFeedback('Pembacaan dihentikan.')
  }, [synthesis])

  useEffect(() => {
    if (!supported || !synthesis) return
    const refresh = () => {
      const next = localIndonesianVoice()
      setVoice(next)
      if (!next) stop()
    }
    const hide = () => { if (document.hidden) stop() }
    synthesis.addEventListener('voiceschanged', refresh)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', stop)
    const timer = window.setTimeout(refresh, 0)
    return () => {
      window.clearTimeout(timer)
      synthesis.removeEventListener('voiceschanged', refresh)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', stop)
      stop()
    }
  }, [supported, synthesis, stop])

  // Replacing or clearing the editor must not leave an older message speaking.
  useEffect(() => () => stop(), [text, stop])

  const speak = () => {
    if (!supported || !synthesis || !text.trim() || document.hidden) return
    const selected = localIndonesianVoice()
    if (!selected) {
      setVoice(undefined)
      setFeedback('Suara bahasa Indonesia belum tersedia di perangkat ini.')
      return
    }
    stop()
    try {
      const utterance = new SpeechSynthesisUtterance(text.trim())
      utterance.voice = selected
      utterance.lang = selected.lang
      utterance.rate = 1
      current.current = utterance
      utterance.onend = () => {
        if (current.current !== utterance) return
        current.current = null
        setPlaying(false)
        setFeedback('Pesan selesai dibacakan.')
      }
      utterance.onerror = () => {
        if (current.current !== utterance) return
        current.current = null
        setPlaying(false)
        setFeedback('Pesan belum bisa dibacakan. Coba lagi atau tunjukkan teksnya.')
      }
      setPlaying(true)
      setFeedback('Sedang membacakan pesan…')
      synthesis.speak(utterance)
    } catch {
      current.current = null
      setPlaying(false)
      setFeedback('Pesan belum bisa dibacakan. Coba lagi atau tunjukkan teksnya.')
    }
  }

  const explanation = !supported ? 'Browser ini belum mendukung pembacaan suara. Kamu tetap bisa menunjukkan teks.'
    : !voice ? 'Suara bahasa Indonesia belum tersedia di perangkat ini. Kamu tetap bisa menunjukkan teks.'
      : feedback || 'Periksa pesanmu, lalu pilih bacakan. Suara diputar dari perangkat ini.'

  return <div className="speech-controls" role="group" aria-label="Pembacaan pesan">
    <button type="button" disabled={!playing && (!text.trim() || !voice || !supported)} onClick={playing ? stop : speak} aria-describedby="suara-info">{playing ? 'Hentikan suara' : 'Bacakan pesan'}</button>
    <p className="note" id="suara-info" aria-live="polite">{explanation}</p>
  </div>
}
