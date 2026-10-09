"""Fill sw.js PRECACHE + VERSION from the files on disk. Run after editing any app file: python3 tools/build_sw.py"""
import hashlib, json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FILES = ['./', 'index.html', 'app.js', 'pwa.js', 'exteriors.js', 'data.js', 'basemap.js', 'basemap.geojson',
         'buildings_3d.geojson', 'boundary.json', 'manifest.webmanifest', 'trees.js',
         'vendor/maplibre-gl.js', 'vendor/maplibre-gl.css', 'vendor/three.module.js',
         'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png',
         'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'assets/logo.png']
for d in sorted(os.listdir(os.path.join(ROOT, 'fonts'))):
    for f in sorted(os.listdir(os.path.join(ROOT, 'fonts', d))):
        FILES.append(f'fonts/{d}/{f}'.replace(' ', '%20'))
h = hashlib.sha256()
for f in FILES:
    if f == './': continue
    p = os.path.join(ROOT, f.replace('%20', ' '))
    h.update(f.encode()); h.update(open(p, 'rb').read())
ver = h.hexdigest()[:10]
tpl_path = os.path.join(ROOT, 'tools', 'sw.template.js')
src = open(tpl_path).read()
out = src.replace("'__VERSION__'", repr(ver)).replace('__PRECACHE__', json.dumps(FILES, indent=2))
open(os.path.join(ROOT, 'sw.js'), 'w').write(out)
print('sw.js version', ver, '·', len(FILES), 'precached URLs')
