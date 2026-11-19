"""Regression checks for alpha specks and intentionally asymmetric compositions."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from PIL import Image, ImageDraw


class FitImageTests(unittest.TestCase):
    def test_centers_visible_motif_despite_faint_distant_speck(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory)/'source.png'
            target = Path(directory)/'result.webp'
            artwork = Image.new('RGBA', (300, 160))
            ImageDraw.Draw(artwork).rectangle((180, 40, 239, 119), fill=(30, 80, 180, 255))
            artwork.putpixel((0, 0), (30, 80, 180, 1))
            artwork.save(source)
            before = source.read_bytes()
            command = [sys.executable, str(Path(__file__).with_name('fit-image.py')),
                       '--input', str(source), '--output', str(target)]
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            margins = json.loads(result.stdout)['alphaMargins']
            self.assertLessEqual(abs(margins['left']-margins['right']), 2)
            self.assertLessEqual(abs(margins['top']-margins['bottom']), 2)
            with Image.open(target) as image:
                self.assertEqual(image.size, (640, 360))
                self.assertEqual(image.mode, 'RGBA')
                self.assertEqual(image.getpixel((0, 0))[3], 0)
            self.assertEqual(source.read_bytes(), before)
            existing = target.read_bytes()
            result = subprocess.run(command, capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(target.read_bytes(), existing)

    def test_preserves_explicitly_requested_asymmetric_spacing(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory)/'source.png'
            target = Path(directory)/'result.webp'
            artwork = Image.new('RGBA', (300, 160))
            ImageDraw.Draw(artwork).rectangle((220, 40, 279, 119), fill=(30, 80, 180, 255))
            artwork.save(source)
            result = subprocess.run([sys.executable, str(Path(__file__).with_name('fit-image.py')),
                                     '--input', str(source), '--output', str(target), '--preserve-spacing'],
                                    check=True, capture_output=True, text=True)
            margins = json.loads(result.stdout)['alphaMargins']
            self.assertGreater(margins['left'], margins['right']+200)


if __name__ == '__main__':
    unittest.main()
