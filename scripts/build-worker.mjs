import { build } from 'vite'
// MediaPipe's WASM loader uses importScripts: serve a classic worker in both
// dev and production instead of Vite's module-worker development transform.
await build({ configFile: false, publicDir: false, define: { 'process.env.NODE_ENV': JSON.stringify('production') }, build: {
  outDir: 'public/ml/runtime', emptyOutDir: true, minify: true, target: 'es2022',
  lib: { entry: 'src/ml/recognition.worker.ts', name: 'IsyaratKuRecognition', formats: ['iife'], fileName: () => 'recognition.worker.js' },
} })
