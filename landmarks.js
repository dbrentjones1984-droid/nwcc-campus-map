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
  // LAMAR-11 build >>>
  // #11 Lamar Hall (2-story red brick, tan band, cream frieze, gray shingle hip roof, east portico with 4 columns + LAMAR HALL
  // pediment) and its outdoor basketball court. Facades are canvas textures (windows painted); deliberately NO ground shadows.
  function buildLamar() {
    const B = L.lamar, g = new THREE.Group(); g.name = 'lamar-hall';
    const EN = c => toEN(c[0], c[1]);
    const M = (k, o) => lam('lm-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const hid = new THREE.MeshBasicMaterial({ visible: false });
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const cream = M('cream', { color: '#ece3cc', emissive: '#2e2b24' }), white = M('white', { color: '#f6f4ee', emissive: '#3a3935' }),
      whiteD = lam('lm-whiteD', { color: '#f6f4ee', emissive: '#3a3935', side: THREE.DoubleSide }), conc = M('conc', { color: '#d8d4c9' });
    // ---------- brick facade texture
    const PX = 24, H = B.eave;
    function facade(len, items, opt) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      x.fillStyle = '#994a36'; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) {
        const t = rnd(); x.fillStyle = t < 0.3 ? '#8c4230' : t < 0.6 ? '#a3513b' : t < 0.8 ? '#9e4c37' : '#874031'; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(70,40,30,0.25)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      x.fillStyle = '#7f3d2d'; x.fillRect(0, Y(0.45), c.width, 0.45 * PX);                         // soldier course at the base
      x.fillStyle = '#d6c29b'; x.fillRect(0, Y(4.05), c.width, 0.3 * PX);                          // tan band between floors
      x.fillStyle = '#e9dfc6'; x.fillRect(0, Y(H), c.width, (H - 7.3) * PX);                       // cream frieze
      x.fillStyle = '#cbbd9c'; x.fillRect(0, Y(7.3) - 2, c.width, 2); x.fillRect(0, Y(7.75), c.width, 1);
      for (const it of items) {
        if (it.k === 'win') {
          x.fillStyle = '#d6c29b'; x.fillRect(U(it.u - 0.75), Y(it.z) , 1.5 * PX, 0.14 * PX);       // cast-stone sill
          x.fillStyle = '#f3f1ea'; x.fillRect(U(it.u - 0.68), Y(it.z + it.h + 0.08), 1.36 * PX, (it.h + 0.08) * PX);
          const gr = x.createLinearGradient(0, Y(it.z + it.h), 0, Y(it.z)); gr.addColorStop(0, '#87a197'); gr.addColorStop(1, '#4f655d');
          x.fillStyle = gr; x.fillRect(U(it.u - 0.58), Y(it.z + it.h - 0.02), 1.16 * PX, (it.h - 0.1) * PX);
          x.fillStyle = '#f3f1ea'; x.fillRect(U(it.u) - 1, Y(it.z + it.h), 2, it.h * PX);
          for (const f of [1 / 3, 1 / 2, 2 / 3]) x.fillRect(U(it.u - 0.58), Y(it.z + it.h * f) - (f === 0.5 ? 2 : 1), 1.16 * PX, f === 0.5 ? 3 : 1);
        } else if (it.k === 'glass') {
          x.fillStyle = '#eceae3'; x.fillRect(U(it.u - 0.08), Y(it.z + it.h + 0.08), (it.w + 0.16) * PX, (it.h + 0.16) * PX);
          const gr = x.createLinearGradient(0, Y(it.z + it.h), 0, Y(it.z)); gr.addColorStop(0, '#7f9ab0'); gr.addColorStop(1, '#3a4b5a');
          x.fillStyle = gr; x.fillRect(U(it.u), Y(it.z + it.h), it.w * PX, it.h * PX);
          x.fillStyle = '#e4e2da'; for (let k = 1; k < it.w / 0.7; k++) x.fillRect(U(it.u + k * it.w / Math.round(it.w / 0.7)) - 1, Y(it.z + it.h), 2, it.h * PX);
          for (let hh = it.z + 1.2; hh < it.z + it.h; hh += 1.25) x.fillRect(U(it.u), Y(hh) - 1, it.w * PX, 2);
          if (it.door) { x.fillStyle = '#2b3640'; x.fillRect(U(it.u + 0.1), Y(it.z + 2.3), (it.w - 0.2) * PX, 2.3 * PX); x.fillStyle = '#c9c7bf'; x.fillRect(U(it.u + it.w / 2) - 1, Y(it.z + 2.3), 2, 2.3 * PX); }
        } else if (it.k === 'door') {
          x.fillStyle = '#d6c29b'; x.fillRect(U(it.u - 0.1), Y(it.h + 0.12), (it.w + 0.2) * PX, (it.h + 0.12) * PX);
          x.fillStyle = it.c || '#5e4a3a'; x.fillRect(U(it.u), Y(it.h), it.w * PX, it.h * PX);
        } else if (it.k === 'lamp') { x.fillStyle = '#2b2b2b'; x.fillRect(U(it.u - 0.1), Y(it.z + 0.35), 0.2 * PX, 0.35 * PX); }
      }
      return M('fac' + (opt || '') + len.toFixed(1), { map: texOf(c), emissive: '#1c1410' });
    }
    const wins = (us, extra) => us.flatMap(u => [{ k: 'win', u, z: 0.9, h: 1.85 }, { k: 'win', u, z: 4.75, h: 1.85 }]).concat(extra || []);
    const span = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
    // ---------- main block
    const [sw, ne] = B.main.map(EN), W = ne[0] - sw[0], D = ne[1] - sw[1], cx = (sw[0] + ne[0]) / 2, cz = -(sw[1] + ne[1]) / 2;
    const [psw, pne] = B.porch.map(EN), pw0 = psw[1] - sw[1], pw1 = pne[1] - sw[1], pc = (pw0 + pw1) / 2;   // portico span along the east facade (u from the south)
    const eastItems = wins(span(1.9, pw0 - 2.0, 6).concat(span(pw1 + 1.9, D - 1.9, 6)),
      [{ k: 'glass', u: pc - 2.3, w: 1.5, z: 0.35, h: 6.8, door: true }, { k: 'glass', u: pc + 0.8, w: 1.5, z: 0.35, h: 6.8 }]
        .concat(span(1.9, pw0 - 2.0, 6).slice(0, 5).map(u => ({ k: 'lamp', u: u + 1.8, z: 3.0 }))).concat(span(pw1 + 1.9, D - 1.9, 6).slice(0, 5).map(u => ({ k: 'lamp', u: u + 1.6, z: 3.0 }))));
    const westItems = wins(span(1.9, D / 2 - 2.4, 6).concat(span(D / 2 + 2.4, D - 1.9, 6)), [{ k: 'glass', u: D / 2 - 1.3, w: 2.6, z: 0.3, h: 2.6, door: true }]);
    const southItems = [{ k: 'win', u: W * 0.55, z: 4.75, h: 1.85 }, { k: 'win', u: W * 0.8, z: 4.75, h: 1.85 }, { k: 'door', u: W * 0.55 - 0.5, w: 1.0, h: 2.2, c: '#6b5444' }, { k: 'win', u: W * 0.8, z: 0.9, h: 1.85 }, { k: 'door', u: W * 0.2, w: 1.0, h: 2.2, c: '#7a756c' }, { k: 'lamp', u: W * 0.55 + 0.9, z: 2.4 }];
    const wallBox = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [facade(D, eastItems, 'e'), facade(D, westItems, 'w'), hid, hid, facade(W, southItems, 's'), facade(W, [], 'n')]);
    wallBox.position.set(cx, H / 2, cz); g.add(wallBox);
    // north bay
    const [bsw, bne] = B.nbay.map(EN), bW = bne[0] - bsw[0], bD = bne[1] - bsw[1];
    const nb = new THREE.Mesh(new THREE.BoxGeometry(bW, H, bD), [facade(bD, [], 'be'), facade(bD, [], 'bw'), hid, hid, hid, facade(bW, wins(span(2.6, bW - 2.6, 4)), 'bn')]);
    nb.position.set((bsw[0] + bne[0]) / 2, H / 2, -(bsw[1] + bne[1]) / 2); g.add(nb);
    // cornice + soffit slabs
    for (const [x0, z0, w, d] of [[cx, cz, W, D], [(bsw[0] + bne[0]) / 2, -(bsw[1] + bne[1]) / 2, bW, bD]]) {
      g.add(box(w + 0.5, 0.28, d + 0.5, x0, H - 0.28, z0, cream)); g.add(box(w + 0.9, 0.12, d + 0.9, x0, H - 0.02, z0, white)); }
    // ---------- shingle hip roofs
    const shC = cvs(64, 64), sx = shC.getContext('2d'); sx.fillStyle = '#7c8086'; sx.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) { sx.fillStyle = r % 2 ? '#74787e' : '#82868c'; sx.fillRect(0, r * 16, 64, 15); sx.fillStyle = '#55595e'; sx.fillRect(0, r * 16 + 15, 64, 1);
      for (let k = 0; k < 4; k++) sx.fillRect(((k * 16 + (r % 2) * 8) % 64), r * 16, 1, 15); }
    const shT = texOf(shC, true), shingle = lam('lm-shingle', { map: shT, side: THREE.DoubleSide, emissive: '#16181a' });
    function hip(x0, x1, z0, z1, y, pitch) {   // three coords (z0 < z1); ridge along the longer side; UV ~ 1 tile / m
      const t = Math.tan(pitch * Math.PI / 180), P = [], UV = [], wx = x1 - x0, dz = z1 - z0, alongZ = dz >= wx, h = (alongZ ? wx : dz) / 2, r = y + h * t;
      const cx_ = (x0 + x1) / 2, cz_ = (z0 + z1) / 2, sl = 1 / Math.cos(Math.atan(t));
      const tri = (a, b, c, uv) => { P.push(...a, ...b, ...c); UV.push(...uv); };
      if (alongZ) { const ra = [cx_, r, z0 + h], rb = [cx_, r, z1 - h];
        tri([x1, y, z0], [x1, y, z1], rb, [z0, 0, z1, 0, z1 - h, h * sl]); tri([x1, y, z0], rb, ra, [z0, 0, z1 - h, h * sl, z0 + h, h * sl]);
        tri([x0, y, z1], [x0, y, z0], ra, [z1, 0, z0, 0, z0 + h, h * sl]); tri([x0, y, z1], ra, rb, [z1, 0, z0 + h, h * sl, z1 - h, h * sl]);
        tri([x0, y, z0], [x1, y, z0], ra, [x0, 0, x1, 0, cx_, h * sl]); tri([x1, y, z1], [x0, y, z1], rb, [x1, 0, x0, 0, cx_, h * sl]);
      } else { const ra = [x0 + h, r, cz_], rb = [x1 - h, r, cz_];
        tri([x0, y, z1], [x1, y, z1], rb, [x0, 0, x1, 0, x1 - h, h * sl]); tri([x0, y, z1], rb, ra, [x0, 0, x1 - h, h * sl, x0 + h, h * sl]);
        tri([x1, y, z0], [x0, y, z0], ra, [x1, 0, x0, 0, x0 + h, h * sl]); tri([x1, y, z0], ra, rb, [x1, 0, x0 + h, h * sl, x1 - h, h * sl]);
        tri([x0, y, z0], [x0, y, z1], ra, [z0, 0, z1, 0, cz_, h * sl]); tri([x1, y, z1], [x1, y, z0], rb, [z1, 0, z0, 0, cz_, h * sl]); }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(UV.map(v => v / 1.0), 2)); ge.computeVertexNormals();
      return new THREE.Mesh(ge, shingle);
    }
    const ov = 0.45, yR = H + 0.1;
    g.add(hip(sw[0] - ov, ne[0] + ov, -ne[1] - ov, -sw[1] + ov, yR, B.pitch));
    g.add(hip(bsw[0] - ov, bne[0] + ov, -bne[1] - ov, -bsw[1] + 0.2, yR, B.pitch));
    // ---------- east portico: porch, 4 columns, entablature with LAMAR HALL, pediment gable roof
    const px0 = ne[0], px1 = pne[0], pz0 = -pne[1], pz1 = -psw[1], pzc = (pz0 + pz1) / 2, pW = pz1 - pz0;
    g.add(box(px1 - px0 + 0.4, 0.35, pW, (px0 + px1) / 2 + 0.2, 0, pzc, conc)); g.add(box(0.7, 0.17, pW - 2.0, px1 + 0.75, 0, pzc, conc));
    const colX = px1 - 0.75, colM = lam('lm-col', { color: '#f7f5ef', emissive: '#3c3b37' }), TOPC = 7.5, front = px1 - 0.15;
    for (const f of [-1.5, -0.5, 0.5, 1.5]) { const z = pzc + f * (pW * 0.79 / 3);
      g.add(box(1.05, 0.45, 1.05, colX, 0.35, z, white)); g.add(cyl(0.44, 0.38, TOPC - 1.1, colX, 0.8, z, colM, 24)); g.add(box(1.0, 0.3, 1.0, colX, TOPC - 0.3, z, white)); }
    const eC = cvs(pW * 64, 2.5 * 64), ex_ = eC.getContext('2d'); ex_.fillStyle = '#f3efe5'; ex_.fillRect(0, 0, eC.width, eC.height);
    ex_.fillStyle = '#d9d2c0'; ex_.fillRect(0, 0, eC.width, 0.35 * 64); ex_.fillRect(0, eC.height - 0.45 * 64, eC.width, 3); ex_.fillRect(0, eC.height - 0.22 * 64, eC.width, 2);
    ex_.fillStyle = '#26282a'; ex_.font = 'bold ' + Math.round(0.5 * 64) + 'px Georgia, "DejaVu Serif", "Times New Roman", serif'; ex_.textAlign = 'center'; ex_.textBaseline = 'middle';
    const txt = 'L A M A R   H A L L'; ex_.fillText(txt, eC.width / 2, eC.height * 0.52);
    const entT = texOf(eC), ent = M('ent', { map: entT, emissive: '#2e2d2a' });
    const eb = new THREE.Mesh(new THREE.BoxGeometry(front - px0 + 0.45, 2.5, pW + 0.2), [ent, white, white, white, white, white]);
    eb.position.set((px0 - 0.45 + front) / 2, TOPC + 1.25, pzc); g.add(eb);
    const pBase = TOPC + 2.5, pRise = 2.8, gx0 = cx + 0.2;
    const shp = new THREE.Shape([new THREE.Vector2(-pW / 2 - 0.15, pBase), new THREE.Vector2(pW / 2 + 0.15, pBase), new THREE.Vector2(0, pBase + pRise)]);
    const pg = new THREE.ExtrudeGeometry(shp, { depth: front - gx0, bevelEnabled: false }); pg.rotateY(Math.PI / 2);
    const prism = new THREE.Mesh(pg, [whiteD, shingle]); prism.position.set(gx0, 0, pzc); g.add(prism);
    const slope = Math.atan2(pRise, pW / 2 + 0.15), rl = Math.hypot(pRise, pW / 2 + 0.15);
    for (const sgn of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, rl + 0.3), cream);
      r.position.set(front + 0.1, pBase + pRise / 2 + 0.1, pzc + sgn * (pW / 4 + 0.07)); r.rotation.x = sgn * slope; g.add(r);
      const rs = new THREE.Mesh(new THREE.BoxGeometry(front - gx0 + 0.3, 0.1, rl + 0.35), shingle);   // roof overhang slabs on the portico gable
      rs.position.set((gx0 + front) / 2 + 0.15, pBase + pRise / 2 + 0.2, pzc + sgn * (pW / 4 + 0.07)); rs.rotation.x = sgn * slope; g.add(rs); }
    g.add(box(0.55, 0.3, pW + 0.6, front + 0.05, pBase - 0.05, pzc, cream));
    // ---------- downspouts (white)
    const dsp = (x, z) => g.add(box(0.13, H - 0.3, 0.13, x, 0, z, white));
    for (const u of [0.5, 11.8, pw0 - 0.4, pw1 + 0.4, pw1 + 10.5, D - 0.5]) dsp(ne[0] + 0.08, -(sw[1] + u));
    for (const u of [0.5, 13.0, D / 2 - 3.0, D / 2 + 3.0, D - 13.0, D - 0.5]) dsp(sw[0] - 0.08, -(sw[1] + u));
    dsp(sw[0] + W * 0.42, -sw[1] + 0.08);
    // ---------- service yard: brick screen wall + bins
    const bt = brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']), brick = lam('lm-brick', { map: bt, side: THREE.DoubleSide, emissive: '#140c08' });
    const YP = B.yard.map(EN);
    for (let i = 0; i < YP.length - 1; i++) { const a = YP[i], b = YP[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ge = new THREE.BoxGeometry(Ls, 2.4, 0.3), uv = ge.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * Ls / 0.8, uv.getY(k) * 2.4 / 0.3);
      const w = new THREE.Mesh(ge, brick); w.position.set((a[0] + b[0]) / 2, 1.2, -(a[1] + b[1]) / 2); w.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(w);
      const cp = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.3, 0.1, 0.42), cream); cp.position.set(w.position.x, 2.45, w.position.z); cp.rotation.y = w.rotation.y; g.add(cp); }
    B.bins.forEach((p, i) => { const [x, y] = EN(p), col = i < 2 ? '#c4362b' : '#36495e';
      g.add(box(0.62, 1.0, 0.72, x, 0, -y, M('bin' + i, { color: col }))); g.add(box(0.68, 0.06, 0.8, x, 1.0, -y, M('binl' + i, { color: col }))); });
    // ---------- light poles
    const pole = M('pole', { color: '#4a4f55' }), led = new THREE.MeshBasicMaterial({ color: '#f4f6ff' });
    for (const p of B.poles) { const [x, y] = EN(p), o = new THREE.Group(); o.position.set(x, 0, -y);
      o.add(cyl(0.28, 0.28, 0.5, 0, 0, 0, M('pbase', { color: '#bdb8ad' }), 10)); o.add(cyl(0.11, 0.09, 8.5, 0, 0.5, 0, pole, 8));
      o.add(box(0.1, 0.1, 1.2, 0, 9.3, -0.6, pole)); o.add(box(0.45, 0.14, 0.8, 0, 9.2, -1.2, pole));
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.65), led); l.rotation.x = Math.PI / 2; l.position.set(0, 9.19, -1.2); o.add(l); g.add(o); }
    // ---------- basketball court: canvas-painted surface, hoops, fence
    const C = B.court, [csw, cne] = C.surf.map(EN), SW_ = cne[0] - csw[0], SL = cne[1] - csw[1], [ccx, ccy] = EN(C.c), Q = 30;
    const cc = cvs(SW_ * Q, SL * Q), k = cc.getContext('2d');
    const P = (x, y) => [(x - csw[0]) * Q, (cne[1] - y) * Q];   // local EN -> canvas px (north up)
    k.fillStyle = '#a7c1e2'; k.fillRect(0, 0, cc.width, cc.height);
    const hw = C.W / 2, hl = C.L / 2, [a0, a1] = P(ccx - hw, ccy + hl), [b0, b1] = P(ccx + hw, ccy - hl);
    k.fillStyle = '#5a7fc1'; k.fillRect(a0, a1, b0 - a0, b1 - a1);
    k.strokeStyle = '#ffffff'; k.lineWidth = 0.06 * Q * 1.6; k.strokeRect(a0, a1, b0 - a0, b1 - a1);
    const [m0, m1] = P(ccx - hw, ccy), [m2] = P(ccx + hw, ccy); k.beginPath(); k.moveTo(m0, m1); k.lineTo(m2, m1); k.stroke();
    const [c0, c1] = P(ccx, ccy); k.beginPath(); k.arc(c0, c1, 1.83 * Q, 0, 2 * Math.PI); k.stroke();
    for (const s of [1, -1]) {   // s = +1 north end
      const yb = ccy + s * hl, hoopY = yb - s * 1.6, ft = yb - s * 5.8, kw = 3.66;
      const [k0, k1] = P(ccx - kw / 2, yb), [k2, k3] = P(ccx + kw / 2, ft);
      k.fillStyle = '#a7c1e2'; k.fillRect(Math.min(k0, k2), Math.min(k1, k3), Math.abs(k2 - k0), Math.abs(k3 - k1)); k.strokeRect(Math.min(k0, k2), Math.min(k1, k3), Math.abs(k2 - k0), Math.abs(k3 - k1));
      const [f0, f1] = P(ccx, ft); k.beginPath(); k.arc(f0, f1, 1.83 * Q, 0, 2 * Math.PI); k.stroke();
      const [h0, h1] = P(ccx, hoopY), R3 = 6.75 * Q, cxl = (hw - 0.9) * Q, ang = Math.asin(Math.min(1, cxl / R3));
      // 3-pt arc: corner straights from the baseline, arc toward mid-court
      const start = s > 0 ? Math.PI / 2 - ang : -Math.PI / 2 - ang, end = s > 0 ? Math.PI / 2 + ang : -Math.PI / 2 + ang;
      k.beginPath(); k.arc(h0, h1, R3, start, end); k.stroke();
      const yy = h1 + s * R3 * Math.cos(ang);
      for (const sx of [-1, 1]) { k.beginPath(); k.moveTo(h0 + sx * cxl, P(0, yb)[1]); k.lineTo(h0 + sx * cxl, yy); k.stroke(); }
    }
    // centre logo: red rounded square, white N
    const LG = 3.4 * Q; k.fillStyle = '#c3272f'; k.beginPath(); k.roundRect ? k.roundRect(c0 - LG / 2, c1 - LG / 2, LG, LG, 0.3 * Q) : k.rect(c0 - LG / 2, c1 - LG / 2, LG, LG); k.fill();
    k.lineWidth = 0.12 * Q; k.strokeStyle = '#ffffff'; k.strokeRect(c0 - LG / 2 + 0.25 * Q, c1 - LG / 2 + 0.25 * Q, LG - 0.5 * Q, LG - 0.5 * Q);
    k.fillStyle = '#ffffff'; k.font = 'bold ' + Math.round(2.3 * Q) + 'px Georgia, "DejaVu Serif", serif'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('N', c0, c1 + 0.1 * Q);
    const ct = texOf(cc), cm = new THREE.Mesh(new THREE.PlaneGeometry(SW_, SL), lam('lm-court', { map: ct, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
    cm.rotation.x = -Math.PI / 2; cm.position.set((csw[0] + cne[0]) / 2, 0.06, -(csw[1] + cne[1]) / 2); g.add(cm);
    const metal = M('metal', { color: '#2a2e33' }), bb = M('bboard', { color: '#f4f4f4', emissive: '#333' }), rim = M('rim', { color: '#e06a1c' });
    for (const s of [1, -1]) { const yb = ccy + s * hl, z = -(yb + s * 0.9);
      g.add(cyl(0.1, 0.1, 3.3, ccx, 0, z, metal, 10)); g.add(box(0.12, 0.12, 1.5, ccx, 3.2, -(yb - s * 0.1) , metal));
      g.add(box(1.8, 1.05, 0.06, ccx, 2.9, -(yb - s * 1.2), bb)); const r = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 6, 16), rim); r.rotation.x = Math.PI / 2; r.position.set(ccx, 3.05, -(yb - s * 1.6) ); g.add(r); }
    const fence = lam('lm-fence', { color: '#15181b', transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
    const fx0 = csw[0] - 0.4, fx1 = cne[0] + 0.4, fy0 = csw[1] - 0.4, fy1 = cne[1] + 0.4;
    const gy = ccy + 12.55;   // gate on the east side, facing the hall's rear walk
    const runs = [[[fx0, fy0], [fx1, fy0]], [[fx1, fy0], [fx1, gy - 1.1]], [[fx1, gy + 1.1], [fx1, fy1]], [[fx1, fy1], [fx0, fy1]], [[fx0, fy1], [fx0, fy0]]];
    for (const [a, b] of runs) { const Ls = Math.hypot(b[0] - a[0], b[1] - a[1]); if (Ls < 0.1) continue;
      const f = new THREE.Mesh(new THREE.PlaneGeometry(Ls, 3.0), fence); f.position.set((a[0] + b[0]) / 2, 1.5, -(a[1] + b[1]) / 2); f.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]); f.renderOrder = 2; g.add(f);
      const rr = new THREE.Mesh(new THREE.BoxGeometry(Ls, 0.06, 0.06), metal); rr.position.set(f.position.x, 3.0, f.position.z); rr.rotation.y = f.rotation.y; g.add(rr);
      const n = Math.max(1, Math.round(Ls / 3)); for (let i = 0; i <= n; i++) g.add(cyl(0.04, 0.04, 3.05, a[0] + (b[0] - a[0]) * i / n, 0, -(a[1] + (b[1] - a[1]) * i / n), metal, 6)); }
    return g;
  }
  // <<< LAMAR-11 build
  // RAB-31 build >>>
  // Thompson St / West St roundabout by #31 (2026-10-09): low 3D only -- shrub ring + light pole on the centre island,
  // mountable-apron and splitter-island curb faces. Deliberately NO ground shadows.
  function buildRab31() {
    const B = L.rab31, g = new THREE.Group(); g.name = 'roundabout-31';
    const EN = c => toEN(c[0], c[1]);
    const [cx, cy] = EN(B.c);
    const curb = lam('rab-curb', { color: '#ecebe4', emissive: '#2b2b28' });
    // raised centre-island curb (inside the apron) and the low apron lip
    const ringMesh = (r0, r1, h, y, m) => { const ge = new THREE.RingGeometry(r0, r1, 72); ge.rotateX(-Math.PI / 2); const o = new THREE.Mesh(ge, m); o.position.set(cx, y + h, -cy); return o; };
    const wall = (r, h, m) => { const ge = new THREE.CylinderGeometry(r, r, h, 72, 1, true); const o = new THREE.Mesh(ge, m); o.position.set(cx, h / 2, -cy); return o; };
    g.add(wall(B.r_isl, 0.18, curb)); g.add(ringMesh(B.r_isl - 0.25, B.r_isl, 0.0, 0.18, curb));
    g.add(wall(B.r_apron, 0.07, curb));
    // splitter-island curbs (raised 15 cm light concrete)
    for (const tri of B.splitters) { const P = tri.map(EN);
      const sh = new THREE.Shape(P.map(p => new THREE.Vector2(p[0], p[1]))); const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.15, bevelEnabled: false }); ge.rotateX(-Math.PI / 2);
      const o = new THREE.Mesh(ge, [lam('rab-spl-top', { color: '#d9d2bd', emissive: '#26231c', polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), curb]); g.add(o); }
    // shrub ring: dark clipped shrubs, a few with red blooms
    const [sx, sy] = EN(B.shrub_c), dark = lam('rab-shrub', { color: '#2f4a2a', flatShading: true }), dark2 = lam('rab-shrub2', { color: '#3a5631', flatShading: true }), red = lam('rab-bloom', { color: '#b8343a', flatShading: true });
    const geo = new THREE.IcosahedronGeometry(1, 1);
    for (let i = 0; i < B.shrub_n; i++) { const a = 2 * Math.PI * i / B.shrub_n, r = B.shrub_r;
      const o = new THREE.Mesh(geo, i % 7 === 3 ? red : (i % 2 ? dark : dark2)); const s = 0.5 + 0.08 * Math.sin(i * 2.3);
      o.scale.set(s, s * 0.8, s); o.position.set(sx + r * Math.cos(a), 0.18 + s * 0.55, -(sy + r * Math.sin(a))); g.add(o); }
    // light pole: gray steel, twin arms, LED heads
    const [px, py] = EN(B.pole), pole = lam('rab-pole', { color: '#5a5f66' }), led = new THREE.MeshBasicMaterial({ color: '#f4f6ff' });
    const o = new THREE.Group(); o.position.set(px, 0.18, -py); o.rotation.y = B.pole_rot || 0;
    o.add(cyl(0.3, 0.3, 0.45, 0, 0, 0, lam('rab-pbase', { color: '#c9c5ba' }), 12)); o.add(cyl(0.13, 0.09, 9.0, 0, 0.45, 0, pole, 10));
    for (const s of [-1, 1]) { o.add(box(1.5, 0.09, 0.09, s * 0.75, 9.25, 0, pole)); o.add(box(0.7, 0.14, 0.4, s * 1.55, 9.2, 0, pole));
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.32), led); l.rotation.x = Math.PI / 2; l.position.set(s * 1.55, 9.19, 0); o.add(l); }
    g.add(o);
    return g;
  }
  // <<< RAB-31 build
  // BENTON build >>>
  // Benton Halls (2026-10-09): small gray-roof storage shed between Halls C and B (door on the east, toward the walk).
  function buildBenton() {
    const B = L.benton, g = new THREE.Group(); g.name = 'benton-shed';
    const P = B.shed.map(c => toEN(c[0], c[1])); const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0, d = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const wall = lam('benton-shed-wall', { color: '#cdbfa6' }), trim = lam('benton-shed-trim', { color: '#efebe2' }), door = lam('benton-shed-door', { color: '#7b7266' });
    const roof = lam('benton-shed-roof', { color: B.roof, side: THREE.DoubleSide });
    const H = B.h, rise = (w / 2) * Math.tan(B.pitch * Math.PI / 180);
    g.add(box(w, H, d, cx, 0, -cy, wall)); g.add(box(w + 0.02, 0.18, d + 0.02, cx, H - 0.18, -cy, trim));
    // gable roof, ridge N-S (the long side), 0.3 m overhang; explicit triangles (x east, y up, z = -north)
    const ov = 0.3, X0 = x0 - ov, X1 = x1 + ov, Z0 = -(y0 - ov), Z1 = -(y1 + ov), R = H + rise, E = H - ov * Math.tan(B.pitch * Math.PI / 180);
    const v = [X0, E, Z0, cx, R, Z0, cx, R, Z1,  X0, E, Z0, cx, R, Z1, X0, E, Z1,  X1, E, Z0, X1, E, Z1, cx, R, Z1,  X1, E, Z0, cx, R, Z1, cx, R, Z0];
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); rg.computeVertexNormals();
    g.add(new THREE.Mesh(rg, roof));
    const gv = [], gz = [-(y0), -(y1)];
    for (const z of gz) gv.push(x0, H, z, x1, H, z, cx, H + (w / 2) * Math.tan(B.pitch * Math.PI / 180), z);
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gv, 3)); gg.computeVertexNormals();
    g.add(new THREE.Mesh(gg, lam('benton-shed-gable', { color: '#cdbfa6', side: THREE.DoubleSide })));
    g.add(box(0.05, 2.1, 1.8, x1 + 0.03, 0, -cy, door));
    return g;
  }
  // <<< BENTON build
  root.add(buildSign()); root.add(buildPlaza()); if (L.nwdr) root.add(buildNwdr()); if (L.baseball) root.add(buildBaseball()); if (L.football) root.add(buildFootball()); if (L.softball) root.add(buildSoftball()); if (L.practice) root.add(buildPractice()); if (L.lamar) root.add(buildLamar()); if (L.rab31) root.add(buildRab31()); if (L.benton) root.add(buildBenton());
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
/* LAMAR-11 data >>> */
// #11 Lamar Hall + basketball court traced on Brent's aerial + street views (2026-10-09). Coordinates [lng,lat]; heights in m.
window.NWCC_LANDMARKS.lamar = {"main":[[-89.9781951,34.6237806],[-89.9779784,34.6242517]],"nbay":[[-89.9781733,34.6242517],[-89.977992,34.6242811]],"porch":[[-89.9779784,34.6239809],[-89.9779484,34.6240718]],"eave":8.4,"pitch":24.0,"yard":[[-89.9781099,34.6237806],[-89.9781099,34.6237087],[-89.9782055,34.6237087],[-89.9782055,34.6237806]],"bins":[[-89.9780957,34.6236987],[-89.9780859,34.6236987],[-89.9780739,34.6236987]],"court":{"c":[-89.9783747,34.6240139],"L":28.5,"W":15.2,"surf":[[-89.9784789,34.6238706],[-89.9782791,34.6241627]]},"poles":[[-89.9780171,34.6236834],[-89.9784101,34.6236834],[-89.9782791,34.623498]]};
/* <<< LAMAR-11 data */
/* RAB-31 data >>> */
// Thompson St / West St roundabout by #31 (2026-10-09). Coordinates [lng,lat]; radii m.
window.NWCC_LANDMARKS.rab31 = {"c":[-89.9704313,34.6221007],"r_isl":8.7,"r_apron":11.6,"splitters":[[[-89.9704793,34.6222608],[-89.9704269,34.6222608],[-89.9704542,34.622315]],[[-89.9706179,34.6221224],[-89.9706147,34.6220609],[-89.9707195,34.6220908]],[[-89.9702533,34.622164],[-89.9700885,34.6221559],[-89.9700885,34.6221387],[-89.9702446,34.6220917]],[[-89.9704433,34.621947],[-89.9703691,34.6219488],[-89.9704094,34.6218674]]],"shrub_c":[-89.9704302,34.6221043],"shrub_r":4.9,"shrub_n":26,"pole":[-89.9704269,34.6220627],"pole_rot":-0.4363323129985824};
/* <<< RAB-31 data */
/* BENTON data >>> */
// Benton Halls shed (2026-10-09). Coordinates [lng,lat].
window.NWCC_LANDMARKS.benton = {"shed":[[-89.9692719,34.623403],[-89.9692719,34.6234717],[-89.9693353,34.6234717],[-89.9693353,34.623403],[-89.9692719,34.623403]],"h":2.7,"pitch":18,"roof":"#b4b8bd"};
/* <<< BENTON data */
