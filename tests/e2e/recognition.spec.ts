import { expect, test, type Page } from '@playwright/test'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
const activeModel = JSON.parse(await readFile('ml/configs/active-model.json', 'utf8'))
const trainingConfig = JSON.parse(await readFile(activeModel.configPath, 'utf8'))

// Chrome 156's fake_device_0 ends even in a minimal getUserMedia call on this
// machine. Use a native canvas MediaStream to exercise video/worker lifecycle;
// this is explicitly not physical-webcam or model-quality evidence.
async function syntheticCamera(page: Page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 640; canvas.height = 480
      const drawing = canvas.getContext('2d')!
      const draw = () => { drawing.fillStyle = '#606060'; drawing.fillRect(0, 0, 640, 480) }
      draw()
      const timer = setInterval(draw, 50)
      const stream = canvas.captureStream(15)
      ;(window as unknown as { testTracks: MediaStreamTrack[] }).testTracks = stream.getTracks()
      window.addEventListener('pagehide', () => clearInterval(timer), { once: true })
      return stream
    }
  })
}

test('ekspor model aktif setara Python pada seluruh klip dan tensor dilepas', async ({ page }) => {
  const fixture = JSON.parse(await readFile(`${trainingConfig.outputDir}/web-export/model-parity.json`, 'utf8')) as { inputs: number[][][]; expected: number[][]; tolerance: number }
  await page.goto('/')
  await page.addScriptTag({ content: await readFile('node_modules/@tensorflow/tfjs/dist/tf.min.js', 'utf8') })
  const result = await page.evaluate(async ({ inputs, expected, modelURL }) => {
    const tf = (window as unknown as { tf: typeof import('@tensorflow/tfjs') }).tf
    await tf.setBackend('cpu'); await tf.ready()
    const model = await tf.loadLayersModel(modelURL)
    const tensor = tf.tensor3d(inputs)
    const prediction = model.predict(tensor) as import('@tensorflow/tfjs').Tensor
    const scores = await prediction.array() as number[][]
    const error = Math.max(...scores.flatMap((row, i) => row.map((v, j) => Math.abs(v - expected[i]![j]!))))
    const top1Equal = scores.every((row, i) => row.indexOf(Math.max(...row)) === expected[i]!.indexOf(Math.max(...expected[i]!)))
    prediction.dispose(); tensor.dispose()
    const single = tf.tensor3d([inputs[0]!])
    const before = tf.memory().numTensors
    const timings: number[] = []
    for (let i = 0; i < 30; i++) {
      const started = performance.now()
      tf.tidy(() => { const out = model.predict(single) as import('@tensorflow/tfjs').Tensor; out.dataSync() })
      timings.push(performance.now() - started)
    }
    const leakedTensors = tf.memory().numTensors - before
    single.dispose(); model.dispose()
    timings.sort((a, b) => a - b)
    return { maxAbsError: error, top1Equal, samples: scores.length, leakedTensors, p95ClassifierMs: timings[28], meanClassifierMs: timings.reduce((a, b) => a + b, 0) / timings.length, userAgent: navigator.userAgent }
  }, { ...fixture, modelURL: `/ml/${activeModel.modelId}/model.json` })
  expect(result.maxAbsError).toBeLessThan(fixture.tolerance)
  expect(result.top1Equal).toBe(true)
  expect(result.leakedTensors).toBe(0)
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/browser-parity.json', JSON.stringify(result, null, 2))
})

