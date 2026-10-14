/* NWCC Senatobia campus map · Phase 3 app (classic script; Three.js loaded via dynamic import). */
(function () {
'use strict';
const META = window.NWCC_META, ITEMS = window.NWCC_ITEMS, FC = window.NWCC_BUILDINGS_3D, BOUNDARY = window.NWCC_BOUNDARY;
const CATS = {
  residence: { label: 'Residence', color: '#2f6fd6' },
  instructional: { label: 'Instructional', color: '#c8453a' },
  athletic: { label: 'Athletic', color: '#2e8b57' },
  support: { label: 'Support', color: '#c99a06' }
};
const LANDMARKS = ['20', '52', '40', '54', '55', '50'];
const active = { residence: true, instructional: true, athletic: true, support: true };
const byKey = Object.fromEntries(ITEMS.map(i => [i.key, i]));
const featByKey = Object.fromEntries(FC.features.map(f => [f.properties.key, f]));
const P = new URLSearchParams(location.search);

function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9#]+/g, ' ').trim(); }
function title(it) { return it.name || ('Building ' + it.label); }

const map_onReady = [];
// PWA: label glyphs are vendored in ./fonts (Noto Sans Regular/Medium, ranges 0-255 + 9728-9983 for the ★), so labels
// work offline. new URL() would percent-encode the {placeholders}, so build the base URL first.
const glyphs = (location.protocol === 'file:' ? 'https://protomaps.github.io/basemaps-assets/fonts/'
  : new URL('fonts/', location.href).href) + '{fontstack}/{range}.pbf';
// Campus-only basemap (basemap.js, built by src/build_basemap.py): no OSM raster tiles, so nothing outside the
// campus is drawn except the two connecting roads, Wilson Drive and HWY 51.
const BASE = window.NWCC_BASEMAP, BASE_META = window.NWCC_BASEMAP_META || {};
const OUTSIDE = '#dfe6d4';  // SURROUND: was flat gray #e8eae3
// Colors follow the official 2D campus map: lawn green, darker field green, light gray pavement/parking (2026-10-08).
const LAWN = '#b7d99c', FIELD = '#95b871', PAVE = '#dcded2';
const lay = (k) => ['==', ['get', 'layer'], k];
const cls = (...k) => ['match', ['get', 'cls'], k, true, false];
// True ground width (2026-10-08): every road/connector/path feature carries its real width `w` in meters. MapLibre
// (512 px tiles) at lat 34.62 draws 1 m = 0.25436 px at z14, doubling per zoom, so a base-2 exponential ramp holds the
// ground width at every zoom; below z17 a small per-class pixel floor keeps thin lines visible when zoomed out.
const PXM14 = 512 * 16384 / (40075016.686 * Math.cos(34.623 * Math.PI / 180));
const mw = (d, floor) => { const g = (z) => ['*', ['max', 0.3, ['+', ['get', 'w'], d]], PXM14 * Math.pow(2, z - 14)];
  return ['interpolate', ['exponential', 2], ['zoom'], 14, ['max', floor, g(14)], 16, ['max', floor, g(16)], 17, g(17), 22, g(22)]; };
const byCls = (m) => ['match', ['get', 'cls'], ...Object.keys(m).filter(x => x !== '_').flatMap(x => [x, m[x]]), m._];
// SURROUND-DEF >>>
// Faded surroundings (2026-10-10): muted context outside the campus block so the map blends out instead of flat gray.
const SR = { grass: '#dfe6d4', wood: '#d3dcc8', water: '#d2e0e8', case: '#cfd2c6', road: '#f1f2ec', hcase: '#ddd2ae', hroad: '#f4ead0', rail: '#c3c5bb', text: '#9fa595' };
const SR_M = { motorway: 24, hwy51: 14, major: 11, minor: 8, link: 6, _: 4.5 }, SR_FI = { motorway: 0, hwy51: 1, major: 1, minor: 2, link: 3, _: 3 };
const srClsW = (add, floors) => { const at = (f) => ['match', ['get', 'c'], ...['motorway', 'hwy51', 'major', 'minor', 'link'].flatMap(k => [k, f(k)]), f('_')];
  return ['interpolate', ['exponential', 2], ['zoom'], 14, at(k => Math.max(floors[SR_FI[k]], (SR_M[k] + add) * PXM14)),
    17, at(k => (SR_M[k] + add) * PXM14 * 8), 22, at(k => (SR_M[k] + add) * PXM14 * 256)]; };
const srLay = (k) => ['==', ['get', 'l'], k];
function surroundLayers() {
  return [
    { id: 'sr-trees', type: 'fill', source: 'surround', filter: srLay('land'), paint: { 'fill-pattern': 'sr-trees', 'fill-opacity': 0.55 } },
    { id: 'sr-wood', type: 'fill', source: 'surround', filter: srLay('wood'), paint: { 'fill-color': SR.wood } },
    { id: 'sr-wood-trees', type: 'fill', source: 'surround', filter: srLay('wood'), paint: { 'fill-pattern': 'sr-wood', 'fill-opacity': 0.6 } },
    { id: 'sr-water', type: 'fill', source: 'surround', filter: srLay('water'), paint: { 'fill-color': SR.water } },
    { id: 'sr-stream', type: 'line', source: 'surround', filter: srLay('stream'), paint: { 'line-color': SR.water, 'line-width': 1.5 } },
    { id: 'sr-rail', type: 'line', source: 'surround', filter: srLay('rail'), paint: { 'line-color': SR.rail, 'line-width': 1.2, 'line-dasharray': [3, 2] } },
    { id: 'sr-road-case', type: 'line', source: 'surround', filter: srLay('road'), layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': ['match', ['get', 'c'], 'hwy51', SR.hcase, SR.case], 'line-width': srClsW(1.5, [3.2, 2.6, 1.8, 1.2]) } },
    { id: 'sr-road', type: 'line', source: 'surround', filter: srLay('road'), layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': ['match', ['get', 'c'], 'hwy51', SR.hroad, SR.road], 'line-width': srClsW(0, [2.2, 1.8, 1.1, 0.6]) } },
    { id: 'sr-edge', type: 'line', source: 'surround', filter: srLay('edge'), layout: { 'line-join': 'round' },
      paint: { 'line-color': 'rgba(70,92,52,0.30)', 'line-width': 7, 'line-blur': 5 } },
    { id: 'sr-label', type: 'symbol', source: 'surround', filter: ['all', srLay('road'), ['has', 'n']], minzoom: 15.5,
      layout: { 'symbol-placement': 'line', 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Regular'], 'text-size': 10, 'symbol-spacing': 400, 'text-max-angle': 30, 'text-padding': 4 },
      paint: { 'text-color': SR.text, 'text-halo-color': SR.grass, 'text-halo-width': 1 } },
  ];
}
// scattered faded trees as a repeating canvas pattern (deterministic layout, two sizes; no asset file)
function srPattern(size, n, seed, rMin, rMax) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d');
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const cx = rnd() * size, cy = rnd() * size, r = rMin + rnd() * (rMax - rMin), tone = rnd();
    for (const [ox, oy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {   // wrap so tiles seam cleanly
      x.fillStyle = 'rgba(120,140,104,0.35)'; x.beginPath(); x.arc(cx + ox + r * 0.25, cy + oy + r * 0.25, r, 0, 7); x.fill();
      x.fillStyle = tone < 0.5 ? '#bccab0' : '#c5d1b9'; x.beginPath(); x.arc(cx + ox, cy + oy, r, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.22)'; x.beginPath(); x.arc(cx + ox - r * 0.3, cy + oy - r * 0.3, r * 0.45, 0, 7); x.fill();
    }
  }
  return x.getImageData(0, 0, size, size);
}
const SR_IMG = { 'sr-trees': () => srPattern(192, 9, 7, 3.5, 6), 'sr-wood': () => srPattern(96, 22, 11, 3.5, 6.5) };
const srSource = { type: 'geojson', data: 'surround.geojson', attribution: '© OpenStreetMap contributors' };
// <<< SURROUND-DEF
function basemapLayers(sat) {
  const L = [];
  if (!sat) {
    L.push({ id: 'bm-campus', type: 'fill', source: 'basemap', filter: lay('campus'), paint: { 'fill-color': LAWN } });
    L.push({ id: 'bm-pitch', type: 'fill', source: 'basemap', filter: lay('pitch'), paint: { 'fill-color': FIELD, 'fill-outline-color': '#7c9f5c' } });
    L.push({ id: 'bm-parking', type: 'fill', source: 'basemap', filter: lay('parking'), paint: { 'fill-color': ['match', ['get', 'kind'], 'asphalt', '#3d4148', PAVE], 'fill-outline-color': ['match', ['get', 'kind'], 'asphalt', '#2c2f34', '#b4b7a8'] } });
    L.push({ id: 'bm-water', type: 'fill', source: 'basemap', filter: lay('water'), paint: { 'fill-color': '#a8cbe6' } });
  } else {
    L.push({ id: 'bm-mask', type: 'fill', source: 'basemap', filter: lay('mask'), paint: { 'fill-color': '#1d2431', 'fill-opacity': 1 } });
  }
  // sidewalks (2 m) in both styles: light walk on the lawn, translucent white over the imagery
  L.push({ id: 'bm-path', type: 'line', source: 'basemap', filter: lay('path'), layout: { 'line-join': 'round' },
    paint: { 'line-color': sat ? '#ffffff' : '#f3f2ea', 'line-width': mw(0, 0.7), 'line-opacity': sat ? 0.55 : 1 } });
  // W58-WALKAREA >>>
  // #58 walks as one unioned concrete polygon (2026-10-12): seamless joins + the SE junction plaza; asphalt lots stay dark in satellite too
  L.push({ id: 'bm-walkarea', type: 'fill', source: 'basemap', filter: lay('walkarea'), paint: { 'fill-color': sat ? '#ffffff' : '#f3f2ea', 'fill-opacity': sat ? 0.55 : 1, 'fill-outline-color': sat ? 'rgba(255,255,255,.6)' : '#d4d2c6' } });
  if (sat) L.push({ id: 'bm-parking-sat', type: 'fill', source: 'basemap', filter: ['all', lay('parking'), ['==', ['get', 'kind'], 'asphalt']], paint: { 'fill-color': '#3d4148', 'fill-opacity': 0.35 } });
  // <<< W58-WALKAREA
  // LANDMARK mockup 2026-10-09: Seal Plaza brick circle (flat fallback; landmarks.js draws the herringbone + medallion on top)
  if (!sat) L.push({ id: 'bm-plaza', type: 'fill', source: 'basemap', filter: lay('plaza'), paint: { 'fill-color': '#b0604a', 'fill-outline-color': '#e3dfd3' } });
  const casing = sat ? 'rgba(20,24,32,.55)' : '#a7aa9b';
  L.push({ id: 'bm-road-case', type: 'line', source: 'basemap', filter: lay('road'), layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': casing, 'line-width': mw(0, byCls({ minor: 2.4, service: 1.6, _: 1 })), 'line-opacity': sat ? 0.6 : 1 } });
  // NWDR-ENTRANCE layers (2026-10-09) >>>
  // Paved areas traced curb-to-curb (Northwest Dr entrance boulevard, slip lanes, bulb-outs): a 0.8 m casing on the outline
  // (same edge colour as the road lines), then the fill above every road casing so road lines inside it read as one surface.
  if (!sat) {
    L.push({ id: 'bm-roadarea-case', type: 'line', source: 'basemap', filter: lay('roadarea'), layout: { 'line-join': 'round' }, paint: { 'line-color': casing, 'line-width': mw(0, 0.6) } });
    L.push({ id: 'bm-roadarea', type: 'fill', source: 'basemap', filter: lay('roadarea'), paint: { 'fill-color': '#e6e7de' } });
  }
  // <<< NWDR-ENTRANCE layers
  L.push({ id: 'bm-road', type: 'line', source: 'basemap', filter: lay('road'), layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': sat ? '#ffffff' : '#e6e7de', 'line-width': mw(-1, byCls({ minor: 1.6, service: 1, _: 0.6 })), 'line-opacity': sat ? 0.45 : 1 } });
  L.push({ id: 'bm-conn-case', type: 'line', source: 'basemap', filter: lay('connector'), layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': ['match', ['get', 'cls'], 'hwy51', '#b2852a', '#b8963e'], 'line-width': mw(0, byCls({ hwy51: 8, _: 7.5 })) } });   // floor raised (was 4.5/4.2 px) so the in-road name fits when zoomed out
  L.push({ id: 'bm-conn', type: 'line', source: 'basemap', filter: lay('connector'), layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': ['match', ['get', 'cls'], 'hwy51', '#f4c95d', '#f8db8a'], 'line-width': mw(-1.6, byCls({ hwy51: 6.6, _: 6 })) } });   // floor raised (was 3.2/3 px)
  if (!sat) {   // roundabout island + entrance islands (lawn) with the roundabout's mountable apron ring
    L.push({ id: 'bm-apron', type: 'fill', source: 'basemap', filter: lay('apron'), paint: { 'fill-color': '#d3d0c2', 'fill-outline-color': '#a7aa9b' } });
    L.push({ id: 'bm-island', type: 'fill', source: 'basemap', filter: lay('island'), paint: { 'fill-color': ['match', ['get', 'kind'], 'planter', '#a65a42', 'brick', '#b5654c', 'hatch', '#d6d7cd', LAWN], 'fill-outline-color': '#a7aa9b' } });
  // NWDR-ENTRANCE2 >>>
    // raised curbs around medians / islands that carry `curb` (light concrete, true width w), and crosswalks (zebra = dashed bars)
    L.push({ id: 'bm-island-curb', type: 'line', source: 'basemap', filter: ['all', lay('island'), ['==', ['get', 'curb'], true]], layout: { 'line-join': 'round' },
      paint: { 'line-color': '#f4f2ea', 'line-width': mw(0, 0.5) } });
    L.push({ id: 'bm-xwalk-band', type: 'line', source: 'basemap', filter: ['all', lay('xwalk'), ['==', ['get', 'kind'], 'band']], paint: { 'line-color': '#f6f5ef', 'line-width': mw(0, 1) } });
    L.push({ id: 'bm-xwalk-bg', type: 'line', source: 'basemap', filter: ['all', lay('xwalk'), ['==', ['get', 'kind'], 'zebra']], paint: { 'line-color': '#c9cbbf', 'line-width': mw(0, 1) } });
    L.push({ id: 'bm-xwalk', type: 'line', source: 'basemap', filter: ['all', lay('xwalk'), ['==', ['get', 'kind'], 'zebra']], paint: { 'line-color': '#ffffff', 'line-width': mw(-0.3, 1), 'line-dasharray': [0.25, 0.25] } });
    // painted markings: stall / hatch lines (white) and the yellow centre line
    L.push({ id: 'bm-mark', type: 'line', source: 'basemap', filter: ['all', lay('xwalk'), ['in', ['get', 'kind'], ['literal', ['mark', 'cline']]]], layout: { 'line-cap': 'butt' },
      paint: { 'line-color': ['match', ['get', 'kind'], 'cline', '#e2b93b', '#ffffff'], 'line-width': mw(0, 0.6) } });
  // <<< NWDR-ENTRANCE2
  }
  L.push({ id: 'bm-road-label', type: 'symbol', source: 'basemap', filter: ['all', lay('road'), ['!=', ['get', 'name'], '']], minzoom: 15.5,
    layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'symbol-spacing': 320, 'text-max-angle': 35 },
    paint: { 'text-color': sat ? '#ffffff' : '#4d5843', 'text-halo-color': sat ? 'rgba(0,0,0,.75)' : '#ffffff', 'text-halo-width': 1.4 } });
  // Road names for Wilson Dr / HWY 51 (2026-10-09): small text drawn INSIDE the road, along the road line, flat on the map and
  // rotated with it (replaces the pill badges + the second along-road label). Text size tracks the drawn road width (cap height
  // <= road fill at every zoom); spacing gives ~1-2 names per road on the phone default view and at least one per screen when zoomed in.
  L.push({ id: 'bm-conn-badge', type: 'symbol', source: 'basemap', filter: lay('connector'),
    layout: { 'symbol-placement': 'line', 'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 14, 250, 16, 300],
      'text-field': ['match', ['get', 'cls'], 'wilson', 'Wilson Dr', ['get', 'name']], 'text-font': ['Noto Sans Medium'],
      'text-size': ['interpolate', ['exponential', 2], ['zoom'], 14, 7, 16, 9.5, 17, 11, 18, 12],
      'text-rotation-alignment': 'map', 'text-pitch-alignment': 'map', 'text-keep-upright': true, 'text-max-angle': 30,
      'text-letter-spacing': ['match', ['get', 'cls'], 'hwy51', 0.06, 0.03], 'text-allow-overlap': false, 'text-padding': 2 },   // FINAL-PHASE: no overlapping road names
    paint: { 'text-color': ['match', ['get', 'cls'], 'hwy51', '#174f96', '#5b4a1c'],
      'text-halo-color': ['match', ['get', 'cls'], 'hwy51', '#f4c95d', '#f8db8a'], 'text-halo-width': 0.6 } });
  return L;
}
// rounded badge images for the connector-road labels (re-added on demand after every style switch)
function badge(fill, stroke) {
  const W = 40, H = 24, r = 7, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); x.fillStyle = fill; x.strokeStyle = stroke; x.lineWidth = 2;
  x.beginPath(); x.roundRect(1, 1, W - 2, H - 2, r); x.fill(); x.stroke();
  return { img: x.getImageData(0, 0, W, H), opt: { pixelRatio: 1, stretchX: [[8, 32]], stretchY: [[8, 16]], content: [6, 4, 34, 20] } };
}
const BADGES = { 'badge-hwy51': ['#1f5fae', '#ffffff'], 'badge-wilson': ['#fbe3a1', '#b99a4a'] };
map_onReady.push(m => m.on('styleimagemissing', e => { const b = BADGES[e.id]; if (!b || m.hasImage(e.id)) return; const q = badge(b[0], b[1]); m.addImage(e.id, q.img, q.opt); }));
// SURROUND-IMG >>>
map_onReady.push(m => m.on('styleimagemissing', e => { const f = SR_IMG[e.id]; if (f && !m.hasImage(e.id)) m.addImage(e.id, f(), { pixelRatio: 2 }); }));
// <<< SURROUND-IMG
const bmSource = { type: 'geojson', data: BASE || { type: 'FeatureCollection', features: [] }, attribution: '© OpenStreetMap contributors' };
const styleStreet = { version: 8, name: 'nwcc-campus-only', glyphs, sources: { basemap: bmSource, surround: srSource },   // SURROUND
  sky: { 'sky-color': '#cfdfec', 'horizon-color': '#e9eee4', 'sky-horizon-blend': 0.7, 'horizon-fog-blend': 0.9, 'fog-color': '#e3e9dc', 'fog-ground-blend': 0.9 },
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': OUTSIDE } }].concat(surroundLayers(), basemapLayers(false)) };
const styleSat = { version: 8, name: 'nwcc-sat-campus-only', glyphs,
  sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics', maxzoom: 19 }, basemap: bmSource },
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#1d2431' } }, { id: 'sat', type: 'raster', source: 'sat' }].concat(basemapLayers(true)) };
// keep panning near the campus (window = campus bbox + ~200 m; allow ~1 km of slack for tilted views)
const WIN = BASE_META.window || [[-89.9834, 34.6175], [-89.9664, 34.6297]];
const MAXB = [[WIN[0][0] - 0.011, WIN[0][1] - 0.009], [WIN[1][0] + 0.011, WIN[1][1] + 0.009]];

let view = null;
if (P.get('view')) { const v = P.get('view').split(',').map(Number); view = { center: [v[0], v[1]], zoom: v[2] || 17, pitch: v[3] ?? META.pitch, bearing: v[4] ?? META.bearing }; }
const map = new maplibregl.Map({
  container: 'map', style: styleStreet, center: view ? view.center : META.center, zoom: view ? view.zoom : META.zoom,
  pitch: view ? view.pitch : 0, bearing: view ? view.bearing : 0,  /* MOCKUP 2D default: open flat */
  maxPitch: 78, minZoom: 14, maxBounds: MAXB, maxZoom: 20.5, attributionControl: false, antialias: true, pixelRatio: Math.min(window.devicePixelRatio || 1, 2),   // FINAL-PHASE: DPR cap 2
  preserveDrawingBuffer: P.get('selftest') === '1'
});
map_onReady.forEach(f => f(map));
// COMPASS-ROSE >>>
// NORTHWEST compass rose (2026-10-09): replaces the +/- / compass group and the scale bar. The rose turns with the map
// (rotate(-bearing): its N always points to true north); tap = ease back to north, keeping centre, zoom and pitch.
class CompassRose {
  onAdd(m) {
    this._m = m;
    const c = this._el = document.createElement('div'); c.className = 'maplibregl-ctrl nw-compass-ctrl';
    const b = this._btn = document.createElement('button'); b.type = 'button'; b.className = 'nw-compass';
    b.setAttribute('aria-label', 'Compass: map faces north. Tap to reset to north'); b.title = 'Reset to north';
    const img = this._img = document.createElement('img'); img.src = 'assets/compass-rose.webp'; img.alt = ''; img.draggable = false; img.decoding = 'async';
    b.appendChild(img); c.appendChild(b);
    b.addEventListener('click', () => {
      m.easeTo({ bearing: 0, duration: 600 });                    // centre / zoom / pitch untouched
    });
    this._sync = () => {
      const br = m.getBearing(); img.style.transform = 'rotate(' + (-br) + 'deg)';
      const deg = Math.round(((br % 360) + 360) % 360), north = deg === 0 || deg === 360;
      b.classList.toggle('rotated', !north);
      b.setAttribute('aria-label', north ? 'Compass: map faces north' : 'Compass: map rotated ' + deg + '\u00b0. Tap to reset to north');
    };
    m.on('rotate', this._sync); this._sync();
    return c;
  }
  onRemove() { this._m.off('rotate', this._sync); this._el.remove(); }
}
map.addControl(new CompassRose(), 'bottom-right');
map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');   // was bottom-right under the zoom group
// <<< COMPASS-ROSE

let labelsOn = true, satOn = false, selKey = null, compare = false;

// ---------- Three.js custom layer ----------
let THREE = null, EXT = null, renderer = null, scene = null, camera = null, campus = null, selGroup = null, raycaster = null;
const groups = []; // building groups (pickable)
const extras = []; // unnumbered buildings (2026-10-09): drawn, not pickable, follow their category's visibility
const origin = maplibregl.MercatorCoordinate.fromLngLat(META.center, 0);
const S = origin.meterInMercatorCoordinateUnits();
function toEN(lng, lat) { const m = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], 0); return [(m.x - origin.x) / S, -(m.y - origin.y) / S]; }
function toLngLat(e, n) { return new maplibregl.MercatorCoordinate(origin.x + e * S, origin.y - n * S, 0).toLngLat(); }
let modelMatrix = null;

function buildScene() {
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  campus = new THREE.Group(); scene.add(campus);
  scene.add(new THREE.HemisphereLight(0xe6eeff, 0x7a6a58, 1.55));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.1); sun.position.set(-0.55, 1.0, 0.75); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbcd0ff, 0.45); fill.position.set(0.7, 0.4, -0.6); scene.add(fill);
  modelMatrix = new THREE.Matrix4().set(S, 0, 0, origin.x, 0, 0, S, origin.y, 0, S, 0, 0, 0, 0, 0, 1);
  raycaster = new THREE.Raycaster();
  for (const f of FC.features) {
    const p = f.properties, ex = p.ext;
    if (ex.arch === 'shared') continue;
    if (ex.pitches) ex.pitches.forEach(q => { q.ringEN = q.ring.map(c => toEN(c[0], c[1]));
      if (q.paint) q.paint.forEach(it => { it.en = it.r.map(r => r.map(c => toEN(c[0], c[1]))); }); });   // BASEBALL-42 paint (2026-10-09)
    if (ex.pitches) ex.pitches.forEach(q => { if (q.frame) q.frameEN = q.frame.map(c => toEN(c[0], c[1])); });   // FOOTBALL-41 image frame (2026-10-09)
    if (ex.roof_ring) ex.roofEN = ex.roof_ring.map(c => toEN(c[0], c[1])); // simplified roof outline for perimeter hips (2026-10-09)
    if (ex.roof_parts) ex.roof_partsEN = ex.roof_parts.map(r => r.map(c => toEN(c[0], c[1])));   // BLDG-31 hip sections (2026-10-09)
    const ring = f.geometry.coordinates[0].map(c => toEN(c[0], c[1]));
    ex.catColor = p.unnumbered ? null : (CATS[p.category] || {}).color;
    let g;
    try { g = EXT.build(ring, ex, p.key); } catch (err) { console.warn('build failed', p.key, err); continue; }
    if (p.unnumbered) { g.userData.category = p.category; g.traverse(o => { o.frustumCulled = false; }); campus.add(g); extras.push(g); continue; }
    g.userData.keys = [p.key].concat(ex.shares || []);
    g.userData.category = p.category;
    g.traverse(o => { o.frustumCulled = false; o.userData.bkey = p.key; });
    campus.add(g); groups.push(g);
  }
  buildTrees();
  // LANDMARK mockup 2026-10-09: entrance sign + Seal Plaza (landmarks.js), drawn with the campus, not pickable
  if (window.NWCCLandmarks) { try { campus.add(window.NWCCLandmarks(THREE, toEN, () => map.triggerRepaint())); } catch (err) { console.warn('landmarks failed', err); } }
  selGroup = new THREE.Group(); scene.add(selGroup);
  if (P.get('nomerge') !== '1') { let saved = 0; for (const g of campus.children) if (g.isGroup && g.name !== 'trees') saved += mergeStatic(g); window.__mergeSaved = saved; }   // FINAL-PHASE
}
// FINAL-PHASE (2026-10-12): merge static meshes per material inside each group -> far fewer draw calls. Geometry is baked into the
// group's frame; merged meshes stay children of their building group, so picking (hit -> parent keys) and visibility are unchanged.
function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), buckets = new Map(), drop = [];
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.geometry || o.geometry.morphAttributes.position || o.userData.noMerge) return;
    for (let p = o; p && p !== root; p = p.parent) if (!p.visible) return;
    const g0 = o.geometry; if (!g0.attributes.position || (g0.attributes.color && !Array.isArray(o.material) && o.material.vertexColors)) return;
    const M = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), mats = Array.isArray(o.material) ? o.material : [o.material];
    const g = g0.index ? g0.toNonIndexed() : g0, n = g.attributes.position.count;
    const ranges = (Array.isArray(o.material) && g.groups.length) ? g.groups.map(q => [q.start, Math.min(n, q.start + q.count), mats[q.materialIndex]]) : [[0, n, mats[0]]];
    for (const [s, e, mat] of ranges) { if (!mat || e <= s) continue;
      const k = mat.uuid + '|' + o.renderOrder; let b = buckets.get(k); if (!b) buckets.set(k, b = { mat, ro: o.renderOrder, parts: [], bkey: o.userData.bkey });
      b.parts.push({ g, s, e, M }); }
    drop.push(o);
  });
  if (drop.length < 2) return 0;
  for (const o of drop) o.parent.remove(o);
  const nm = new THREE.Matrix3(), v = new THREE.Vector3();
  for (const b of buckets.values()) {
    let N = 0; for (const q of b.parts) N += q.e - q.s;
    const pos = new Float32Array(N * 3), nor = new Float32Array(N * 3), uv = new Float32Array(N * 2); let w = 0;
    for (const q of b.parts) {
      const P = q.g.attributes.position, Nn = q.g.attributes.normal, U = q.g.attributes.uv, flip = q.M.determinant() < 0;
      nm.getNormalMatrix(q.M);
      for (let i = q.s; i < q.e; i++) {
        const j = flip ? (i - q.s) % 3 === 1 ? i + 1 : (i - q.s) % 3 === 2 ? i - 1 : i : i;   // mirrored: swap winding
        v.fromBufferAttribute(P, j).applyMatrix4(q.M); pos[w * 3] = v.x; pos[w * 3 + 1] = v.y; pos[w * 3 + 2] = v.z;
        if (Nn) { v.fromBufferAttribute(Nn, j).applyMatrix3(nm).normalize(); nor[w * 3] = v.x; nor[w * 3 + 1] = v.y; nor[w * 3 + 2] = v.z; }
        if (U) { uv[w * 2] = U.getX(j); uv[w * 2 + 1] = U.getY(j); }
        w++;
      }
    }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ge.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); ge.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    ge.computeBoundingSphere(); ge.computeBoundingBox();
    const m = new THREE.Mesh(ge, b.mat); m.renderOrder = b.ro; m.frustumCulled = false; m.userData.bkey = b.bkey; m.userData.merged = true; root.add(m);
  }
  const prune = o => { for (const c of o.children.slice()) { prune(c); if (c.isGroup && !c.children.length) o.remove(c); } }; prune(root);
  return drop.length - buckets.size;
}
// Low-poly campus trees (trees.js, tools/build_trees.py): instanced trunks, round or conifer canopies, soft ground shadows.
// Not pickable (not in `groups`), so taps still select buildings.
function buildTrees() {
  const T = (window.NWCC_TREES && window.NWCC_TREES.t) || []; if (!T.length) return;
  const trees = new THREE.Group(); trees.name = 'trees';
  const round = T.filter(t => !t[4]), conif = T.filter(t => t[4]);
  const trunkG = new THREE.CylinderGeometry(0.2, 0.3, 1, 6); trunkG.translate(0, 0.5, 0);
  const ballG = new THREE.IcosahedronGeometry(1, 1);
  const coneG = new THREE.ConeGeometry(1, 1, 7); coneG.translate(0, 0.5, 0);
  const shadowG = new THREE.CircleGeometry(1, 14); shadowG.rotateX(-Math.PI / 2);
  const lam = (c, flat) => new THREE.MeshLambertMaterial({ color: c, flatShading: !!flat });
  const LEAF = ['#5f9e4f', '#6aab58', '#77b562', '#58934c'], NEEDLE = ['#3f7a45', '#47844b', '#4f8d50', '#3a7040'];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
  const inst = (geo, mat, n) => { const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; trees.add(im); return im; };
  const trunks = inst(trunkG, lam('#7a5b3e'), T.length);
  const shadows = inst(shadowG, new THREE.MeshBasicMaterial({ color: 0x1d3318, transparent: true, opacity: 0.16, depthWrite: false }), T.length);
  const balls = inst(ballG, lam('#ffffff', true), round.length), cones = inst(coneG, lam('#ffffff', true), conif.length);
  const put = (im, i, x, y, z, sx, sy, sz) => { pos.set(x, y, z); scl.set(sx, sy, sz); m4.compose(pos, q, scl); im.setMatrixAt(i, m4); };
  let ib = 0, ic = 0;
  T.forEach((t, i) => {
    const [e, n] = toEN(t[0], t[1]), h = t[2], r = t[3], x = e, z = -n;
    put(shadows, i, x + r * 0.45, 0.06, z - r * 0.35, r * 1.15, 1, r * 1.0);
    if (t[4]) { // conifer: short trunk + tall cone
      put(trunks, i, x, 0, z, 1, 1.6, 1);
      put(cones, ic, x, 1.2, z, r, h - 1.2, r); cones.setColorAt(ic++, col.set(NEEDLE[t[5] % 4]));
    } else { // deciduous: trunk + slightly flattened round canopy
      const cy = Math.max(h - r * 0.95, 2.6);
      put(trunks, i, x, 0, z, 1, cy, 1);
      put(balls, ib, x, cy, z, r, r * 0.92, r); balls.setColorAt(ib++, col.set(LEAF[t[5] % 4]));
    }
  });
  [trunks, shadows, balls, cones].forEach(im => { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  shadows.renderOrder = -1; scene.add(trees);
}
function refreshVisibility() {
  groups.concat(extras).forEach(g => { g.visible = !!active[g.userData.category]; });
  if (campus) campus.visible = !compare;
}

// P2-HOLD >>>
// Flat Phase-2 placeholder buildings stay hidden until 3D is known to have failed (import error / no 3D frame in 10 s).
let first3D = false, p2Fallback = false;
const p2Vis = () => (compare || p2Fallback) ? 'visible' : 'none';
function applyP2() { ['p2-extrusion', 'p2-highlight'].forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', p2Vis())); }
function on3DFrame() { first3D = true; if (p2Fallback) { p2Fallback = false; applyP2(); } }
function p2Fail() { if (first3D) return; p2Fallback = true; applyP2(); bootCheck();   /* BOOT-COVER */ }
setTimeout(p2Fail, 10000);
// <<< P2-HOLD
// BOOT-COVER >>>
let bootLifted = false;
function liftBoot() { if (bootLifted) return; bootLifted = true; const c = document.getElementById('bootcover'); if (!c) return;
  requestAnimationFrame(() => { c.classList.add('off'); setTimeout(() => c.remove(), 320); }); }
// COVER-FIX: 'base map ready' = MapLibre's load event (style + initial tiles drawn). The old isStyleLoaded()/areTilesLoaded()
// test stayed false until idle because the app adds label sources after load (cover held ~3 s longer, sometimes to the timeout).
let baseReady = false;
function bootCheck() { if (bootLifted || !baseReady) return; if (first3D || p2Fallback) liftBoot(); }
map.on('render', bootCheck);   // cheap: returns at once after lift
map.once('load', () => { baseReady = true; bootCheck(); }); map.on('idle', () => { baseReady = true; bootCheck(); });
setTimeout(liftBoot, 10000);
// <<< BOOT-COVER
const layer3d = {
  id: 'nwcc-3d', type: 'custom', renderingMode: '3d',
  onAdd(m, gl) {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl });   // FINAL-PHASE: AA comes from the shared MapLibre context
      renderer.autoClear = false;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
  },
  render(gl, arg) {
    const mat = (arg && arg.length === 16) ? arg : (arg.defaultProjectionData ? arg.defaultProjectionData.mainMatrix : arg.modelViewProjectionMatrix);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(mat).multiply(modelMatrix);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    if (selGroup.children.length) {
      const pin = selGroup.getObjectByName('pin');
      if (pin) { const t = performance.now() / 1000; pin.position.y = pin.userData.y0 + Math.sin(t * 2.4) * 1.2; pin.rotation.y = t; }
    }
    renderer.resetState();
    renderer.render(scene, camera);
    if (!first3D) on3DFrame();   // P2-HOLD
    if (!bootLifted) bootCheck();   // BOOT-COVER
    if (selGroup.children.length) map.triggerRepaint();
  }
};

function pickAt(px, py) {
  if (!camera || compare) return null;
  const cv = map.getCanvas(), x = px / cv.clientWidth * 2 - 1, y = 1 - py / cv.clientHeight * 2;
  const a = new THREE.Vector3(x, y, -1).applyMatrix4(camera.projectionMatrixInverse);
  const b = new THREE.Vector3(x, y, 1).applyMatrix4(camera.projectionMatrixInverse);
  raycaster.set(a, b.sub(a).normalize());
  const hits = raycaster.intersectObjects(groups.filter(g => g.visible), true).filter(h => h.object.isMesh);
  if (!hits.length) return null;
  let o = hits[0].object; while (o && !o.userData.keys) o = o.parent;
  if (!o) return null;
  const keys = o.userData.keys;
  if (keys.length === 1) return keys[0];
  // shared footprint: choose the marker nearest the hit point
  const hp = hits[0].point, ll = toLngLat(hp.x, -hp.z);
  let best = keys[0], bd = 1e18;
  for (const k of keys) { const it = byKey[k]; if (!it) continue; const d = (it.lat - ll.lat) ** 2 + ((it.lng - ll.lng) * Math.cos(it.lat * Math.PI / 180)) ** 2; if (d < bd) { bd = d; best = k; } }
  return best;
}

function showSelection(key) {
  if (!THREE || !selGroup) return;
  while (selGroup.children.length) selGroup.remove(selGroup.children[0]);
  if (!key) { map.triggerRepaint(); return; }
  const g = groups.find(q => q.userData.keys.includes(key));
  const it = byKey[key];
  const yellow = new THREE.LineBasicMaterial({ color: 0xffd34d, depthTest: false, transparent: true });
  let top = 8, c = toEN(it.lng, it.lat);
  if (g && g.userData.ring) {
    const R = g.userData.ring; top = g.userData.topY || 8;
    if (g.userData.keys.length === 1 && g.userData.center) c = g.userData.center;
    const ext0 = featByKey[g.userData.keys[0]].properties.ext, H = (ext0.height) || top, pts = [];
    // SEL-PARTS (2026-10-12): multi-part landmark buildings outline each part at its own wall height
    const parts = ext0.sel_parts ? ext0.sel_parts.map(q => ({ R: q.ring.slice(0, -1).map(c => toEN(c[0], c[1])), H: q.h })) : [{ R, H }];
    for (const q of parts) for (let i = 0; i < q.R.length; i++) { const a = q.R[i], b = q.R[(i + 1) % q.R.length], h = q.H; pts.push(a[0], 0.3, -a[1], b[0], 0.3, -b[1], a[0], h + 0.2, -a[1], b[0], h + 0.2, -b[1], a[0], 0.3, -a[1], a[0], h + 0.2, -a[1]); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const ls = new THREE.LineSegments(lg, yellow); ls.renderOrder = 10; selGroup.add(ls);
    const halo = new THREE.Shape(EXT.offsetRing(R, 3).map(p => new THREE.Vector2(p[0], p[1])));
    const hg = new THREE.ShapeGeometry(halo); hg.rotateX(-Math.PI / 2); hg.translate(0, 0.08, 0);
    selGroup.add(new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.28, depthWrite: false })));
  } else if (g && g.userData.keys) { top = 2; }
  { const ft = featByKey[key]; if (ft && ft.properties.ext && ft.properties.ext.pin_top) top = ft.properties.ext.pin_top; }   // PRACTICE-49 (2026-10-09)
  const pin = new THREE.Group(); pin.name = 'pin';
  const pm = new THREE.MeshLambertMaterial({ color: 0xffc928, emissive: 0x553a00 });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 4), pm); cone.rotation.x = Math.PI; cone.position.y = 2.1; pin.add(cone);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12), pm); ball.position.y = 5.2; pin.add(ball);
  pin.position.set(c[0], top + 5, -c[1]); pin.userData.y0 = top + 5; pin.traverse(o => o.frustumCulled = false);
  selGroup.add(pin); selGroup.traverse(o => o.frustumCulled = false);
  map.triggerRepaint();
}

