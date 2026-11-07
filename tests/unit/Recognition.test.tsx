import { describe, expect, it } from 'vitest'
import { preprocess, type HandFrame } from '../../src/ml/preprocess'
import { decide } from '../../src/ml/decision'
import { clipQuality, validateMetadata } from '../../src/ml/contract'
import fixture from '../../ml/fixtures/preprocess-v1.json'
import activeModel from '../../ml/configs/active-model.json'

function frame(timestamp: number, present = true): HandFrame {
  return { timestamp, points: [Array.from({ length: 21 }, (_, i) => [0.2 + i / 100, 0.3 + i / 70, 0]), Array.from({ length: 21 }, () => [0, 0, 0])], masks: [present, false] }
}

describe('klip pengenalan', () => {
  it('menerima paket aktif dan menolak jumlah label atau versi paket yang salah', () => {
    const packet = { id: activeModel.modelId, experimental: true, releaseEligible: false,
      preprocessVersion: 'hands-clip-normalized-v1', inputShape: [null, 30, 137],
      labels: Array.from({ length: activeModel.expectedLabelCount }, (_, i) => `label-${i}`), sha256: {} }
    expect(() => validateMetadata(packet)).not.toThrow()
    expect(() => validateMetadata({ ...packet, labels: packet.labels.slice(1) })).toThrow()
    expect(() => validateMetadata({ ...packet, id: 'wrong-model' })).toThrow()
  })
  it('setara dengan fixture Python pada dua tangan, gap, mask, dan rasio aspek', () => {
    const result = preprocess(fixture.frames, fixture.aspect)
    const error = Math.max(...result.flatMap((row, i) => row.map((v, j) => Math.abs(v - fixture.expected[i]![j]!))))
    expect(error).toBeLessThan(fixture.tolerance)
  })
  it('menolak rekaman tanpa tangan, frame terputus, dan model tidak cocok', () => {
    expect(clipQuality([])).toMatch(/pendek/)
    expect(clipQuality(Array.from({ length: 20 }, (_, i) => frame(i * 70, false)))).toMatch(/Tangan/)
    const gap = Array.from({ length: 20 }, (_, i) => frame(i * 70 + (i > 10 ? 300 : 0)))
    expect(clipQuality(gap)).toMatch(/terputus/)
    const missing = Array.from({ length: 30 }, (_, i) => frame(i * 70, i < 5 || i > 15))
    expect(clipQuality(missing)).toMatch(/hilang/)
    expect(() => validateMetadata({ preprocessVersion: 'wrong' })).toThrow()
  })
  it('menolak klip kosong dan timestamp tidak berurutan', () => {
    expect(() => preprocess([], 1)).toThrow()
    expect(() => preprocess([frame(0), frame(0)], 1)).toThrow()
  })
  it('menjaga mask dan lintasan tanpa mengarang tangan yang hilang', () => {
    const points = [frame(0), frame(100, false), frame(200)]
    const result = preprocess(points, 1)
    expect(result).toHaveLength(30)
    expect(result[0]![66]).toBe(1)
    expect(result[14]![66]).toBe(0)
    expect(result.flat().every(Number.isFinite)).toBe(true)
  })
  it('menolak skor lemah, ambigu, NaN, dan bentuk output yang salah', () => {
    expect(decide([.6, .4], ['a', 'b']).accepted).toBe(false)
    expect(decide([.85, .8], ['a', 'b']).accepted).toBe(false)
    expect(() => decide([NaN, .1], ['a', 'b'])).toThrow()
    expect(() => decide([.9], ['a', 'b'])).toThrow()
    expect(decide([.95, .05], ['a', 'b'])).toMatchObject({ label: 'a', accepted: true })
  })
})
