import activeModel from '../../ml/configs/active-model.json'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import * as tf from '@tensorflow/tfjs'
import { preprocess, PREPROCESS_VERSION, type HandFrame } from './preprocess'
import { decide } from './decision'
import { clipQuality, validateMetadata, type FromWorker } from './contract'

let detector: HandLandmarker | null = null
let model: tf.LayersModel | null = null
let labels: string[] = []
let frames: HandFrame[] | null = null
let activeClip: number | null = null
let aspect = 1
let lastTimestamp = -1
const send = (value: FromWorker) => self.postMessage(value)

async function initialize(base: string) {
  if (new URL(base).origin !== self.location.origin) throw new Error('Aset model harus berasal dari aplikasi ini.')
  const get = async (path: string) => {
    const response = await fetch(`${base}${path}`, { credentials: 'same-origin' })
    if (!response.ok) throw new Error('Aset model belum tersedia. Jalankan persiapan ML lokal.')
    return response
  }
  const metadata: unknown = await (await get(`${activeModel.modelId}/metadata.json`)).json()
  validateMetadata(metadata)
  const checked = async (name: string) => {
    const buffer = await (await get(`${activeModel.modelId}/${name}`)).arrayBuffer()
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))).map(v => v.toString(16).padStart(2, '0')).join('')
    if (hash !== metadata.sha256[name]) throw new Error('Integritas aset model gagal. Muat ulang aplikasi.')
    return buffer
  }
  const [topologyBuffer, weights, labelBuffer, prepBuffer] = await Promise.all(['model.json', 'weights.bin', 'labels.json', 'preprocess.json'].map(checked))
  const decode = (b: ArrayBuffer) => JSON.parse(new TextDecoder().decode(b))
  labels = decode(labelBuffer!) as string[]
  if (JSON.stringify(labels) !== JSON.stringify(metadata.labels) || decode(prepBuffer!).version !== PREPROCESS_VERSION) throw new Error('Urutan label atau preprocessing tidak cocok.')
  const topology = decode(topologyBuffer!)
  await tf.setBackend('cpu')
  await tf.ready()
  model = await tf.loadLayersModel(tf.io.fromMemory({ modelTopology: topology.modelTopology, weightSpecs: topology.weightsManifest[0].weights, weightData: weights! }))
  if (JSON.stringify(model.inputs[0]!.shape) !== '[null,30,137]' || model.outputs[0]!.shape.at(-1) !== labels.length) throw new Error('Dimensi model tidak cocok.')
  const vision = await FilesetResolver.forVisionTasks(`${base}wasm`)
  detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: `${base}hand_landmarker.task`, delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .5, minHandPresenceConfidence: .5, minTrackingConfidence: .5 })
  send({ type: 'READY', modelId: activeModel.modelId, labels })
}

type Request = { type: 'INIT'; base: string } | { type: 'DISPOSE' } | { type: 'BEGIN' | 'END' | 'CANCEL'; clipId: number } | { type: 'FRAME'; bitmap: ImageBitmap; timestamp: number; clipId: number | null }
self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data
  try {
    if (request.type === 'INIT') { await initialize(request.base); return }
    if (request.type === 'DISPOSE') { frames = null; detector?.close(); model?.dispose(); self.close(); return }
    if (!detector || !model) throw new Error('Model belum siap.')
    if (request.type === 'BEGIN') { frames = []; activeClip = request.clipId; return }
    if (request.type === 'CANCEL') { if (activeClip === request.clipId) { frames = null; activeClip = null }; return }
    if (request.type === 'FRAME') {
      const started = performance.now()
      try {
        const timestamp = Math.max(lastTimestamp + 1, Math.round(request.timestamp))
        lastTimestamp = timestamp
        aspect = request.bitmap.width / request.bitmap.height
        const result = detector.detectForVideo(request.bitmap, timestamp)
        const points = [0, 1].map(() => Array.from({ length: 21 }, () => [0, 0, 0]))
        const masks = [false, false]
        const scores = [0, 0]
        result.handedness.forEach((categories, i) => {
          const c = categories[0]
          if (!c || !['Left', 'Right'].includes(c.categoryName)) return
          const slot = c.categoryName === 'Left' ? 0 : 1
          if (c.score < .5 || c.score <= scores[slot]!) return
          scores[slot] = c.score; masks[slot] = true
          points[slot] = result.landmarks[i]!.map(p => [p.x, p.y, p.z])
        })
        if (frames && request.clipId === activeClip && frames.length < 160) frames.push({ timestamp, points, masks })
        send({ type: 'FRAME_DONE', clipId: request.clipId, hands: masks.filter(Boolean).length, samples: frames?.length ?? 0, durationMs: frames && frames.length > 1 ? timestamp - frames[0]!.timestamp : 0, detectionMs: performance.now() - started })
      } finally { request.bitmap.close() }
      return
    }
    if (request.type === 'END') {
      if (request.clipId !== activeClip) return
      const clip = frames ?? []
      frames = null
      activeClip = null
      const problem = clipQuality(clip)
      if (problem) { send({ type: 'RESULT', clipId: request.clipId, candidate: null, message: problem, inferenceMs: 0 }); return }
      const sequence = preprocess(clip, aspect)
      if (sequence.filter(row => row[66]! + row[133]! > 0).length < 5) { send({ type: 'RESULT', clipId: request.clipId, candidate: null, message: 'Landmark terlalu sedikit. Ulangi gerakan dengan tangan terlihat jelas.', inferenceMs: 0 }); return }
      const started = performance.now()
      const output = tf.tidy(() => model!.predict(tf.tensor3d([sequence])) as tf.Tensor)
      try {
        const candidate = decide(Array.from(await output.data()), labels)
        send({ type: 'RESULT', clipId: request.clipId, candidate, message: candidate.accepted ? 'Periksa kandidat sebelum menambahkannya ke percakapan.' : 'Hasil belum cukup kuat. Ulangi gerakan atau ketik pesan.', inferenceMs: performance.now() - started })
      } finally { output.dispose() }
    }
  } catch (error) {
    frames = null
    if (request.type === 'FRAME') request.bitmap.close()
    send({ type: 'ERROR', message: error instanceof Error ? error.message : 'Pemrosesan gagal. Hentikan kamera lalu coba lagi.' })
  }
}
