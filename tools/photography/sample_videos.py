"""Sample 'breathing' videos in the ORÉVA palette (portrait, for the full-bleed player)."""
import math, subprocess, sys
from PIL import Image, ImageDraw

W, H, FPS, SECONDS, SS = 720, 1280, 30, 16, 2
CREAM, SAND, LILAC, MIST, LAV, IRIS = '#F7F3EE', '#E9E1D7', '#E7DDF4', '#DCCDEB', '#A78BC6', '#6E5390'
CX, CY = W / 2, H * 0.34  # above the player sheet

def ease(t):  # 0..1..0 over one breath, smooth (cosine)
    return 0.5 - 0.5 * math.cos(2 * math.pi * t)

def disc(d, cx, cy, r, fill=None, outline=None, width=0):
    d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=fill, outline=outline, width=width * SS)

def frame(kind, t):
    im = Image.new('RGB', (W * SS, H * SS), CREAM)
    d = ImageDraw.Draw(im)
    b = ease((t % 8) / 8)  # one breath every 8 s
    if kind == 'breath':
        disc(d, CX, CY, 150 + 90 * b, fill=LILAC)
        disc(d, CX, CY, 258, outline=LAV, width=2)
    elif kind == 'flow':
        a = 2 * math.pi * t / 16
        disc(d, CX + 70 * math.sin(a), CY + 30 * math.sin(2 * a), 170 + 40 * b, fill=MIST)
        disc(d, CX - 70 * math.sin(a), CY - 30 * math.sin(2 * a), 120 + 30 * (1 - b), fill=LILAC)
    else:  # core: the ring draws in on the exhale
        disc(d, CX, CY, 210, fill=SAND)
        disc(d, CX, CY, 250 - 70 * b, outline=IRIS, width=3)
    return im.resize((W, H), Image.LANCZOS)

kind, out = sys.argv[1], sys.argv[2]
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                      '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out], stdin=subprocess.PIPE)
for i in range(FPS * SECONDS):
    p.stdin.write(frame(kind, i / FPS).tobytes())
p.stdin.close(); p.wait()
