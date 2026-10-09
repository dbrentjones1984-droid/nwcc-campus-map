#!/usr/bin/env python3
"""Generate trees.js: deterministic, procedurally placed campus trees for the 3D map.

OpenStreetMap has NO natural=tree / wood / tree_row (and no landuse=grass) mapped on the NWCC Senatobia campus
(checked 2026-10-08 via Overpass and the OSM API extract), so trees are generated here, styled after the official
2D campus map (round canopy trees lining drives and walks, clustered around buildings, groves toward the campus edge).

Trees go only on "lawn" = campus polygon minus buffered buildings, roads, parking, pitches/track, paths, water.
Seeded random (SEED), so the output is identical on every run.

Needs shapely:  /workspace/venv-geo/bin/python tools/build_trees.py   (then: python3 tools/build_sw.py)
Inputs: boundary.json, basemap.geojson, buildings_3d.geojson (+ optional OSM API extract for extra building/track outlines)
"""
import json, math, os, random
import xml.etree.ElementTree as ET
import shapely
from shapely.geometry import Polygon, LineString, Point, shape
from shapely.ops import unary_union
from shapely.prepared import prep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OSM_XML = '/workspace/nwcc-campus-map-phase3/src/osm_campus_api.xml'   # optional
SEED, MAX_TREES, MIN_GAP = 20261008, 420, 7.5

LAT0, LNG0 = 34.6245, -89.9715
KX, KY = 111320.0 * math.cos(math.radians(LAT0)), 110574.0
to_m = lambda g: shapely.transform(g, lambda a: (a - [LNG0, LAT0]) * [KX, KY])
def to_ll(x, y): return (round(x / KX + LNG0, 7), round(y / KY + LAT0, 7))

B = json.load(open(os.path.join(ROOT, 'boundary.json')))
CAMPUS = to_m(Polygon([(p[1], p[0]) for p in B]))
BM = json.load(open(os.path.join(ROOT, 'basemap.geojson')))['features']
BLD = json.load(open(os.path.join(ROOT, 'buildings_3d.geojson')))['features']

obst, roads, paths, bldgs = [], [], [], []
ROAD_BUF = {'minor': 8.0, 'service': 6.0, 'aisle': 5.5}
for f in BM:
    p, g = f['properties'], to_m(shape(f['geometry']))
    L = p.get('layer')
    if L == 'road': obst.append(g.buffer(ROAD_BUF.get(p.get('cls'), 6.0))); roads.append((g, p.get('cls')))
    elif L == 'connector': obst.append(g.buffer(16))
    elif L == 'parking': obst.append(g.buffer(4))
    elif L == 'pitch': obst.append(g.buffer(5))
    elif L == 'water': obst.append(g.buffer(4))
    elif L == 'path': obst.append(g.buffer(2.5)); paths.append(g)
    elif L == 'plaza': obst.append(g.buffer(2.0))   # Seal Plaza (landmark mockup 2026-10-09)
for f in BLD:
    g = to_m(shape(f['geometry'])); g = g if g.is_valid else g.buffer(0)
    bldgs.append(g); obst.append(g.buffer(6))
n_osm_b = 0
if os.path.exists(OSM_XML):
    x = ET.parse(OSM_XML).getroot()
    nodes = {n.get('id'): (float(n.get('lon')), float(n.get('lat'))) for n in x.iter('node')}
    for w in x.iter('way'):
        t = {q.get('k'): q.get('v') for q in w.iter('tag')}
        if not ('building' in t or t.get('leisure') in ('track', 'pitch') or t.get('amenity') == 'parking'): continue
        pts = [nodes[nd.get('ref')] for nd in w.iter('nd') if nd.get('ref') in nodes]
        if len(pts) < 4 or pts[0] != pts[-1]: continue
        g = to_m(Polygon(pts)); g = g if g.is_valid else g.buffer(0)
        if not g.intersects(CAMPUS): continue
        if 'building' in t: bldgs.append(g); n_osm_b += 1
        obst.append(g.buffer(6 if 'building' in t else 4))

OB = unary_union(obst)
LAWN = CAMPUS.buffer(-4).difference(OB)
LAWN_P = prep(LAWN)
BLD_U = unary_union(bldgs)
EDGE = CAMPUS.boundary
rng = random.Random(SEED)

cands = []   # (x, y, kind)
def try_add(x, y, kind):
    if LAWN_P.contains(Point(x, y)): cands.append((x, y, kind))

