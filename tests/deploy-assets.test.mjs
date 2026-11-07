
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { createHash } from 'node:crypto'
import { readModelPackage } from '../scripts/browser-assets.mjs'

const active = { modelId: 'words-reference-v99', expectedLabelCount: 2 }
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'isyaratku-deploy-test-'))
  t.after(async () => {
    if (!resolve(directory).startsWith(resolve(tmpdir()) + sep + 'isyaratku-deploy-test-')) throw new Error('Unsafe fixture path')
    await rm(directory, { recursive: true, force: true })
  })
  const files = { 'model.json': '{}', 'weights.bin': Buffer.from([1, 2, 3]),
    'labels.json': JSON.stringify(['halo', 'buku']), 'preprocess.json': JSON.stringify({ version: 'hands-clip-normalized-v1' }) }
  const metadata = { id: active.modelId, experimental: true, releaseEligible: false,
    labels: ['halo', 'buku'], inputShape: [null, 30, 137], preprocessVersion: 'hands-clip-normalized-v1', sha256: {} }
  for (const [name, data] of Object.entries(files)) {
    await writeFile(join(directory, name), data)
    metadata.sha256[name] = createHash('sha256').update(data).digest('hex')
  }
  await writeFile(join(directory, 'metadata.json'), JSON.stringify(metadata))
  return { directory, metadata }
}
test('paket browser valid dapat disiapkan tanpa dataset atau Python', async t => {
  const { directory } = await fixture(t)
  const files = await readModelPackage(directory, active)
  assert.equal(files.size, 5)
  assert.deepEqual(files.get('weights.bin'), Buffer.from([1, 2, 3]))
})
test('bobot rusak ditolak sebelum dipublikasikan ke folder build', async t => {
  const { directory } = await fixture(t)
  await writeFile(join(directory, 'weights.bin'), Buffer.from([4]))
  await assert.rejects(readModelPackage(directory, active), /Checksum/)
})
test('versi model dan jumlah kelas yang tidak sesuai ditolak', async t => {
  const { directory } = await fixture(t)
  await assert.rejects(readModelPackage(directory, { ...active, modelId: 'words-reference-v1' }), /Kontrak/)
  await assert.rejects(readModelPackage(directory, { ...active, expectedLabelCount: 31 }), /Kontrak/)
})
test('urutan label berubah ditolak sekalipun checksum file ikut diubah', async t => {
  const { directory, metadata } = await fixture(t)
  const labels = JSON.stringify(['buku', 'halo'])
  await writeFile(join(directory, 'labels.json'), labels)
  metadata.sha256['labels.json'] = createHash('sha256').update(labels).digest('hex')
  await writeFile(join(directory, 'metadata.json'), JSON.stringify(metadata))
  await assert.rejects(readModelPackage(directory, active), /Urutan/)
})

test('JSON paket rilis memakai LF sehingga checksum tetap sama setelah checkout Git Linux', async () => {
  const active = JSON.parse(await readFile('ml/configs/active-model.json', 'utf8'))
  const directory = `web-models/${active.modelId}`
  for (const name of ['model.json', 'metadata.json', 'labels.json', 'preprocess.json']) {
    const data = await readFile(`${directory}/${name}`, 'utf8')
    assert.equal(data.includes(String.fromCharCode(13)), false, `${name} harus LF`)
  }
  await readModelPackage(directory, active)
})
