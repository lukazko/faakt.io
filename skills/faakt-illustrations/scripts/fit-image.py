"""Size a generated image for cards, preserving alpha and balancing empty margins."""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageOps


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--preserve-spacing', action='store_true',
                        help='Keep intentional asymmetric spacing from the generated composition.')
    parser.add_argument('--replace', action='store_true', help='Replace an explicitly requested asset.')
    args = parser.parse_args()
    if args.output.exists() and not args.replace:
        parser.error('Output exists; use --replace only for an authorized replacement.')
    if args.input.resolve() == args.output.resolve():
        parser.error('Keep the generated original; input and output must differ.')
    if args.output.suffix.lower() != '.webp':
        parser.error('Output must be an alpha-capable .webp file.')
    with Image.open(args.input) as source:
        artwork = source.convert('RGBA')
    visible = artwork.getchannel('A').getbbox()
    if visible is None:
        parser.error('Input has no visible artwork.')
    if not args.preserve_spacing:
        # Near-invisible alpha specks can extend far outside the actual motif.
        # Use a perceptible footprint for placement, but preserve ALL alpha pixels.
        core = artwork.getchannel('A').point(lambda a: 255 if a >= 16 else 0).getbbox() or visible
        cx, cy = (core[0]+core[2])/2, (core[1]+core[3])/2
        half_width = max(cx-visible[0], visible[2]-cx)
        half_height = max(cy-visible[1], visible[3]-cy)
        from math import ceil
        centered = Image.new('RGBA', (ceil(2*half_width)+2, ceil(2*half_height)+2), (0, 0, 0, 0))
        cropped = artwork.crop(visible)
        centered.alpha_composite(cropped, (round(centered.width/2-(cx-visible[0])),
                                           round(centered.height/2-(cy-visible[1]))))
        artwork = centered
    artwork = ImageOps.contain(artwork, (624, 344), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (640, 360), (0, 0, 0, 0))
    canvas.alpha_composite(artwork, ((640-artwork.width)//2, (360-artwork.height)//2))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.output, 'WEBP', quality=80, method=4)
    with Image.open(args.output) as saved:
        assert saved.mode == 'RGBA' and saved.size == (640, 360)
        assert all(saved.getpixel(xy)[3] == 0 for xy in [(0, 0), (639, 0), (0, 359), (639, 359)])
        left, top, right, bottom = saved.getchannel('A').point(lambda a: 255 if a >= 16 else 0).getbbox() or saved.getchannel('A').getbbox()
    print(json.dumps({'output': str(args.output), 'bytes': args.output.stat().st_size,
                      'alphaMargins': {'left': left, 'right': 640-right,
                                       'top': top, 'bottom': 360-bottom},
                      'centeringAlphaThreshold': 16,
                      'preservedSpacing': args.preserve_spacing}))


if __name__ == '__main__':
    main()
