"""Compose preview.png from phone screenshots (run tools/shots.js first)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
shots = [os.path.join(R, 'screenshots/phone.png'), '/tmp/pv_card.png', '/tmp/pv_sat.png']
caps = ['Installed app: whole campus', 'Tap a building: info card', 'Satellite view (needs internet)']
W, H = 1800, 1180
img = Image.new('RGB', (W, H), (11, 18, 32))
d = ImageDraw.Draw(img)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; Rg = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
icon = Image.open(os.path.join(R, 'icons/icon-512.png')).convert('RGBA').resize((110, 110), Image.LANCZOS)
img.paste(icon, (60, 40), icon)
d.text((190, 48), 'NWCC Campus Map', font=ImageFont.truetype(B, 50), fill=(232, 236, 244))
d.text((192, 112), 'Installable PWA · Phase 3 3D campus map · works offline (except satellite)', font=ImageFont.truetype(Rg, 26), fill=(154, 166, 189))
pw, ph = 450, 974
x0 = (W - 3 * pw - 2 * 120) // 2
for i, (s, c) in enumerate(zip(shots, caps)):
    x, y = x0 + i * (pw + 120), 180
    sh = Image.new('RGBA', (pw + 60, ph + 60), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([30, 40, pw + 30, ph + 30], 60, fill=(0, 0, 0, 160))
    sh = sh.filter(ImageFilter.GaussianBlur(18)); img.paste(sh, (x - 30, y - 30), sh)
    d.rounded_rectangle([x - 14, y - 14, x + pw + 14, y + ph + 14 - 40], 58, fill=(40, 46, 58))
    im = Image.open(s).convert('RGB').resize((pw, int(pw * 844 / 390)), Image.LANCZOS).crop((0, 0, pw, ph - 40))
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], 46, fill=255)
    img.paste(im, (x, y), m)
    f = ImageFont.truetype(Rg, 24); tw = d.textlength(c, font=f)
    d.text((x + pw / 2 - tw / 2, y + ph - 4), c, font=f, fill=(200, 208, 222))
img.save(os.path.join(R, 'preview.png')); print('preview.png', img.size)
