import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/app/App'

describe('fondasi aplikasi', () => {
  it('tidak meminta kamera atau menampilkan inferensi palsu saat dibuka', () => {
    const getUserMedia = vi.fn()
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
    try {
      render(<App />)
      expect(getUserMedia).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Mulai kamera' })).toBeEnabled()
      expect(screen.getByLabelText('Teks percakapan')).toHaveValue('')
      expect(screen.getByText(/Fitur ini belum tersedia/)).toBeVisible()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('memungkinkan teks manual dibersihkan tanpa hasil otomatis', () => {
    render(<App />)
    const input = screen.getByLabelText('Teks percakapan')
    const clear = screen.getByRole('button', { name: 'Bersihkan teks' })
    expect(clear).toBeDisabled()
    fireEvent.change(input, { target: { value: 'Tolong ulang materi.' } })
    expect(input).toHaveValue('Tolong ulang materi.')
    fireEvent.click(clear)
    expect(input).toHaveValue('')
    expect(clear).toBeDisabled()
  })

  it('menyediakan panduan tiga langkah dan mode teks besar dari isi editor', () => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', '') } })
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) } })
    const show = vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.setAttribute('open', '') })
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) })
    render(<App />)
    expect(screen.getByRole('list', { name: 'Langkah pengenalan' })).toBeVisible()
    const open = screen.getByRole('button', { name: 'Tampilkan teks besar' })
    expect(open).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Teks percakapan'), { target: { value: 'Tolong ulangi penjelasannya.' } })
    fireEvent.click(open)
    expect(screen.getByRole('dialog', { name: 'Pesan untuk lawan bicara' })).toHaveTextContent('Tolong ulangi penjelasannya.')
    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke percakapan' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Teks percakapan')).toHaveValue('Tolong ulangi penjelasannya.')
    show.mockRestore(); close.mockRestore()
  })
})