test('kamera dan worker nyata menolak tanpa tangan serta stop melepas track tanpa unggahan', async ({ page, context }) => {
  const external: string[] = [], uploads: string[] = [], errors: string[] = []
  context.on('request', request => {
    if (request.url().startsWith('http') && new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url())
    if (request.method() !== 'GET') uploads.push(request.method())
  })
  page.on('pageerror', e => errors.push(e.message))
  await syntheticCamera(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Mulai kamera' }).click()
  await expect(page.getByRole('button', { name: 'Rekam satu isyarat' })).toBeEnabled({ timeout: 45000 })
  await expect(page.getByText(`${activeModel.expectedLabelCount} kata yang dapat dicoba`, { exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/camera-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Rekam satu isyarat' }).click()
  await expect(page.getByRole('button', { name: 'Selesai dan periksa' })).toBeEnabled()
  await expect(page.getByRole('progressbar', { name: 'Durasi rekaman' })).toBeVisible()
  await page.screenshot({ path: 'test-results/recording-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Selesai dan periksa' }).click()
  await expect(page.getByRole('status')).toContainText(/Tangan|terputus|pendek/)
  await expect(page.getByLabel('Teks percakapan')).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Gunakan kata' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Perbaiki pesan' }).click()
  await expect(page.getByLabel('Teks percakapan')).toBeFocused()
  await page.getByRole('button', { name: 'Hentikan kamera' }).click()
  expect(await page.evaluate(() => (window as unknown as { testTracks: MediaStreamTrack[] }).testTracks.every(t => t.readyState === 'ended'))).toBe(true)
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
  expect(external).toEqual([]); expect(uploads).toEqual([]); expect(errors).toEqual([])
})

test('teks besar menjaga pesan, mengunci fokus, dan kembali dengan Escape pada layar kecil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const message = 'Tolong ulangi penjelasannya.\n' + 'Pesanpanjang'.repeat(30)
  await page.getByLabel('Teks percakapan').fill(message)
  const opener = page.getByRole('button', { name: 'Tampilkan teks besar' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Pesan untuk lawan bicara' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.large-text-content')).toHaveText(message)
  await expect(page.getByRole('button', { name: 'Kembali ke percakapan' })).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.querySelector('dialog')!.contains(document.activeElement))).toBe(true)
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  const bounds = await dialog.boundingBox()
  expect(bounds).toMatchObject({ x: 0, y: 0, width: 375, height: 812 })
  await page.screenshot({ path: 'test-results/large-text-mobile.png' })
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(opener).toBeFocused()
  await expect(page.getByLabel('Teks percakapan')).toHaveValue(message)
  await opener.click()
  await page.getByRole('button', { name: 'Kembali ke percakapan' }).click()
  await expect(dialog).not.toBeVisible()
})

test('hitung mundur dapat dibatalkan dan stop tidak memulai ulang kamera', async ({ page }) => {
  await syntheticCamera(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Mulai kamera' }).click()
  await expect(page.getByRole('button', { name: 'Rekam satu isyarat' })).toBeEnabled({ timeout: 45000 })
  await page.getByRole('button', { name: 'Rekam satu isyarat' }).click()
  await expect(page.getByRole('timer', { name: 'Hitung mundur' })).toBeVisible()
  await page.screenshot({ path: 'test-results/countdown-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Batal' }).click()
  await expect(page.getByRole('button', { name: 'Rekam satu isyarat' })).toBeEnabled()
  await page.getByRole('button', { name: 'Rekam satu isyarat' }).click()
  await page.getByRole('button', { name: 'Hentikan kamera' }).click()
  await page.waitForTimeout(3200)
  await expect(page.getByRole('timer')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Selesai dan periksa' })).toHaveCount(0)
  expect(await page.evaluate(() => (window as unknown as { testTracks: MediaStreamTrack[] }).testTracks.every(t => t.readyState === 'ended'))).toBe(true)
})

test('izin ditolak memberi pemulihan dan editor tetap bekerja', async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError') } })
  await page.goto('/')
  await page.getByRole('button', { name: 'Mulai kamera' }).click()
  await expect(page.getByRole('status')).toContainText('Izin kamera ditolak')
  await expect(page.getByRole('button', { name: 'Mulai kamera' })).toBeEnabled()
  await page.getByLabel('Teks percakapan').fill('Saya ingin bertanya')
  await expect(page.getByLabel('Teks percakapan')).toHaveValue('Saya ingin bertanya')
})

test('tab tersembunyi dan perangkat terputus menghentikan sesi kamera', async ({ page }) => {
  await syntheticCamera(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Mulai kamera' }).click()
  await expect(page.getByRole('button', { name: 'Rekam satu isyarat' })).toBeEnabled({ timeout: 45000 })
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(page.getByRole('status')).toContainText('tab tidak aktif')
  expect(await page.evaluate(() => (window as unknown as { testTracks: MediaStreamTrack[] }).testTracks.every(t => t.readyState === 'ended'))).toBe(true)
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }) })
  await page.getByRole('button', { name: 'Mulai kamera' }).click()
  await expect(page.getByRole('button', { name: 'Rekam satu isyarat' })).toBeEnabled({ timeout: 45000 })
  await page.evaluate(() => { const track = (window as unknown as { testTracks: MediaStreamTrack[] }).testTracks[0]!; track.stop(); track.dispatchEvent(new Event('ended')) })
  await expect(page.getByRole('status')).toContainText('Kamera terputus')
  await page.setViewportSize({ width: 375, height: 812 })
  await page.screenshot({ path: 'test-results/camera-mobile.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
