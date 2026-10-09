"""Generate the PWA icons: NWCC athletic block 'N' + NORTHWEST banner (assets/logo-n.png) on NWCC navy #222C62.
Treatment: the logo's own outer outline is navy (~#222D65), which disappears on the navy tile, so a thin white
outer stroke (sticker style, ~2% of logo width) is added around the silhouette.
Run: python3 tools/make_icons.py
Earlier generators: seal version /workspace/nwcc-campus-map-pwa-backup-seal-icon/make_icons.py,
campus-art version /workspace/nwcc-campus-map-pwa-backup-pre-icon/make_icons.py"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'icons'); os.makedirs(OUT, exist_ok=True)
N = 1024
NAVY = (34, 44, 98)

def logo_with_stroke(stroke_frac=0.02):
    im = Image.open(os.path.join(ROOT, 'assets', 'logo-n.png')).convert('RGBA')
    lg = im.crop(im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox())
    w = max(2, int(lg.width * stroke_frac)); pad = w * 2
    L = Image.new('RGBA', (lg.width + 2 * pad, lg.height + 2 * pad), (0, 0, 0, 0)); L.paste(lg, (pad, pad))
    A = L.getchannel('A').filter(ImageFilter.GaussianBlur(w * 0.55)).point(lambda v: 255 if v > 8 else 0).filter(ImageFilter.GaussianBlur(1.2))
    S = Image.new('RGBA', L.size, (255, 255, 255, 0)); S.putalpha(A); S.alpha_composite(L)
    return S.crop(S.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox())

LOGO = logo_with_stroke()

def max_radius(logo, w):
    """Largest distance (fraction of N) of any opaque logo pixel from the tile centre when the logo is w px wide."""
    h = int(w * logo.height / logo.width); a = np.asarray(logo.resize((w, h), Image.BILINEAR).getchannel('A')) > 40
    yy, xx = np.nonzero(a); return np.hypot(xx - w / 2, yy - h / 2).max() / N

def art(size, mode):
    img = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    if mode == 'round':   d.rounded_rectangle([0, 0, N - 1, N - 1], radius=int(N * 0.22), fill=NAVY); w = int(N * 0.80)
    elif mode == 'bleed': d.rectangle([0, 0, N, N], fill=NAVY); w = int(N * 0.74)
    elif mode == 'maskable':
        d.rectangle([0, 0, N, N], fill=NAVY); w = int(N * 0.80)
        while max_radius(LOGO, w) > 0.385: w -= 8          # keep every logo pixel inside the 80% safe circle
    else: w = N                                            # 'logo': logo only on transparent (favicon)
    h = int(w * LOGO.height / LOGO.width)
    img.alpha_composite(LOGO.resize((w, h), Image.LANCZOS), ((N - w) // 2, (N - h) // 2))
    return img.resize((size, size), Image.LANCZOS)

JOBS = [('icon-192.png', 192, 'round'), ('icon-512.png', 512, 'round'),
        ('icon-maskable-512.png', 512, 'maskable'), ('icon-maskable-192.png', 192, 'maskable'),
        ('apple-touch-icon.png', 180, 'bleed'), ('favicon-32.png', 32, 'logo')]
if __name__ == '__main__':
    for name, size, mode in JOBS:
        im = art(size, mode)
        if name == 'apple-touch-icon.png': im = im.convert('RGB')   # iOS: opaque; it rounds the corners itself
        im.save(os.path.join(OUT, name)); print('wrote', name, im.size, im.mode)
