
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { readModelPackage, ensureLandmarker } from './browser-assets.mjs'

const active = JSON.parse(await readFile('ml/configs/active-model.json', 'utf8'))
const files = await readModelPackage(`web-models/${active.modelId}`, active)
const target = `public/ml/${active.modelId}`
await mkdir(target, { recursive: true })
for (const [name, contents] of files) await writeFile(`${target}/${name}`, contents)
await mkdir('public/ml/wasm', { recursive: true })
for (const name of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) {
  await copyFile(`node_modules/@mediapipe/tasks-vision/wasm/${name}`, `public/ml/wasm/${name}`)
}
await ensureLandmarker('public/ml/hand_landmarker.task')
console.log(`Aset browser ${active.modelId} (${active.expectedLabelCount} label) siap; build tidak memerlukan Python.`)
