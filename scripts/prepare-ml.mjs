import { readFile, writeFile, mkdir, copyFile, cp, readdir } from 'node:fs/promises'
import { basename } from 'node:path'
import { createHash } from 'node:crypto'
import * as tf from '@tensorflow/tfjs'

const active = JSON.parse(await readFile('ml/configs/active-model.json', 'utf8'))
if (!/^words-reference-v[1-9]\d*$/.test(active.modelId)) throw new Error('ID model tidak valid')
const config = JSON.parse(await readFile(active.configPath, 'utf8'))
if (basename(config.outputDir) !== active.modelId || (config.expectedLabelCount ?? active.expectedLabelCount) !== active.expectedLabelCount) throw new Error('Versi sumber dan target model tidak cocok')
const run = `${config.outputDir}/web-export`
const target = `public/ml/${active.modelId}`
const details = JSON.parse(await readFile(`${run}/export.json`, 'utf8'))
if (details.labels.length !== active.expectedLabelCount) throw new Error('Jumlah label ekspor tidak sesuai konfigurasi aktif')
const data = await readFile(`${run}/keras-weights.bin`)
await tf.setBackend('cpu')
await tf.ready()
const model = tf.sequential({ layers: [
  tf.layers.lstm({ inputShape: [30, 137], units: 64, activation: 'tanh', recurrentActivation: 'sigmoid', name: 'temporal' }),
  tf.layers.dense({ units: 32, activation: 'relu', name: 'hidden' }),
  tf.layers.dropout({ rate: .15 }),
  tf.layers.dense({ units: details.labels.length, activation: 'softmax', name: 'scores' }),
] })
let offset = 0
const weights = details.shapes.map((shape) => {
  const count = shape.reduce((a, b) => a * b, 1)
  const values = new Float32Array(count)
  for (let i = 0; i < count; i++) values[i] = data.readFloatLE(offset + i * 4)
  offset += count * 4
  return tf.tensor(values, shape)
})
if (offset !== data.byteLength) throw new Error('Ukuran bobot tidak cocok')
model.setWeights(weights)
weights.forEach(w => w.dispose())
await mkdir(target, { recursive: true })
await model.save(tf.io.withSaveHandler(async (artifacts) => {
  await writeFile(`${target}/weights.bin`, Buffer.from(artifacts.weightData))
  await writeFile(`${target}/model.json`, JSON.stringify({
    format: 'layers-model', generatedBy: `TensorFlow.js ${tf.version.tfjs}`,
    convertedBy: 'IsyaratKu identical Keras weights export v1',
    modelTopology: artifacts.modelTopology,
    weightsManifest: [{ paths: ['weights.bin'], weights: artifacts.weightSpecs }],
  }))
  return { modelArtifactsInfo: tf.io.getModelArtifactsInfoForJSON(artifacts) }
}))
const fixture = JSON.parse(await readFile(`${run}/model-parity.json`, 'utf8'))
const tensor = tf.tensor3d(fixture.inputs)
const prediction = model.predict(tensor)
const actual = await prediction.array()
const error = Math.max(...actual.flatMap((row, i) => row.map((v, j) => Math.abs(v - fixture.expected[i][j]))))
if (error > fixture.tolerance) throw new Error(`Ekspor berbeda dari Python: ${error}`)
const top1Equal = actual.every((r, i) => r.indexOf(Math.max(...r)) === fixture.expected[i].indexOf(Math.max(...fixture.expected[i])))
if (!top1Equal) throw new Error('Label ekspor berubah')
tensor.dispose(); prediction.dispose(); model.dispose()
await writeFile(`${target}/labels.json`, JSON.stringify(details.labels))
await copyFile(`${config.outputDir}/preprocess.json`, `${target}/preprocess.json`)
await copyFile('ml/assets/hand_landmarker.task', 'public/ml/hand_landmarker.task')
await cp('node_modules/@mediapipe/tasks-vision/wasm', 'public/ml/wasm', { recursive: true })
const hashes = {}
for (const name of ['model.json', 'weights.bin', 'labels.json', 'preprocess.json']) {
  hashes[name] = createHash('sha256').update(await readFile(`${target}/${name}`)).digest('hex')
}
const metadata = {
  id: active.modelId, experimental: true, releaseEligible: false,
  preprocessVersion: 'hands-clip-normalized-v1', inputShape: [null, 30, 137],
  labels: details.labels, sourceModelSha256: details.sourceModelSha256, sha256: hashes,
  runtime: { tensorflowjs: tf.version.tfjs, mediapipe: '0.10.21', backend: 'cpu' },
  nodeParity: { maxAbsError: error, top1Equal, samples: fixture.inputs.length, tolerance: fixture.tolerance },
  limits: { minDurationMs: 1000, maxDurationMs: 10000, maxGapMs: 200, minHandFraction: .2, minHandFrames: 5, maxInternalNoHandGapMs: 400 },
  decision: { minScore: .85, minMargin: .15, calibrated: false },
}
await writeFile(`${target}/metadata.json`, JSON.stringify(metadata, null, 2))
await writeFile(`${run}/node-parity.json`, JSON.stringify(metadata.nodeParity, null, 2))
console.log(`Ekspor Layers siap; parity ${fixture.inputs.length} klip: max error ${error}; top-1 identik.`)
console.log(`Aset same-origin: ${target}; WASM ${((await readdir('public/ml/wasm')).length)} file.`)
