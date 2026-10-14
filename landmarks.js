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
    // sign panel between the columns (upper part), lettered on both faces (assets/landmark-sign-panel.webp)
    const PW = 2 * CX - 0.3, PH = 0.98, PD = 0.3, yPn = yTop - PH;
    g.add(box(PW, PH, PD, 0, yPn, 0, WHITE));
    g.add(box(PW + 0.04, 0.06, PD + 0.08, 0, yPn - 0.06, 0, WHITE2));   // sill
    const panelTex = tex('assets/landmark-sign-panel.webp'); const pm = new THREE.MeshLambertMaterial({ map: panelTex, emissive: '#3c3c3a' });
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
    const sealTex = tex('assets/landmark-seal-navy.webp');
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
    const ht = tex('assets/landmark-herringbone.webp');   // texture spans the 8.0 m brick field (make_textures.py D = 8.0)
    const disc = new THREE.Mesh(new THREE.CircleGeometry(Pz.r, 72), new THREE.MeshLambertMaterial({ map: ht }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.055; g.add(disc);
    const md = new THREE.Mesh(new THREE.CircleGeometry(Pz.medallion, 64), new THREE.MeshLambertMaterial({ map: tex('assets/landmark-medallion.webp'), transparent: true, alphaTest: 0.3 }));
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

  // MAIN-ENTRANCE build >>>
  // Low-poly monument: brick base + white cap, navy panel lettered "NWCC / MAIN ENTRANCE" on both faces, white top cap,
  // mulch bed + 4 shrubs. Everything is merged into 3 meshes (brick, white, panel) + 1 shrub mesh.
  function buildMainEntrance() {
    const M = L.mainEntrance, k = M.size, [e, n] = toEN(M.lng, M.lat);
    const parts = { brick: [], white: [], panel: [], shrub: [], mulch: [] };
    const put = (key, geo, x, y, z) => { geo.translate(x, y, z); parts[key].push(geo); };
    const bx = (key, w, h, d, x, y, z) => put(key, new THREE.BoxGeometry(w * k, h * k, d * k), x * k, (y + h / 2) * k, z * k);
    bx('mulch', 6.2, 0.1, 2.6, 0, 0, 0);
    bx('brick', 5.0, 0.18, 1.3, 0, 0.1, 0);           // footing
    bx('brick', 4.6, 0.9, 1.0, 0, 0.28, 0);           // brick base
    bx('white', 4.8, 0.1, 1.15, 0, 1.18, 0);          // cap
    for (const sx of [-1, 1]) { bx('brick', 0.55, 2.2, 1.1, sx * 2.35, 0.28, 0); bx('white', 0.68, 0.1, 1.2, sx * 2.35, 2.48, 0); }   // end piers
    bx('white', 4.1, 1.05, 0.5, 0, 1.28, 0);          // panel frame
    bx('white', 4.3, 0.1, 0.62, 0, 2.33, 0);          // top cap
    for (const sz of [1, -1]) { const p = new THREE.PlaneGeometry(3.9 * k, 0.92 * k); if (sz < 0) p.rotateY(Math.PI); put('panel', p, 0, 1.805 * k, sz * 0.2525 * k); }
    const sg = new THREE.IcosahedronGeometry(0.42 * k, 1);
    [[-2.95, 0.7], [-2.95, -0.7], [2.95, 0.7], [2.95, -0.7]].forEach(([x, z]) => { const s = sg.clone(); s.scale(1, 0.8, 1); put('shrub', s, x * k, 0.42 * k, z * k); });
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 242; const c = cv.getContext('2d');
    c.fillStyle = '#222c62'; c.fillRect(0, 0, 1024, 242);
    c.strokeStyle = '#f2f0ea'; c.lineWidth = 8; c.strokeRect(18, 18, 988, 206);
    c.fillStyle = '#cd2230'; c.fillRect(380, 98, 264, 6);
    c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold 72px "Noto Sans", Arial, sans-serif'; c.fillText('NWCC', 512, 62);
    c.font = 'bold 84px "Noto Sans", Arial, sans-serif'; c.fillText('MAIN ENTRANCE', 512, 162);
    const pt = new THREE.CanvasTexture(cv); pt.colorSpace = THREE.SRGBColorSpace; pt.anisotropy = 8;
    const bt = brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']); bt.repeat.set(3, 2);
    const MAT = { brick: lam('me-brick', { map: bt }), white: WHITE, panel: new THREE.MeshLambertMaterial({ map: pt, emissive: '#2a2a2a' }),
      shrub: lam('shrub', { color: '#4f8a43', flatShading: true }), mulch: lam('mulch', { color: '#5e4330' }) };
    const g = new THREE.Group(); g.name = 'main-entrance';
    for (const key in parts) if (parts[key].length) g.add(new THREE.Mesh(mergeGeo(parts[key]), MAT[key]));
    g.rotation.y = (90 - M.bearing) * Math.PI / 180; g.position.set(e, 0, -n);
    return g;
  }
  function mergeGeo(list) {   // tiny mergeGeometries: position/normal/uv, non-indexed
    const A = { position: [], normal: [], uv: [] };
    for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; for (const a in A) { const at = g.attributes[a]; for (let i = 0; i < at.array.length; i++) A[a].push(at.array[i]); } }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(A.position, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(A.normal, 3)); out.setAttribute('uv', new THREE.Float32BufferAttribute(A.uv, 2));
    out.computeBoundingSphere(); return out;
  }
  // <<< MAIN-ENTRANCE build
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
  // HEINDL-50 build >>>
  // #50 Heindl Center for the Performing Arts, traced 2026-10-11 on Esri imagery (lean-corrected) + Brent's 4 obliques and 2 street
  // photos: tall cream fly tower, cream auditorium block, 2-story brick front block with cream band + tall fanlight windows, south
  // portico (4 + 2 columns, HEINDL CENTER frieze, pediment), lower brick wings with cream parapets and dark diamond trim, brick
  // stage/support block with tall windows and a small east portico, white flat roofs (fly-tower smoke hatches; the mechanical well is
  // a plain screened recess, no HVAC units), plaza bollards + lamp posts, west service yard, NORTHWEST sign on the Northwest Dr wall.
  // Facades are canvas textures (windows painted); deliberately NO ground shadows.
  function buildHeindl() {
    const B = L.heindl, g = new THREE.Group(); g.name = 'heindl-center';
    const EN = c => toEN(c[0], c[1]);
    const M = (k, o) => lam('hd-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const hid = new THREE.MeshBasicMaterial({ visible: false });
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.min(4096, Math.round(w))); c.height = Math.max(4, Math.min(2048, Math.round(h))); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const cream = M('cream', { color: '#ece2c8', emissive: '#2c2a22' }), creamD = M('creamD', { color: '#e2d6b8', emissive: '#28251d' });
    const white = M('white', { color: '#f6f4ee', emissive: '#3a3935' }), black = M('black', { color: '#22252a' }), conc = M('conc', { color: '#d9d5ca' });
    // ---------- facade canvas: brick / cream panel body, bands, parapet with diamond trim, painted windows
    const PX = 14;
    function facade(key, len, H, o) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX, Wc = c.width;
      let s = 11 + key.length * 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      if (o.body === 'cream') {
        x.fillStyle = o.col || '#e7ddc4'; x.fillRect(0, 0, Wc, c.height);
        x.fillStyle = 'rgba(120,105,80,0.22)';
        for (let u = 3.05; u < len; u += 3.05) x.fillRect(U(u) - 1, 0, 1.5, c.height);
        for (let h = 1.5; h < H; h += 3.0) x.fillRect(0, Y(h), Wc, 1.2);
        x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(0, 0, Wc, Y(H - 0.6));
      } else {
        x.fillStyle = '#a9553f'; x.fillRect(0, 0, Wc, c.height);
        for (let r = 0, hh = 0; hh < H; r++, hh += 0.32) for (let u = (r % 2) * 0.32; u < len; u += 0.64) {
          const t = rnd(); x.fillStyle = t < 0.3 ? '#9f4e3a' : t < 0.6 ? '#b45e46' : t < 0.82 ? '#ab5741' : '#97483a'; x.fillRect(U(u), Y(hh + 0.32) + 1, 0.62 * PX, 0.32 * PX - 1); }
        x.fillStyle = 'rgba(80,45,32,0.22)'; for (let hh = 0; hh < H; hh += 0.32) x.fillRect(0, Y(hh), Wc, 1);
        x.fillStyle = '#8e4434'; x.fillRect(0, Y(0.4), Wc, 0.4 * PX);
      }
      for (const [z, h, col] of (o.bands || [])) { x.fillStyle = col || '#e9dfc5'; x.fillRect(0, Y(z + h), Wc, h * PX); x.fillStyle = 'rgba(90,80,60,0.35)'; x.fillRect(0, Y(z), Wc, 1); }
      if (o.para) {   // cream parapet band from o.para to the top with dark diamond trim
        x.fillStyle = '#ebe1c7'; x.fillRect(0, 0, Wc, Y(o.para)); x.fillStyle = 'rgba(90,80,60,0.4)'; x.fillRect(0, Y(o.para), Wc, 1.5);
        const zc = (o.para + H) / 2, r = Math.min(0.42, (H - o.para) * 0.36); x.fillStyle = '#5b3428';
        for (let u = (o.dOff || 2.4); u < len - 0.6; u += (o.dStep || 4.8)) { x.beginPath(); x.moveTo(U(u), Y(zc + r)); x.lineTo(U(u + r), Y(zc)); x.lineTo(U(u), Y(zc - r)); x.lineTo(U(u - r), Y(zc)); x.closePath(); x.fill(); }
      }
      const glass = (u, z, w, h) => { const gr = x.createLinearGradient(0, Y(z + h), 0, Y(z)); gr.addColorStop(0, '#8ea6b8'); gr.addColorStop(1, '#3c4d5c'); x.fillStyle = gr; x.fillRect(U(u), Y(z + h), w * PX, h * PX); };
      for (const it of (o.items || [])) {
        if (it.k === 'tall') {   // tall window, cream surround, square fanlight grid on top
          const { u, w, z0, z1 } = it, f0 = z1 - w;
          x.fillStyle = '#ece3cb'; x.fillRect(U(u - w / 2 - 0.35), Y(z1 + 0.35), (w + 0.7) * PX, (z1 - z0 + 0.6) * PX);
          glass(u - w / 2, z0, w, z1 - z0);
          x.fillStyle = '#f3efe4'; x.fillRect(U(u) - 1, Y(f0), 2, (f0 - z0) * PX); for (let h = z0 + 1.6; h < f0 - 0.2; h += 1.6) x.fillRect(U(u - w / 2), Y(h) - 1, w * PX, 2);
          x.fillRect(U(u - w / 2), Y(f0) - 2, w * PX, 3);
          x.strokeStyle = '#f3efe4'; x.lineWidth = 1.3; x.beginPath();
          for (let k = -4; k <= 4; k++) { const a = u + k * w / 4; x.moveTo(U(a - w), Y(f0)); x.lineTo(U(a + w), Y(f0 + 2 * w)); x.moveTo(U(a + w), Y(f0)); x.lineTo(U(a - w), Y(f0 + 2 * w)); }
          x.save(); x.beginPath(); x.rect(U(u - w / 2), Y(z1), w * PX, w * PX); x.clip(); x.beginPath();
          for (let k = -4; k <= 4; k++) { const a = u + k * w / 4; x.moveTo(U(a - w), Y(f0)); x.lineTo(U(a + w), Y(f0 + 2 * w)); x.moveTo(U(a + w), Y(f0)); x.lineTo(U(a - w), Y(f0 + 2 * w)); }
          x.stroke(); x.restore();
        } else if (it.k === 'win') {
          x.fillStyle = '#ece3cb'; x.fillRect(U(it.u - it.w / 2 - 0.2), Y(it.z + it.h + 0.35), (it.w + 0.4) * PX, 0.35 * PX); x.fillRect(U(it.u - it.w / 2 - 0.15), Y(it.z), (it.w + 0.3) * PX, 0.15 * PX);
          x.fillStyle = '#f2f0e9'; x.fillRect(U(it.u - it.w / 2), Y(it.z + it.h), it.w * PX, it.h * PX);
          glass(it.u - it.w / 2 + 0.08, it.z + 0.08, it.w - 0.16, it.h - 0.16);
          x.fillStyle = '#f2f0e9'; x.fillRect(U(it.u) - 1, Y(it.z + it.h), 2, it.h * PX);
        } else if (it.k === 'glass') {
          x.fillStyle = '#e8e6df'; x.fillRect(U(it.u - 0.1), Y(it.z + it.h + 0.1), (it.w + 0.2) * PX, (it.h + 0.2) * PX);
          glass(it.u, it.z, it.w, it.h);
          x.fillStyle = '#e4e2da'; const n = Math.max(1, Math.round(it.w / 1.5)); for (let k = 1; k < n; k++) x.fillRect(U(it.u + k * it.w / n) - 1, Y(it.z + it.h), 2, it.h * PX);
          for (let hh = it.z + 2.7; hh < it.z + it.h - 0.3; hh += 2.7) x.fillRect(U(it.u), Y(hh) - 1, it.w * PX, 3);
          if (it.door) { x.fillStyle = '#26303a'; for (let k = 0; k < n; k++) if (k % 2 === 0 || n < 3) x.fillRect(U(it.u + k * it.w / n + 0.12), Y(it.z + 2.3), (it.w / n - 0.24) * PX, 2.3 * PX); }
        } else if (it.k === 'door') {
          x.fillStyle = it.c || '#8a8d90'; x.fillRect(U(it.u - it.w / 2), Y(it.h), it.w * PX, it.h * PX);
          if (it.ovh) { x.fillStyle = 'rgba(0,0,0,0.18)'; for (let h = 0.5; h < it.h; h += 0.55) x.fillRect(U(it.u - it.w / 2), Y(h), it.w * PX, 1); }
        }
      }
      return M('fac-' + key, { map: texOf(c), emissive: o.body === 'cream' ? '#2a271f' : '#1c1410' });
    }
    // ---------- roofs: white membrane with seams, cream coping on the parapet edges
    const rc = cvs(64, 64), rx = rc.getContext('2d'); rx.fillStyle = '#e9e8e2'; rx.fillRect(0, 0, 64, 64); rx.fillStyle = '#d6d5cf'; rx.fillRect(0, 0, 64, 2); rx.fillStyle = 'rgba(0,0,0,0.04)'; rx.fillRect(0, 30, 64, 1);
    const roofT = texOf(rc, true), roofM = M('roof', { map: roofT, emissive: '#3b3b38' });
    function part(p, mats) {
      const [a, b] = [EN(p.sw), EN(p.ne)], W = b[0] - a[0], D = b[1] - a[1], cx = (a[0] + b[0]) / 2, cz = -(a[1] + b[1]) / 2, H = p.h;
      const m = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [mats.e || hid, mats.w || hid, hid, hid, mats.s || hid, mats.n || hid]); m.position.set(cx, H / 2, cz); g.add(m);
      const rg = new THREE.PlaneGeometry(W, D), uv = rg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W / 3.0, uv.getY(i) * D / 3.0);
      const r = new THREE.Mesh(rg, roofM); r.rotation.x = -Math.PI / 2; r.position.set(cx, H + 0.01, cz); g.add(r);
      const cp = p.cope === undefined ? 0.45 : p.cope, cm = p.copeM || cream, t = 0.35;
      if (cp > 0) { g.add(box(W + 0.1, cp, t, cx, H, cz - D / 2 + t / 2 - 0.05, cm)); g.add(box(W + 0.1, cp, t, cx, H, cz + D / 2 - t / 2 + 0.05, cm));
        g.add(box(t, cp, D, cx - W / 2 + t / 2 - 0.05, H, cz, cm)); g.add(box(t, cp, D, cx + W / 2 - t / 2 + 0.05, H, cz, cm)); }
      return { x0: a[0], x1: b[0], y0: a[1], y1: b[1], W, D, cx, cz, H };
    }
    const P = B.parts, len = p => { const [a, b] = [EN(p.sw), EN(p.ne)]; return [b[0] - a[0], b[1] - a[1]]; };
    const wingWins = (L0, step, off, extra) => { const out = []; for (let u = off; u < L0 - 1.2; u += step) out.push({ k: 'win', u, w: 1.5, z: 1.0, h: 2.6 }); return out.concat(extra || []); };
    // fly tower + auditorium (cream)
    { const p = P.ft, [W, D] = len(p), o = { body: 'cream', col: '#e9e0c9' };
      part(p, { e: facade('ft-e', D, p.h, o), w: facade('ft-w', D, p.h, o), s: facade('ft-s', W, p.h, o), n: facade('ft-n', W, p.h, o) }); }
    { const p = P.au, [W, D] = len(p), o = { body: 'cream' };
      part(p, { e: facade('au-e', D, p.h, o), w: facade('au-w', D, p.h, o), s: facade('au-s', W, p.h, o) }); }
    // front block: brick, cream band + cornice, tall fanlight windows either side of the portico, glazing behind it
    { const p = P.fl, [W, D] = len(p), po = EN(B.po.sw)[0] - EN(p.sw)[0], po1 = EN(B.po.ne)[0] - EN(p.sw)[0];
      const bands = [[8.55, 0.5], [p.h - 1.15, 1.15]];
      part(p, { s: facade('fl-s', W, p.h, { bands, items: [{ k: 'tall', u: po / 2 + 0.3, w: 2.5, z0: 0.9, z1: 8.2 }, { k: 'tall', u: (po1 + W) / 2 - 0.3, w: 2.5, z0: 0.9, z1: 8.2 },
          { k: 'glass', u: po + 1.6, w: po1 - po - 3.2, z: 0.25, h: 8.0, door: true }] }),
        e: facade('fl-e', D, p.h, { bands }), w: facade('fl-w', D, p.h, { bands }) }); }
    // stage / support block: brick, tall windows on the east (Northwest Dr) side, loading doors on the north
    { const p = P.nb, [W, D] = len(p), ep0 = EN(B.ep.sw)[1] - EN(p.sw)[1], ep1 = EN(B.ep.ne)[1] - EN(p.sw)[1], bands = [[p.h - 0.7, 0.7]];
      const tall = u => ({ k: 'tall', u, w: 2.3, z0: 1.0, z1: 9.6 });
      part(p, { e: facade('nb-e', D, p.h, { bands, items: [tall(ep0 / 2), { k: 'glass', u: ep0 + 1.6, w: ep1 - ep0 - 3.2, z: 0.2, h: 4.6, door: true }, tall(ep1 + 4.2), tall(ep1 + 10.6), tall(D - 3.0)] }),
        n: facade('nb-n', W, p.h, { bands, items: [{ k: 'door', u: 11, w: 3.6, h: 4.3, ovh: 1 }, { k: 'door', u: 15.6, w: 3.6, h: 4.3, ovh: 1 }, { k: 'door', u: 20, w: 1.0, h: 2.2, c: '#6e6a63' }]
          .concat([28, 32, 36, 40, 44, 48].map(u => ({ k: 'win', u, w: 1.3, z: 2.6, h: 1.6 }))) }),
        w: facade('nb-w', D, p.h, { bands, items: [{ k: 'door', u: 12, w: 1.0, h: 2.2, c: '#6e6a63' }, { k: 'door', u: 30, w: 3.0, h: 3.6, ovh: 1 }] }),
        s: facade('nb-s', W, p.h, { bands }) }); }
    // lower wings: brick with cream parapet + diamond trim, punched windows
    const wing = (k, p, items) => { const [W, D] = len(p), o = it => ({ para: p.h - 1.25, items: it });
      part(p, { e: items.e ? facade(k + '-e', D, p.h, o(items.e(D))) : null, w: items.w ? facade(k + '-w', D, p.h, o(items.w(D))) : null,
        s: items.s ? facade(k + '-s', W, p.h, o(items.s(W))) : null, n: items.n ? facade(k + '-n', W, p.h, o(items.n(W))) : null }); };
    wing('ew', P.ew, { e: D => wingWins(D, 4.6, 6.0, [{ k: 'glass', u: 1.2, w: 3.0, z: 0.2, h: 3.0, door: true }]), s: W => [{ k: 'win', u: W * 0.3, w: 1.5, z: 1.0, h: 2.6 }, { k: 'win', u: W * 0.7, w: 1.5, z: 1.0, h: 2.6 }], n: () => [] });
    wing('wwm', P.wwm, { w: D => wingWins(D, 5.0, 2.6) });
    wing('wws', P.wws, { w: () => [{ k: 'door', u: 5, w: 1.0, h: 2.2, c: '#6e6a63' }], s: W => [{ k: 'win', u: W * 0.3, w: 1.5, z: 1.0, h: 2.6 }, { k: 'win', u: W * 0.72, w: 1.5, z: 1.0, h: 2.6 }], n: () => [] });
    wing('wwn', P.wwn, { w: () => [{ k: 'door', u: 5, w: 1.0, h: 2.2, c: '#6e6a63' }], s: () => [], n: () => [] });
    // fly-tower smoke hatches (not HVAC) and the screened mechanical recess on the support block (units omitted on purpose)
    { const [a, b] = [EN(P.ft.sw), EN(P.ft.ne)], yc = -(a[1] + b[1]) / 2, hm = M('hatch', { color: '#cfcfca', emissive: '#262624' });
      for (let i = 0; i < 6; i++) g.add(box(1.4, 0.5, 1.1, a[0] + (b[0] - a[0]) * (i + 1.5) / 9, P.ft.h, yc, hm)); }
    { const [a, b] = [EN(B.well.sw), EN(B.well.ne)], W = b[0] - a[0], D = b[1] - a[1], cx = (a[0] + b[0]) / 2, cz = -(a[1] + b[1]) / 2, y = P.nb.h, scr = M('screen', { color: '#c9c9c4', emissive: '#22221f' });
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M('wellfl', { color: '#8d9093' })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, y + 0.03, cz); g.add(fl);
      g.add(box(W, 1.3, 0.2, cx, y, cz - D / 2, scr)); g.add(box(W, 1.3, 0.2, cx, y, cz + D / 2, scr)); g.add(box(0.2, 1.3, D, cx - W / 2, y, cz, scr)); g.add(box(0.2, 1.3, D, cx + W / 2, y, cz, scr)); }
    // ---------- text plate helper (entablature fronts)
    function plate(w, h, txt, size) {
      const c = cvs(w * 64, h * 64), k = c.getContext('2d'); k.fillStyle = '#f2ede1'; k.fillRect(0, 0, c.width, c.height);
      k.fillStyle = '#d8d0bd'; k.fillRect(0, 0, c.width, 0.18 * 64); k.fillRect(0, c.height - 0.3 * 64, c.width, 3);
      k.fillStyle = '#2a2a2b'; k.font = 'bold ' + Math.round(size * 64) + 'px Georgia, "DejaVu Serif", "Times New Roman", serif'; k.textAlign = 'center'; k.textBaseline = 'middle';
      k.fillText(txt.split('').join(String.fromCharCode(8202)), c.width / 2, c.height * 0.55); return M('plate-' + txt + w.toFixed(1), { map: texOf(c), emissive: '#2e2d2a' });
    }
    // ---------- south portico: steps, 4 front + 2 rear columns, HEINDL CENTER entablature, pediment with gray roof
    { const [a, b] = [EN(B.po.sw), EN(B.po.ne)], x0 = a[0], x1 = b[0], yF = a[1], yB = b[1], pw = x1 - x0, xc = (x0 + x1) / 2, zF = -yF, zB = -yB;
      g.add(box(pw + 1.2, 0.18, 2.2, xc, 0, zF + 1.6, conc)); g.add(box(pw + 0.6, 0.36, yB - yF + 0.4, xc, 0, (zF + zB) / 2 + 0.2, conc));
      const colM = lam('hd-col', { color: '#f4f0e4', emissive: '#3c3a34' }), TOP = 8.7, y0 = 0.36;
      const xs = [x0 + 0.9, x0 + 0.9 + (pw - 1.8) / 3, x1 - 0.9 - (pw - 1.8) / 3, x1 - 0.9];
      const col = (x, z) => { g.add(box(1.15, 0.5, 1.15, x, y0, z, white)); g.add(cyl(0.5, 0.43, TOP - y0 - 1.0, x, y0 + 0.5, z, colM, 24)); g.add(cyl(0.48, 0.6, 0.22, x, TOP - 0.5, z, white, 24)); g.add(box(1.2, 0.28, 1.2, x, TOP - 0.28, z, white)); };
      for (const x of xs) col(x, zF - 0.8);
      for (const x of [xs[0], xs[3]]) col(x, zB + 2.6);
      const EH = 1.7, ent = plate(pw, EH, 'HEINDL CENTER', 0.62);
      const eb = new THREE.Mesh(new THREE.BoxGeometry(pw, EH, yB - yF), [white, white, white, white, ent, white]); eb.position.set(xc, TOP + EH / 2, (zF + zB) / 2); g.add(eb);
      g.add(box(pw + 0.6, 0.3, yB - yF + 0.3, xc, TOP + EH, (zF + zB) / 2 + 0.15, cream));
      const base = TOP + EH + 0.3, rise = 2.5, half = pw / 2 + 0.3;
      const shp = new THREE.Shape([new THREE.Vector2(-half, 0), new THREE.Vector2(half, 0), new THREE.Vector2(0, rise)]);
      const pg = new THREE.ExtrudeGeometry(shp, { depth: yB - yF + 0.3, bevelEnabled: false }); pg.translate(0, 0, -(yB - yF + 0.3));
      const ped = new THREE.Mesh(pg, lam('hd-ped', { color: '#f3efe4', emissive: '#3a3833', side: THREE.DoubleSide })); ped.position.set(xc, base, zF + 0.3); g.add(ped);
      const roofG = M('proof', { color: '#7b8087', emissive: '#16181a', side: THREE.DoubleSide }), sl = Math.atan2(rise, half), rl = Math.hypot(rise, half) + 0.3;
      for (const sg of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(rl, 0.14, yB - yF + 0.6), roofG); r.position.set(xc + sg * half / 2, base + rise / 2 + 0.12, (zF + zB) / 2 + 0.1); r.rotation.z = -sg * sl; g.add(r);
        const k = new THREE.Mesh(new THREE.BoxGeometry(rl, 0.3, 0.45), cream); k.position.set(xc + sg * half / 2, base + rise / 2 + 0.05, zF + 0.4); k.rotation.z = -sg * sl; g.add(k); }
      g.add(box(pw + 0.7, 0.32, 0.5, xc, base - 0.05, zF + 0.4, cream)); }
    // ---------- east portico (Northwest Dr side): brick piers, cream HEINDL CENTER entablature, flat cap
    { const [a, b] = [EN(B.ep.sw), EN(B.ep.ne)], x0 = a[0], x1 = b[0], z0 = -a[1], z1 = -b[1], pw = a[1] - b[1], zc = (z0 + z1) / 2, d = x1 - x0, TOP = 5.0;
      const bt = brickTex(['#a9553f', '#b45e46', '#9f4e3a', '#ab5741']), brick = lam('hd-brick', { map: bt, emissive: '#140c08' });
      for (const z of [z0 - 0.5, z1 + 0.5, zc - 2.4, zc + 2.4]) { const pb = box(0.9, TOP, 0.9, x1 - 0.5, 0, z, brick); g.add(pb); g.add(box(1.05, 0.2, 1.05, x1 - 0.5, TOP - 0.2, z, cream)); }
      const ent = plate(Math.abs(pw), 1.2, 'HEINDL CENTER', 0.5), eb = new THREE.Mesh(new THREE.BoxGeometry(d + 0.3, 1.2, Math.abs(pw) + 0.4), [ent, white, white, white, white, white]);
      eb.position.set((x0 + x1) / 2 + 0.15, TOP + 0.6, zc); g.add(eb); g.add(box(d + 0.8, 0.25, Math.abs(pw) + 0.9, (x0 + x1) / 2 + 0.3, TOP + 1.2, zc, cream));
      g.add(box(d + 2.5, 0.2, Math.abs(pw) - 1.0, (x0 + x1) / 2 + 1.0, 0, zc, conc)); }
    // ---------- west service yard: brick screen wall + equipment
    { const bt = brickTex(['#a9553f', '#b45e46', '#9f4e3a', '#ab5741']), brick = lam('hd-brickD', { map: bt, side: THREE.DoubleSide, emissive: '#140c08' });
      const YP = B.yard.map(EN);
      for (let i = 0; i < YP.length - 1; i++) { const a = YP[i], b = YP[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const ge = new THREE.BoxGeometry(Ls, 2.4, 0.3), uv = ge.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * Ls / 0.8, uv.getY(k) * 2.4 / 0.3);
        const w = new THREE.Mesh(ge, brick); w.position.set((a[0] + b[0]) / 2, 1.2, -(a[1] + b[1]) / 2); w.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(w);
        const cp = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.3, 0.1, 0.42), cream); cp.position.set(w.position.x, 2.45, w.position.z); cp.rotation.y = w.rotation.y; g.add(cp); }
      const teal = M('teal', { color: '#3f8f8b' });
      for (const e of B.equip) { const [x, y] = EN(e.c); g.add(box(e.w, e.h, e.d, x, 0, -y, teal)); g.add(box(e.w + 0.3, 0.15, e.d + 0.3, x, 0, -y, conc)); } }
    // ---------- plaza: black bollards + double-lantern lamp posts
    { const bm = M('bollard', { color: '#1f2226' });
      for (const c of B.bollards) { const [x, y] = EN(c); g.add(cyl(0.11, 0.11, 0.95, x, 0, -y, bm, 10)); g.add(cyl(0.13, 0.13, 0.05, x, 0.95, -y, bm, 10)); }
      const lampM = lam('hd-lamp', { color: '#fff9e4', emissive: '#bdb48f' });
      for (const c of B.lamps) { const [x, y] = EN(c), z = -y; g.add(cyl(0.18, 0.18, 0.5, x, 0, z, black, 10)); g.add(cyl(0.07, 0.09, 4.4, x, 0.5, z, black, 8));
        for (const s of [-1, 1]) { g.add(box(0.9, 0.06, 0.06, x + s * 0.45, 4.6, z, black)); g.add(box(0.36, 0.5, 0.36, x + s * 0.85, 4.05, z, lampM)); g.add(box(0.44, 0.12, 0.44, x + s * 0.85, 4.55, z, black)); } } }
    // ---------- NORTHWEST sign on the Northwest Dr entrance wall: stone panel with the seal, brick piers with ball tops
    if (B.sign) { const S = B.sign, [x, y] = EN(S.c), sgn = new THREE.Group(); sgn.position.set(x, 0, -y); sgn.rotation.y = (90 - S.bearing) * Math.PI / 180;
      const bt = brickTex(['#9c4632', '#a84e38', '#8f3f2d', '#b0573e']), brick = lam('hd-signbrick', { map: bt, emissive: '#140c08' });
      const Wp = S.len, c = cvs(Wp * 80, 1.3 * 80), k = c.getContext('2d'); k.fillStyle = '#cfcac0'; k.fillRect(0, 0, c.width, c.height);
      k.fillStyle = 'rgba(0,0,0,0.08)'; k.fillRect(0, c.height - 6, c.width, 6);
      k.fillStyle = '#2f3a4a'; k.textBaseline = 'middle'; k.textAlign = 'left'; k.font = 'bold ' + Math.round(0.42 * 80) + 'px Georgia, "DejaVu Serif", serif';
      k.fillText('NORTHWEST', 1.25 * 80, 0.5 * 80); k.font = Math.round(0.15 * 80) + 'px Georgia, "DejaVu Serif", serif'; k.fillText('MISSISSIPPI COMMUNITY COLLEGE', 1.27 * 80, 0.86 * 80);
      k.strokeStyle = '#2f3a4a'; k.lineWidth = 4; k.beginPath(); k.arc(0.62 * 80, 0.62 * 80, 0.42 * 80, 0, Math.PI * 2); k.stroke(); k.beginPath(); k.arc(0.62 * 80, 0.62 * 80, 0.3 * 80, 0, Math.PI * 2); k.lineWidth = 2; k.stroke();
      const face = M('signface', { map: texOf(c), emissive: '#2a2a28' }), stone = M('signstone', { color: '#cfcac0', emissive: '#22221f' });
      const pn = new THREE.Mesh(new THREE.BoxGeometry(Wp, 1.3, 0.55), [stone, stone, stone, stone, face, face]); pn.position.set(0, 0.25 + 0.65, 0); sgn.add(pn);
      sgn.add(box(Wp + 0.2, 0.25, 0.65, 0, 0, 0, brick)); sgn.add(box(Wp + 0.2, 0.1, 0.65, 0, 1.55, 0, cream));
      for (const s of [-1, 1]) { sgn.add(box(0.75, 1.9, 0.75, s * (Wp / 2 + 0.38), 0, 0, brick)); sgn.add(box(0.85, 0.12, 0.85, s * (Wp / 2 + 0.38), 1.9, 0, cream));
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), white); ball.position.set(s * (Wp / 2 + 0.38), 2.32, 0); sgn.add(ball); }
      g.add(sgn); }
    return g;
  }
  // <<< HEINDL-50 build
  // LAFAYETTE-20 build >>>
  // #20 Lafayette Humanities Building (3-story red brick box with projecting N and S bays, white fascia band and lower base, brick
  // pilasters with narrow windows, glass stair strips beside the bays, north entrance with flat canopy + steps, teal standing-seam hip
  // roof with cross-hipped bays and a small ridge vent) + the ground-level mechanical yard on the east side. NO ground shadows.
  function buildLafayette() {
    const B = L.lafayette, g = new THREE.Group(); g.name = 'lafayette-hall';
    const EN = c => toEN(c[0], c[1]);
    const M = (k, o) => lam('lf-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const hid = new THREE.MeshBasicMaterial({ visible: false });
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const white = M('white', { color: '#f4f2ec', emissive: '#3a3935' }), conc = M('conc', { color: '#d8d4c9' }), rail = M('rail', { color: '#2a2d31' });
    const PX = 20, H = B.eave, FB = B.fascia;   // fascia band from H - FB to H
    function facade(key, len, o) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 5 + key.length * 13; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      x.fillStyle = '#ad5a43'; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) {
        const t = rnd(); x.fillStyle = t < 0.3 ? '#a4523d' : t < 0.6 ? '#b6614a' : t < 0.82 ? '#ae5b45' : '#9a4c39'; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(80,45,32,0.2)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      for (const u of (o.pil || [])) {   // brick pilaster: lit edge + shadow edge, narrow dark window slot beside it
        x.fillStyle = 'rgba(255,230,210,0.18)'; x.fillRect(U(u - 0.35), 0, 0.12 * PX, c.height); x.fillStyle = 'rgba(40,20,12,0.28)'; x.fillRect(U(u + 0.35), 0, 0.14 * PX, c.height);
        if (o.slots) { const gr = x.createLinearGradient(0, Y(H - FB), 0, Y(o.base || 0.6)); gr.addColorStop(0, '#556673'); gr.addColorStop(1, '#2c3843'); x.fillStyle = gr; x.fillRect(U(u + 0.6), Y(H - FB - 0.4), 0.42 * PX, (H - FB - 0.4 - (o.base || 0.6) - 0.6) * PX); }
      }
      x.fillStyle = '#f3f1ea'; x.fillRect(0, Y(0.6), c.width, 0.6 * PX);                      // white base course
      if (o.base) { x.fillStyle = '#eeece5'; x.fillRect(0, Y(o.base), c.width, o.base * PX); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, Y(o.base), c.width, 2); }
      x.fillStyle = '#f6f4ee'; x.fillRect(0, 0, c.width, FB * PX); x.fillStyle = 'rgba(0,0,0,0.10)'; x.fillRect(0, FB * PX - 2, c.width, 2);   // white fascia band
      for (const u of (o.down || [])) { x.fillStyle = '#f1efe8'; x.fillRect(U(u) - 2, Y(H - FB), 4, (H - FB) * PX); }
      for (const it of (o.items || [])) {
        if (it.k === 'strip') {   // tall glass stair window
          x.fillStyle = '#e9e7e0'; x.fillRect(U(it.u - 0.1), Y(it.z1 + 0.1), (it.w + 0.2) * PX, (it.z1 - it.z0 + 0.2) * PX);
          const gr = x.createLinearGradient(0, Y(it.z1), 0, Y(it.z0)); gr.addColorStop(0, '#7d8f9c'); gr.addColorStop(1, '#2f3b46'); x.fillStyle = gr; x.fillRect(U(it.u), Y(it.z1), it.w * PX, (it.z1 - it.z0) * PX);
          x.fillStyle = '#c9c4b4'; for (let h = it.z0 + 1.0; h < it.z1; h += 3.3) x.fillRect(U(it.u), Y(h + 0.9), it.w * PX, 0.9 * PX);   // tan spandrels at the floor lines
          x.fillStyle = '#dcd9d0'; x.fillRect(U(it.u + it.w / 2) - 1, Y(it.z1), 2, (it.z1 - it.z0) * PX);
        } else if (it.k === 'door') {
          x.fillStyle = '#2b333b'; x.fillRect(U(it.u), Y(it.h), it.w * PX, it.h * PX); x.fillStyle = '#9aa3a8'; x.fillRect(U(it.u + it.w / 2) - 1, Y(it.h), 2, it.h * PX);
        } else if (it.k === 'text') {
          x.fillStyle = '#f2efe6'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold ' + Math.round(0.34 * PX) + 'px "DejaVu Sans", Arial, sans-serif';
          x.fillText(it.t1.split('').join(' '), U(it.u), Y(it.z + 0.55)); x.fillText(it.t2, U(it.u), Y(it.z));
        }
      }
      return M('fac-' + key, { map: texOf(c), emissive: '#1c1410' });
    }
    // ---------- teal standing-seam roof texture (1 m tile, seams every 0.5 m running down the slope)
    const rc = cvs(64, 64), rx = rc.getContext('2d'); rx.fillStyle = '#3f9a95'; rx.fillRect(0, 0, 64, 64);
    for (const u of [0, 32]) { rx.fillStyle = '#5fb5ae'; rx.fillRect(u, 0, 2, 64); rx.fillStyle = '#2f7b77'; rx.fillRect(u + 2, 0, 2, 64); }
    const roofM = lam('lf-roof', { map: texOf(rc, true), side: THREE.DoubleSide, emissive: '#0d1b1a' });
    function hip(x0, x1, z0, z1, y, pitch) {   // as buildLamar(): ridge along the longer side, UV u = metres along the eave, v = up-slope
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
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); ge.computeVertexNormals();
      return { mesh: new THREE.Mesh(ge, roofM), ridge: r };
    }
    // ---------- walls
    const R = k => { const [a, b] = B[k].map(EN); return { x0: a[0], y0: a[1], x1: b[0], y1: b[1], W: b[0] - a[0], D: b[1] - a[1], cx: (a[0] + b[0]) / 2, cz: -(a[1] + b[1]) / 2 }; };
    const mn = R('main'), nb = R('nbay'), sb = R('sbay');
    const pils = (len, step) => { const o = []; for (let u = step / 2; u < len - 0.8; u += step) o.push(u); return o; };
    const nU0 = mn.x1 - nb.x1, nU1 = mn.x1 - nb.x0;            // N bay span on the main north face (u from the east)
    const sU0 = sb.x0 - mn.x0, sU1 = sb.x1 - mn.x0;            // S bay span on the main south face (u from the west)
    const mainMats = [
      facade('me', mn.D, { pil: pils(mn.D, 3.7), slots: true, base: 2.6, down: [0.3, mn.D - 0.3] }),
      facade('mw', mn.D, { pil: pils(mn.D, 3.7), slots: true, down: [0.3, mn.D - 0.3] }), hid, hid,
      facade('ms', mn.W, { pil: pils(sU0, 3.6).concat(pils(mn.W - sU1, 3.6).map(u => u + sU1)), slots: true, down: [0.3, mn.W - 0.3],
        items: [{ k: 'strip', u: sU1 + 0.25, w: 1.7, z0: 0.6, z1: H - FB - 0.3 }] }),
      facade('mn', mn.W, { base: 2.6, pil: pils(mn.W - nU1, 3.6).map(u => u + nU1), slots: true, down: [0.3, mn.W - 0.3],
        items: [{ k: 'text', u: (nU0 - 2.3) / 2, z: 6.2, t1: 'LAFAYETTE', t2: 'HUMANITIES BUILDING' }, { k: 'strip', u: nU0 - 2.05, w: 1.8, z0: 3.4, z1: H - FB - 0.3 }, { k: 'door', u: nU0 - 1.95, w: 1.6, h: 2.5 }] })];
    const wb = new THREE.Mesh(new THREE.BoxGeometry(mn.W, H, mn.D), mainMats); wb.position.set(mn.cx, H / 2, mn.cz); g.add(wb);
    for (const [bx, k, faces] of [[nb, 'n', { n: 1, e: 1, w: 1 }], [sb, 's', { s: 1, e: 1, w: 1 }]]) {
      const pm = s => facade('b' + k + s, s === 'n' || s === 's' ? bx.W : bx.D, { down: [0.25, (s === 'n' || s === 's' ? bx.W : bx.D) - 0.25] });
      const m = new THREE.Mesh(new THREE.BoxGeometry(bx.W, H, bx.D), [faces.e ? pm('e') : hid, faces.w ? pm('w') : hid, hid, hid, faces.s ? pm('s') : hid, faces.n ? pm('n') : hid]);
      m.position.set(bx.cx, H / 2, bx.cz); g.add(m); }
    // ---------- eave soffit + roofs (main hip, cross-hipped bays tying into it), ridge vent
    const ov = 0.6, yR = H + 0.02;
    for (const bx of [mn, nb, sb]) g.add(box(bx.W + 2 * ov, 0.18, bx.D + 2 * ov, bx.cx, H - 0.16, bx.cz, white));
    const main = hip(mn.x0 - ov, mn.x1 + ov, mn.cz - mn.D / 2 - ov, mn.cz + mn.D / 2 + ov, yR, B.pitch); g.add(main.mesh);
    g.add(hip(nb.x0 - ov, nb.x1 + ov, nb.cz - nb.D / 2 - ov, nb.cz + nb.D / 2 + 8, yR, B.pitch).mesh);   // runs 8 m into the main roof
    g.add(hip(sb.x0 - ov, sb.x1 + ov, sb.cz - sb.D / 2 - 8, sb.cz + sb.D / 2 + ov, yR, B.pitch).mesh);
    const vent = M('vent', { color: '#e7e5df', emissive: '#2b2a27' });
    g.add(box(1.2, 0.9, 1.6, mn.cx, main.ridge - 0.25, mn.cz, vent)); g.add(box(1.5, 0.12, 1.9, mn.cx, main.ridge + 0.6, mn.cz, vent));
    // ---------- north entrance: flat canopy, steps, rails (re-entrant corner west of the N bay)
    { const ex = nb.x1 + 1.15, ez = -mn.y1;
      g.add(box(2.8, 0.22, 2.2, ex, 3.1, ez - 1.1, white)); g.add(box(0.12, 3.1, 0.12, ex - 1.3, 0, ez - 2.1, rail));
      for (let i = 0; i < 4; i++) g.add(box(2.6, 0.17 * (4 - i), 0.32, ex, 0, ez - 0.2 - (3 - i) * 0.32 - 0.6, conc));
      g.add(box(2.6, 0.7, 0.6, ex, 0, ez - 0.3, conc));
      for (const sx of [-1.25, 1.25]) { g.add(box(0.05, 0.05, 1.6, ex + sx, 1.0, ez - 1.6, rail)); g.add(box(0.05, 1.0, 0.05, ex + sx, 0.0, ez - 2.4, rail)); } }
    // ---------- ground-level mechanical yard (white screen walls; units kept as two plain boxes)
    { const YP = B.yard.map(EN), wm = M('yardwall', { color: '#ecebe5', emissive: '#2c2b28', side: THREE.DoubleSide });
      for (let i = 0; i < YP.length - 1; i++) { const a = YP[i], b = YP[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const w = new THREE.Mesh(new THREE.BoxGeometry(Ls, 2.4, 0.25), wm); w.position.set((a[0] + b[0]) / 2, 1.2, -(a[1] + b[1]) / 2); w.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(w); }
      const um = M('unit', { color: '#a9adb1', emissive: '#1a1b1c' });
      for (const u of B.units) { const [x, y] = EN(u); g.add(box(2.0, 1.4, 2.4, x, 0, -y, um)); }
      const [a, b] = [B.yard[0], B.yard[2]].map(EN); const pad = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])), conc);
      pad.rotation.x = -Math.PI / 2; pad.position.set((a[0] + b[0]) / 2, 0.04, -(a[1] + b[1]) / 2); g.add(pad); }
    return g;
  }
  // <<< LAFAYETTE-20 build
  // YALOBUSHA-51 build >>>
  // #51 Yalobusha Hall (2-story red brick, white cornice + window surrounds, gray hip roof with three black half-round louvered vents on
  // the NW slope, NW entry with 2 white columns + balustrade balcony, SE portico with 4 columns + balustrade top, low brick lattice screen
  // walls, chain-link equipment yard, flag pole) and #58 Strategic Communications (1-story brick, hip roof with flat silver deck +
  // cupola). Each building is drawn in its own rotated frame (x = along the long side, -z = toward the "v" side). NO ground shadows.
  function buildYalobusha() {
    const B = L.yalobusha, root_ = new THREE.Group(); root_.name = 'yalobusha-hall';
    const EN = c => toEN(c[0], c[1]);
    const M = (k, o) => lam('yb-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const hid = new THREE.MeshBasicMaterial({ visible: false });
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const white = M('white', { color: '#f5f3ee', emissive: '#3b3a36' }), conc = M('conc', { color: '#d9d5ca' }), dark = M('dark', { color: '#202327' });
    const brickM = M('brickwall', { color: '#a9573f', emissive: '#1c120e' });
    const PX = 20;
    function frame(F) {   // F: {o, u, v} lng/lat corners -> group in the building frame
      const o = EN(F.o), a = EN(F.u), b = EN(F.v), L_ = Math.hypot(a[0] - o[0], a[1] - o[1]), D_ = Math.hypot(b[0] - o[0], b[1] - o[1]);
      const th = Math.atan2(a[1] - o[1], a[0] - o[0]), g = new THREE.Group(); g.rotation.y = th;
      const cx = o[0] + (a[0] - o[0]) / 2 + (b[0] - o[0]) / 2, cy = o[1] + (a[1] - o[1]) / 2 + (b[1] - o[1]) / 2; g.position.set(cx, 0, -cy);
      return { g, L: L_, D: D_ };
    }
    function facade(key, len, H, o) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 7 + key.length * 17; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      x.fillStyle = '#a9563f'; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) {
        const t = rnd(); x.fillStyle = t < 0.3 ? '#9f4f3a' : t < 0.6 ? '#b15d46' : t < 0.82 ? '#a95842' : '#934733'; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(80,45,32,0.18)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      x.fillStyle = '#8c4532'; x.fillRect(0, Y(0.45), c.width, 0.45 * PX);                         // darker water table
      const CB = o.cornice || 0.6; x.fillStyle = '#f5f3ee'; x.fillRect(0, 0, c.width, CB * PX);    // white cornice / frieze
      x.fillStyle = 'rgba(0,0,0,0.13)'; x.fillRect(0, CB * PX - 2, c.width, 2); x.fillRect(0, 0.22 * PX, c.width, 1);
      if (o.band) { x.fillStyle = '#e9e4d8'; x.fillRect(0, Y(o.band + 0.18), c.width, 0.18 * PX); }
      for (const w of (o.win || [])) {   // white surround, two sashes with a white centre pier, soldier-course lintel
        const ww = w.w || 1.9, hh = w.h || 1.8, u0 = w.u - ww / 2;
        x.fillStyle = '#8f4734'; x.fillRect(U(u0 - 0.15), Y(w.z + hh + 0.38), (ww + 0.3) * PX, 0.3 * PX);
        x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.1), Y(w.z + hh + 0.08), (ww + 0.2) * PX, (hh + 0.16) * PX);
        const gr = x.createLinearGradient(0, Y(w.z + hh), 0, Y(w.z)); gr.addColorStop(0, '#6f8494'); gr.addColorStop(1, '#2d3944'); x.fillStyle = gr;
        x.fillRect(U(u0), Y(w.z + hh), ww * PX, hh * PX);
        x.fillStyle = '#f4f2ec'; const pier = ww > 1.3 ? 0.22 : 0.06; x.fillRect(U(w.u - pier / 2), Y(w.z + hh), pier * PX, hh * PX);
        x.fillRect(U(u0), Y(w.z + hh * 0.52), ww * PX, 2);
        if (ww > 1.3) { x.fillStyle = '#f4f2ec'; x.fillRect(U(w.u - 0.18), Y(w.z + hh + 0.4), 0.36 * PX, 0.34 * PX); }   // keystone
      }
      for (const d of (o.door || [])) {
        x.fillStyle = '#f4f2ec'; x.fillRect(U(d.u - d.w / 2 - 0.15), Y(d.h + 0.15), (d.w + 0.3) * PX, (d.h + 0.15) * PX);
        x.fillStyle = '#2c353d'; x.fillRect(U(d.u - d.w / 2), Y(d.h), d.w * PX, d.h * PX);
        x.fillStyle = '#e8e6df'; x.fillRect(U(d.u) - 2, Y(d.h), 4, d.h * PX); x.fillRect(U(d.u - d.w / 2), Y(d.h - 0.55), d.w * PX, 3);
      }
      for (const u of (o.down || [])) { x.fillStyle = '#f1efe8'; x.fillRect(U(u) - 2, CB * PX, 4, (H - CB) * PX); }
      return M('fac-' + key, { map: texOf(c), emissive: '#1c1410' });
    }
    const shc = cvs(64, 64), shx = shc.getContext('2d'); shx.fillStyle = '#6d7175'; shx.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) { shx.fillStyle = 'rgba(30,32,35,0.35)'; shx.fillRect(0, r * 16 + 14, 64, 2); for (let k = 0; k < 4; k++) { shx.fillStyle = (r + k) % 3 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'; shx.fillRect(k * 16 + (r % 2) * 8, r * 16, 15, 14); } }
    const roofM = lam('yb-roof', { map: texOf(shc, true), side: THREE.DoubleSide, emissive: '#111214' });
    const silver = M('silver', { color: '#c9ced3', emissive: '#3a3d40', side: THREE.DoubleSide });
    function hip(x0, x1, z0, z1, y, pitch, mat) {   // same construction as buildLafayette(); uv in metres
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
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); ge.computeVertexNormals();
      return { mesh: new THREE.Mesh(ge, mat || roofM), ridge: r };
    }
    // balustrade: white rail + balusters on a transparent canvas (one plane, double sided)
    const bc = cvs(64, 48), bx_ = bc.getContext('2d'); bx_.fillStyle = '#f5f3ee'; bx_.fillRect(0, 0, 64, 7); bx_.fillRect(0, 41, 64, 7);
    for (let k = 0; k < 4; k++) { bx_.beginPath(); bx_.ellipse(k * 16 + 8, 24, 3.2, 15, 0, 0, Math.PI * 2); bx_.fill(); }
    const balT = texOf(bc, true);
    function bal(len, ht, x, y, z, ry) {
      const t = balT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 0.75)), 1);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(len, ht), new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: '#3b3a36' }));
      m.position.set(x, y + ht / 2, z); m.rotation.y = ry || 0; return m;
    }
    function label(txt, w, h, x, y, z, ry) {
      const c = cvs(w * 80, h * 80), x2 = c.getContext('2d'); x2.fillStyle = '#f5f3ee'; x2.fillRect(0, 0, c.width, c.height);
      x2.fillStyle = '#3a3f45'; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.font = 'bold ' + Math.round(h * 80 * 0.55) + 'px "DejaVu Serif", Georgia, serif';
      x2.fillText(txt.split('').join(String.fromCharCode(8202)), c.width / 2, c.height / 2 + 1);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: texOf(c), emissive: '#3b3a36' })); m.position.set(x, y, z); m.rotation.y = ry || 0; return m;
    }
    const col = (x, z, h) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, h, 14), white); m.position.set(x, h / 2, z); return m; };
    // ====================================================== #51 Yalobusha Hall
    { const F = frame(B.hall), g = F.g, Ln = F.L, Dn = F.D, H = B.eave, hz = Dn / 2, hx = Ln / 2;
      const up = { z: 4.5, h: 1.75 }, lo = { z: 0.95, h: 1.85 };
      const two = us => us.flatMap(u => [{ u, z: lo.z, h: lo.h }, { u, z: up.z, h: up.h }]);
      const eU = Ln / 2 - B.entry_x;               // NW face texture runs from the NE end
      const nw = facade('nw', Ln, H, { band: 3.75, win: two([3.4, 10.6, 17.4, 30.6]).concat([{ u: eU, z: up.z + 0.1, h: 1.6, w: 1.3 }]), door: [{ u: eU, w: 1.9, h: 2.7 }], down: [0.3, 14.0, 21.0, Ln - 0.3] });
      const se = facade('se', Ln, H, { band: 3.75, win: two([2.6, 6.6, 10.6, 13.9, 20.5, 23.8, 27.8, 31.8]).concat([{ u: Ln / 2, z: up.z, h: up.h }]), door: [{ u: Ln / 2, w: 2.0, h: 2.7 }], down: [0.3, Ln - 0.3] });
      const ne = facade('ne', Dn, H, { band: 3.75, win: two([4.2, 10.0, 16.7, 22.5]), down: [0.3, Dn - 0.3] });
      const sw = facade('sw', Dn, H, { band: 3.75, win: two([4.2, 10.0, 16.7, 22.5]), door: [{ u: 13.4, w: 1.1, h: 2.4 }], down: [0.3, Dn - 0.3] });
      const wb = new THREE.Mesh(new THREE.BoxGeometry(Ln, H, Dn), [ne, sw, hid, hid, se, nw]); wb.position.set(0, H / 2, 0); g.add(wb);
      const ov = 0.55; g.add(box(Ln + 2 * ov, 0.2, Dn + 2 * ov, 0, H - 0.18, 0, white));
      const rf = hip(-hx - ov, hx + ov, -hz - ov, hz + ov, H + 0.02, B.pitch); g.add(rf.mesh);
      g.add(box(0.5, 1.6, 0.5, 6.0, rf.ridge - 1.0, 2.2, M('chim', { color: '#9c4f3b' })));
      // three black half-round louvered vents on the NW slope
      const lc = cvs(32, 32), lx = lc.getContext('2d'); lx.fillStyle = '#1b1e22'; lx.fillRect(0, 0, 32, 32); lx.fillStyle = '#3a3f45'; for (let k = 0; k < 32; k += 8) lx.fillRect(0, k, 32, 3);
      const louT = texOf(lc, true); louT.repeat.set(4, 4);
      const louM = new THREE.MeshLambertMaterial({ map: louT, emissive: '#0c0d0f' });
      const sh = new THREE.Shape(); const vr = 0.85; sh.moveTo(-vr, 0); sh.lineTo(vr, 0); sh.lineTo(vr, 1.7); sh.absarc(0, 1.7, vr, 0, Math.PI, false); sh.lineTo(-vr, 0);
      const vg = new THREE.ExtrudeGeometry(sh, { depth: 2.6, bevelEnabled: false, curveSegments: 12 });
      for (const u of B.vents) { const v = new THREE.Mesh(vg, [louM, dark]); v.position.set(u, H - 0.25, -(hz - 0.35)); g.add(v); }
      // NW entry: 2 white columns, flat slab with lettering, balustrade balcony on top
      { const ex = B.entry_x, ez = -hz, d = 1.9, w = 3.4, hc = 3.45;
        for (const sx of [-1.35, 1.35]) g.add(col(ex + sx, ez - d + 0.3, hc));
        g.add(box(w + 0.3, 0.55, d + 0.15, ex, hc, ez - d / 2 - 0.05, white));
        g.add(label('YALOBUSHA HALL', 2.4, 0.3, ex, hc + 0.28, ez - d - 0.14, Math.PI));
        g.add(bal(w, 0.95, ex, hc + 0.55, ez - d - 0.05, 0)); g.add(bal(d, 0.95, ex - w / 2 + 0.05, hc + 0.55, ez - d / 2, Math.PI / 2)); g.add(bal(d, 0.95, ex + w / 2 - 0.05, hc + 0.55, ez - d / 2, Math.PI / 2));
        g.add(box(w, 0.15, d + 0.6, ex, 0, ez - d / 2 - 0.3, conc)); }
      // SE portico: 4 columns, entablature with lettering, balustrade top; white rails along the terrace either side
      { const ez = hz, d = 2.9, w = 6.4, hc = 3.7;
        for (const sx of [-2.6, -0.95, 0.95, 2.6]) g.add(col(sx, ez + d - 0.35, hc));
        g.add(box(w + 0.4, 0.7, d + 0.2, 0, hc, ez + d / 2 - 0.05, white));
        g.add(label('YALOBUSHA HALL', 3.2, 0.36, 0, hc + 0.36, ez + d + 0.06, 0));
        g.add(bal(w + 0.4, 0.9, 0, hc + 0.7, ez + d + 0.02, 0)); g.add(bal(d, 0.9, -(w / 2 + 0.18), hc + 0.7, ez + d / 2, Math.PI / 2)); g.add(bal(d, 0.9, w / 2 + 0.18, hc + 0.7, ez + d / 2, Math.PI / 2));
        g.add(box(w, 0.18, d + 0.4, 0, 0, ez + d / 2 + 0.2, conc));
        for (const s of [-1, 1]) { g.add(bal(5.4, 1.0, s * (w / 2 + 2.9), 0.0, ez + 1.6, 0)); g.add(bal(1.6, 1.0, s * (w / 2 + 0.2), 0.0, ez + 0.8, Math.PI / 2)); } }
      // low brick lattice screen walls on the NW side
      { const sc = cvs(80, 30), sx2 = sc.getContext('2d'); sx2.fillStyle = '#a9563f'; sx2.fillRect(0, 0, 80, 30); sx2.fillStyle = '#8f4734'; sx2.fillRect(0, 0, 80, 3);
        sx2.fillStyle = '#3a2219'; for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) if (k % 9 < 8) sx2.fillRect(8 + k * 4 + (r % 2) * 2, 8 + r * 4, 2, 2);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) sx2.fillRect(46 + k * 4 + (r % 2) * 2, 8 + r * 4, 2, 2);
        const scT = texOf(sc, true);
        for (const [u0, u1] of B.screens) { const len = u1 - u0, t = scT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, len / 4), 1);
          const mm = new THREE.MeshLambertMaterial({ map: t, emissive: '#1c120e' });
          const m = new THREE.Mesh(new THREE.BoxGeometry(len, 1.5, 0.3), [brickM, brickM, M('cap', { color: '#8f4734' }), hid, mm, mm]); m.position.set((u0 + u1) / 2, 0.75, -(hz + 1.6)); g.add(m); } }
      // chain-link equipment yard on the SE side (east end) + flag pole
      { const [u0, u1] = B.yard_u, d = 4.2, fm = new THREE.MeshLambertMaterial({ color: '#5d6166', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
        const fen = (len, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.8), fm); m.position.set(x, 0.9, z); m.rotation.y = ry; return m; };
        g.add(fen(u1 - u0, (u0 + u1) / 2, hz + d, 0)); g.add(fen(d, u0, hz + d / 2, Math.PI / 2)); g.add(fen(d, u1, hz + d / 2, Math.PI / 2));
        g.add(box(u1 - u0, 0.12, d, (u0 + u1) / 2, 0, hz + d / 2, conc));
        g.add(box(1.6, 1.3, 1.2, u0 + 1.4, 0, hz + 2.2, M('xfmr', { color: '#5d7a5c' }))); g.add(box(1.8, 1.1, 1.3, u0 + 3.6, 0, hz + 2.2, M('unit', { color: '#a9adb1' }))); }
      { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 9.5, 8), M('pole', { color: '#d8dadc' })); p.position.set(-9.5, 4.75, hz + 6.5); g.add(p);
        g.add(box(1.5, 0.9, 0.03, -9.5 + 0.78, 8.4, hz + 6.5, M('flag', { color: '#b8323a', emissive: '#2a0b0d', side: THREE.DoubleSide }))); }
      root_.add(g); }
    // ====================================================== #58 Strategic Communications
    { const F = frame(B.sc), g = F.g, Ln = F.L, Dn = F.D, H = B.sc_eave, hx = Ln / 2, hz = Dn / 2, nu = B.sc_notch_u, nv = B.sc_notch_v;
      // main body: x in [-hx, hx], local z: v=0 -> +hz, v=Dn -> -hz ; wing (notch excluded) spans x >= -hx + nu at v in [nv, Dn]
      const zv = v => hz - v, wins = len => { const o = []; for (let u = 2.2; u < len - 1.5; u += 3.6) o.push({ u, z: 0.9, h: 1.7, w: 1.6 }); return o; };
      const mk = (x0, x1, v0, v1, faces, k) => { const w = x1 - x0, d = v1 - v0;
        const fm = (s, len) => facade('sc' + k + s, len, H, { cornice: 0.45, win: wins(len), down: [0.25, len - 0.25], door: s === 'x0' ? [{ u: len / 2, w: 1.2, h: 2.4 }] : [] });
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), [faces.x1 ? fm('x1', d) : hid, faces.x0 ? fm('x0', d) : hid, hid, hid, faces.v0 ? fm('v0', w) : hid, faces.v1 ? fm('v1', w) : hid]);
        m.position.set((x0 + x1) / 2, H / 2, (zv(v0) + zv(v1)) / 2); g.add(m); return { x0, x1, z0: zv(v1), z1: zv(v0) }; };
      const a = mk(-hx, hx, 0, nv, { x0: 1, x1: 1, v0: 1, v1: 1 }, 'a'), b = mk(-hx + nu, hx, nv, Dn, { x0: 1, x1: 1, v1: 1 }, 'b');
      const ov = 0.5;
      for (const r of [a, b]) g.add(box(r.x1 - r.x0 + 2 * ov, 0.18, r.z1 - r.z0 + 2 * ov, (r.x0 + r.x1) / 2, H - 0.16, (r.z0 + r.z1) / 2, white));
      const ra = hip(a.x0 - ov, a.x1 + ov, a.z0 - ov, a.z1 + ov, H + 0.02, B.sc_pitch); g.add(ra.mesh);
      g.add(hip(b.x0 - ov, b.x1 + ov, b.z0 - ov, b.z1 + 5, H + 0.02, B.sc_pitch).mesh);
      const dw = 7.5, dd = 2.0 * 0.7 / Math.tan(B.sc_pitch * Math.PI / 180) + 0.6;     // flat silver deck that truncates the ridge
      g.add(box(dw, 0.75, dd, 1.5, ra.ridge - 0.7, (a.z0 + a.z1) / 2, silver));
      g.add(box(1.5, 1.1, 1.5, 1.5, ra.ridge + 0.05, (a.z0 + a.z1) / 2, white));
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.9, 4), roofM); cap.rotation.y = Math.PI / 4; cap.position.set(1.5, ra.ridge + 1.6, (a.z0 + a.z1) / 2); g.add(cap);
      root_.add(g); }
    return root_;
  }
  // <<< YALOBUSHA-51 build
  // MCCORMICK-52 build >>>
  // #52 J. P. McCormick Administration Building: historic 2-story red brick block on a raised basement (flat white roof, brick parapet
  // with white coping, white cornice, pediment gable over a 4-column white portico facing Circle Dr, porch stair with black rails,
  // basement door + AC units on the north side) and the newer 2-story brick west wing with a gray shingle cross-hip roof. NO ground shadows.
  function buildMcCormick() {
    const B = L.mccormick, g = new THREE.Group(); g.name = 'mccormick-52';
    const EN = c => toEN(c[0], c[1]);
    const M = (k, o) => lam('mc-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const hid = new THREE.MeshBasicMaterial({ visible: false });
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const white = M('white', { color: '#f5f3ee', emissive: '#3b3a36' }), conc = M('conc', { color: '#d9d5ca' }), rail = M('rail', { color: '#1f2226' });
    const PX = 20;
    function facade(key, len, H, o) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 11 + key.length * 19; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const base = o.brick || ['#b4604c', '#aa5845', '#bd6a55', '#a14f3d'];
      x.fillStyle = base[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { const t = rnd(); x.fillStyle = base[t < 0.35 ? 1 : t < 0.7 ? 2 : t < 0.9 ? 0 : 3]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(80,45,32,0.16)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      for (const b of (o.bands || [])) { x.fillStyle = '#f3f1ea'; x.fillRect(0, Y(b[1]), c.width, (b[1] - b[0]) * PX); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, Y(b[0]) - 2, c.width, 2); }
      for (const w of (o.win || [])) {
        const ww = w.w, hh = w.h, u0 = w.u - ww / 2;
        x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.1), Y(w.z + hh + 0.1), (ww + 0.2) * PX, (hh + 0.2) * PX);
        const gr = x.createLinearGradient(0, Y(w.z + hh), 0, Y(w.z)); gr.addColorStop(0, '#71879a'); gr.addColorStop(1, '#2b3743'); x.fillStyle = gr; x.fillRect(U(u0), Y(w.z + hh), ww * PX, hh * PX);
        x.fillStyle = '#efede6'; const nv = Math.max(1, Math.round(ww / 0.55)), nh = Math.max(1, Math.round(hh / 0.6));
        for (let i = 1; i < nv; i++) x.fillRect(U(u0 + ww * i / nv) - 1, Y(w.z + hh), 2, hh * PX);
        for (let i = 1; i < nh; i++) x.fillRect(U(u0), Y(w.z + hh * i / nh) - 1, ww * PX, 2);
        if (w.lintel) { x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.25), Y(w.z + hh + 0.45), (ww + 0.5) * PX, 0.3 * PX); }
      }
      for (const d of (o.door || [])) { x.fillStyle = '#f4f2ec'; x.fillRect(U(d.u - d.w / 2 - 0.12), Y(d.z + d.h + 0.12), (d.w + 0.24) * PX, (d.h + 0.12) * PX);
        x.fillStyle = '#d9dde0'; x.fillRect(U(d.u - d.w / 2), Y(d.z + d.h), d.w * PX, d.h * PX); x.fillStyle = '#39434c'; x.fillRect(U(d.u - d.w / 2 + 0.12), Y(d.z + d.h - 0.15), (d.w / 2 - 0.2) * PX, (d.h - 0.4) * PX); x.fillRect(U(d.u + 0.08), Y(d.z + d.h - 0.15), (d.w / 2 - 0.2) * PX, (d.h - 0.4) * PX); }
      for (const u of (o.down || [])) { x.fillStyle = '#efede6'; x.fillRect(U(u) - 2, 0, 4, H * PX); }
      return M('fac-' + key, { map: texOf(c), emissive: '#1c1410' });
    }
    const R = k => { const [a, b] = B[k].map(EN); return { x0: a[0], y0: a[1], x1: b[0], y1: b[1], W: b[0] - a[0], D: b[1] - a[1], cx: (a[0] + b[0]) / 2, cz: -(a[1] + b[1]) / 2 }; };
    const bay = (len, step, o) => { const r = []; for (let u = step / 2; u < len - 0.5; u += step) r.push(Object.assign({ u }, o)); return r; };
    // ------------------------------------------------ historic block (east E + middle M), flat roof, raised basement
    const H = B.h_old, PB = B.parapet, bands = [[1.45, 1.75], [H - 0.75, H - 0.05]];
    const oldWin = len => bay(len, 3.0, { w: 1.6, h: 2.5, z: 2.4, lintel: 1 }).concat(bay(len, 3.0, { w: 1.6, h: 2.3, z: 6.3, lintel: 1 })).concat(bay(len, 3.0, { w: 1.2, h: 0.7, z: 0.45 }));
    const e = R('east'), m = R('mid');
    const eu0 = (e.D - B.porch_w) / 2, eu1 = eu0 + B.porch_w;   // portico span on the east face (u from the south end)
    const eastWin = bay(e.D, 3.0, { w: 1.6, h: 2.5, z: 2.4, lintel: 1 }).concat(bay(e.D, 3.0, { w: 1.6, h: 2.3, z: 6.3, lintel: 1 })).filter(w => w.u < eu0 + 0.4 || w.u > eu1 - 0.4)
      .concat([{ u: e.D / 2, w: 1.6, h: 2.3, z: 6.3, lintel: 1 }, { u: e.D / 2 - 3.2, w: 1.4, h: 2.3, z: 6.3 }, { u: e.D / 2 + 3.2, w: 1.4, h: 2.3, z: 6.3 }, { u: e.D / 2 - 3.2, w: 1.4, h: 2.5, z: 2.4 }, { u: e.D / 2 + 3.2, w: 1.4, h: 2.5, z: 2.4 }]);
    const fE = facade('ee', e.D, H, { bands, win: eastWin.concat(bay(e.D, 3.0, { w: 1.2, h: 0.7, z: 0.45 }).filter(w => Math.abs(w.u - (e.D / 2 + B.porch_w / 2 + 2.2)) > 1.6 && Math.abs(w.u - e.D / 2) > B.porch_w / 2)), door: [{ u: e.D / 2, w: 1.9, h: 2.7, z: 1.75 }, { u: e.D / 2 + B.porch_w / 2 + 2.2, w: 1.9, h: 2.0, z: 0 }] });
    const fN = facade('en', e.W, H, { bands, win: oldWin(e.W).filter(w => !(w.z < 1 && w.u > e.W - 4.5)), door: [{ u: e.W - 3.0, w: 1.7, h: 2.2, z: 0 }] });
    const fS = facade('es', e.W, H, { bands, win: oldWin(e.W) });
    const eb = new THREE.Mesh(new THREE.BoxGeometry(e.W, H, e.D), [fE, hid, hid, hid, fS, fN]); eb.position.set(e.cx, H / 2, e.cz); g.add(eb);
    const mb = new THREE.Mesh(new THREE.BoxGeometry(m.W, H, m.D), [hid, hid, hid, hid, facade('ms', m.W, H, { bands, win: oldWin(m.W) }), facade('mn', m.W, H, { bands, win: oldWin(m.W) })]);
    mb.position.set(m.cx, H / 2, m.cz); g.add(mb);
    const roofW = M('roofw', { color: '#eceae4', emissive: '#30302d' });
    const par = M('parapet', { color: '#ad5a46', emissive: '#1c120e' });
    for (const r of [e, m]) g.add(box(r.W - 0.1, 0.06, r.D - 0.1, r.cx, H - 0.25, r.cz, roofW));
    // parapet ring (brick) with white coping around the E + M outline
    const ring = B.old_ring.map(EN);
    for (let i = 0; i < ring.length - 1; i++) { const a = ring[i], b = ring[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]); if (Ls < 0.05) continue;
      const ry = -Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, mz = -(a[1] + b[1]) / 2;
      const w = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.35, PB, 0.35), par); w.position.set(mx, H + PB / 2, mz); w.rotation.y = ry; g.add(w);
      const cp = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.45, 0.12, 0.5), white); cp.position.set(mx, H + PB + 0.06, mz); cp.rotation.y = ry; g.add(cp); }
    // pediment gable over the portico (brick tympanum, white raking cornice)
    { const pw = B.porch_w + 1.2, ph = 2.1, xE = e.x1 + 0.02, zc = e.cz;
      const sh = new THREE.Shape(); sh.moveTo(-pw / 2, 0); sh.lineTo(pw / 2, 0); sh.lineTo(0, ph); sh.lineTo(-pw / 2, 0);
      const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }); const t = new THREE.Mesh(tg, par); t.rotation.y = Math.PI / 2; t.position.set(xE - 0.6, H + 0.05, zc); g.add(t);
      const sl = Math.hypot(pw / 2, ph), an = Math.atan2(ph, pw / 2);
      for (const s of [-1, 1]) { const rk = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, sl + 0.3), white); rk.position.set(xE + 0.05 + B.landing_d, H + ph / 2 + 0.1, zc + s * pw / 4); rk.rotation.x = s * an; g.add(rk); }
      const tp = new THREE.Mesh(tg, white); tp.rotation.y = Math.PI / 2; tp.scale.set(1, 1, 0.08); tp.position.set(xE + B.landing_d - 0.05, H + 0.05, zc); g.add(tp);
      const tb = new THREE.Mesh(tg, par); tb.rotation.y = Math.PI / 2; tb.scale.set(0.86, 0.8, 1); tb.position.set(xE + B.landing_d - 0.02, H + 0.15, zc); g.add(tb); }
    // portico (revised 2026-10-12, Brent's front photo): shallow landing at first-floor level behind the 4 columns, wide white steps
    // running straight out toward Circle Dr between the outer column bases, single black centre handrail, brick cheek walls with white caps
    { const pl = B.landing_d, pw = B.porch_w, zc = e.cz, x0 = e.x1, Hp = B.porch_h, nS = B.risers, tr = 0.33, sw = pw - 1.6;
      const colX = x0 + pl - 0.45, cz = k => zc + k * (pw - 1.2) / 3;
      g.add(box(pl, Hp, pw, x0 + pl / 2, 0, zc, conc));
      for (const k of [-1.5, -0.5, 0.5, 1.5]) { const cl = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, H - 0.8 - Hp, 18), white); cl.position.set(colX, Hp + (H - 0.8 - Hp) / 2, cz(k)); g.add(cl);
        g.add(box(0.95, 0.25, 0.95, colX, Hp, cz(k), white)); }
      g.add(box(pl + 0.3, 0.75, pw + 0.4, x0 + pl / 2 + 0.1, H - 0.8, zc, white));
      g.add(box(0.06, 0.75, pw + 0.4, x0 + pl + 0.25, H - 0.8, zc, white));
      for (let i = 0; i < nS; i++) g.add(box(tr, Hp * (nS - i) / nS, sw, x0 + pl + tr / 2 + i * tr, 0, zc, conc));
      const run = nS * tr, brk = M('cheek', { color: '#a9573f', emissive: '#1c120e' });
      for (const s_ of [-1, 1]) { const zz = zc + s_ * (sw / 2 + 0.25);
        g.add(box(run + 0.2, Hp * 0.75, 0.5, x0 + pl + run / 2 - 0.1, 0, zz, brk)); g.add(box(run + 0.3, 0.1, 0.62, x0 + pl + run / 2 - 0.1, Hp * 0.75, zz, white)); }
      { const L_ = Math.hypot(run, Hp), r = new THREE.Mesh(new THREE.BoxGeometry(L_, 0.06, 0.06), rail); r.position.set(x0 + pl + run / 2, Hp / 2 + 0.95, zc); r.rotation.z = -Math.atan2(Hp, run); g.add(r);
        for (let k = 0; k <= 3; k++) g.add(box(0.05, 0.95, 0.05, x0 + pl + run * k / 3, Hp * (1 - k / 3), zc, rail));
        g.add(box(0.05, 0.05, 0.05, x0 + pl - 0.2, Hp + 0.95, zc, rail)); }
      // plaque over the doors
      { const c = cvs(160, 48), x = c.getContext('2d'); x.fillStyle = '#2b3037'; x.fillRect(0, 0, 160, 48); x.strokeStyle = '#c9ccd0'; x.lineWidth = 2; x.strokeRect(3, 3, 154, 42);
        x.fillStyle = '#e8eaec'; x.textAlign = 'center'; x.font = 'bold 13px "DejaVu Sans", Arial'; x.fillText('J. P. Mc Cormick', 80, 21); x.font = '10px "DejaVu Sans", Arial'; x.fillText('Administration Bldg.', 80, 37);
        const pq = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshLambertMaterial({ map: texOf(c), emissive: '#202020' })); pq.rotation.y = Math.PI / 2; pq.position.set(x0 + 0.03, 5.05, zc); g.add(pq); } }
    // north side: AC units by the east end
    { const um = M('ac', { color: '#d8dbdd', emissive: '#2e2f30' }), zN = -e.y1;
      for (let i = 0; i < 3; i++) g.add(box(1.3, 1.6, 1.1, e.x1 - 6.5 + i * 1.5, 0, zN - 0.9, um)); }
    // ------------------------------------------------ newer west wing: brick, 2 stories, gray shingle cross-hip roof
    const HW = B.h_new, wa = R('wa'), wb = R('wb'), wc = R('wc');
    const newBr = ['#a5523d', '#9b4b37', '#b05c46', '#8f4432'];
    const nwin = len => bay(len, 3.3, { w: 1.4, h: 1.7, z: 0.9, lintel: 1 }).concat(bay(len, 3.3, { w: 1.4, h: 1.6, z: 4.5, lintel: 1 }));
    const wf = (k, len) => facade('w' + k, len, HW, { brick: newBr, bands: [[HW - 0.45, HW - 0.05], [0, 0.35]], win: nwin(len) });
    const mk = (r, faces, k) => { const mm = new THREE.Mesh(new THREE.BoxGeometry(r.W, HW, r.D), [faces.e ? wf(k + 'e', r.D) : hid, faces.w ? wf(k + 'w', r.D) : hid, hid, hid, faces.s ? wf(k + 's', r.W) : hid, faces.n ? wf(k + 'n', r.W) : hid]); mm.position.set(r.cx, HW / 2, r.cz); g.add(mm); };
    mk(wa, { w: 1, n: 1, s: 1 }, 'a'); mk(wb, { n: 1, s: 1 }, 'b'); mk(wc, { w: 1, n: 1, s: 1 }, 'c');
    const shc = cvs(64, 64), shx = shc.getContext('2d'); shx.fillStyle = '#6f7378'; shx.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) { shx.fillStyle = 'rgba(30,32,35,0.35)'; shx.fillRect(0, r * 16 + 14, 64, 2); for (let k = 0; k < 4; k++) { shx.fillStyle = (r + k) % 3 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'; shx.fillRect(k * 16 + (r % 2) * 8, r * 16, 15, 14); } }
    const roofM = lam('mc-roof', { map: texOf(shc, true), side: THREE.DoubleSide, emissive: '#111214' });
    function hip(x0, x1, z0, z1, y, pitch) {
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
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); ge.computeVertexNormals();
      return new THREE.Mesh(ge, roofM);
    }
    const ov = 0.5, yR = HW + 0.02;
    for (const r of [wa, wb, wc]) g.add(box(r.W + 2 * ov, 0.18, r.D + 2 * ov, r.cx, HW - 0.16, r.cz, white));
    for (const q of B.hips) { const [a, b] = q.map(EN); g.add(hip(a[0] - ov, b[0] + ov, -b[1] - ov, -a[1] + ov, yR, B.pitch)); }
    return g;
  }
  // <<< MCCORMICK-52 build
  // TATE-56 build >>>
  // #56 Tate Hall: 2-story red brick, white cornice, paired white-trimmed windows with keystone lintels, dark gray shingle cross-hip roof
  // (south bar + north wing + diagonal NE wing), white louvered cupola at the crossing, white 6-column pediment portico facing Circle Dr,
  // small white columned porch on the south face (AC units), lower gray hip connector to the library, curved terraced patio walls (SE). NO ground shadows.
  function buildTate() {
    const B = L.tate, g = new THREE.Group(); g.name = 'tate-56';
    const M = (k, o) => lam('tt-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const white = M('white', { color: '#f5f3ee', emissive: '#3b3a36' }), conc = M('conc', { color: '#d9d5ca' }), dark = M('dark', { color: '#2a2e33' });
    const brk = M('brick', { color: '#a9573f', emissive: '#1c120e' });
    const PX = 20;
    function facade(key, len, H, o) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 7 + key.length * 23 + Math.round(len * 13); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const base = ['#b25b45', '#a5523e', '#bb664f', '#97473a'];
      x.fillStyle = base[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { const t = rnd(); x.fillStyle = base[t < 0.35 ? 1 : t < 0.7 ? 2 : t < 0.9 ? 0 : 3]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(80,45,32,0.16)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      x.fillStyle = '#f3f1ea'; x.fillRect(0, Y(H), c.width, 0.55 * PX); x.fillRect(0, Y(0.45), c.width, 0.45 * PX * 0.4);
      const win = (u0, z, ww, hh) => {
        x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.12), Y(z + hh + 0.12), (ww + 0.24) * PX, (hh + 0.24) * PX);
        const gr = x.createLinearGradient(0, Y(z + hh), 0, Y(z)); gr.addColorStop(0, '#6f8597'); gr.addColorStop(1, '#2b3743'); x.fillStyle = gr; x.fillRect(U(u0), Y(z + hh), ww * PX, hh * PX);
        x.fillStyle = '#efede6'; x.fillRect(U(u0 + ww / 2) - 1, Y(z + hh), 2, hh * PX); for (let i = 1; i < 3; i++) x.fillRect(U(u0), Y(z + hh * i / 3) - 1, ww * PX, 2);
        // flat-arch lintel + keystone, sill
        x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.25), Y(z + hh + 0.5), (ww + 0.5) * PX, 0.32 * PX);
        x.beginPath(); x.moveTo(U(u0 + ww / 2 - 0.16), Y(z + hh + 0.12)); x.lineTo(U(u0 + ww / 2 + 0.16), Y(z + hh + 0.12)); x.lineTo(U(u0 + ww / 2 + 0.24), Y(z + hh + 0.62)); x.lineTo(U(u0 + ww / 2 - 0.24), Y(z + hh + 0.62)); x.fill();
        x.fillRect(U(u0 - 0.15), Y(z - 0.05), (ww + 0.3) * PX, 0.14 * PX);
      };
      const step = 4.2, n = Math.max(1, Math.floor((len - 1.0) / step)), off = (len - n * step) / 2;
      for (let k = 0; k < n; k++) { const uc = off + step * (k + 0.5); if (o.skip && o.skip.some(q => Math.abs(q - uc) < 2.2)) continue;
        for (const z of [1.0, 4.7]) { win(uc - 1.05, z, 0.95, z < 2 ? 2.1 : 1.95); win(uc + 0.1, z, 0.95, z < 2 ? 2.1 : 1.95); } }
      for (const d of (o.door || [])) { x.fillStyle = '#f4f2ec'; x.fillRect(U(d - 0.95), Y(2.75), 1.9 * PX, 2.75 * PX); x.fillStyle = '#3a434c'; x.fillRect(U(d - 0.8), Y(2.6), 1.6 * PX, 2.6 * PX); x.fillStyle = '#efede6'; x.fillRect(U(d) - 1, Y(2.6), 2, 2.6 * PX);
        x.fillStyle = '#6f8597'; x.fillRect(U(d - 0.8), Y(3.4), 1.6 * PX, 0.6 * PX); }
      return M('fac-' + key, { map: texOf(c), emissive: '#1c1410' });
    }
    const shc = cvs(64, 64), shx = shc.getContext('2d'); shx.fillStyle = '#4f5359'; shx.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) { shx.fillStyle = 'rgba(20,22,25,0.4)'; shx.fillRect(0, r * 16 + 14, 64, 2); for (let k = 0; k < 4; k++) { shx.fillStyle = (r + k) % 3 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; shx.fillRect(k * 16 + (r % 2) * 8, r * 16, 15, 14); } }
    const roofM = lam('tt-roof', { map: texOf(shc, true), side: THREE.DoubleSide, emissive: '#0e0f11' });
    const roofL = lam('tt-roofl', { map: texOf(shc, true), side: THREE.DoubleSide, emissive: '#1a1c1f', color: '#b8bcc2' });
    function hip(x0, x1, z0, z1, y, pitch, mat) {
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
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); ge.computeVertexNormals();
      return new THREE.Mesh(ge, mat || roofM);
    }
    // a wing = oriented group: local x along the wing (angle a, deg from E counter-clockwise), local z across
    const wingG = p => { const c = toEN(p.c[0], p.c[1]), w = new THREE.Group(); w.position.set(c[0], 0, -c[1]); w.rotation.y = p.a * Math.PI / 180; g.add(w); return w; };
    for (const p of B.parts) {
      const w = wingG(p), H = p.h, Lx = p.L, Wz = p.W, ov = 0.55;
      const mats = [facade(p.k + 'x+', Wz, H, { door: p.doorE ? [Wz / 2] : [], skip: p.doorE ? [Wz / 2] : [] }), facade(p.k + 'x-', Wz, H, { door: p.doorW ? [Wz / 2] : [], skip: p.doorW ? [Wz / 2] : [] }), dark, dark,
        facade(p.k + 'z+', Lx, H, {}), facade(p.k + 'z-', Lx, H, {})];
      const m = new THREE.Mesh(new THREE.BoxGeometry(Lx, H, Wz), mats); m.position.y = H / 2; w.add(m);
      w.add(box(Lx + 2 * ov, 0.3, Wz + 2 * ov, 0, H - 0.3, 0, white));     // white boxed cornice / soffit
      w.add(hip(-Lx / 2 - ov, Lx / 2 + ov, -Wz / 2 - ov, Wz / 2 + ov, H, p.pitch, p.low ? roofL : roofM));
    }
    // cupola at the roof crossing: white square louvered base, cornice, small hip cap, finial
    { const c = toEN(B.cupola[0], B.cupola[1]), y0 = B.cupola_y, cu = new THREE.Group(); cu.position.set(c[0], 0, -c[1]); cu.rotation.y = B.cupola_a * Math.PI / 180; g.add(cu);
      const lc = cvs(64, 64), lx = lc.getContext('2d'); lx.fillStyle = '#f4f2ec'; lx.fillRect(0, 0, 64, 64); lx.fillStyle = '#9aa0a6'; for (let i = 0; i < 9; i++) lx.fillRect(10, 8 + i * 5.4, 44, 2.4);
      const lm = M('louver', { map: texOf(lc), emissive: '#33322f' });
      cu.add(box(2.9, 1.2, 2.9, 0, y0 - 1.0, 0, white));
      const lv = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.4), [lm, lm, white, white, lm, lm]); lv.position.y = y0 + 0.2 + 0.8; cu.add(lv);
      cu.add(box(2.9, 0.25, 2.9, 0, y0 + 1.8, 0, white));
      cu.add(hip(-1.45, 1.45, -1.45, 1.45, y0 + 2.05, 32, roofM)); cu.add(box(0.08, 0.9, 0.08, 0, y0 + 2.9, 0, dark)); }
    // pediment portico on the end of the diagonal wing (local +x), 6 white columns
    function portico(q, cols) {
      const w = wingG(q), x0 = q.L / 2, D = q.depth, PW = q.pw, H = q.h, ph = q.ph;
      w.add(box(D + 0.6, 0.45, PW + 0.6, x0 + D / 2 + 0.3, 0, 0, conc));
      for (let i = 0; i < 3; i++) w.add(box(0.33, 0.15 * (3 - i), PW - 1, x0 + D + 0.6 + 0.165 + i * 0.33, 0, 0, conc));
      for (let k = 0; k < cols; k++) { const z = -PW / 2 + 0.6 + k * (PW - 1.2) / (cols - 1);
        const cl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, H - 1.1, 16), white); cl.position.set(x0 + D - 0.3, 0.45 + (H - 1.1) / 2, z); w.add(cl);
        w.add(box(0.8, 0.22, 0.8, x0 + D - 0.3, 0.45, z, white)); w.add(box(0.75, 0.2, 0.75, x0 + D - 0.3, H - 0.85, z, white)); }
      w.add(box(D + 0.4, 0.7, PW + 0.4, x0 + D / 2, H - 0.65, 0, white));               // entablature
      const sh = new THREE.Shape(); sh.moveTo(-PW / 2 - 0.2, 0); sh.lineTo(PW / 2 + 0.2, 0); sh.lineTo(0, ph); sh.lineTo(-PW / 2 - 0.2, 0);
      const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }); const t = new THREE.Mesh(tg, white); t.rotation.y = Math.PI / 2; t.position.set(x0 + D - 0.1, H + 0.05, 0); w.add(t);
      // portico gable roof back to the wall
      const sl = Math.hypot(PW / 2 + 0.4, ph), an = Math.atan2(ph, PW / 2 + 0.4);
      for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(D + 1.0, 0.12, sl), roofM); r.position.set(x0 + D / 2 - 0.2, H + 0.05 + ph / 2, s * (PW / 4 + 0.1)); r.rotation.x = s * an; w.add(r);
        const rk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, sl + 0.2), white); rk.position.set(x0 + D + 0.1, H + 0.12 + ph / 2, s * (PW / 4 + 0.1)); rk.rotation.x = s * an; w.add(rk); }
      // oculus in the tympanum
      const oc = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), M('oculus', { color: '#d8dad6', emissive: '#2c2c2a' })); oc.rotation.y = Math.PI / 2; oc.position.set(x0 + D + 0.22, H + ph * 0.4, 0); w.add(oc);
      return w;
    }
    portico(B.portico, 6);
    { const n = portico(B.porch, 4), x0 = B.porch.L / 2, um = M('ac', { color: '#d8dbdd', emissive: '#2e2f30' });
      for (let i = 0; i < 3; i++) n.add(box(1.1, 1.3, 1.0, x0 + 1.2, 0, B.porch.pw / 2 + 1.8 + i * 1.4, um)); }
    // corner terrace (rev 2): brick retaining walls with white caps, black pipe rail on the raised wall, low concrete bed curbs
    const railM = M('rail', { color: '#1d2024' }), concC = M('curb', { color: '#d6d2c6' });
    for (const a of B.walls) {
      const P = a.pts.map(c => toEN(c[0], c[1])), mat = a.conc ? concC : brk;
      for (let i = 0; i < P.length - 1; i++) { const p0 = P[i], p1 = P[i + 1], Ls = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ry = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), mx = (p0[0] + p1[0]) / 2, mz = -(p0[1] + p1[1]) / 2;
        const wl = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.05, a.h, a.conc ? 0.22 : 0.35), mat); wl.position.set(mx, a.h / 2, mz); wl.rotation.y = ry; g.add(wl);
        if (!a.conc) { const cp = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.1, 0.1, 0.48), white); cp.position.set(mx, a.h + 0.05, mz); cp.rotation.y = ry; g.add(cp); }
        if (a.rail) { const tr = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.02, 0.05, 0.05), railM); tr.position.set(mx, a.h + 1.0, mz); tr.rotation.y = ry; g.add(tr);
          const mr = tr.clone(); mr.position.y = a.h + 0.55; g.add(mr); g.add(box(0.05, 0.95, 0.05, p0[0], a.h + 0.1, -p0[1], railM)); } }
    }
    // brick sign pedestal in the grass island where the portico walk flares to the Circle Dr sidewalk
    { const c = toEN(B.sign.c[0], B.sign.c[1]), s = new THREE.Group(); s.position.set(c[0], 0, -c[1]); s.rotation.y = B.sign.a * Math.PI / 180; g.add(s);
      s.add(box(0.7, 1.0, 1.9, 0, 0, 0, brk)); s.add(box(0.8, 0.1, 2.0, 0, 1.0, 0, white));
      const sc = cvs(200, 60), sx = sc.getContext('2d'); sx.fillStyle = '#23272d'; sx.fillRect(0, 0, 200, 60); sx.fillStyle = '#eceae4'; sx.textAlign = 'center'; sx.font = 'bold 26px "DejaVu Sans", Arial'; sx.fillText('TATE HALL', 100, 40);
      const sm = M('signface', { map: texOf(sc), emissive: '#222' });
      for (const k of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.48), sm); pl.rotation.y = k > 0 ? Math.PI / 2 : -Math.PI / 2; pl.position.set(k * 0.36, 0.55, 0); s.add(pl); } }
    // black lamp posts along the portico walk and at the sidewalk
    { const pm = M('lamp-post', { color: '#1e2126' }), gl = M('lamp-globe', { color: '#fffbea', emissive: '#c9c2a0' });
      for (const q of B.lamps) { const c = toEN(q[0], q[1]);
        g.add(box(0.3, 0.3, 0.3, c[0], 0, -c[1], pm));
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 8), pm); p.position.set(c[0], 1.9, -c[1]); g.add(p);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), gl); b.position.set(c[0], 3.75, -c[1]); g.add(b);
        g.add(box(0.2, 0.1, 0.2, c[0], 3.95, -c[1], pm)); } }
    return g;
  }
  // <<< TATE-56 build
  // LIB-53 build >>>
  // #53 R.C. Pugh Library: two flat white-roof brick blocks (taller south main block with a rusty roof seam, lower north block), cream coping
  // + band, tall narrow white-grid window strips, tan limestone entrance pavilion with "R.C. PUGH LIBRARY", brick entry plaza + steps between
  // stepped brick planter walls with white urns, mulch beds, west mechanical yard with units, lamp posts + bollards. NO ground shadows.
  function buildLib53() {
    const B = L.lib53, g = new THREE.Group(); g.name = 'lib-53';
    const M = (k, o) => lam('lb-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const cream = M('cream', { color: '#efe8d8', emissive: '#38352f' }), conc = M('conc', { color: '#d9d5ca' }), dark = M('dark', { color: '#23272c' });
    const brk = M('brick', { color: '#b8644a', emissive: '#1d130f' }), tan = M('tan', { color: '#d9cdb2', emissive: '#2f2b24' });
    const PX = 20;
    function facade(key, len, H, o) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 5 + key.length * 31 + Math.round(len * 17); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const base = ['#bf6a4e', '#b25f45', '#c97556', '#a95540'];
      x.fillStyle = base[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { const t = rnd(); x.fillStyle = base[t < 0.35 ? 1 : t < 0.7 ? 2 : t < 0.9 ? 0 : 3]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(80,45,32,0.15)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      x.fillStyle = '#ece5d4'; x.fillRect(0, Y(H - 0.55), c.width, 0.22 * PX); x.fillRect(0, Y(0.5), c.width, 0.12 * PX);
      // tall narrow window strips (white frames, grid), grouped in threes
      const ww = 1.25, wh = Math.min(2.6, H - 2.6), wz = H - 1.0 - wh, grp = 3, gap = 1.0, bay = grp * ww + (grp - 1) * gap, step = bay + 3.2;
      const n = Math.max(0, Math.floor((len - 1.5 + 3.2) / step));
      const off = (len - (n * step - 3.2)) / 2;
      for (let k = 0; k < n; k++) for (let j = 0; j < grp; j++) { const u0 = off + k * step + j * (ww + gap); if (o.skip && o.skip.some(q => u0 + ww > q[0] && u0 < q[1])) continue;
        x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.1), Y(wz + wh + 0.1), (ww + 0.2) * PX, (wh + 0.2) * PX);
        const gr = x.createLinearGradient(0, Y(wz + wh), 0, Y(wz)); gr.addColorStop(0, '#5f7487'); gr.addColorStop(1, '#25303a'); x.fillStyle = gr; x.fillRect(U(u0), Y(wz + wh), ww * PX, wh * PX);
        x.fillStyle = '#f0eee8'; x.fillRect(U(u0 + ww / 2) - 1, Y(wz + wh), 2, wh * PX); for (let i = 1; i < 4; i++) x.fillRect(U(u0), Y(wz + wh * i / 4) - 1, ww * PX, 2);
        x.fillStyle = '#e9e2d1'; x.fillRect(U(u0 - 0.15), Y(wz - 0.02), (ww + 0.3) * PX, 0.14 * PX); }
      return M('fac-' + key, { map: texOf(c), emissive: '#1c1410', side: THREE.DoubleSide });
    }
    function roofTex(key, w, d, rust) {
      const c = cvs(256, 256), x = c.getContext('2d'); x.fillStyle = '#eeece6'; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(0,0,0,0.04)'; for (let i = 0; i < 256; i += 16) x.fillRect(i, 0, 1, 256);
      if (rust) { x.strokeStyle = 'rgba(140,82,40,0.75)'; x.lineWidth = 5; x.beginPath(); x.moveTo(20, 150); for (let i = 1; i <= 12; i++) x.lineTo(20 + i * 18, 150 - i * 2 + (i % 3) * 4); x.stroke();
        x.strokeStyle = 'rgba(150,95,50,0.35)'; x.lineWidth = 12; x.stroke(); }
      return M('roof-' + key, { map: texOf(c), emissive: '#33322f' });
    }
    for (const p of B.parts) {
      const P = p.ring.map(c => toEN(c[0], c[1])), H = p.h;
      for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]); if (Ls < 0.3) continue;
        const ry = Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, mz = -(a[1] + b[1]) / 2;
        const skip = (p.skip && p.skip[i]) ? [p.skip[i]] : null;
        const w = new THREE.Mesh(new THREE.PlaneGeometry(Ls, H), facade(p.k + i, Ls, H, { skip })); w.position.set(mx, H / 2, mz); w.rotation.y = ry; g.add(w);
        const cp = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.4, 0.28, 0.42), cream); cp.position.set(mx, H + 0.14, mz); cp.rotation.y = ry; g.add(cp); }
      const sh = new THREE.Shape(P.map(q => new THREE.Vector2(q[0], q[1])));
      const bb = P.reduce((m, q) => [Math.min(m[0], q[0]), Math.min(m[1], q[1]), Math.max(m[2], q[0]), Math.max(m[3], q[1])], [1e9, 1e9, -1e9, -1e9]);
      const rg = new THREE.ShapeGeometry(sh); const uv = rg.attributes.position; const UV = [];
      for (let i = 0; i < uv.count; i++) UV.push((uv.getX(i) - bb[0]) / (bb[2] - bb[0]), (uv.getY(i) - bb[1]) / (bb[3] - bb[1]));
      rg.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); rg.rotateX(-Math.PI / 2);
      const r = new THREE.Mesh(rg, roofTex(p.k, 1, 1, p.rust)); r.position.y = H + 0.02; g.add(r);
      for (let k = 0; k < (p.rtu || 0); k++) { const q = P[0], c0 = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]; g.add(box(1.6, 0.9, 1.2, c0[0] - 4 + k * 4, H, -(c0[1] + 3 - k * 2), M('rtu', { color: '#c9ccce' }))); }
    }
    // entrance pavilion (local x along the south face, local +z = outward / south)
    { const q = B.pav, c = toEN(q.c[0], q.c[1]), pv = new THREE.Group(); pv.position.set(c[0], 0, -c[1]); pv.rotation.y = q.a * Math.PI / 180; g.add(pv);
      const W = q.w, D = q.d, H = q.h;
      const lc = cvs(W * 40, 90), lx = lc.getContext('2d'); lx.fillStyle = '#ddd2b8'; lx.fillRect(0, 0, lc.width, 90); lx.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < lc.width; i += 60) lx.fillRect(i, 0, 2, 90);
      lx.fillStyle = '#4d4a44'; lx.textAlign = 'center'; lx.font = 'bold 24px "DejaVu Serif", Georgia, serif'; lx.fillText('R.C. PUGH LIBRARY', lc.width / 2, 58);
      const front = M('pavfront', { map: texOf(lc), emissive: '#2f2b24' });
      // two piers + lintel band with lettering, recessed glass entry
      for (const s of [-1, 1]) pv.add(box(W * 0.27, H - 1.6, D, s * (W / 2 - W * 0.135), 0, D / 2, tan));
      const band = new THREE.Mesh(new THREE.BoxGeometry(W, 1.6, D), [tan, tan, tan, tan, front, tan]); band.position.set(0, H - 0.8, D / 2); pv.add(band);
      pv.add(box(W + 0.3, 0.25, D + 0.3, 0, H, D / 2, cream));
      pv.add(box(W * 0.46, H - 1.6, 0.2, 0, 0, 0.1, M('glass', { color: '#2c3946', emissive: '#0d1218' })));
      pv.add(box(W * 0.46, 0.06, D, 0, H - 1.65, D / 2, M('soffit', { color: '#efe9da' })));
      for (const s of [-0.12, 0.12]) pv.add(box(0.05, 2.3, 0.05, s * W, 0, 0.23, M('mull', { color: '#c8ccd0' }))); }
    // entry plaza (raised brick), steps, stepped planter walls with white urns
    const o = toEN(B.oll[0], B.oll[1]); const at = (e, n) => [o[0] + e, -(o[1] + n)];
    const terr = M('terr', { color: '#a9573f', emissive: '#1b100c' });
    { const [x, z] = at(0, 0); g.add(box(B.plaza_w, B.plaza_h, B.plaza_d, x, 0, z - B.plaza_d / 2, terr)); }
    for (let i = 0; i < B.risers; i++) { const t = 0.38, h = B.plaza_h * (B.risers - i) / (B.risers + 1); const [x, z] = at(0, -(i + 0.5) * t); g.add(box(B.step_w, h, t, x, 0, z, conc)); }
    const urnM = M('urn', { color: '#f2f0ea', emissive: '#3d3c38' }), soil = M('soil', { color: '#4a3526' }), green = lam('shrub', { color: '#4f8a43', flatShading: true });
    for (const s of [-1, 1]) {
      for (const st of B.steps_pl) { const [x, z] = at(s * st[0], st[1]); g.add(box(st[2], st[3], st[4], x, 0, z, brk)); g.add(box(st[2] + 0.12, 0.08, st[4] + 0.12, x, st[3], z, cream)); }
      const [x, z] = at(s * B.urn[0], B.urn[1]), hp = B.urn[2];
      g.add(box(1.5, hp, 1.5, x, 0, z, brk)); g.add(box(1.62, 0.1, 1.62, x, hp, z, cream));
      const pts = [[0.05, 0], [0.25, 0.05], [0.25, 0.18], [0.5, 0.3], [0.62, 0.5], [0.64, 0.6], [0.55, 0.6]].map(q => new THREE.Vector2(q[0], q[1]));
      const u = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), urnM); u.position.set(x, hp + 0.1, z); g.add(u);
      const sp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), green); sp.position.set(x, hp + 0.95, z); sp.scale.set(0.8, 1.3, 0.8); g.add(sp);
    }
    // west mechanical yard: low brick wall + units
    { const P = B.yard.map(c => toEN(c[0], c[1])), um = M('ac', { color: '#d4d7d9', emissive: '#2d2e2f' });
      for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]); if (i === B.yard_open) continue;
        const w = new THREE.Mesh(new THREE.BoxGeometry(Ls, 2.2, 0.3), brk); w.position.set((a[0] + b[0]) / 2, 1.1, -(a[1] + b[1]) / 2); w.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(w); }
      for (const q of B.units) { const c = toEN(q[0], q[1]); g.add(box(1.4, 1.3, 1.2, c[0], 0, -c[1], um)); g.add(box(0.9, 0.05, 0.9, c[0], 1.3, -c[1], dark)); } }
    // lamp posts (dark, twin lantern) and bollards
    { const pm = M('lamp-post', { color: '#22252a' }), gl = M('lamp-globe', { color: '#fff7dc', emissive: '#bfb28a' });
      for (const q of B.lamps) { const c = toEN(q[0], q[1]); g.add(box(0.32, 0.3, 0.32, c[0], 0, -c[1], pm));
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), pm); p.position.set(c[0], 2.3, -c[1]); g.add(p);
        g.add(box(1.2, 0.07, 0.07, c[0], 4.25, -c[1], pm));
        for (const s of [-0.55, 0.55]) { const lt = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.42, 10), pm); lt.position.set(c[0] + s, 4.05, -c[1]); g.add(lt);
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 6), gl); b.position.set(c[0] + s, 3.82, -c[1]); g.add(b); } }
      for (const q of B.bollards) { const c = toEN(q[0], q[1]); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.0, 10), pm); p.position.set(c[0], 0.5, -c[1]); g.add(p);
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 10), gl); b.position.set(c[0], 0.95, -c[1]); g.add(b); } }
    return g;
  }
  // <<< LIB-53 build
  // CONN-56 build >>>
  // Tate Hall (#56) west connector to the library: 1-story red brick, white cornice, gray shingle hip roofs (narrow N-S section + wider south
  // section), white pediment porch (2 round columns + pilasters) over glass double doors, concrete steps + black rails, accessible ramp with
  // rails along the front, brick planter walls, tall white-trimmed windows with cap lintels, 2 roof vents. NO ground shadows.
  function buildConn56() {
    const B = L.conn56, g = new THREE.Group(); g.name = 'conn-56';
    const M = (k, o) => lam('cn-' + k, Object.assign({ side: THREE.FrontSide }, o));
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const white = M('white', { color: '#f5f3ee', emissive: '#3b3a36' }), conc = M('conc', { color: '#d9d5ca' }), rail = M('rail', { color: '#1d2024' });
    const brk = M('brick', { color: '#a9573f', emissive: '#1c120e' }), dark = M('dark', { color: '#2a2e33' });
    const PX = 20;
    function facade(key, len, H, wins) {
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 3 + key.length * 29 + Math.round(len * 11); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const base = ['#b25b45', '#a5523e', '#bb664f', '#97473a'];
      x.fillStyle = base[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { const t = rnd(); x.fillStyle = base[t < 0.35 ? 1 : t < 0.7 ? 2 : t < 0.9 ? 0 : 3]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = 'rgba(80,45,32,0.16)'; for (let hh = 0; hh < H; hh += 0.3) x.fillRect(0, Y(hh), c.width, 1);
      for (const u of wins) { const ww = 1.0, wh = 2.2, z = 0.9, u0 = u - ww / 2;
        x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.14), Y(z + wh + 0.14), (ww + 0.28) * PX, (wh + 0.28) * PX);
        const gr = x.createLinearGradient(0, Y(z + wh), 0, Y(z)); gr.addColorStop(0, '#6f8597'); gr.addColorStop(1, '#2b3743'); x.fillStyle = gr; x.fillRect(U(u0), Y(z + wh), ww * PX, wh * PX);
        x.fillStyle = '#efede6'; x.fillRect(U(u0), Y(z + wh * 0.55) - 2, ww * PX, 4); x.fillRect(U(u) - 1, Y(z + wh), 2, wh * PX);
        x.fillStyle = '#f4f2ec'; x.beginPath(); x.moveTo(U(u0 - 0.3), Y(z + wh + 0.3)); x.lineTo(U(u0 + ww + 0.3), Y(z + wh + 0.3)); x.lineTo(U(u), Y(z + wh + 0.65)); x.fill();
        x.fillRect(U(u0 - 0.15), Y(z - 0.02), (ww + 0.3) * PX, 0.14 * PX); }
      return M('fac-' + key, { map: texOf(c), emissive: '#1c1410', side: THREE.DoubleSide });
    }
    const shc = cvs(64, 64), shx = shc.getContext('2d'); shx.fillStyle = '#6a6e74'; shx.fillRect(0, 0, 64, 64);
    for (let r = 0; r < 4; r++) { shx.fillStyle = 'rgba(20,22,25,0.35)'; shx.fillRect(0, r * 16 + 14, 64, 2); for (let k = 0; k < 4; k++) { shx.fillStyle = (r + k) % 3 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; shx.fillRect(k * 16 + (r % 2) * 8, r * 16, 15, 14); } }
    const roofM = lam('cn-roof', { map: texOf(shc, true), side: THREE.DoubleSide, emissive: '#121315' });
    function hip(x0, x1, z0, z1, y, pitch, mat) {
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
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); ge.computeVertexNormals();
      return new THREE.Mesh(ge, mat || roofM);
    }
    const R = q => { const a = toEN(q[0][0], q[0][1]), b = toEN(q[1][0], q[1][1]); return { x0: a[0], y0: a[1], x1: b[0], y1: b[1], W: b[0] - a[0], D: b[1] - a[1], cx: (a[0] + b[0]) / 2, cz: -(a[1] + b[1]) / 2 }; };
    const H = B.h, ov = 0.45;
    for (const p of B.parts) { const r = R(p.r);
      const mats = [p.e ? facade(p.k + 'e', r.D, H, p.e) : M('hid', { visible: false }), p.w ? facade(p.k + 'w', r.D, H, p.w) : M('hid', { visible: false }), dark, dark,
        p.s ? facade(p.k + 's', r.W, H, p.s) : M('hid', { visible: false }), p.n ? facade(p.k + 'n', r.W, H, p.n) : M('hid', { visible: false })];
      const m = new THREE.Mesh(new THREE.BoxGeometry(r.W, H, r.D), mats); m.position.set(r.cx, H / 2, r.cz); g.add(m);
      g.add(box(r.W + 2 * ov, 0.32, r.D + 2 * ov, r.cx, H - 0.3, r.cz, white));
      g.add(hip(r.x0 - ov, r.x1 + ov, -r.y1 - ov, -r.y0 + ov, H + 0.02, B.pitch, roofM)); }
    for (const v of B.vents) { const c = toEN(v[0], v[1]); g.add(box(0.5, 0.5, 0.5, c[0], H + 1.2, -c[1], M('vent', { color: '#3a3d42' }))); }
    // pediment porch on the south face: deck, 2 round columns + pilasters, entablature, gable roof (ridge N-S) with white tympanum, glass doors
    { const c = toEN(B.porch.c[0], B.porch.c[1]), W = B.porch.w, D = B.porch.d, Hp = B.porch.deck, top = H - 0.2, x0 = c[0], zF = -c[1] + D;   // c = centre on the wall line
      g.add(box(W, Hp, D, x0, 0, -c[1] + D / 2, conc));
      for (let i = 0; i < B.porch.risers; i++) g.add(box(W - 0.6, Hp * (B.porch.risers - i) / (B.porch.risers + 1), 0.33, x0, 0, zF + 0.165 + i * 0.33, conc));
      for (const s of [-1, 1]) { const cl = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, top - Hp - 0.5, 14), white); cl.position.set(x0 + s * (W / 2 - 0.35), Hp + (top - Hp - 0.5) / 2, zF - 0.35); g.add(cl);
        g.add(box(0.4, top - Hp - 0.5, 0.15, x0 + s * (W / 2 - 0.35), Hp, -c[1] + 0.08, white)); g.add(box(0.5, 0.15, 0.5, x0 + s * (W / 2 - 0.35), Hp, zF - 0.35, white)); }
      g.add(box(W + 0.3, 0.5, D + 0.2, x0, top - 0.5, -c[1] + D / 2, white));
      const ph = 1.25, sh = new THREE.Shape(); sh.moveTo(-W / 2 - 0.2, 0); sh.lineTo(W / 2 + 0.2, 0); sh.lineTo(0, ph); sh.lineTo(-W / 2 - 0.2, 0);
      const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false }); const t = new THREE.Mesh(tg, white); t.position.set(x0, top, zF - 0.1); g.add(t);
      const sl = Math.hypot(W / 2 + 0.35, ph), an = Math.atan2(ph, W / 2 + 0.35);
      for (const s of [-1, 1]) { const rf = new THREE.Mesh(new THREE.BoxGeometry(sl, 0.1, D + 0.8), roofM); rf.position.set(x0 + s * (W / 4 + 0.1), top + ph / 2 + 0.05, -c[1] + D / 2); rf.rotation.z = -s * an; g.add(rf); }
      g.add(box(1.8, 2.4, 0.12, x0, Hp, -c[1] + 0.06, M('glass', { color: '#3a4a58', emissive: '#10161c' })));
      g.add(box(0.06, 2.4, 0.14, x0, Hp, -c[1] + 0.07, white));
      // black rails both sides of the steps
      for (const s of [-1, 1]) { const xr = x0 + s * (W / 2 - 0.45), L_ = Math.hypot(B.porch.risers * 0.33, Hp);
        const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, L_ + 0.3), rail); r.position.set(xr, Hp / 2 + 0.9, zF + B.porch.risers * 0.165); r.rotation.x = -Math.atan2(Hp, B.porch.risers * 0.33); g.add(r);
        g.add(box(0.05, 0.9, 0.05, xr, Hp, zF, rail)); g.add(box(0.05, 0.9, 0.05, xr, 0, zF + B.porch.risers * 0.33, rail)); } }
    // accessible ramp along the front (porch deck height -> grade), black rails both sides
    { const a = toEN(B.ramp[0][0], B.ramp[0][1]), b = toEN(B.ramp[1][0], B.ramp[1][1]), Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), ry = Math.atan2(b[1] - a[1], b[0] - a[0]), hR = B.porch.deck, w = B.ramp_w;
      const grp = new THREE.Group(); grp.position.set(a[0], 0, -a[1]); grp.rotation.y = ry; g.add(grp);
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(Ls, 0); sh.lineTo(0, hR); sh.lineTo(0, 0);
      const rg = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); const rm = new THREE.Mesh(rg, conc); rm.position.z = -w / 2; grp.add(rm);
      const sl = Math.atan2(hR, Ls), RL = Math.hypot(Ls, hR);
      for (const s of [-1, 1]) { for (const hh of [0.9, 0.45]) { const r = new THREE.Mesh(new THREE.BoxGeometry(RL, 0.05, 0.05), rail); r.position.set(Ls / 2, hR / 2 + hh, s * (w / 2 - 0.05)); r.rotation.z = -sl; grp.add(r); }
        for (let k = 0; k <= 4; k++) { const u = Ls * k / 4; grp.add(box(0.05, 0.95, 0.05, u, hR * (1 - u / Ls), s * (w / 2 - 0.05), rail)); } }
      grp.add(box(0.25, 0.5, w + 0.3, Ls * 0.5, 0, -w / 2 - 0.6, brk)); }
    // brick planter walls in front
    for (const q of B.planters) { const a = toEN(q[0][0], q[0][1]), b = toEN(q[1][0], q[1][1]);
      g.add(box(b[0] - a[0], q[2], b[1] - a[1], (a[0] + b[0]) / 2, 0, -(a[1] + b[1]) / 2, brk)); g.add(box(b[0] - a[0] + 0.1, 0.08, b[1] - a[1] + 0.1, (a[0] + b[0]) / 2, q[2], -(a[1] + b[1]) / 2, white));
      g.add(box(b[0] - a[0] - 0.4, 0.06, b[1] - a[1] - 0.4, (a[0] + b[0]) / 2, q[2] - 0.08, -(a[1] + b[1]) / 2, M('mulch', { color: '#5e4330' }))); }
    return g;
  }
  // <<< CONN-56 build
  // W58 build >>>
  // #58 Strategic Communications site (2026-10-12): flagpoles, light poles, hydrant, sign post, walled courtyard with curved
  // planters NE of #58 + the low garden wall running east. NO ground shadows.
  function buildW58() {
    const D = L.w58, g = new THREE.Group(); g.name = 'w58-site';
    const EN = c => toEN(c[0], c[1]);
    const brick = lam('w58-brick', { color: '#a5503a' }), cap = lam('w58-cap', { color: '#ece8de' }), soil = lam('w58-mulch', { color: '#6e4a33' });
    const pole = lam('w58-pole', { color: '#f4f4f1', emissive: '#3c3c3a' }), dark = lam('w58-dark', { color: '#33363a' }), red = lam('w58-red', { color: '#b8322a' });
    function wall(a, b, h, t, m) {
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ry = Math.atan2(dy, dx);
      const w = box(len + t, h, t, (a[0] + b[0]) / 2, 0, -(a[1] + b[1]) / 2, m); w.rotation.y = ry; g.add(w);
      const c = box(len + t + 0.08, 0.08, t + 0.1, (a[0] + b[0]) / 2, h, -(a[1] + b[1]) / 2, cap); c.rotation.y = ry; g.add(c);
    }
    for (const W of D.walls) { const P = W.pts.map(EN); for (let i = 0; i < P.length - 1; i++) wall(P[i], P[i + 1], W.h, W.t || 0.3, brick); }
    for (const pl of D.planters) {   // curved planter: wall along the arc + mulch fill
      const P = pl.map(EN); for (let i = 0; i < P.length - 1; i++) wall(P[i], P[i + 1], 0.55, 0.25, brick);
    }
    for (const c of D.flags) {
      const [x, y] = EN(c);
      g.add(cyl(0.11, 0.05, D.flag_h, x, 0, -y, pole, 12)); g.add(cyl(0.25, 0.25, 0.2, x, 0, -y, cap, 12));
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), lam('w58-gold', { color: '#d9b44a' })); ball.position.set(x, D.flag_h + 0.1, -y); g.add(ball);
    }
    for (const c of D.lamps) {
      const [x, y] = EN(c);
      g.add(cyl(0.09, 0.07, 6.5, x, 0, -y, dark, 10));
      g.add(box(0.5, 0.3, 0.5, x, 6.5, -y, dark)); g.add(box(0.36, 0.08, 0.36, x, 6.42, -y, lam('w58-led', { color: '#fffbe8', emissive: '#8a856c' })));
    }
    { const [x, y] = EN(D.hydrant); g.add(cyl(0.14, 0.14, 0.6, x, 0, -y, red, 12)); g.add(cyl(0.17, 0.05, 0.16, x, 0.6, -y, red, 12));
      g.add(box(0.46, 0.1, 0.1, x, 0.38, -y, red)); }
    { const [x, y] = EN(D.sign); g.add(box(0.07, 1.2, 0.07, x, 0, -y, dark)); g.add(box(0.5, 0.3, 0.04, x, 1.0, -y, dark)); }
    for (const c of (D.bollards || [])) { const [x, y] = EN(c); g.add(cyl(0.1, 0.1, 0.95, x, 0, -y, dark, 10)); }
    for (const c of (D.acc || [])) { const [x, y] = EN(c); g.add(box(1.2, 0.02, 1.2, x, 0.02, -y, lam('w58-acc', { color: '#2f6fb8' })));
      const w = box(0.5, 0.025, 0.5, x, 0.03, -y, lam('w58-accw', { color: '#f4f6f8' })); g.add(w); }
    if (D.rsign) {   // RANGER CENTRAL sign: white panel, blue frame, red/blue lettering, two blue posts
      const [x, y] = EN(D.rsign), sg = new THREE.Group(); sg.position.set(x, 0, -y); sg.rotation.y = (D.rsign_rot || 0) * Math.PI / 180;
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const c2 = cv.getContext('2d');
      c2.fillStyle = '#ffffff'; c2.fillRect(0, 0, 256, 128); c2.strokeStyle = '#1f4f9c'; c2.lineWidth = 10; c2.strokeRect(5, 5, 246, 118);
      c2.textAlign = 'center'; c2.font = 'bold 46px "DejaVu Sans", Arial'; c2.fillStyle = '#1f4f9c'; c2.fillText('RANGER', 128, 58); c2.fillStyle = '#c4262e'; c2.fillText('CENTRAL', 128, 106);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const face = new THREE.MeshLambertMaterial({ map: t, emissive: '#333333' }), blue = lam('w58-blue', { color: '#1f4f9c' });
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.1), [blue, blue, blue, blue, face, face]); panel.position.set(0, 1.25, 0); sg.add(panel);
      sg.add(box(0.1, 1.9, 0.1, -1.15, 0, 0, blue)); sg.add(box(0.1, 1.9, 0.1, 1.15, 0, 0, blue)); g.add(sg);
    }
    return g;
  }
  // <<< W58 build
  // N22 build >>>
  // #22A Academic Nursing + #22B Health Sciences (Gary Lee Spears Center), 2026-10-12: two-story red brick with white bands, gray shingle
  // hip roofs with gables, flat light-gray roof sections, brick-pier porches with white bracketed trim, covered connector, tan block
  // retaining walls + stairs, Spears Center sign wall, lamps + bollards. NO ground shadows.
  function buildN22() {
    const B = L.n22, g = new THREE.Group(); g.name = 'n22';
    const M = (k, o) => lam('n22-' + k, Object.assign({ side: THREE.DoubleSide }, o));
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const white = M('white', { color: '#f1eee6', emissive: '#3a3833' }), brk = M('brick', { color: '#a5523c', emissive: '#1d110c' });
    const shing = M('shingle', { color: '#5f6268', emissive: '#14161a' }), flat = M('flat', { color: '#b8bcbf', emissive: '#2c2e30' });
    const lite = M('lite', { color: '#a7acb1', emissive: '#26292c' }), tanb = M('tanblock', { color: '#a8977c', emissive: '#211c15' });
    const conc = M('conc', { color: '#d8d4ca' }), dark = M('dark', { color: '#23262b' }), glass = M('glass', { color: '#2c3946', emissive: '#0d1218' });
    const PX = 16, FM = {};
    function facade(len, H) {
      const key = Math.round(len * 4) + ':' + Math.round(H * 10); if (FM[key]) return FM[key];
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 7 + Math.round(len * 13); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const base = ['#a7553e', '#9b4b36', '#b25f45', '#8f4431'];
      x.fillStyle = base[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { const t = rnd(); x.fillStyle = base[t < 0.35 ? 1 : t < 0.7 ? 2 : t < 0.9 ? 0 : 3]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      x.fillStyle = '#efebe1';                                              // white bands: water table, floor line, frieze
      x.fillRect(0, Y(0.65), c.width, 0.2 * PX); x.fillRect(0, Y(H / 2 + 0.15), c.width, 0.22 * PX); x.fillRect(0, Y(H - 0.2), c.width, 0.35 * PX);
      if (H > 5) {
        const step = 4.2, n = Math.max(1, Math.floor((len - 1.2) / step)), off = (len - n * step) / 2;
        for (const [z0, wh] of [[1.05, 1.9], [H / 2 + 0.7, 1.9]]) for (let k = 0; k < n; k++) {
          const u0 = off + k * step + 0.7, ww = step - 1.4;
          x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.1), Y(z0 + wh + 0.1), (ww + 0.2) * PX, (wh + 0.2) * PX);
          const gr = x.createLinearGradient(0, Y(z0 + wh), 0, Y(z0)); gr.addColorStop(0, '#647a8d'); gr.addColorStop(1, '#27323c'); x.fillStyle = gr; x.fillRect(U(u0), Y(z0 + wh), ww * PX, wh * PX);
          x.fillStyle = '#f0eee8'; for (let i = 1; i < 3; i++) x.fillRect(U(u0 + ww * i / 3) - 1, Y(z0 + wh), 3, wh * PX);
          x.fillRect(U(u0), Y(z0 + wh * 0.72) - 1, ww * PX, 3);                                       // transom bar
          for (let i = 1; i < 6; i++) x.fillRect(U(u0 + ww * i / 6), Y(z0 + wh), 1, wh * 0.28 * PX);   // transom muntins
          x.fillStyle = '#e9e4d7'; x.fillRect(U(u0 - 0.2), Y(z0 - 0.02), (ww + 0.4) * PX, 0.13 * PX);
        }
      } else {
        const step = 3.0, n = Math.max(1, Math.floor((len - 0.8) / step)), off = (len - n * step) / 2;
        for (let k = 0; k < n; k++) { const u0 = off + k * step + 0.5, ww = step - 1.0; x.fillStyle = '#f4f2ec'; x.fillRect(U(u0 - 0.08), Y(2.6), (ww + 0.16) * PX, 1.9 * PX); x.fillStyle = '#34414c'; x.fillRect(U(u0), Y(2.5), ww * PX, 1.7 * PX); }
      }
      return (FM[key] = M('fac' + key, { map: texOf(c), emissive: '#1c1410' }));
    }
    function addTris(arr, m) { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); ge.computeVertexNormals(); g.add(new THREE.Mesh(ge, m)); }
    const Q = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    // frustum hip: rectangle [x0,x1]x[n0,n1] (E,N) eaves at y, top inset i (i >= half the short side -> true hip ridge)
    function hip(x0, n0, x1, n1, y, pitch, inset, m, mTop, ov) {
      ov = ov == null ? 0.5 : ov; x0 -= ov; n0 -= ov; x1 += ov; n1 += ov;
      const w = x1 - x0, d = n1 - n0, h2 = Math.min(w, d) / 2, i = Math.min(inset == null ? h2 : inset, h2), r = i * Math.tan(pitch * Math.PI / 180), Y = y + r;
      const P = (e, n, yy) => [e, yy, -n];
      const b = [P(x0, n0, y), P(x1, n0, y), P(x1, n1, y), P(x0, n1, y)], t = [P(x0 + i, n0 + i, Y), P(x1 - i, n0 + i, Y), P(x1 - i, n1 - i, Y), P(x0 + i, n1 - i, Y)];
      const A = []; for (let k = 0; k < 4; k++) Q(A, b[k], b[(k + 1) % 4], t[(k + 1) % 4], t[k]); addTris(A, m);
      if (w - 2 * i > 0.05 && d - 2 * i > 0.05) { const T = []; Q(T, t[0], t[1], t[2], t[3]); addTris(T, mTop || m); }
      return Y;
    }
    // gable: ridge along E-W (ax 'x') or N-S (ax 'y'); brick gable-end triangles with a white rake
    function gable(x0, n0, x1, n1, y, pitch, ax, m, ov) {
      ov = ov == null ? 0.45 : ov; const P = (e, n, yy) => [e, yy, -n];
      const A = [], T = [];
      if (ax === 'x') { const r = (n1 - n0) / 2 * Math.tan(pitch * Math.PI / 180), nm = (n0 + n1) / 2;
        Q(A, P(x0 - ov, n0 - ov, y), P(x1 + ov, n0 - ov, y), P(x1 + ov, nm, y + r), P(x0 - ov, nm, y + r)); Q(A, P(x0 - ov, n1 + ov, y), P(x1 + ov, n1 + ov, y), P(x1 + ov, nm, y + r), P(x0 - ov, nm, y + r));
        for (const e of [x0, x1]) T.push(...P(e, n0, y), ...P(e, n1, y), ...P(e, nm, y + r)); }
      else { const r = (x1 - x0) / 2 * Math.tan(pitch * Math.PI / 180), em = (x0 + x1) / 2;
        Q(A, P(x0 - ov, n0 - ov, y), P(x0 - ov, n1 + ov, y), P(em, n1 + ov, y + r), P(em, n0 - ov, y + r)); Q(A, P(x1 + ov, n0 - ov, y), P(x1 + ov, n1 + ov, y), P(em, n1 + ov, y + r), P(em, n0 - ov, y + r));
        for (const n of [n0, n1]) T.push(...P(x0, n, y), ...P(x1, n, y), ...P(em, n, y + r)); }
      addTris(A, m); addTris(T, brk);
    }
    function walls(x0, n0, x1, n1, H) {
      const R = [[x0, n0], [x1, n0], [x1, n1], [x0, n1], [x0, n0]];
      for (let k = 0; k < 4; k++) { const a = R[k], b = R[k + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const w = new THREE.Mesh(new THREE.PlaneGeometry(Ls, H), facade(Ls, H)); w.position.set((a[0] + b[0]) / 2, H / 2, -(a[1] + b[1]) / 2); w.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(w); }
      g.add(box(x1 - x0 + 0.5, 0.3, n1 - n0 + 0.5, (x0 + x1) / 2, H - 0.3, -(n0 + n1) / 2, white));     // white cornice
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, n1 - n0), dark); fl.rotation.x = -Math.PI / 2; fl.position.set((x0 + x1) / 2, H - 0.05, -(n0 + n1) / 2); g.add(fl);
    }
    for (const p of B.parts) {
      const a = toEN(p.r[0][0], p.r[0][1]), b = toEN(p.r[1][0], p.r[1][1]), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), n0 = Math.min(a[1], b[1]), n1 = Math.max(a[1], b[1]);
      walls(x0, n0, x1, n1, p.h);
      const rm = p.roof === 'lhip' ? lite : shing;
      if (p.roof === 'gable') gable(x0, n0, x1, n1, p.h, p.pitch, p.ax, shing);
      else hip(x0, n0, x1, n1, p.h, p.pitch, p.inset, rm, p.roof === 'phip' ? flat : lite);
      for (let k = 0; k < (p.rtu || 0); k++) g.add(box(1.6, 0.9, 1.2, x0 + (x1 - x0) * (k + 1) / (p.rtu + 1), p.h + (p.inset || 0) * Math.tan(p.pitch * Math.PI / 180), -(n0 + n1) / 2, M('rtu', { color: '#cfd2d4' })));
    }
    // porches: brick piers with white base + cap, white beam with bracket triangles, low shingle hip roof (local +z = outward)
    for (const q of B.porches) {
      const c = toEN(q.c[0], q.c[1]), pv = new THREE.Group(); pv.position.set(c[0], 0, -c[1]); pv.rotation.y = q.a * Math.PI / 180; g.add(pv);
      const W = q.w, D = q.d, H = q.h, n = q.piers;
      pv.add(box(W, 0.25, D, 0, 0, D / 2, conc));
      for (let k = 0; k < n; k++) { const px = -W / 2 + 0.35 + k * (W - 0.7) / (n - 1);
        pv.add(box(0.7, H - 0.6, 0.7, px, 0.25, D - 0.35, brk)); pv.add(box(0.8, 0.25, 0.8, px, 0.25, D - 0.35, white)); pv.add(box(0.8, 0.18, 0.8, px, H - 0.6, D - 0.35, white));
        if (k < n - 1) { const sp = (W - 0.7) / (n - 1), sh = new THREE.Shape([new THREE.Vector2(-0.45, 0), new THREE.Vector2(0.45, 0), new THREE.Vector2(0, -0.55)]);
          for (const s of [px + 0.55, px + sp - 0.55]) { const tg = new THREE.ShapeGeometry(sh), tm = new THREE.Mesh(tg, white); tm.position.set(s, H - 0.35, D - 0.02); pv.add(tm); } } }
      pv.add(box(W + 0.2, 0.42, 0.3, 0, H - 0.42, D - 0.3, white)); pv.add(box(0.3, 0.42, D, -W / 2 + 0.05, H - 0.42, D / 2, white)); pv.add(box(0.3, 0.42, D, W / 2 - 0.05, H - 0.42, D / 2, white));
      pv.add(box(W * 0.3, 2.4, 0.12, 0, 0.25, 0.08, glass));
      { const A = [], ov = 0.4, r = Math.min(W, D) / 2 * Math.tan(22 * Math.PI / 180), y = H, P = (e, z, yy) => [e, yy, z];
        const x0 = -W / 2 - ov, x1 = W / 2 + ov, z0 = -0.2, z1 = D + ov, i = Math.min(W, D + 0.2) / 2;
        const b = [P(x0, z0, y), P(x1, z0, y), P(x1, z1, y), P(x0, z1, y)], t = [P(x0 + i, z0 + i, y + r), P(x1 - i, z0 + i, y + r), P(x1 - i, z1 - i, y + r), P(x0 + i, z1 - i, y + r)];
        for (let k = 0; k < 4; k++) Q(A, b[k], b[(k + 1) % 4], t[(k + 1) % 4], t[k]);
        const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(A, 3)); ge.computeVertexNormals(); pv.add(new THREE.Mesh(ge, shing)); }
    }
    // covered connector walkway: white posts + low gable roof
    for (const q of B.covers) { const a = toEN(q.r[0][0], q.r[0][1]), b = toEN(q.r[1][0], q.r[1][1]), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), n0 = Math.min(a[1], b[1]), n1 = Math.max(a[1], b[1]);
      for (let n = n0 + 0.3; n <= n1; n += 3) for (const e of [x0 + 0.2, x1 - 0.2]) g.add(box(0.28, q.h, 0.28, e, 0, -n, white));
      g.add(box(x1 - x0 + 0.2, 0.3, n1 - n0, (x0 + x1) / 2, q.h - 0.3, -(n0 + n1) / 2, white)); gable(x0, n0, x1, n1, q.h, 24, 'y', shing, 0.35); }
    // retaining walls (tan block, cap) and stairs with rails
    for (const q of B.rwalls) { const P = q.p.map(c => toEN(c[0], c[1]));
      for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), ry = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const w = new THREE.Mesh(new THREE.BoxGeometry(Ls, q.h, 0.4), tanb); w.position.set((a[0] + b[0]) / 2, q.h / 2, -(a[1] + b[1]) / 2); w.rotation.y = ry; g.add(w);
        const cp = new THREE.Mesh(new THREE.BoxGeometry(Ls + 0.1, 0.08, 0.5), conc); cp.position.set((a[0] + b[0]) / 2, q.h + 0.04, -(a[1] + b[1]) / 2); cp.rotation.y = ry; g.add(cp); } }
    for (const q of B.stairs) { const c = toEN(q.c[0], q.c[1]), sg = new THREE.Group(); sg.position.set(c[0], 0, -c[1]); sg.rotation.y = q.a * Math.PI / 180; g.add(sg);
      const t = 0.35, rs = q.rise / q.n, rail = M('rail', { color: '#30343a' });
      for (let k = 0; k < q.n; k++) sg.add(box(q.w, q.rise - k * rs, t, 0, 0, -k * t + q.n * t / 2 - t / 2, conc));
      for (const s of [-1, 1]) { sg.add(box(0.45, q.rise + 0.3, q.n * t, s * (q.w / 2 + 0.22), 0, 0, brk));
        const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, q.n * t + 0.6), rail); r.position.set(s * (q.w / 2 - 0.1), q.rise / 2 + 0.95, 0); r.rotation.x = -Math.atan2(q.rise, q.n * t); sg.add(r);
        for (const z of [-q.n * t / 2, 0, q.n * t / 2]) sg.add(box(0.05, 0.95, 0.05, s * (q.w / 2 - 0.1), q.rise * (0.5 - z / (q.n * t)), z, rail)); } }
    // sign wall "GARY LEE SPEARS CENTER / FOR NURSING AND HEALTH SCIENCES"
    for (const q of B.signs) { const c = toEN(q.c[0], q.c[1]), sg = new THREE.Group(); sg.position.set(c[0], 0, -c[1]); sg.rotation.y = q.a * Math.PI / 180; g.add(sg);
      const lc = cvs(q.w * 60, q.h * 60), lx = lc.getContext('2d'); lx.fillStyle = '#cbbfa6'; lx.fillRect(0, 0, lc.width, lc.height);
      lx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < lc.width; i += 90) lx.fillRect(i, 0, 2, lc.height); lx.fillRect(0, lc.height / 2, lc.width, 2);
      lx.fillStyle = '#5c5548'; lx.textAlign = 'center'; lx.font = 'bold ' + Math.round(lc.height * 0.22) + 'px "DejaVu Serif", Georgia, serif'; lx.fillText('GARY LEE SPEARS CENTER', lc.width / 2, lc.height * 0.42);
      lx.font = 'bold ' + Math.round(lc.height * 0.15) + 'px "DejaVu Serif", Georgia, serif'; lx.fillText('FOR NURSING AND HEALTH SCIENCES', lc.width / 2, lc.height * 0.72);
      const fm = M('signface', { map: texOf(lc), emissive: '#2f2b24' });
      const m = new THREE.Mesh(new THREE.BoxGeometry(q.w, q.h, 0.5), [tanb, tanb, conc, tanb, fm, tanb]); m.position.set(0, q.h / 2, 0); sg.add(m);
      sg.add(box(q.w + 0.6, 0.6, 0.7, 0, 0, 0, tanb)); sg.add(box(q.ext, q.h * 0.75, 0.4, q.w / 2 + q.ext / 2, 0, -0.05, brk)); sg.add(box(q.ext, 0.08, 0.5, q.w / 2 + q.ext / 2, q.h * 0.75, -0.05, conc)); }
    // lamp posts + bollards (dark)
    { const pm = M('lamp-post', { color: '#22252a' }), gl = M('lamp-globe', { color: '#fff7dc', emissive: '#bfb28a' });
      for (const q of B.lamps) { const c = toEN(q[0], q[1]); g.add(box(0.32, 0.3, 0.32, c[0], 0, -c[1], pm));
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), pm); p.position.set(c[0], 2.3, -c[1]); g.add(p);
        const lt = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 10), pm); lt.position.set(c[0], 4.5, -c[1]); g.add(lt);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 6), gl); b.position.set(c[0], 4.22, -c[1]); g.add(b); }
      for (const q of B.bollards) { const c = toEN(q[0], q[1]); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 10), pm); p.position.set(c[0], 0.5, -c[1]); g.add(p); } }
    return g;
  }
  // <<< N22 build
  // B21 build >>>
  // #21 Tunica Building (2026-10-13, from Brent's 5 obliques + street front): 2-story tan brick block, white floor/eave bands, tall
  // window strips in recessed bays between brick pilasters; gray shingle hip roof with a raised central hip monitor (clerestory),
  // triangular dormer vents, rooftop box, small hip bump; centered glass storefront under a front gable with a gray louvered
  // triangle, TUNICA BUILDING sign; brick stoop + shrub beds. NO ground shadows.
  function buildB21() {
    const B = L.b21, g = new THREE.Group(); g.name = 'b21';
    const M = (k, o) => lam('b21-' + k, Object.assign({ side: THREE.DoubleSide }, o));
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const cream = M('cream', { color: '#f0eadc', emissive: '#3a3730' }), tan = M('tan', { color: '#c4ab86', emissive: '#2a2219' });
    const tanD = M('tand', { color: '#ad9472', emissive: '#211a12' }), shing = M('shingle', { color: '#6b6e73', emissive: '#16181b' });
    const dark = M('dark', { color: '#2a2e33' }), glass = M('glass', { color: '#34495a', emissive: '#0e151c' }), louv = M('louver', { color: '#8a8d90', emissive: '#202224' });
    const rbrick = M('rbrick', { color: '#9c5a45', emissive: '#1d110c' }), shrub = M('shrub', { color: '#3f6232', emissive: '#0c140a' }), mulch = M('mulch', { color: '#6e4a33' });
    const PX = 16, FM = {};
    // facade: tan brick, white bands at water table / floor line / eave; window strips (tall, both floors) in recessed (darker) bays
    function facade(len, H, bays) {
      const key = Math.round(len * 4) + ':' + bays.join(','); if (FM[key]) return FM[key];
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 11 + Math.round(len * 7); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const base = ['#c6ad88', '#bba07b', '#cfb793', '#b39874'];
      x.fillStyle = base[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { const t = rnd(); x.fillStyle = base[t < 0.35 ? 1 : t < 0.7 ? 2 : t < 0.9 ? 0 : 3]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      for (const [u0, w] of bays) {                                      // recessed bay shade + vertical window strip
        x.fillStyle = 'rgba(60,40,20,0.16)'; x.fillRect(U(u0), 0, w * PX, c.height);
        const ww = Math.min(1.5, w - 0.9), wu = u0 + (w - ww) / 2;
        x.fillStyle = '#f3efe6'; x.fillRect(U(wu - 0.1), Y(H - 1.0), (ww + 0.2) * PX, (H - 1.9) * PX);
        const gr = x.createLinearGradient(0, Y(H - 1.1), 0, Y(1.0)); gr.addColorStop(0, '#6d8396'); gr.addColorStop(1, '#2a3540'); x.fillStyle = gr; x.fillRect(U(wu), Y(H - 1.1), ww * PX, (H - 2.1) * PX);
        x.fillStyle = '#e8e2d4'; x.fillRect(U(wu), Y(H / 2 + 0.35), ww * PX, 0.6 * PX);                  // spandrel at the floor line
        x.fillStyle = '#f0ece2'; x.fillRect(U(wu + ww / 2) - 1, Y(H - 1.1), 3, (H - 2.1) * PX);
      }
      x.fillStyle = '#efe9db';                                            // cream bands: water table, floor line, eave frieze
      x.fillRect(0, Y(0.6), c.width, 0.18 * PX); x.fillRect(0, Y(H / 2 + 0.5), c.width, 0.3 * PX); x.fillRect(0, Y(H - 0.05), c.width, 0.55 * PX);
      return (FM[key] = M('fac' + key, { map: texOf(c), emissive: '#1f1a12' }));
    }
    function addTris(arr, m, grp) { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); ge.computeVertexNormals(); (grp || g).add(new THREE.Mesh(ge, m)); }
    const Q = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    function hip(x0, n0, x1, n1, y, pitch, inset, m, ov) {
      ov = ov == null ? 0.6 : ov; x0 -= ov; n0 -= ov; x1 += ov; n1 += ov;
      const w = x1 - x0, d = n1 - n0, h2 = Math.min(w, d) / 2, i = Math.min(inset == null ? h2 : inset + ov, h2), r = i * Math.tan(pitch * Math.PI / 180), Y = y + r;
      const P = (e, n, yy) => [e, yy, -n];
      const b = [P(x0, n0, y), P(x1, n0, y), P(x1, n1, y), P(x0, n1, y)], t = [P(x0 + i, n0 + i, Y), P(x1 - i, n0 + i, Y), P(x1 - i, n1 - i, Y), P(x0 + i, n1 - i, Y)];
      const A = []; for (let k = 0; k < 4; k++) Q(A, b[k], b[(k + 1) % 4], t[(k + 1) % 4], t[k]); addTris(A, m);
      if (w - 2 * i > 0.05 && d - 2 * i > 0.05) { const T = []; Q(T, t[0], t[1], t[2], t[3]); addTris(T, m); }
      g.add(box(w, 0.25, d, (x0 + x1) / 2, y - 0.25, -(n0 + n1) / 2, cream));   // fascia / soffit edge
      return Y;
    }
    const en = q => toEN(q[0], q[1]);
    const R = r => { const a = en(r[0]), b = en(r[1]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    // side frames: local x along the edge (left->right seen from outside), +z outward
    function sides(x0, n0, x1, n1) { return [
      { c: [(x0 + x1) / 2, n0], len: x1 - x0, d: n1 - n0, ry: 0, nm: 'S' }, { c: [x1, (n0 + n1) / 2], len: n1 - n0, d: x1 - x0, ry: Math.PI / 2, nm: 'E' },
      { c: [(x0 + x1) / 2, n1], len: x1 - x0, d: n1 - n0, ry: Math.PI, nm: 'N' }, { c: [x0, (n0 + n1) / 2], len: n1 - n0, d: x1 - x0, ry: -Math.PI / 2, nm: 'W' }]; }
    const frame = (s, y) => { const f = new THREE.Group(); f.position.set(s.c[0], y || 0, -s.c[1]); f.rotation.y = s.ry; g.add(f); return f; };
    const [x0, n0, x1, n1] = R(B.main.r), H = B.main.h, PIL = 1.0, BAY = 3.2;
    // ---- walls with pilasters
    for (const s of sides(x0, n0, x1, n1)) {
      const f = frame(s), n = Math.floor((s.len - PIL) / (BAY + PIL)), off = (s.len - (n * (BAY + PIL) + PIL)) / 2, bays = [];
      const front = s.nm === B.face, ew = B.entry.w;
      for (let k = 0; k < n; k++) { const u0 = off + PIL + k * (BAY + PIL); if (front && Math.abs(u0 + BAY / 2 - s.len / 2) < ew / 2 + 1) continue;
        if (front && k > 0 && k < n - 1 && Math.abs(u0 + BAY / 2 - s.len / 2) < s.len / 4) continue;       // front: solid brick panels flank the entry
        bays.push([u0, BAY]); }
      const w = new THREE.Mesh(new THREE.PlaneGeometry(s.len, H), facade(s.len, H, bays)); w.position.set(0, H / 2, 0); f.add(w);
      for (let k = 0; k <= n; k++) { const u = off + k * (BAY + PIL) + PIL / 2 - s.len / 2; f.add(box(PIL, H - 0.6, 0.3, u, 0.0, 0.15, tan)); f.add(box(PIL + 0.06, 0.2, 0.36, u, H / 2 - 0.5, 0.15, cream)); }
      f.add(box(s.len + 0.3, 0.55, 0.42, 0, H - 0.55, 0.12, cream)); f.add(box(s.len + 0.3, 0.45, 0.4, 0, 0, 0.12, tanD));
      // dormer vents on the main roof slope (triangular louvered faces, little gable roofs)
      const pr = Math.tan(B.main.pitch * Math.PI / 180);
      for (let k = 0; k < B.dormers; k++) { if (front && k === (B.dormers - 1) / 2) continue;
        const u = (k + 1) / (B.dormers + 1) * s.len - s.len / 2, dz = 2.6, yy = H + (dz + 0.6) * pr - 0.12, dv = new THREE.Group(); dv.position.set(u, yy, -dz); f.add(dv);
        const sh = new THREE.Shape([new THREE.Vector2(-0.7, 0), new THREE.Vector2(0.7, 0), new THREE.Vector2(0, 0.8)]);
        const pg = new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false }); pg.translate(0, -0.05, -1.6); const pm = new THREE.Mesh(pg, shing); dv.add(pm);
        const fm = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.55, 0.05), new THREE.Vector2(0.55, 0.05), new THREE.Vector2(0, 0.66)])), dark); fm.position.z = 0.01; dv.add(fm); }
    }
    { const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, n1 - n0), dark); fl.rotation.x = -Math.PI / 2; fl.position.set((x0 + x1) / 2, H - 0.05, -(n0 + n1) / 2); g.add(fl); }
    // ---- main roof (frustum hip up to the monitor) + raised hip monitor with a dark clerestory band + bump + roof box
    const [mx0, mn0, mx1, mn1] = R(B.mon.r), yM = hip(x0, n0, x1, n1, H, B.main.pitch, Math.min(mx0 - x0, mn0 - n0, x1 - mx1, n1 - mn1), shing);
    const mw = B.mon.wall, yb = yM - 0.3;
    for (const s of sides(mx0, mn0, mx1, mn1)) { const f = frame(s, yb); f.add(box(s.len, mw, 0.25, 0, 0, -0.12, tan));
      const nb = Math.floor(s.len / 2.2); for (let k = 0; k < nb; k++) f.add(box(1.4, mw * 0.55, 0.05, (k + 0.5) * s.len / nb - s.len / 2, mw * 0.25, 0.02, glass)); }
    const yT = hip(mx0, mn0, mx1, mn1, yb + mw, B.mon.pitch, null, shing, 0.5);
    { const [bx0, bn0, bx1, bn1] = R(B.bump.r); g.add(box(bx1 - bx0, B.bump.h - yb + 0.2, bn1 - bn0, (bx0 + bx1) / 2, yb - 0.2, -(bn0 + bn1) / 2, tan)); hip(bx0, bn0, bx1, bn1, B.bump.h, B.mon.pitch, null, shing, 0.35); }
    { const c = en(B.rbox.c); g.add(box(1.8, 0.9, 1.8, c[0], B.rbox.y, -c[1], M('rbox', { color: '#d6c7a6', emissive: '#2c2619' }))); }
    // ---- entrance: glass storefront bay (both floors) under a front gable pediment with a gray louvered triangle + sign
    { const s = sides(x0, n0, x1, n1).find(q => q.nm === B.face), f = frame(s), ew = B.entry.w, pr = Math.tan(B.entry.pitch * Math.PI / 180);
      f.add(box(ew + 0.2, H - 0.7, 0.2, 0, 0.1, 0.32, M('mull', { color: '#d9dcdc' })));
      for (let k = 0; k < 4; k++) f.add(box(ew / 4 - 0.18, H / 2 - 1.0, 0.06, -ew / 2 + (k + 0.5) * ew / 4, 0.25, 0.44, glass), box(ew / 4 - 0.18, H / 2 - 1.4, 0.06, -ew / 2 + (k + 0.5) * ew / 4, H / 2 + 0.3, 0.44, glass));
      f.add(box(ew + 0.3, 0.35, 0.5, 0, H / 2 - 0.4, 0.4, cream));
      for (const sx of [-1, 1]) f.add(box(1.2, H, 0.9, sx * (ew / 2 + 0.6), 0, 0.3, tan));
      const W = ew + 2.4, r = W / 2 * pr, D = B.entry.d, y = H, P = (e, z, yy) => [e, yy, z], A = [];
      Q(A, P(-W / 2 - 0.3, 1.0, y), P(-W / 2 - 0.3, -D, y), P(0, -D, y + r), P(0, 1.0, y + r)); Q(A, P(W / 2 + 0.3, 1.0, y), P(W / 2 + 0.3, -D, y), P(0, -D, y + r), P(0, 1.0, y + r)); addTris(A, shing, f);
      f.add(box(W + 0.4, 0.6, 1.3, 0, H - 0.6, 0.35, cream));
      const tri = (w, h, m, z) => { const t = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)])), m); t.position.set(0, y, z); f.add(t); };
      tri(W, r, cream, 0.98); tri(W - 1.4, r - 0.55, louv, 1.0);
      { const lc = cvs(256, 128), lx = lc.getContext('2d'); lx.fillStyle = '#8a8d90'; lx.fillRect(0, 0, 256, 128); lx.fillStyle = '#5d6064'; for (let i = 6; i < 128; i += 9) lx.fillRect(0, i, 256, 3);
        const t = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-(W - 1.4) / 2, 0), new THREE.Vector2((W - 1.4) / 2, 0), new THREE.Vector2(0, r - 0.55)])), M('louvt', { map: texOf(lc), emissive: '#1d1f21' }));
        const uv = t.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (W - 1.4) + 0.5, uv.getY(i) / (r - 0.55)); t.position.set(0, y + 0.25, 1.01); f.add(t); }
      { const lc = cvs(512, 64), lx = lc.getContext('2d'); lx.fillStyle = '#efe9db'; lx.fillRect(0, 0, 512, 64); lx.fillStyle = '#4b4136'; lx.textAlign = 'center';
        lx.font = 'bold 40px "DejaVu Serif", Georgia, serif'; lx.fillText('TUNICA BUILDING', 256, 47);
        const sm = new THREE.Mesh(new THREE.PlaneGeometry(W - 1.0, 0.5), M('sign', { map: texOf(lc), emissive: '#3a3730' })); sm.position.set(0, H - 0.3, 1.01); f.add(sm); }
      // brick stoop + shrub beds along the front
      f.add(box(ew + 4.0, 0.18, B.entry.stoop, 0, 0, B.entry.stoop / 2 + 0.3, rbrick));
      for (const sx of [-1, 1]) { const bw = s.len / 2 - ew / 2 - 3.2, bc = sx * (ew / 2 + 2.2 + bw / 2);
        f.add(box(bw, 0.1, 1.5, bc, 0, 1.05, mulch));
        for (let u = -bw / 2 + 0.7; u < bw / 2 - 0.4; u += 1.3) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 7), shrub); sp.scale.set(1, 0.85, 0.9); sp.position.set(bc + u, 0.45, 1.05); f.add(sp); } } }
    { const pm = M('bollard', { color: '#2f63b8', emissive: '#0b1830' }); for (const q of (B.bollards || [])) { const c = en(q), p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.95, 10), pm); p.position.set(c[0], 0.47, -c[1]); g.add(p); } }
    if (B.front) { const F = B.front, sm = M('shrub-s', { color: '#4d6b3a', emissive: '#0d1409' }), om = M('shrub-o', { color: '#365a2c', emissive: '#0a1208' }), cm = M('conifer', { color: '#2f5030', emissive: '#08100a' });
      const sg = new THREE.SphereGeometry(0.32, 8, 6), inst = new THREE.InstancedMesh(sg, sm, F.rows.length), mt = new THREE.Matrix4();
      F.rows.forEach((q, i) => { const c = en(q); mt.makeScale(1, 0.75, 1); mt.setPosition(c[0], 0.24, -c[1]); inst.setMatrixAt(i, mt); }); g.add(inst);
      for (const o of F.ovals) { const c = en(o.c), m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), om); m.scale.set(o.rx, o.h / 2, o.ry); m.position.set(c[0], o.h / 2 - 0.05, -c[1]); g.add(m); }
      for (const o of F.conifers) { const c = en(o.c), m = new THREE.Mesh(new THREE.ConeGeometry(o.r, o.h, 12), cm); m.position.set(c[0], o.h / 2, -c[1]); g.add(m); } }
    return g;
  }
  // <<< B21 build
  // B23 build >>>
  // #23 Art Building (2026-10-13, from Brent's 4 obliques + 2 street views): long 1-story gray-green stucco block, white water-table
  // band + eave trim, white quoins; gray shingle hip roof with a long ridge, a lower cross-hip wing at the W end; a row of small
  // white-trimmed gable bays with round oculus vents along both long sides (window group under each); columned portico with a
  // front gable + brick pad; rooftop vents + round skylight dome; round shrubs; ART sign. Local frame rotated to the footprint.
  function buildB23() {
    const B = L.b23, g = new THREE.Group(); g.name = 'b23';
    const M = (k, o) => lam('b23-' + k, Object.assign({ side: THREE.DoubleSide }, o));
    const c0 = toEN(B.c[0], B.c[1]); g.position.set(c0[0], 0, -c0[1]); g.rotation.y = B.th * Math.PI / 180;
    const stuc = M('stucco', { color: '#7f8777', emissive: '#191c17' }), stucD = M('stuccod', { color: '#6c7465', emissive: '#141612' });
    const wht = M('white', { color: '#f4f3ee', emissive: '#3d3d3a' }), shing = M('shingle', { color: '#6a6d72', emissive: '#16181b' }), shingL = M('shingl', { color: '#7b7e83', emissive: '#191b1e' });
    const glass = M('glass', { color: '#3c4f5e', emissive: '#0e151c' }), dark = M('dark', { color: '#2e3236' }), brick = M('brick', { color: '#9a5442', emissive: '#1d100c' });
    const shrub = M('shrub', { color: '#3e6531', emissive: '#0c140a' }), mulch = M('mulch', { color: '#6e4a33' }), metal = M('metal', { color: '#b9bcbf', emissive: '#2a2b2c' });
    const LEN = B.len, WID = B.wid, H = B.h, PR = Math.tan(B.pitch * Math.PI / 180), WU = B.wing, WH = H - B.wingDrop;
    function addTris(arr, m, grp) { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); ge.computeVertexNormals(); (grp || g).add(new THREE.Mesh(ge, m)); }
    const Q = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    const P = (u, v, y) => [u - LEN / 2, y, -(v - WID / 2)];                 // u along the length from the W end, v across from the S (front) wall
    function hip(u0, v0, u1, v1, y, m, ov) {
      ov = ov == null ? 0.6 : ov; u0 -= ov; v0 -= ov; u1 += ov; v1 += ov;
      const w = u1 - u0, d = v1 - v0, i = Math.min(w, d) / 2, Y = y + i * PR;
      const b = [P(u0, v0, y), P(u1, v0, y), P(u1, v1, y), P(u0, v1, y)], t = [P(u0 + i, v0 + i, Y), P(u1 - i, v0 + i, Y), P(u1 - i, v1 - i, Y), P(u0 + i, v1 - i, Y)];
      const A = []; for (let k = 0; k < 4; k++) Q(A, b[k], b[(k + 1) % 4], t[(k + 1) % 4], t[k]); addTris(A, m);
      const e = box(w, 0.28, d, (u0 + u1) / 2 - LEN / 2, y - 0.28, -((v0 + v1) / 2 - WID / 2), wht); g.add(e); return Y;
    }
    // ---- walls (stucco boxes), white water table + eave band, quoins
    const wall = (u0, u1, h) => { g.add(box(u1 - u0, h, WID, (u0 + u1) / 2 - LEN / 2, 0, 0, stuc)); g.add(box(u1 - u0 + 0.08, 0.22, WID + 0.08, (u0 + u1) / 2 - LEN / 2, 1.0, 0, wht));
      g.add(box(u1 - u0 + 0.1, 0.4, WID + 0.1, (u0 + u1) / 2 - LEN / 2, h - 0.4, 0, wht)); g.add(box(u1 - u0 + 0.04, 0.5, WID + 0.04, (u0 + u1) / 2 - LEN / 2, 0, 0, stucD)); };
    wall(0, WU, WH); wall(WU, LEN, H);
    for (const [u, h] of [[0, WH], [LEN, H]]) for (const v of [0, WID]) for (let y = 0.55, k = 0; y < h - 0.7; y += 0.42, k++) {
      const a = k % 2 ? 0.75 : 0.45, b = k % 2 ? 0.45 : 0.75, p = P(u, v, 0); g.add(box(a, 0.34, b, p[0], y, p[2], wht)); }
    // window group (3 lites, white frames) on a long side at u, side s (0 = front/S, 1 = back/N)
    function windows(u, s, n, y0, hh) { const v = s ? WID + 0.05 : -0.05, z = -(v - WID / 2), lw = 0.75;
      for (let k = 0; k < n; k++) { const x = u - LEN / 2 + (k - (n - 1) / 2) * (lw + 0.14);
        g.add(box(lw + 0.16, hh + 0.16, 0.06, x, y0 - 0.08, z, wht)); g.add(box(lw, hh, 0.1, x, y0, z + (s ? 0.01 : -0.01), glass)); } }
    // ---- roofs: main hip over the E part, lower cross hip over the W wing
    const yTop = hip(WU, 0, LEN, WID, H, shing); hip(0, -0.15, WU + 0.4, WID + 0.15, WH, shingL, 0.6);
    // ---- gable bays along both long sides
    const NB = B.bays, span = LEN - WU - 2.0, step = span / NB;
    for (const s of [0, 1]) for (let k = 0; k < NB; k++) { const u = WU + 1.0 + (k + 0.5) * step;
      const isPort = !s && u > B.port.u0 - 0.5 && u < B.port.u1 + 0.5; windows(u, s, 3, 1.5, 1.7); if (isPort) continue;
      const bw = Math.min(3.4, step - 0.5), r = bw / 2 * 0.62, f = new THREE.Group(); f.position.set(u - LEN / 2, H, s ? -(WID / 2 + 0.25) : WID / 2 + 0.25); f.rotation.y = s ? Math.PI : 0; g.add(f);
      const D = 2.6, A = []; Q(A, [-bw / 2 - 0.2, 0, 0.3], [-bw / 2 - 0.2, 0, -D], [0, r, -D], [0, r, 0.3]); Q(A, [bw / 2 + 0.2, 0, 0.3], [bw / 2 + 0.2, 0, -D], [0, r, -D], [0, r, 0.3]); addTris(A, shing, f);
      const tri = (w, h, m, z) => { const t = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)])), m); t.position.set(0, 0, z); f.add(t); };
      tri(bw + 0.3, r + 0.1, wht, 0.27); tri(bw - 0.4, r - 0.3, stuc, 0.29); f.add(box(bw + 0.4, 0.22, 0.3, 0, -0.05, 0.15, wht));
      const oc = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.3, 20), wht); oc.position.set(0, r * 0.42, 0.31); f.add(oc);
      const oi = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20), dark); oi.position.set(0, r * 0.42, 0.305); f.add(oi); }
    for (const s of [0, 1]) for (const u of [WU * 0.33, WU * 0.72]) windows(u, s, 2, 1.5, 1.6);
    // ---- portico: 4 white columns, front gable with white pediment, brick pad
    { const pu0 = B.port.u0, pu1 = B.port.u1, pd = B.port.d, pw = pu1 - pu0, f = new THREE.Group(); f.position.set((pu0 + pu1) / 2 - LEN / 2, 0, WID / 2); g.add(f);
      for (let k = 0; k < 4; k++) { const x = -pw / 2 + 0.5 + k * (pw - 1.0) / 3; f.add(cyl(0.24, 0.2, H - 0.2, x, 0.2, pd - 0.4, wht, 16)); f.add(box(0.6, 0.2, 0.6, x, 0.15, pd - 0.4, wht)); }
      f.add(box(pw, 0.55, pd + 0.3, 0, H - 0.55, pd / 2, wht));
      const r = pw / 2 * PR * 1.1, D = pd + 3.5, A = []; Q(A, [-pw / 2 - 0.3, H, pd + 0.2], [-pw / 2 - 0.3, H, -D + pd], [0, H + r, -D + pd], [0, H + r, pd + 0.2]); Q(A, [pw / 2 + 0.3, H, pd + 0.2], [pw / 2 + 0.3, H, -D + pd], [0, H + r, -D + pd], [0, H + r, pd + 0.2]); addTris(A, shing, f);
      const tri = (w, h, m, z) => { const t = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)])), m); t.position.set(0, H, z); f.add(t); };
      tri(pw + 0.4, r + 0.1, wht, pd + 0.18); tri(pw - 1.0, r - 0.5, stuc, pd + 0.2);
      f.add(box(1.8, 2.5, 0.08, 0, 0.2, 0.04, dark)); f.add(box(pw + 1.6, 0.16, pd + 1.6, 0, 0, pd / 2 + 0.6, brick)); }
    // ---- rooftop vents + round skylight dome on the ridge zone
    const yAt = (u, v) => H + Math.min(v, WID - v, u - WU, LEN - u) * PR;
    for (const [u, v] of B.vents) { const y = yAt(u, v); g.add(cyl(0.22, 0.22, 0.6, u - LEN / 2, y - 0.2, -(v - WID / 2), metal, 12)); }
    { const [u, v] = B.dome, y = yAt(u, v); g.add(cyl(0.75, 0.75, 0.5, u - LEN / 2, y - 0.3, -(v - WID / 2), wht, 24));
      const dm = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('dome', { color: '#e7eef2', emissive: '#383c3e' })); dm.scale.y = 0.55; dm.position.set(u - LEN / 2, y + 0.2, -(v - WID / 2)); g.add(dm); }
    // ---- round shrubs + mulch beds along the front, ART sign
    for (const [u0, u1] of [[1.5, B.port.u0 - 1.2], [B.port.u1 + 1.2, LEN - 1.5]]) { g.add(box(u1 - u0, 0.1, 1.6, (u0 + u1) / 2 - LEN / 2, 0, WID / 2 + 1.0, mulch));
      for (let u = u0 + 1.1; u < u1 - 0.6; u += 3.1) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 7), shrub); sp.scale.set(1, 0.85, 1); sp.position.set(u - LEN / 2, 0.6, WID / 2 + 1.0); g.add(sp); } }
    { const sg = new THREE.Group(), [u, v] = B.sign; sg.position.set(u - LEN / 2, 0, -(v - WID / 2)); g.add(sg);
      for (const sx of [-0.75, 0.75]) sg.add(box(0.1, 1.15, 0.1, sx, 0, 0, dark));
      const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#f2f1ec'; x.fillRect(0, 0, 256, 96);
      x.strokeStyle = '#2b3a55'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 84); x.fillStyle = '#1f2c44'; x.font = 'bold 58px "DejaVu Sans", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('ART', 128, 70);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; sg.add(box(1.5, 0.55, 0.08, 0, 0.6, 0, M('sign', { map: t, emissive: '#3a3a36' }))); }
    return g;
  }
  // <<< B23 build
  // B24 build >>>
  // #24A Auditorium + #24B Instructional Wing (Theater Arts Complex; 2026-10-13 from Brent's street view, 3 obliques + auditorium front).
  // 24A: salmon brick hall with an X (pyramid) hip over the front block + lower hip behind, flat W annex; E lobby: glass curtain wall
  // behind a full-width 6-column white portico under a front gable pediment with a round oculus, AUDITORIUM sign, bollards.
  // 24B: red brick 2-story cross wings with gray hip roofs + white band, flat link, low SE wing with a standing-seam hip roof and a
  // covered porch on posts. Frame: metres east/north of B.o (axis-aligned, like the footprint).
  function buildB24() {
    const B = L.b24, g = new THREE.Group(); g.name = 'b24';
    const M = (k, o) => lam('b24-' + k, Object.assign({ side: THREE.DoubleSide }, o));
    const o = toEN(B.o[0], B.o[1]); g.position.set(o[0], 0, -o[1]);
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const wht = M('white', { color: '#f4f2ec', emissive: '#3d3c38' }), shing = M('shingle', { color: '#6c6f74', emissive: '#16181b' }), shingL = M('shingl', { color: '#7d8085', emissive: '#191b1e' });
    const seam = M('seam', { color: '#8e9295', emissive: '#1e2022' }), glass = M('glass', { color: '#3d5466', emissive: '#0e161d' }), dark = M('dark', { color: '#2e3236' });
    const flat = M('flat', { color: '#9a9a96', emissive: '#1f1f1d' }), mull = M('mull', { color: '#d9dcdc', emissive: '#2c2d2d' }), boll = M('bollard', { color: '#2a2d31' });
    const PX = 14, FM = {};
    function facade(len, H, cols, floors, win) {           // brick + white band(s) + window rows
      const key = cols.join('') + Math.round(len * 4) + ':' + H + ':' + floors + ':' + win; if (FM[key]) return FM[key];
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 7 + Math.round(len * 13); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      x.fillStyle = cols[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { x.fillStyle = cols[1 + Math.floor(rnd() * (cols.length - 1))]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      const fh = H / floors;
      if (win) for (let f = 0; f < floors; f++) for (let u = 1.6; u < len - 1.4; u += win) {
        x.fillStyle = '#efece4'; x.fillRect(U(u - 0.1), Y(f * fh + fh - 0.9), 1.4 * PX, (fh - 1.9) * PX);
        x.fillStyle = '#34465a'; x.fillRect(U(u), Y(f * fh + fh - 1.0), 1.2 * PX, (fh - 2.1) * PX); x.fillStyle = '#efece4'; x.fillRect(U(u + 0.58), Y(f * fh + fh - 1.0), 2, (fh - 2.1) * PX); }
      x.fillStyle = '#efebe1'; x.fillRect(0, Y(0.55), c.width, 0.16 * PX); if (floors > 1) x.fillRect(0, Y(fh + 0.15), c.width, 0.3 * PX); x.fillRect(0, Y(H - 0.02), c.width, 0.5 * PX);
      return (FM[key] = M('fac' + key, { map: texOf(c), emissive: '#1d1611' }));
    }
    function walls(r, H, cols, floors, win, skip) {
      const [x0, y0, x1, y1] = r, S = [[[(x0 + x1) / 2, y0], x1 - x0, 0, 'S'], [[x1, (y0 + y1) / 2], y1 - y0, Math.PI / 2, 'E'], [[(x0 + x1) / 2, y1], x1 - x0, Math.PI, 'N'], [[x0, (y0 + y1) / 2], y1 - y0, -Math.PI / 2, 'W']];
      for (const [c, len, ry, nm] of S) { if (skip && skip.includes(nm)) continue; const w = new THREE.Mesh(new THREE.PlaneGeometry(len, H), facade(len, H, cols, floors, win)); w.position.set(c[0], H / 2, -c[1]); w.rotation.y = ry; g.add(w); }
      g.add(box(x1 - x0 - 0.02, H - 0.05, y1 - y0 - 0.02, (x0 + x1) / 2, 0, -(y0 + y1) / 2, dark));
    }
    function addTris(arr, m, grp) { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); ge.computeVertexNormals(); (grp || g).add(new THREE.Mesh(ge, m)); }
    const Q = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    function hip(r, y, pitch, m, ov) {
      ov = ov == null ? 0.6 : ov; const x0 = r[0] - ov, n0 = r[1] - ov, x1 = r[2] + ov, n1 = r[3] + ov;
      const w = x1 - x0, d = n1 - n0, i = Math.min(w, d) / 2, Y = y + i * Math.tan(pitch * Math.PI / 180), P = (e, n, yy) => [e, yy, -n];
      const b = [P(x0, n0, y), P(x1, n0, y), P(x1, n1, y), P(x0, n1, y)], t = [P(x0 + i, n0 + i, Y), P(x1 - i, n0 + i, Y), P(x1 - i, n1 - i, Y), P(x0 + i, n1 - i, Y)];
      const A = []; for (let k = 0; k < 4; k++) Q(A, b[k], b[(k + 1) % 4], t[(k + 1) % 4], t[k]); addTris(A, m);
      g.add(box(w, 0.28, d, (x0 + x1) / 2, y - 0.28, -(n0 + n1) / 2, wht)); return Y;
    }
    function flatTop(r, H, par) { g.add(box(r[2] - r[0], 0.12, r[3] - r[1], (r[0] + r[2]) / 2, H - 0.1, -(r[1] + r[3]) / 2, flat));
      for (const [w, d, x, y] of [[r[2] - r[0], 0.25, (r[0] + r[2]) / 2, r[1]], [r[2] - r[0], 0.25, (r[0] + r[2]) / 2, r[3]], [0.25, r[3] - r[1], r[0], (r[1] + r[3]) / 2], [0.25, r[3] - r[1], r[2], (r[1] + r[3]) / 2]]) g.add(box(w, par, d, x, H - 0.05, -y, wht)); }
    const SAL = ['#dd9c80', '#d6927a', '#e3a68a', '#cf8a70'], RED = ['#a85a43', '#9c513c', '#b2634b', '#8f4a37'];
    // ===== 24A Auditorium
    const A = B.a;
    walls(A.hall, A.h, SAL, 1, 0); hip(A.front, A.h, A.pitch, shing); hip(A.back, A.h - 0.6, A.pitch, shingL);
    walls(A.annex, A.ah, SAL, 1, 3.4); flatTop(A.annex, A.ah, 0.5);
    for (const [x, y] of A.sky) g.add(box(2.2, 0.5, 1.4, x, A.ah, -y, M('sky', { color: '#cfd6da', emissive: '#2c2f31' })));
    walls(A.conn, A.ch, SAL, 1, 0); flatTop(A.conn, A.ch, 0.35);
    { const [x0, y0, x1, y1] = A.lobby, H = A.lh, pw = y1 - y0, gx = A.glassX, pr = Math.tan(A.ppitch * Math.PI / 180), rise = (pw / 2 + 0.6) * pr;
      walls([x0, y0, gx, y1], H, SAL, 1, 0, ['E']);
      const gw = new THREE.Mesh(new THREE.PlaneGeometry(pw - 2.4, H - 0.6), glass); gw.position.set(gx + 0.05, (H - 0.6) / 2 + 0.1, -(y0 + y1) / 2); gw.rotation.y = Math.PI / 2; g.add(gw);
      for (let k = 0; k <= 6; k++) g.add(box(0.12, H - 0.6, 0.14, gx + 0.1, 0.1, -(y0 + 1.2 + k * (pw - 2.4) / 6), mull));
      for (const hh of [2.6, 5.2]) g.add(box(0.12, 0.12, pw - 2.4, gx + 0.1, hh, -(y0 + y1) / 2, mull));
      for (const sy of [y0 + 0.6, y1 - 0.6]) g.add(box(1.2, H, 1.2, gx - 0.4, 0, -sy, M('salmon', { color: '#dd9c80', emissive: '#2a1a13' })));
      g.add(box(x1 - gx + 0.4, 0.18, pw + 0.6, (gx + x1) / 2, 0, -(y0 + y1) / 2, M('pad', { color: '#d9d4c8' })));
      for (let k = 0; k < 6; k++) { const y = y0 + 0.7 + k * (pw - 1.4) / 5; g.add(cyl(0.34, 0.28, H - 0.3, x1 - 0.6, 0.2, -y, wht, 18)); g.add(box(0.8, 0.25, 0.8, x1 - 0.6, 0.15, -y, wht)); }
      g.add(box(x1 - gx + 0.6, 0.8, pw + 1.2, (gx + x1) / 2 + 0.1, H - 0.1, -(y0 + y1) / 2, wht));
      const T = [], P = (e, n, yy) => [e, yy, -n], yb = H + 0.7, xe = x1 + 0.4, xb = A.hall[2] - 1.0;
      Q(T, P(xe, y0 - 0.6, yb), P(xb, y0 - 0.6, yb), P(xb, (y0 + y1) / 2, yb + rise), P(xe, (y0 + y1) / 2, yb + rise));
      Q(T, P(xe, y1 + 0.6, yb), P(xb, y1 + 0.6, yb), P(xb, (y0 + y1) / 2, yb + rise), P(xe, (y0 + y1) / 2, yb + rise)); addTris(T, shing);
      const tri = (w, h, m, dx, dy) => { const t = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)])), m); t.rotation.y = Math.PI / 2; t.position.set(xe + dx, yb + dy, -(y0 + y1) / 2); g.add(t); };
      tri(pw + 1.2, rise, wht, 0.02, 0); tri(pw - 0.6, rise - 0.75, M('salmon', { color: '#dd9c80', emissive: '#2a1a13' }), 0.06, 0.32);
      const oc = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 24), wht); oc.rotation.y = Math.PI / 2; oc.position.set(xe + 0.08, yb + rise * 0.5, -(y0 + y1) / 2); g.add(oc);
      const oi = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), M('ocul', { color: '#d8d2c6', emissive: '#2e2b26' })); oi.rotation.y = Math.PI / 2; oi.position.set(xe + 0.07, yb + rise * 0.5, -(y0 + y1) / 2); g.add(oi); }
    { const [x, y] = A.sign, sg = new THREE.Group(); sg.position.set(x, 0, -y); sg.rotation.y = Math.PI / 2; g.add(sg);
      const c = cvs(512, 96), cx = c.getContext('2d'); cx.fillStyle = '#f2f1ec'; cx.fillRect(0, 0, 512, 96); cx.fillStyle = '#2a2f3a'; cx.font = 'bold 54px "DejaVu Sans", Arial, sans-serif'; cx.textAlign = 'center'; cx.fillText('AUDITORIUM', 256, 68);
      sg.add(box(2.6, 0.6, 0.12, 0, 0.35, 0, M('signA', { map: texOf(c), emissive: '#3a3a36' }))); sg.add(box(2.8, 0.35, 0.3, 0, 0, 0, dark)); }
    for (const [x, y] of A.bollards) g.add(cyl(0.11, 0.11, 0.95, x, 0, -y, boll, 10));
    // ===== 24B Instructional Wing
    const W = B.b;
    for (const r of W.wings) { walls(r, W.h, RED, 2, 3.0); }
    for (const r of W.wings) hip(r, W.h, W.pitch, shing);
    walls(W.link, W.lk, RED, 1, 0); flatTop(W.link, W.lk, 0.3);
    walls(W.se, W.sh, RED, 1, 3.2); hip([W.se[0], W.se[1] - 0.4, W.se[2], W.se[3]], W.sh, W.spitch, seam, W.porch);
    for (let y = W.se[1] - 0.2; y <= W.se[3] + 0.01; y += (W.se[3] - W.se[1]) / 6) g.add(box(0.28, W.sh, 0.28, W.se[2] + W.porch - 0.35, 0, -y, wht));
    g.add(box(W.porch, 0.15, W.se[3] - W.se[1] + 1.0, W.se[2] + W.porch / 2, 0, -(W.se[1] + W.se[3]) / 2, M('pad', { color: '#d9d4c8' })));
    return g;
  }
  // <<< B24 build
  // B27 build >>>
  // #27 McGhee Building (2026-10-13, from Brent's 3 Google 3D aerials + 2 street views + front photo): 2-story tan/orange brick,
  // tall beige stucco fascia band under a wide boxed eave, white downspouts, rows of small white-framed windows; light gray
  // standing-seam metal cross-hip roof (main hip + lower hip wings over the NE and SE bump-outs), brick chimney, small vents;
  // centred glass double door with a flat canopy on the NW wall facing the parking lot, walk to the lot, hedges, 2 crape myrtles; side: MCGHEE BUILDING letters, ramp with black rail,
  // stairs down to a basement door, AC units. Local frame: u/v metres along/across the OSM outline, rotated B.th deg.
  function buildB27() {
    const B = L.b27, g = new THREE.Group(); g.name = 'b27';
    const M = (k, o) => lam('b27-' + k, Object.assign({ side: THREE.DoubleSide }, o));
    const c0 = toEN(B.o[0], B.o[1]); g.position.set(c0[0], 0, -c0[1]); g.rotation.y = B.th * Math.PI / 180;
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const wht = M('white', { color: '#f4f2ec', emissive: '#3d3c38' }), seam = M('seam', { color: '#b9bcbd', emissive: '#2a2c2d' }), seamL = M('seaml', { color: '#c6c8c8', emissive: '#2d2e2e' });
    const fasc = M('fascia', { color: '#c9b393', emissive: '#2a241c' }), soff = M('soffit', { color: '#b8a382' }), dark = M('dark', { color: '#2e3236' });
    const glass = M('glass', { color: '#2f3d48', emissive: '#0c1116' }), blk = M('black', { color: '#202224' }), conc = M('conc', { color: '#c9c5bc', emissive: '#1f1e1b' });
    const brick = M('brickc', { color: '#a5583c', emissive: '#1d0f0a' }), shrub = M('shrub', { color: '#3c6330', emissive: '#0c140a' }), leaf = M('leaf', { color: '#5f8a3e', emissive: '#121a0c' });
    const bark = M('bark', { color: '#8a7a68' }), mulch = M('mulch', { color: '#6e4a33' }), acm = M('ac', { color: '#a9adb0', emissive: '#232527' });
    const H = B.h, FB = B.fb, PR = Math.tan(B.pitch * Math.PI / 180), PX = 14;
    const P = (u, v, y) => [u, y, -v];
    const put = (o, u, v, y, ry) => { o.position.set(u, y || 0, -v); if (ry != null) o.rotation.y = ry; g.add(o); return o; };
    const bx = (w, h, d, u, v, y, m, ry) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(u, (y || 0) + h / 2, -v); if (ry) o.rotation.y = ry; g.add(o); return o; };
    function facade(len, door) {
      const BH = H - FB, c = cvs(len * PX, BH * PX), x = c.getContext('2d'), Y = h => (BH - h) * PX, U = u => u * PX;
      let s = 11 + Math.round(len * 17); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const C = ['#cf9a68', '#c88f5c', '#d7a673', '#c08452', '#d29f6c'];
      x.fillStyle = '#d8c7aa'; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < BH; r++, hh += 0.25) for (let u = (r % 2) * 0.28; u < len; u += 0.56) { x.fillStyle = C[Math.floor(rnd() * C.length)]; x.fillRect(U(u), Y(hh + 0.25) + 1, 0.54 * PX, 0.25 * PX - 1); }
      const n = Math.max(1, Math.floor((len - 2) / 2.6)), st = (len - (n - 1) * 2.6) / 2;
      for (let f = 0; f < 2; f++) for (let k = 0; k < n; k++) { const u = st + k * 2.6; if (door && Math.abs(u - len / 2) < 1.9 && f === 0) continue;
        const y0 = f ? 3.9 : 0.9, wh = 1.45; x.fillStyle = '#f2f0ea'; x.fillRect(U(u - 0.5), Y(y0 + wh), 1.0 * PX, wh * PX);
        x.fillStyle = '#4a5866'; x.fillRect(U(u - 0.4), Y(y0 + wh - 0.1), 0.8 * PX, (wh - 0.2) * PX); x.fillStyle = '#f2f0ea'; x.fillRect(U(u - 0.4), Y(y0 + wh * 0.55), 0.8 * PX, 2);
        x.fillStyle = '#e9e3d6'; x.fillRect(U(u - 0.6), Y(y0 - 0.02), 1.2 * PX, 0.12 * PX); }
      return M('fac' + Math.round(len * 10) + (door ? 'd' : ''), { map: texOf(c), emissive: '#1d1611' });
    }
    // walls along the outline (CCW): brick below, fascia band above, white downspouts at corners
    const R = B.ring, N = R.length;
    for (let k = 0; k < N; k++) { const a = R[k], b = R[(k + 1) % N], du = b[0] - a[0], dv = b[1] - a[1], len = Math.hypot(du, dv); if (len < 0.3) continue;
      const nu = dv / len, nv = -du / len, ry = Math.atan2(nu, -nv), mu = (a[0] + b[0]) / 2, mv = (a[1] + b[1]) / 2, door = k === B.doorEdge;
      put(new THREE.Mesh(new THREE.PlaneGeometry(len, H - FB), facade(len, door)), mu, mv, (H - FB) / 2, ry);
      put(new THREE.Mesh(new THREE.PlaneGeometry(len + 0.02, FB), fasc), mu + nu * 0.02, mv + nv * 0.02, H - FB / 2, ry);
      if (len > 8) for (const t of [0.12, 0.88]) bx(0.14, H - FB, 0.14, a[0] + du * t + nu * 0.12, a[1] + dv * t + nv * 0.12, 0, wht); }
    { const sh = new THREE.Shape(R.map(p => new THREE.Vector2(p[0], p[1]))); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), dark); m.rotation.x = -Math.PI / 2; m.position.y = H - 0.05; g.add(m); }
    // roofs: main hip + lower hips over the bump-outs (overlapping -> cross-hip valleys)
    function addTris(arr, m) { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); ge.computeVertexNormals(); g.add(new THREE.Mesh(ge, m)); }
    const Q = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    function hip(r, y, m, ov, sk) {
      const u0 = r[0] - ov, v0 = r[1] - ov, u1 = r[2] + ov, v1 = r[3] + ov, w = u1 - u0, d = v1 - v0, i = Math.min(w, d) / 2, Y = y + i * PR;
      const bb = [P(u0, v0, y), P(u1, v0, y), P(u1, v1, y), P(u0, v1, y)], t = [P(u0 + i, v0 + i, Y), P(u1 - i, v0 + i, Y), P(u1 - i, v1 - i, Y), P(u0 + i, v1 - i, Y)];
      const A = []; for (let k = 0; k < 4; k++) Q(A, bb[k], bb[(k + 1) % 4], t[(k + 1) % 4], t[k]); addTris(A, m);
      // boxed eave: soffit slab + thin fascia edge
      if (!sk) bx(w, 0.3, d, (u0 + u1) / 2, (v0 + v1) / 2, y - 0.3, soff);
      return Y;
    }
    const TOP = hip(B.main, H, seam, B.ov);
    for (const r of B.wings) hip(r, H, seamL, B.ov);
    // chimney + vents (from aerials)
    bx(1.0, TOP - H + 0.6, 1.0, B.chim[0], B.chim[1], H, brick); bx(1.2, 0.15, 1.2, B.chim[0], B.chim[1], TOP + 0.6, conc);
    for (const [u, v] of B.vents) { const yy = H + Math.max(0.3, Math.min(u - B.main[0], B.main[2] - u, v - B.main[1], B.main[3] - v)) * PR; put(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 10), acm), u, v, yy + 0.1); }
    // front entry: glass double door + flat canopy + walk, hedges, crape myrtles
    { const [a, b] = [R[B.doorEdge], R[(B.doorEdge + 1) % N]], du = b[0] - a[0], dv = b[1] - a[1], len = Math.hypot(du, dv), eu = du / len, ev = dv / len, nu = ev, nv = -eu, ry = Math.atan2(nu, -nv);
      const mu = (a[0] + b[0]) / 2, mv = (a[1] + b[1]) / 2, at = (s, o, y) => [mu + eu * s + nu * o, mv + ev * s + nv * o];
      const dr = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), glass); put(dr, ...at(0, 0.05), 1.3, ry);
      for (const s of [-1.3, 0, 1.3]) bx(0.1, 2.6, 0.1, ...at(s, 0.07), 0, blk, ry);
      bx(3.4, 0.18, 1.5, ...at(0, 0.75), 2.95, wht, ry); bx(3.0, 0.12, 9.6, ...at(0, 4.8), 0, conc, ry);
      for (const sg of [-1, 1]) { bx(len / 2 - 3.2, 0.9, 1.0, ...at(sg * (len / 4 + 0.8), 0.8), 0, shrub, ry);
        for (const s0 of [2.6]) { const p = at(sg * s0, 0.9); put(new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.4, 10), shrub), p[0], p[1], 1.7); }
        const tp = at(sg * len * 0.3, 5.5); bx(2.2, 0.06, 2.2, tp[0], tp[1], 0, mulch);
        for (const o of [[-0.3, 0], [0.3, 0.1], [0, -0.3]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 3.6, 6), bark); t.position.set(tp[0] + o[0], 1.8, -(tp[1] + o[1])); t.rotation.z = o[0] * 0.4; g.add(t); }
        const cr = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), leaf); cr.scale.set(1, 0.75, 1); put(cr, tp[0], tp[1], 4.6); } }
    // side (NE wall, next to the front): MCGHEE BUILDING letters, ramp with black rail, stairs down to a basement door, AC units
    { const [a, b] = [R[B.sideEdge], R[(B.sideEdge + 1) % N]], du = b[0] - a[0], dv = b[1] - a[1], len = Math.hypot(du, dv), eu = du / len, ev = dv / len, nu = ev, nv = -eu, ry = Math.atan2(nu, -nv);
      const at = (s, o) => [a[0] + eu * s + nu * o, a[1] + ev * s + nv * o];
      const c = cvs(256, 128), cx = c.getContext('2d'); cx.fillStyle = '#e8e2d6'; cx.font = 'bold 40px "DejaVu Sans", Arial, sans-serif'; cx.textAlign = 'center'; cx.fillText('MCGHEE', 128, 52); cx.fillText('BUILDING', 128, 104);
      const t = texOf(c); put(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.0), lam('b27-sign', { map: t, transparent: true, side: THREE.DoubleSide })), ...at(len * 0.8, 0.04), 2.2, ry);
      bx(len * 0.55, 0.5, 1.6, ...at(len * 0.45, 1.0), 0, conc, ry);
      for (let s = len * 0.18; s <= len * 0.72; s += 1.2) bx(0.05, 1.0, 0.05, ...at(s, 1.75), 0.5, blk, ry);
      { const p = at(len * 0.45, 1.75); bx(len * 0.55, 0.06, 0.06, p[0], p[1], 1.5, blk, ry); }
      bx(1.5, 0.08, 3.2, ...at(len * 0.12, 1.2), -0.3, conc, ry); bx(1.0, 1.0, 0.06, ...at(len * 0.12, 0.04), -0.3, glass, ry);
      for (const o of [-0.8, 0.8]) for (const d of [1.0, 2.4]) bx(0.05, 0.9, 0.05, ...at(len * 0.12 + o, d), 0, blk, ry);
      for (const s of [len * 0.3, len * 0.36]) bx(1.0, 0.9, 1.0, ...at(s, 3.0), 0, acm, ry); }
    return g;
  }
  // <<< B27 build
  // B25 build >>>
  // #25A Physical Science + #25B Math & Science (Physical Science Complex; 2026-10-14 from Brent's 4 Google 3D aerials, M&S street view,
  // Physical Science entrance photo). 25B: tall 3-story red brick, big dark-gray shingle roof with wide eaves and clipped (steep hip) gable ends,
  // glass curtain-wall stair tower with white bands + MATH & SCIENCE sign over glass doors on the NE end (Northwest Dr), glass greenhouse at the
  // E corner, white retaining wall + white metal fence + stairs along Northwest Dr, small sloped metal awning. 25A: 2-story red brick, light
  // blue standing-seam gable roof with vents, W entrance bay with PHYSICAL SCIENCE sign, brown metal awning over the upper window, steps,
  // low brick planters, magnolia, wooden fence screen. Between them a lower flat white-roofed connector with a sloped dark metal canopy.
  // Each building has its own local frame: u/v metres, origin B.x.o, rotated B.x.th deg CCW from east.
  function buildB25() {
    const B = L.b25, root = new THREE.Group(); root.name = 'b25';
    const M = (k, o) => lam('b25-' + k, Object.assign({ side: THREE.DoubleSide }, o));
    const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w)); c.height = Math.max(4, Math.round(h)); return c; };
    const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const wht = M('white', { color: '#f4f2ec', emissive: '#3d3c38' }), dark = M('dark', { color: '#2e3236' }), glass = M('glass', { color: '#3d5466', emissive: '#0e161d' });
    const shing = M('shingle', { color: '#55595e', emissive: '#121416' }), blue = M('blue', { color: '#8fb4cf', emissive: '#1b2630' }), flat = M('flat', { color: '#e9e8e2', emissive: '#3a3a37' });
    const conc = M('conc', { color: '#dedbd3', emissive: '#2c2b28' }), brown = M('brown', { color: '#5a3d2b', emissive: '#140d08' }), wood = M('wood', { color: '#8a6a4a', emissive: '#1a120b' });
    const leafD = M('magn', { color: '#2f5226', emissive: '#0a1207' }), brickM = M('brick', { color: '#9e4f39', emissive: '#1d0e09' }), gls = M('gh', { color: '#bcd3dc', emissive: '#2a3337', transparent: true, opacity: 0.75 });
    const RED = ['#a85a43', '#9c513c', '#b2634b', '#8f4a37'], PX = 12, FM = {};
    function facade(len, H, floors, win) {
      const key = Math.round(len * 4) + ':' + H + ':' + floors + ':' + win; if (FM[key]) return FM[key];
      const c = cvs(len * PX, H * PX), x = c.getContext('2d'), Y = h => (H - h) * PX, U = u => u * PX;
      let s = 5 + Math.round(len * 11); const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      x.fillStyle = RED[0]; x.fillRect(0, 0, c.width, c.height);
      for (let r = 0, hh = 0; hh < H; r++, hh += 0.3) for (let u = (r % 2) * 0.3; u < len; u += 0.6) { x.fillStyle = RED[1 + Math.floor(rnd() * 3)]; x.fillRect(U(u), Y(hh + 0.3) + 1, 0.58 * PX, 0.3 * PX - 1); }
      const fh = H / floors;
      if (win) for (let f = 0; f < floors; f++) for (let u = 1.8; u < len - 1.6; u += win) {
        x.fillStyle = '#efece4'; x.fillRect(U(u - 0.1), Y(f * fh + fh - 0.8), 1.4 * PX, (fh - 1.9) * PX);
        x.fillStyle = '#34465a'; x.fillRect(U(u), Y(f * fh + fh - 0.9), 1.2 * PX, (fh - 2.1) * PX); }
      x.fillStyle = '#d9d2c4'; x.fillRect(0, Y(0.5), c.width, 0.5 * PX);
      return (FM[key] = M('fac' + key, { map: texOf(c), emissive: '#1d1611' }));
    }
    function frame(F) { const g = new THREE.Group(), c = toEN(F.o[0], F.o[1]); g.position.set(c[0], 0, -c[1]); g.rotation.y = F.th * Math.PI / 180; root.add(g); return g; }
    const add = (g, o) => { g.add(o); return o; };
    function walls(g, r, H, floors, win) {
      const [x0, y0, x1, y1] = r, S = [[[(x0 + x1) / 2, y0], x1 - x0, 0], [[x1, (y0 + y1) / 2], y1 - y0, Math.PI / 2], [[(x0 + x1) / 2, y1], x1 - x0, Math.PI], [[x0, (y0 + y1) / 2], y1 - y0, -Math.PI / 2]];
      for (const [c, len, ry] of S) { const w = new THREE.Mesh(new THREE.PlaneGeometry(len, H), facade(len, H, floors, win)); w.position.set(c[0], H / 2, -c[1]); w.rotation.y = ry; g.add(w); }
      g.add(box(x1 - x0 - 0.04, H - 0.05, y1 - y0 - 0.04, (x0 + x1) / 2, 0, -(y0 + y1) / 2, dark));
    }
    function tris(g, arr, m) { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); ge.computeVertexNormals(); g.add(new THREE.Mesh(ge, m)); }
    const Q = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d), P = (u, v, y) => [u, y, -v];
    // ridge along u; c = inset of the ridge ends (0 = gable with brick gable walls, small = clipped/steep hip ends)
    function roof(g, r, y, pitch, c, m, ov) {
      const x0 = r[0] - ov, x1 = r[2] + ov, n0 = r[1] - ov, n1 = r[3] + ov, nm = (n0 + n1) / 2, Y = y + (n1 - n0) / 2 * Math.tan(pitch * Math.PI / 180);
      const A = []; Q(A, P(x0, n0, y), P(x1, n0, y), P(x1 - c, nm, Y), P(x0 + c, nm, Y)); Q(A, P(x1, n1, y), P(x0, n1, y), P(x0 + c, nm, Y), P(x1 - c, nm, Y));
      if (c > 0) {                                                                                    // clipped (jerkinhead) gable ends: brick gable to 70% of the rise, small hip above
        A.length = 0; const k = 0.7, nk0 = n0 + k * (nm - n0), nk1 = n1 - k * (n1 - nm), yk = y + k * (Y - y);
        Q(A, P(x0, n0, y), P(x1, n0, y), P(x1, nk0, yk), P(x0, nk0, yk)); Q(A, P(x0, nk0, yk), P(x1, nk0, yk), P(x1 - c, nm, Y), P(x0 + c, nm, Y));
        Q(A, P(x1, n1, y), P(x0, n1, y), P(x0, nk1, yk), P(x1, nk1, yk)); Q(A, P(x1, nk1, yk), P(x0, nk1, yk), P(x0 + c, nm, Y), P(x1 - c, nm, Y));
        A.push(...P(x0, nk0, yk), ...P(x0 + c, nm, Y), ...P(x0, nk1, yk), ...P(x1, nk0, yk), ...P(x1, nk1, yk), ...P(x1 - c, nm, Y));
        const T = [], wk0 = r[1] + k * ((r[1] + r[3]) / 2 - r[1]) * 1, wk1 = r[3] - k * (r[3] - (r[1] + r[3]) / 2), ykk = y + k * ((r[3] - r[1]) / 2) * Math.tan(pitch * Math.PI / 180);
        for (const u of [r[0], r[2]]) Q(T, P(u, r[1], y), P(u, r[3], y), P(u, wk1, ykk), P(u, wk0, ykk));
        tris(g, T, brickM);
        for (const u of [r[0] - ov, r[2] + ov]) g.add(box(0.3, 0.3, nk1 - nk0, u, yk - 0.3, -nm, wht));
      }
      tris(g, A, m);
      if (c === 0) { const T = []; for (const u of [r[0], r[2]]) T.push(...P(u, r[1], y), ...P(u, r[3], y), ...P(u, (r[1] + r[3]) / 2, y + (r[3] - r[1]) / 2 * Math.tan(pitch * Math.PI / 180))); tris(g, T, brickM); }
      g.add(box(x1 - x0, 0.35, n1 - n0, (x0 + x1) / 2, y - 0.35, -nm, wht)); return Y;
    }
    function sign(g, txt, w, h, u, v, y, ry, bg, fg) {
      const c = cvs(640, 640 * h / w), x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); x.fillStyle = fg;
      x.font = 'bold ' + Math.round(c.height * 0.55) + 'px "DejaVu Sans", Arial, sans-serif'; x.textAlign = 'center'; x.fillText(txt, c.width / 2, c.height * 0.72);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M('sign' + txt, { map: texOf(c), emissive: '#3a3a36' })); s.position.set(u, y, -v); s.rotation.y = ry; g.add(s); }
    // ===== 25B Math & Science
    { const F = B.b, g = frame(F), r = F.r, H = F.h;
      walls(g, r, H, 3, 3.4); roof(g, r, H, F.pitch, F.clip, shing, 1.1);
      const [tu0, tv0, tv1, th] = F.tower, tm = (tv0 + tv1) / 2, tw = tv1 - tv0, te = r[2] + 1.6;          // glass stair tower on the NE end
      g.add(box(1.6, th, tw, r[2] + 0.8, 0, -tm, glass));
      for (const hh of [0.25, 3.3, 4.3, 7.5, 8.4, th - 0.6]) g.add(box(1.7, hh < 1 ? 0.5 : 0.75, tw + 0.1, r[2] + 0.8, hh < 1 ? 0 : hh, -tm, wht));
      for (let k = 0; k <= 4; k++) g.add(box(0.1, th, 0.1, te + 0.02, 0, -(tv0 + k * tw / 4), wht));
      g.add(box(1.9, 0.4, tw + 0.4, r[2] + 0.9, th, -tm, dark));
      sign(g, 'MATH & SCIENCE', 3.6, 0.5, te + 0.08, tm, 3.75, Math.PI / 2, '#2c2f33', '#f2f0ea');
      g.add(box(0.1, 2.4, 2.4, te + 0.06, 0.2, -tm, dark));
      const [gu0, gu1, gv0, gv1] = F.gh, gm = (gu0 + gu1) / 2;                                           // greenhouse at the E corner
      g.add(box(gu1 - gu0, 2.8, gv1 - gv0, gm, 0, -(gv0 + gv1) / 2, gls));
      for (let u = gu0; u <= gu1 + 0.01; u += (gu1 - gu0) / 5) g.add(box(0.08, 3.6, gv1 - gv0, u, 0, -(gv0 + gv1) / 2, wht));
      { const A = [], yb = 2.8, yt = 3.9, vm = (gv0 + gv1) / 2; Q(A, P(gu0, gv0, yb), P(gu1, gv0, yb), P(gu1, vm, yt), P(gu0, vm, yt)); Q(A, P(gu1, gv1, yb), P(gu0, gv1, yb), P(gu0, vm, yt), P(gu1, vm, yt)); tris(g, A, gls); }
      { const aw = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 1.6), dark); aw.position.set(F.awn, 3.4, -(r[1] - 0.7)); aw.rotation.x = 0.28; g.add(aw); }   // small sloped metal awning
      const [wu, wv0, wv1] = F.wall;                                                                    // white retaining wall + fence + stairs along Northwest Dr
      g.add(box(0.35, 1.2, wv1 - wv0, wu, 0, -(wv0 + wv1) / 2, conc));
      for (let v = wv0; v <= wv1 + 0.01; v += 1.8) g.add(box(0.06, 1.1, 0.06, wu, 1.2, -v, wht));
      for (const hh of [1.3, 2.2]) g.add(box(0.05, 0.05, wv1 - wv0, wu, hh, -(wv0 + wv1) / 2, wht));
      g.add(box(wu - r[2], 1.2, tw + 1, (wu + r[2]) / 2, 0, -tm, conc));                                  // landing in front of the tower
      for (let k = 0; k < 5; k++) g.add(box(0.35, 1.2 - k * 0.24, 2.0, wu + 0.35 + k * 0.35, 0, -(tv1 + 1.4), conc));
    }
    // ===== 25A Physical Science (u north, v west)
    { const F = B.a, g = frame(F), r = F.r, H = F.h;
      walls(g, r, H, 2, 3.2); const top = roof(g, r, H, F.pitch, 0, blue, 0.7);
      for (const [u, v] of F.vents) g.add(box(0.8, 0.6, 0.8, u, H + 1.2, -v, M('vent', { color: '#c9ccce', emissive: '#2a2b2c' })));
      const [bu0, bu1, bd] = F.bay, bm = (bu0 + bu1) / 2, ve = r[3] + bd;                                  // W entrance bay
      g.add(box(bu1 - bu0, H + 0.6, bd, bm, 0, -(r[3] + bd / 2), M('baybr', { color: '#a35540', emissive: '#1d0e09' })));
      { const A = [], yb = H + 0.6, yt = yb + 1.6; A.push(...P(bu0, ve, yb), ...P(bu1, ve, yb), ...P(bm, ve, yt)); tris(g, A, brickM);
        const R = []; Q(R, P(bu0 - 0.3, ve + 0.3, yb), P(bm, ve + 0.3, yt), P(bm, r[3], yt), P(bu0 - 0.3, r[3], yb)); Q(R, P(bu1 + 0.3, ve + 0.3, yb), P(bm, ve + 0.3, yt), P(bm, r[3], yt), P(bu1 + 0.3, r[3], yb)); tris(g, R, blue); }
      { const aw = new THREE.Mesh(new THREE.BoxGeometry(bu1 - bu0 + 0.6, 0.1, 1.4), brown); aw.position.set(bm, 6.3, -(ve + 0.6)); aw.rotation.x = -0.25; g.add(aw); }
      for (const [du, hh] of [[-1.0, 4.4], [1.0, 4.4]]) g.add(box(1.1, 1.4, 0.06, bm + du, hh, -(ve + 0.04), glass));
      sign(g, 'PHYSICAL SCIENCE', 3.4, 0.4, bm, ve + 0.06, 3.1, -Math.PI / 2, '#a35540', '#f4efe2');
      g.add(box(1.8, 2.3, 0.08, bm, 0.4, -(ve + 0.05), glass));
      for (let k = 0; k < 3; k++) g.add(box(3.0, 0.4 - k * 0.13, 0.5, bm, 0, -(ve + 0.3 + k * 0.5), conc));
      for (const [u0, u1] of F.planters) g.add(box(u1 - u0, 0.6, 1.2, (u0 + u1) / 2, 0, -(ve + 1.3), brickM));
      { const [u, v] = F.magnolia; g.add(cyl(0.15, 0.15, 1.6, u, 0, -v, wood, 8)); const c = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6.8, 9), leafD); c.position.set(u, 1.2 + 3.4, -v); g.add(c); }
      { const [u0, u1, v] = F.fence; g.add(box(u1 - u0, 1.9, 0.12, (u0 + u1) / 2, 0, -v, wood)); }
    }
    // ===== connector (EN frame of 25A's origin, unrotated)
    { const F = B.c, g = frame(F), [x0, y0, x1, y1] = F.r, H = F.h;
      g.add(box(x1 - x0, H, y1 - y0, (x0 + x1) / 2, 0, -(y0 + y1) / 2, M('connbr', { color: '#a85a43', emissive: '#1d0e09' })));
      g.add(box(x1 - x0 + 0.4, 0.3, y1 - y0 + 0.4, (x0 + x1) / 2, H, -(y0 + y1) / 2, flat));
      const cn = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.1, 2.6), dark); cn.position.set((x0 + x1) / 2, 3.2, -(y0 - 1.1)); cn.rotation.x = -0.3; g.add(cn);
    }
    return root;
  }
  // <<< B25 build
  root.add(buildSign()); root.add(buildPlaza()); if (L.nwdr) root.add(buildNwdr()); if (L.mainEntrance && L.mainEntrance.size) root.add(buildMainEntrance()); if (L.baseball) root.add(buildBaseball()); if (L.football) root.add(buildFootball()); if (L.softball) root.add(buildSoftball()); if (L.practice) root.add(buildPractice()); if (L.lamar) root.add(buildLamar()); if (L.rab31) root.add(buildRab31()); if (L.benton) root.add(buildBenton()); if (L.heindl) root.add(buildHeindl()); if (L.lafayette) root.add(buildLafayette()); if (L.yalobusha) root.add(buildYalobusha()); if (L.mccormick) root.add(buildMcCormick()); if (L.tate) root.add(buildTate()); if (L.lib53) root.add(buildLib53()); if (L.conn56) root.add(buildConn56()); if (L.w58) root.add(buildW58()); if (L.n22) root.add(buildN22()); if (L.b21) root.add(buildB21()); if (L.b23) root.add(buildB23()); if (L.b24) root.add(buildB24()); if (L.b27) root.add(buildB27()); if (L.b25) root.add(buildB25());
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
/* HEINDL-50 data >>> */
// #50 Heindl Center traced on Brent's 4 obliques + 2 street photos and Esri imagery (2026-10-11). Coordinates [lng,lat]; heights in m.
window.NWCC_LANDMARKS.heindl = {"parts":{"ft":{"sw":[-89.9745042,34.6272222],"ne":[-89.9742029,34.6273442],"h":24.0},"au":{"sw":[-89.9745413,34.6269328],"ne":[-89.9741658,34.6272222],"h":15.5},"fl":{"sw":[-89.9745413,34.6268695],"ne":[-89.9741658,34.6269328],"h":12.0},"nb":{"sw":[-89.9745894,34.6273171],"ne":[-89.9739879,34.627696],"h":13.0},"ew":{"sw":[-89.9741658,34.6268704],"ne":[-89.9740435,34.6273171],"h":7.0},"wwm":{"sw":[-89.9746505,34.6269536],"ne":[-89.9745413,34.6272231],"h":7.0},"wws":{"sw":[-89.9746822,34.6268649],"ne":[-89.9745413,34.6269536],"h":7.0},"wwn":{"sw":[-89.9746854,34.6272231],"ne":[-89.9745413,34.6273171],"h":7.0}},"po":{"sw":[-89.9744344,34.6267926],"ne":[-89.9742717,34.6268695]},"ep":{"sw":[-89.9739879,34.627394],"ne":[-89.9739355,34.6275025]},"well":{"sw":[-89.9742684,34.6275523],"ne":[-89.9741516,34.6276789]},"yard":[[-89.9746505,34.6270594],[-89.9747149,34.6270594],[-89.9747149,34.6269554],[-89.9746505,34.6269554]],"equip":[{"c":[-89.9746942,34.6271534],"w":2.4,"d":3.2,"h":1.9},{"c":[-89.9746942,34.6271173],"w":1.8,"d":2.0,"h":1.5}],"bollards":[[-89.9744256,34.626694],[-89.9744038,34.626694],[-89.974382,34.626694],[-89.9743601,34.626694],[-89.9743383,34.626694],[-89.9743165,34.626694],[-89.9742946,34.626694],[-89.9742728,34.626694],[-89.9744256,34.6266144],[-89.9744038,34.6266144],[-89.974382,34.6266144],[-89.9743601,34.6266144],[-89.9743383,34.6266144],[-89.9743165,34.6266144],[-89.9742946,34.6266144],[-89.9742728,34.6266144]],"lamps":[[-89.9744606,34.6267338],[-89.9742466,34.6267338],[-89.9744606,34.6265801],[-89.9742466,34.6265801]],"sign":{"c":[-89.9738258,34.627299],"bearing":2.2,"len":4.4}};
/* <<< HEINDL-50 data */
/* LAFAYETTE-20 data >>> */
// #20 Lafayette Humanities Building (2026-10-12). Coordinates [lng,lat]; heights in m.
window.NWCC_LANDMARKS.lafayette = {"main":[[-89.9691049,34.6262255],[-89.9687927,34.6264987]],"nbay":[[-89.9690165,34.6264987],[-89.9689313,34.6265629]],"sbay":[[-89.9690045,34.6261604],[-89.9689215,34.6262255]],"eave":12.4,"fascia":1.2,"pitch":18.0,"yard":[[-89.9687927,34.6263702],[-89.968713,34.6263702],[-89.968713,34.6262436],[-89.9687927,34.6262436],[-89.9687927,34.6263702]],"units":[[-89.9687523,34.6263341],[-89.9687523,34.6262798]]};
/* <<< LAFAYETTE-20 data */
/* YALOBUSHA-51 data >>> */
// #51 Yalobusha Hall + #58 Strategic Communications (2026-10-12). Coordinates [lng,lat]; local frame metres.
window.NWCC_LANDMARKS.yalobusha = {"hall":{"o":[-89.9695099,34.6261559],"u":[-89.9691661,34.6262798],"v":[-89.9696278,34.6263784]},"eave":7.4,"pitch":18.0,"entry_x":-7.0,"vents":[-7.0,-0.5,6.0],"screens":[[-5.6,0.6],[-16.4,-9.6]],"yard_u":[10.5,15.8],"sc":{"o":[-89.9697534,34.6260356],"u":[-89.9696169,34.6261966],"v":[-89.9698677,34.6261021]},"sc_eave":4.2,"sc_pitch":28.0,"sc_notch_u":7.4,"sc_notch_v":9.8};
/* <<< YALOBUSHA-51 data */
/* MCCORMICK-52 data >>> */
// #52 J. P. McCormick Administration Building (2026-10-12). Coordinates [lng,lat]; heights in m.
window.NWCC_LANDMARKS.mccormick = {"east":[[-89.9696595,34.6253998],[-89.9695263,34.6256703]],"mid":[[-89.969785,34.6254695],[-89.9696595,34.6256051]],"wa":[[-89.9700317,34.6254541],[-89.9698483,34.6256377]],"wb":[[-89.9698483,34.625455],[-89.9697839,34.6256042]],"wc":[[-89.9700852,34.6255147],[-89.9700317,34.6256033]],"h_old":10.0,"parapet":0.9,"h_new":7.4,"pitch":24.0,"porch_w":11.0,"landing_d":1.6,"porch_h":2.3,"risers":8,"old_ring":[[-89.9696595,34.6256703],[-89.9695263,34.6256703],[-89.9695263,34.6253998],[-89.9696595,34.6253998],[-89.9696595,34.6254695],[-89.969785,34.6254695],[-89.969785,34.6256051],[-89.9696595,34.6256051],[-89.9696595,34.6256703]],"hips":[[[-89.9700317,34.6254541],[-89.9698483,34.6256377]],[[-89.9700852,34.6255147],[-89.9697839,34.6256033]],[[-89.9699062,34.625455],[-89.9697839,34.6255165]]]};
/* <<< MCCORMICK-52 data */
/* TATE-56 data >>> */
// #56 Tate Hall (2026-10-12). Coordinates [lng,lat]; lengths/heights in m.
window.NWCC_LANDMARKS.tate = {"parts":[{"k":"s","c":[-89.9694477,34.6249024],"a":0,"L":40.0,"W":13.0,"h":8.0,"pitch":30.0},{"k":"n","c":[-89.9695569,34.6250878],"a":90,"L":30.0,"W":20.0,"h":8.0,"pitch":30.0},{"k":"ne","c":[-89.9693986,34.6250245],"a":45,"L":23.0,"W":16.0,"h":8.0,"pitch":30.0}],"portico":{"c":[-89.9693986,34.6250245],"a":45,"L":23.0,"depth":3.4,"pw":11.0,"h":8.0,"ph":2.6},"porch":{"c":[-89.9693385,34.6249024],"a":-90,"L":13.0,"depth":2.4,"pw":6.0,"h":4.4,"ph":1.4},"cupola":[-89.9695001,34.6249658],"cupola_y":11.85,"cupola_a":0,"walls":[{"pts":[[-89.9692376,34.6248262],[-89.9692284,34.6248294],[-89.9692196,34.6248333],[-89.9692113,34.6248379],[-89.9692036,34.6248431],[-89.9691966,34.6248489],[-89.9691902,34.6248553],[-89.9691846,34.6248621],[-89.9691798,34.6248693],[-89.9691759,34.6248769],[-89.9691729,34.6248847],[-89.9691708,34.6248928],[-89.9691696,34.624901],[-89.9691694,34.6249092],[-89.9691701,34.6249174],[-89.9691718,34.6249256],[-89.9691744,34.6249335],[-89.9691779,34.6249412],[-89.9691823,34.6249486],[-89.9691876,34.6249556],[-89.9691936,34.6249622],[-89.9692003,34.6249682],[-89.9692078,34.6249737],[-89.9692158,34.6249786],[-89.9692243,34.6249828]],"h":0.5},{"pts":[[-89.969306,34.6247973],[-89.9692903,34.6247948],[-89.9692742,34.6247939],[-89.9692582,34.6247946],[-89.9692423,34.6247968],[-89.9692269,34.6248006],[-89.9692121,34.6248058],[-89.9691982,34.6248124],[-89.9691853,34.6248204],[-89.9691736,34.6248295],[-89.9691633,34.6248397],[-89.9691546,34.6248509],[-89.9691474,34.6248628],[-89.969142,34.6248753],[-89.9691385,34.6248883],[-89.9691367,34.6249015],[-89.9691369,34.6249149],[-89.969139,34.6249281],[-89.9691429,34.624941],[-89.9691486,34.6249534],[-89.9691561,34.6249652],[-89.9691651,34.6249762],[-89.9691757,34.6249862],[-89.9691876,34.6249951],[-89.9692007,34.6250028]],"h":1.2,"rail":1},{"pts":[[-89.9694013,34.6248683],[-89.9693981,34.6248617],[-89.9693943,34.6248552],[-89.9693902,34.624849],[-89.9693855,34.6248429],[-89.9693804,34.6248372],[-89.9693748,34.6248317],[-89.9693689,34.6248265],[-89.9693626,34.6248217]],"h":1.2,"rail":1},{"pts":[[-89.9693111,34.6247806],[-89.9692929,34.6247778],[-89.9692744,34.6247767],[-89.9692559,34.6247775],[-89.9692377,34.6247801],[-89.9692199,34.6247844],[-89.9692029,34.6247904],[-89.9691868,34.6247981],[-89.969172,34.6248072],[-89.9691585,34.6248177],[-89.9691467,34.6248295],[-89.9691366,34.6248423],[-89.9691283,34.6248561],[-89.9691221,34.6248705],[-89.969118,34.6248855],[-89.969116,34.6249007],[-89.9691162,34.6249161],[-89.9691186,34.6249313],[-89.9691231,34.6249461],[-89.9691297,34.6249605],[-89.9691383,34.624974],[-89.9691487,34.6249867],[-89.9691609,34.6249982],[-89.9691746,34.6250085],[-89.9691897,34.6250174]],"h":0.18,"conc":1},{"pts":[[-89.9694208,34.6248624],[-89.9694171,34.6248548],[-89.9694128,34.6248473],[-89.969408,34.6248401],[-89.9694026,34.6248332],[-89.9693967,34.6248266],[-89.9693903,34.6248202],[-89.9693835,34.6248143],[-89.9693762,34.6248087]],"h":0.18,"conc":1}],"sign":{"c":[-89.9692633,34.6251366],"a":45},"lamps":[[-89.9692496,34.6251045],[-89.9693021,34.625148],[-89.969221,34.6251077],[-89.9692982,34.6251716]]};
/* <<< TATE-56 data */
/* LIB-53 data >>> */
// #53 R.C. Pugh Library (2026-10-12). Coordinates [lng,lat]; lengths/heights in m.
window.NWCC_LANDMARKS.lib53 = {"parts":[{"k":"s","ring":[[-89.9697561,34.6247202],[-89.969756,34.624763],[-89.969721,34.624761],[-89.969721,34.624968],[-89.969758,34.62497],[-89.969752,34.6250443],[-89.9699471,34.6250474],[-89.969947,34.625047],[-89.969958,34.6250476],[-89.9700252,34.6250486],[-89.970051,34.624737],[-89.9697561,34.6247202]],"h":7.2,"rust":1,"rtu":2,"skip":{"10":[10.00006842373122,19.40006842373122]}},{"k":"n","ring":[[-89.970045,34.625309],[-89.9699471,34.6250474],[-89.969752,34.6250443],[-89.969746,34.625119],[-89.969837,34.625362],[-89.970045,34.625309]],"h":6.4,"rtu":2}],"pav":{"c":[-89.9698909,34.6247278],"a":-3.9213988876780914,"w":8.6,"d":3.0,"h":7.6},"yard":[[-89.9700328,34.6250553],[-89.9699542,34.6250517],[-89.9699728,34.6251114],[-89.9700437,34.6251068],[-89.9700328,34.6250553]],"yard_open":3,"units":[[-89.9700154,34.6250698],[-89.9699957,34.6250698],[-89.9700132,34.6250906],[-89.9699913,34.6250906]],"lamps":[[-89.969952,34.6247116],[-89.9698298,34.6247116],[-89.9699302,34.624623],[-89.9698516,34.624623],[-89.9701464,34.6247116],[-89.9696333,34.6247116]],"bollards":[[-89.9699127,34.6246149],[-89.9698986,34.6246155],[-89.9698833,34.6246161],[-89.9698691,34.6246167],[-89.9701835,34.6246899],[-89.9695787,34.6246899],[-89.9699979,34.6247044],[-89.9697839,34.6247044]],"oll":[-89.9698909,34.6246718],"plaza_w":8.799999999999999,"plaza_d":3.2,"plaza_h":0.6,"risers":3,"step_w":5.0,"steps_pl":[[3.0,-0.6,1.0,0.75,1.6],[4.8,0.4,1.6,0.6,1.4],[6.6,1.2,1.6,0.45,1.2]],"urn":[3.3,0.9,1.15],"o":[0,0]};
/* <<< LIB-53 data */
/* CONN-56 data >>> */
// Tate Hall (#56) west connector (2026-10-12).
window.NWCC_LANDMARKS.conn56 = {"h":4.2,"pitch":26.0,"parts":[{"k":"n","r":[[-89.9697206,34.6248391],[-89.969666,34.6249703]]},{"k":"s","r":[[-89.9697206,34.6247758],[-89.9696114,34.6248437]],"s":[6.6,8.6],"e":[2.2,5.2],"w":[]}],"vents":[[-89.9696933,34.624907],[-89.9696606,34.6248075]],"porch":{"c":[-89.9696846,34.6247758],"w":3.6,"d":2.0,"deck":0.75,"risers":3},"ramp":[[-89.9696617,34.6247659],[-89.9695459,34.6247659]],"ramp_w":1.3,"planters":[[[-89.9697184,34.624746],[-89.9697064,34.6247749],0.7],[[-89.9696617,34.6247433],[-89.9696049,34.6247532],0.6]]};
/* <<< CONN-56 data */
/* W58 data >>> */
// #58 Strategic Communications site (2026-10-12). Coordinates [lng,lat]; heights in m.
window.NWCC_LANDMARKS.w58 = {"flags":[[-89.9698462,34.6259],[-89.9698298,34.6259036],[-89.9698134,34.6259072]],"flag_h":11.0,"lamps":[[-89.9697752,34.6258963],[-89.9693429,34.6259181]],"hydrant":[-89.9699324,34.6259253],"sign":[-89.9698931,34.6259036],"walls":[{"pts":[[-89.9696748,34.6260754],[-89.9695569,34.6261152],[-89.9695612,34.6261677],[-89.9696311,34.6261731],[-89.9696748,34.6260754]],"h":1.0,"t":0.3},{"pts":[[-89.9695569,34.6261152],[-89.9694641,34.6261369],[-89.9693713,34.6261568]],"h":0.9,"t":0.3}],"planters":[[[-89.969585,34.6261652],[-89.9695938,34.6261616],[-89.9696017,34.6261567],[-89.9696083,34.6261507],[-89.9696133,34.6261436],[-89.9696166,34.6261359],[-89.9696179,34.6261279],[-89.9696174,34.6261197],[-89.969615,34.6261118]],[[-89.969579,34.6261516],[-89.9695848,34.6261493],[-89.9695899,34.6261461],[-89.9695942,34.6261421],[-89.9695975,34.6261375],[-89.9695996,34.6261325],[-89.9696005,34.6261272],[-89.9696001,34.6261219],[-89.9695986,34.6261168]]],"bollards":[[-89.9692892,34.6259568],[-89.9692566,34.6259872],[-89.9692327,34.6260054],[-89.9692088,34.6260235],[-89.9691849,34.6260417],[-89.9691418,34.6260743],[-89.9690627,34.6261136],[-89.9689851,34.6261338]],"rsign":[-89.9693298,34.6258674],"rsign_rot":-45,"acc":[[-89.9692683,34.6259358],[-89.9692206,34.6259785],[-89.9691965,34.6259969]]};
/* <<< W58 data */
/* N22 data >>> */
// #22A/#22B Gary Lee Spears Center (2026-10-12). Coordinates [lng,lat]; lengths/heights in m.
window.NWCC_LANDMARKS.n22 = {"parts":[{"k":"hip","r":[[-89.9703134,34.624141],[-89.9698407,34.6244457]],"h":7.4,"roof":"hip","pitch":20,"inset":null,"ax":null,"rtu":0},{"k":"gable","r":[[-89.9703865,34.6241717],[-89.9703134,34.6243399]],"h":7.4,"roof":"gable","pitch":28,"inset":null,"ax":"x","rtu":0},{"k":"gable","r":[[-89.9698407,34.6241518],[-89.9697534,34.6243879]],"h":7.4,"roof":"gable","pitch":28,"inset":null,"ax":"y","rtu":0},{"k":"gable","r":[[-89.9701464,34.6244457],[-89.9700154,34.6244729]],"h":7.4,"roof":"gable","pitch":28,"inset":null,"ax":"y","rtu":0},{"k":"gable","r":[[-89.9702555,34.6241165],[-89.9701682,34.624141]],"h":7.4,"roof":"gable","pitch":28,"inset":null,"ax":"y","rtu":0},{"k":"gable","r":[[-89.9699935,34.6241165],[-89.9699062,34.624141]],"h":7.4,"roof":"gable","pitch":28,"inset":null,"ax":"y","rtu":0},{"k":"phip","r":[[-89.9697162,34.6242739],[-89.9689401,34.624491]],"h":7.4,"roof":"phip","pitch":30,"inset":5.0,"ax":null,"rtu":3},{"k":"lhip","r":[[-89.9695165,34.6241373],[-89.9691573,34.6242739]],"h":7.4,"roof":"lhip","pitch":14,"inset":5.0,"ax":null,"rtu":2},{"k":"hip","r":[[-89.9696278,34.6242296],[-89.9695165,34.6242739]],"h":7.4,"roof":"hip","pitch":28,"inset":null,"ax":null,"rtu":0},{"k":"hip","r":[[-89.9691584,34.6242287],[-89.9690165,34.6242739]],"h":7.4,"roof":"hip","pitch":28,"inset":null,"ax":null,"rtu":0},{"k":"gable","r":[[-89.9694695,34.624491],[-89.969404,34.6245127]],"h":7.4,"roof":"gable","pitch":30,"inset":null,"ax":"y","rtu":0},{"k":"gable","r":[[-89.9692185,34.624491],[-89.969142,34.6245127]],"h":7.4,"roof":"gable","pitch":30,"inset":null,"ax":"y","rtu":0},{"k":"gable","r":[[-89.9693604,34.624491],[-89.969273,34.6245054]],"h":7.4,"roof":"gable","pitch":30,"inset":null,"ax":"y","rtu":0},{"k":"hip","r":[[-89.9697545,34.6243291],[-89.9697162,34.6243879]],"h":4.0,"roof":"hip","pitch":26,"inset":null,"ax":null,"rtu":0}],"porches":[{"c":[-89.9693167,34.6245054],"a":180,"w":9.0,"d":2.8,"h":3.6,"piers":4},{"c":[-89.9700809,34.6244729],"a":180,"w":8.0,"d":2.6,"h":3.6,"piers":4},{"c":[-89.9690875,34.6242287],"a":0,"w":12.0,"d":2.8,"h":3.6,"piers":5},{"c":[-89.9703505,34.6241717],"a":0,"w":6.0,"d":2.4,"h":3.6,"piers":3}],"covers":[{"r":[[-89.9697545,34.6243879],[-89.9697162,34.6244412]],"h":3.4}],"rwalls":[{"p":[[-89.9703647,34.6244873],[-89.9702162,34.6244873]],"h":0.8},{"p":[[-89.9703647,34.6245072],[-89.9702293,34.6245072]],"h":0.45},{"p":[[-89.9698996,34.6244873],[-89.9698298,34.6244873]],"h":0.8},{"p":[[-89.9700896,34.6245154],[-89.970011,34.6245154],[-89.970011,34.6245217],[-89.9700896,34.6245217],[-89.9700896,34.6245154]],"h":0.5},{"p":[[-89.9697381,34.6241744],[-89.9697381,34.6242151],[-89.9696606,34.6242151]],"h":0.7},{"p":[[-89.9696114,34.6242151],[-89.9695307,34.6242151]],"h":0.7}],"stairs":[{"c":[-89.9700809,34.6244995],"a":0,"w":3.2,"n":2,"rise":0.35},{"c":[-89.9691682,34.6245217],"a":0,"w":2.4,"n":5,"rise":0.9},{"c":[-89.969636,34.624207],"a":180,"w":3.6,"n":3,"rise":0.5}],"signs":[{"c":[-89.9692512,34.6245235],"a":180,"w":6.0,"h":1.5,"ext":6.0}],"lamps":[[-89.9698887,34.6245235],[-89.9697686,34.6245235],[-89.97019,34.6245235],[-89.9693167,34.6245362],[-89.9695787,34.6242504],[-89.9696879,34.6240967],[-89.9690329,34.6241383]],"bollards":[[-89.9698669,34.6245271],[-89.9698472,34.6245271],[-89.9698276,34.6245271],[-89.9698079,34.6245271]]};
/* <<< N22 data */
/* MAIN-ENTRANCE data >>> */
// Campus main entrance (Alumni Dr at Wilson Dr, east of #50 Heindl). Option B.
window.NWCC_LANDMARKS.mainEntrance = {"lng": -89.97329, "lat": 34.62764, "bearing": 45, "size": 0, "label": [-89.973526, 34.627815], "labelOn": true, "minzoom": 14.5, "option": "B"};
/* <<< MAIN-ENTRANCE data */
/* B21 data >>> */
// #21 Tunica Building (2026-10-13). Coordinates [lng,lat]; lengths/heights in m.
window.NWCC_LANDMARKS.b21 = {"main":{"r":[[-89.9706916,34.6247202],[-89.9703292,34.625015]],"h":7.32,"pitch":20},"mon":{"r":[[-89.9706196,34.6247772],[-89.9704013,34.6249581]],"pitch":22,"wall":1.8},"bump":{"r":[[-89.9705503,34.6249581],[-89.9704629,34.6249866]],"h":10.93},"rbox":{"c":[-89.9704793,34.6248301],"y":13.45},"entry":{"w":6.0,"pitch":26,"d":4.0,"stoop":3.3},"face":"S","dormers":3,"bollards":[[-89.9709804,34.6246696],[-89.9709596,34.6246696],[-89.9709389,34.6246696],[-89.9709182,34.6246696],[-89.9708974,34.6246696],[-89.9708767,34.6246696],[-89.9708559,34.6246696],[-89.9708319,34.6246682],[-89.9708221,34.6246587],[-89.9708123,34.6246492],[-89.9708024,34.6246397],[-89.9707926,34.6246302],[-89.9706769,34.6246461],[-89.9706605,34.6246428],[-89.9706441,34.6246395],[-89.9706278,34.6246363]],"front":{"rows":[[-89.9705067,34.6245601],[-89.9704947,34.6245557],[-89.9704828,34.6245512],[-89.9704708,34.6245468],[-89.9704589,34.6245423],[-89.9704469,34.6245378],[-89.9705243,34.6245806],[-89.9705123,34.6245761],[-89.9705004,34.6245717],[-89.9704885,34.6245672],[-89.9704765,34.6245628],[-89.9704646,34.6245583],[-89.9704526,34.6245538],[-89.9704407,34.6245494],[-89.9704287,34.6245449],[-89.9705419,34.624601],[-89.97053,34.6245966],[-89.970518,34.6245921],[-89.9705061,34.6245877],[-89.9704941,34.6245832],[-89.9704822,34.6245788],[-89.9704702,34.6245743],[-89.9704583,34.6245698],[-89.9704463,34.6245654],[-89.9704344,34.6245609],[-89.9704225,34.6245565],[-89.9704105,34.624552],[-89.9705476,34.624617],[-89.9705356,34.6246126],[-89.9705237,34.6246081],[-89.9705117,34.6246037],[-89.9704998,34.6245992],[-89.9704879,34.6245948],[-89.9704759,34.6245903],[-89.970464,34.6245858],[-89.970452,34.6245814],[-89.9704401,34.6245769],[-89.9704281,34.6245725],[-89.9704162,34.624568],[-89.9704042,34.6245636],[-89.9703923,34.6245591],[-89.9705294,34.6246241],[-89.9705174,34.6246197],[-89.9705055,34.6246152],[-89.9704935,34.6246108],[-89.9704816,34.6246063],[-89.9704696,34.6246018],[-89.9704577,34.6245974],[-89.9704457,34.6245929],[-89.9704338,34.6245885],[-89.9704219,34.624584],[-89.9704099,34.6245796],[-89.970398,34.6245751],[-89.970386,34.6245707],[-89.9703741,34.6245662],[-89.9704873,34.6246223],[-89.9704753,34.6246178],[-89.9704634,34.6246134],[-89.9704514,34.6246089],[-89.9704395,34.6246045],[-89.9704275,34.6246],[-89.9704156,34.6245956],[-89.9704036,34.6245911],[-89.9703917,34.6245867],[-89.9703797,34.6245822],[-89.9703678,34.6245778],[-89.9704571,34.6246249],[-89.9704451,34.6246205],[-89.9704332,34.624616],[-89.9704213,34.6246116],[-89.9704093,34.6246071],[-89.9703974,34.6246027],[-89.9703854,34.6245982],[-89.9703735,34.6245938],[-89.9703615,34.6245893],[-89.9704269,34.6246276],[-89.970415,34.6246231],[-89.970403,34.6246187],[-89.9703911,34.6246142],[-89.9703791,34.6246098],[-89.9703672,34.6246053],[-89.9703553,34.6246009],[-89.9703968,34.6246302],[-89.9703848,34.6246258],[-89.9703729,34.6246213]],"ovals":[{"c":[-89.9704476,34.6246528],"rx":5.0,"ry":2.7,"h":1.9},{"c":[-89.9702905,34.6246411],"rx":1.5,"ry":1.2,"h":1.3},{"c":[-89.9702675,34.6246338],"rx":1.5,"ry":1.2,"h":1.3},{"c":[-89.9702446,34.6246275],"rx":1.5,"ry":1.2,"h":1.3},{"c":[-89.9702228,34.6246212],"rx":1.5,"ry":1.2,"h":1.3}],"conifers":[{"c":[-89.9705514,34.6246565],"r":1.6,"h":5.5}]}};
/* <<< B21 data */
/* B23 data >>> */
// #23 Art Building (2026-10-13). c=[lng,lat] of the main block centre, th=deg CCW from E of the long axis; u/v in m from the SW corner.
window.NWCC_LANDMARKS.b23 = {"c":[-89.971108,34.6248515],"th":19.39,"len":37.97,"wid":19.47,"h":4.9,"pitch":26,"wing":11.0,"wingDrop":0.5,"bays":7,"port":{"u0":15.51,"u1":23.43,"d":2.84},"vents":[[15.5,6.0],[21.0,14.0],[28.5,5.5],[33.0,13.0],[25.0,8.5]],"dome":[22.5,12.0],"sign":[33.5,-4.6]};
/* <<< B23 data */
/* B24 data >>> */
// #24A Auditorium + #24B Instructional Wing (2026-10-13). o=[lng,lat] origin; rects [x0,y0,x1,y1] in m east/north of o.
window.NWCC_LANDMARKS.b24 = {"o":[-89.9715,34.6245],"a":{"hall":[-13.4,-5.0,26.4,20.6],"front":[0.5,-5.0,26.4,20.6],"back":[-13.4,-4.4,0.5,20.0],"h":9.0,"pitch":24,"annex":[-24.3,-2.3,-13.4,8.4],"ah":5.2,"sky":[[-21.0,3.0],[-16.8,3.0]],"conn":[0.2,-9.9,6.1,-5.0],"ch":4.2,"lobby":[26.4,-0.7,35.8,16.5],"lh":8.2,"glassX":31.4,"ppitch":24,"sign":[38.6,4.5],"bollards":[[38.0,-1.0],[38.0,1.6],[38.0,7.9],[38.0,10.5],[38.0,13.1],[38.0,15.7]]},"b":{"wings":[[-24.6,-39.9,-10.8,-10.2],[-10.9,-47.2,6.7,-9.9]],"h":7.4,"pitch":24,"link":[6.6,-36.6,10.9,-33.1],"lk":3.6,"se":[10.9,-37.2,39.6,-17.5],"sh":4.3,"spitch":22,"porch":1.8}};
/* <<< B24 data */
/* B27 data >>> */
// #27 McGhee Building (2026-10-13). o=[lng,lat] origin (OSM vertex 0); th=frame rotation deg; ring/rects in m along u/v.
window.NWCC_LANDMARKS.b27 = {"o":[-89.970589,34.625488],"th":-39.033,"ring":[[0.0,0.0],[23.7,0.0],[23.6,-3.5],[28.74,-3.6],[28.94,15.21],[26.62,15.17],[26.74,26.95],[16.16,26.91],[16.2,30.5],[0.25,30.53]],"h":7.6,"fb":1.5,"pitch":16,"ov":0.9,"main":[0.0,0.0,26.7,26.9],"wings":[[0.0,20.0,16.1,30.5],[20.0,-3.7,28.9,15.2]],"doorEdge":9,"sideEdge":8,"chim":[9.0,15.5],"vents":[[6,8],[18,9],[11,21],[21,19],[24,4]]};
/* <<< B27 data */
/* B25 data >>> */
// #25A/#25B Physical Science Complex (2026-10-14). Per building: o=[lng,lat] origin, th=frame rotation deg, r=[u0,v0,u1,v1] m.
window.NWCC_LANDMARKS.b25 = {"b":{"o":[-89.971553,34.6263027],"th":56.485,"r":[0.0,-26.99,44.96,0.0],"h":11.0,"pitch":30,"clip":3.0,"tower":[44.96,-16.6,-10.4,12.6],"gh":[37.96,44.36,-31.185671971273088,-26.98567197127309],"awn":14.0,"wall":[49.160000000000004,-30.48567197127309,3.0]},"a":{"o":[-89.97158,34.626255],"th":90.0,"r":[0.0,0.0,30.74,25.28],"h":7.3,"pitch":18,"vents":[[6,6],[10,6.5],[20,7],[24,18],[12,19]],"bay":[12.4,18.4,1.4],"planters":[[8.0,11.6],[19.2,22.8]],"magnolia":[9.5,29.880000000000003],"fence":[2.0,6.5,26.880000000000003]},"c":{"o":[-89.9715,34.6245],"th":0.0,"r":[-7.53,202.0,9.67,220.0],"h":4.8}};
/* <<< B25 data */
