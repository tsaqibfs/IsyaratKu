export const PREPROCESS_VERSION = 'hands-clip-normalized-v1'
export const FEATURE_DIM = 137
export interface HandFrame { timestamp: number; points: number[][][]; masks: boolean[] }

/** Whole segmented clip, identical to Python; never fills a missing hand. */
export function preprocess(frames: HandFrame[], aspect: number): number[][] {
  if (frames.length < 2 || !Number.isFinite(aspect) || aspect <= 0) throw new Error('Klip tidak lengkap.')
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]!
    if (!Number.isFinite(f.timestamp) || (i > 0 && f.timestamp <= frames[i - 1]!.timestamp)
      || f.points.length !== 2 || f.masks.length !== 2 || f.masks.some(m => typeof m !== 'boolean')
      || f.points.some(h => h.length !== 21 || h.some(p => p.length !== 3 || p.some(v => !Number.isFinite(v))))) {
      throw new Error('Format landmark atau timestamp tidak valid.')
    }
  }
  const first = frames[0]!.timestamp
  const last = frames.at(-1)!.timestamp
  const output: number[][] = []
  for (let k = 0; k < 30; k++) {
    const moment = first + (last - first) * k / 29
    let right = frames.findIndex(f => f.timestamp >= moment)
    if (right < 0) right = frames.length - 1
    const r = frames[right]!
    const l = frames[Math.max(0, right - 1)]!
    const exact = Math.abs(r.timestamp - moment) < 1e-6
    const masks = [0, 1].map(s => exact ? r.masks[s]! : Boolean(right > 0 && r.timestamp - l.timestamp <= 200 && r.masks[s] && l.masks[s]))
    const points = [0, 1].map(s => Array.from({ length: 21 }, (_, j) => [0, 1, 2].map(d => {
      if (!masks[s]) return 0
      const value = exact ? r.points[s]![j]![d]! : l.points[s]![j]![d]! * (1 - (moment - l.timestamp) / (r.timestamp - l.timestamp)) + r.points[s]![j]![d]! * ((moment - l.timestamp) / (r.timestamp - l.timestamp))
      return Math.fround(Math.fround(value) * (d === 1 ? 1 : aspect))
    })))
    const row = Array<number>(FEATURE_DIM).fill(0)
    for (const s of [0, 1]) {
      const wrist = points[s]![0]!
      const distance = (j: number) => Math.hypot(...points[s]![j]!.map((v, d) => v - wrist[d]!))
      const palm = (distance(5) + distance(17)) / 2
      if (!masks[s] || palm <= 1e-6) { masks[s] = false; continue }
      for (let j = 0; j < 21; j++) for (let d = 0; d < 3; d++) row[s * 67 + j * 3 + d] = Math.fround((points[s]![j]![d]! - wrist[d]!) / palm)
      for (let d = 0; d < 3; d++) row[s * 67 + 63 + d] = wrist[d]!
      row[s * 67 + 66] = 1
    }
    if (masks[0] && masks[1]) for (let d = 0; d < 3; d++) row[134 + d] = Math.fround(points[1]![0]![d]! - points[0]![0]![d]!)
    output.push(row)
  }
  return output
}
