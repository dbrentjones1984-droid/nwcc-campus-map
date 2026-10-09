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
    root.add(projectedShadow(g, new THREE.Vector3(-0.55, 1.0, 0.75)));
    // light poles are added after the shadow pass (a 7 m pole would cast a long blob)
    for (const c of (N.lamps || [])) { const [x, y] = toEN(c[0], c[1]);   // twin-arm median light poles (arms over each carriageway, E-W)
      g.add(box(0.36, 0.5, 0.36, x, 0, -y, coping));
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 7.2, 8), metal); pole.position.set(x, 3.6, -y); g.add(pole);
      g.add(box(3.4, 0.08, 0.08, x, 7.1, -y, metal));
      for (const sx of [-1.7, 1.7]) { g.add(box(0.62, 0.12, 0.26, x + sx, 6.98, -y, metal)); g.add(box(0.5, 0.04, 0.2, x + sx, 6.94, -y, lampM)); } }
    return g;
  }
  // <<< NWDR-ENTRANCE build
  root.add(buildSign()); root.add(buildPlaza()); if (L.nwdr) root.add(buildNwdr());
  root.traverse(o => { o.frustumCulled = false; });
  return root;
};
/* NWDR-ENTRANCE data >>> */
// Northwest Dr entrance (by #50, off Wilson Dr): curved brick entrance walls + light posts, walk piers, median planter (2026-10-09).
// `white` = number of leading wall vertices with white coping; walls are densified Catmull-Rom curves traced on Brent's aerial.
window.NWCC_LANDMARKS.nwdr = {"walls":[{"pts":[[-89.9738885,34.6275966],[-89.9738823,34.627596],[-89.9738737,34.6275954],[-89.9738634,34.6275945],[-89.9738525,34.6275934],[-89.9738416,34.6275917],[-89.9738318,34.6275893],[-89.9738226,34.6275863],[-89.9738133,34.6275826],[-89.9738042,34.6275785],[-89.9737954,34.6275739],[-89.973787,34.6275691],[-89.9737794,34.627564],[-89.9737723,34.6275586],[-89.9737655,34.6275529],[-89.9737593,34.6275468],[-89.9737536,34.6275405],[-89.9737487,34.6275341],[-89.9737444,34.6275278],[-89.973741,34.6275217],[-89.9737384,34.6275155],[-89.9737364,34.6275094],[-89.973735,34.6275029],[-89.973734,34.6274962],[-89.9737335,34.6274889],[-89.9737334,34.6274808],[-89.9737337,34.6274717],[-89.9737345,34.6274623],[-89.9737358,34.6274531],[-89.9737376,34.6274446],[-89.9737401,34.6274374],[-89.9737432,34.6274316],[-89.9737472,34.6274267],[-89.9737517,34.6274226],[-89.9737565,34.627419],[-89.9737614,34.6274156],[-89.9737663,34.6274121],[-89.9737713,34.6274088],[-89.9737766,34.627406],[-89.9737821,34.6274034],[-89.9737875,34.6274008],[-89.9737924,34.6273977],[-89.9737968,34.627394],[-89.9738006,34.6273895],[-89.9738039,34.6273844],[-89.9738069,34.627379],[-89.9738096,34.6273734],[-89.973812,34.6273678],[-89.9738143,34.6273623],[-89.9738163,34.6273571],[-89.973818,34.6273518],[-89.9738195,34.6273465],[-89.9738208,34.6273412],[-89.9738219,34.627336],[-89.973823,34.6273307],[-89.9738241,34.6273254],[-89.973825,34.6273203],[-89.9738258,34.6273151],[-89.9738264,34.6273098],[-89.973827,34.6273045],[-89.9738274,34.627299],[-89.9738277,34.6272933],[-89.973828,34.6272874],[-89.9738281,34.6272815],[-89.973828,34.6272754],[-89.9738278,34.6272695],[-89.9738274,34.6272638],[-89.9738267,34.6272581],[-89.9738259,34.6272524],[-89.9738248,34.6272469],[-89.9738236,34.6272414],[-89.9738223,34.6272362],[-89.9738208,34.6272312],[-89.9738195,34.6272267],[-89.9738183,34.6272226],[-89.9738169,34.6272188],[-89.9738152,34.6272149],[-89.9738129,34.6272106],[-89.9738099,34.6272059],[-89.9738059,34.6272003],[-89.9738009,34.6271941],[-89.9737953,34.6271876],[-89.9737896,34.6271811],[-89.9737842,34.627175],[-89.9737794,34.6271697],[-89.973775,34.627165],[-89.9737706,34.6271606],[-89.9737665,34.6271566],[-89.9737629,34.6271531],[-89.9737598,34.6271502],[-89.9737575,34.627148]],"white":34},{"pts":[[-89.9732357,34.6275459],[-89.9732411,34.6275452],[-89.9732487,34.6275443],[-89.9732576,34.6275432],[-89.9732671,34.6275418],[-89.9732764,34.6275403],[-89.9732848,34.6275387],[-89.9732925,34.6275368],[-89.9733,34.6275346],[-89.9733074,34.6275322],[-89.9733146,34.6275297],[-89.9733216,34.6275274],[-89.9733285,34.6275251],[-89.9733352,34.6275232],[-89.9733418,34.6275216],[-89.9733482,34.6275201],[-89.9733544,34.6275184],[-89.9733606,34.6275162],[-89.9733667,34.6275134],[-89.973373,34.6275099],[-89.9733796,34.6275059],[-89.973386,34.6275014],[-89.9733921,34.6274967],[-89.9733974,34.6274916],[-89.9734017,34.6274862],[-89.9734047,34.6274805],[-89.9734067,34.6274743],[-89.9734079,34.6274678],[-89.9734088,34.6274612],[-89.9734095,34.6274546],[-89.9734104,34.6274483],[-89.9734117,34.627442],[-89.9734131,34.6274357],[-89.9734145,34.6274295],[-89.9734154,34.6274234],[-89.9734156,34.6274176],[-89.9734148,34.6274121],[-89.9734126,34.627407],[-89.9734093,34.6274022],[-89.9734052,34.6273977],[-89.9734008,34.6273934],[-89.9733966,34.6273892],[-89.9733929,34.6273849],[-89.9733897,34.6273809],[-89.9733865,34.6273771],[-89.9733834,34.6273734],[-89.9733805,34.6273697],[-89.9733778,34.6273657],[-89.9733755,34.6273614],[-89.9733734,34.6273567],[-89.9733716,34.6273516],[-89.97337,34.6273463],[-89.9733687,34.6273409],[-89.9733676,34.6273357],[-89.9733667,34.6273307],[-89.9733662,34.627326],[-89.973366,34.6273215],[-89.973366,34.6273172],[-89.9733662,34.6273128],[-89.9733664,34.6273083],[-89.9733667,34.6273036],[-89.9733671,34.6272985],[-89.9733675,34.6272931],[-89.973368,34.6272877],[-89.9733686,34.6272822],[-89.9733693,34.6272769],[-89.97337,34.6272719],[-89.9733706,34.6272672],[-89.9733712,34.6272628],[-89.9733718,34.6272586],[-89.9733727,34.6272543],[-89.9733738,34.6272501],[-89.9733755,34.6272457],[-89.9733777,34.6272411],[-89.9733805,34.6272364],[-89.9733837,34.6272317],[-89.973387,34.6272269],[-89.9733901,34.6272222],[-89.9733929,34.6272176],[-89.9733952,34.6272131],[-89.9733972,34.6272087],[-89.9733991,34.6272042],[-89.973401,34.6271999],[-89.9734033,34.6271956],[-89.973406,34.6271914],[-89.9734094,34.6271873],[-89.9734134,34.6271832],[-89.9734176,34.6271793],[-89.9734219,34.6271754],[-89.9734262,34.6271716],[-89.97343,34.6271679],[-89.9734338,34.6271641],[-89.9734376,34.6271603],[-89.9734414,34.6271565],[-89.9734448,34.627153],[-89.9734476,34.6271501],[-89.9734497,34.627148]],"white":40},{"pts":[[-89.9739125,34.6271263],[-89.9737663,34.6271236]],"white":0},{"pts":[[-89.9734431,34.6271254],[-89.9733143,34.6271254]],"white":0}],"posts":[[-89.9737946,34.6273958],[-89.9738241,34.6273343],[-89.9738274,34.6272638],[-89.9738077,34.627205],[-89.9738885,34.6275966],[-89.9739125,34.6271263],[-89.9733755,34.6273614],[-89.9733667,34.6273036],[-89.9733733,34.6272457],[-89.9734038,34.6271914],[-89.9732357,34.6275459],[-89.9733143,34.6271254]],"piers":[[-89.9737553,34.6271299],[-89.9734541,34.6271299]],"planters":[[[-89.9736222,34.62711],[-89.9735872,34.627186]],[[-89.9736222,34.6270549],[-89.9735872,34.6270738]],[[-89.9736855,34.6226958],[-89.973668,34.6228902]],[[-89.9737117,34.6226958],[-89.973692,34.6229038]],[[-89.9736855,34.6230666],[-89.973668,34.6231796]],[[-89.9737117,34.6230666],[-89.973692,34.6231796]]],"lamps":[[-89.9736287,34.6263947],[-89.9736246,34.6262816],[-89.9736156,34.6260067],[-89.9736145,34.6257878],[-89.9736135,34.6255871],[-89.9736035,34.6252669],[-89.9736028,34.6252054],[-89.9736001,34.6249612],[-89.9735971,34.6246899],[-89.973596,34.6244674]],"h":1.0,"t":0.4};
/* <<< NWDR-ENTRANCE data */
