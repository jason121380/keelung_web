#!/usr/bin/env python3
"""Turn the owner's designer cards into the portraits the team section uses.

Each card in ../source/designer-cards is a finished layout: photo on top,
then a black block with the designer's name, number and 擅長項目. The site
renders that wording itself, so only the photo is wanted here — cropped to
3:4, below the "AT HAIR DESIGN NO.13" overlay burned into the top of the
frame, and written out at the three sizes the image builder asks for.

    python3 tools/crop-designer-cards.py

Requires Pillow. Rerun after replacing a card; the output is deterministic.
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source" / "designer-cards"
DEST = ROOT / "public" / "assets" / "gen"

TOP = 140  # first row below the wordmark overlay

# asset id -> (card, y where the photo block ends, face centre x in 1600-wide space)
CARDS = {
    "team-eric":  ("no00-eric.png",     1500, 851),
    "team-sunny": ("no05-sunny.png",    1900, 850),
    "team-wenny": ("no06-wenny.png",    1900, 779),
    "team-gaga":  ("no07-gaga.png",     1900, 797),
    "team-jerry": ("no08-jerry.png",    1900, 864),
    "team-amy":   ("no10-amy.png",      1900, 879),
    "team-qiqi":  ("no11-qiqi.png",     1900, 825),
    "team-wendy": ("no12-wendy.png",    1500, 789),
    "team-yuan":  ("no13-yuanyuan.png", 1900, 909),
    "team-mary":  ("front-mary.png",    1900, 817),
}

# subdirectory -> (width, height, webp quality); "" is the full-size variant
VARIANTS = {"": (1200, 1600, 82), "tex": (768, 1024, 80), "thumb": (400, 533, 78)}


def main() -> None:
    for sub in VARIANTS:
        (DEST / sub).mkdir(parents=True, exist_ok=True)

    for asset_id, (card, bottom, face_x) in CARDS.items():
        im = Image.open(SRC / card).convert("RGB")
        width, _ = im.size
        height = bottom - TOP
        crop_w = round(height * 3 / 4)
        x0 = max(0, min(width - crop_w, round(face_x - crop_w / 2)))
        portrait = im.crop((x0, TOP, x0 + crop_w, bottom))

        for sub, (w, h, quality) in VARIANTS.items():
            out = DEST / sub / f"{asset_id}.webp"
            portrait.resize((w, h), Image.LANCZOS).save(
                out, "WEBP", quality=quality, method=6
            )
        print(f"{asset_id:12} <- {card}")


if __name__ == "__main__":
    main()