# a) street trees lining drives and walks (both sides, slight jitter)
def line_parts(g): return list(g.geoms) if hasattr(g, 'geoms') else [g]
for g, cls in roads:
    if cls == 'aisle': continue
    off, step, keep = (ROAD_BUF.get(cls, 6) + 3.5), (20 if cls == 'minor' else 24), 0.7
    for L in line_parts(g):
        d = rng.uniform(0, step)
        while d < L.length:
            a, b = L.interpolate(max(d - 1, 0)), L.interpolate(min(d + 1, L.length))
            dx, dy = b.x - a.x, b.y - a.y; n = math.hypot(dx, dy) or 1
            nx, ny = -dy / n, dx / n; c = L.interpolate(d)
            for s in (1, -1):
                if rng.random() < keep:
                    o = off + rng.uniform(-1, 2)
                    try_add(c.x + s * nx * o, c.y + s * ny * o, 'street')
            d += step + rng.uniform(-3, 3)
for L0 in paths:
    for L in line_parts(L0):
        d = rng.uniform(0, 26)
        while d < L.length:
            c = L.interpolate(d)
            if rng.random() < 0.45:
                ang = rng.uniform(0, 2 * math.pi); try_add(c.x + math.cos(ang) * 6, c.y + math.sin(ang) * 6, 'walk')
            d += 26 + rng.uniform(-4, 4)
# b) trees framing buildings
for g in bldgs:
    ring = g.buffer(11, join_style='round').exterior
    d = rng.uniform(0, 15)
    while d < ring.length:
        if rng.random() < 0.4:
            c = ring.interpolate(d); try_add(c.x + rng.uniform(-2, 2), c.y + rng.uniform(-2, 2), 'bldg')
        d += 15 + rng.uniform(-3, 3)
# c) groves on open lawn toward the campus edge (like the wooded edges on the 2D map)
GROVE_ZONE = prep(LAWN.intersection(EDGE.buffer(70)).difference(BLD_U.buffer(22)))
minx, miny, maxx, maxy = LAWN.bounds
seeds = []
for _ in range(4000):
    x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
    if GROVE_ZONE.contains(Point(x, y)) and all(math.hypot(x - a, y - b) > 55 for a, b in seeds): seeds.append((x, y))
for sx, sy in seeds:
    for _ in range(rng.randint(4, 8)):
        r, ang = 13 * math.sqrt(rng.random()), rng.uniform(0, 2 * math.pi)
        try_add(sx + r * math.cos(ang), sy + r * math.sin(ang), 'grove')

# thin: min gap between trunks, priority street > bldg > walk > grove, then cap
order = {'street': 0, 'bldg': 1, 'walk': 2, 'grove': 3}
rng.shuffle(cands); cands.sort(key=lambda c: order[c[2]])
CELL = MIN_GAP; grid, kept = {}, []
for x, y, k in cands:
    gx, gy = int(x // CELL), int(y // CELL)
    if any(math.hypot(x - a, y - b) < MIN_GAP for i in (-1, 0, 1) for j in (-1, 0, 1) for a, b in grid.get((gx + i, gy + j), [])): continue
    grid.setdefault((gx, gy), []).append((x, y)); kept.append((x, y, k))
if len(kept) > MAX_TREES:
    rng.shuffle(kept); kept = kept[:MAX_TREES]
kept.sort(key=lambda c: (round(c[1]), c[0]))

out = []
for x, y, k in kept:
    conifer = rng.random() < (0.28 if k == 'grove' else 0.12)
    h = round(rng.uniform(10, 15) if conifer else rng.uniform(7, 12.5), 1)
    r = round(rng.uniform(2.4, 3.4) if conifer else rng.uniform(3.0, 4.8), 1)
    lng, lat = to_ll(x, y)
    out.append([lng, lat, h, r, 1 if conifer else 0, rng.randrange(4)])
from collections import Counter
kinds = Counter(k for _, _, k in kept)
meta = {'source': 'generated (seeded, deterministic) - OSM has no natural=tree/wood/tree_row on campus as of 2026-10-08',
        'seed': SEED, 'count': len(out), 'by_kind': dict(kinds), 'fields': ['lng', 'lat', 'height_m', 'canopy_r_m', 'conifer', 'shade']}
open(os.path.join(ROOT, 'trees.js'), 'w').write('// Generated by tools/build_trees.py: procedurally placed campus trees (see meta).\n'
    f'window.NWCC_TREES={json.dumps({"meta": meta, "t": out}, separators=(",", ":"))};\n')
print('trees', len(out), dict(kinds), 'conifers', sum(t[4] for t in out), '| OSM extra buildings', n_osm_b,
      '| lawn area m2', round(LAWN.area), '| grove seeds', len(seeds))
