import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
const active = JSON.parse(await readFile('ml/configs/active-model.json', 'utf8'))
const python = process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python'
const result = spawnSync(python, ['ml/scripts/export_web.py', '--config', active.configPath], { stdio: 'inherit' })
if (result.status !== 0) process.exit(result.status ?? 1)
await import('./prepare-ml.mjs')
