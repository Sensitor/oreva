"""Remove a small object from a plain wall: fill a patch by interpolating each
row between the wall on either side, with a feathered edge.

Used twice: the air-conditioning unit on the Today photograph (the default
box), and a security camera on `pg-on-the-go` (box 84 146 168 232, applied to
the graded file).

    python3 retouch.py SRC DST [X0 X1 Y0 Y1]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32)
x0, x1, y0, y1 = (int(v) for v in sys.argv[3:7]) if len(sys.argv) >= 7 else (1198, 1545, 980, 1214)
rng = np.random.default_rng(7)
out = a.copy()
for y in range(y0, y1):
    left = a[y, x0 - 8:x0].mean(axis=0)
    right = a[y, x1:x1 + 8].mean(axis=0)
    t = np.linspace(0, 1, x1 - x0)[:, None]
    row = left * (1 - t) + right * t
    out[y, x0:x1] = row + rng.normal(0, 1.4, row.shape)
patched = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
# Feather the patch edges so no seam shows.
mask = Image.new('L', im.size, 0)
mask.paste(255, (x0 + 4, y0 + 4, x1 - 4, y1 - 4))
mask = mask.filter(ImageFilter.GaussianBlur(5))
quality = 78 if dst.endswith('.jpg') and len(sys.argv) >= 7 else 95
Image.composite(patched, im, mask).save(dst, quality=quality)
