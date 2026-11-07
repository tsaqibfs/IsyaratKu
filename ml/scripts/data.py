"""Kontrak preprocessing eksperimen klip utuh, bukan window streaming rilis."""
from pathlib import Path
import hashlib
import json

import numpy as np

PREPROCESS_VERSION = 'hands-clip-normalized-v1'
FEATURE_DIM = 137


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def save_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False), encoding='utf-8')


def inventory(root):
    root = Path(root)
    paths = sorted((p for p in root.rglob('*') if p.is_file() and p.suffix.lower() == '.mp4'),
                   key=lambda p: p.relative_to(root).as_posix().casefold())
    if not paths:
        raise ValueError(f'Tidak ada MP4 pada {root}')
    seen = set()
    result = []
    for path in paths:
        label = path.stem.strip().casefold()
        if not label or label in seen:
            raise ValueError(f'Label kosong/duplikat: {path.stem}')
        if path.stat().st_size == 0:
            raise ValueError(f'Video kosong: {path.name}')
        seen.add(label)
        result.append({'label': label, 'path': path, 'sha256': sha256(path)})
    if len({r['sha256'] for r in result}) != len(result):
        raise ValueError('Video identik ditemukan dengan label berbeda')
    return result


def check_sources(root, project_root, recorded, labels):
    rows = inventory(root)
    if labels:
        rows = [row for row in rows if row['label'] in set(labels)]
    current = [(row['label'], row['path'].relative_to(project_root).as_posix(), row['sha256'])
               for row in rows]
    previous = [(row['label'], row['source'], row['sha256']) for row in recorded]
    if current != previous:
        raise ValueError('Inventaris sumber berubah; ekstrak ulang pada outputDir baru')


def resample(times, points, masks, length, max_gap_ms):
    times = np.asarray(times, dtype=np.float64)
    points = np.asarray(points, dtype=np.float32)
    masks = np.asarray(masks, dtype=bool)
    if (len(times) < 2 or times.ndim != 1 or not np.isfinite(times).all()
            or np.any(np.diff(times) <= 0) or length < 2 or max_gap_ms <= 0):
        raise ValueError('Timestamp harus finite dan meningkat; klip minimal dua frame')
    if points.shape != (len(times), 2, 21, 3) or masks.shape != (len(times), 2):
        raise ValueError('Bentuk landmark/mask tidak sesuai kontrak')
    if not np.isfinite(points).all():
        raise ValueError('Landmark tidak finite')
    target = np.linspace(times[0], times[-1], length)
    output = np.zeros((length, 2, 21, 3), dtype=np.float32)
    valid = np.zeros((length, 2), dtype=bool)
    for k, moment in enumerate(target):
        right = min(int(np.searchsorted(times, moment)), len(times) - 1)
        if abs(times[right] - moment) < 1e-6:
            valid[k] = masks[right]
            output[k, valid[k]] = points[right, valid[k]]
            continue
        left = right - 1
        if left < 0 or times[right] - times[left] > max_gap_ms:
            continue
        valid[k] = masks[left] & masks[right]
        weight = (moment - times[left]) / (times[right] - times[left])
        output[k, valid[k]] = ((1 - weight) * points[left, valid[k]]
                                 + weight * points[right, valid[k]])
    return output, valid


def features(points, masks, aspect_ratio):
    points = np.asarray(points, dtype=np.float32).copy()
    masks = np.asarray(masks, dtype=bool).copy()
    if (points.ndim != 4 or points.shape[1:] != (2, 21, 3)
            or masks.shape != points.shape[:2] or not np.isfinite(points).all()
            or not np.isfinite(aspect_ratio) or aspect_ratio <= 0):
        raise ValueError('Landmark, mask, atau rasio aspek tidak valid')
    points[..., 0] *= aspect_ratio
    points[..., 2] *= aspect_ratio
    output = np.zeros((len(points), FEATURE_DIM), dtype=np.float32)
    for slot in range(2):
        wrist = points[:, slot, 0]
        palm = (np.linalg.norm(points[:, slot, 5] - wrist, axis=1)
                + np.linalg.norm(points[:, slot, 17] - wrist, axis=1)) / 2
        active = masks[:, slot] & (palm > 1e-6)
        masks[:, slot] = active
        start = slot * 67
        local = (points[active, slot] - wrist[active, None]) / palm[active, None, None]
        output[active, start:start + 63] = local.reshape(-1, 63)
        output[active, start + 63:start + 66] = wrist[active]
        output[active, start + 66] = 1
    both = masks[:, 0] & masks[:, 1]
    output[both, 134:137] = points[both, 1, 0] - points[both, 0, 0]
    return output


def augment(sequence, rng):
    result = sequence.copy()
    # Only tiny local-shape noise; preserve trajectories, masks, time, and hand sides.
    for start in (0, 67):
        active = result[:, start + 66] > .5
        noise = rng.normal(0, .008, (int(active.sum()), 63)).astype(np.float32)
        noise[:, :3] = 0  # wrist-relative wrist remains zero
        result[active, start:start + 63] += noise
    return result
