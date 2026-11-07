import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/app/App'
import activeModel from '../../ml/configs/active-model.json'

class UtteranceFake {
  text: string
  lang = ''
  rate = 1
  voice: SpeechSynthesisVoice | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) { this.text = text }
}
const localId = { name: 'Indonesia lokal', lang: 'id-ID', localService: true, voiceURI: 'local-id', default: false } as SpeechSynthesisVoice
const remoteId = { ...localId, name: 'Indonesia daring', localService: false, voiceURI: 'remote-id' } as SpeechSynthesisVoice
const localEn = { ...localId, name: 'English', lang: 'en-US', voiceURI: 'local-en' } as SpeechSynthesisVoice
let voices: SpeechSynthesisVoice[]
let queue: UtteranceFake[]
let synthesis: EventTarget & { getVoices: ReturnType<typeof vi.fn>; speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> }
beforeEach(() => {
  voices = [remoteId, localEn, localId]
  queue = []
  synthesis = Object.assign(new EventTarget(), {
    getVoices: vi.fn(() => voices), speak: vi.fn((u: UtteranceFake) => queue.push(u)), cancel: vi.fn(),
  })
  vi.stubGlobal('speechSynthesis', synthesis)
  vi.stubGlobal('SpeechSynthesisUtterance', UtteranceFake)
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('pembacaan pesan', () => {
  it('membaca hanya setelah diminta, memakai suara Indonesia lokal, dan menunggu teks', () => {
    render(<App />)
    const read = screen.getByRole('button', { name: 'Bacakan pesan' })
    expect(read).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: '  Tolong ulangi penjelasannya.  ' } })
    expect(synthesis.speak).not.toHaveBeenCalled()
    fireEvent.click(read)
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ text: 'Tolong ulangi penjelasannya.', voice: localId, lang: 'id-ID' })
    expect(screen.getByRole('button', { name: 'Hentikan suara' })).toBeEnabled()
    act(() => queue[0]!.onend?.())
    expect(screen.getByRole('button', { name: 'Bacakan pesan' })).toBeEnabled()
  })

  it('tidak mengganti suara lokal dengan suara daring atau bahasa lain', () => {
    voices = [remoteId, localEn]
    render(<App />)
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Halo' } })
    expect(screen.getByRole('button', { name: 'Bacakan pesan' })).toBeDisabled()
    expect(screen.getByText(/Suara bahasa Indonesia belum tersedia/)).toBeVisible()
    expect(synthesis.speak).not.toHaveBeenCalled()
    voices = [localId]
    act(() => synthesis.dispatchEvent(new Event('voiceschanged')))
    expect(screen.getByRole('button', { name: 'Bacakan pesan' })).toBeEnabled()
    voices = [remoteId]
    fireEvent.click(screen.getByRole('button', { name: 'Bacakan pesan' }))
    expect(synthesis.speak).not.toHaveBeenCalled()
  })

  it('menghentikan suara dan mengabaikan peristiwa dari pembacaan lama', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Halo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Bacakan pesan' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hentikan suara' }))
    expect(synthesis.cancel).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Bacakan pesan' }))
    act(() => queue[0]!.onend?.())
    expect(screen.getByRole('button', { name: 'Hentikan suara' })).toBeEnabled()
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Pesan baru' } })
    expect(synthesis.cancel).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('button', { name: 'Bacakan pesan' })).toBeEnabled()
  })

  it('berhenti saat berpindah tab atau keluar halaman dan menangani kegagalan suara', () => {
    const view = render(<App />)
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Halo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Bacakan pesan' }))
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(synthesis.cancel).toHaveBeenCalledTimes(1)
    hidden.mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Bacakan pesan' }))
    act(() => queue[1]!.onerror?.())
    expect(screen.getByText(/Pesan belum bisa dibacakan/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Bacakan pesan' }))
    view.unmount()
    expect(synthesis.cancel).toHaveBeenCalledTimes(2)
  })

  it('editor tetap dapat dipakai ketika browser tidak mendukung suara', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    render(<App />)
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Pesan tetap ada' } })
    expect(screen.getByRole('button', { name: 'Bacakan pesan' })).toBeDisabled()
    expect(screen.getByLabelText('Teks percakapan')).toHaveValue('Pesan tetap ada')
    expect(screen.getByText(/Browser ini belum mendukung/)).toBeVisible()
  })
})

describe('panduan kosakata', () => {
  it('menampilkan seluruh kata tanpa meminta akses kamera', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
    render(<App />)
    expect(within(screen.getByRole('list', { name: 'Daftar kata' })).getAllByRole('button')).toHaveLength(activeModel.expectedLabelCount)
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('mencari tanpa membedakan huruf besar dan menyediakan rujukan tanpa mengisi pesan', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari kata' }), { target: { value: '  SELAMAT  ' } })
    const list = screen.getByRole('list', { name: 'Daftar kata' })
    expect(within(list).getAllByRole('button')).toHaveLength(1)
    fireEvent.click(within(list).getByRole('button', { name: 'Selamat' }))
    expect(screen.getByRole('heading', { name: 'Mencoba kata Selamat' })).toBeVisible()
    expect(screen.getByRole('link', { name: /Lihat rujukan di Kamus SIBI/ })).toHaveAttribute('href', 'https://pkplk.kemendikdasmen.go.id/sibi/pencarian/advance')
    expect(screen.getByLabelText('Teks percakapan')).toHaveValue('')
    expect(synthesis.speak).not.toHaveBeenCalled()
  })

  it('menjelaskan pencarian kosong dan mengembalikan daftar dengan keyboard', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari kata' }), { target: { value: 'kata-tidak-ada' } })
    expect(screen.getByText('Kata belum ada dalam daftar. Coba kata lain.')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Bersihkan pencarian' }))
    expect(screen.getByRole('searchbox', { name: 'Cari kata' })).toHaveFocus()
    expect(within(screen.getByRole('list', { name: 'Daftar kata' })).getAllByRole('button')).toHaveLength(activeModel.expectedLabelCount)
  })
})
