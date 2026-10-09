/* NWCC campus landmarks (mockup 2026-10-09): entrance monument sign on the Circle Dr lawn by HWY 51, and the
 * Seal Plaza (round herringbone-brick plaza with the bronze seal medallion) where the Circle Dr lawn walks meet.
 * Classic script like exteriors.js: window.NWCCLandmarks(THREE, toEN, onTexture) -> THREE.Group (not pickable).
 * Local frame as in exteriors.js: x = metres east, y = up, z = -metres north.
 * Locations: Esri z19 imagery (georeferenced, /workspace/road-check2) + Esri Wayback 2023 leaf-off + Brent's aerial.
 * Textures (assets/landmark-*.png|jpg) are pre-rendered by landmark-mockup/src_build/make_textures.py. */
window.NWCC_LANDMARKS = {
  // Entrance sign: centre of the monument; `bearing` = compass direction of the sign's long axis. Both aerials show the
  // roof/top of the sign elongated ~E-W (perpendicular to HWY 51) with its shadow thrown north, so the faces point
  // ~N and ~S (text on both faces; the "front" faces S toward the W Porter St / HWY 51 corner). Use 177 to make it parallel to HWY 51.
  sign: { lng: -89.9687777, lat: 34.6252052, bearing: 87 },
  // Seal Plaza: centre of the brick circle (brick field 8.0 m dia + 0.35 m concrete band) and its bronze medallion.
  plaza: { lng: -89.9690312, lat: 34.6255495, r: 4.0, band: 0.35, medallion: 0.9, bench: 40 }
};
window.NWCCLandmarks = function (THREE, toEN, onTexture) {
  'use strict';
  const L = window.NWCC_LANDMARKS, root = new THREE.Group(); root.name = 'landmarks';
  const loader = new THREE.TextureLoader();
  const tex = (url, srgb) => loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; onTexture && onTexture(); });
  const mats = {};
  const lam = (key, o) => mats[key] || (mats[key] = new THREE.MeshLambertMaterial(Object.assign({}, o)));
  const WHITE = lam('white', { color: '#fbfaf6', emissive: '#44443f' }), WHITE2 = lam('white2', { color: '#f0eee7', emissive: '#3a3a36' });
  function box(w, h, d, x, y, z, m) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y + h / 2, z); return o; }
  function cyl(r0, r1, h, x, y, z, m, seg) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, seg || 20), m); o.position.set(x, y + h / 2, z); return o; }
  function brickTex(cols) {   // small canvas brick texture for the planter curb
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32; const g = cv.getContext('2d');
    g.fillStyle = '#cfc6b6'; g.fillRect(0, 0, 128, 32);
    for (let r = 0; r < 4; r++) for (let x = -16; x < 128; x += 32) { g.fillStyle = cols[(r * 7 + x / 32 + 9) % cols.length | 0]; g.fillRect(x + (r % 2) * 16 + 1, r * 8 + 1, 30, 6); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  // ------------------------------------------------------------ entrance sign
  function buildSign() {
    const S = L.sign, g = new THREE.Group(); g.name = 'entrance-sign';
    const [e, n] = toEN(S.lng, S.lat);
    // landscaped base: low brick curb + mulch bed + a few clipped shrubs
    const bt = brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']); bt.repeat.set(6, 1);
    const brick = lam('brick', { map: bt }), mulch = lam('mulch', { color: '#5e4330' }), shrub = lam('shrub', { color: '#4f8a43', flatShading: true });
    const bedW = 5.8, bedD = 2.5, bedH = 0.16;
    g.add(box(bedW, bedH, bedD, 0, 0, 0, brick));
    g.add(box(bedW - 0.3, 0.012, bedD - 0.3, 0, bedH, 0, mulch));
    const sg = new THREE.IcosahedronGeometry(1, 1);
    [[-2.45, 0.75], [-2.45, -0.75], [2.45, 0.75], [2.45, -0.75], [-0.9, 0.95], [0.9, 0.95], [-0.9, -0.95], [0.9, -0.95]].forEach(([x, z], i) => {
      const s = new THREE.Mesh(sg, shrub); const r = 0.32 + (i % 3) * 0.05; s.scale.set(r, r * 0.8, r); s.position.set(x, bedH + r * 0.6, z); g.add(s); });
    // plinth
    const y0 = bedH;
    g.add(box(4.5, 0.2, 1.0, 0, y0, 0, WHITE2));
    // two Tuscan columns: square pedestal, torus-like base, tapered shaft, echinus + abacus capital (photo: ~3.2 m apart)
    const yP = y0 + 0.2, CX = 1.6, HS = 2.06;   // HS = shaft height
    for (const sx of [-1, 1]) {
      const x = sx * CX;
      g.add(box(0.66, 0.42, 0.66, x, yP, 0, WHITE)); g.add(box(0.72, 0.05, 0.72, x, yP + 0.42, 0, WHITE2));
      g.add(cyl(0.29, 0.29, 0.07, x, yP + 0.47, 0, WHITE2, 24)); g.add(cyl(0.26, 0.23, 0.07, x, yP + 0.54, 0, WHITE, 24));
      g.add(cyl(0.215, 0.185, HS, x, yP + 0.61, 0, WHITE, 24));
      g.add(cyl(0.195, 0.195, 0.05, x, yP + 0.61 + HS, 0, WHITE2, 24));
      g.add(cyl(0.195, 0.27, 0.1, x, yP + 0.66 + HS, 0, WHITE, 24));
      g.add(box(0.62, 0.1, 0.62, x, yP + 0.76 + HS, 0, WHITE2));
    }
    const yTop = yP + 0.86 + HS;   // top of the capitals = underside of the entablature
    // sign panel between the columns (upper part), lettered on both faces (assets/landmark-sign-panel.png)
    const PW = 2 * CX - 0.3, PH = 0.98, PD = 0.3, yPn = yTop - PH;
    g.add(box(PW, PH, PD, 0, yPn, 0, WHITE));
    g.add(box(PW + 0.04, 0.06, PD + 0.08, 0, yPn - 0.06, 0, WHITE2));   // sill
    const panelTex = tex('assets/landmark-sign-panel.png'); const pm = new THREE.MeshLambertMaterial({ map: panelTex, emissive: '#3c3c3a' });
    for (const sz of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.12, PH - 0.1), pm); p.position.set(0, yPn + PH / 2, sz * (PD / 2 + 0.004)); if (sz < 0) p.rotation.y = Math.PI; g.add(p); }
    // entablature: architrave, frieze, cornice
    g.add(box(2 * CX + 0.66, 0.16, 0.66, 0, yTop, 0, WHITE));
    g.add(box(2 * CX + 0.7, 0.16, 0.6, 0, yTop + 0.16, 0, WHITE2));
    g.add(box(2 * CX + 0.98, 0.08, 0.8, 0, yTop + 0.32, 0, WHITE)); g.add(box(2 * CX + 1.08, 0.08, 0.86, 0, yTop + 0.4, 0, WHITE2));
    const yC = yTop + 0.48;
    // pediment: triangular prism (tympanum) + raking cornices, navy seal disc on both faces
    const yT = yC, BW = 2 * CX + 0.9, PHt = 1.12, TD = 0.5;
    const tri = new THREE.Shape([new THREE.Vector2(-BW / 2, 0), new THREE.Vector2(BW / 2, 0), new THREE.Vector2(0, PHt)]);
    const pg = new THREE.ExtrudeGeometry(tri, { depth: TD, bevelEnabled: false }); pg.translate(0, 0, -TD / 2);
    const ped = new THREE.Mesh(pg, WHITE); ped.position.y = yT; g.add(ped);
    const slope = Math.atan2(PHt, BW / 2), rl = Math.hypot(PHt, BW / 2) + 0.16;
    for (const sx of [-1, 1]) {
      const rc = new THREE.Mesh(new THREE.BoxGeometry(rl, 0.13, 0.76), WHITE2);
      rc.position.set(sx * BW / 4 + sx * 0.03, yT + PHt / 2 + 0.06, 0); rc.rotation.z = -sx * slope; g.add(rc);
    }
    const sealTex = tex('assets/landmark-seal-navy.png');
    const sm = new THREE.MeshLambertMaterial({ map: sealTex, transparent: true, alphaTest: 0.4, emissive: '#151515' });
    for (const sz of [1, -1]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.33, 40), sm); d.position.set(0, yT + 0.42, sz * (TD / 2 + 0.006)); if (sz < 0) d.rotation.y = Math.PI; g.add(d); }
    g.userData.height = yT + PHt + 0.06;
    // place: long axis along `bearing`, front (+z local) faces bearing + 90
    g.rotation.y = (90 - S.bearing) * Math.PI / 180;
    g.position.set(e, 0, -n);
    // soft ground shadow: projected along the app's sun (app.js: sun.position (-0.55, 1, 0.75)) into a blurred canvas
    root.add(projectedShadow(g, new THREE.Vector3(-0.55, 1.0, 0.75)));
    return g;
  }
  function projectedShadow(obj, sunDir) {
    obj.updateMatrixWorld(true);
    const polys = [], v = new THREE.Vector3(), k = [sunDir.x / sunDir.y, sunDir.z / sunDir.y];
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    obj.traverse(o => {
      if (!o.isMesh || o.geometry.type === 'PlaneGeometry' || o.geometry.type === 'CircleGeometry') return;
      const pos = o.geometry.attributes.position, pts = [];
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); const p = [v.x - v.y * k[0], v.z - v.y * k[1]]; pts.push(p);
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }
      polys.push(hull2(pts));
    });
    const pad = 0.6; x0 -= pad; z0 -= pad; x1 += pad; z1 += pad;
    const R = 256, cv = document.createElement('canvas'); cv.width = cv.height = R; const c = cv.getContext('2d');
    const sx = R / (x1 - x0), sz = R / (z1 - z0);
    c.filter = 'blur(2px)'; c.fillStyle = '#fff';
    for (const P of polys) { c.beginPath(); P.forEach((p, i) => (i ? c.lineTo : c.moveTo).call(c, (p[0] - x0) * sx, (p[1] - z0) * sz)); c.closePath(); c.fill(); }
    const t = new THREE.CanvasTexture(cv);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ color: 0x1d3318, alphaMap: t, transparent: true, opacity: 0.3, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.05, (z0 + z1) / 2); m.renderOrder = -1;
    // PlaneGeometry rotated -90deg about x: uv v=0 lies at +z; default flipY maps v=0 to the canvas bottom row (= z1)
    return m;
  }
  function hull2(P) {
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }

  // ------------------------------------------------------------ seal plaza
  function buildPlaza() {
    const Pz = L.plaza, g = new THREE.Group(); g.name = 'seal-plaza';
    const [e, n] = toEN(Pz.lng, Pz.lat);
    const conc = lam('plaza-conc', { color: '#e3dfd3' });
    const ring = new THREE.Mesh(new THREE.RingGeometry(Pz.r - 0.02, Pz.r + Pz.band, 72), conc); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; g.add(ring);
    const ht = tex('assets/landmark-herringbone.jpg');   // texture spans the 8.0 m brick field (make_textures.py D = 8.0)
    const disc = new THREE.Mesh(new THREE.CircleGeometry(Pz.r, 72), new THREE.MeshLambertMaterial({ map: ht }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.055; g.add(disc);
    const md = new THREE.Mesh(new THREE.CircleGeometry(Pz.medallion, 64), new THREE.MeshLambertMaterial({ map: tex('assets/landmark-medallion.png'), transparent: true, alphaTest: 0.3 }));
    md.rotation.x = -Math.PI / 2; md.position.y = 0.07; g.add(md);
    // bench (black metal, slatted) at the plaza edge, facing the medallion
    if (Pz.bench != null) {
      const b = new THREE.Group(), blk = lam('bench', { color: '#2c2f34' }), slat = lam('bench-slat', { color: '#3a3e44' });
      for (let i = 0; i < 4; i++) b.add(box(1.8, 0.035, 0.1, 0, 0.44, -0.2 + i * 0.13, slat));
      for (let i = 0; i < 3; i++) { const s = box(1.8, 0.09, 0.03, 0, 0.56 + i * 0.13, -0.27, slat); s.rotation.x = -0.18; b.add(s); }
      for (const sx of [-0.82, 0.82]) { b.add(box(0.05, 0.44, 0.5, sx, 0, 0, blk)); b.add(box(0.05, 0.42, 0.05, sx, 0.46, -0.27, blk)); b.add(box(0.05, 0.04, 0.48, sx, 0.62, -0.02, blk)); }
      const a = Pz.bench * Math.PI / 180, rr = Pz.r + Pz.band + 0.5;
      b.position.set(Math.sin(a) * rr, 0, -Math.cos(a) * rr);
      b.rotation.y = -a;   // local +z (seat front) points back at the centre
      g.add(b);
    }
    g.position.set(e, 0, -n);
    return g;
  }

  root.add(buildSign()); root.add(buildPlaza());
  root.traverse(o => { o.frustumCulled = false; });
  return root;
};
