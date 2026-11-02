import { expect, test } from '@playwright/test'

test('teks tidak bertahan setelah reload dan halaman tidak menghubungi origin lain', async ({ page }) => {
  const externalRequests: string[] = []
  const errors: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ruang untuk saling memahami.')
  await expect(page.getByRole('button', { name: 'Mulai kamera' })).toBeDisabled()
  await page.getByLabel('Teks percakapan').fill('Saya ingin bertanya.')
  await page.reload()
  await expect(page.getByLabel('Teks percakapan')).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Bersihkan teks' })).toBeDisabled()
  expect(externalRequests).toEqual([])
  expect(errors).toEqual([])
})

test('tampilan kecil tetap dapat digunakan dengan keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Lewati ke konten utama' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Teks percakapan')).toBeFocused()
  await page.keyboard.type('Terima kasih')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Bersihkan teks' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Teks percakapan')).toHaveValue('')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