// ---------- MapLibre layers ----------
function catFilter() { return ['match', ['get', 'category'], ...Object.keys(active).filter(k => active[k]).flatMap(k => [k, true]), false]; }
function addLayers() {
  if (!map.getSource('buildings')) {
    map.addSource('buildings', { type: 'geojson', data: FC });
    if (BOUNDARY && BOUNDARY.length) {
      map.addSource('boundary', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [BOUNDARY.map(p => [p[1], p[0]])] } } });
      map.addLayer({ id: 'boundary-fill', type: 'fill', source: 'boundary', paint: { 'fill-color': '#f0c14a', 'fill-opacity': 0.05 } });
      map.addLayer({ id: 'boundary-line', type: 'line', source: 'boundary', paint: { 'line-color': '#f0c14a', 'line-width': 2, 'line-opacity': 0.7 } });
    }
    // Phase 2 comparison layer (hidden unless "P2" is on); also the fallback if Three.js fails to load.
    map.addLayer({ id: 'p2-extrusion', type: 'fill-extrusion', source: 'buildings',
      filter: ['all', catFilter(), ['!=', ['get', 'arch'], 'shared']],
      layout: { visibility: p2Vis() },
      paint: { 'fill-extrusion-color': ['match', ['get', 'category'], 'residence', '#2f6fd6', 'instructional', '#c8453a', 'athletic', '#2e8b57', 'support', '#c99a06', '#888'],
        'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.88 } });
    map.addLayer({ id: 'p2-highlight', type: 'fill-extrusion', source: 'buildings', filter: ['==', ['get', 'key'], selKey || ''],
      layout: { visibility: p2Vis() },
      paint: { 'fill-extrusion-color': '#ffffff', 'fill-extrusion-height': ['+', ['get', 'height'], 1.5], 'fill-extrusion-opacity': 0.55 } });
  }
  if (THREE && !map.getLayer('nwcc-3d')) map.addLayer(layer3d);
  if (!map.getSource('labels')) {
    map.addSource('labels', { type: 'geojson', data: { type: 'FeatureCollection', features: ITEMS.map(it => ({ type: 'Feature',
      properties: { key: it.key, label: it.label, name: it.name, category: it.category, lm: it.landmark ? 1 : 0, h: it.lab_h || 0, hk: it.lab_h || 0 }, geometry: { type: 'Point', coordinates: [it.lab_lng || it.lng, it.lab_lat || it.lat] } })) } });   // NUM-CENTER: visual centre of the footprint + roof height
  }
  // road-name badges (HWY 51 / Wilson Dr) sit above the 3D buildings so they are never hidden behind a roof
  if (map.getLayer('bm-conn-badge')) map.moveLayer('bm-conn-badge');
  addMainEntrance();   // MAIN-ENTRANCE
  if (map.getLayer('building-labels')) map.moveLayer('building-labels');
  else map.addLayer({ id: 'building-labels', type: 'symbol', source: 'labels', filter: catFilter(),
    layout: { 'text-field': ['concat', '#', ['get', 'label']],   // NO-LANDMARK-LABELS (2026-10-12): no gold ★ name labels on landmark buildings
      'text-size': 11, 'text-font': ['Noto Sans Regular'], 'text-anchor': 'center', 'text-offset': roofOffsetExpr(), 'text-padding': 3,   /* NUM-CENTER: lifted to the roof (ROOF-LIFT) */
      'text-max-width': 12, 'text-allow-overlap': false, visibility: labelsOn ? 'visible' : 'none' },
    paint: { 'text-color': '#ffffff', 'text-halo-color': '#0b1220', 'text-halo-width': 1.6 } });
}
// ROOF-LIFT >>> (2026-10-13) building numbers sit on the roof centre in 3D. The label point is the footprint's visual centre on the
// ground; text-offset lifts it by hk * K ems, where K = px per vertical metre at the screen centre (ppm * sin(pitch)) / text-size,
// updated live but only when zoom/pitch change >2% (pure pans re-set nothing), and hk = roof height * the label's own perspective
// factor (its px-per-metre vs the centre's, from the Three.js camera), refreshed once per moveend. Symbol collision works on the
// lifted positions; labels stay a fixed 11 px above the 3D layer.
let roofK = 0, roofT = 0;
function roofOffsetExpr() { return ['interpolate', ['linear'], ['get', 'hk'], 0, ['literal', [0, 0]], 100, ['literal', [0, -100 * roofK]]]; }
function roofUpdate() {
  if (!map.getLayer('building-labels')) return;
  const c = map.getCenter(), ppm = 512 * Math.pow(2, map.getZoom()) / (40075016.686 * Math.cos(c.lat * Math.PI / 180));
  const k = ppm * Math.sin(map.getPitch() * Math.PI / 180) / 11;
  if (Math.abs(k - roofK) <= Math.max(0.02 * Math.abs(roofK), 0.002)) return;
  roofK = k; map.setLayoutProperty('building-labels', 'text-offset', roofOffsetExpr());
}
function roofPersp() {   // per-label perspective factor, once the camera settles
  const src = map.getSource('labels'); if (!src || !camera || !camera.projectionMatrix) return;
  const P = camera.projectionMatrix, up = (e, n) => { const a = new THREE.Vector4(e, 0, -n, 1).applyMatrix4(P), b = new THREE.Vector4(e, 10, -n, 1).applyMatrix4(P);
    return a.w > 0 && b.w > 0 ? (a.y / a.w - b.y / b.w) : null; };
  const cc = map.getCenter(), ce = toEN(cc.lng, cc.lat), u0 = up(ce[0], ce[1]); if (!u0) return;
  const fc = { type: 'FeatureCollection', features: ITEMS.map(it => { const lng = it.lab_lng || it.lng, lat = it.lab_lat || it.lat, e = toEN(lng, lat), u = up(e[0], e[1]);
    const f = u ? Math.max(0.3, Math.min(3, -u / -u0)) : 1;
    return { type: 'Feature', properties: { key: it.key, label: it.label, name: it.name, category: it.category, lm: it.landmark ? 1 : 0, h: it.lab_h || 0, hk: Math.round((it.lab_h || 0) * f * 100) / 100 },
      geometry: { type: 'Point', coordinates: [lng, lat] } }; }) };
  src.setData(fc);
}
let roofRaf = 0; map.on('move', () => { if (!roofRaf) roofRaf = requestAnimationFrame(() => { roofRaf = 0; roofUpdate(); }); });
map.on('moveend', () => { roofUpdate(); clearTimeout(roofT); roofT = setTimeout(roofPersp, 60); });
map.on('styledata', () => { if (map.getLayer('building-labels')) roofUpdate(); });
// <<< ROOF-LIFT
function refreshFilter() {
  if (!map.getLayer('p2-extrusion')) return;
  map.setFilter('p2-extrusion', ['all', catFilter(), ['!=', ['get', 'arch'], 'shared']]);
  map.setFilter('building-labels', catFilter());
  refreshVisibility(); map.triggerRepaint();
}

// ---------- boot: load Three.js, then style ----------
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
const loadThree = () => location.protocol === 'file:' ? import(THREE_CDN)
  : import(new URL('vendor/three.module.min.js', location.href).href).catch(() => import(THREE_CDN));
let threeReady = loadThree().then(mod => {
  THREE = mod; EXT = window.NWCCExteriors(THREE); buildScene(); refreshVisibility();
}).catch(err => { console.error('Three.js failed to load; falling back to Phase 2 extrusions', err); p2Fail();   /* P2-HOLD */ { const t = document.getElementById('toast'); if (t) { t.textContent = '3D exteriors unavailable (Three.js failed to load). Showing Phase 2 extrusions.'; t.style.display = 'block'; } } /* NO-LOAD-SCREEN */ });

let styleLoaded = false;
map.on('style.load', () => { styleLoaded = true; addLayers(); refreshFilter(); applyLabels(); });
Promise.all([threeReady, new Promise(r => map.once('load', r))]).then(() => {
  addLayers(); refreshFilter();
  ['p2-extrusion', 'p2-highlight'].forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', p2Vis()));
  if (!view) home2D(false);
  syncTilt();
  if (P.get('flat') === '1' && map.getPitch() >= 5) document.getElementById('tTilt').click();
  if (P.get('tilt') === '1' && map.getPitch() < 5) document.getElementById('tTilt').click();  // MOCKUP: ?tilt=1 opens in 3D
  if (P.get('clean') === '1') document.querySelectorAll('.hud,.tools,.maplibregl-ctrl-bottom-right,.maplibregl-ctrl-bottom-left').forEach(e => e.style.display = 'none');
  if (P.get('nolabels') === '1') document.getElementById('tLabels').click();
  if (P.get('q')) { qEl.value = P.get('q'); search(); }
  const hash = location.hash.match(/b=([^&]+)/);
  if (hash) { const k = decodeURIComponent(hash[1]).toLowerCase(); if (byKey[k]) select(k, P.get('nofly') !== '1'); }
  if (P.get('selftest') === '1') setTimeout(selftest, 1500);
});


map.on('click', e => {
  const k = pickAt(e.point.x, e.point.y);
  if (k) { select(k, true); return; }
  if (compare) { const f = map.queryRenderedFeatures(e.point, { layers: ['p2-extrusion'] })[0]; if (f) select(f.properties.key, true); }
});
let hoverPending = false;
map.on('mousemove', e => {
  if (hoverPending) return; hoverPending = true;
  requestAnimationFrame(() => { hoverPending = false; map.getCanvas().style.cursor = pickAt(e.point.x, e.point.y) ? 'pointer' : ''; });
});

function fitCampus(animate) {
  // Frame the campus boundary (plus the Wilson Dr / HWY 51 edges). cameraForBounds ignores pitch, so add a
  // pitch allowance (the tilted view foreshortens the north-south extent) and nudge the center north.
  const bounds = new maplibregl.LngLatBounds();
  (BOUNDARY && BOUNDARY.length ? BOUNDARY.map(q => [q[1], q[0]]) : ITEMS.map(i => [i.lng, i.lat])).forEach(c => bounds.extend(c));
  const cam = map.cameraForBounds(bounds, { padding: 40, bearing: META.bearing });
  const c = bounds.getCenter();
  map.easeTo({ center: [c.lng + 0.0004, c.lat + 0.0004], zoom: Math.min(cam.zoom + (window.innerWidth < 720 ? 0.3 : 0.6), 17)  /* PWA: narrower phone screens get less extra zoom */, pitch: META.pitch, bearing: META.bearing, duration: animate ? 900 : 0 });
}
// MOCKUP 2D default (2026-10-09): flat, north-up, centred on the campus core (Alumni Dr / #55 Haraway / #54 McLendon /
// #42 baseball). Zoom = 2D fit of the campus boundary + a boost, so the core fills the screen but the whole box does not.
// Phone (<720 px) boost 0.75 = option A; ?z2d=B uses 1.25 (option B). Desktop boost 0.6. ?z2dzoom=<n> forces an absolute zoom.
const HOME2D_CENTER = [-89.9735, 34.6245];
const HOME2D_BOOST = { phoneA: 1.25, phoneB: 1.25, desktop: 0.6 };
function home2DZoom() {
  if (P.get('z2dzoom')) return +P.get('z2dzoom');
  const bounds = new maplibregl.LngLatBounds();
  (BOUNDARY && BOUNDARY.length ? BOUNDARY.map(q => [q[1], q[0]]) : ITEMS.map(i => [i.lng, i.lat])).forEach(c => bounds.extend(c));
  const cam = map.cameraForBounds(bounds, { padding: 20, bearing: 0 });
  const phone = window.innerWidth < 720;
  const boost = phone ? (P.get('z2d') === 'B' ? HOME2D_BOOST.phoneB : HOME2D_BOOST.phoneA) : HOME2D_BOOST.desktop;
  return Math.min(cam.zoom + boost, 18);
}
function home2D(animate) {
  map.easeTo({ center: HOME2D_CENTER, zoom: home2DZoom(), pitch: 0, bearing: 0, duration: animate ? 900 : 0 });
}
function syncTilt() { const t = document.getElementById('tTilt'), flat = map.getPitch() < 5; t.classList.toggle('on', !flat); t.textContent = flat ? '2D' : '3D'; }
function flyToItem(it, animate) {
  const lm = it.landmark;
  // PWA (phone): the info card sits at the bottom of the screen, so shift the target up into the visible area.
  const phone = window.innerWidth < 720 && card.classList.contains('show');
  const off = phone ? [0, -Math.min(card.offsetHeight, window.innerHeight * 0.6) / 2] : [0, 0];
  map.flyTo({ center: [it.lng, it.lat], offset: off, zoom: Math.max(map.getZoom(), lm ? 17.9 : 17.4), pitch: map.getPitch() < 5 ? 0 : Math.max(map.getPitch(), 55) /* MOCKUP: stay flat in 2D */, duration: animate ? 1000 : 0 });
}

// PHASE-WALK >>> (2026-10-12) blue dot, on-campus distance / walk time on cards, walking directions
const CAMPUS_RING = [[34.619471, -89.980023], [34.619471, -89.9686158], [34.6195293, -89.9686156], [34.6201377, -89.9686099], [34.6221589, -89.9686148], [34.6246406, -89.9686147], [34.6246718, -89.9686145], [34.6246718, -89.9675428], [34.6253637, -89.9675428], [34.6253637, -89.9678866], [34.6258204, -89.9678866], [34.6258204, -89.9686152], [34.6266639, -89.9686306], [34.6277464, -89.9686255], [34.6278259, -89.9719786], [34.6278402, -89.9726015], [34.6278399, -89.9735038], [34.6279222, -89.9767121], [34.6279593, -89.9787689], [34.6279896, -89.980023], [34.619471, -89.980023]].map(p => [p[1], p[0]]);   // boundary.json [lat,lng] -> [lng,lat]
function dirUrl(it) {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios ? `https://maps.apple.com/?daddr=${it.lat},${it.lng}&dirflg=w` : `https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}&travelmode=walking`;
}
const WALK = (() => {
  const R = 6371008.8, rad = Math.PI / 180, MARGIN = 60, SPEED = 1.34;
  let watchId = null, fix = null, state = 'off', cardIt = null, follow = false;   // state: off | asking | ok | denied | unavailable
  const dist = (a, b, c, d) => { const x = (d - b) * rad * Math.cos((a + c) / 2 * rad), y = (c - a) * rad; return Math.hypot(x, y) * R; };
  function inRing(lng, lat, ring) { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
  function edgeDist(lng, lat, ring) { let best = 1e18; const k = Math.cos(lat * rad) * rad * R, m = rad * R;
    for (let i = 0; i < ring.length - 1; i++) { const ax = (ring[i][0] - lng) * k, ay = (ring[i][1] - lat) * m, bx = (ring[i + 1][0] - lng) * k, by = (ring[i + 1][1] - lat) * m;
      const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1))); best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy)); } return best; }
  const onCampus = f => inRing(f.lng, f.lat, CAMPUS_RING) || edgeDist(f.lng, f.lat, CAMPUS_RING) <= MARGIN;
  // ---- map layers (one source, updated only when a position arrives)
  const EMPTY = { type: 'FeatureCollection', features: [] };
  const circleFC = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { k: 'acc' }, geometry: { type: 'Polygon', coordinates: [[]] } },
    { type: 'Feature', properties: { k: 'dot' }, geometry: { type: 'Point', coordinates: [0, 0] } }] };
  const ringC = circleFC.features[0].geometry.coordinates[0], N = 48;
  for (let i = 0; i <= N; i++) ringC.push([0, 0]);   // reused array, no reallocation per fix
  function ensureLayers() {
    if (!map.getSource('me')) map.addSource('me', { type: 'geojson', data: fix ? circleFC : EMPTY });
    if (!map.getLayer('me-acc')) {
      map.addLayer({ id: 'me-acc', type: 'fill', source: 'me', filter: ['==', ['get', 'k'], 'acc'], paint: { 'fill-color': '#2f7cf6', 'fill-opacity': 0.16 } });
      map.addLayer({ id: 'me-acc-line', type: 'line', source: 'me', filter: ['==', ['get', 'k'], 'acc'], paint: { 'line-color': '#2f7cf6', 'line-opacity': 0.5, 'line-width': 1 } });
      map.addLayer({ id: 'me-dot', type: 'circle', source: 'me', filter: ['==', ['get', 'k'], 'dot'],
        paint: { 'circle-radius': 7, 'circle-color': '#1a73e8', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-pitch-alignment': 'viewport' } });
    } else if (map.getStyle().layers.slice(-3).map(l => l.id).join() !== 'me-acc,me-acc-line,me-dot') ['me-acc', 'me-acc-line', 'me-dot'].forEach(id => map.moveLayer(id));
  }
  map.on('styledata', () => { if (map.isStyleLoaded() && (fix || map.getSource('me'))) ensureLayers(); });
  function draw() {
    ensureLayers();
    const r = Math.max(fix.acc, 3), k = 1 / (R * rad), kx = k / Math.cos(fix.lat * rad);
    for (let i = 0; i <= N; i++) { const a = i / N * 2 * Math.PI, p = ringC[i]; p[0] = fix.lng + Math.cos(a) * r * kx; p[1] = fix.lat + Math.sin(a) * r * k; }
    const d = circleFC.features[1].geometry.coordinates; d[0] = fix.lng; d[1] = fix.lat;
    map.getSource('me').setData(circleFC);
  }
  // ---- card line
  function fmtDist(m) { const ft = m * 3.28084; return ft < 1000 ? Math.max(10, Math.round(ft / 10) * 10) + ' ft' : (m / 1609.344).toFixed(ft < 5280 * 10 ? 2 : 1).replace(/0$/, '') + ' mi'; }
  function renderCard() {
    const el = document.getElementById('walkInfo'); if (!el || !cardIt) return;
    if (state !== 'ok' || !fix) { el.hidden = true; el.textContent = ''; return; }
    if (!onCampus(fix)) { el.hidden = false; el.className = 'walk off'; el.textContent = "You're off campus"; return; }
    const m = dist(fix.lat, fix.lng, cardIt.lat, cardIt.lng), min = Math.max(1, Math.round(m / SPEED / 60));
    el.hidden = false; el.className = 'walk'; el.innerHTML = `<b>${fmtDist(m)}</b> away · about ${min} min walk`;
  }
  const btn = () => document.getElementById('tLocate');
  function setBtn() { const b = btn(); if (b) { b.classList.toggle('on', state === 'ok'); b.classList.toggle('err', state === 'denied' || state === 'unavailable'); } }
  function start() {
    if (watchId !== null || state === 'denied') return;
    if (!('geolocation' in navigator)) { state = 'unavailable'; setBtn(); renderCard(); return; }
    state = 'asking';
    watchId = navigator.geolocation.watchPosition(p => {
      const first = !fix; fix = fix || {}; fix.lat = p.coords.latitude; fix.lng = p.coords.longitude; fix.acc = p.coords.accuracy || 20;
      state = 'ok'; setBtn(); draw(); renderCard();
      if (first && follow) { follow = false; recenter(); }
    }, e => {
      state = e.code === 1 ? 'denied' : 'unavailable'; setBtn(); renderCard();
      if (e.code === 1) { navigator.geolocation.clearWatch(watchId); watchId = null; fix = null; if (map.getSource('me')) map.getSource('me').setData(EMPTY); }
      if (follow && window.NWCC_PWA) NWCC_PWA.toast(e.code === 1 ? 'Location is turned off for this site.' : 'Your location is not available right now.');
      follow = false;
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
  }
  function recenter() {
    if (!fix) return;
    if (!onCampus(fix)) { if (window.NWCC_PWA) NWCC_PWA.toast("You're off campus"); return; }
    map.easeTo({ center: [fix.lng, fix.lat], zoom: Math.max(map.getZoom(), 17.5), duration: 700 });
  }
  function locate() { if (fix) recenter(); else { follow = true; start(); if (state === 'denied' && window.NWCC_PWA) NWCC_PWA.toast('Location is turned off for this site.'); } }
  return { onCard(it) { cardIt = it; renderCard(); start(); }, locate, _state: () => ({ state, fix: fix && { lat: fix.lat, lng: fix.lng, acc: fix.acc, onCampus: onCampus(fix) } }) };
})();
// <<< PHASE-WALK
const card = document.getElementById('card');
function select(key, animate) {
  if (key === '__me') { flyMainEntrance(); return; }   // MAIN-ENTRANCE
  const it = byKey[key]; if (!it) return;
  if (!active[it.category]) { active[it.category] = true; const chip = chipsEl.querySelector(`[data-k="${it.category}"]`); if (chip) chip.classList.remove('off'); refreshFilter(); }
  selKey = key;
  if (map.getLayer('p2-highlight')) map.setFilter('p2-highlight', ['==', ['get', 'key'], key]);
  showSelection(key); showCard(it); flyToItem(it, !!animate);
  history.replaceState(null, '', location.pathname + location.search + '#b=' + encodeURIComponent(key));
}
function showCard(it) { // card UI simplified 2026-10-08
  const c = CATS[it.category];
  const partsHtml = it.siblings && it.siblings.length ? `<div class="parts">${it.siblings.map(q => `<button class="${q.id.toLowerCase() === it.key ? 'cur' : ''}" data-k="${q.id.toLowerCase()}">${esc(q.label)}${q.name ? ' · ' + esc(q.name) : ''}</button>`).join('')}</div>` : '';
  const parent = it.parent_name ? `<div class="parent">#${it.number} · ${esc(it.parent_name)}</div>` : `<div class="parent">Building #${it.number}</div>`;
  const photoHtml = cardPhotoHtml(it);   // CARD-PHOTO
  card.innerHTML = `<div class="top"><div class="badge" style="--c:${c.color}">${esc(it.label)}</div>
    <div class="ttl"><h2>${esc(title(it))}</h2>${parent}</div>
    <button class="x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    ${photoHtml}
    <div class="body"><div class="meta"><span class="tag" style="--c:${c.color}"><i></i>${c.label}</span></div>
    ${partsHtml}
    <div class="walk" id="walkInfo" hidden></div>
    <a class="dir" target="_blank" rel="noopener" href="${dirUrl(it)}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 11.3 12.7 2.3a1 1 0 0 0-1.4 0l-9 9a1 1 0 0 0 0 1.4l9 9a1 1 0 0 0 1.4 0l9-9a1 1 0 0 0 0-1.4zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5L14 14.5z"/></svg>Directions</a></div>
    <div class="sheet-attrib">© OpenStreetMap contributors · MapLibre</div>`; // polished card markup (theme mockup 2026-10-08); notes paragraph removed 2026-10-08
  card.classList.add('show');
  card.querySelector('.x').onclick = closeCard;
  card.querySelectorAll('.parts button').forEach(bt => bt.onclick = () => select(bt.dataset.k, true));
  wirePhotos(it);   // CARD-PHOTO
  WALK.onCard(it);   // PHASE-WALK
}
// CARD-PHOTO >>>
// Building photos (2026-10-09, multi-photo 2026-10-11): an item's `photo` is one {src, srcset, full, w, h, fw, fh, alt, caption?}
// or an array of them. One photo = tappable banner; several = swipeable banner with dots (+ arrows on mouse devices).
// Tap = lightbox (prev/next, arrow keys, swipe).
const photoList = (it) => !it || !it.photo ? [] : Array.isArray(it.photo) ? it.photo : [it.photo];
const ZOOM_ICO = `<span class="zoom" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>`;
const CHEV = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
const photoImg = (p, it, i) => `<img src="${p.src}" ${p.srcset ? `srcset="${p.srcset}" sizes="(max-width: 719px) 100vw, 330px"` : ''} width="${p.w}" height="${p.h}" alt="${esc(p.alt || title(it))}"${p.pos ? ` style="object-position:${p.pos}"` : ''} loading="lazy" decoding="async"${i ? ' fetchpriority="low"' : ''}>`;
function cardPhotoHtml(it) {
  const L = photoList(it); if (!L.length) return '';
  if (L.length === 1) return `<button class="photo" type="button" aria-label="View larger photo of ${esc(title(it))}">${photoImg(L[0], it, 0)}${ZOOM_ICO}</button>`;
  return `<div class="photo multi" role="group" aria-roledescription="carousel" aria-label="${L.length} photos of ${esc(title(it))}">
    <div class="track">${L.map((p, i) => `<button class="slide" type="button" data-i="${i}" aria-label="View larger photo ${i + 1} of ${L.length}${p.caption ? ' (' + esc(p.caption) + ')' : ''}">${photoImg(p, it, i)}</button>`).join('')}</div>
    <button class="nav prev" type="button" aria-label="Previous photo">${CHEV(-1)}</button><button class="nav next" type="button" aria-label="Next photo">${CHEV(1)}</button>
    <div class="dots">${L.map((p, i) => `<button type="button" data-i="${i}" class="${i ? '' : 'on'}" aria-label="Show photo ${i + 1}${p.caption ? ' (' + esc(p.caption) + ')' : ''}"></button>`).join('')}</div>${ZOOM_ICO}</div>`;
}
function wirePhotos(it) {
  const ph = card.querySelector('.photo'); if (!ph) return;
  if (!ph.classList.contains('multi')) { ph.onclick = () => openLightbox(it, ph, 0); return; }
  const tr = ph.querySelector('.track'), dots = [...ph.querySelectorAll('.dots button')], n = dots.length;
  const cur = () => Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
  const go = (i, smooth = true) => tr.scrollTo({ left: ((i + n) % n) * tr.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  const sync = () => { const c = cur(); dots.forEach((d, j) => { d.classList.toggle('on', j === c); d.setAttribute('aria-current', j === c ? 'true' : 'false'); }); };
  tr.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  dots.forEach((d, j) => d.onclick = (e) => { e.stopPropagation(); go(j); });
  ph.querySelector('.prev').onclick = () => go(cur() - 1);
  ph.querySelector('.next').onclick = () => go(cur() + 1);
  ph.querySelectorAll('.slide').forEach(s => s.onclick = () => openLightbox(it, s, +s.dataset.i));
  ph._go = go;
}
let lbEl = null, lbReturn = null, lbIt = null, lbI = 0;
function openLightbox(it, from, i) {
  const L = photoList(it); if (!L.length) return; lbReturn = from || null; lbIt = it;
  if (!lbEl) {
    lbEl = document.createElement('div'); lbEl.id = 'lightbox'; lbEl.setAttribute('role', 'dialog'); lbEl.setAttribute('aria-modal', 'true');
    lbEl.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure>
      <button class="lbnav prev" type="button" aria-label="Previous photo">${CHEV(-1)}</button><button class="lbnav next" type="button" aria-label="Next photo">${CHEV(1)}</button>
      <button class="x" type="button" aria-label="Close photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
    document.body.appendChild(lbEl);
    lbEl.addEventListener('click', e => {
      if (e.target.closest('.lbnav')) { lbShow(lbI + (e.target.closest('.prev') ? -1 : 1)); return; }
      if (e.target === lbEl || e.target.closest('.x')) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (!lbEl.classList.contains('show')) return;
      if (e.key === 'Escape') { e.stopPropagation(); closeLightbox(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); lbShow(lbI + (e.key === 'ArrowLeft' ? -1 : 1)); }
    }, true);
    let x0 = null;
    lbEl.addEventListener('touchstart', e => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    lbEl.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) lbShow(lbI + (dx > 0 ? -1 : 1)); }, { passive: true });
  }
  lbShow(i || 0);
  lbEl.classList.add('show'); lbEl.querySelector('.x').focus();
}
function lbShow(i) {
  const L = photoList(lbIt), n = L.length; lbI = ((i % n) + n) % n; const p = L[lbI], it = lbIt;
  const img = lbEl.querySelector('img');
  img.removeAttribute('width'); img.removeAttribute('height');
  img.src = p.full || p.src; img.alt = p.alt || title(it); if (p.fw) { img.width = p.fw; img.height = p.fh; }
  if (n > 1) { const q = L[(lbI + 1) % n]; const pre = new Image(); pre.src = q.full || q.src; }   // warm the next one
  lbEl.querySelector('figcaption').textContent = title(it) + (p.caption ? ' · ' + p.caption : '') + (n > 1 ? `  (${lbI + 1} / ${n})` : '');
  lbEl.classList.toggle('multi', n > 1);
  lbEl.setAttribute('aria-label', 'Photo: ' + title(it) + (n > 1 ? `, ${lbI + 1} of ${n}` : ''));
}
function closeLightbox() {
  if (!lbEl) return; lbEl.classList.remove('show');
  const ph = card.querySelector('.photo.multi'); if (ph && ph._go) ph._go(lbI, false);
  const back = ph ? ph.querySelector(`.slide[data-i="${lbI}"]`) : lbReturn;
  if (back && document.body.contains(back)) back.focus({ preventScroll: true }); lbReturn = null;
}
// <<< CARD-PHOTO
function closeCard() {
  card.classList.remove('show'); selKey = null; showSelection(null);
  if (map.getLayer('p2-highlight')) map.setFilter('p2-highlight', ['==', ['get', 'key'], '']);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

// chips + landmarks
const chipsEl = document.getElementById('chips');
Object.keys(CATS).forEach(k => {
  const n = ITEMS.filter(i => i.category === k).length, el = document.createElement('button');
  el.className = 'chip'; el.dataset.k = k; el.innerHTML = `<span class="dot" style="background:${CATS[k].color}"></span>${CATS[k].label}<span class="cnt">${n}</span>`;
  el.onclick = () => { active[k] = !active[k]; el.classList.toggle('off', !active[k]); refreshFilter(); if (qEl.value) search(); };
  chipsEl.appendChild(el);
});
const lmEl = document.getElementById('lm');   // NO-LANDMARK-UI: row removed from index.html
if (lmEl) LANDMARKS.forEach(k => { const it = byKey[k]; if (!it) return; const b = document.createElement('button'); b.textContent = '#' + it.label; b.title = it.name; b.onclick = () => select(k, true); lmEl.appendChild(b); });

// search (same behavior as Phase 1/2)
const qEl = document.getElementById('q'), resEl = document.getElementById('results'), clr = document.getElementById('clr');
let act = -1, hits = [];
// MAIN-ENTRANCE >>>
// Campus main entrance (Alumni Dr at Wilson Dr): optional floating pin + label (symbol layer) and a search result.
const ME = (window.NWCC_LANDMARKS || {}).mainEntrance;
function meIcon() {   // navy map pin with a white gate glyph, drawn once at 2x
  const W = 56, H = 72, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(28, 68, 9, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#1f3b8a'; c.strokeStyle = '#ffffff'; c.lineWidth = 4;
  c.beginPath(); c.arc(28, 26, 22, Math.PI * 0.82, Math.PI * 2.18); c.lineTo(28, 66); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#ffffff';   // gate: two posts + arch
  c.fillRect(16, 18, 5, 20); c.fillRect(35, 18, 5, 20); c.fillRect(14, 37, 28, 3);
  c.beginPath(); c.moveTo(16, 19); c.quadraticCurveTo(28, 6, 40, 19); c.lineTo(40, 23); c.quadraticCurveTo(28, 11, 16, 23); c.closePath(); c.fill();
  return c.getImageData(0, 0, W, H);
}
function addMainEntrance() {
  if (!ME || !ME.labelOn || map.getLayer('me-label')) return;
  if (!map.hasImage('me-pin')) map.addImage('me-pin', meIcon(), { pixelRatio: 2 });
  if (!map.getSource('me')) map.addSource('me', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: ME.label } } });
  map.addLayer({ id: 'me-label', type: 'symbol', source: 'me', minzoom: ME.minzoom || 0,
    layout: { 'icon-image': 'me-pin', 'icon-anchor': 'bottom', 'icon-allow-overlap': true, 'text-allow-overlap': true, 'icon-ignore-placement': true,
      'text-field': 'Main Entrance', 'text-font': ['Noto Sans Medium'], 'text-size': 14, 'text-anchor': 'bottom', 'text-offset': [0, -3.0],
      'icon-pitch-alignment': 'viewport', 'text-pitch-alignment': 'viewport', 'icon-rotation-alignment': 'viewport', 'text-rotation-alignment': 'viewport' },
    paint: { 'text-color': '#1f3b8a', 'text-halo-color': '#ffffff', 'text-halo-width': 2.2 } });
  map.on('click', 'me-label', () => flyMainEntrance());
}
function flyMainEntrance() {
  if (!ME) return; try { closeCard(); } catch (e) {}
  const flat = map.getPitch() < 5;
  map.flyTo({ center: ME.label, zoom: 18.7, pitch: flat ? 0 : 58, bearing: flat ? 0 : 10, duration: 1400, essential: true });
}
const meHits = (q) => ME && q.length >= 3 && ['main entrance', 'entrance', 'front entrance', 'main gate', 'wilson'].some(s => s.includes(q) || q.includes(s)) ? [{ key: '__me', place: true }] : [];
const meLi = (it, i) => `<li role="option" class="${i === act ? 'act' : ''}" data-k="__me"><span class="pinb" style="background:#1f3b8a"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M5 21V9M19 21V9M4 9q8-7 16 0M4 21h16"/></svg></span><div><div class="n">Main Entrance</div><div class="s">Alumni Dr at Wilson Dr</div></div></li>`;
// <<< MAIN-ENTRANCE
function search() {
  const q = norm(qEl.value); act = -1;
  if (!q) { hits = []; resEl.classList.remove('show'); resEl.innerHTML = ''; return; }
  hits = ITEMS.filter(it => {
    const hay = norm([it.label, it.number, it.name, it.parent_name, CATS[it.category].label, it.notes].join(' '));
    return hay.includes(q) || ('#' + it.label).toLowerCase().includes(q) || String(it.number) === q.replace(/^#/, '');
  }).sort((a, b) => (String(b.number) === q.replace(/^#/, '')) - (String(a.number) === q.replace(/^#/, '')) || b.landmark - a.landmark).slice(0, 12);
  hits = meHits(q).concat(hits).slice(0, 12);   // MAIN-ENTRANCE
  resEl.classList.toggle('show', hits.length > 0);
  resEl.innerHTML = hits.map((it, i) => {
    if (it.place) return meLi(it, i);   // MAIN-ENTRANCE
    const c = CATS[it.category];
    return `<li role="option" class="${i === act ? 'act' : ''}" data-k="${it.key}"><span class="pinb" style="background:${c.color}">${esc(it.label)}</span>
      <div><div class="n">${esc(title(it))}</div><div class="s">${it.parent_name ? esc(it.parent_name) + ' · ' : ''}${c.label}${active[it.category] ? '' : ' (hidden)'}</div></div></li>`;
  }).join('');
  resEl.querySelectorAll('li').forEach(li => li.onclick = () => { select(li.dataset.k, true); qEl.value = ''; search(); });
  return hits;
}
qEl.addEventListener('input', search);
qEl.addEventListener('focus', () => { if (qEl.value) search(); });
qEl.addEventListener('keydown', e => {
  if (e.key === 'Escape') { qEl.value = ''; search(); closeCard(); return; }
  if (!hits.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); act = Math.min(act + 1, hits.length - 1); paintAct(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(act - 1, 0); paintAct(); }
  else if (e.key === 'Enter') { e.preventDefault(); select(hits[Math.max(act, 0)].key, true); qEl.value = ''; search(); }
});
function paintAct() { resEl.querySelectorAll('li').forEach((li, i) => li.classList.toggle('act', i === act)); }
clr.onclick = () => { qEl.value = ''; search(); qEl.focus(); };
document.addEventListener('click', e => { if (!e.target.closest('#searchwrap') && !e.target.closest('#results')) resEl.classList.remove('show'); });

// tools
document.getElementById('tHome').onclick = () => { closeCard(); if (map.getPitch() < 5) home2D(true); else fitCampus(true); };  // MOCKUP: Home keeps current 2D/3D mode
document.getElementById('tTilt').onclick = function () {
  const flat = map.getPitch() < 5;
  map.easeTo({ pitch: flat ? META.pitch : 0, bearing: flat ? META.bearing : 0, duration: 700 });
  this.classList.toggle('on', flat); this.textContent = flat ? '3D' : '2D';
};
function applyLabels() { if (map.getLayer('building-labels')) map.setLayoutProperty('building-labels', 'visibility', labelsOn ? 'visible' : 'none'); }
document.getElementById('tLocate').onclick = () => WALK.locate();   // PHASE-WALK
document.getElementById('tLabels').onclick = function () { labelsOn = !labelsOn; this.classList.toggle('on', labelsOn); applyLabels(); };
// P2 compare + satellite toggle buttons removed from UI 2026-10-08 (compare/satOn stay false).
// Orbit (slow auto-rotate) button removed 2026-10-10.
document.getElementById('tLabels').classList.add('on');
syncTilt();  // MOCKUP: button reflects the real (2D) start state

// ---------- self test (?selftest=1): search + 3D picking of each landmark ----------
function selftest() {
  const out = { search: {}, pick: {}, built: groups.length, three: !!THREE };
  for (const q of ['20', 'lafayette', 'library', 'coliseum', 'heindl', 'haraway', 'mclendon', 'mccormick', 'benton', '#22b', 'bookstore']) {
    qEl.value = q; const h = search() || []; out.search[q] = h.slice(0, 3).map(i => i.key);
  }
  qEl.value = ''; search();
  const keys = LANDMARKS.concat(['1a', '53', '62', '41']);
  for (const k of keys) {
    const it = byKey[k];
    map.jumpTo({ center: [it.lng, it.lat], zoom: 18.2, pitch: 45, bearing: 0 });
    map.redraw();
    const g = groups.find(q => q.userData.keys.includes(k));
    const c = (g && g.userData.center && g.userData.keys.length === 1) ? g.userData.center : toEN(it.lng, it.lat), y = g ? Math.min(3, (g.userData.topY || 3) * 0.5) : 0.1;
    const v = new THREE.Vector3(c[0], y, -c[1]).applyMatrix4(camera.projectionMatrix);
    const cv = map.getCanvas(), px = (v.x + 1) / 2 * cv.clientWidth, py = (1 - v.y) / 2 * cv.clientHeight;
    out.pick[k] = pickAt(px, py);
  }
  out.pass = Object.entries(out.pick).every(([k, v]) => v === k) && out.search['20'][0] === '20' && out.search['coliseum'][0] === '40';
  document.getElementById('selftest').textContent = JSON.stringify(out);
  document.title = 'SELFTEST ' + (out.pass ? 'PASS' : 'FAIL');
  fitCampus(false);
}
window.NWCC_APP = { map, pickAt, select, search, closeCard, fitCampus, walk: () => WALK._state(), stats: () => renderer ? { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, meshes: (() => { let n = 0; scene.traverse(o => { if (o.isMesh) n++; }); return n; })() } : null };
})();
