
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

export const MODEL_FILES = ['metadata.json', 'model.json', 'weights.bin', 'labels.json', 'preprocess.json']
export const LANDMARKER_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
export const LANDMARKER_SHA256 = 'fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1'
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

export async function readModelPackage(folder, active) {
  if (!/^words-reference-v[1-9]\d*$/.test(active.modelId)) throw new Error('Kontrak ID model tidak valid')
  const files = new Map(await Promise.all(MODEL_FILES.map(async name => [name, await readFile(join(folder, name))])))
  const metadata = JSON.parse(files.get('metadata.json'))
  if (metadata.id !== active.modelId || metadata.experimental !== true || metadata.releaseEligible !== false
    || metadata.preprocessVersion !== 'hands-clip-normalized-v1' || JSON.stringify(metadata.inputShape) !== '[null,30,137]'
    || !Array.isArray(metadata.labels) || metadata.labels.length !== active.expectedLabelCount
    || new Set(metadata.labels).size !== active.expectedLabelCount || metadata.labels.some(label => typeof label !== 'string' || !label.trim())) {
    throw new Error('Kontrak paket model browser tidak sesuai konfigurasi aktif')
  }
  for (const name of MODEL_FILES.filter(name => name !== 'metadata.json')) {
    if (hash(files.get(name)) !== metadata.sha256?.[name]) throw new Error(`Checksum model tidak cocok: ${name}`)
  }
  if (JSON.stringify(JSON.parse(files.get('labels.json'))) !== JSON.stringify(metadata.labels)) throw new Error('Urutan label browser tidak cocok')
  if (JSON.parse(files.get('preprocess.json')).version !== metadata.preprocessVersion) throw new Error('Kontrak preprocessing tidak cocok')
  return files
}

export async function ensureLandmarker(destination) {
  try {
    const current = await readFile(destination)
    if (hash(current) !== LANDMARKER_SHA256) throw new Error('Checksum detektor lokal tidak cocok; periksa aset sebelum build')
    return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const response = await fetch(LANDMARKER_URL, { signal: AbortSignal.timeout(120000) })
  if (!response.ok) throw new Error(`Unduhan detektor gagal: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.byteLength > 10000000 || hash(bytes) !== LANDMARKER_SHA256) throw new Error('Checksum unduhan detektor tidak cocok')
  await writeFile(destination, bytes)
}
