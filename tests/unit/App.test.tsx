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
      expect(screen.getByRole('button', { name: 'Mulai kamera' })).toBeDisabled()
      expect(screen.getByLabelText('Teks percakapan')).toHaveValue('')
      expect(screen.getByText(/Belum ada kata yang didukung/)).toBeVisible()
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
})
