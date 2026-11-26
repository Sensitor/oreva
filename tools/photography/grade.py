"""Crop and grade ORÉVA's editorial photographs as one series (docs/design/photography.md)."""
import sys
from PIL import Image, ImageEnhance, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
INK = (0x2A, 0x22, 0x30)
# slot: (target size, centre x, centre y, zoom)
CROPS = {
    'today': ((1290, 1720), 0.46, 0.58, 1.04),
    'pg-foundations': ((1080, 1350), 0.50, 0.58, 1.0),
    'pg-strong-centre': ((1080, 1350), 0.60, 0.50, 1.0),
    'wk-full-body-flow': ((1080, 1350), 0.55, 0.62, 1.22),
    'wk-hips-legs': ((1080, 1350), 0.50, 0.50, 1.0),
    'pg-on-the-go': ((1080, 1350), 0.56, 0.60, 1.16),
    'wk-morning-reset': ((1080, 1350), 0.55, 0.50, 1.0),
    'wk-core-foundations': ((1080, 1350), 0.50, 0.60, 1.0),
    'wk-upper-posture': ((1080, 1350), 0.45, 0.45, 1.0),
    'wk-travel-stretch': ((1080, 1350), 0.50, 0.55, 1.0),
}


def crop(im, size, cx, cy, zoom):
    tw, th = size
    ratio = tw / th
    w, h = im.size
    cw, ch = (h * ratio, h) if w / h > ratio else (w, w / ratio)
    cw, ch = cw / zoom, ch / zoom
    left = min(max(cx * w - cw / 2, 0), w - cw)
    top = min(max(cy * h - ch / 2, 0), h - ch)
    return im.crop((round(left), round(top), round(left + cw), round(top + ch))).resize(size, Image.LANCZOS)


def grade(im):
    r, g, b = im.split()
    # Warm the white balance a touch.
    r = r.point(lambda v: min(255, round(v * 1.03)))
    b = b.point(lambda v: round(v * 0.955))
    im = Image.merge('RGB', (r, g, b))
    im = ImageEnhance.Contrast(im).enhance(0.94)
    im = ImageEnhance.Color(im).enhance(0.9)
    # Lift the blacks towards ink: shadows never go dead black.
    ink = Image.new('RGB', im.size, INK)
    im = Image.blend(im, ink, 0.05)
    lift = Image.new('RGB', im.size, (255, 250, 242))
    im = Image.blend(im, lift, 0.03)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))


for slot, (size, cx, cy, zoom) in CROPS.items():
    name = 'today-retouched' if slot == 'today' else slot
    im = Image.open(f'{SRC}/{name}.jpg').convert('RGB')
    out = grade(crop(im, size, cx, cy, zoom))
    out.save(f'{OUT}/{slot}.jpg', 'JPEG', quality=78, optimize=True, progressive=True)
    print(slot, out.size)
