import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/app/App'
import activeModel from '../../ml/configs/active-model.json'
import type { FromWorker } from '../../src/ml/contract'

class WorkerFake {
  static instances: WorkerFake[] = []
  onmessage: ((event: MessageEvent<FromWorker>) => void) | null = null
  onerror: (() => void) | null = null
  messages: { type: string; clipId?: number }[] = []
  terminate = vi.fn()
  constructor() { WorkerFake.instances.push(this) }
  postMessage(value: { type: string; clipId?: number }) { this.messages.push(value) }
  emit(value: FromWorker) { this.onmessage?.({ data: value } as MessageEvent<FromWorker>) }
}

const track = { onended: null as (() => void) | null, stop: vi.fn() }
const stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream
let getUserMedia: ReturnType<typeof vi.fn>
beforeEach(() => {
  WorkerFake.instances = []
  track.stop.mockReset(); track.onended = null
  getUserMedia = vi.fn().mockResolvedValue(stream)
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
  vi.stubGlobal('Worker', WorkerFake)
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
})
afterEach(() => vi.unstubAllGlobals())

async function ready() {
  fireEvent.click(screen.getByRole('button', { name: 'Mulai kamera' }))
  await waitFor(() => expect(WorkerFake.instances).toHaveLength(1))
  const worker = WorkerFake.instances[0]!
  act(() => worker.emit({ type: 'READY', modelId: activeModel.modelId, labels: ['halo', 'buku', ...Array.from({ length: activeModel.expectedLabelCount - 2 }, (_, i) => `label-${i}`)] }))
  return worker
}
function begin(worker: WorkerFake) {
  fireEvent.click(screen.getByRole('button', { name: 'Rekam satu isyarat' }))
  const id = worker.messages.at(-1)!.clipId!
  act(() => worker.emit({ type: 'FRAME_DONE', clipId: id, hands: 1, samples: 25, durationMs: 1600, detectionMs: 10 }))
  return id
}

describe('lifecycle kamera dan konfirmasi kandidat (worker mock untuk unit)', () => {
  it('menolak worker dengan versi model lama sebelum merekam', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Mulai kamera' }))
    await waitFor(() => expect(WorkerFake.instances).toHaveLength(1))
    const worker = WorkerFake.instances[0]!
    act(() => worker.emit({ type: 'READY', modelId: 'stale-model', labels: Array.from({ length: activeModel.expectedLabelCount }, (_, i) => `label-${i}`) }))
    expect(screen.getByRole('status')).toHaveTextContent('Versi model berbeda')
    expect(worker.terminate).toHaveBeenCalledTimes(1)
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Rekam satu isyarat' })).not.toBeInTheDocument()
  })
  it('hanya menambah kata setelah konfirmasi, sekali, dan mengabaikan hasil duplikat', async () => {
    render(<App />)
    const worker = await ready()
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Pesan' } })
    const clipId = begin(worker)
    fireEvent.click(screen.getByRole('button', { name: 'Selesai dan periksa' }))
    const result: FromWorker = { type: 'RESULT', clipId, candidate: { label: 'halo', score: .99, margin: .98, accepted: true }, message: 'Periksa kandidat.', inferenceMs: 1 }
    act(() => worker.emit(result))
    expect(screen.getByLabelText('Teks percakapan')).toHaveValue('Pesan')
    fireEvent.click(screen.getByRole('button', { name: 'Gunakan kata' }))
    expect(screen.getByLabelText('Teks percakapan')).toHaveValue('Pesan halo')
    act(() => worker.emit(result))
    expect(screen.queryByRole('button', { name: 'Gunakan kata' })).not.toBeInTheDocument()
  })
  it('stop dan unmount melepaskan track serta worker; hasil lama diabaikan', async () => {
    const view = render(<App />)
    const worker = await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Hentikan kamera' }))
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(worker.terminate).toHaveBeenCalledTimes(1)
    act(() => worker.emit({ type: 'READY', modelId: 'stale-model', labels: ['lama'] }))
    expect(screen.queryByRole('button', { name: 'Rekam satu isyarat' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mulai kamera' }))
    await waitFor(() => expect(WorkerFake.instances).toHaveLength(2))
    view.unmount()
    expect(track.stop).toHaveBeenCalledTimes(2)
    expect(WorkerFake.instances[1]!.terminate).toHaveBeenCalledTimes(1)
  })
  it('kamera yang diizinkan setelah stop langsung dihentikan', async () => {
    let resolve!: (value: MediaStream) => void
    getUserMedia.mockImplementation(() => new Promise<MediaStream>(r => { resolve = r }))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Mulai kamera' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hentikan kamera' }))
    await act(async () => resolve(stream))
    expect(track.stop).toHaveBeenCalledTimes(1)
    expect(WorkerFake.instances).toHaveLength(0)
  })
  it('kandidat lemah tidak dapat ditambahkan dan rekaman batal tidak menghasilkan kata', async () => {
    render(<App />)
    const worker = await ready()
    let clipId = begin(worker)
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    act(() => worker.emit({ type: 'RESULT', clipId, candidate: { label: 'halo', score: .99, margin: .98, accepted: true }, message: 'lama', inferenceMs: 1 }))
    expect(screen.queryByRole('button', { name: 'Gunakan kata' })).not.toBeInTheDocument()
    clipId = begin(worker)
    // Duration state may be throttled after a recent frame; let the same
    // public finish action be enabled by a later acknowledgement.
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 220)); worker.emit({ type: 'FRAME_DONE', clipId, hands: 1, samples: 25, durationMs: 1600, detectionMs: 10 }) })
    fireEvent.click(screen.getByRole('button', { name: 'Selesai dan periksa' }))
    act(() => worker.emit({ type: 'RESULT', clipId, candidate: { label: 'halo', score: .6, margin: .2, accepted: false }, message: 'Lemah', inferenceMs: 1 }))
    expect(screen.getByRole('button', { name: 'Gunakan kata' })).toBeDisabled()
    expect(screen.getByLabelText('Teks percakapan')).toHaveValue('')
  })
})
