import activeModel from '../../ml/configs/active-model.json'
import { PREPROCESS_VERSION } from './preprocess'
import type { Candidate } from './decision'

export type FromWorker =
  | { type: 'READY'; modelId: string; labels: string[] }
  | { type: 'FRAME_DONE'; clipId: number | null; hands: number; samples: number; durationMs: number; detectionMs: number }
  | { type: 'RESULT'; clipId: number; candidate: Candidate | null; message: string; inferenceMs: number }
  | { type: 'ERROR'; message: string }

export function validateMetadata(value: unknown): asserts value is { labels: string[]; sha256: Record<string, string> } {
  const m = value as Record<string, unknown> | null
  if (!m || m.id !== activeModel.modelId || m.experimental !== true || m.releaseEligible !== false
    || m.preprocessVersion !== PREPROCESS_VERSION || JSON.stringify(m.inputShape) !== '[null,30,137]'
    || !Array.isArray(m.labels) || m.labels.length !== activeModel.expectedLabelCount || new Set(m.labels).size !== activeModel.expectedLabelCount
    || m.labels.some(l => typeof l !== 'string' || !l.trim()) || !m.sha256 || typeof m.sha256 !== 'object') {
    throw new Error('Paket model tidak cocok dengan versi aplikasi.')
  }
}

export function clipQuality(frames: import('./preprocess').HandFrame[]): string | null {
  if (frames.length < 15) return 'Rekaman terlalu pendek. Rekam gerakan utuh sedikitnya satu detik.'
  const duration = frames.at(-1)!.timestamp - frames[0]!.timestamp
  if (duration < 1000 || duration > 10000) return 'Durasi rekaman harus antara 1 dan 10 detik.'
  if (frames.some((f, i) => i > 0 && f.timestamp - frames[i - 1]!.timestamp > 200)) return 'Pemrosesan frame terputus. Ulangi rekaman dengan perangkat yang lebih responsif.'
  const withHand = frames.filter(f => f.masks.some(Boolean)).length
  if (withHand < 5 || withHand / frames.length < .2) return 'Tangan belum terlihat cukup jelas. Posisikan seluruh gerakan di dalam kamera.'
  const visible = frames.map((f, i) => f.masks.some(Boolean) ? i : -1).filter(i => i >= 0)
  for (let i = 1; i < visible.length; i++) {
    if (frames[visible[i]!]!.timestamp - frames[visible[i - 1]!]!.timestamp > 400) return 'Tangan hilang di tengah gerakan. Ulangi isyarat tanpa keluar dari kamera.'
  }
  return null
}
