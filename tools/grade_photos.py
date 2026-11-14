"""Prepare photos for the Saiyakat home page.

Crops each photo to 4:5, resizes to max 1200 px wide, keeps reds/oranges vivid,
sets the overall colour strength, adds a faint warm cast and a bit of contrast.

Usage:
    python3 tools/grade_photos.py IN.jpg OUT.jpg [--sat 0.85] [--red 1.25] [--top 0.5]

    --sat  colour strength for everything except reds (0 = black-and-white, 1 = original)
    --red  colour strength for reds/oranges (1 = original, >1 = brighter)
    --top  where to crop vertically: 0 = keep the top, 0.5 = centre, 1 = keep the bottom

Example (the current site look):
    python3 tools/grade_photos.py my-photo.jpg public/photos/hero-1.jpg --sat 0.85 --red 1.25
Needs: pip install pillow numpy
"""
import argparse

import numpy as np
from PIL import Image, ImageEnhance


def grade(src: str, dst: str, sat: float, red: float, top: float) -> None:
    im = Image.open(src).convert('RGB')
    w, h = im.size
    # Crop to 4:5
    if h / w > 5 / 4:
        th = round(w * 5 / 4)
        y0 = round((h - th) * top)
        im = im.crop((0, y0, w, y0 + th))
    else:
        tw = round(h * 4 / 5)
        x0 = (w - tw) // 2
        im = im.crop((x0, 0, x0 + tw, h))
    if im.size[0] > 1200:
        im = im.resize((1200, round(im.size[1] * 1200 / im.size[0])), Image.LANCZOS)

    hsv = np.asarray(im.convert('HSV')).astype(np.float32)
    hue = hsv[..., 0] * 360 / 255
    s = hsv[..., 1] / 255
    redness = np.clip(1 - np.minimum(np.abs(hue), np.abs(hue - 360)) / 32, 0, 1)
    redness = np.maximum(redness, np.clip(1 - np.abs(hue - 18) / 20, 0, 1) * 0.85)
    keep = redness * np.clip((s - 0.3) / 0.3, 0, 1)
    hsv[..., 1] = np.clip(hsv[..., 1] * (sat + (red - sat) * keep), 0, 255)
    out = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')

    arr = np.asarray(out).astype(np.float32)
    lum = arr.mean(axis=2, keepdims=True) / 255
    arr = arr * (np.array([1.035, 1.0, 0.975]) * (1 - lum) + lum)  # faint warm shadows
    out = ImageEnhance.Contrast(Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))).enhance(1.12)
    out.save(dst, quality=84, optimize=True, progressive=True)
    print(dst, out.size)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('src')
    p.add_argument('dst')
    p.add_argument('--sat', type=float, default=0.85)
    p.add_argument('--red', type=float, default=1.25)
    p.add_argument('--top', type=float, default=0.5)
    a = p.parse_args()
    grade(a.src, a.dst, a.sat, a.red, a.top)
