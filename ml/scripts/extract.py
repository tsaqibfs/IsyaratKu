"""Ekstrak klip referensi lokal melalui MediaPipe Tasks Vision Hand Landmarker."""
import argparse
import json
import os
from pathlib import Path

os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')

import cv2
import mediapipe as mp
import numpy as np

from data import PREPROCESS_VERSION, FEATURE_DIM, inventory, resample, features, save_json, sha256

ROOT = Path(__file__).resolve().parents[2]


def extract_video(path, model_path, hz):
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise ValueError(f'Video gagal dibuka: {path.name}')
    fps = capture.get(cv2.CAP_PROP_FPS)
    if not np.isfinite(fps) or fps <= 0:
        capture.release()
        raise ValueError(f'FPS tidak valid: {path.name}')
    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=str(model_path)),
        running_mode=mp.tasks.vision.RunningMode.VIDEO,
        num_hands=2, min_hand_detection_confidence=.5,
        min_hand_presence_confidence=.5, min_tracking_confidence=.5,
    )
    all_points, all_masks, all_scores, times = [], [], [], []
    index, next_sample, last_timestamp = 0, 0., -1
    width = height = 0
    expected = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    try:
        with mp.tasks.vision.HandLandmarker.create_from_options(options) as detector:
            while True:
                ok, frame = capture.read()
                if not ok:
                    break
                moment = index * 1000 / fps
                index += 1
                if moment + 1e-5 < next_sample:
                    continue
                next_sample += 1000 / hz
                height, width = frame.shape[:2]
                timestamp = max(last_timestamp + 1, round(moment))
                last_timestamp = timestamp
                rgb = np.ascontiguousarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                result = detector.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), timestamp)
                points = np.zeros((2, 21, 3), dtype=np.float32)
                masks = np.zeros(2, dtype=bool)
                scores = np.zeros(2, dtype=np.float32)
                for hand, categories in zip(result.hand_landmarks, result.handedness):
                    category = categories[0]
                    if category.category_name not in ('Left', 'Right'):
                        continue
                    slot = 0 if category.category_name == 'Left' else 1
                    if category.score < .5 or category.score <= scores[slot]:
                        continue
                    points[slot] = [[p.x, p.y, p.z] for p in hand]
                    masks[slot] = True
                    scores[slot] = category.score
                all_points.append(points)
                all_masks.append(masks)
                all_scores.append(scores)
                times.append(timestamp)
    finally:
        capture.release()
    if index < 2 or len(times) < 2 or (expected > 0 and index < expected - 2):
        raise ValueError(f'Video tidak lengkap/terlalu pendek: {path.name}')
    return (np.array(times), np.array(all_points), np.array(all_masks),
            np.array(all_scores), {'width': width, 'height': height, 'fps': fps,
                                   'decodedFrames': index, 'mirror': False})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default='ml/configs/experiment.json')
    args = parser.parse_args()
    config = json.loads((ROOT / args.config).read_text(encoding='utf-8'))
    if config['preprocessVersion'] != PREPROCESS_VERSION or config['mirror']:
        raise ValueError('Versi preprocessing/mirror tidak didukung')
    source = ROOT / config['datasetDir']
    output = ROOT / config['outputDir']
    model = ROOT / config['landmarkerPath']
    if not model.is_file():
        raise ValueError('Unduh aset Hand Landmarker resmi terlebih dahulu; lihat ml/README.md')
    if (output / 'extraction.json').exists():
        raise ValueError('Ekstraksi sudah ada; gunakan outputDir baru untuk menjaga riwayat')
    rows = inventory(source)
    requested = set(config['labels'])
    if requested:
        available = {row['label'] for row in rows}
        if requested - available:
            raise ValueError(f'Label tidak ditemukan: {sorted(requested - available)}')
        rows = [row for row in rows if row['label'] in requested]
    if config.get('expectedLabelCount') is not None and len(rows) != config['expectedLabelCount']:
        raise ValueError(f"Jumlah label {len(rows)} tidak sesuai target {config['expectedLabelCount']}")
    (output / 'raw').mkdir(parents=True, exist_ok=True)
    samples, sequences = [], []
    for number, row in enumerate(rows):
        times, points, masks, scores, capture = extract_video(row['path'], model, config['sampleHz'])
        fraction = float(masks.any(axis=1).mean())
        if fraction < .2:
            raise ValueError(f'Landmark terlalu sedikit: {row["label"]}; periksa kualitas video')
        normalized, present = resample(times, points, masks, config['sequenceLength'], config['maxGapMs'])
        sequence = features(normalized, present, capture['width'] / capture['height'])
        if np.count_nonzero(sequence[:, 66] + sequence[:, 133]) < 5:
            raise ValueError(f'Window hampir kosong: {row["label"]}')
        sample_id = f'clip-{number:03d}'
        np.savez_compressed(output / 'raw' / f'{sample_id}.npz',
                            timestampsMs=times, landmarks=points, masks=masks, handednessScores=scores)
        samples.append({'sampleId': sample_id, 'label': row['label'],
                        'source': row['path'].relative_to(ROOT).as_posix(), 'sha256': row['sha256'],
                        'participantId': None, 'sessionId': None, 'split': 'train_only',
                        'capture': capture, 'sampledFrames': len(times), 'durationMs': int(times[-1]),
                        'handDetectionFraction': fraction,
                        'normalizedFramesWithHand': int(np.count_nonzero(sequence[:, 66] + sequence[:, 133]))})
        sequences.append(sequence)
        print(f'[{number + 1}/{len(rows)}] {row["label"]}: {len(times)} frame, tangan {fraction:.0%}', flush=True)
    np.savez_compressed(output / 'sequences.npz', X=np.array(sequences, dtype=np.float32),
                        y=np.arange(len(rows), dtype=np.int32))
    save_json(output / 'labels.json', [row['label'] for row in rows])
    save_json(output / 'extraction.json', {
        'status': 'experimental_training_only', 'config': config,
        'preprocessVersion': PREPROCESS_VERSION, 'featureDim': FEATURE_DIM,
        'sequenceLength': config['sequenceLength'], 'landmarkerSha256': sha256(model),
        'sequenceSha256': sha256(output / 'sequences.npz'),
        'samples': samples, 'validationSamples': 0, 'testSamples': 0,
        'warning': 'Satu klip per label; pemeraga/sesi belum diketahui; bukan evaluasi lintas peserta.'})
    print(f'Ekstraksi tersimpan lokal: {output}', flush=True)


if __name__ == '__main__':
    main()
