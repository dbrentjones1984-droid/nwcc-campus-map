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
const OUTSIDE = '#e8eae3';
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
function basemapLayers(sat) {
  const L = [];
  if (!sat) {
    L.push({ id: 'bm-campus', type: 'fill', source: 'basemap', filter: lay('campus'), paint: { 'fill-color': LAWN } });
    L.push({ id: 'bm-pitch', type: 'fill', source: 'basemap', filter: lay('pitch'), paint: { 'fill-color': FIELD, 'fill-outline-color': '#7c9f5c' } });
    L.push({ id: 'bm-parking', type: 'fill', source: 'basemap', filter: lay('parking'), paint: { 'fill-color': PAVE, 'fill-outline-color': '#b4b7a8' } });
    L.push({ id: 'bm-water', type: 'fill', source: 'basemap', filter: lay('water'), paint: { 'fill-color': '#a8cbe6' } });
  } else {
    L.push({ id: 'bm-mask', type: 'fill', source: 'basemap', filter: lay('mask'), paint: { 'fill-color': '#1d2431', 'fill-opacity': 1 } });
  }
  // sidewalks (2 m) in both styles: light walk on the lawn, translucent white over the imagery
  L.push({ id: 'bm-path', type: 'line', source: 'basemap', filter: lay('path'), layout: { 'line-join': 'round' },
    paint: { 'line-color': sat ? '#ffffff' : '#f3f2ea', 'line-width': mw(0, 0.7), 'line-opacity': sat ? 0.55 : 1 } });
  const casing = sat ? 'rgba(20,24,32,.55)' : '#a7aa9b';
  L.push({ id: 'bm-road-case', type: 'line', source: 'basemap', filter: lay('road'), layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': casing, 'line-width': mw(0, byCls({ minor: 2.4, service: 1.6, _: 1 })), 'line-opacity': sat ? 0.6 : 1 } });
  L.push({ id: 'bm-road', type: 'line', source: 'basemap', filter: lay('road'), layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': sat ? '#ffffff' : '#e6e7de', 'line-width': mw(-1, byCls({ minor: 1.6, service: 1, _: 0.6 })), 'line-opacity': sat ? 0.45 : 1 } });
  L.push({ id: 'bm-conn-case', type: 'line', source: 'basemap', filter: lay('connector'), layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': ['match', ['get', 'cls'], 'hwy51', '#b2852a', '#b8963e'], 'line-width': mw(0, byCls({ hwy51: 4.5, _: 4.2 })) } });
  L.push({ id: 'bm-conn', type: 'line', source: 'basemap', filter: lay('connector'), layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': ['match', ['get', 'cls'], 'hwy51', '#f4c95d', '#f8db8a'], 'line-width': mw(-1.6, byCls({ hwy51: 3.2, _: 3 })) } });
  if (!sat) {   // roundabout island + entrance islands (lawn) with the roundabout's mountable apron ring
    L.push({ id: 'bm-apron', type: 'fill', source: 'basemap', filter: lay('apron'), paint: { 'fill-color': '#d3d0c2', 'fill-outline-color': '#a7aa9b' } });
    L.push({ id: 'bm-island', type: 'fill', source: 'basemap', filter: lay('island'), paint: { 'fill-color': LAWN, 'fill-outline-color': '#a7aa9b' } });
  }
  L.push({ id: 'bm-road-label', type: 'symbol', source: 'basemap', filter: ['all', lay('road'), ['!=', ['get', 'name'], '']], minzoom: 15.5,
    layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'symbol-spacing': 320, 'text-max-angle': 35 },
    paint: { 'text-color': sat ? '#ffffff' : '#4d5843', 'text-halo-color': sat ? 'rgba(0,0,0,.75)' : '#ffffff', 'text-halo-width': 1.4 } });
  L.push({ id: 'bm-conn-badge', type: 'symbol', source: 'basemap', filter: lay('connector-label'),
    layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Medium'], 'text-size': ['match', ['get', 'cls'], 'hwy51', 14, 12],
      'icon-image': ['match', ['get', 'cls'], 'hwy51', 'badge-hwy51', 'badge-wilson'], 'icon-text-fit': 'both', 'icon-text-fit-padding': [3, 7, 3, 7],
      'text-letter-spacing': ['match', ['get', 'cls'], 'hwy51', 0.08, 0.02], 'icon-allow-overlap': true, 'text-allow-overlap': true },
    paint: { 'text-color': ['match', ['get', 'cls'], 'hwy51', '#ffffff', '#4a3a10'] } });
  L.push({ id: 'bm-conn-label', type: 'symbol', source: 'basemap', filter: lay('connector'), minzoom: 16.5,
    layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Medium'], 'text-size': ['match', ['get', 'cls'], 'hwy51', 14, 12.5],
      'text-letter-spacing': ['match', ['get', 'cls'], 'hwy51', 0.12, 0.04], 'symbol-spacing': 260, 'text-max-angle': 30, 'text-keep-upright': true },
    paint: { 'text-color': ['match', ['get', 'cls'], 'hwy51', '#5a3d00', '#5b4a1c'], 'text-halo-color': '#fff7df', 'text-halo-width': 2 } });
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
const bmSource = { type: 'geojson', data: BASE || { type: 'FeatureCollection', features: [] }, attribution: '© OpenStreetMap contributors (campus-only extract)' };
const styleStreet = { version: 8, name: 'nwcc-campus-only', glyphs, sources: { basemap: bmSource },
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': OUTSIDE } }].concat(basemapLayers(false)) };
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
  pitch: view ? view.pitch : META.pitch, bearing: view ? view.bearing : META.bearing,
  maxPitch: 78, minZoom: 14, maxBounds: MAXB, maxZoom: 20.5, attributionControl: true, canvasContextAttributes: { antialias: true }, antialias: true,
  preserveDrawingBuffer: P.get('selftest') === '1'
});
map_onReady.forEach(f => f(map));
map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
map.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

let labelsOn = true, satOn = false, selKey = null, compare = false, spin = false;

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
    if (ex.pitches) ex.pitches.forEach(q => { q.ringEN = q.ring.map(c => toEN(c[0], c[1])); });
    if (ex.roof_ring) ex.roofEN = ex.roof_ring.map(c => toEN(c[0], c[1])); // simplified roof outline for perimeter hips (2026-10-09)
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
  selGroup = new THREE.Group(); scene.add(selGroup);
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

const layer3d = {
  id: 'nwcc-3d', type: 'custom', renderingMode: '3d',
  onAdd(m, gl) {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true });
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
    if (selGroup.children.length || spin) map.triggerRepaint();
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
    const H = (featByKey[g.userData.keys[0]].properties.ext.height) || top, pts = [];
    for (let i = 0; i < R.length; i++) { const a = R[i], b = R[(i + 1) % R.length]; pts.push(a[0], 0.3, -a[1], b[0], 0.3, -b[1], a[0], H + 0.2, -a[1], b[0], H + 0.2, -b[1], a[0], 0.3, -a[1], a[0], H + 0.2, -a[1]); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const ls = new THREE.LineSegments(lg, yellow); ls.renderOrder = 10; selGroup.add(ls);
    const halo = new THREE.Shape(EXT.offsetRing(R, 3).map(p => new THREE.Vector2(p[0], p[1])));
    const hg = new THREE.ShapeGeometry(halo); hg.rotateX(-Math.PI / 2); hg.translate(0, 0.08, 0);
    selGroup.add(new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.28, depthWrite: false })));
  } else if (g && g.userData.keys) { top = 2; }
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
      layout: { visibility: (compare || !THREE) ? 'visible' : 'none' },
      paint: { 'fill-extrusion-color': ['match', ['get', 'category'], 'residence', '#2f6fd6', 'instructional', '#c8453a', 'athletic', '#2e8b57', 'support', '#c99a06', '#888'],
        'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.88 } });
    map.addLayer({ id: 'p2-highlight', type: 'fill-extrusion', source: 'buildings', filter: ['==', ['get', 'key'], selKey || ''],
      layout: { visibility: (compare || !THREE) ? 'visible' : 'none' },
      paint: { 'fill-extrusion-color': '#ffffff', 'fill-extrusion-height': ['+', ['get', 'height'], 1.5], 'fill-extrusion-opacity': 0.55 } });
  }
  if (THREE && !map.getLayer('nwcc-3d')) map.addLayer(layer3d);
  if (!map.getSource('labels')) {
    map.addSource('labels', { type: 'geojson', data: { type: 'FeatureCollection', features: ITEMS.map(it => ({ type: 'Feature',
      properties: { key: it.key, label: it.label, name: it.name, category: it.category, lm: it.landmark ? 1 : 0 }, geometry: { type: 'Point', coordinates: [it.lng, it.lat] } })) } });
  }
  // road-name badges (HWY 51 / Wilson Dr) sit above the 3D buildings so they are never hidden behind a roof
  if (map.getLayer('bm-conn-badge')) map.moveLayer('bm-conn-badge');
  if (map.getLayer('building-labels')) map.moveLayer('building-labels');
  else map.addLayer({ id: 'building-labels', type: 'symbol', source: 'labels', filter: catFilter(),
    layout: { 'text-field': ['case', ['==', ['get', 'lm'], 1], ['concat', '★ #', ['get', 'label'], '\n', ['get', 'name']], ['concat', '#', ['get', 'label']]],
      'text-size': ['case', ['==', ['get', 'lm'], 1], 12, 11], 'text-font': ['Noto Sans Regular'], 'text-anchor': 'bottom', 'text-offset': [0, -1.2],
      'text-max-width': 12, 'symbol-sort-key': ['-', 1, ['get', 'lm']], 'text-allow-overlap': false, visibility: labelsOn ? 'visible' : 'none' },
    paint: { 'text-color': ['case', ['==', ['get', 'lm'], 1], '#ffe6a3', '#ffffff'], 'text-halo-color': '#0b1220', 'text-halo-width': 1.6 } });
}
function refreshFilter() {
  if (!map.getLayer('p2-extrusion')) return;
  map.setFilter('p2-extrusion', ['all', catFilter(), ['!=', ['get', 'arch'], 'shared']]);
  map.setFilter('building-labels', catFilter());
  refreshVisibility(); map.triggerRepaint();
}

// ---------- boot: load Three.js, then style ----------
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const loadThree = () => location.protocol === 'file:' ? import(THREE_CDN)
  : import(new URL('vendor/three.module.js', location.href).href).catch(() => import(THREE_CDN));
let threeReady = loadThree().then(mod => {
  THREE = mod; EXT = window.NWCCExteriors(THREE); buildScene(); refreshVisibility();
}).catch(err => { console.error('Three.js failed to load; falling back to Phase 2 extrusions', err); document.getElementById('loading').textContent = '3D exteriors unavailable (Three.js failed to load). Showing Phase 2 extrusions.'; });

let styleLoaded = false;
map.on('style.load', () => { styleLoaded = true; addLayers(); refreshFilter(); applyLabels(); });
Promise.all([threeReady, new Promise(r => map.once('load', r))]).then(() => {
  addLayers(); refreshFilter();
  ['p2-extrusion', 'p2-highlight'].forEach(id => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', (compare || !THREE) ? 'visible' : 'none'));
  if (THREE) document.getElementById('loading').remove();
  if (!view) fitCampus(false);
  if (P.get('flat') === '1') document.getElementById('tTilt').click();
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
function flyToItem(it, animate) {
  const lm = it.landmark;
  // PWA (phone): the info card sits at the bottom of the screen, so shift the target up into the visible area.
  const phone = window.innerWidth < 720 && card.classList.contains('show');
  const off = phone ? [0, -Math.min(card.offsetHeight, window.innerHeight * 0.6) / 2] : [0, 0];
  map.flyTo({ center: [it.lng, it.lat], offset: off, zoom: Math.max(map.getZoom(), lm ? 17.9 : 17.4), pitch: Math.max(map.getPitch(), 55), duration: animate ? 1000 : 0 });
}

const card = document.getElementById('card');
function select(key, animate) {
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
  card.innerHTML = `<div class="top"><div class="badge" style="--c:${c.color}">${esc(it.label)}</div>
    <div class="ttl"><h2>${esc(title(it))}</h2>${parent}</div>
    <button class="x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
    <div class="body"><div class="meta"><span class="tag" style="--c:${c.color}"><i></i>${c.label}</span>${it.landmark ? '<span class="lmk">★ Landmark</span>' : ''}</div>
    ${partsHtml}
    <a class="dir" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${it.lat},${it.lng}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 11.3 12.7 2.3a1 1 0 0 0-1.4 0l-9 9a1 1 0 0 0 0 1.4l9 9a1 1 0 0 0 1.4 0l9-9a1 1 0 0 0 0-1.4zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5L14 14.5z"/></svg>Directions</a></div>
    <div class="sheet-attrib">© OpenStreetMap contributors · MapLibre</div>`; // polished card markup (theme mockup 2026-10-08); notes paragraph removed 2026-10-08
  card.classList.add('show');
  card.querySelector('.x').onclick = closeCard;
  card.querySelectorAll('.parts button').forEach(bt => bt.onclick = () => select(bt.dataset.k, true));
}
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
const lmEl = document.getElementById('lm');
LANDMARKS.forEach(k => { const it = byKey[k]; if (!it) return; const b = document.createElement('button'); b.textContent = '#' + it.label; b.title = it.name; b.onclick = () => select(k, true); lmEl.appendChild(b); });

// search (same behavior as Phase 1/2)
const qEl = document.getElementById('q'), resEl = document.getElementById('results'), clr = document.getElementById('clr');
let act = -1, hits = [];
function search() {
  const q = norm(qEl.value); act = -1;
  if (!q) { hits = []; resEl.classList.remove('show'); resEl.innerHTML = ''; return; }
  hits = ITEMS.filter(it => {
    const hay = norm([it.label, it.number, it.name, it.parent_name, CATS[it.category].label, it.notes].join(' '));
    return hay.includes(q) || ('#' + it.label).toLowerCase().includes(q) || String(it.number) === q.replace(/^#/, '');
  }).sort((a, b) => (String(b.number) === q.replace(/^#/, '')) - (String(a.number) === q.replace(/^#/, '')) || b.landmark - a.landmark).slice(0, 12);
  resEl.classList.toggle('show', hits.length > 0);
  resEl.innerHTML = hits.map((it, i) => {
    const c = CATS[it.category];
    return `<li role="option" class="${i === act ? 'act' : ''}" data-k="${it.key}"><span class="pinb" style="background:${c.color}">${esc(it.label)}</span>
      <div><div class="n">${esc(title(it))}${it.landmark ? ' ★' : ''}</div><div class="s">${it.parent_name ? esc(it.parent_name) + ' · ' : ''}${c.label}${active[it.category] ? '' : ' (hidden)'}</div></div></li>`;
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
document.getElementById('tHome').onclick = () => { closeCard(); fitCampus(true); };
document.getElementById('tTilt').onclick = function () {
  const flat = map.getPitch() < 5;
  map.easeTo({ pitch: flat ? META.pitch : 0, bearing: flat ? META.bearing : 0, duration: 700 });
  this.classList.toggle('on', flat); this.textContent = flat ? '3D' : '2D';
};
function applyLabels() { if (map.getLayer('building-labels')) map.setLayoutProperty('building-labels', 'visibility', labelsOn ? 'visible' : 'none'); }
document.getElementById('tLabels').onclick = function () { labelsOn = !labelsOn; this.classList.toggle('on', labelsOn); applyLabels(); };
// P2 compare + satellite toggle buttons removed from UI 2026-10-08 (compare/satOn stay false).
let spinRaf = null;
document.getElementById('tSpin').onclick = function () {
  spin = !spin; this.classList.toggle('on', spin);
  const step = () => { if (!spin) return; map.setBearing(map.getBearing() + 0.12); spinRaf = requestAnimationFrame(step); };
  if (spin) step(); else cancelAnimationFrame(spinRaf);
};
map.on('mousedown', () => { if (spin) document.getElementById('tSpin').click(); });
document.getElementById('tLabels').classList.add('on');
document.getElementById('tTilt').classList.add('on');

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
window.NWCC_APP = { map, pickAt, select, search, closeCard, fitCampus };
})();
