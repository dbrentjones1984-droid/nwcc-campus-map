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

  // NWDR-ENTRANCE build >>>
  function buildNwdr() {
    const N = L.nwdr, g = new THREE.Group(); g.name = 'nwdr-entrance';
    const bt = brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']);
    const brick = lam('nwdr-brick', { map: bt }), coping = lam('nwdr-cope', { color: '#ece7dc' }), copeB = lam('nwdr-copeb', { color: '#8a3c2b' });
    const lampM = lam('nwdr-lamp', { color: '#fffbe8', emissive: '#bdb48f' }), metal = lam('nwdr-metal', { color: '#2b2e33' });
    const mulch = lam('mulch', { color: '#5e4330' }), shrub = lam('shrub', { color: '#4f8a43', flatShading: true });
    const H = N.h, T = N.t;
    const seg = (a, b, y0, h, t, m, uvs) => {   // box from a to b (EN), brick UVs scaled to real size
      const dx = b[0] - a[0], dy = b[1] - a[1], Ls = Math.hypot(dx, dy); if (Ls < 0.02) return null;
      const geo = new THREE.BoxGeometry(Ls, h, t);
      if (uvs) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Ls / 0.8, uv.getY(i) * h / 0.3); }
      const o = new THREE.Mesh(geo, m); o.position.set((a[0] + b[0]) / 2, y0 + h / 2, -(a[1] + b[1]) / 2); o.rotation.y = Math.atan2(dy, dx); return o;
    };
    for (const W of N.walls) {
      const P = W.pts.map(c => toEN(c[0], c[1]));
      for (let i = 0; i < P.length - 1; i++) {
        const s = seg(P[i], P[i + 1], 0, H, T, brick, true); if (s) g.add(s);
        const c = seg(P[i], P[i + 1], H, 0.08, T + 0.1, i < W.white ? coping : copeB); if (c) g.add(c);
        if (i) { const j = new THREE.Mesh(new THREE.CylinderGeometry(T / 2, T / 2, H, 10), brick); j.position.set(P[i][0], H / 2, -P[i][1]); g.add(j);
          const jc = new THREE.Mesh(new THREE.CylinderGeometry(T / 2 + 0.05, T / 2 + 0.05, 0.08, 10), i < W.white ? coping : copeB); jc.position.set(P[i][0], H + 0.04, -P[i][1]); g.add(jc); }
      }
    }
    const lantern = (x, z, y) => { g.add(box(0.16, 0.12, 0.16, x, y, z, metal)); const s = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), lampM); s.position.set(x, y + 0.28, z); g.add(s); g.add(box(0.26, 0.05, 0.26, x, y + 0.46, z, metal)); };
    for (const c of N.posts) { const [x, y] = toEN(c[0], c[1]); const ph = H + 0.4;
      g.add(box(0.55, ph, 0.55, x, 0, -y, brick)); g.add(box(0.68, 0.09, 0.68, x, ph, -y, coping)); lantern(x, -y, ph + 0.09); }
    for (const c of N.piers) { const [x, y] = toEN(c[0], c[1]); const ph = 2.0;
      g.add(box(0.9, ph, 0.9, x, 0, -y, brick)); g.add(box(1.05, 0.12, 1.05, x, ph, -y, coping)); lantern(x, -y, ph + 0.12); }
    for (const r of N.planters) { const a = toEN(r[0][0], r[0][1]), b = toEN(r[1][0], r[1][1]);
      const w = Math.abs(b[0] - a[0]), d = Math.abs(b[1] - a[1]), cx = (a[0] + b[0]) / 2, cz = -(a[1] + b[1]) / 2;
      g.add(box(w, 0.45, d, cx, 0, cz, brick)); g.add(box(w - 0.4, 0.02, d - 0.4, cx, 0.45, cz, mulch));
      const sg = new THREE.IcosahedronGeometry(1, 1), n = Math.max(1, Math.round(d / 2.2));
      for (let k = 0; k < n; k++) { const s = new THREE.Mesh(sg, shrub), rr = Math.min(0.55, w / 2 - 0.35); s.scale.set(rr, rr * 0.8, rr); s.position.set(cx, 0.45 + rr * 0.6, cz - d / 2 + d * (k + 0.5) / n); g.add(s); } }
    // (no ground shadow for the entrance walls: it read as dark smudges on the lawn)
    // light poles are added after the shadow pass (a 7 m pole would cast a long blob)
    for (const c of (N.lamps || [])) { const [x, y] = toEN(c[0], c[1]);   // twin-arm median light poles (arms over each carriageway, E-W)
      g.add(box(0.36, 0.5, 0.36, x, 0, -y, coping));
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 7.2, 8), metal); pole.position.set(x, 3.6, -y); g.add(pole);
      g.add(box(3.4, 0.08, 0.08, x, 7.1, -y, metal));
      for (const sx of [-1.7, 1.7]) { g.add(box(0.62, 0.12, 0.26, x + sx, 6.98, -y, metal)); g.add(box(0.5, 0.04, 0.2, x + sx, 6.94, -y, lampM)); } }
    return g;
  }
  // <<< NWDR-ENTRANCE build
  // BASEBALL-42 build >>>
  // Jim Miles Field (#42): outfield wall, backstop net, dugouts, bleachers, covered grandstand + press box, scoreboard, batting cage,
  // bullpen pads and the small buildings around it. Simple low 3D; deliberately NO projected ground shadows.
  function buildBaseball() {
    const B = L.baseball, g = new THREE.Group(); g.name = 'jim-miles-field';
    const M = (k, c, o) => lam('bb-' + k, Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
    const conc = M('conc', '#d3cec3'), roofW = M('roofw', '#f4f3ee'), dark = M('dark', '#3b4046'), alu = M('alu', '#c9ced3'), alu2 = M('alu2', '#aeb4ba'),
      metal = M('metal', '#2d3136'), redF = M('redf', '#a3372f'), wallM = M('wall', '#2b4a3b'), wallTop = M('walltop', '#1f3a2c'), bench = M('bench', '#6d5a43'),
      net = M('net', '#20262a', { transparent: true, opacity: 0.22, depthWrite: false }), glass = M('glass', '#2b4a66'), pressM = M('press', '#ebe7dd');
    const EN = c => toEN(c[0], c[1]);
    const seg = (a, b, y0, h, t, m) => { const dx = b[0] - a[0], dy = b[1] - a[1], Ls = Math.hypot(dx, dy); if (Ls < 0.02) return null;
      const o = new THREE.Mesh(new THREE.BoxGeometry(Ls, h, t), m); o.position.set((a[0] + b[0]) / 2, y0 + h / 2, -(a[1] + b[1]) / 2); o.rotation.y = Math.atan2(dy, dx); return o; };
    const post = (p, h, r) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.06, r || 0.06, h, 6), metal); o.position.set(p[0], h / 2, -p[1]); return o; };
    const along = (P, step, fn) => { fn(P[0]); for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(Ls / step));
      for (let k = 1; k <= n; k++) fn([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } };
    // fences along the field
    for (const F of B.fences) {
      const P = F.pts.map(EN);
      for (let i = 0; i < P.length - 1; i++) {
        if (F.k === 'wall') { const s = seg(P[i], P[i + 1], 0, F.h, 0.3, wallM); if (s) { g.add(s); g.add(seg(P[i], P[i + 1], F.h, 0.08, 0.34, wallTop)); } }
        else { const s = seg(P[i], P[i + 1], 0, F.h, 0.03, net); if (s) { s.renderOrder = 2; g.add(s); }
          g.add(seg(P[i], P[i + 1], F.h - 0.06, 0.06, 0.06, metal));
          if (F.k === 'net') g.add(seg(P[i], P[i + 1], 0, 1.2, 0.3, wallM)); }
      }
      if (F.k === 'wall') { for (let i = 1; i < P.length - 1; i++) g.add(cyl(0.15, 0.15, F.h + 0.08, P[i][0], 0, -P[i][1], wallM, 10)); }
      else along(P, F.k === 'net' ? 5 : 3, p => g.add(post(p, F.h, F.k === 'net' ? 0.1 : 0.05)));
    }
    // flat pads (bullpen clay, cage turf)
    for (const D of B.pads) { const sh = new THREE.Shape(D.r.map(c => { const p = EN(c); return new THREE.Vector2(p[0], p[1]); }));
      const ge = new THREE.ShapeGeometry(sh); ge.rotateX(-Math.PI / 2); ge.translate(0, 0.07, 0); g.add(new THREE.Mesh(ge, M('pad' + D.c, D.c))); }
    // hip / gable roof over a w x d rectangle centred at the local origin, eaves at y
    function roofGeo(w, d, y, rise, kind) {
      const a = w / 2, b = d / 2, r = kind === 'gable' ? a : Math.max(0, a - b), V = [];
      const T = (p, q, s) => V.push(...p, ...q, ...s);
      const A = [-a, y, -b], Bq = [a, y, -b], Cq = [a, y, b], D = [-a, y, b], R1 = [-r, y + rise, 0], R2 = [r, y + rise, 0];
      T(A, Bq, R2); T(A, R2, R1); T(Cq, D, R1); T(Cq, R1, R2); T(Bq, Cq, R2); T(D, A, R1);
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(V, 3)); ge.computeVertexNormals(); return ge;
    }
    function sbTex() { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 200; const c = cv.getContext('2d');
      c.fillStyle = '#173526'; c.fillRect(0, 0, 512, 200); c.fillStyle = '#f2f0e6'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.fillText('JIM MILES FIELD', 256, 40);
      c.font = 'bold 20px sans-serif'; c.fillText('GUEST', 70, 80); c.fillText('HOME', 70, 130);
      for (let i = 0; i < 10; i++) { c.fillStyle = '#0b1a12'; c.fillRect(130 + i * 34, 62, 28, 28); c.fillRect(130 + i * 34, 112, 28, 28); }
      c.fillStyle = '#e8c547'; c.fillText('R  H  E', 440, 185);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }
    for (const S of B.parts) {
      const o = new THREE.Group(), [x, y] = EN(S.c); o.position.set(x, 0, -y); o.rotation.y = S.rot * Math.PI / 180; o.name = S.name;
      const w = S.w, d = S.d;
      if (S.t === 'dugout') {   // open front at local -z
        o.add(box(w, S.h, 0.3, 0, 0, d / 2 - 0.15, conc));
        for (const sx of [-1, 1]) o.add(box(0.3, S.h, d, sx * (w / 2 - 0.15), 0, 0, conc));
        o.add(box(w - 0.6, 0.04, d - 0.4, 0, 0, 0, dark)); o.add(box(w - 1.2, 0.45, 0.5, 0, 0, d / 2 - 0.6, bench));
        o.add(box(w + 0.5, 0.22, d + 0.5, 0, S.h, 0.1, roofW)); o.add(box(w, 0.08, 0.08, 0, 1.0, -d / 2 + 0.1, metal));
      } else if (S.t === 'block') {
        o.add(box(w, S.h, d, 0, 0, 0, M('blk' + S.col, S.col)));
        const rm = M('roof' + S.roofc, S.roofc);
        if (S.roof === 'flat') o.add(box(w + 0.3, 0.2, d + 0.3, 0, S.h, 0, rm));
        else { const ge = roofGeo(w + 0.8, d + 0.8, S.h, Math.min(w, d) * 0.22, S.roof); o.add(new THREE.Mesh(ge, rm)); }
      } else if (S.t === 'stand') {   // seats rise toward local +z (back); red end frames; optional roof + press box
        const n = S.rows, td = d / n;
        for (let i = 0; i < n; i++) o.add(box(w - 0.3, (i + 1) * S.rise, td, 0, 0, -d / 2 + td * (i + 0.5), i % 2 ? alu : alu2));
        const top = n * S.rise;
        for (const sx of [-1, 1]) o.add(box(0.15, top + 0.9, d, sx * (w / 2 - 0.08), 0, 0, redF));
        o.add(box(w, 0.08, 0.08, 0, top + 0.9, d / 2, metal));
        if (S.roof) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) o.add(box(0.25, S.roof, 0.25, sx * (w / 2 - 0.2), 0, sz * (d / 2 - 0.2), metal));
          o.add(new THREE.Mesh(roofGeo(w + 1.0, d + 1.0, S.roof, 1.6, 'hip'), M('pavroof', '#5d646c'))); }
        if (S.press) { const pw = w * 0.55, pd = 2.4, ph = 2.3, pz = d / 2 - pd / 2;
          o.add(box(pw, ph, pd, 0, top, pz, pressM)); o.add(box(pw - 0.6, 0.9, 0.05, 0, top + 1.0, pz - pd / 2 - 0.03, glass)); }
      } else if (S.t === 'scoreboard') {
        for (const sx of [-0.3, 0.3]) o.add(box(0.35, S.y0 + 0.2, 0.35, sx * w, 0, 0.15, metal));
        o.add(box(w, S.h, 0.45, 0, S.y0, 0, M('sbback', '#1b3a2b')));
        const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, S.h - 0.2), lam('bb-sbface', { map: sbTex(), side: THREE.FrontSide }));
        face.rotation.y = Math.PI; face.position.set(0, S.y0 + S.h / 2, -0.24); o.add(face);
      } else if (S.t === 'cage') {
        const P = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2], [-w / 2, -d / 2]];
        for (let i = 0; i < 4; i++) { const s = seg(P[i], P[i + 1], 0, S.h, 0.03, net); s.renderOrder = 2; o.add(s); o.add(seg(P[i], P[i + 1], S.h - 0.05, 0.05, 0.05, metal)); }
        along(P, 5, p => o.add(post(p, S.h, 0.06)));
        for (let k = 1; k < S.lanes; k++) { const yy = -d / 2 + d * k / S.lanes; const s = seg([-w / 2, yy], [w / 2, yy], 0, S.h, 0.03, net); s.renderOrder = 2; o.add(s); o.add(seg([-w / 2, yy], [w / 2, yy], S.h - 0.05, 0.05, 0.05, metal)); }
        const top = new THREE.Mesh(new THREE.PlaneGeometry(w, d), net); top.rotation.x = -Math.PI / 2; top.position.y = S.h; top.renderOrder = 2; o.add(top);
      } else if (S.t === 'bench') { o.add(box(w, S.h, d, 0, 0, 0, alu)); }
      g.add(o);
    }
    return g;
  }
  // <<< BASEBALL-42 build
  // FOOTBALL-41 build >>>
  // Football stadium (#41): stepped grandstands (seat rows as steps, aisles, front wall + rail, elevated press box), scoreboard,
  // blue jump/vault pads, star medallion + brick walk panels east of #47. Simple low 3D; deliberately NO projected ground shadows.
  function buildFootball() {
    const B = L.football, g = new THREE.Group(); g.name = 'football-stadium';
    const M = (k, c, o) => lam('fb-' + k, Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
    const conc = M('conc', '#d6d1c6'), dark = M('dark', '#3b4046'), metal = M('metal', '#2d3136'), white = M('white', '#f1f0eb'), glass = M('glass', '#2b4a66'), navy = M('navy', '#22336b');
    const EN = c => toEN(c[0], c[1]);
    for (const S of B.parts) {
      const o = new THREE.Group(), [x, y] = EN(S.c); o.position.set(x, 0, -y); o.rotation.y = S.rot * Math.PI / 180; o.name = S.name;
      const w = S.w, d = S.d;
      if (S.t === 'grand') {   // front at local -z; rows rise toward +z
        const n = S.rows, td = d / n, A = M('seat' + S.col, S.col), A2 = M('seat' + S.col2, S.col2), top = n * S.rise;
        o.add(box(w, 0.9, 0.3, 0, 0, -d / 2 - 0.15, conc));                              // front wall
        for (let i = 0; i < n; i++) o.add(box(w, 0.9 + (i + 1) * S.rise, td, 0, 0, -d / 2 + td * (i + 0.5), i % 2 ? A : A2));
        for (const a of (S.aisles || [])) for (let i = 0; i < n; i++) o.add(box(1.3, 0.9 + (i + 1) * S.rise + 0.03, td, a, 0, -d / 2 + td * (i + 0.5), white));
        o.add(box(w, top + 0.9, 0.35, 0, 0, d / 2 + 0.17, M('back', '#aab0b6')));          // back wall
        for (const sx of [-1, 1]) for (let i = 0; i < n; i++) o.add(box(0.3, 0.9 + (i + 1) * S.rise + 0.5, td, sx * (w / 2 + 0.15), 0, -d / 2 + td * (i + 0.5), conc)); // stepped end walls
        o.add(box(w, 0.06, 0.06, 0, 1.0 + 0.9, -d / 2 - 0.15, metal)); o.add(box(w, 0.06, 0.06, 0, top + 0.9 + 1.0, d / 2 + 0.17, metal));
        if (S.press) { const p = S.press, z = d / 2 + p.d / 2 + 0.35, y0 = top + 0.9;
          o.add(box(p.w, y0, p.d, p.off, 0, z, M('pbase', '#9aa0a6')));                   // support / stair core
          o.add(box(p.w, p.h, p.d, p.off, y0, z, M('press', '#ebe8e0')));
          o.add(box(p.w - 0.6, 1.1, 0.06, p.off, y0 + 1.1, z - p.d / 2 - 0.04, glass));
          o.add(box(p.w + 0.8, 0.25, p.d + 1.2, p.off, y0 + p.h, z - 0.3, white)); }
      } else if (S.t === 'block') {
        o.add(box(w, S.h, d, 0, 0, 0, M('blk' + S.col, S.col))); o.add(box(w + 0.3, 0.2, d + 0.3, 0, S.h, 0, M('roof' + S.roofc, S.roofc)));
      } else if (S.t === 'scoreboard') {
        for (const sx of [-0.3, 0.3]) o.add(box(0.4, S.y0 + 0.2, 0.4, sx * w, 0, 0.2, metal));
        o.add(box(w, S.h, 0.5, 0, S.y0, 0, navy));
        const cv = document.createElement('canvas'); cv.width = 512; cv.height = 216; const c = cv.getContext('2d');
        c.fillStyle = '#1c2b5c'; c.fillRect(0, 0, 512, 216); c.fillStyle = '#ffffff'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('NORTHWEST RANGERS', 256, 44);
        c.fillStyle = '#b3262e'; c.fillRect(0, 56, 512, 6); c.fillStyle = '#0b1230';
        for (const xx of [70, 190, 322, 442]) c.fillRect(xx - 46, 82, 92, 64);
        c.fillStyle = '#f0c040'; c.font = 'bold 18px sans-serif'; c.fillText('HOME', 70, 170); c.fillText('QTR', 190, 170); c.fillText('DOWN', 322, 170); c.fillText('GUEST', 442, 170);
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
        const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, S.h - 0.2), lam('fb-sbface', { map: t, side: THREE.FrontSide }));
        face.rotation.y = Math.PI; face.position.set(0, S.y0 + S.h / 2, -0.26); o.add(face);
      } else if (S.t === 'pad3d') { o.add(box(w, S.h, d, 0, 0, 0, M('pad' + S.col, S.col))); }
      g.add(o);
    }
    // flat: brick walk panels + star medallion
    const flat = (pts, y, m) => { const sh = new THREE.Shape(pts.map(c => { const p = EN(c); return new THREE.Vector2(p[0], p[1]); }));
      const ge = new THREE.ShapeGeometry(sh); ge.rotateX(-Math.PI / 2); ge.translate(0, y, 0); return new THREE.Mesh(ge, m); };
    const bricks = lam('fb-brick', { map: brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']) });
    for (const r of B.bricks) { const m = flat(r, 0.08, bricks); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 0.8, uv.getY(i) / 0.3); g.add(m); }
    if (B.medallion) { const [mx, my] = EN(B.medallion.c), r = B.medallion.r;
      const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
      c.fillStyle = '#d9d3c5'; c.beginPath(); c.arc(128, 128, 127, 0, 7); c.fill(); c.strokeStyle = '#a69f90'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.stroke();
      c.fillStyle = '#8f8a80'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 40 : 100; c.lineTo(128 + rr * Math.cos(a), 128 + rr * Math.sin(a)); } c.closePath(); c.fill();
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), lam('fb-medal', { map: t, transparent: true }));
      disc.rotation.x = -Math.PI / 2; disc.rotation.z = Math.PI / 2; disc.position.set(mx, 0.09, -my); g.add(disc); }
    return g;
  }
  // <<< FOOTBALL-41 build
  // SOFTBALL-45 build >>>
  // Ranger Field (softball, #45): outfield wall + foul poles, chain-link foul fences, backstop net, dugouts, bleachers, covered seating
  // behind home, LF-line shelters, RF bullpen. Simple low 3D; deliberately NO projected ground shadows.
  function buildSoftball() {
    const B = L.softball, g = new THREE.Group(); g.name = 'ranger-field';
    const M = (k, c, o) => lam('sb-' + k, Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
    const conc = M('conc', '#d3cec3'), roofW = M('roofw', '#f4f3ee'), dark = M('dark', '#3b4046'), alu = M('alu', '#c9ced3'), alu2 = M('alu2', '#aeb4ba'),
      metal = M('metal', '#2d3136'), redF = M('redf', '#a3372f'), wallM = M('wall', '#24452f'), wallTop = M('walltop', '#e2b23a'), bench = M('bench', '#6d5a43'),
      net = M('net', '#20262a', { transparent: true, opacity: 0.22, depthWrite: false }), chain = M('chain', '#1f2a24', { transparent: true, opacity: 0.3, depthWrite: false }),
      glass = M('glass', '#2b4a66'), pressM = M('press', '#ebe7dd'), yellow = M('yellow', '#f2c230');
    const EN = c => toEN(c[0], c[1]);
    const seg = (a, b, y0, h, t, m) => { const dx = b[0] - a[0], dy = b[1] - a[1], Ls = Math.hypot(dx, dy); if (Ls < 0.02) return null;
      const o = new THREE.Mesh(new THREE.BoxGeometry(Ls, h, t), m); o.position.set((a[0] + b[0]) / 2, y0 + h / 2, -(a[1] + b[1]) / 2); o.rotation.y = Math.atan2(dy, dx); return o; };
    const post = (p, h, r) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r || 0.06, r || 0.06, h, 6), metal); o.position.set(p[0], h / 2, -p[1]); return o; };
    const along = (P, step, fn) => { fn(P[0]); for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(Ls / step));
      for (let k = 1; k <= n; k++) fn([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } };
    for (const F of B.fences) {
      const P = F.pts.map(EN);
      for (let i = 0; i < P.length - 1; i++) {
        if (F.k === 'wall') { const s = seg(P[i], P[i + 1], 0, F.h, 0.25, wallM); if (s) { g.add(s); g.add(seg(P[i], P[i + 1], F.h, 0.12, 0.3, wallTop)); } }
        else { const s = seg(P[i], P[i + 1], 0, F.h, 0.03, F.k === 'chain' ? chain : net); if (s) { s.renderOrder = 2; g.add(s); }
          g.add(seg(P[i], P[i + 1], F.h - 0.06, 0.06, 0.06, metal));
          if (F.k === 'net') g.add(seg(P[i], P[i + 1], 0, 1.2, 0.3, wallM)); }
      }
      if (F.k === 'wall') { for (let i = 1; i < P.length - 1; i++) g.add(cyl(0.13, 0.13, F.h + 0.12, P[i][0], 0, -P[i][1], wallM, 10)); }
      else along(P, F.k === 'net' ? 4 : 3, p => g.add(post(p, F.h, F.k === 'net' ? 0.1 : 0.05)));
    }
    for (const c of (B.poles || [])) { const [x, y] = EN(c); g.add(cyl(0.12, 0.12, 9.0, x, 0, -y, yellow, 10)); }
    for (const D of B.pads) { const sh = new THREE.Shape(D.r.map(c => { const p = EN(c); return new THREE.Vector2(p[0], p[1]); }));
      const ge = new THREE.ShapeGeometry(sh); ge.rotateX(-Math.PI / 2); ge.translate(0, 0.07, 0); g.add(new THREE.Mesh(ge, M('pad' + D.c, D.c))); }
    function roofGeo(w, d, y, rise) {   // hip roof over a w x d rectangle centred at the local origin, eaves at y
      const a = w / 2, b = d / 2, r = Math.max(0, a - b), V = [], T = (p, q, s) => V.push(...p, ...q, ...s);
      const A = [-a, y, -b], Bq = [a, y, -b], Cq = [a, y, b], D = [-a, y, b], R1 = [-r, y + rise, 0], R2 = [r, y + rise, 0];
      T(A, Bq, R2); T(A, R2, R1); T(Cq, D, R1); T(Cq, R1, R2); T(Bq, Cq, R2); T(D, A, R1);
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(V, 3)); ge.computeVertexNormals(); return ge;
    }
    for (const S of B.parts) {
      const o = new THREE.Group(), [x, y] = EN(S.c); o.position.set(x, 0, -y); o.rotation.y = S.rot * Math.PI / 180; o.name = S.name;
      const w = S.w, d = S.d;
      if (S.t === 'dugout') {   // open front at local -z
        o.add(box(w, S.h, 0.3, 0, 0, d / 2 - 0.15, conc));
        for (const sx of [-1, 1]) o.add(box(0.3, S.h, d, sx * (w / 2 - 0.15), 0, 0, conc));
        o.add(box(w - 0.6, 0.04, d - 0.4, 0, 0, 0, dark)); o.add(box(w - 1.2, 0.45, 0.5, 0, 0, d / 2 - 0.6, bench));
        o.add(box(w + 0.5, 0.22, d + 0.5, 0, S.h, 0.1, roofW)); o.add(box(w, 0.08, 0.08, 0, 1.0, -d / 2 + 0.1, metal));
      } else if (S.t === 'block') {
        o.add(box(w, S.h, d, 0, 0, 0, M('blk' + S.col, S.col))); o.add(box(w + 0.3, 0.2, d + 0.3, 0, S.h, 0, M('roof' + S.roofc, S.roofc)));
      } else if (S.t === 'stand') {   // seats rise toward local +z (back); red end frames; optional roof + press box
        const n = S.rows, td = d / n;
        for (let i = 0; i < n; i++) o.add(box(w - 0.3, (i + 1) * S.rise, td, 0, 0, -d / 2 + td * (i + 0.5), i % 2 ? alu : alu2));
        const top = n * S.rise;
        for (const sx of [-1, 1]) o.add(box(0.15, top + 0.9, d, sx * (w / 2 - 0.08), 0, 0, redF));
        o.add(box(w, 0.08, 0.08, 0, top + 0.9, d / 2, metal));
        if (S.roof) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) o.add(box(0.25, S.roof, 0.25, sx * (w / 2 - 0.2), 0, sz * (d / 2 - 0.2), metal));
          o.add(new THREE.Mesh(roofGeo(w + 1.0, d + 1.0, S.roof, 1.2), M('pavroof', '#33476b'))); }
        if (S.press) { const pw = w * 0.6, pd = 2.2, ph = 2.2, pz = d / 2 - pd / 2;
          o.add(box(pw, ph, pd, 0, top, pz, pressM)); o.add(box(pw - 0.6, 0.9, 0.05, 0, top + 1.0, pz - pd / 2 - 0.03, glass)); }
      }
      g.add(o);
    }
    return g;
  }
  // <<< SOFTBALL-45 build
  // PRACTICE-49 build >>>
  // #49 covered practice facility: white portal-frame columns (navy base pads + blue up-lights), rafters, white fascia band + gable
  // end panels, low-pitch white roof, brick knee wall + black fence on the open sides, enclosed annexes, light poles.
  // The turf (with lines) is the #49 field cap from exteriors.js. Simple low 3D; deliberately NO projected ground shadows.
  function buildPractice() {
    const B = L.practice, g = new THREE.Group(); g.name = 'practice-facility';
    const M = (k, c, o) => lam('pf-' + k, Object.assign({ color: c, side: THREE.DoubleSide }, o || {}));
    const white = M('white', '#f3f3ef', { emissive: '#4a4a47' }), white2 = M('white2', '#e6e8e8', { emissive: '#222' }), under = M('under', '#b4b9bd', { emissive: '#4c5156', side: THREE.FrontSide }),
      navy = M('navy', '#1f2b48'), blue = new THREE.MeshBasicMaterial({ color: '#4d8dff' }), metal = M('metal', '#2a2e33'), pole = M('pole', '#4a4f55'),
      fence = M('fence', '#15181b', { transparent: true, opacity: 0.38, depthWrite: false }), glass = M('glass', '#2b4a66'), door = M('door', '#7d8288'), led = new THREE.MeshBasicMaterial({ color: '#f4f6ff' });
    const bt = brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']), brick = M('brick', '#ffffff', { map: bt }), brickCap = M('brickcap', '#c9c2b4');
    const ribCv = document.createElement('canvas'); ribCv.width = 64; ribCv.height = 8; const rc = ribCv.getContext('2d');
    rc.fillStyle = '#eef0f0'; rc.fillRect(0, 0, 64, 8); rc.fillStyle = '#d4d8da'; rc.fillRect(0, 0, 6, 8); rc.fillStyle = '#fafbfb'; rc.fillRect(6, 0, 3, 8);
    const ribT = new THREE.CanvasTexture(ribCv); ribT.wrapS = ribT.wrapT = THREE.RepeatWrapping; ribT.colorSpace = THREE.SRGBColorSpace;
    const panel = M('panel', '#ffffff', { map: ribT, emissive: '#3c3c3a' });
    const roofTop = M('rooftop', '#f5f5f1', { emissive: '#2a2a28', side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -60 });
    const EN = c => toEN(c[0], c[1]);
    // box with UVs in metres / tile (su x sv): faces +x,-x,+y,-y,+z,-z
    function boxT(w, h, d, x, y, z, m, su, sv) {
      const ge = new THREE.BoxGeometry(w, h, d), uv = ge.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / su, uv.getY(i) * dims[f][1] / sv); }
      const o = new THREE.Mesh(ge, m); o.position.set(x, y + h / 2, z); return o;
    }
    const seg = (a, b, y0, h, t, m) => { const dx = b[0] - a[0], dy = b[1] - a[1], Ls = Math.hypot(dx, dy); if (Ls < 0.02) return null;
      const o = new THREE.Mesh(new THREE.BoxGeometry(Ls, h, t), m); o.position.set((a[0] + b[0]) / 2, y0 + h / 2, -(a[1] + b[1]) / 2); o.rotation.y = Math.atan2(dy, dx); return o; };
    const segT = (a, b, y0, h, t, m, su, sv) => { const dx = b[0] - a[0], dy = b[1] - a[1], Ls = Math.hypot(dx, dy);
      const o = boxT(Ls, h, t, (a[0] + b[0]) / 2, y0, -(a[1] + b[1]) / 2, m, su, sv); o.rotation.y = Math.atan2(dy, dx); return o; };
    const [sw, ne] = B.main.map(EN), cx = (sw[0] + ne[0]) / 2, cz = -(sw[1] + ne[1]) / 2, W = ne[0] - sw[0], Lz = ne[1] - sw[1];
    const E = B.eave, BD = B.band, R = B.rise, hw = W / 2;
    const colM = [white, white, new THREE.MeshBasicMaterial({ visible: false }), white, white, white];
    // columns: 0.9 along the wall x 1.2 deep, haunch at the top, navy base pad, blue up-light on the outer face
    for (const c of B.cols) {
      const [x, y] = EN(c), s = c[2], alongX = (s === 'n' || s === 's'), o = new THREE.Group(); o.position.set(x, 0, -y);
      const cw = alongX ? 0.8 : 1.1, cd = alongX ? 1.1 : 0.8;
      o.add(box(cw, E + BD - 0.2, cd, 0, 0, 0, colM));
      o.add(box(alongX ? 0.9 : 2.0, 1.6, alongX ? 2.0 : 0.9, alongX ? 0 : (s === 'e' ? -0.4 : 0.4), E - 1.6, alongX ? (s === 'n' ? 0.4 : -0.4) : 0, white));
      o.add(box(cw + 0.2, 2.4, cd + 0.2, 0, 0, 0, navy));
      if (s !== 'w') { const out = s === 'e' ? [1, 0] : s === 'n' ? [0, 1] : [0, -1];
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.5), blue); pl.position.set(out[0] * (cw / 2 + 0.02), 3.3, -out[1] * (cd / 2 + 0.02));
        pl.rotation.y = Math.atan2(out[0], -out[1]) + Math.PI; o.add(pl); }
      g.add(o);
    }
    // rafters on every long-side column line (+ ridge beam), purlins
    // rafters / purlins are drawn as their undersides only (seen from the field / street): the 3D layer's depth slice is coarse, and from far above those faces bled through
    const hid = new THREE.MeshBasicMaterial({ visible: false }), raftM = [hid, hid, hid, M('raft', '#e9ebeb', { emissive: '#55585a', side: THREE.FrontSide }), hid, hid], purlM = [hid, hid, hid, under, hid, hid];   // underside faces only
    const yTop = E + BD - 1.1;   // rafters kept well under the roof slab (avoids depth fighting from far away)
    for (const c of B.cols.filter(q => q[2] === 'e')) {
      const z = -EN(c)[1];
      for (const sx of [-1, 1]) { const len = Math.hypot(hw, R), m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.45), raftM);
        m.position.set(cx + sx * hw / 2, yTop - 0.45 + R / 2, z); m.rotation.z = -sx * Math.atan2(R, hw); g.add(m); }
    }
    for (const t of [0.2, 0.45, 0.7, 0.95]) for (const sx of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, Lz), purlM); m.position.set(cx + sx * hw * (1 - t), yTop - 0.95 + R * t, cz); g.add(m); }
    // fascia band on the long sides; gable end panels (band + gable)
    for (const sx of [-1, 1]) g.add(boxT(0.35, BD, Lz + 0.35, cx + sx * (hw + 0.0), E, cz, panel, 1.2, BD));
    for (const sz of [-1, 1]) {
      const sh = new THREE.Shape([new THREE.Vector2(-hw - 0.17, E), new THREE.Vector2(hw + 0.17, E), new THREE.Vector2(hw + 0.17, E + BD), new THREE.Vector2(0, E + BD + R), new THREE.Vector2(-hw - 0.17, E + BD)]);
      const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: false }); const uv = ge.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.2, uv.getY(i) / 3);
      const m = new THREE.Mesh(ge, panel); m.position.set(cx, 0, cz + sz * Lz / 2 - 0.175); g.add(m);
    }
    // roof: two slabs, white top / gray underside
    for (const sx of [-1, 1]) {
      // top face pulled toward the camera (polygonOffset): the 3D layer's depth slice is coarse, rafters would bleed through from above
      const len = Math.hypot(hw, R) + 0.4, wf = M('whitef', '#f3f3ef', { emissive: '#4a4a47', side: THREE.FrontSide }), mats = [wf, wf, roofTop, under, wf, wf];
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.22, Lz + 0.7), mats.map(q => q));
      m.position.set(cx + sx * (hw / 2 + 0.1), E + BD + R / 2 + 0.11, cz); m.rotation.z = -sx * Math.atan2(R, hw); g.add(m);
    }
    g.add(box(0.5, 0.18, Lz + 0.7, cx, E + BD + R + 0.08, cz, roofTop));   // ridge cap
    // open sides: brick knee wall (0.9 m) + black fence to 3.0 m with top rail and posts
    for (const s of B.open) { const P = s.map(EN);
      for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1];
        g.add(segT(a, b, 0, 0.9, 0.35, brick, 0.8, 0.3)); g.add(seg(a, b, 0.9, 0.06, 0.42, brickCap));
        const f = seg(a, b, 0.96, 2.04, 0.03, fence); f.renderOrder = 2; g.add(f); g.add(seg(a, b, 2.96, 0.06, 0.06, metal));
        const Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(Ls / 3));
        for (let k = 0; k <= n; k++) { const px = a[0] + (b[0] - a[0]) * k / n, py = a[1] + (b[1] - a[1]) * k / n; g.add(cyl(0.04, 0.04, 2.1, px, 0.9, -py, metal, 6)); } } }
    // enclosed annexes: brick base 1.2 m, ribbed white panels, flat white roof + parapet; windows / door on the low annex
    for (const A of B.annex) {
      const [a, b] = [EN(A.sw), EN(A.ne)], w = b[0] - a[0], d = b[1] - a[1], x = (a[0] + b[0]) / 2, z = -(a[1] + b[1]) / 2;
      g.add(boxT(w + 0.1, 1.2, d + 0.1, x, 0, z, brick, 0.8, 0.3));
      g.add(boxT(w, A.h - 1.2, d, x, 1.2, z, panel, 1.2, A.h));
      g.add(box(w + 0.3, 0.12, d + 0.3, x, A.h, z, white)); g.add(box(w - 0.4, 0.04, d - 0.4, x, A.h + 0.12, z, M('roofw', '#f7f7f4')));
      if (A.win) {
        for (const ux of [-0.32, -0.12, 0.12]) g.add(box(2.0, 1.2, 0.06, x + ux * w, 2.2, z + d / 2 + 0.03, glass));
        g.add(box(1.8, 2.3, 0.06, x + 0.33 * w, 0, z + d / 2 + 0.03, door));
        for (const uz of [-0.25, 0.15]) g.add(box(0.06, 1.2, 2.0, x - w / 2 - 0.03, 2.2, z + uz * d, glass));
      }
    }
    // light poles (parking: single LED head; street: longer arm over Holder Dr)
    for (const P of B.poles) {
      const [x, y] = EN(P.c), o = new THREE.Group(); o.position.set(x, 0, -y); o.rotation.y = P.a * Math.PI / 180;
      o.add(cyl(0.3, 0.3, 0.5, 0, 0, 0, M('pbase', '#bdb8ad'), 10)); o.add(cyl(0.11, 0.09, P.h, 0, 0.5, 0, pole, 8));
      const arm = P.street ? 2.4 : 1.2; o.add(box(0.1, 0.1, arm, 0, P.h + 0.3, -arm / 2, pole)); o.add(box(0.45, 0.14, 0.8, 0, P.h + 0.2, -arm, pole));
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.65), led); l.rotation.x = Math.PI / 2; l.position.set(0, P.h + 0.19, -arm); o.add(l);
      g.add(o);
    }
    return g;
  }
  // <<< PRACTICE-49 build
  root.add(buildSign()); root.add(buildPlaza()); if (L.nwdr) root.add(buildNwdr()); if (L.baseball) root.add(buildBaseball()); if (L.football) root.add(buildFootball()); if (L.softball) root.add(buildSoftball()); if (L.practice) root.add(buildPractice());
  root.traverse(o => { o.frustumCulled = false; });
  return root;
};
/* NWDR-ENTRANCE data >>> */
// Northwest Dr entrance (by #50, off Wilson Dr): curved brick entrance walls + light posts, walk piers, median planter (2026-10-09).
// `white` = number of leading wall vertices with white coping; walls are densified Catmull-Rom curves traced on Brent's aerial.
window.NWCC_LANDMARKS.nwdr = {"walls":[{"pts":[[-89.9738885,34.6275966],[-89.9738823,34.627596],[-89.9738737,34.6275954],[-89.9738634,34.6275945],[-89.9738525,34.6275934],[-89.9738416,34.6275917],[-89.9738318,34.6275893],[-89.9738226,34.6275863],[-89.9738133,34.6275826],[-89.9738042,34.6275785],[-89.9737954,34.6275739],[-89.973787,34.6275691],[-89.9737794,34.627564],[-89.9737723,34.6275586],[-89.9737655,34.6275529],[-89.9737593,34.6275468],[-89.9737536,34.6275405],[-89.9737487,34.6275341],[-89.9737444,34.6275278],[-89.973741,34.6275217],[-89.9737384,34.6275155],[-89.9737364,34.6275094],[-89.973735,34.6275029],[-89.973734,34.6274962],[-89.9737335,34.6274889],[-89.9737334,34.6274808],[-89.9737337,34.6274717],[-89.9737345,34.6274623],[-89.9737358,34.6274531],[-89.9737376,34.6274446],[-89.9737401,34.6274374],[-89.9737432,34.6274316],[-89.9737472,34.6274267],[-89.9737517,34.6274226],[-89.9737565,34.627419],[-89.9737614,34.6274156],[-89.9737663,34.6274121],[-89.9737713,34.6274088],[-89.9737766,34.627406],[-89.9737821,34.6274034],[-89.9737875,34.6274008],[-89.9737924,34.6273977],[-89.9737968,34.627394],[-89.9738006,34.6273895],[-89.9738039,34.6273844],[-89.9738069,34.627379],[-89.9738096,34.6273734],[-89.973812,34.6273678],[-89.9738143,34.6273623],[-89.9738163,34.6273571],[-89.973818,34.6273518],[-89.9738195,34.6273465],[-89.9738208,34.6273412],[-89.9738219,34.627336],[-89.973823,34.6273307],[-89.9738241,34.6273254],[-89.973825,34.6273203],[-89.9738258,34.6273151],[-89.9738264,34.6273098],[-89.973827,34.6273045],[-89.9738274,34.627299],[-89.9738277,34.6272933],[-89.973828,34.6272874],[-89.9738281,34.6272815],[-89.973828,34.6272754],[-89.9738278,34.6272695],[-89.9738274,34.6272638],[-89.9738267,34.6272581],[-89.9738259,34.6272524],[-89.9738248,34.6272469],[-89.9738236,34.6272414],[-89.9738223,34.6272362],[-89.9738208,34.6272312],[-89.9738195,34.6272267],[-89.9738183,34.6272226],[-89.9738169,34.6272188],[-89.9738152,34.6272149],[-89.9738129,34.6272106],[-89.9738099,34.6272059],[-89.9738059,34.6272003],[-89.9738009,34.6271941],[-89.9737953,34.6271876],[-89.9737896,34.6271811],[-89.9737842,34.627175],[-89.9737794,34.6271697],[-89.973775,34.627165],[-89.9737706,34.6271606],[-89.9737665,34.6271566],[-89.9737629,34.6271531],[-89.9737598,34.6271502],[-89.9737575,34.627148]],"white":34},{"pts":[[-89.9732357,34.6275459],[-89.9732411,34.6275452],[-89.9732487,34.6275443],[-89.9732576,34.6275432],[-89.9732671,34.6275418],[-89.9732764,34.6275403],[-89.9732848,34.6275387],[-89.9732925,34.6275368],[-89.9733,34.6275346],[-89.9733074,34.6275322],[-89.9733146,34.6275297],[-89.9733216,34.6275274],[-89.9733285,34.6275251],[-89.9733352,34.6275232],[-89.9733418,34.6275216],[-89.9733482,34.6275201],[-89.9733544,34.6275184],[-89.9733606,34.6275162],[-89.9733667,34.6275134],[-89.973373,34.6275099],[-89.9733796,34.6275059],[-89.973386,34.6275014],[-89.9733921,34.6274967],[-89.9733974,34.6274916],[-89.9734017,34.6274862],[-89.9734047,34.6274805],[-89.9734067,34.6274743],[-89.9734079,34.6274678],[-89.9734088,34.6274612],[-89.9734095,34.6274546],[-89.9734104,34.6274483],[-89.9734117,34.627442],[-89.9734131,34.6274357],[-89.9734145,34.6274295],[-89.9734154,34.6274234],[-89.9734156,34.6274176],[-89.9734148,34.6274121],[-89.9734126,34.627407],[-89.9734093,34.6274022],[-89.9734052,34.6273977],[-89.9734008,34.6273934],[-89.9733966,34.6273892],[-89.9733929,34.6273849],[-89.9733897,34.6273809],[-89.9733865,34.6273771],[-89.9733834,34.6273734],[-89.9733805,34.6273697],[-89.9733778,34.6273657],[-89.9733755,34.6273614],[-89.9733734,34.6273567],[-89.9733716,34.6273516],[-89.97337,34.6273463],[-89.9733687,34.6273409],[-89.9733676,34.6273357],[-89.9733667,34.6273307],[-89.9733662,34.627326],[-89.973366,34.6273215],[-89.973366,34.6273172],[-89.9733662,34.6273128],[-89.9733664,34.6273083],[-89.9733667,34.6273036],[-89.9733671,34.6272985],[-89.9733675,34.6272931],[-89.973368,34.6272877],[-89.9733686,34.6272822],[-89.9733693,34.6272769],[-89.97337,34.6272719],[-89.9733706,34.6272672],[-89.9733712,34.6272628],[-89.9733718,34.6272586],[-89.9733727,34.6272543],[-89.9733738,34.6272501],[-89.9733755,34.6272457],[-89.9733777,34.6272411],[-89.9733805,34.6272364],[-89.9733837,34.6272317],[-89.973387,34.6272269],[-89.9733901,34.6272222],[-89.9733929,34.6272176],[-89.9733952,34.6272131],[-89.9733972,34.6272087],[-89.9733991,34.6272042],[-89.973401,34.6271999],[-89.9734033,34.6271956],[-89.973406,34.6271914],[-89.9734094,34.6271873],[-89.9734134,34.6271832],[-89.9734176,34.6271793],[-89.9734219,34.6271754],[-89.9734262,34.6271716],[-89.97343,34.6271679],[-89.9734338,34.6271641],[-89.9734376,34.6271603],[-89.9734414,34.6271565],[-89.9734448,34.627153],[-89.9734476,34.6271501],[-89.9734497,34.627148]],"white":40},{"pts":[[-89.9739125,34.6271263],[-89.9737663,34.6271236]],"white":0},{"pts":[[-89.9734431,34.6271254],[-89.9733143,34.6271254]],"white":0}],"posts":[[-89.9737946,34.6273958],[-89.9738241,34.6273343],[-89.9738274,34.6272638],[-89.9738077,34.627205],[-89.9738885,34.6275966],[-89.9739125,34.6271263],[-89.9733755,34.6273614],[-89.9733667,34.6273036],[-89.9733733,34.6272457],[-89.9734038,34.6271914],[-89.9732357,34.6275459],[-89.9733143,34.6271254]],"piers":[[-89.9737553,34.6271299],[-89.9734541,34.6271299]],"planters":[[[-89.9736222,34.62711],[-89.9735872,34.627186]],[[-89.9736222,34.6270549],[-89.9735872,34.6270738]],[[-89.9736855,34.6226958],[-89.973668,34.6228902]],[[-89.9737117,34.6226958],[-89.973692,34.6229038]],[[-89.9736855,34.6230666],[-89.973668,34.6231796]],[[-89.9737117,34.6230666],[-89.973692,34.6231796]]],"lamps":[[-89.9736287,34.6263947],[-89.9736246,34.6262816],[-89.9736156,34.6260067],[-89.9736145,34.6257878],[-89.9736135,34.6255871],[-89.9736035,34.6252669],[-89.9736028,34.6252054],[-89.9736001,34.6249612],[-89.9735971,34.6246899],[-89.973596,34.6244674]],"h":1.0,"t":0.4};
/* <<< NWDR-ENTRANCE data */
/* BASEBALL-42 data >>> */
// Jim Miles Field (#42) structures traced on Brent's aerial (2026-10-09). parts: c = centre [lng,lat], rot = deg CCW (local -z = front), w/d/h in m.
window.NWCC_LANDMARKS.baseball = {"parts":[{"t":"dugout","c":[-89.9746112,34.624434],"rot":90.0,"w":19.4,"d":4.8,"h":2.6,"name":"1B dugout"},{"t":"dugout","c":[-89.9750173,34.624056],"rot":0.0,"w":19.6,"d":5.0,"h":2.6,"name":"3B dugout"},{"t":"block","c":[-89.9750206,34.6240198],"rot":0,"w":17.0,"d":3.0,"h":2.8,"col":"#b2463b","roofc":"#9c3b32","roof":"flat","name":"3B storage"},{"t":"stand","c":[-89.9745402,34.62424],"rot":90.0,"w":10.5,"d":8.2,"rows":8,"rise":0.42,"name":"1B bleachers"},{"t":"stand","c":[-89.9747859,34.6240252],"rot":0.0,"w":10.0,"d":9.0,"rows":8,"rise":0.42,"name":"home bleachers"},{"t":"stand","c":[-89.9745883,34.6240858],"rot":44.0,"w":13.4,"d":11.4,"rows":9,"rise":0.4,"roof":6.4,"press":true,"name":"covered grandstand + press box"},{"t":"stand","c":[-89.9759157,34.6244231],"rot":-90.0,"w":10.0,"d":3.0,"rows":3,"rise":0.4,"name":"LF bleacher"},{"t":"block","c":[-89.97449,34.6243544],"rot":0,"w":9.0,"d":13.0,"h":3.2,"col":"#dcd6ca","roofc":"#7f8489","roof":"hip","name":"gray hip-roof building"},{"t":"block","c":[-89.9759676,34.6251489],"rot":0,"w":17.5,"d":11.5,"h":4.0,"col":"#d8d3c8","roofc":"#80868c","roof":"gable","name":"NW gray building"},{"t":"block","c":[-89.9746931,34.6248708],"rot":0,"w":5.0,"d":2.0,"h":2.2,"col":"#cfcac0","roofc":"#6f9a6a","roof":"flat","name":"RF bullpen shelter"},{"t":"scoreboard","c":[-89.9757738,34.6249477],"rot":-131.6,"w":11.0,"h":4.4,"y0":3.0,"name":"scoreboard"},{"t":"cage","c":[-89.9757356,34.6240021],"rot":0,"w":20.0,"d":18.9,"h":4.2,"lanes":2,"name":"batting cage"},{"t":"bench","c":[-89.9754354,34.6239845],"rot":0,"w":5.0,"d":0.6,"h":0.5,"name":"3B bullpen bench"}],"pads":[{"c":"#3d7442","r":[[-89.9756308,34.6239194],[-89.9756308,34.6240849],[-89.9758404,34.6240849],[-89.9758404,34.6239194],[-89.9756308,34.6239194]]},{"c":"#c47a54","r":[[-89.9757924,34.6240433],[-89.9757924,34.6240822],[-89.9758338,34.6240822],[-89.9758338,34.6240433],[-89.9757924,34.6240433]]},{"c":"#c9a17a","r":[[-89.9754136,34.623989],[-89.9754136,34.6240424],[-89.9755118,34.6240424],[-89.9755118,34.623989],[-89.9754136,34.623989]]},{"c":"#c47a54","r":[[-89.9746658,34.6250019],[-89.9746658,34.6250381],[-89.9747204,34.6250381],[-89.9747204,34.6250019],[-89.9746658,34.6250019]]}],"fences":[{"k":"wall","h":2.4,"pts":[[-89.9746396,34.6245235],[-89.9746396,34.6246809],[-89.9746396,34.6248057],[-89.9746505,34.6248201],[-89.9746658,34.624831],[-89.9747378,34.6248654],[-89.9747378,34.6250842],[-89.9747466,34.6250915],[-89.9747815,34.6250924],[-89.9748295,34.6250887],[-89.9749278,34.6250815],[-89.9750588,34.6250734],[-89.9751898,34.6250634],[-89.9753208,34.6250544],[-89.9754518,34.6250453],[-89.9755173,34.625039],[-89.9755828,34.6250236],[-89.9756308,34.6250064],[-89.9756745,34.6249866],[-89.9757138,34.624963],[-89.9757509,34.6249359],[-89.9757749,34.6249124],[-89.9757989,34.6248889],[-89.9758186,34.6248654],[-89.9758382,34.6248346],[-89.9758513,34.6248075],[-89.9758644,34.6247713],[-89.975871,34.624717],[-89.9758731,34.6245],[-89.9758731,34.6242287],[-89.975871,34.6241003],[-89.9758513,34.6241057],[-89.9757793,34.6241093],[-89.9756308,34.6241111],[-89.975609,34.6241057],[-89.97555,34.6240731],[-89.9754889,34.624046],[-89.9754299,34.6240478],[-89.9753208,34.6240514],[-89.9751723,34.6240587],[-89.9751527,34.6240804],[-89.9751308,34.6240948]]},{"k":"rail","h":1.1,"pts":[[-89.9751308,34.6240948],[-89.9748841,34.6240948]]},{"k":"net","h":7.5,"pts":[[-89.9748841,34.6240948],[-89.9748404,34.624093],[-89.9747968,34.6240948],[-89.9747575,34.6241021],[-89.9747225,34.6241165],[-89.974692,34.6241383],[-89.974668,34.6241636],[-89.9746505,34.6241925],[-89.9746418,34.6242287],[-89.9746396,34.624283]]},{"k":"rail","h":1.1,"pts":[[-89.9746396,34.624283],[-89.9746396,34.6245235]]},{"k":"chain","h":2.4,"pts":[[-89.9747378,34.6250842],[-89.9746483,34.6250842],[-89.9746483,34.6248256]]}]};
/* <<< BASEBALL-42 data */
/* FOOTBALL-41 data >>> */
// Football stadium (#41) structures traced on Brent's aerial (2026-10-09). parts: c = centre [lng,lat], rot = deg CCW (local -z = front), w/d/h in m.
window.NWCC_LANDMARKS.football = {"parts":[{"t":"grand","c":[-89.9762726,34.624379],"rot":96.08,"w":53.0,"d":18.5,"rows":22,"rise":0.4,"col":"#c9ced3","col2":"#b7bdc3","aisles":[-19.6,-7.2,6.0,17.2],"press":{"off":-1.0,"w":17.5,"d":3.8,"h":3.0,"behind":true},"name":"main (east) grandstand + press box"},{"t":"grand","c":[-89.9774293,34.6242814],"rot":-83.92,"w":32.8,"d":12.5,"rows":14,"rise":0.36,"col":"#dfe2e4","col2":"#cfd3d6","aisles":[-8.0,8.0],"name":"west bleachers"},{"t":"block","c":[-89.9775124,34.6242573],"rot":-83.92,"w":5.9,"d":1.9,"h":6.0,"col":"#cfcac0","roofc":"#9aa0a6","name":"west bleachers rear booth"},{"t":"scoreboard","c":[-89.9766397,34.6237117],"rot":6.08,"w":10.0,"h":4.2,"y0":3.2,"name":"south scoreboard"},{"t":"pad3d","c":[-89.9772201,34.6248956],"rot":-26.92,"w":5.2,"d":4.6,"h":0.55,"col":"#4d86c9","name":"north curve vault/jump pad W"},{"t":"pad3d","c":[-89.9767448,34.6249557],"rot":39.08,"w":5.2,"d":4.6,"h":0.55,"col":"#4d86c9","name":"north curve vault/jump pad E"}],"bricks":[[[-89.976431,34.625079],[-89.976384,34.6250839],[-89.976384,34.625111],[-89.976431,34.6251062],[-89.976431,34.625079]],[[-89.9763709,34.6250852],[-89.9763207,34.6250904],[-89.9763207,34.6251175],[-89.9763709,34.6251123],[-89.9763709,34.6250852]],[[-89.9763054,34.625092],[-89.9762563,34.625097],[-89.9762563,34.6251241],[-89.9763054,34.6251191],[-89.9763054,34.625092]],[[-89.9762421,34.6250985],[-89.9761952,34.6251033],[-89.9761952,34.6251304],[-89.9762421,34.6251256],[-89.9762421,34.6250985]],[[-89.9761788,34.625105],[-89.9761297,34.62511],[-89.9761297,34.6251372],[-89.9761788,34.6251321],[-89.9761788,34.625105]],[[-89.9761133,34.6251117],[-89.9760675,34.6251164],[-89.9760675,34.6251436],[-89.9761133,34.6251388],[-89.9761133,34.6251117]]],"medallion":{"c":[-89.9764965,34.6250815],"r":4.4}};
/* <<< FOOTBALL-41 data */
/* SOFTBALL-45 data >>> */
// Ranger Field (softball, #45) structures traced on Brent's aerial (2026-10-09). parts: c = centre [lng,lat], rot = deg CCW (local -z = front), w/d/h in m.
window.NWCC_LANDMARKS.softball = {"parts":[{"t":"dugout","c":[-89.9782639,34.6215156],"rot":90.0,"w":15.0,"d":3.6,"h":2.5,"name":"1B dugout"},{"t":"dugout","c":[-89.9785411,34.6213293],"rot":0.0,"w":14.0,"d":3.4,"h":2.5,"name":"3B dugout"},{"t":"stand","c":[-89.9782398,34.6213962],"rot":90.0,"w":10.5,"d":5.4,"rows":6,"rise":0.42,"name":"1B bleachers"},{"t":"stand","c":[-89.9783818,34.6213021],"rot":0.0,"w":8.5,"d":4.6,"rows":5,"rise":0.42,"name":"home bleachers"},{"t":"stand","c":[-89.9782933,34.621304],"rot":31.9,"w":9.0,"d":6.4,"rows":6,"rise":0.4,"roof":4.6,"press":true,"name":"covered seating behind home"},{"t":"block","c":[-89.9789887,34.6213763],"rot":0,"w":6.0,"d":4.2,"h":2.6,"col":"#8a3a3f","roofc":"#6e2a33","roof":"flat","name":"LF-line shelter W"},{"t":"block","c":[-89.9788577,34.6213736],"rot":0,"w":7.0,"d":4.4,"h":2.6,"col":"#8a3a3f","roofc":"#6e2a33","roof":"flat","name":"LF-line shelter E"},{"t":"block","c":[-89.9782606,34.6219008],"rot":0,"w":0.9,"d":4.6,"h":1.0,"col":"#e9e7e0","roofc":"#f4f3ee","roof":"flat","name":"RF bullpen bench"}],"pads":[{"c":"#c98458","r":[[-89.9782136,34.6217607],[-89.9782136,34.6219126],[-89.9782529,34.6219126],[-89.9782529,34.6217607],[-89.9782136,34.6217607]]}],"fences":[{"k":"wall","h":2.0,"pts":[[-89.9783436,34.6219424],[-89.9784866,34.6219506],[-89.9786481,34.6219569],[-89.9786721,34.6219506],[-89.9787005,34.6219424],[-89.9787442,34.6219225],[-89.9787813,34.6219008],[-89.9788228,34.6218773],[-89.9788643,34.6218484],[-89.9789057,34.6218113],[-89.9789407,34.6217787],[-89.9789789,34.6217399],[-89.9790105,34.6216983],[-89.9790236,34.6216784],[-89.9790258,34.6214224]]},{"k":"chain","h":2.4,"pts":[[-89.9783436,34.6219424],[-89.9782759,34.6219397],[-89.9782748,34.6215897]]},{"k":"rail","h":1.1,"pts":[[-89.9782944,34.6215843],[-89.9782944,34.6214432]]},{"k":"net","h":6.5,"pts":[[-89.9782944,34.6214432],[-89.9782944,34.6213844],[-89.9783425,34.6213483],[-89.9783828,34.6213437],[-89.9784538,34.6213446]]},{"k":"rail","h":1.1,"pts":[[-89.9784538,34.6213446],[-89.9786285,34.621351]]},{"k":"chain","h":2.4,"pts":[[-89.9786285,34.621351],[-89.9786885,34.6213564],[-89.9787846,34.6213591],[-89.9788162,34.6213989],[-89.9790258,34.6213998],[-89.9790258,34.6214224]]},{"k":"chain","h":2.4,"pts":[[-89.9782759,34.6219352],[-89.9782071,34.6219352],[-89.9782071,34.6217543],[-89.9782748,34.6217543]]}],"poles":[[-89.9783436,34.6219424],[-89.9790258,34.6214224]]};
/* <<< SOFTBALL-45 data */
/* PRACTICE-49 data >>> */
// #49 practice facility structures traced on Brent's aerial + street views (2026-10-09). Coordinates [lng,lat]; heights in m.
window.NWCC_LANDMARKS.practice = {"main":[[-89.9784276,34.6221079],[-89.9779189,34.6226017]],"eave":10.5,"band":2.4,"rise":2.038,"cols":[[-89.9779254,34.6221134,"e"],[-89.9784211,34.6221134,"w"],[-89.9779254,34.6221737,"e"],[-89.9784211,34.6221737,"w"],[-89.9779254,34.6222341,"e"],[-89.9784211,34.6222341,"w"],[-89.9779254,34.6222945,"e"],[-89.9784211,34.6222945,"w"],[-89.9779254,34.6223548,"e"],[-89.9784211,34.6223548,"w"],[-89.9779254,34.6224152,"e"],[-89.9784211,34.6224152,"w"],[-89.9779254,34.6224756,"e"],[-89.9784211,34.6224756,"w"],[-89.9779254,34.6225359,"e"],[-89.9784211,34.6225359,"w"],[-89.9779254,34.6225963,"e"],[-89.9784211,34.6225963,"w"],[-89.9782972,34.6221134,"s"],[-89.9782972,34.6225963,"n"],[-89.9781733,34.6221134,"s"],[-89.9781733,34.6225963,"n"],[-89.9780494,34.6221134,"s"],[-89.9780494,34.6225963,"n"]],"open":[[[-89.9779189,34.6221079],[-89.9779189,34.6226017]],[[-89.9779189,34.6226017],[-89.9784276,34.6226017]],[[-89.9784276,34.6226017],[-89.9784276,34.6224959]],[[-89.9784276,34.6221079],[-89.9779189,34.6221079]]],"annex":[{"sw":[-89.9785018,34.6221079],"ne":[-89.9784276,34.6224959],"h":12.9,"win":0},{"sw":[-89.9786525,34.6221125],"ne":[-89.9785018,34.6223114],"h":5.8,"win":1}],"poles":[{"c":[-89.9784374,34.6220799],"h":9.0,"a":0,"street":false},{"c":[-89.9782497,34.6220799],"h":9.0,"a":0,"street":false},{"c":[-89.9780499,34.6220799],"h":9.0,"a":0,"street":false},{"c":[-89.9783446,34.6219868],"h":9.0,"a":180,"street":false},{"c":[-89.9781263,34.6219868],"h":9.0,"a":180,"street":false}]};
/* <<< PRACTICE-49 data */
