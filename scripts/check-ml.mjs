import { access, readFile } from 'node:fs/promises'
const active = JSON.parse(await readFile('ml/configs/active-model.json', 'utf8'))
try {
  for (const name of ['metadata.json', 'model.json', 'weights.bin', 'labels.json', 'preprocess.json']) await access(`public/ml/${active.modelId}/${name}`)
  await access('public/ml/hand_landmarker.task')
  await access('public/ml/runtime/recognition.worker.js')
  for (const name of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) await access(`public/ml/wasm/${name}`)
  const model = JSON.parse(await readFile(`public/ml/${active.modelId}/metadata.json`, 'utf8'))
  if (model.id !== active.modelId || model.labels?.length !== active.expectedLabelCount || !model.experimental || model.releaseEligible || model.preprocessVersion !== 'hands-clip-normalized-v1') throw new Error('Kontrak model tidak cocok')
} catch {
  console.error('Aset model eksperimen belum lengkap. Siapkan hasil training dan jalankan npm run prepare:ml. Lihat ml/README.md.')
  process.exit(1)
}
