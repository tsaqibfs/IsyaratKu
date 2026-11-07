"""Training LSTM eksperimen tanpa split frame atau metrik test semu."""
import argparse
from datetime import datetime, timezone
import importlib.metadata
import json
import os
from pathlib import Path
import platform
import time

os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')
os.environ.setdefault('TF_ENABLE_ONEDNN_OPTS', '0')
os.environ.setdefault('CUDA_VISIBLE_DEVICES', '-1')

import numpy as np
import tensorflow as tf

from data import FEATURE_DIM, PREPROCESS_VERSION, augment, save_json, sha256, check_sources

ROOT = Path(__file__).resolve().parents[2]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default='ml/configs/experiment.json')
    args = parser.parse_args()
    config = json.loads((ROOT / args.config).read_text(encoding='utf-8'))
    output = ROOT / config['outputDir']
    extraction = json.loads((output / 'extraction.json').read_text(encoding='utf-8'))
    labels = json.loads((output / 'labels.json').read_text(encoding='utf-8'))
    model_path = output / 'model.keras'
    if model_path.exists():
        raise ValueError('Model sudah ada; gunakan outputDir baru untuk eksperimen berikutnya')
    for key in ('preprocessVersion', 'sequenceLength', 'sampleHz', 'maxGapMs', 'datasetDir', 'labels', 'mirror'):
        if config[key] != extraction['config'][key]:
            raise ValueError(f'Konfigurasi ekstraksi berubah: {key}')
    if config['preprocessVersion'] != PREPROCESS_VERSION:
        raise ValueError('Preprocessing tidak cocok')
    if sha256(output / 'sequences.npz') != extraction['sequenceSha256']:
        raise ValueError('Checksum fitur berubah; ekstrak ulang')
    check_sources(ROOT / config['datasetDir'], ROOT, extraction['samples'], config['labels'])
    if labels != [sample['label'] for sample in extraction['samples']]:
        raise ValueError('Urutan label berubah')
    with np.load(output / 'sequences.npz', allow_pickle=False) as arrays:
        X, y = arrays['X'], arrays['y']
    if (len(labels) < 2 or X.shape != (len(labels), config['sequenceLength'], FEATURE_DIM)
            or not np.isfinite(X).all() or not np.array_equal(y, np.arange(len(labels)))):
        raise ValueError('Bentuk fitur atau label tidak sesuai')
    tf.config.threading.set_intra_op_parallelism_threads(2)
    tf.config.threading.set_inter_op_parallelism_threads(2)
    tf.keras.utils.set_random_seed(config['seed'])
    tf.config.experimental.enable_op_determinism()
    rng = np.random.default_rng(config['seed'])
    train_X, train_y = [sequence for sequence in X], list(y)
    for sequence, label in zip(X, y):
        for _ in range(config['augmentationsPerClip']):
            train_X.append(augment(sequence, rng))
            train_y.append(label)
    train_X, train_y = np.array(train_X), np.array(train_y)
    model = tf.keras.Sequential([
        tf.keras.Input(shape=(config['sequenceLength'], FEATURE_DIM), name='hand_sequence'),
        tf.keras.layers.LSTM(config['lstmUnits'], name='temporal'),
        tf.keras.layers.Dense(32, activation='relu', name='hidden'),
        tf.keras.layers.Dropout(.15),
        tf.keras.layers.Dense(len(labels), activation='softmax', name='scores'),
    ], name='isyaratku_experimental_words')
    model.compile(optimizer=tf.keras.optimizers.Adam(.001),
                  loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    losses, accuracies = [], []
    started = time.perf_counter()
    # Explicit batches avoid a background tf.data thread pool on Windows.
    for epoch in range(config['epochs']):
        order = rng.permutation(len(train_X))
        model.reset_metrics()
        for first in range(0, len(order), config['batchSize']):
            selected = order[first:first + config['batchSize']]
            metrics = model.train_on_batch(train_X[selected], train_y[selected], return_dict=True)
        loss, accuracy = float(metrics['loss']), float(metrics['accuracy'])
        if not np.isfinite(loss):
            raise ValueError('Training menghasilkan loss tidak finite')
        losses.append(loss)
        accuracies.append(accuracy)
        if epoch == 0 or (epoch + 1) % 10 == 0:
            print(f'Epoch {epoch + 1}/{config["epochs"]}: train loss={loss:.4f}, train accuracy={accuracy:.3f}', flush=True)
    scores = model(X, training=False).numpy()
    model.save(model_path)
    restored = tf.keras.models.load_model(model_path)
    restored_scores = restored(X, training=False).numpy()
    reload_error = float(np.max(np.abs(scores - restored_scores)))
    if not np.isfinite(restored_scores).all() or reload_error > 1e-6:
        raise ValueError('Model muat ulang tidak setara')
    predicted = scores.argmax(axis=1)
    report = {
        'status': 'experimental_training_only', 'releaseEligible': False,
        'trainedAtUtc': datetime.now(timezone.utc).isoformat(),
        'config': config, 'preprocessVersion': PREPROCESS_VERSION,
        'inputShape': [None, config['sequenceLength'], FEATURE_DIM], 'labelOrder': labels,
        'uniqueSourceClips': len(X), 'trainSequencesIncludingAugmentation': len(train_X),
        'independentValidationSamples': 0, 'independentTestSamples': 0,
        'testAccuracy': None, 'macroF1': None,
        'finalTrainingLoss': losses[-1], 'finalTrainingAccuracy': accuracies[-1],
        'sourceClipMemorizationAccuracy': float((predicted == y).mean()),
        'sourcePredictions': [{'label': label, 'predicted': labels[int(predicted[i])],
                               'topScore': float(scores[i].max())} for i, label in enumerate(labels)],
        'modelReloadMaxAbsError': reload_error, 'elapsedSeconds': round(time.perf_counter() - started, 2),
        'modelSha256': sha256(model_path), 'extractionSha256': sha256(output / 'extraction.json'),
        'environment': {'python': platform.python_version(), 'platform': platform.platform(),
                        'packages': {name: importlib.metadata.version(name) for name in
                                     ('tensorflow', 'keras', 'mediapipe', 'numpy', 'opencv-contrib-python')}},
        'limitations': ['Satu klip sumber per label; augmentasi bukan peserta baru.',
                        'Pemeraga dan sesi belum diketahui; tidak ada split lintas peserta.',
                        'Tidak ada data negatif; model dapat memberi skor tinggi pada gerakan asing.',
                        'Normalisasi waktu seluruh klip; belum kompatibel dengan window streaming.',
                        'Izin umum dan peninjauan label dikonfirmasi pemilik; bukti tertulis belum dilampirkan.',
                        'Belum diekspor ke TF.js atau diuji parity preprocessing/browser.',
                        'Skor softmax bukan probabilitas kebenaran yang terkalibrasi.'],
    }
    save_json(output / 'history.json', {'loss': losses, 'trainingAccuracy': accuracies})
    save_json(output / 'report.json', report)
    save_json(output / 'preprocess.json', {
        'version': PREPROCESS_VERSION, 'featureDim': FEATURE_DIM, 'handSlots': ['Left', 'Right'],
        'mirror': False, 'sequenceLength': config['sequenceLength'],
        'timeNormalization': 'whole_segmented_clip', 'sampleHz': config['sampleHz'],
        'maxInterpolationGapMs': config['maxGapMs'],
        'handFeatureLayout': ['local_xyz_63', 'wrist_xyz_3', 'presence_1'],
        'tail': 'right_wrist_minus_left_wrist_xyz_if_both_present',
        'aspectCorrection': 'multiply_x_and_z_by_width_over_height',
        'palmScale': 'mean_distance_wrist_to_index_mcp_and_pinky_mcp',
        'browserParityVerified': False,
    })
    print(f'Model tersimpan: {model_path}', flush=True)
    print(f'Kecocokan pada klip SUMBER (bukan test): {report["sourceClipMemorizationAccuracy"]:.1%}', flush=True)
    print(f'Parity muat ulang Keras: {reload_error:g}; test independen belum tersedia.', flush=True)


if __name__ == '__main__':
    main()
