"""Ekspor bobot dan fixture privat; TF.js menulis format Layers resminya sendiri."""
import os
os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')
os.environ.setdefault('TF_ENABLE_ONEDNN_OPTS', '0')
import json
import argparse
from pathlib import Path
import numpy as np
import tensorflow as tf
from data import save_json, sha256, resample, features

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--config')
args = parser.parse_args()
active = json.loads((ROOT / 'ml/configs/active-model.json').read_text())
config = json.loads((ROOT / (args.config or active['configPath'])).read_text())
run = ROOT / config['outputDir']
if run.name != active['modelId'] or config.get('expectedLabelCount', active['expectedLabelCount']) != active['expectedLabelCount']:
    raise ValueError('Versi sumber dan target model tidak cocok')
out = run / 'web-export'
out.mkdir(exist_ok=True)
report = json.loads((run / 'report.json').read_text())
if sha256(run / 'model.keras') != report['modelSha256']:
    raise ValueError('Checksum model training tidak cocok')
labels = report['labelOrder']
if len(labels) != len(set(labels)) or len(labels) != active['expectedLabelCount']:
    raise ValueError('Jumlah/urutan label tidak sesuai konfigurasi model aktif')
model = tf.keras.models.load_model(run / 'model.keras')
if [layer.__class__.__name__ for layer in model.layers] != ['LSTM', 'Dense', 'Dropout', 'Dense']:
    raise ValueError('Arsitektur model tidak didukung exporter ini')
if (model.input_shape != (None, 30, 137) or model.layers[0].units != 64
        or model.layers[1].units != 32 or model.layers[3].units != len(labels)
        or model.layers[0].get_config()['recurrent_activation'] != 'sigmoid'
        or model.layers[0].get_config()['activation'] != 'tanh'
        or model.layers[1].get_config()['activation'] != 'relu'
        or model.layers[3].get_config()['activation'] != 'softmax'):
    raise ValueError('Konfigurasi layer tidak cocok dengan kontrak web')
weights = model.get_weights()
(out / 'keras-weights.bin').write_bytes(b''.join(np.asarray(w, dtype='<f4').tobytes() for w in weights))
save_json(out / 'export.json', {'shapes': [list(w.shape) for w in weights],
                              'labels': report['labelOrder'], 'sourceModelSha256': report['modelSha256']})
with np.load(run / 'sequences.npz', allow_pickle=False) as data:
    X = data['X']
save_json(out / 'model-parity.json', {'inputs': X.tolist(), 'expected': model(X, training=False).numpy().tolist(),
                                     'labels': report['labelOrder'], 'tolerance': 1e-4})
# Synthetic fixture is safe to track. Includes motion, one/two/missing hands,
# an interpolation gap, rectangular camera aspect, and a degenerate palm.
times = np.array([0, 70, 140, 450, 520, 590], dtype=np.float64)
points = np.zeros((len(times), 2, 21, 3), dtype=np.float32)
masks = np.array([[1, 0], [1, 1], [0, 1], [1, 1], [1, 0], [1, 1]], dtype=bool)
for i in range(len(times)):
    for slot in range(2):
        for j in range(21):
            points[i, slot, j] = [.15 + slot * .3 + i * .02 + j * .003,
                                  .3 + j * .007, -j * .002]
points[-1, 1] = points[-1, 1, 0]  # degenerate scale
normalized, present = resample(times, points, masks, 30, 200)
save_json(ROOT / 'ml/fixtures/preprocess-v1.json', {
    'version': 'hands-clip-normalized-v1', 'aspect': 16 / 9,
    'frames': [{'timestamp': float(t), 'points': p.tolist(), 'masks': m.tolist()}
               for t, p, m in zip(times, points, masks)],
    'expected': features(normalized, present, 16 / 9).tolist(), 'tolerance': 2e-5})
print(f'Bobot dan fixture model tersimpan privat di {out}')
