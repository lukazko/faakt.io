"""
Vygeneruje Open Graph obrázek (1200x630) — černý podklad a logo aplikace
stejné jako ve faviconu (gradientové "a:").

Použití:
    python scripts/generate-og-image.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BACKGROUND = (10, 10, 10)          # #0a0a0a
GRADIENT_START = (194, 65, 12)     # #c2410c
GRADIENT_END = (245, 158, 11)      # #f59e0b

FONT_SIZE = 380
FONT_CANDIDATES = [
    "C:/Windows/Fonts/ariblk.ttf",   # Arial Black (weight 900 jako ve faviconu)
    "C:/Windows/Fonts/arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

# Poměr pozic "a" a ":" převzatý z faviconu (viewBox 32x32: a @ x=13, : @ x=22).
MARK_TEXT = "a:"

OUTPUT = Path(__file__).resolve().parent.parent / "static" / "og-image.png"


def load_font() -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, FONT_SIZE)
    raise SystemExit("Nenalezen žádný použitelný font.")


def gradient(size: tuple[int, int]) -> Image.Image:
    """Diagonální gradient zleva dolů doprava nahoru (jako ve faviconu)."""
    width, height = size
    layer = Image.new("RGB", (width, height))
    pixels = layer.load()
    for y in range(height):
        for x in range(width):
            # x1=0,y1=1 -> x2=1,y2=0
            t = (x / max(width - 1, 1) + (1 - y / max(height - 1, 1))) / 2
            pixels[x, y] = tuple(
                round(start + (end - start) * t)
                for start, end in zip(GRADIENT_START, GRADIENT_END)
            )
    return layer


def main() -> None:
    font = load_font()

    canvas = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)

    # Maska s textem loga
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)

    bbox = draw.textbbox((0, 0), MARK_TEXT, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Optické vycentrování: ":" sahá výš než "a", posuneme o pár pixelů dolů.
    x = (WIDTH - text_w) / 2 - bbox[0]
    y = (HEIGHT - text_h) / 2 - bbox[1] + 12
    draw.text((x, y), MARK_TEXT, font=font, fill=255)

    grad = gradient((WIDTH, HEIGHT))
    canvas.paste(grad, (0, 0), mask)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT, "PNG", optimize=True)
    print(f"Zapsáno: {OUTPUT} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
