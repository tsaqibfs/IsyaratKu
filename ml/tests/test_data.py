import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from data import inventory, resample, features, augment, check_sources


class DataContractTests(unittest.TestCase):
    def hand(self):
        hand = np.zeros((21, 3), dtype=np.float32)
        hand[:, 0] = np.linspace(.2, .4, 21)
        hand[:, 1] = np.linspace(.3, .6, 21)
        return hand

    def test_duplicate_label_in_nested_folders_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'a').mkdir()
            (root / 'a' / 'Halo.mp4').write_bytes(b'video')
            (root / 'halo.mp4').write_bytes(b'video')
            with self.assertRaisesRegex(ValueError, 'duplikat'):
                inventory(root)

    def test_missing_hand_not_interpolated_into_present_hand(self):
        points = np.zeros((3, 2, 21, 3), dtype=np.float32)
        points[0, 0] = self.hand()
        points[2, 0] = self.hand()
        masks = np.array([[1, 0], [0, 0], [1, 0]], dtype=bool)
        out, present = resample(np.array([0, 100, 200]), points, masks, 5, 200)
        self.assertFalse(present[1, 0])
        self.assertFalse(present[2, 0])
        self.assertTrue(present[-1, 0])
        self.assertTrue(np.all(out[~present] == 0))

    def test_new_source_after_extraction_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'Halo.mp4').write_bytes(b'first')
            rows = inventory(root)
            recorded = [{'label': r['label'], 'source': r['path'].relative_to(root).as_posix(),
                         'sha256': r['sha256']} for r in rows]
            check_sources(root, root, recorded, [])
            (root / 'Buku.mp4').write_bytes(b'second')
            with self.assertRaisesRegex(ValueError, 'Inventaris'):
                check_sources(root, root, recorded, [])

    def test_local_shape_is_scale_invariant(self):
        points = np.zeros((2, 2, 21, 3), dtype=np.float32)
        points[:, 0] = self.hand()
        masks = np.array([[1, 0], [1, 0]], dtype=bool)
        original = features(points, masks, 1.)
        scaled = features(points * 1.5, masks, 1.)
        np.testing.assert_allclose(original[:, :63], scaled[:, :63], atol=1e-5)

    def test_long_gap_and_invalid_timestamps(self):
        points = np.zeros((2, 2, 21, 3), dtype=np.float32)
        masks = np.ones((2, 2), dtype=bool)
        _, valid = resample(np.array([0, 500]), points, masks, 3, 200)
        self.assertFalse(valid[1].any())
        for times in ([0, 0], [100, 0], [0, float('nan')]):
            with self.assertRaises(ValueError):
                resample(np.array(times), points, masks, 3, 200)

    def test_features_preserve_motion_and_masks(self):
        points = np.zeros((2, 2, 21, 3), dtype=np.float32)
        points[:, 0] = self.hand()
        points[1, 0, :, 0] += .1
        masks = np.array([[1, 0], [1, 0]], dtype=bool)
        result = features(points, masks, 1.0)
        self.assertEqual(result.shape, (2, 137))
        np.testing.assert_allclose(result[0, :63], result[1, :63], atol=1e-5)
        self.assertGreater(result[1, 63], result[0, 63])
        self.assertTrue(np.all(result[:, 66] == 1))
        self.assertTrue(np.all(result[:, 67:] == 0))

    def test_degenerate_palm_is_missing_and_no_nan(self):
        points = np.ones((2, 2, 21, 3), dtype=np.float32)
        result = features(points, np.ones((2, 2), dtype=bool), 1.0)
        self.assertTrue(np.isfinite(result).all())
        self.assertTrue(np.all(result == 0))

    def test_augmentation_preserves_missing_slots_and_source(self):
        points = np.zeros((2, 2, 21, 3), dtype=np.float32)
        points[:, 0] = self.hand()
        source = features(points, np.array([[1, 0], [1, 0]], dtype=bool), 1.)
        before = source.copy()
        result = augment(source, np.random.default_rng(42))
        np.testing.assert_array_equal(source, before)
        np.testing.assert_array_equal(result[:, 66], source[:, 66])
        self.assertTrue(np.all(result[:, 67:] == 0))


if __name__ == '__main__':
    unittest.main()
