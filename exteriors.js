/* NWCC Phase 3 · procedural exterior builder (classic script; call NWCCExteriors(THREE)).
 * Local frame: e = meters east, n = meters north of origin. Three.js coords: x = e, y = up, z = -n.
 * Every recipe comes from data.js (feature.properties.ext), produced by src/build_phase3.py. */
window.NWCCExteriors = function (THREE) {
  'use strict';
  // ---------- tiny utils ----------
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function hash(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; }
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const len = a => Math.hypot(a[0], a[1]), nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  function signedArea(p) { let A = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; A += a[0] * b[1] - b[0] * a[1]; } return A / 2; }
  function centroid(p) {
    let A = 0, cx = 0, cy = 0;
    for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length], c = a[0] * b[1] - b[0] * a[1]; A += c; cx += (a[0] + b[0]) * c; cy += (a[1] + b[1]) * c; }
    if (Math.abs(A) < 1e-9) return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
    return [cx / (3 * A), cy / (3 * A)];
  }
  function pip(pt, p) {
    let ins = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const a = p[i], b = p[j];
      if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins;
    }
    return ins;
  }
  function cleanRing(p) {
    const out = [];
    for (const q of p) { if (!out.length || len(sub(q, out[out.length - 1])) > 0.15) out.push(q); }
    if (out.length > 2 && len(sub(out[0], out[out.length - 1])) < 0.15) out.pop();
    if (signedArea(out) < 0) out.reverse();
    return out;
  }
  // outward normal of edge a->b for CCW ring
  const outN = (a, b) => { const d = nrm(sub(b, a)); return [d[1], -d[0]]; };
  function offsetRing(p, d) {
    const N = p.length, out = [];
    for (let i = 0; i < N; i++) {
      const a = p[(i - 1 + N) % N], b = p[i], c = p[(i + 1) % N];
      const n1 = outN(a, b), n2 = outN(b, c); let m = nrm(add(n1, n2));
      let k = dot(m, n1); if (k < 0.35) k = 0.35;
      out.push(add(b, mul(m, d / k)));
    }
    return out;
  }
  function hull(pts) {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function obb(pts) {
    const H = hull(pts); let best = null;
    for (let i = 0; i < H.length; i++) {
      const ux = nrm(sub(H[(i + 1) % H.length], H[i])), uy = [-ux[1], ux[0]];
      let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
      for (const q of H) { const s = dot(q, ux), t = dot(q, uy); a0 = Math.min(a0, s); a1 = Math.max(a1, s); b0 = Math.min(b0, t); b1 = Math.max(b1, t); }
      const area = (a1 - a0) * (b1 - b0);
      if (!best || area < best.area) best = { area, ux, uy, c: add(mul(ux, (a0 + a1) / 2), mul(uy, (b0 + b1) / 2)), hx: (a1 - a0) / 2, hy: (b1 - b0) / 2 };
    }
    if (best.hy > best.hx) { const t = best.hx; best.hx = best.hy; best.hy = t; best.ux = best.uy; best.uy = [-best.ux[1], best.ux[0]]; }
    return best;
  }
  const T3 = (p, y) => new THREE.Vector3(p[0], y, -p[1]);

  // ---------- facade textures ----------
  const FACADES = {
    brick_white:      { type: 'punched', bay: 3.2, wall: '#c2643f', win: [.2, .8, .26, .80], frame: '#f4f0e6', glass: ['#3a5a78', '#a6bfd4'], band: '#dcd4c4', bandH: .075, mull: 2, sill: '#efe9dc' },
    brick_admin:      { type: 'punched', bay: 3.0, wall: '#a8452f', win: [.3, .7, .16, .78], frame: '#f6f3ec', glass: ['#3a5a78', '#a6bfd4'], band: null, mull: 1, sill: '#ece6da', lintel: '#e9e3d6' },
    brick_red_ribbon: { type: 'ribbon', bay: 4.0, wall: '#a64a34', win: [0, 1, .36, .74], frame: '#3b3b3d', glass: ['#3a5a78', '#a6bfd4'], band: '#d2c9b6', bandH: .06, mull: 3 },
    brick_tan_ribbon: { type: 'ribbon', bay: 4.0, wall: '#c9a77b', win: [0, 1, .36, .74], frame: '#4a4036', glass: ['#3a5a78', '#a6bfd4'], band: '#e7dcc6', bandH: .06, mull: 3 },
    brick_red_modern: { type: 'punched', bay: 3.6, wall: '#9e4430', win: [.14, .86, .10, .88], frame: '#2c2c2e', glass: ['#1f364d', '#89a8c4'], band: '#cdbfa8', bandH: .05, mull: 3 },
    heindl_panel:     { type: 'panel', bay: 4.2, wall: '#d2b48e', win: [.42, .58, .22, .86], frame: '#3a3631', glass: ['#3a5a78', '#a6bfd4'], band: '#ddd2bf', bandH: .05, mull: 0 },
    dorm_red:         { type: 'paired', bay: 3.6, wall: '#a9503a', win: [.16, .44, .3, .76], frame: '#f1ede4', glass: ['#3a5a78', '#a6bfd4'], band: '#d8cfbd', bandH: .05 },
    dorm_tan:         { type: 'paired', bay: 3.6, wall: '#c4a27a', win: [.16, .44, .3, .76], frame: '#f4f0e7', glass: ['#3a5a78', '#a6bfd4'], band: '#e6dcc8', bandH: .05 },
    dorm_brown:       { type: 'paired', bay: 3.6, wall: '#8e4a36', win: [.16, .44, .3, .76], frame: '#efe9de', glass: ['#3a5a78', '#a6bfd4'], band: '#cbbfa9', bandH: .05 },
    precast_ribs:     { type: 'ribs', bay: 2.4, wall: '#d8d1c2', rib: '#bfb7a6', clere: [.80, .92], glass: ['#3a5a78', '#a6bfd4'] },
    metal_band:       { type: 'metalband', bay: 4.0, wall: '#b8bec3', rib: '#9aa1a7', base: '#a9513b', baseH: .3, clere: [.72, .86], glass: ['#3a5a78', '#a6bfd4'] },
    metal_ribs:       { type: 'ribs', bay: 3.0, wall: '#b9bfc4', rib: '#99a0a6' },
    storefront:       { type: 'storefront', bay: 3.0, wall: '#3a3d42', glass: ['#3a5a78', '#a6bfd4'], frame: '#2a2c30' },
    curtain:          { type: 'curtain', bay: 1.5, wall: '#2a2d31', glass: ['#3a5a78', '#a6bfd4'], frame: '#c9ced3' },
  };
  const texCache = {};
  function drawBrick(g, W, H, color, rnd, courses) {
    g.fillStyle = color; g.fillRect(0, 0, W, H);
    const ch = H / courses, c = new THREE.Color(color);
    for (let r = 0; r < courses; r++) {
      const bw = W / 6, off = (r % 2) * bw / 2;
      for (let x = -bw; x < W + bw; x += bw) {
        const k = 0.9 + rnd() * 0.18; g.fillStyle = `rgb(${c.r * 255 * k | 0},${c.g * 255 * k | 0},${c.b * 255 * k | 0})`;
        g.fillRect(x + off + 1, r * ch + 1, bw - 2, ch - 2);
      }
    }
    g.fillStyle = 'rgba(255,255,255,.10)'; for (let r = 0; r < courses; r++) g.fillRect(0, r * ch, W, 1);
  }
  function drawGlass(g, x, y, w, h, F) {
    const gr = g.createLinearGradient(x, y, x + w * .6, y + h);
    gr.addColorStop(0, F.glass[1]); gr.addColorStop(.45, F.glass[0]); gr.addColorStop(1, F.glass[0]);
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, y + h * .15); g.lineTo(x + w * .35, y); g.lineTo(x + w * .5, y); g.lineTo(x, y + h * .4); g.fill();
  }
  function facadeTexture(name, withWindows) {
    const id = name + (withWindows ? ':w' : ':p'); if (texCache[id]) return texCache[id];
    const F = FACADES[name] || FACADES.brick_red_ribbon, W = 256, H = 256;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const rnd = rng(hash(name)); const Y = f => H - f * H; // v=0 at bottom of the floor
    const t = F.type;
    if (t === 'ribs' || t === 'metalband') {
      g.fillStyle = F.wall; g.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 16) { g.fillStyle = F.rib; g.fillRect(x, 0, 5, H); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 5, 0, 2, H); }
      if (t === 'metalband') { drawBrick(g, W, H * F.baseH, F.base, rnd, 5); g.save(); g.translate(0, H - H * F.baseH); drawBrick(g, W, H * F.baseH, F.base, rnd, 5); g.restore(); g.fillStyle = '#d6d6d2'; g.fillRect(0, Y(F.baseH) - 4, W, 5); }
      if (withWindows && F.clere) { drawGlass(g, 6, Y(F.clere[1]), W - 12, (F.clere[1] - F.clere[0]) * H, F); g.fillStyle = '#5c6268'; for (let x = 0; x <= W; x += W / 4) g.fillRect(x - 3, Y(F.clere[1]), 6, (F.clere[1] - F.clere[0]) * H); }
    } else if (t === 'storefront' || t === 'curtain') {
      g.fillStyle = F.frame; g.fillRect(0, 0, W, H);
      if (withWindows) {
        drawGlass(g, 7, 7, W - 14, H - 14, F);
        g.fillStyle = F.frame;
        if (t === 'storefront') { g.fillRect(0, Y(.12), W, 6); g.fillRect(0, Y(.80), W, 6); g.fillRect(W / 2 - 3, 0, 6, H); g.fillStyle = '#3d4046'; g.fillRect(7, Y(.12) + 6, W - 14, .12 * H - 13); }
        else { g.fillRect(0, H / 2 - 3, W, 6); }
      } else { g.fillStyle = '#5a5d62'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, H / 2, W, 3); }
    } else {
      if (t === 'panel') {
        g.fillStyle = F.wall; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(80,60,40,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, W / 2 - 2, H / 2 - 2); g.strokeRect(W / 2 + 1, 1, W / 2 - 2, H / 2 - 2); g.strokeRect(1, H / 2 + 1, W - 2, H / 2 - 2);
      } else drawBrick(g, W, H, F.wall, rnd, 18);
      if (F.band) { g.fillStyle = F.band; g.fillRect(0, H - F.bandH * H, W, F.bandH * H); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, H - F.bandH * H - 2, W, 2); }
      if (withWindows) {
        const wins = t === 'paired' ? [F.win, [1 - F.win[1], 1 - F.win[0], F.win[2], F.win[3]]] : [F.win];
        for (const w of wins) {
          const x = w[0] * W, x2 = w[1] * W, y = Y(w[3]), y2 = Y(w[2]);
          if (F.lintel) { g.fillStyle = F.lintel; g.fillRect(x - 6, y - 12, x2 - x + 12, 10); }
          g.fillStyle = F.frame; g.fillRect(x, y, x2 - x, y2 - y);
          drawGlass(g, x + 6, y + 6, x2 - x - 12, y2 - y - 12, F);
          g.fillStyle = F.frame;
          const m = F.mull || 1; for (let k = 1; k <= m; k++) g.fillRect(x + (x2 - x) * k / (m + 1) - 2, y, 4, y2 - y);
          if (t !== 'ribbon') g.fillRect(x, y + (y2 - y) * .55, x2 - x, 4);
          if (F.sill) { g.fillStyle = F.sill; g.fillRect(x - 5, y2, x2 - x + 10, 7); }
        }
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return (texCache[id] = tex);
  }
  function stripeTexture(kind) {
    const id = 'roof:' + kind; if (texCache[id]) return texCache[id];
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); const rnd = rng(hash(kind));
    if (kind === 'shingle') {
      g.fillStyle = '#4a4744'; g.fillRect(0, 0, 128, 128);
      for (let r = 0; r < 8; r++) for (let x = -16; x < 128; x += 16) { const k = 60 + rnd() * 25 | 0; g.fillStyle = `rgb(${k},${k - 3},${k - 6})`; g.fillRect(x + (r % 2) * 8 + 1, r * 16 + 1, 14, 14); }
    } else if (kind === 'metal') {
      g.fillStyle = '#8f9aa3'; g.fillRect(0, 0, 128, 128);
      for (let x = 0; x < 128; x += 16) { g.fillStyle = '#c3ccd3'; g.fillRect(x, 0, 3, 128); g.fillStyle = '#76818a'; g.fillRect(x + 3, 0, 2, 128); }
    } else if (kind === 'membrane') {
      g.fillStyle = '#c4c6c8'; g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 400; i++) { const k = 170 + rnd() * 50 | 0; g.fillStyle = `rgba(${k},${k},${k + 4},.35)`; g.fillRect(rnd() * 128, rnd() * 128, 2, 2); }
      g.fillStyle = 'rgba(255,255,255,.10)'; for (let y = 0; y < 128; y += 32) g.fillRect(0, y, 128, 2);
    } else if (kind === 'rollup') {
      g.fillStyle = '#c9cdd0'; g.fillRect(0, 0, 128, 128); for (let y = 0; y < 128; y += 8) { g.fillStyle = '#9ea4a9'; g.fillRect(0, y, 128, 2); }
    }
    const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return (texCache[id] = tex);
  }
  function fieldTexture(sport) {
    const id = 'field:' + sport; if (texCache[id]) return texCache[id];
    const W = 512, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const turf = sport === 'tennis' ? '#2f6e8e' : '#3f8a3a';
    g.fillStyle = turf; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ffffff'; g.lineWidth = 3;
    if (sport === 'american_football' || sport === 'soccer' || sport === 'turf') {
      for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(i * W / 12, 0, W / 12, H); }
      g.strokeRect(14, 14, W - 28, H - 28);
      if (sport === 'american_football') { for (let i = 1; i < 12; i++) { const x = 14 + (W - 28) * i / 12; g.beginPath(); g.moveTo(x, 14); g.lineTo(x, H - 14); g.stroke(); } g.fillStyle = '#1f4f9c'; g.fillRect(16, 16, (W - 28) / 12 - 4, H - 32); g.fillRect(W - 14 - (W - 28) / 12 + 2, 16, (W - 28) / 12 - 4, H - 32); }
      else { g.beginPath(); g.moveTo(W / 2, 14); g.lineTo(W / 2, H - 14); g.stroke(); g.beginPath(); g.arc(W / 2, H / 2, 34, 0, 7); g.stroke(); g.strokeRect(14, H / 2 - 60, 60, 120); g.strokeRect(W - 74, H / 2 - 60, 60, 120); }
    } else if (sport === 'baseball' || sport === 'softball') {
      g.fillStyle = '#b07a4a'; g.beginPath(); g.moveTo(W * .5, H * .95); g.arc(W * .5, H * .95, H * .55, Math.PI * 1.25, Math.PI * 1.75); g.closePath(); g.fill();
      g.fillStyle = turf; g.beginPath(); g.moveTo(W * .5, H * .86); g.lineTo(W * .5 - H * .2, H * .66); g.lineTo(W * .5, H * .46); g.lineTo(W * .5 + H * .2, H * .66); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(W * .5, H * .95); g.lineTo(0, H * .95 - W * .5); g.moveTo(W * .5, H * .95); g.lineTo(W, H * .95 - W * .5); g.stroke();
      g.fillStyle = '#fff'; [[.5, .9], [.5 - .2 * H / W, .66], [.5, .46], [.5 + .2 * H / W, .66]].forEach(([x, y]) => g.fillRect(x * W - 4, y * H - 4, 8, 8));
    } else if (sport === 'tennis') {
      g.fillStyle = '#3e8a5a'; g.fillRect(0, 0, W, H); g.fillStyle = turf; g.fillRect(40, 30, W - 80, H - 60);
      g.strokeRect(40, 30, W - 80, H - 60); g.strokeRect(40, 30 + (H - 60) * .125, W - 80, (H - 60) * .75);
      g.beginPath(); g.moveTo(W / 2, 22); g.lineTo(W / 2, H - 22); g.lineWidth = 4; g.strokeStyle = '#ddd'; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#fff';
      g.beginPath(); g.moveTo(40 + (W - 80) * .23, H / 2); g.lineTo(40 + (W - 80) * .77, H / 2); g.moveTo(40 + (W - 80) * .23, 30 + (H - 60) * .125); g.lineTo(40 + (W - 80) * .23, 30 + (H - 60) * .875); g.moveTo(40 + (W - 80) * .77, 30 + (H - 60) * .125); g.lineTo(40 + (W - 80) * .77, 30 + (H - 60) * .875); g.stroke();
    }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return (texCache[id] = tex);
  }

  // ---------- materials ----------
  const matCache = {};
  function lam(key, opts) { return matCache[key] || (matCache[key] = new THREE.MeshLambertMaterial(Object.assign({ side: THREE.DoubleSide }, opts))); }
  const colorMat = c => lam('c:' + c, { color: c });
  const facadeMat = (name, w) => lam('f:' + name + w, { map: facadeTexture(name, w) });
  const roofMat = kind => lam('r:' + kind, { map: stripeTexture(kind) });
  const glassMat = () => lam('glass', { color: '#2b4a66', transparent: true, opacity: 0.82 });

  // ---------- geometry builders ----------
  // Wall ring from y0..y1 with facade UVs (whole bays per edge). Short edges get the plain (no-window) material.
  function wallRing(pts, y0, y1, F, floorH, matW, matP) {
    const bay = (FACADES[F] || {}).bay || 3.5;
    const P = [[], []], N = [[], []], U = [[], []];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], L = len(sub(b, a)); if (L < 0.05) continue;
      const nb = Math.round(L / bay), ok = L >= bay * 0.75 && nb >= 1, k = ok ? 0 : 1;
      const uMax = ok ? nb : L / bay, v0 = 0, v1 = (y1 - y0) / floorH, on = outN(a, b);
      const A0 = [a[0], y0, -a[1]], B0 = [b[0], y0, -b[1]], B1 = [b[0], y1, -b[1]], A1 = [a[0], y1, -a[1]];
      P[k].push(...A0, ...B0, ...B1, ...A0, ...B1, ...A1);
      for (let j = 0; j < 6; j++) N[k].push(on[0], 0, -on[1]);
      U[k].push(0, v0, uMax, v0, uMax, v1, 0, v0, uMax, v1, 0, v1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P[0].concat(P[1]), 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N[0].concat(N[1]), 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U[0].concat(U[1]), 2));
    g.addGroup(0, P[0].length / 3, 0); g.addGroup(P[0].length / 3, P[1].length / 3, 1);
    return new THREE.Mesh(g, [matW, matP]);
  }
  function solidRing(pts, y0, y1, mat) {
    const P = [], Nn = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], on = outN(a, b);
      P.push(a[0], y0, -a[1], b[0], y0, -b[1], b[0], y1, -b[1], a[0], y0, -a[1], b[0], y1, -b[1], a[0], y1, -a[1]);
      for (let j = 0; j < 6; j++) Nn.push(on[0], 0, -on[1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
    return new THREE.Mesh(g, mat);
  }
  function cap(pts, y, mat, hole, uvScale) {
    const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
    if (hole) sh.holes.push(new THREE.Path(hole.slice().reverse().map(p => new THREE.Vector2(p[0], p[1]))));
    const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    if (uvScale) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / uvScale, uv.getY(i) / uvScale); }
    return new THREE.Mesh(g, mat);
  }
  // Place a mesh in an (origin, tangent, outward) frame: local x = tangent, z = outward, y = up.
  function framed(obj, o, t, out, y) {
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(t[0], 0, -t[1]), new THREE.Vector3(0, 1, 0), new THREE.Vector3(out[0], 0, -out[1]));
    m.setPosition(o[0], y || 0, -o[1]); obj.applyMatrix4(m); return obj;
  }
  function box(w, h, d, x, y, z, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y + h / 2, z); return m; }
  function cyl(r, h, x, y, z, mat, seg) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 10), mat); m.position.set(x, y + h / 2, z); return m; }
  function pitchedRoof(o, baseY, kind, pitchDeg, over, mat, gableMat) {
    const L = o.hx + over, W = o.hy + over, r = W * Math.tan(pitchDeg * Math.PI / 180), R = Math.max(0, L - W);
    const S = (s, t, h) => { const p = add(add(o.c, mul(o.ux, s)), mul(o.uy, t)); return [p[0], baseY + h, -p[1], s, t]; };
    let faces;
    if (kind === 'hip') faces = [[S(-L, W, 0), S(L, W, 0), S(R, 0, r), S(-R, 0, r)], [S(L, -W, 0), S(-L, -W, 0), S(-R, 0, r), S(R, 0, r)], [S(L, W, 0), S(L, -W, 0), S(R, 0, r)], [S(-L, -W, 0), S(-L, W, 0), S(-R, 0, r)]];
    else faces = [[S(-L, W, 0), S(L, W, 0), S(L, 0, r), S(-L, 0, r)], [S(L, -W, 0), S(-L, -W, 0), S(-L, 0, r), S(L, 0, r)]];
    const P = [], U = [];
    for (const f of faces) {
      const tris = f.length === 4 ? [f[0], f[1], f[2], f[0], f[2], f[3]] : f;
      for (const v of tris) { P.push(v[0], v[1], v[2]); U.push(v[3] / 2.2, (Math.abs(v[4]) + v[1] * 0.3) / 2.2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals();
    const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, mat));
    if (kind === 'gable') {
      const E = o.hx, gp = [];
      for (const sgn of [1, -1]) { const a = S(sgn * E, o.hy, 0), b = S(sgn * E, -o.hy, 0), c = S(sgn * E, 0, o.hy * Math.tan(pitchDeg * Math.PI / 180)); gp.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3)); gg.computeVertexNormals();
      grp.add(new THREE.Mesh(gg, gableMat));
    }
    // fascia
    const fr = [S(-L, -W, 0), S(L, -W, 0), S(L, W, 0), S(-L, W, 0)].map(v => [v[0], -v[2]]);
    grp.add(solidRing(fr, baseY - 0.28, baseY, colorMat('#e9e6df')));
    return grp;
  }
  function perimeterHip(pts, baseY, inset, rise, over, mat) {
    const outer = offsetRing(pts, over), inner = offsetRing(pts, -inset), P = [], U = [];
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length, a = outer[i], b = outer[j], c2 = inner[j], d = inner[i];
      const L = len(sub(b, a));
      const q = [[a, 0, 0], [b, 0, L], [c2, 1, L], [a, 0, 0], [c2, 1, L], [d, 1, 0]];
      for (const [p, h, u] of q) { P.push(p[0], baseY + h * rise, -p[1]); U.push(u / 2.2, h * 1.6); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals();
    const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, mat));
    grp.add(cap(inner, baseY + rise, mat, null, 2.2));
    grp.add(solidRing(outer, baseY - 0.28, baseY, colorMat('#e9e6df')));
    return grp;
  }
  // Ray from c along dir; returns outermost wall hit
  function hitEdge(pts, c, dir) {
    let best = null;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], e = sub(b, a), den = dir[0] * (-e[1]) - dir[1] * (-e[0]);
      if (Math.abs(den) < 1e-9) continue;
      const w = sub(a, c), t = (w[0] * (-e[1]) - w[1] * (-e[0])) / den, s = (dir[0] * w[1] - dir[1] * w[0]) / den;
      if (t > 0 && s >= 0 && s <= 1 && (!best || t > best.t)) best = { t, p: add(c, mul(dir, t)), tan: nrm(e), out: outN(a, b), L: len(e), s, a, b };
    }
    return best;
  }
  function entrance(grp, pts, c, bearing, ex, kind, opt) {
    const dir = [Math.sin(bearing * Math.PI / 180), Math.cos(bearing * Math.PI / 180)];
    const h = hitEdge(pts, c, dir); if (!h) return null;
    // keep the entrance on the wall segment
    const maxW = Math.max(2.5, h.L - 1.0);
    const g = new THREE.Group(), white = colorMat(ex.trim || '#eeeae2'), conc = colorMat('#cfccc5'), dark = colorMat('#2a2c30');
    const doorH = Math.min(2.8, (ex.floor_h || 3.6) - 0.5);
    const door = (w) => { g.add(box(w + 0.5, doorH + 0.3, 0.14, 0, 0, 0.06, white)); g.add(box(w, doorH, 0.18, 0, 0, 0.08, glassMat())); g.add(box(0.08, doorH, 0.22, 0, 0, 0.09, dark)); };
    if (kind === 'portico') {
      const W = Math.min(maxW, 13), D = 3.8, Hc = ex.floor_h || 4.4, nC = ex.columns || 6;
      for (let i = 0; i < 3; i++) g.add(box(W + 2 - i * 0.6, 0.17, D + 1.4 - i * 0.45, 0, i * 0.17, (D + 1.4 - i * 0.45) / 2, conc));
      for (let i = 0; i < nC; i++) { const x = -W / 2 + 0.5 + i * (W - 1) / (nC - 1); g.add(cyl(0.32, Hc - 0.5, x, 0.5, D - 0.5, white, 14)); g.add(box(0.85, 0.22, 0.85, x, 0.5, D - 0.5, white)); g.add(box(0.85, 0.22, 0.85, x, Hc - 0.22, D - 0.5, white)); }
      g.add(box(W + 0.4, 0.7, D + 0.2, 0, Hc, (D + 0.2) / 2, white));
      const tri = new THREE.Shape([new THREE.Vector2(-W / 2 - 0.3, 0), new THREE.Vector2(W / 2 + 0.3, 0), new THREE.Vector2(0, 2.0)]);
      const pg = new THREE.ExtrudeGeometry(tri, { depth: D + 0.3, bevelEnabled: false }); const pm = new THREE.Mesh(pg, white); pm.position.set(0, Hc + 0.7, -0.1); g.add(pm);
      door(2.6);
    } else if (kind === 'atrium') {
      const W = Math.min(maxW, ex.atrium_w || 16, Math.max(8, h.L * 0.45)), D = ex.atrium_d || 6.5, Ha = ex.atrium_h || 9.5, cm = facadeMat('curtain', true);
      const ring = [[-W / 2, -1.2], [W / 2, -1.2], [W / 2, D], [-W / 2, D]];
      const wall = wallRing(ring.map(p => [p[0], p[1]]), 0, Ha, 'curtain', 3.4, cm, cm); g.add(wall);
      g.add(cap(ring, Ha, colorMat('#d9dcdf'))); g.add(solidRing(offsetRing(ring, 0.25), Ha - 0.1, Ha + 0.6, white));
      const CW = W + 5, CD = 4.2; g.add(box(CW, 0.4, CD, 0, 3.8, D + CD / 2 - 0.3, white));
      [-1, 1].forEach(sg => g.add(cyl(0.18, 3.8, sg * (CW / 2 - 0.4), 0, D + CD - 0.6, colorMat('#9aa0a6'))));
      g.add(box(CW + 3, 0.06, CD + 5, 0, 0, D + (CD + 5) / 2, conc));
      // the atrium ring was built in the local (x,z=outward) frame; flip z sign for wallRing's -n convention
      wall.scale.z = -1; g.children[1].scale.z = -1; g.children[2].scale.z = -1;
      const dr = new THREE.Group(); g.add(dr); dr.add(box(3.2, 2.8, 0.2, 0, 0, D + 0.05, dark));
    } else if (kind === 'deep' || kind === 'flat' || kind === 'flat_small') {
      const P = { deep: [14, 5.5, 4.4, 4], flat: [Math.max(4.5, Math.min(10, h.L * 0.3)), 3.2, Math.min(3.6, (ex.floor_h || 3.6) * 0.95), 2], flat_small: [3.6, 1.9, Math.min(3.1, (ex.floor_h || 3.6) * 0.85), 0] }[kind];
      const W = Math.min(P[0], maxW + 2), D = P[1], Y = P[2], posts = P[3];
      g.add(box(W, 0.32, D, 0, Y, D / 2, white)); g.add(box(W + 0.1, 0.12, D + 0.1, 0, Y + 0.32, D / 2, colorMat('#7d7f83')));
      if (posts) for (let i = 0; i < posts; i++) { const x = -W / 2 + 0.35 + i * (W - 0.7) / (posts - 1); g.add(cyl(0.14, Y, x, 0, D - 0.35, white)); }
      g.add(box(W + 2.5, 0.06, D + 3, 0, 0, (D + 3) / 2, conc));
      door(kind === 'flat_small' ? 1.8 : 2.8);
    }
    if (opt && opt.doors) {
      const n = opt.doors, dw = 3.6, dh = Math.min(4.2, (ex.floor_h || 5) - 0.7), span = Math.min(h.L - 2, n * (dw + 2));
      for (let i = 0; i < n; i++) { const x = -span / 2 + (i + 0.5) * span / n + (kind === 'none' ? 0 : (i - (n - 1) / 2) * 0.0); if (Math.abs(x) < 3 && kind !== 'none') continue; g.add(box(dw, dh, 0.12, x, 0, 0.07, lam('rollup', { map: stripeTexture('rollup') }))); g.add(box(dw + 0.3, 0.25, 0.25, x, dh, 0.1, colorMat('#6d7277'))); }
    }
    framed(g, h.p, h.tan, h.out, 0); grp.add(g);
    return h;
  }
  function orientedBox(grp, c, ux, w, d, y0, h, F, floorH, roofCol) {
    const uy = [-ux[1], ux[0]];
    const ring = [add(add(c, mul(ux, -w / 2)), mul(uy, -d / 2)), add(add(c, mul(ux, w / 2)), mul(uy, -d / 2)), add(add(c, mul(ux, w / 2)), mul(uy, d / 2)), add(add(c, mul(ux, -w / 2)), mul(uy, d / 2))];
    const R = cleanRing(ring);
    grp.add(wallRing(R, y0, y0 + h, F, floorH, facadeMat(F, true), facadeMat(F, false)));
    grp.add(cap(R, y0 + h, roofMat('membrane'), null, 6));
    grp.add(solidRing(offsetRing(R, 0.15), y0 + h - 0.1, y0 + h + 0.5, colorMat(roofCol || '#e7e2d8')));
    return R;
  }

  // ---------- main: build a building group from a ring (local [e,n]) + recipe ----------
  function build(ringEN, ex, key) {
    const grp = new THREE.Group(); grp.userData.key = key;
    const pts = cleanRing(ringEN); if (pts.length < 3) return grp;
    const o = obb(pts), c = pip(centroid(pts), pts) ? centroid(pts) : o.c;
    const rect = Math.abs(signedArea(pts)) / (4 * o.hx * o.hy);
    if (ex.arch === 'field') {
      const polys = (ex.pitches && ex.pitches.length) ? ex.pitches.map(q => ({ ring: q.ringEN, sport: q.sport })) : [{ ring: pts, sport: 'turf' }];
      for (const q of polys) {
        const R = cleanRing(q.ring), oo = obb(R), m = cap(R, 0.12, lam('fld:' + q.sport, { map: fieldTexture(q.sport) }));
        const uv = m.geometry.attributes.uv, pos = m.geometry.attributes.position;
        for (let i = 0; i < uv.count; i++) { const p = [pos.getX(i), -pos.getZ(i)], d = sub(p, oo.c); uv.setXY(i, (dot(d, oo.ux) + oo.hx) / (2 * oo.hx), (dot(d, oo.uy) + oo.hy) / (2 * oo.hy)); }
        grp.add(m); grp.add(solidRing(R, 0, 0.12, colorMat('#e9e6df')));
        if (q.sport === 'tennis') { const fr = offsetRing(R, 0.3); for (const p of fr) grp.add(cyl(0.05, 3, p[0], 0, -p[1], colorMat('#3b3f44'), 6)); grp.add(solidRing(fr, 2.6, 3, lam('fence', { color: '#2f3a36', transparent: true, opacity: 0.35 }))); }
      }
      return grp;
    }
    if (ex.catColor) { const hm = cap(offsetRing(pts, 1.6), 0.06, lam('halo:' + ex.catColor, { color: ex.catColor, transparent: true, opacity: 0.55, depthWrite: false }), pts); hm.renderOrder = -1; grp.add(hm); }
    const H = ex.height || 7, fh = ex.floor_h || 3.6, F = ex.facade || 'brick_red_ribbon', G = ex.ground || F;
    const trim = colorMat(ex.trim || '#ece6da');
    // plinth
    grp.add(solidRing(offsetRing(pts, 0.08), 0, 0.45, colorMat('#8e8a83')));
    // walls: ground floor + upper floors
    const gH = Math.min(fh, H);
    grp.add(wallRing(pts, 0, gH, G, gH, facadeMat(G, true), facadeMat(G, false)));
    if (H > gH + 0.1) grp.add(wallRing(pts, gH, H, F, fh, facadeMat(F, true), facadeMat(F, false)));
    if (G !== F && H > gH + 0.1) grp.add(solidRing(offsetRing(pts, 0.12), gH - 0.1, gH + 0.25, trim));
    // roof
    let roof = ex.roof || 'flat_parapet';
    if (roof === 'hip_or_flat') roof = rect > 0.86 ? 'hip' : 'flat_parapet';
    if (roof === 'gable_or_flat') roof = rect > 0.86 ? 'gable' : 'flat_parapet';
    if (roof === 'hip' && rect < 0.86 && ex.landmark) roof = 'perimeter_hip';
    if ((roof === 'hip' || roof === 'gable') && rect < 0.7) roof = 'flat_parapet';
    let topY = H;
    if (roof === 'hip' || roof === 'gable') {
      const metal = ['shop', 'warehouse', 'athletic_hall'].includes(ex.arch);
      grp.add(cap(pts, H, colorMat('#6f6b66')));
      grp.add(pitchedRoof(o, H, roof, ex.pitch || 20, 0.6, roofMat(metal ? 'metal' : 'shingle'), facadeMat(F, false)));
      topY = H + o.hy * Math.tan((ex.pitch || 20) * Math.PI / 180);
    } else if (roof === 'perimeter_hip') {
      const inset = Math.min(4.5, o.hy * 0.4), rise = inset * Math.tan((ex.pitch || 22) * Math.PI / 180);
      grp.add(cap(pts, H, colorMat('#6f6b66')));
      grp.add(perimeterHip(pts, H, inset, rise, 0.6, roofMat('shingle')));
      topY = H + rise;
    } else if (roof === 'dome') {
      grp.add(cap(pts, H, roofMat('membrane'), null, 6));
      grp.add(solidRing(offsetRing(pts, 0.2), H - 0.2, H + 0.9, trim));
      const dg = new THREE.SphereGeometry(1, 56, 14, 0, Math.PI * 2, 0, Math.PI / 2);
      const uv = dg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 40, uv.getY(i) * 3);
      const dm = new THREE.Mesh(dg, roofMat('metal'));
      dm.scale.set(o.hx * 0.86, ex.dome_rise || 6, o.hy * 0.86); dm.rotation.y = Math.atan2(o.ux[1], o.ux[0]); dm.position.set(o.c[0], H + 0.3, -o.c[1]); grp.add(dm);
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 56, 1, true), facadeMat('precast_ribs', false));
      drum.scale.set(o.hx * 0.86, 0.6, o.hy * 0.86); drum.rotation.y = dm.rotation.y; drum.position.set(o.c[0], H + 0.3, -o.c[1]); grp.add(drum);
      grp.add(cyl(1.2, 1.0, o.c[0], H + 0.3 + (ex.dome_rise || 6) - 0.1, -o.c[1], trim, 16));
      topY = H + (ex.dome_rise || 6);
    } else {
      const par = ex.parapet || 0.8, outer = offsetRing(pts, 0.18), inner = offsetRing(pts, -0.12);
      grp.add(cap(pts, H, roofMat('membrane'), null, 6));
      grp.add(solidRing(outer, H - 0.35, H + par, trim));
      grp.add(solidRing(inner, H, H + par, colorMat('#bdb7ab')));
      grp.add(cap(outer, H + par, trim, inner));
      topY = H + par;
    }
    // landmark extras
    if (ex.clerestory) {
      const R = orientedBox(grp, c, o.ux, o.hx * 0.75, o.hy * 0.5, H, 2.6, 'brick_tan_ribbon', 2.6);
      void R;
    }
    if (ex.flytower) {
      const b = ex.entrance * Math.PI / 180, dir = [Math.sin(b), Math.cos(b)], perp = [dir[1], -dir[0]];
      const ext = v => Math.abs(dot(v, o.ux)) * o.hx + Math.abs(dot(v, o.uy)) * o.hy;
      const R = ext(dir), Rp = ext(perp);
      let fc = add(c, mul(dir, -R * ex.flytower.back)); if (!pip(fc, pts)) fc = c;
      orientedBox(grp, fc, perp, 2 * Rp * ex.flytower.w, 2 * R * ex.flytower.d, 0, ex.flytower.h, 'heindl_panel', 4.75);
      topY = Math.max(topY, ex.flytower.h);
    }
    // rooftop HVAC units removed 2026-10-08 (user request); ext.rtu in the data is now ignored
    // glass "front": every wall facing within ~40° of the main entrance gets a storefront/curtain band
    if (ex.front && ex.entrance != null) {
      const b = ex.entrance * Math.PI / 180, dir = [Math.sin(b), Math.cos(b)], F2 = ex.front.facade || 'storefront';
      const bay = (FACADES[F2] || {}).bay || 3, fm = facadeMat(F2, true), white = colorMat(ex.trim || '#eeeae2');
      const fhgt = Math.min(ex.front.h, H - 0.5);
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], q = pts[(i + 1) % pts.length], L = len(sub(q, a)), on = outN(a, q);
        if (L < 5 || dot(on, dir) < 0.76) continue;
        const fw = Math.min(L - 1.4, ex.front.w), pl = new THREE.Mesh(new THREE.PlaneGeometry(fw, fhgt), fm);
        const uv = pl.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * Math.max(1, Math.round(fw / bay)), uv.getY(k) * Math.max(1, Math.round(fhgt / (ex.front.floor || 3.6))));
        pl.position.set(0, 0.45 + fhgt / 2, 0.06);
        const fg = new THREE.Group(); fg.add(pl); fg.add(box(fw + 0.5, 0.4, 0.4, 0, 0.45 + fhgt, 0.12, white));
        framed(fg, mul(add(a, q), 0.5), nrm(sub(q, a)), on, 0); grp.add(fg);
      }
    }
    // entrances
    let ent = null;
    if (ex.entrance != null && ex.canopy !== undefined) {
      ent = entrance(grp, pts, c, ex.entrance, ex, ex.canopy, { main: true, doors: ex.doors && ex.canopy === 'none' ? ex.doors : 0 });
      if (ex.doors && ex.canopy !== 'none') entrance(grp, pts, c, (ex.entrance + 90) % 360, ex, 'none', { doors: ex.doors });
      if (ex.entrance2 != null) entrance(grp, pts, c, ex.entrance2, ex, 'flat');
    }
    grp.userData.topY = topY; grp.userData.ring = pts; grp.userData.center = c;
    return grp;
  }

  return { build, obb, cleanRing, offsetRing, pip, centroid, FACADES };
};
