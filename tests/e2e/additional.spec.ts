import { expect, test } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

test('daftar kata dapat dicari tanpa kamera dan pilihan tidak mengubah pesan', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new Error('Camera must not be requested') } })
  await page.goto('/')
  await page.getByRole('link', { name: 'Kosakata', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Cari kata' }).fill('PAHAM')
  const word = page.getByRole('button', { name: 'Paham / mengerti', exact: true })
  await expect(word).toHaveCount(1)
  await word.click()
  await expect(word).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { name: 'Mencoba kata Paham / mengerti' })).toBeVisible()
  await expect(page.getByLabel('Teks percakapan')).toHaveValue('')
  await page.screenshot({ path: 'test-results/vocabulary-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.locator('#kosakata').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/vocabulary-mobile.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('searchbox', { name: 'Cari kata' }).fill('kata yang tidak ada')
  await expect(page.getByText('Kata belum ada dalam daftar. Coba kata lain.')).toBeVisible()
  await page.getByRole('button', { name: 'Bersihkan pencarian' }).click()
  await expect(page.getByRole('searchbox', { name: 'Cari kata' })).toBeFocused()
  await expect(page.getByRole('list', { name: 'Daftar kata' }).getByRole('button')).toHaveCount(31)
  expect(errors).toEqual([])
})

test('suara memakai pilihan lokal dan berhenti ketika pesan diubah tanpa unggahan', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') requests.push(request.url()) })
  await page.addInitScript(() => {
    const local = { name: 'Indonesia lokal', lang: 'id-ID', voiceURI: 'local-id', localService: true, default: false }
    const state = { read: [] as { text: string; local: boolean }[], cancelled: 0 }
    ;(window as unknown as { speechTest: typeof state }).speechTest = state
    const speech = Object.assign(new EventTarget(), {
      getVoices: () => [{ ...local, name: 'Remote', localService: false }, local],
      speak: (u: SpeechSynthesisUtterance) => state.read.push({ text: u.text, local: u.voice?.localService ?? false }),
      cancel: () => { state.cancelled++ },
    })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech })
    // Controlled voices are plain fixtures, so pair them with a controlled utterance.
    // Actual browser voice availability is checked separately below.
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class {
      text: string
      voice: SpeechSynthesisVoice | null = null
      lang = ''
      rate = 1
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(text: string) { this.text = text }
    } })
  })
  await page.goto('/')
  await page.getByLabel('Teks percakapan').fill('Tolong ulangi penjelasannya.')
  await page.getByRole('button', { name: 'Bacakan pesan' }).click()
  await expect(page.getByRole('button', { name: 'Hentikan suara' })).toBeEnabled()
  expect(await page.evaluate(() => (window as unknown as { speechTest: { read: unknown[] } }).speechTest.read)).toEqual([{ text: 'Tolong ulangi penjelasannya.', local: true }])
  await page.screenshot({ path: 'test-results/speech-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Bersihkan teks' }).click()
  await expect(page.getByRole('button', { name: 'Bacakan pesan' })).toBeDisabled()
  expect(await page.evaluate(() => (window as unknown as { speechTest: { cancelled: number } }).speechTest.cancelled)).toBe(1)
  expect(requests).toEqual([])
})

test('ketersediaan suara browser nyata dicatat dan suara daring tidak dijadikan pengganti', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Teks percakapan').fill('Halo, ini IsyaratKu.')
  const info = await page.evaluate(async () => {
    if (!window.speechSynthesis) return { supported: false, localIndonesian: [] as string[] }
    await new Promise<void>(resolve => {
      const finish = () => { clearTimeout(timer); window.speechSynthesis.removeEventListener('voiceschanged', finish); resolve() }
      const timer = setTimeout(finish, 1500)
      window.speechSynthesis.addEventListener('voiceschanged', finish)
      if (window.speechSynthesis.getVoices().length) finish()
    })
    return { supported: true, localIndonesian: window.speechSynthesis.getVoices().filter(v => v.localService === true && /^id(?:[-_]|$)/i.test(v.lang)).map(v => v.name) }
  })
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/speech-availability.json', JSON.stringify(info, null, 2))
  const read = page.getByRole('button', { name: 'Bacakan pesan' })
  if (info.localIndonesian.length) await expect(read).toBeEnabled()
  else {
    await expect(read).toBeDisabled()
    await expect(page.locator('#suara-info')).toContainText(/belum tersedia|belum mendukung/)
  }
})
