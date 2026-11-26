showSize();
function rnd(x, y, k) {
  let h = Math.imul(x + 1, 374761393) ^ Math.imul(y + 7, 668265263) ^ Math.imul(k + 3, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function mul(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
  return `rgb(${c})`;
}
// Compensate for ground foreshortening so the 12° tilt only affects elevation.
const ELEVATION_SCALE = Math.tan((12 * Math.PI) / 180),
  TOP_CLEARANCE = 1 + MAX_ELEVATION * ELEVATION_SCALE;
let TW, LH, ox, oy, W, Hc, TW0;
// Projection: 'iso' (2:1 diamonds, like Dofus) or 'top' (square tiles seen from above). A personal view setting.
let PROJ = lsGet('luparis-proj', 'iso') === 'top' ? 'top' : 'iso';
const ISO = () => PROJ === 'iso';
// circles on the ground are squashed in isometric view
const YR = () => (ISO() ? 0.5 : 1);
function layout() {
  const r = stage.getBoundingClientRect(),
    dpr = Math.min(2, window.devicePixelRatio || 1);
  W = r.width;
  Hc = r.height;
  if (!W || !Hc) return;
  const pw = Math.max(1, Math.round(W * dpr)),
    ph = Math.max(1, Math.round(Hc * dpr));
  if (cv.width !== pw) cv.width = pw;
  if (cv.height !== ph) cv.height = ph;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  TW0 = ISO()
    ? Math.min((W * 0.94) / N, (Hc * 0.86) / (N / 2 + 2))
    : Math.min((W * 0.94) / N, (Hc * 0.92) / (N + TOP_CLEARANCE));
  camSet();
  draw();
}
function camSet() {
  TW = TW0 * CAM.z;
  if (ISO()) {
    LH = TW * 0.28;
    ox = W / 2 + CAM.px;
    oy = (Hc - (N * TW) / 2) / 2 + LH * 2.2 + CAM.py;
    return;
  }
  LH = TW * ELEVATION_SCALE;
  ox = (W - N * TW) / 2 + CAM.px;
  oy = (Hc - (N - TOP_CLEARANCE) * TW) / 2 + CAM.py;
}
function zoomAt(k, mx, my) {
  const z = Math.max(1, Math.min(N > 32 ? 16 : 6, CAM.z * k));
  if (z === CAM.z) return;
  const f = z / CAM.z,
    nox = mx - (mx - ox) * f,
    noy = my - (my - oy) * f;
  CAM.z = z;
  camSet();
  CAM.px += nox - ox;
  CAM.py += noy - oy;
  if (z === 1) {
    CAM.px = 0;
    CAM.py = 0;
  }
  camSet();
  drawMove();
}
function view(x, y) {
  switch (rot) {
    case 1:
      return [N - 1 - y, x];
    case 2:
      return [N - 1 - x, N - 1 - y];
    case 3:
      return [y, N - 1 - x];
    default:
      return [x, y];
  }
}
function scr(vx, vy, h) {
  if (ISO()) return [ox + ((vx - vy) * TW) / 2, oy + ((vx + vy) * TW) / 4 - h * LH];
  return [ox + vx * TW, oy + vy * TW - h * LH];
}
// corners in the same order in both views: back, right, front, left (iso) / TL, TR, BR, BL (top)
function tileQuad(cx, cy) {
  if (ISO())
    return [
      [cx, cy],
      [cx + TW / 2, cy + TW / 4],
      [cx, cy + TW / 2],
      [cx - TW / 2, cy + TW / 4],
    ];
  return [
    [cx, cy],
    [cx + TW, cy],
    [cx + TW, cy + TW],
    [cx, cy + TW],
  ];
}
function tileCorners(vx, vy, h) {
  return tileQuad(...scr(vx, vy, h));
}
function poly(p, fill, stroke, lw) {
  ctx.beginPath();
  p.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw || 1;
    ctx.stroke();
  }
}
function tilePoint(cx, cy, u, v) {
  if (ISO()) return [cx + ((u - v) * TW) / 2, cy + ((u + v) * TW) / 4];
  return [cx + u * TW, cy + v * TW];
}
let CC = null,
  CCk = '';
function cells() {
  const k = N + ':' + rot + ':' + PROJ;
  if (CCk !== k) {
    const a = [];
    // Paint from the back of the map towards the camera.
    for (let vy = 0; vy < N; vy++)
      for (let vx = 0; vx < N; vx++) {
        const [x, y] = unview(vx, vy);
        a.push({ x, y, vx, vy });
      }
    if (ISO()) a.sort((p, q) => p.vx + p.vy - (q.vx + q.vy) || p.vx - q.vx);
    CC = a;
    CCk = k;
  }
  return CC;
}
function unview(vx, vy) {
  switch (rot) {
    case 1:
      return [vy, N - 1 - vx];
    case 2:
      return [N - 1 - vx, N - 1 - vy];
    case 3:
      return [N - 1 - vy, vx];
    default:
      return [vx, vy];
  }
}
function gv(vx, vy) {
  let x, y;
  switch (rot) {
    case 1:
      x = vy;
      y = N - 1 - vx;
      break;
    case 2:
      x = N - 1 - vx;
      y = N - 1 - vy;
      break;
    case 3:
      x = N - 1 - vy;
      y = vx;
      break;
    default:
      x = vx;
      y = vy;
  }
  return x >= 0 && y >= 0 && x < N && y < N ? H[x][y] : null;
}
function hasAnim() {
  if (reduce || N > 40) return false;
  if (Object.values(ENV).some(v => ['fire', 'fog', 'dark'].includes(v.k || v))) return true;
  const p = B[bio].pit;
  if (p !== 'lava' && p !== 'water' && p !== 'swamp') return false;
  for (const r of H) for (const v of r) if (v < 0) return true;
  return false;
}
function specks(cx, cy, x, y) {
  const s = B[bio].sp;
  for (let i = 0; i < 4; i++) {
    if (rnd(x, y, i) > s.d) continue;
    const [px, py] = tilePoint(cx, cy, 0.18 + rnd(x, y, i + 10) * 0.64, 0.18 + rnd(x, y, i + 20) * 0.64);
    const c = s.c[Math.floor(rnd(x, y, i + 30) * s.c.length)];
    const z = TW / 40;
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(1, z * 0.8);
    ctx.beginPath();
    if (s.k === 'tuft' || s.k === 'leaf') {
      ctx.moveTo(px - z * 1.5, py);
      ctx.lineTo(px - z * 0.5, py - z * 3);
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - z * 3.6);
      ctx.moveTo(px + z * 1.5, py);
      ctx.lineTo(px + z * 0.6, py - z * 3);
      ctx.stroke();
    } else if (s.k === 'flower') {
      ctx.arc(px, py, z * 1.3, 0, 7);
      ctx.fill();
    } else if (s.k === 'ember') {
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin((performance.now() - t0) / 400 + i + x);
      ctx.arc(px, py, z * 1.1, 0, 7);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (s.k === 'ripple') {
      ctx.ellipse(px, py, z * 4, z * 1.2, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (s.k === 'crack') {
      ctx.moveTo(px - z * 3, py);
      ctx.lineTo(px, py + z);
      ctx.lineTo(px + z * 3, py - z);
      ctx.stroke();
    } else {
      ctx.ellipse(px, py, z * 1.6, z, 0, 0, 7);
      ctx.fill();
    }
  }
}
function deco(kind, cx, cy, h, x, y) {
  if (!kind) return;
  const s = TW / 64,
    [bx, by] = tilePoint(cx, cy, 0.5, 0.5);
  ctx.lineWidth = Math.max(1, s * 1.5);
  if (kind === 'bush') {
    for (const [dx, dy, r] of [
      [-9, 0, 10],
      [8, 1, 9],
      [0, -6, 11],
    ]) {
      ctx.fillStyle = bio === 'neige' ? '#e9f0f4' : '#3f6b34';
      ctx.beginPath();
      ctx.arc(bx + dx * s, by + dy * s - 6 * s, r * s, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.arc(bx - 3 * s, by - 16 * s, 5 * s, 0, 7);
    ctx.fill();
  } else if (kind === 'tree') {
    ctx.fillStyle = '#5b4630';
    ctx.fillRect(bx - 3 * s, by - 22 * s, 6 * s, 22 * s);
    const g = bio === 'marais' ? ['#5d6e3a', '#4c5c2f'] : ['#4d8a3c', '#3b6f2e'];
    for (const [dx, dy, r, c] of [
      [-10, -30, 13, 1],
      [10, -30, 13, 1],
      [0, -42, 16, 0],
    ]) {
      ctx.fillStyle = g[c];
      ctx.beginPath();
      ctx.arc(bx + dx * s, by + dy * s, r * s, 0, 7);
      ctx.fill();
    }
  } else if (kind === 'pine' || kind === 'pinesnow') {
    ctx.fillStyle = '#4a3a28';
    ctx.fillRect(bx - 2.5 * s, by - 10 * s, 5 * s, 10 * s);
    for (let i = 0; i < 3; i++) {
      const w = (18 - i * 4) * s,
        yb = by - (8 + i * 13) * s;
      poly(
        [
          [bx - w, yb],
          [bx + w, yb],
          [bx, yb - 22 * s],
        ],
        i % 2 ? '#2f5a2c' : '#356530',
      );
      if (kind === 'pinesnow')
        poly(
          [
            [bx - w * 0.45, yb - 12 * s],
            [bx + w * 0.45, yb - 12 * s],
            [bx, yb - 22 * s],
          ],
          '#f4f8fb',
        );
    }
  } else if (kind === 'rock') {
    const k = rnd(x, y, 77);
    const c =
      bio === 'volcan' ? ['#3d3431', '#2a2321'] : bio === 'desert' ? ['#b98a58', '#9a6d43'] : ['#9b9890', '#7d7a73'];
    poly(
      [
        [bx - 14 * s, by - 2 * s],
        [bx - 10 * s, by - 14 * s - k * 4 * s],
        [bx + 2 * s, by - 18 * s],
        [bx + 13 * s, by - 9 * s],
        [bx + 12 * s, by],
      ],
      c[0],
    );
    poly(
      [
        [bx + 2 * s, by - 18 * s],
        [bx + 13 * s, by - 9 * s],
        [bx + 12 * s, by],
        [bx + 1 * s, by - 4 * s],
      ],
      c[1],
    );
  } else if (kind === 'dead') {
    ctx.strokeStyle = bio === 'volcan' ? '#1a1312' : '#4a3f2c';
    ctx.lineWidth = Math.max(1.5, 3 * s);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - 30 * s);
    ctx.moveTo(bx, by - 18 * s);
    ctx.lineTo(bx - 10 * s, by - 28 * s);
    ctx.moveTo(bx, by - 24 * s);
    ctx.lineTo(bx + 9 * s, by - 34 * s);
    ctx.stroke();
  } else if (kind === 'cactus') {
    ctx.fillStyle = '#5e8f4a';
    const r = (x0, y0, w, hh) => {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x0, y0, w, hh, w / 2);
      else ctx.rect(x0, y0, w, hh);
      ctx.fill();
    };
    r(bx - 4 * s, by - 30 * s, 8 * s, 30 * s);
    r(bx - 13 * s, by - 22 * s, 6 * s, 12 * s);
    r(bx + 7 * s, by - 26 * s, 6 * s, 12 * s);
  } else if (kind === 'hay') {
    ctx.fillStyle = '#e2c46a';
    ctx.beginPath();
    ctx.ellipse(bx, by - 8 * s, 14 * s, 9 * s, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = '#b8973f';
    ctx.beginPath();
    ctx.ellipse(bx, by - 8 * s, 8 * s, 5 * s, 0, 0, 7);
    ctx.stroke();
  } else if (kind === 'reed') {
    ctx.strokeStyle = '#7f8f4a';
    ctx.lineWidth = Math.max(1, 2 * s);
    ctx.beginPath();
    for (const dx of [-8, -3, 2, 7]) {
      ctx.moveTo(bx + dx * s, by);
      ctx.lineTo(bx + dx * s * 1.3, by - 24 * s);
    }
    ctx.stroke();
    ctx.fillStyle = '#6b4a2f';
    for (const dx of [-3, 7]) {
      ctx.beginPath();
      ctx.ellipse(bx + dx * s * 1.3, by - 22 * s, 2 * s, 5 * s, 0, 0, 7);
      ctx.fill();
    }
  } else if (kind === 'crate') {
    const w = 11 * s;
    poly(
      [
        [bx - w, by - 4 * s],
        [bx, by + 1 * s],
        [bx, by - 14 * s],
        [bx - w, by - 19 * s],
      ],
      '#8a6238',
      'rgba(0,0,0,.3)',
    );
    poly(
      [
        [bx, by + 1 * s],
        [bx + w, by - 4 * s],
        [bx + w, by - 19 * s],
        [bx, by - 14 * s],
      ],
      '#6f4e2c',
      'rgba(0,0,0,.3)',
    );
    poly(
      [
        [bx - w, by - 19 * s],
        [bx, by - 14 * s],
        [bx + w, by - 19 * s],
        [bx, by - 24 * s],
      ],
      '#a3784a',
      'rgba(0,0,0,.3)',
    );
  } else if (kind === 'pillar') {
    ctx.fillStyle = '#8f8a83';
    ctx.fillRect(bx - 7 * s, by - 36 * s, 14 * s, 36 * s);
    ctx.fillStyle = '#a6a19a';
    ctx.fillRect(bx - 7 * s, by - 36 * s, 5 * s, 36 * s);
    ctx.fillStyle = '#b3aea6';
    ctx.beginPath();
    ctx.ellipse(bx, by - 36 * s, 9 * s, 4 * s, 0, 0, 7);
    ctx.fill();
  }
}
function pit(c, h) {
  const { vx, vy, x, y } = c,
    b = B[bio],
    g = tileCorners(vx, vy, 0),
    t = (performance.now() - t0) / 1000;
  ctx.save();
  poly(g);
  ctx.clip();
  const liquid = b.pit !== 'chasm';
  const d = liquid ? LH * (h === -1 ? 0.35 : 0.6) : -h * LH * 1.1;
  const cols = {
    chasm: ['#2b2622', '#4a423b'],
    water: ['#3f7fb0', '#5a7e64'],
    lava: ['#ff6a1a', '#2a1d1a'],
    sand: ['#c79a5a', '#a77e48'],
    ice: ['#9ccbe6', '#b7c7d3'],
    swamp: ['#4b5a32', '#3f3a29'],
  }[b.pit];
  let floor = cols[0];
  if (b.pit === 'water' && h === -2) floor = '#2c5f8c';
  if (b.pit === 'ice' && h === -2) floor = '#3d6f93';
  if (b.pit === 'swamp' && h === -2) floor = '#364425';
  if (b.pit === 'lava') {
    const k = 0.85 + 0.15 * Math.sin(t * 2 + x * 0.7 + y * 0.5);
    floor =
      h === -2
        ? `rgb(${Math.round(255 * k)},${Math.round(80 * k)},20)`
        : `rgb(${Math.round(240 * k)},${Math.round(120 * k)},40)`;
  }
  const nb = [gv(vx - 1, vy), gv(vx, vy - 1), gv(vx + 1, vy), gv(vx, vy + 1)].map(
    v => v !== null && (liquid ? v < 0 : v === h),
  );
  poly(liquid || nb.some(Boolean) ? g : g.map(p => [p[0], p[1] + d]), floor);
  if (liquid && b.pit !== 'sand') {
    ctx.strokeStyle = b.pit === 'lava' ? 'rgba(255,230,120,.7)' : 'rgba(255,255,255,.45)';
    ctx.lineWidth = Math.max(1, TW / 60);
    ctx.beginPath();
    const o = (t * 0.15 + rnd(x, y, 5)) % 1;
    const [a1, b1] = tilePoint(g[0][0], g[0][1] + d, 0.25 + o * 0.3, 0.35),
      [a2, b2] = tilePoint(g[0][0], g[0][1] + d, 0.45 + o * 0.3, 0.35);
    ctx.moveTo(a1, b1);
    ctx.lineTo(a2, b2);
    ctx.stroke();
  }
  if (b.pit === 'sand') {
    ctx.strokeStyle = 'rgba(120,80,40,.5)';
    ctx.lineWidth = 1;
    const [cx2, cy2] = tilePoint(g[0][0], g[0][1] + d, 0.5, 0.5);
    ctx.beginPath();
    ctx.ellipse(cx2, cy2, TW * 0.22, TW * 0.09, 0, 0, 7);
    ctx.ellipse(cx2, cy2, TW * 0.11, TW * 0.045, 0, 0, 7);
    ctx.stroke();
  }
  if (ISO() && !nb[0]) poly([g[3], g[0], [g[0][0], g[0][1] + d], [g[3][0], g[3][1] + d]], cols[1]);
  if (!nb[1]) poly([g[0], g[1], [g[1][0], g[1][1] + d], [g[0][0], g[0][1] + d]], ISO() ? mul(cols[1], 0.82) : cols[1]);
  ctx.restore();
  if (!nb.some(Boolean)) poly(g, null, 'rgba(0,0,0,.4)');
  else {
    ctx.strokeStyle = 'rgba(0,0,0,.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [i, a, b2] of [
      [0, 3, 0],
      [1, 0, 1],
      [2, 1, 2],
      [3, 2, 3],
    ])
      if (!nb[i]) {
        ctx.moveTo(...g[a]);
        ctx.lineTo(...g[b2]);
      }
    ctx.stroke();
  }
  if (b.pit === 'lava') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const [cx, cy] = scr(vx + 0.5, vy + 0.5, 0);
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, TW * 0.7);
    gr.addColorStop(0, 'rgba(255,110,30,.28)');
    gr.addColorStop(1, 'rgba(255,110,30,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(cx - TW * 0.7, cy - TW * 0.7, TW * 1.4, TW * 1.4);
    ctx.restore();
  }
}
const FC = {
    1: ['#b49c74', '#ab936b'],
    2: ['#9d978c', '#958f84'],
    3: ['#a87c50', '#a0754a'],
    4: ['#7c6a56', '#7c6a56'],
    5: ['#7a5434', '#7a5434'],
    6: ['#7fae55', '#78a64f'],
    7: ['#9a958c', '#928d84'],
    8: ['#eef3f5', '#e6eef1'],
    9: ['#e2c88f', '#dcc187'],
    10: ['#6e5636', '#664f31'],
    11: ['#a58a5f', '#9d8358'],
    12: ['#bfe3f2', '#b5dcec'],
    13: ['#8d877c', '#857f74'],
  },
  FSIDE = {
    6: '#6b5a3a',
    7: '#6f6a62',
    8: '#9aa7ad',
    9: '#b0935c',
    10: '#4d3b25',
    11: '#6e5a3a',
    12: '#7fa9bd',
    13: '#625d55',
  },
  FW = { side: ['#a8957c', '#9a876e', '#8c7960'] };
const FL = {
  1: ['Path', 'Chemin'],
  2: ['Cobblestones', 'Pavés'],
  3: ['Wooden floor', 'Plancher'],
  4: ['Wall', 'Mur'],
  5: ['Furniture, crates', 'Mobilier, caisses'],
  6: ['Grass', 'Herbe'],
  7: ['Bare rock', 'Roche nue'],
  8: ['Snow', 'Neige'],
  9: ['Sand', 'Sable'],
  10: ['Mud', 'Boue'],
  11: ['Dirt', 'Terre'],
  12: ['Ice', 'Glace'],
  13: ['Scree', 'Éboulis'],
};
const SURF_ORDER = [0, 6, 11, 7, 13, 8, 12, 9, 10, 1, 2, 3, 4, 5];
let surfSel = 7;
function fillSurf() {
  const el = document.getElementById('surfk');
  if (!el) return;
  el.innerHTML = SURF_ORDER.map(
    k =>
      `<option value="${k}"${k === surfSel ? ' selected' : ''}>${esc(k ? tr(FL[k]) : L2('Setting (no surface)', 'Décor (aucun sol)'))}</option>`,
  ).join('');
}
function ftex(f, t, x, y) {
  const [cx, cy] = t[0];
  ctx.save();
  poly(t);
  ctx.clip();
  ctx.lineWidth = 1;
  if (f === 3) {
    ctx.strokeStyle = 'rgba(60,35,15,.35)';
    for (let i = 1; i < 4; i++) {
      const [a1, b1] = tilePoint(cx, cy, i / 4, 0),
        [a2, b2] = tilePoint(cx, cy, i / 4, 1);
      ctx.beginPath();
      ctx.moveTo(a1, b1);
      ctx.lineTo(a2, b2);
      ctx.stroke();
    }
  } else if (f === 2) {
    ctx.strokeStyle = 'rgba(50,45,40,.35)';
    for (let i = 0; i < 5; i++) {
      const [px, py] = tilePoint(cx, cy, 0.15 + rnd(x, y, i) * 0.7, 0.15 + rnd(x, y, i + 9) * 0.7);
      ctx.beginPath();
      ctx.ellipse(px, py, TW / 16, TW / 30, 0, 0, 7);
      ctx.stroke();
    }
  } else if (f === 1) {
    ctx.fillStyle = 'rgba(90,70,45,.35)';
    for (let i = 0; i < 3; i++) {
      if (rnd(x, y, i) > 0.6) continue;
      const [px, py] = tilePoint(cx, cy, 0.2 + rnd(x, y, i + 3) * 0.6, 0.2 + rnd(x, y, i + 6) * 0.6);
      ctx.beginPath();
      ctx.ellipse(px, py, TW / 40, TW / 70, 0, 0, 7);
      ctx.fill();
    }
  } else if (f === 4) {
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    const [a1, b1] = tilePoint(cx, cy, 0.5, 0),
      [a2, b2] = tilePoint(cx, cy, 0.5, 1);
    ctx.beginPath();
    ctx.moveTo(a1, b1);
    ctx.lineTo(a2, b2);
    ctx.stroke();
  } else if (f === 5) {
    ctx.strokeStyle = 'rgba(30,15,5,.45)';
    const [x0, y0] = tilePoint(cx, cy, 0.32, 0.2);
    ctx.strokeRect(x0, y0, TW * 0.36, TW * 0.6);
  } else if (f === 6) {
    ctx.strokeStyle = 'rgba(40,90,30,.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const [px, py] = tilePoint(cx, cy, 0.15 + rnd(x, y, i) * 0.7, 0.15 + rnd(x, y, i + 9) * 0.7);
      ctx.beginPath();
      ctx.moveTo(px - TW * 0.02, py);
      ctx.lineTo(px - TW * 0.03, py - TW * 0.05);
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - TW * 0.06);
      ctx.moveTo(px + TW * 0.02, py);
      ctx.lineTo(px + TW * 0.03, py - TW * 0.05);
      ctx.stroke();
    }
  } else if (f === 7 || f === 13) {
    ctx.strokeStyle = 'rgba(50,45,40,.45)';
    ctx.fillStyle = 'rgba(60,55,50,.35)';
    if (f === 7) {
      const [a1, b1] = tilePoint(cx, cy, 0.2 + rnd(x, y, 1) * 0.2, 0.3),
        [a2, b2] = tilePoint(cx, cy, 0.5, 0.55),
        [a3, b3] = tilePoint(cx, cy, 0.75, 0.5 + rnd(x, y, 2) * 0.3);
      ctx.beginPath();
      ctx.moveTo(a1, b1);
      ctx.lineTo(a2, b2);
      ctx.lineTo(a3, b3);
      ctx.stroke();
    } else
      for (let i = 0; i < 6; i++) {
        const [px, py] = tilePoint(cx, cy, 0.1 + rnd(x, y, i) * 0.8, 0.1 + rnd(x, y, i + 5) * 0.8);
        ctx.beginPath();
        ctx.ellipse(px, py, TW * 0.035, TW * 0.02, 0, 0, 7);
        ctx.fill();
        ctx.stroke();
      }
  } else if (f === 8 || f === 12) {
    ctx.fillStyle = f === 8 ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.7)';
    if (f === 12) {
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 1.2;
      const [a1, b1] = tilePoint(cx, cy, 0.25, 0.2),
        [a2, b2] = tilePoint(cx, cy, 0.55, 0.6);
      ctx.beginPath();
      ctx.moveTo(a1, b1);
      ctx.lineTo(a2, b2);
      ctx.stroke();
    } else
      for (let i = 0; i < 3; i++) {
        const [px, py] = tilePoint(cx, cy, 0.15 + rnd(x, y, i) * 0.7, 0.15 + rnd(x, y, i + 4) * 0.7);
        ctx.fillRect(px, py, 1.5, 1.5);
      }
  } else if (f === 9) {
    ctx.strokeStyle = 'rgba(150,115,60,.45)';
    ctx.lineWidth = 1;
    const [a1, b1] = tilePoint(cx, cy, 0.1, 0.4),
      [a2, b2] = tilePoint(cx, cy, 0.9, 0.5);
    ctx.beginPath();
    ctx.moveTo(a1, b1);
    ctx.quadraticCurveTo((a1 + a2) / 2, (b1 + b2) / 2 - TW * 0.06, a2, b2);
    ctx.stroke();
  } else if (f === 10) {
    ctx.fillStyle = 'rgba(60,80,90,.35)';
    const [px, py] = tilePoint(cx, cy, 0.3 + rnd(x, y, 1) * 0.4, 0.3 + rnd(x, y, 2) * 0.4);
    ctx.beginPath();
    ctx.ellipse(px, py, TW * 0.13, TW * 0.05, 0, 0, 7);
    ctx.fill();
  } else if (f === 11) {
    ctx.fillStyle = 'rgba(80,60,35,.4)';
    for (let i = 0; i < 4; i++) {
      const [px, py] = tilePoint(cx, cy, 0.15 + rnd(x, y, i) * 0.7, 0.15 + rnd(x, y, i + 6) * 0.7);
      ctx.fillRect(px, py, 2, 1.5);
    }
  }
  ctx.restore();
}
let drawQ = false;
let drawFull = false,
  DIRTY = null;
function drawFrame() {
  drawQ = false;
  const f = drawFull;
  drawFull = false;
  drawNow(!f);
}
function draw() {
  drawFull = true;
  if (drawQ) return;
  drawQ = true;
  requestAnimationFrame(drawFrame);
}
// painting the terrain only re-renders the few tiles around the brush, clipped, in the cached scene
function drawDirty(c) {
  const r = [1e9, 1e9, -1e9, -1e9];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const x = c.x + i,
        y = c.y + j;
      if (x < 0 || y < 0 || x >= N || y >= N) continue;
      const [vx, vy] = view(x, y),
        [cx, cy] = scr(vx, vy, 0);
      // generous on every side: tall decor (trees, statues) and the faces of raised cells overflow the tile
      r[0] = Math.min(r[0], cx - TW - 3);
      r[2] = Math.max(r[2], cx + TW * 1.5 + 3);
      r[1] = Math.min(r[1], cy - LH * 4 - TW * 1.2);
      r[3] = Math.max(r[3], cy + TW + LH * 3 + 3);
    }
  DIRTY = DIRTY
    ? [Math.min(DIRTY[0], r[0]), Math.min(DIRTY[1], r[1]), Math.max(DIRTY[2], r[2]), Math.max(DIRTY[3], r[3])]
    : r;
  if (drawQ) return;
  drawQ = true;
  requestAnimationFrame(drawFrame);
}
// ---- render cache: the scene is drawn once, hover/preview overlays are drawn on a copy
const BC = document.createElement('canvas'),
  BX = BC.getContext('2d'),
  patchCanvas = document.createElement('canvas'),
  patchCtx = patchCanvas.getContext('2d');
let BOK = false,
  liteQ = false,
  BCAM = null,
  BHIDE = null,
  fullT = 0;
// overscan: the scene is rendered with a margin around the view, so panning never shows an empty edge
function ovs() {
  return Math.round(Math.min(420, Math.max(W, Hc) * 0.35));
}
function baseBegin(part) {
  const dpr = W ? cv.width / W : 1;
  if (part) {
    const M = BCAM.M;
    // Rasterise without a clip: cutting paths can change their antialiasing even
    // inside the dirty rectangle. Copy only the finished pixels to the cache.
    if (patchCanvas.width !== BC.width || patchCanvas.height !== BC.height) {
      patchCanvas.width = BC.width;
      patchCanvas.height = BC.height;
    }
    ctx = patchCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, patchCanvas.width, patchCanvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, M * dpr, M * dpr);
    return M;
  }
  const M = ovs(),
    w = Math.max(1, Math.round((W + 2 * M) * dpr)),
    h = Math.max(1, Math.round((Hc + 2 * M) * dpr));
  if (BC.width !== w || BC.height !== h) {
    BC.width = w;
    BC.height = h;
  }
  BX.setTransform(1, 0, 0, 1, 0, 0);
  BX.clearRect(0, 0, w, h);
  BX.setTransform(dpr, 0, 0, dpr, M * dpr, M * dpr);
  ctx = BX;
  return M;
}
function baseEnd(M) {
  const dpr = W ? cv.width / W : 1;
  BCAM = { ox, oy, TW, W, Hc, N, rot, hide: BHIDE, M, dpr };
  BOK = !!(cv.width && cv.height);
}
function drawOverlay() {
  if (painting && painting.area) {
    const A = painting.area,
      x0 = Math.max(0, Math.min(A.a.x, A.b.x)),
      x1 = Math.min(N - 1, Math.max(A.a.x, A.b.x)),
      y0 = Math.max(0, Math.min(A.a.y, A.b.y)),
      y1 = Math.min(N - 1, Math.max(A.a.y, A.b.y));
    ctx.beginPath();
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) {
        const [vx, vy] = view(x, y),
          p = tileCorners(vx, vy, Math.max(H[x][y], 0));
        ctx.moveTo(p[0][0], p[0][1]);
        ctx.lineTo(p[1][0], p[1][1]);
        ctx.lineTo(p[2][0], p[2][1]);
        ctx.lineTo(p[3][0], p[3][1]);
        ctx.closePath();
      }
    ctx.fillStyle = 'rgba(192,112,58,.35)';
    ctx.fill();
    ctx.strokeStyle = '#c0703a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (BHIDE && BCAM && BCAM.hide === BHIDE) {
    const k = tokens.find(x => x.id === BHIDE);
    if (k) drawTokAt(k);
  }
  if (hover && hover.x >= 0 && hover.y >= 0 && hover.x < N && hover.y < N && !(painting && painting.area)) {
    const [vx, vy] = view(hover.x, hover.y);
    poly(tileCorners(vx, vy, Math.max(H[hover.x][hover.y], 0)), 'rgba(192,112,58,.32)', '#c0703a', 2);
  }
  if (typeof drawTplGhost === 'function') drawTplGhost();
  if (typeof drawPlacePreview === 'function') drawPlacePreview();
  if (meas) drawMeas();
}
function baseFits() {
  return (
    BOK &&
    BCAM &&
    BCAM.W === W &&
    BCAM.Hc === Hc &&
    BCAM.dpr === (W ? cv.width / W : 1) &&
    BCAM.N === N &&
    BCAM.rot === rot
  );
}
function drawLiteNow() {
  if (!baseFits()) return drawNow();
  drawMoveNow();
}
function drawMoveNow() {
  if (!baseFits()) return drawNow();
  const f = TW / BCAM.TW,
    dx = ox - BCAM.ox * f,
    dy = oy - BCAM.oy * f;
  hoverInfo();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.restore();
  const m = BCAM.M;
  ctx.imageSmoothingEnabled = f !== 1;
  ctx.drawImage(BC, 0, 0, BC.width, BC.height, dx - m * f, dy - m * f, (BCAM.W + 2 * m) * f, (BCAM.Hc + 2 * m) * f);
  ctx.imageSmoothingEnabled = true;
  drawOverlay();
}
let moveQ = false;
function drawMove() {
  clearTimeout(fullT);
  fullT = setTimeout(draw, 90);
  if (BCAM && BCAM.TW === TW && (Math.abs(ox - BCAM.ox) > BCAM.M * 0.8 || Math.abs(oy - BCAM.oy) > BCAM.M * 0.8)) {
    clearTimeout(fullT);
    draw();
    return;
  }
  if (drawQ || moveQ) return;
  moveQ = true;
  requestAnimationFrame(() => {
    moveQ = false;
    if (!drawQ) drawMoveNow();
  });
}
function drawLite() {
  if (drawQ || liteQ) return;
  liteQ = true;
  requestAnimationFrame(() => {
    liteQ = false;
    if (!drawQ) drawLiteNow();
  });
}
const OBJT = {
  door: { n: ['Door', 'Porte'], tg: ['open', 'ouverte', 'closed', 'fermée'] },
  chest: { n: ['Chest', 'Coffre'], tg: ['open', 'ouvert', 'closed', 'fermé'] },
  table: { n: ['Table', 'Table'] },
  chair: { n: ['Chair', 'Chaise'] },
  bench: { n: ['Bench', 'Banc'] },
  barrel: { n: ['Barrel', 'Tonneau'] },
  crate: { n: ['Crate', 'Caisse'] },
  bed: { n: ['Bed', 'Lit'] },
  counter: { n: ['Counter', 'Comptoir'] },
  hearth: { n: ['Hearth', 'Âtre'] },
  shelf: { n: ['Bookshelf', 'Bibliothèque'] },
  statue: { n: ['Statue', 'Statue'] },
  altar: { n: ['Altar', 'Autel'] },
  brazier: { n: ['Brazier', 'Brasero'] },
  lever: { n: ['Lever', 'Levier'], tg: ['pulled', 'abaissé', 'up', 'levé'] },
  trap: { n: ['Trapdoor', 'Trappe'], tg: ['open', 'ouverte', 'closed', 'fermée'] },
  tent: { n: ['Tent', 'Tente'] },
  campfire: { n: ['Campfire', 'Feu de camp'] },
  sarco: { n: ['Sarcophagus', 'Sarcophage'], tg: ['open', 'ouvert', 'closed', 'fermé'] },
  well: { n: ['Well', 'Puits'] },
  cart: { n: ['Cart', 'Charrette'] },
  bones: { n: ['Bones', 'Ossements'] },
  crystal: { n: ['Crystals', 'Cristaux'] },
  throne: { n: ['Throne', 'Trône'] },
  cage: { n: ['Cage', 'Cage'], tg: ['open', 'ouverte', 'closed', 'fermée'] },
  rack: { n: ['Weapon rack', "Râtelier d'armes"] },
  stall: { n: ['Market stall', 'Étal'] },
  tree: { n: ['Tree', 'Arbre'] },
};
let objSel = 'door',
  prefSel = 'tavern',
  OBJR = 0,
  PREFP = null;
function objAt(x, y) {
  return OBJS.findIndex(o => o.x === x && o.y === y);
}
function objName(o) {
  const d = OBJT[o.k];
  if (!d) return '';
  return tr(d.n) + (d.tg ? ' (' + (lang === 'fr' ? (o.o ? d.tg[1] : d.tg[3]) : o.o ? d.tg[0] : d.tg[2]) + ')' : '');
}
function objToggle(c) {
  const i = objAt(c.x, c.y);
  if (i < 0 || !OBJT[OBJS[i].k].tg) return false;
  snap();
  OBJS[i].o = !OBJS[i].o;
  save();
  draw();
  return true;
}
function oP(cx, cy, u, v, z) {
  const [a, b] = tilePoint(cx, cy, u, v);
  return [a, b - z];
}
function obox(cx, cy, u0, v0, u1, v1, z0, z1, c, ln) {
  const P = (u, v, z) => oP(cx, cy, u, v, z),
    s = ln === 0 ? null : 'rgba(20,14,8,.55)';
  if (ISO()) poly([P(u1, v0, z0), P(u1, v1, z0), P(u1, v1, z1), P(u1, v0, z1)], mul(c, 0.7), s, 0.6);
  poly([P(u0, v1, z0), P(u1, v1, z0), P(u1, v1, z1), P(u0, v1, z1)], mul(c, 0.86), s, 0.6);
  poly([P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1)], c, s, 0.6);
}
function ocyl(cx, cy, u, v, r, z0, z1, c) {
  const [x, y] = tilePoint(cx, cy, u, v),
    radius = r * TW * 0.5,
    ry = radius * YR();
  ctx.fillStyle = mul(c, 0.8);
  ctx.strokeStyle = 'rgba(20,14,8,.55)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x - radius, y - z0);
  ctx.lineTo(x - radius, y - z1);
  ctx.ellipse(x, y - z1, radius, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + radius, y - z0);
  ctx.ellipse(x, y - z0, radius, ry, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(x, y - z1, radius, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
function doorAxis(x, y) {
  const w = (a, b) => ok(a, b) && (F[a][b] === 4 || H[a][b] >= 2);
  const gx = w(x - 1, y) || w(x + 1, y),
    gy = w(x, y - 1) || w(x, y + 1);
  const alongX = gx || !gy;
  return (alongX ? 0 : 1) ^ (rot % 2);
}
// hidden from players: the GM sees it faded
function drawObj(a, ...r) {
  if (!(a && a.hid)) return drawObj0(a, ...r);
  ctx.save();
  ctx.globalAlpha *= 0.4;
  const v = drawObj0(a, ...r);
  ctx.restore();
  return v;
}
function drawObj0(o, vx, vy, h) {
  const [cx, cy] = scr(vx, vy, h),
    Z = LH,
    k = o.k;
  if (k === 'door') {
    const ax = doorAxis(o.x, o.y),
      hz = Z * 1.9,
      wood = '#7a4f2c';
    if (!o.o) {
      if (ax === 0) obox(cx, cy, 0.04, 0.44, 0.96, 0.56, 0, hz, wood);
      else obox(cx, cy, 0.44, 0.04, 0.56, 0.96, 0, hz, wood);
      const [a, b] = ax === 0 ? oP(cx, cy, 0.75, 0.56, hz * 0.5) : oP(cx, cy, 0.56, 0.75, hz * 0.5);
      ctx.fillStyle = '#d8b24a';
      ctx.beginPath();
      ctx.arc(a, b, Math.max(1, TW * 0.025), 0, 7);
      ctx.fill();
    } else {
      if (ax === 0) obox(cx, cy, 0.04, 0.5, 0.14, 1, 0, hz, wood);
      else obox(cx, cy, 0.5, 0.04, 1, 0.14, 0, hz, wood);
    }
    return;
  }
  if (k === 'chest') {
    obox(cx, cy, 0.22, 0.3, 0.78, 0.7, 0, Z * 0.45, '#8a5a2b');
    if (o.o) {
      const [a, b] = oP(cx, cy, 0.5, 0.5, Z * 0.47);
      ctx.fillStyle = '#f2cf4a';
      ctx.beginPath();
      ctx.ellipse(a, b, TW * 0.12, TW * 0.05, 0, 0, 7);
      ctx.fill();
      obox(cx, cy, 0.22, 0.22, 0.78, 0.3, Z * 0.45, Z * 0.95, '#7a4c22');
    } else {
      obox(cx, cy, 0.22, 0.3, 0.78, 0.7, Z * 0.45, Z * 0.6, '#7a4c22');
      obox(cx, cy, 0.47, 0.68, 0.53, 0.72, Z * 0.3, Z * 0.5, '#d8b24a', 0);
    }
    return;
  }
  if (k === 'table') {
    for (const [u, v] of [
      [0.2, 0.2],
      [0.8, 0.2],
      [0.2, 0.8],
      [0.8, 0.8],
    ])
      obox(cx, cy, u - 0.04, v - 0.04, u + 0.04, v + 0.04, 0, Z * 0.55, '#5e3d22', 0);
    obox(cx, cy, 0.1, 0.1, 0.9, 0.9, Z * 0.55, Z * 0.68, '#a0703f');
    return;
  }
  if (k === 'chair') {
    const r = ((o.r || 0) - rot + 8) % 4;
    obox(cx, cy, 0.32, 0.32, 0.68, 0.68, 0, Z * 0.4, '#8b5e34');
    const B = [
      [0.32, 0.32, 0.68, 0.4],
      [0.6, 0.32, 0.68, 0.68],
      [0.32, 0.6, 0.68, 0.68],
      [0.32, 0.32, 0.4, 0.68],
    ][r];
    obox(cx, cy, B[0], B[1], B[2], B[3], Z * 0.4, Z * 0.95, '#7a4f2c');
    return;
  }
  if (k === 'bench') {
    if (((o.r || 0) - rot + 8) % 2) obox(cx, cy, 0.36, 0.08, 0.64, 0.92, 0, Z * 0.4, '#8b5e34');
    else obox(cx, cy, 0.08, 0.36, 0.92, 0.64, 0, Z * 0.4, '#8b5e34');
    return;
  }
  if (k === 'barrel') {
    ocyl(cx, cy, 0.5, 0.5, 0.34, 0, Z * 0.9, '#8a5a2b');
    const [x, y] = tilePoint(cx, cy, 0.5, 0.5);
    ctx.strokeStyle = '#3b2a1a';
    ctx.lineWidth = 1;
    for (const f of [0.25, 0.7]) {
      ctx.beginPath();
      ctx.ellipse(x, y - Z * 0.9 * f, TW * 0.17, TW * 0.17 * YR(), 0, 0, Math.PI);
      ctx.stroke();
    }
    return;
  }
  if (k === 'crate') {
    obox(cx, cy, 0.18, 0.18, 0.82, 0.82, 0, Z * 0.8, '#b08850');
    const P = (u, v, z) => oP(cx, cy, u, v, z);
    ctx.strokeStyle = 'rgba(60,40,20,.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(...P(0.82, 0.18, 0));
    ctx.lineTo(...P(0.82, 0.82, Z * 0.8));
    ctx.moveTo(...P(0.18, 0.82, 0));
    ctx.lineTo(...P(0.82, 0.82, Z * 0.8));
    ctx.stroke();
    return;
  }
  if (k === 'bed') {
    obox(cx, cy, 0.1, 0.12, 0.9, 0.88, 0, Z * 0.4, '#6b4428');
    obox(cx, cy, 0.14, 0.16, 0.86, 0.84, Z * 0.4, Z * 0.55, '#b9483e', 0);
    obox(cx, cy, 0.16, 0.18, 0.84, 0.38, Z * 0.55, Z * 0.68, '#efe8d8', 0);
    return;
  }
  if (k === 'counter') {
    obox(cx, cy, 0, 0.15, 1, 0.85, 0, Z * 1.05, '#7a4f2c');
    obox(cx, cy, 0, 0.12, 1, 0.88, Z * 1.05, Z * 1.15, '#a0703f');
    return;
  }
  if (k === 'hearth') {
    obox(cx, cy, 0.05, 0.05, 0.95, 0.95, 0, Z * 1.1, '#8d8a83');
    const [x, y] = oP(cx, cy, 0.5, 0.5, Z * 1.12);
    const g = ctx.createRadialGradient(x, y, 0, x, y, TW * 0.3);
    g.addColorStop(0, 'rgba(255,200,80,.95)');
    g.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, TW * 0.3, TW * 0.16, 0, 0, 7);
    ctx.fill();
    return;
  }
  if (k === 'shelf') {
    obox(cx, cy, 0.08, 0.3, 0.92, 0.7, 0, Z * 2, '#6b4428');
    const P = (u, z) => oP(cx, cy, u, 0.7, z);
    const cols = ['#8e2f2f', '#2f5f8e', '#3d7a3a', '#b08a2a'];
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 5; i++) {
        const u = 0.12 + i * 0.16,
          z = Z * (0.2 + r * 0.6);
        ctx.fillStyle = cols[(i + r) % 4];
        ctx.beginPath();
        const a = P(u, z),
          b = P(u + 0.12, z),
          c2 = P(u + 0.12, z + Z * 0.4),
          d = P(u, z + Z * 0.4);
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.lineTo(...c2);
        ctx.lineTo(...d);
        ctx.fill();
      }
    return;
  }
  if (k === 'statue') {
    obox(cx, cy, 0.2, 0.2, 0.8, 0.8, 0, Z * 0.4, '#9a968c');
    ocyl(cx, cy, 0.5, 0.5, 0.16, Z * 0.4, Z * 1.6, '#c8c3b6');
    const [x, y] = oP(cx, cy, 0.5, 0.5, Z * 1.85);
    ctx.fillStyle = '#c8c3b6';
    ctx.strokeStyle = 'rgba(20,14,8,.55)';
    ctx.beginPath();
    ctx.arc(x, y, TW * 0.08, 0, 7);
    ctx.fill();
    ctx.stroke();
    return;
  }
  if (k === 'altar') {
    obox(cx, cy, 0.12, 0.25, 0.88, 0.75, 0, Z * 0.8, '#d7d0c0');
    obox(cx, cy, 0.1, 0.22, 0.9, 0.78, Z * 0.8, Z * 0.92, '#8e2f2f', 0);
    const [x, y] = oP(cx, cy, 0.5, 0.5, Z * 0.95);
    ctx.fillStyle = '#f6e7a0';
    ctx.fillRect(x - 1, y - TW * 0.12, 2, TW * 0.12);
    return;
  }
  if (k === 'brazier') {
    ocyl(cx, cy, 0.5, 0.5, 0.08, 0, Z * 0.9, '#4a4038');
    ocyl(cx, cy, 0.5, 0.5, 0.26, Z * 0.9, Z * 1.1, '#5a4e44');
    const [x, y] = oP(cx, cy, 0.5, 0.5, Z * 1.15),
      tm = (performance.now() - t0) / 1000,
      f = reduce ? 1 : 1 + 0.12 * Math.sin(tm * 9 + o.x);
    ctx.fillStyle = '#ff8a2a';
    ctx.beginPath();
    ctx.moveTo(x - TW * 0.1, y);
    ctx.quadraticCurveTo(x, y - TW * 0.35 * f, x + TW * 0.1, y);
    ctx.fill();
    ctx.fillStyle = '#ffd36a';
    ctx.beginPath();
    ctx.moveTo(x - TW * 0.05, y);
    ctx.quadraticCurveTo(x, y - TW * 0.2 * f, x + TW * 0.05, y);
    ctx.fill();
    return;
  }
  if (k === 'lever') {
    obox(cx, cy, 0.35, 0.35, 0.65, 0.65, 0, Z * 0.25, '#6f6a60');
    const [a, b] = oP(cx, cy, 0.5, 0.5, Z * 0.25),
      [c2, d] = o.o ? oP(cx, cy, 0.85, 0.5, Z * 0.5) : oP(cx, cy, 0.3, 0.5, Z * 1.1);
    ctx.strokeStyle = '#3b2a1a';
    ctx.lineWidth = Math.max(1.5, TW * 0.04);
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c2, d);
    ctx.stroke();
    ctx.fillStyle = '#b9483e';
    ctx.beginPath();
    ctx.arc(c2, d, Math.max(1.5, TW * 0.05), 0, 7);
    ctx.fill();
    return;
  }
  if (k === 'trap') {
    const P = (u, v) => oP(cx, cy, u, v, 0.5);
    if (o.o) {
      poly([P(0.15, 0.15), P(0.85, 0.15), P(0.85, 0.85), P(0.15, 0.85)], '#120d09');
      obox(cx, cy, 0.15, 0.05, 0.85, 0.15, 0, Z * 0.8, '#6b4428');
    } else {
      poly([P(0.15, 0.15), P(0.85, 0.15), P(0.85, 0.85), P(0.15, 0.85)], '#6b4428', 'rgba(20,14,8,.7)', 1);
      ctx.strokeStyle = 'rgba(20,14,8,.5)';
      ctx.beginPath();
      ctx.moveTo(...P(0.5, 0.15));
      ctx.lineTo(...P(0.5, 0.85));
      ctx.stroke();
    }
    return;
  }
  const ax = ((o.r || 0) - rot + 8) % 2,
    P = (u, v, z) => oP(cx, cy, u, v, z),
    flame = (u, v, z, s) => {
      const [x, y] = P(u, v, z),
        tm = (performance.now() - t0) / 1000,
        f = reduce ? 1 : 1 + 0.12 * Math.sin(tm * 9 + o.x + o.y);
      ctx.fillStyle = '#ff8a2a';
      ctx.beginPath();
      ctx.moveTo(x - TW * 0.1 * s, y);
      ctx.quadraticCurveTo(x, y - TW * 0.35 * s * f, x + TW * 0.1 * s, y);
      ctx.fill();
      ctx.fillStyle = '#ffd36a';
      ctx.beginPath();
      ctx.moveTo(x - TW * 0.05 * s, y);
      ctx.quadraticCurveTo(x, y - TW * 0.2 * s * f, x + TW * 0.05 * s, y);
      ctx.fill();
    };
  if (k === 'tent') {
    // a ridge tent; its ridge follows the rotation
    const c1 = '#c9b48a',
      c2 = '#a8915f',
      hz = Z * 1.25;
    if (ax) {
      poly([P(0.1, 0.1, 0), P(0.5, 0.1, hz), P(0.5, 0.9, hz), P(0.1, 0.9, 0)], c2, 'rgba(20,14,8,.5)', 0.8);
      poly([P(0.9, 0.1, 0), P(0.5, 0.1, hz), P(0.5, 0.9, hz), P(0.9, 0.9, 0)], c1, 'rgba(20,14,8,.5)', 0.8);
      poly([P(0.1, 0.9, 0), P(0.5, 0.9, hz), P(0.9, 0.9, 0)], '#8a7448', 'rgba(20,14,8,.5)', 0.8);
      poly([P(0.42, 0.9, 0), P(0.5, 0.9, hz * 0.6), P(0.58, 0.9, 0)], '#2a2219');
    } else {
      poly([P(0.1, 0.1, 0), P(0.1, 0.5, hz), P(0.9, 0.5, hz), P(0.9, 0.1, 0)], c2, 'rgba(20,14,8,.5)', 0.8);
      poly([P(0.1, 0.9, 0), P(0.1, 0.5, hz), P(0.9, 0.5, hz), P(0.9, 0.9, 0)], c1, 'rgba(20,14,8,.5)', 0.8);
      poly([P(0.9, 0.1, 0), P(0.9, 0.5, hz), P(0.9, 0.9, 0)], '#8a7448', 'rgba(20,14,8,.5)', 0.8);
      poly([P(0.9, 0.42, 0), P(0.9, 0.5, hz * 0.6), P(0.9, 0.58, 0)], '#2a2219');
    }
    return;
  }
  if (k === 'campfire') {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ocyl(cx, cy, 0.5 + Math.cos(a) * 0.28, 0.5 + Math.sin(a) * 0.28, 0.08, 0, Z * 0.12, '#7d776e');
    }
    obox(cx, cy, 0.3, 0.45, 0.7, 0.55, 0, Z * 0.1, '#5a3a1e', 0);
    obox(cx, cy, 0.45, 0.3, 0.55, 0.7, Z * 0.1, Z * 0.2, '#6b4428', 0);
    flame(0.5, 0.5, Z * 0.2, 1.1);
    return;
  }
  if (k === 'sarco') {
    const [u0, v0, u1, v1] = ax ? [0.28, 0.1, 0.72, 0.9] : [0.1, 0.28, 0.9, 0.72];
    obox(cx, cy, u0, v0, u1, v1, 0, Z * 0.55, '#a7a194');
    if (o.o) obox(cx, cy, u0 + 0.15, v0 - 0.05, u1 + 0.15, v1 - 0.05, Z * 0.55, Z * 0.68, '#c5bfb1');
    else {
      obox(cx, cy, u0 - 0.03, v0 - 0.03, u1 + 0.03, v1 + 0.03, Z * 0.55, Z * 0.68, '#c5bfb1');
      const [x, y] = P(0.5, 0.5, Z * 0.7);
      ctx.strokeStyle = 'rgba(60,50,40,.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - TW * 0.08, y);
      ctx.lineTo(x + TW * 0.08, y);
      ctx.moveTo(x, y - TW * 0.05);
      ctx.lineTo(x, y + TW * 0.05);
      ctx.stroke();
    }
    return;
  }
  if (k === 'well') {
    ocyl(cx, cy, 0.5, 0.5, 0.36, 0, Z * 0.55, '#8d8a83');
    const [x, y] = tilePoint(cx, cy, 0.5, 0.5);
    ctx.fillStyle = '#1d3a52';
    ctx.beginPath();
    ctx.ellipse(x, y - Z * 0.56, TW * 0.13, TW * 0.13 * YR(), 0, 0, 7);
    ctx.fill();
    obox(cx, cy, 0.17, 0.46, 0.23, 0.54, Z * 0.55, Z * 1.5, '#6b4428', 0);
    obox(cx, cy, 0.77, 0.46, 0.83, 0.54, Z * 0.55, Z * 1.5, '#6b4428', 0);
    obox(cx, cy, 0.17, 0.47, 0.83, 0.53, Z * 1.4, Z * 1.5, '#7a4f2c', 0);
    return;
  }
  if (k === 'cart') {
    ctx.fillStyle = '#3b2a1a';
    for (const d of [-1, 1]) {
      const [x, y] = P(0.5 + (ax ? d * 0.27 : 0), 0.5 + (ax ? 0 : d * 0.27), Z * 0.25);
      ctx.beginPath();
      ctx.ellipse(x, y, TW * 0.06, TW * 0.13, ax ? 0 : Math.PI / 2, 0, 7);
      ctx.fill();
    }
    if (ax) obox(cx, cy, 0.25, 0.08, 0.75, 0.92, Z * 0.3, Z * 0.75, '#a0703f');
    else obox(cx, cy, 0.08, 0.25, 0.92, 0.75, Z * 0.3, Z * 0.75, '#a0703f');
    return;
  }
  if (k === 'bones') {
    ctx.strokeStyle = '#e9e2cf';
    ctx.lineWidth = Math.max(1.5, TW * 0.03);
    ctx.lineCap = 'round';
    for (const [a, b, c2, d] of [
      [0.25, 0.3, 0.55, 0.4],
      [0.5, 0.6, 0.75, 0.5],
      [0.3, 0.7, 0.45, 0.55],
    ]) {
      ctx.beginPath();
      ctx.moveTo(...P(a, b, 1));
      ctx.lineTo(...P(c2, d, 1));
      ctx.stroke();
    }
    const [x, y] = P(0.62, 0.32, Z * 0.12);
    ctx.fillStyle = '#efe8d6';
    ctx.beginPath();
    ctx.arc(x, y, TW * 0.07, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#2a2219';
    ctx.fillRect(x - TW * 0.03, y - TW * 0.01, TW * 0.02, TW * 0.02);
    ctx.fillRect(x + TW * 0.01, y - TW * 0.01, TW * 0.02, TW * 0.02);
    ctx.lineCap = 'butt';
    return;
  }
  if (k === 'crystal') {
    for (const [u, v, hh, w] of [
      [0.5, 0.45, 1.6, 0.09],
      [0.32, 0.6, 1.0, 0.07],
      [0.66, 0.62, 1.2, 0.07],
    ]) {
      const b1 = P(u - w, v, 0),
        b2 = P(u + w, v, 0),
        b3 = P(u, v + w, 0),
        tp = P(u, v, Z * hh);
      poly([b1, b3, tp], '#5fc7d9', 'rgba(255,255,255,.6)', 0.8);
      poly([b3, b2, tp], '#3a9db8', 'rgba(255,255,255,.6)', 0.8);
    }
    return;
  }
  if (k === 'throne') {
    const r = ((o.r || 0) - rot + 8) % 4;
    obox(cx, cy, 0.2, 0.2, 0.8, 0.8, 0, Z * 0.5, '#8a6a2a');
    obox(cx, cy, 0.25, 0.25, 0.75, 0.75, Z * 0.5, Z * 0.6, '#9c2f25', 0);
    const Bk = [
      [0.2, 0.2, 0.8, 0.32],
      [0.68, 0.2, 0.8, 0.8],
      [0.2, 0.68, 0.8, 0.8],
      [0.2, 0.2, 0.32, 0.8],
    ][r];
    obox(cx, cy, Bk[0], Bk[1], Bk[2], Bk[3], Z * 0.5, Z * 1.8, '#c9a23a');
    return;
  }
  if (k === 'cage') {
    ctx.strokeStyle = '#3d3934';
    ctx.lineWidth = Math.max(1, TW * 0.02);
    const hz = Z * 1.5,
      pts = [];
    for (let i = 0; i <= 4; i++)
      pts.push([0.15 + i * 0.175, 0.15], [0.85, 0.15 + i * 0.175], [0.15 + i * 0.175, 0.85], [0.15, 0.15 + i * 0.175]);
    for (const [u, v] of pts) {
      if (o.o && v === 0.85 && u > 0.3 && u < 0.7) continue;
      ctx.beginPath();
      ctx.moveTo(...P(u, v, 0));
      ctx.lineTo(...P(u, v, hz));
      ctx.stroke();
    }
    poly([P(0.15, 0.15, hz), P(0.85, 0.15, hz), P(0.85, 0.85, hz), P(0.15, 0.85, hz)], null, '#3d3934', 1.5);
    return;
  }
  if (k === 'rack') {
    if (ax) obox(cx, cy, 0.44, 0.08, 0.56, 0.92, 0, Z * 1.3, '#6b4428');
    else obox(cx, cy, 0.08, 0.44, 0.92, 0.56, 0, Z * 1.3, '#6b4428');
    ctx.strokeStyle = '#b8bec4';
    ctx.lineWidth = Math.max(1.5, TW * 0.025);
    for (const s of [0.25, 0.5, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(...(ax ? P(0.4, s, Z * 0.2) : P(s, 0.4, Z * 0.2)));
      ctx.lineTo(...(ax ? P(0.4, s, Z * 1.7) : P(s, 0.4, Z * 1.7)));
      ctx.stroke();
    }
    return;
  }
  if (k === 'stall') {
    if (ax) obox(cx, cy, 0.2, 0.05, 0.8, 0.95, 0, Z * 0.8, '#8b5e34');
    else obox(cx, cy, 0.05, 0.2, 0.95, 0.8, 0, Z * 0.8, '#8b5e34');
    for (const [u, v, c2] of [
      [0.35, 0.35, '#c0392b'],
      [0.6, 0.5, '#e0a030'],
      [0.45, 0.65, '#6a9a3a'],
    ]) {
      const [x, y] = P(u, v, Z * 0.85);
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.arc(x, y, TW * 0.05, 0, 7);
      ctx.fill();
    }
    const hz = Z * 1.9,
      st = ['#b8312f', '#efe6d2'];
    for (let i = 0; i < 4; i++) {
      const a = i / 4,
        b = (i + 1) / 4;
      poly(
        ax
          ? [P(0.15, a, hz), P(0.15, b, hz), P(0.85, b, hz * 0.85), P(0.85, a, hz * 0.85)]
          : [P(a, 0.15, hz), P(b, 0.15, hz), P(b, 0.85, hz * 0.85), P(a, 0.85, hz * 0.85)],
        st[i % 2],
        'rgba(20,14,8,.35)',
        0.6,
      );
    }
    return;
  }
  if (k === 'tree') {
    ocyl(cx, cy, 0.5, 0.5, 0.1, 0, Z * 1.2, '#6b4428');
    const [x, y] = P(0.5, 0.5, Z * 2.1),
      g = ctx.createRadialGradient(x - TW * 0.08, y - TW * 0.1, TW * 0.04, x, y, TW * 0.42);
    g.addColorStop(0, '#7fb04f');
    g.addColorStop(1, '#3d6a2a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, TW * 0.4, TW * 0.34, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,30,10,.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }
}
// ---- prefabs
const PREF = {
  tavern: ['Tavern', 'Taverne'],
  house: ['House', 'Maison'],
  shop: ['Shop', 'Échoppe'],
  forge: ['Forge', 'Forge'],
  chapel: ['Chapel', 'Chapelle'],
  tower: ['Watchtower', 'Tour de guet'],
  barn: ['Barn', 'Grange'],
};
function prefGen(k, rr) {
  const ri = n => Math.floor(rr() * n),
    G = [],
    O = [];
  let w, h;
  const sz = {
    tavern: [9, 7, 3, 2],
    house: [5, 4, 2, 2],
    shop: [6, 5, 2, 2],
    forge: [7, 5, 2, 2],
    chapel: [6, 10, 1, 3],
    tower: [5, 5, 0, 1],
    barn: [8, 6, 3, 2],
  }[k];
  w = sz[0] + ri(sz[2] + 1);
  h = sz[1] + ri(sz[3] + 1);
  for (let x = 0; x < w; x++) {
    G[x] = [];
    for (let y = 0; y < h; y++) G[x][y] = x === 0 || y === 0 || x === w - 1 || y === h - 1 ? 'W' : '.';
  }
  const put = (x, y, kk, o) => {
    if (x > 0 && y > 0 && x < w - 1 && y < h - 1 && G[x][y] === '.' && !O.some(q => q.x === x && q.y === y)) {
      O.push({ x, y, k: kk, o: !!o });
      return true;
    }
    return false;
  };
  const door = (x, y) => {
    G[x][y] = 'D';
    O.push({ x, y, k: 'door', o: false });
  };
  const free = (x, y) =>
    x > 0 && y > 0 && x < w - 1 && y < h - 1 && G[x][y] === '.' && !O.some(q => q.x === x && q.y === y);
  const fd = 1 + ri(w - 2);
  door(fd, h - 1);
  if (k === 'tavern') {
    const kx = w - 4;
    for (let y = 1; y < h - 1; y++) G[kx][y] = 'W';
    const kd = 1 + ri(h - 2);
    door(kx, kd);
    for (let y = 1; y < h - 1; y++) if (y !== kd && rr() < 0.9) put(kx - 1, y, 'counter');
    put(kx + 1 + ri(2), 1, 'hearth');
    for (let i = 0; i < 5; i++) put(kx + 1 + ri(2), 1 + ri(h - 2), rr() < 0.5 ? 'barrel' : 'crate');
    for (let y = 2; y < h - 2; y += 3)
      for (let x = 2; x < kx - 2; x += 3)
        if (rr() < 0.85) {
          put(x, y, 'table');
          put(x + 1, y, 'chair');
          put(x - 1, y, 'chair');
          if (rr() < 0.5) put(x, y + 1, 'chair');
        }
    if (rr() < 0.7) put(1, 1, 'hearth');
    put(1, h - 2, 'barrel');
    if (rr() < 0.5) put(kx - 1, h - 2, 'chest');
  } else if (k === 'house') {
    put(1, 1, 'bed');
    if (w > 5) put(2, 1, 'bed');
    put(w - 2, 1, 'hearth');
    const tx = 2 + ri(Math.max(1, w - 4)),
      ty = Math.min(h - 3, 2);
    if (put(tx, ty, 'table')) {
      put(tx + 1, ty, 'chair');
      put(tx - 1, ty, 'chair');
    }
    put(1, h - 2, 'chest');
    if (rr() < 0.6) put(w - 2, h - 2, 'barrel');
    if (rr() < 0.4) put(w - 2, 2, 'shelf');
  } else if (k === 'shop') {
    for (let x = 1; x < w - 1; x++) if (Math.abs(x - fd) > 0 && rr() < 0.9) put(x, h - 3, 'counter');
    for (let x = 1; x < w - 1; x++) put(x, 1, rr() < 0.6 ? 'shelf' : 'crate');
    put(1, 2, 'chest');
    if (rr() < 0.6) put(w - 2, 2, 'barrel');
  } else if (k === 'forge') {
    put(1, 1, 'hearth');
    put(2, 1, 'hearth');
    put(3, 2, 'statue');
    put(w - 2, 1, 'barrel');
    put(w - 2, 2, 'crate');
    put(w - 3, 1, 'crate');
    put(1, h - 2, 'chest');
    if (rr() < 0.5) put(w - 2, h - 2, 'brazier');
    const t = put(4, 1, 'table');
  } else if (k === 'chapel') {
    G[fd][h - 1] = 'W';
    O.splice(
      O.findIndex(q => q.k === 'door'),
      1,
    );
    const cxm = Math.floor(w / 2);
    door(cxm, h - 1);
    put(cxm, 1, 'altar');
    put(cxm - 1, 1, 'brazier');
    put(cxm + 1, 1, 'brazier');
    for (let y = 3; y < h - 2; y += 2) {
      for (let x = 1; x < w - 1; x++) if (x !== cxm && (w % 2 || x !== cxm - 1)) put(x, y, 'bench');
    }
    if (rr() < 0.6) {
      put(1, 1, 'statue');
      put(w - 2, 1, 'statue');
    }
  } else if (k === 'tower') {
    put(1, 1, 'brazier');
    put(w - 2, 1, 'crate');
    put(w - 2, h - 2, 'barrel');
    put(1, h - 2, 'chest');
    put(2, 2, 'trap');
    if (rr() < 0.5) put(w - 2, 2, 'lever');
  } else if (k === 'barn') {
    const bd = 1 + ri(w - 2);
    if (G[bd][0] === 'W') {
      door(bd, 0);
    }
    for (let i = 0; i < Math.round((w * h) / 5); i++) {
      const x = 1 + ri(w - 2),
        y = 1 + ri(h - 2);
      if (free(x, y) && Math.abs(x - fd) + Math.abs(y - (h - 1)) > 1) put(x, y, rr() < 0.5 ? 'crate' : 'barrel');
    }
  }
  return { w, h, G, O, wh: k === 'tower' ? 3 : 2 };
}
function prefLay(c, P, r) {
  const W = r % 2 ? P.h : P.w,
    Hh = r % 2 ? P.w : P.h;
  return {
    W,
    Hh,
    x0: Math.max(0, Math.min(N - W, c.x - Math.floor(W / 2))),
    y0: Math.max(0, Math.min(N - Hh, c.y - Math.floor(Hh / 2))),
    tf: (x, y) =>
      r === 0 ? [x, y] : r === 1 ? [P.h - 1 - y, x] : r === 2 ? [P.w - 1 - x, P.h - 1 - y] : [y, P.w - 1 - x],
  };
}
function prefPend() {
  if (!PREFP || PREFP.k !== prefSel) PREFP = { k: prefSel, P: prefGen(prefSel, Math.random), r: PREFP ? PREFP.r : 0 };
  return PREFP;
}
function prefPlace(c, k, quiet, pend) {
  const rr = Math.random,
    P = pend ? pend.P : prefGen(k, rr),
    r = pend ? pend.r : Math.floor(rr() * 4);
  const tf = (x, y) =>
    r === 0 ? [x, y] : r === 1 ? [P.h - 1 - y, x] : r === 2 ? [P.w - 1 - x, P.h - 1 - y] : [y, P.w - 1 - x];
  const W = r % 2 ? P.h : P.w,
    Hh = r % 2 ? P.w : P.h;
  const x0 = Math.max(0, Math.min(N - W, c.x - Math.floor(W / 2))),
    y0 = Math.max(0, Math.min(N - Hh, c.y - Math.floor(Hh / 2)));
  if (W > N || Hh > N) return false;
  if (!quiet) snap();
  for (let x = x0 - 1; x <= x0 + W; x++)
    for (let y = y0 - 1; y <= y0 + Hh; y++) {
      if (!ok(x, y)) continue;
      const inn = x >= x0 && y >= y0 && x < x0 + W && y < y0 + Hh;
      if (inn || H[x][y] < 0 || F[x][y] === 4 || F[x][y] === 5) {
        H[x][y] = 0;
        if (F[x][y] === 4 || F[x][y] === 5 || inn) F[x][y] = 0;
      }
      delete ENV[x + ',' + y];
    }
  OBJS = OBJS.filter(o => !(o.x >= x0 - 1 && o.y >= y0 - 1 && o.x <= x0 + W && o.y <= y0 + Hh));
  for (let x = 0; x < P.w; x++)
    for (let y = 0; y < P.h; y++) {
      const [a, b] = tf(x, y),
        gx = x0 + a,
        gy = y0 + b,
        g = P.G[x][y];
      if (g === 'W') {
        H[gx][gy] = P.wh;
        F[gx][gy] = 4;
      } else {
        H[gx][gy] = 0;
        F[gx][gy] = 3;
      }
    }
  for (const o of P.O) {
    const [a, b] = tf(o.x, o.y);
    OBJS.push({ x: x0 + a, y: y0 + b, k: o.k, o: o.o });
  }
  tokens = tokens.filter(t => {
    const n = tfp(t);
    for (let i = t.x; i < t.x + n; i++) for (let j = t.y; j < t.y + n; j++) if (ok(i, j) && F[i][j] === 4) return false;
    return true;
  });
  if (!quiet) {
    save();
    draw();
  }
  return { x0, y0, W, Hh };
}

function fillObj() {
  const a = document.getElementById('objk'),
    b = document.getElementById('prefk');
  if (a)
    a.innerHTML = Object.keys(OBJT)
      .map(k => `<option value="${k}"${k === objSel ? ' selected' : ''}>${esc(tr(OBJT[k].n))}</option>`)
      .join('');
  if (b)
    b.innerHTML = Object.keys(PREF)
      .map(k => `<option value="${k}"${k === prefSel ? ' selected' : ''}>${esc(tr(PREF[k]))}</option>`)
      .join('');
}
// ---- tile sprites: each tile top (colour, grid line, texture) is drawn once per zoom level, then stamped
const TVAR = 6,
  TILES = new Map();
let TILEK = '';
function tile(fc, line, tx, f, v, cx, cy) {
  const dpr = cv.width / Math.max(1, W),
    k = TW.toFixed(2) + '|' + dpr + '|' + bio + '|' + PROJ;
  if (k !== TILEK) {
    TILES.clear();
    TILEK = k;
  }
  const key = fc + '|' + (line ? 1 : 0) + '|' + tx + '|' + (tx === 1 ? f : 0) + '|' + v,
    pad = Math.ceil(TW * 0.12) + 2;
  let sp = TILES.get(key);
  if (!sp) {
    sp = document.createElement('canvas');
    sp.width = Math.ceil((TW + 4) * dpr);
    sp.height = Math.ceil(((ISO() ? TW / 2 : TW) + pad + 2) * dpr);
    const g = sp.getContext('2d'),
      keep = ctx;
    ctx = g;
    try {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const x0 = ISO() ? TW / 2 + 2 : 2,
        y0 = pad,
        t = tileQuad(x0, y0);
      poly(t, fc, line ? 'rgba(0,0,0,.14)' : null);
      if (tx === 1) ftex(f, t, v, 0);
      else if (tx === 2) specks(x0, y0, v, 1);
    } finally {
      ctx = keep;
    }
    if (TILES.size > 600) TILES.clear();
    TILES.set(key, sp);
  }
  ctx.drawImage(sp, cx - (ISO() ? TW / 2 : 0) - 2, cy - pad, sp.width / dpr, sp.height / dpr);
}
function hoverInfo() {
  const b = B[bio];
  if (hover) {
    const ti = tokAt(hover),
      tk = ti >= 0 ? tokens[ti] : null;
    const mk = MARKS.findIndex(m => m.x === hover.x && m.y === hover.y);
    if (mk >= 0 && !(tokAt(hover) >= 0)) {
      info.textContent = `${t('t_mark')} ${mk + 1} · ${MARKS[mk].l || t('mk_ph')}`;
    } else
      info.textContent =
        (tool === 'place' && placing ? `${t('placing')}: ${tr(placing.n)} (${t('stop')}) · ` : '') +
        (tk && tk.nm && tk.st
          ? `${tr(tk.nm)} ${tk.num || ''} · ${tk.st === 'd' ? L2('down', 'à terre') : tk.st === 'b' ? L2('wounded', 'blessé') : L2('unhurt', 'indemne')}`
          : tk && tk.nm
            ? `${tr(tk.nm)} ${tk.num || ''} · ${t('esq')} ${tk.esq} · ${t('thr')} ${tk.maj}/${tk.sev} · ${t('box')} ${tk.hp}/${tk.hpMax}`
            : `${tr(b.n)} · ${t('tile')} ${hover.x + 1}, ${hover.y + 1} — ${label(H[hover.x][hover.y], F[hover.x][hover.y])}${H[hover.x][hover.y] > 0 ? ' · ' + tr(ELEV[H[hover.x][hover.y]]) : ''}${objAt(hover.x, hover.y) >= 0 ? ' · ' + objName(OBJS[objAt(hover.x, hover.y)]) : ''}${envOf(hover.x + ',' + hover.y) ? ` · ${tr(ENVT[envOf(hover.x + ',' + hover.y).k].n)} : ${envRule(envOf(hover.x + ',' + hover.y))}` : ''}`);
  } else
    info.textContent =
      tool === 'place' && placing
        ? `${t('placing')}: ${tr(placing.n)}. ${t('click_tile')}`
        : tool === 'measure'
          ? t('meas_hint')
          : t('hover');
}
let STBG = '';
let FADEK = '',
  SEETHRU = lsGet('luparis-seethru', true) !== false;
// cells that would hide a token: raised cells (walls, rocks, trees) or objects just in front of it, on screen
function fadeCells() {
  const out = new Set();
  if (!ISO() || !SEETHRU) return out;
  const objCells = new Set(OBJS.map(o => o.x * 4096 + o.y));
  for (const k of tokens) {
    if (k.x < 0 || k.y < 0 || k.x >= N || k.y >= N) continue;
    const [tvx, tvy] = view(k.x, k.y),
      th = Math.max(H[k.x][k.y], 0);
    for (let d = 1; d <= 6; d++)
      for (let e = -1; e <= 1; e++) {
        if ((d + e) & 1) continue;
        const vx = tvx + (d + e) / 2,
          vy = tvy + (d - e) / 2;
        if (vx < 0 || vy < 0 || vx >= N || vy >= N) continue;
        const [x, y] = unview(vx, vy),
          h = Math.max(H[x][y], 0) - th + (objCells.has(x * 4096 + y) ? 2 : 0);
        // a cell of height h covers about 1.1 h + 2 quarter-tiles of what stands behind it
        if (h > 0 && d < 1.12 * h + 2) out.add(x * 4096 + y);
      }
  }
  return out;
}
function drawNow(partOk) {
  if (!W || !Hc) return;
  const b = B[bio],
    lod = TW >= 9,
    lodS = TW >= 5;
  // see-through walls: in isometric view, raised cells and objects drawn in front of a token are faded
  const fade = fadeCells(),
    fadeK = [...fade].join(',');
  let part =
    partOk &&
    DIRTY &&
    baseFits() &&
    BCAM.ox === ox &&
    BCAM.oy === oy &&
    BCAM.TW === TW &&
    BCAM.hide === (drag !== null && tokens[drag] ? tokens[drag].id : null)
      ? DIRTY
      : null;
  if (fadeK !== FADEK) part = null;
  FADEK = fadeK;
  DIRTY = null;
  hoverInfo();
  {
    const bg = `radial-gradient(ellipse at 50% 40%,${mul(b.bg[0], 0.36)},${mul(b.bg[1], 0.24)})`;
    if (bg !== STBG) {
      STBG = bg;
      stage.style.background = bg;
    }
  }
  const MAINX = ctx,
    M = baseBegin(part);
  const spAnim = b.sp && b.sp.k === 'ember';
  BHIDE = drag !== null && tokens[drag] ? tokens[drag].id : null;
  const TKM = new Map(),
    EM = new Map();
  for (const e in ENV) {
    const i = e.indexOf(',');
    EM.set(+e.slice(0, i) * 4096 + +e.slice(i + 1), ENV[e]);
  }
  for (const k of tokens) {
    if (k.id === BHIDE) continue;
    const a = tokAnchor(k),
      kk = a[0] * 4096 + a[1];
    if (!TKM.has(kk)) TKM.set(kk, []);
    TKM.get(kk).push(k);
  }
  const CL = part ? part[0] : -M,
    CR = part ? part[2] : W + M,
    CT = part ? part[1] : -M,
    CB = part ? part[3] + TW * 2 : Hc + M;
  const OM = new Map();
  for (const o of OBJS) OM.set(o.x * 4096 + o.y, o);
  for (const c of cells()) {
    const h = H[c.x][c.y],
      { vx, vy } = c;
    {
      const [sx, sy] = scr(vx, vy, 0);
      if (sx < CL - TW || sx > CR + TW || sy < CT - TW - LH * 4 || sy > CB + TW + LH * 3) continue;
    }
    ctx.globalAlpha = fade.has(c.x * 4096 + c.y) ? 0.32 : 1;
    if (h < 0) pit(c, h);
    else {
      const f = F[c.x][c.y],
        t = tileCorners(vx, vy, h);
      if (h > 0) {
        const g = tileCorners(vx, vy, 0),
          sc = f === 4 ? FW.side[h - 1] : f === 5 ? '#6a4a2e' : FSIDE[f] ? FSIDE[f] : b.side[h - 1];
        poly([t[3], t[2], g[2], g[3]], mul(sc, ISO() ? 0.9 : 0.86), 'rgba(0,0,0,.25)');
        if (ISO()) poly([t[2], t[1], g[1], g[2]], mul(sc, 0.72), 'rgba(0,0,0,.25)');
        if (b.brick) {
          ctx.strokeStyle = 'rgba(0,0,0,.25)';
          ctx.lineWidth = 1;
          for (let i = 1; i <= h * 2; i++) {
            const f = i / (h * 2 + 1);
            ctx.beginPath();
            ctx.moveTo(t[3][0], t[3][1] + (g[3][1] - t[3][1]) * f);
            ctx.lineTo(t[2][0], t[2][1] + (g[2][1] - t[2][1]) * f);
            if (ISO()) ctx.lineTo(t[1][0], t[1][1] + (g[1][1] - t[1][1]) * f);
            ctx.stroke();
          }
        }
      }
      const chk = (c.x + c.y) % 2,
        fc = f ? FC[f][chk] : h > 0 ? b.top[h - 1] : b.g[chk],
        tx = lod ? (f ? 1 : h === 0 && !spAnim ? 2 : 0) : 0;
      if (f || h > 0 || !lod || !spAnim)
        tile(fc, lodS, tx, f, tx ? (rnd(c.x, c.y, 77) * TVAR) | 0 : 0, t[0][0], t[0][1]);
      else {
        poly(t, fc, lodS ? 'rgba(0,0,0,.14)' : null);
        specks(t[0][0], t[0][1], c.x, c.y);
      }
      if (h > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(...t[3]);
        ctx.lineTo(...t[0]);
        ctx.lineTo(...t[1]);
        ctx.stroke();
      }
    }

    if (h > 0 && !F[c.x][c.y] && TW >= 7) {
      const [cx, cy] = scr(vx, vy, h);
      deco(b.deco[h - 1], cx, cy, h, c.x, c.y);
    }
    const ck = c.x * 4096 + c.y;
    {
      const ek = EM.get(ck);
      if (ek) drawEnv(ek, vx, vy, h, c.x, c.y);
    }
    {
      const ob = OM.get(ck);
      if (ob && h >= 0 && TW >= 4) drawObj(ob, vx, vy, h);
    }
    ctx.globalAlpha = 1;
    {
      const tl = TKM.get(ck);
      if (tl) for (const k of tl) drawTokAt(k);
    }
  }
  ctx.globalAlpha = 1;
  drawFloat();
  if (typeof drawTpls === 'function') drawTpls();
  drawMarks();
  if (part) {
    const dpr = BCAM.dpr,
      x = Math.max(0, Math.floor((part[0] + M) * dpr)),
      y = Math.max(0, Math.floor((part[1] + M) * dpr)),
      w = Math.min(BC.width, Math.ceil((part[2] + M) * dpr)) - x,
      h = Math.min(BC.height, Math.ceil((part[3] + M) * dpr)) - y;
    if (w > 0 && h > 0) {
      BX.save();
      BX.setTransform(1, 0, 0, 1, 0, 0);
      BX.clearRect(x, y, w, h);
      BX.drawImage(patchCanvas, x, y, w, h, x, y, w, h);
      BX.restore();
    }
  }
  ctx = MAINX;
  baseEnd(M);
  drawMoveNow();
  if (hasAnim() || (bio === 'volcan' && !reduce)) requestAnimationFrame(tick);
}
function ctr(c) {
  const [vx, vy] = view(c.x, c.y),
    h = Math.max(H[c.x][c.y], 0);
  return scr(vx + 0.5, vy + 0.5, h);
}
const ENVT = {
  fire: {
    n: ['Flames', 'Flammes'],
    c: 'rgba(255,110,30,.5)',
    r: [
      'Entering or starting a turn here: 1 box (Physical Resilience save DC 12 avoids it).',
      "Entrer ou commencer son tour ici : 1 case (sauvegarde de Résistance physique DD 12 pour l'éviter).",
    ],
  },
  acid: {
    n: ['Acid', 'Acide'],
    c: 'rgba(120,220,40,.5)',
    r: [
      'Entering: 1 box, armor counts as 2 lower until repaired (Physical Finesse DC 12 avoids it).',
      "En entrant : 1 case, l'armure compte 2 de moins jusqu'à réparation (Finesse physique DD 12 pour l'éviter).",
    ],
  },
  ice: {
    n: ['Ice', 'Glace'],
    c: 'rgba(190,235,255,.55)',
    r: [
      'Difficult terrain. Moving more than half speed: Physical Finesse DC 10 or fall prone.',
      'Terrain difficile. Bouger de plus de la moitié de sa vitesse : Finesse physique DD 10 ou à terre.',
    ],
  },
  poison: {
    n: ['Poison cloud', 'Nuage toxique'],
    c: 'rgba(150,80,190,.45)',
    r: [
      'Lightly obscured. Starting a turn here: Physical Resilience DC 12 or poisoned until the end of the next turn.',
      "Légèrement obscurci. Commencer son tour ici : Résistance physique DD 12 ou empoisonné jusqu'à la fin du tour suivant.",
    ],
  },
  dark: {
    n: ['Magical darkness', 'Ténèbres'],
    c: 'rgba(10,8,20,.62)',
    r: [
      'Heavily obscured: creatures inside are effectively blinded.',
      "Fortement obscurci : les créatures à l'intérieur sont comme aveuglées.",
    ],
  },
  web: {
    n: ['Webs', 'Toiles'],
    c: 'rgba(245,245,245,.35)',
    r: [
      'Difficult terrain. Entering: Physical Finesse DC 12 or restrained (Physical Power DC 12 to break free).',
      'Terrain difficile. En entrant : Finesse physique DD 12 ou entravé (Puissance physique DD 12 pour se libérer).',
    ],
  },
  fog: { n: ['Fog', 'Brouillard'], c: 'rgba(220,225,230,.55)', r: ['Heavily obscured.', 'Fortement obscurci.'] },
  thorns: {
    n: ['Thorns', 'Ronces'],
    c: 'rgba(70,120,40,.42)',
    r: [
      'Difficult terrain. Moving through: 1 box per 2 tiles (Physical Finesse DC 12 avoids it).',
      "Terrain difficile. Traverser : 1 case toutes les 2 cases (Finesse physique DD 12 pour l'éviter).",
    ],
  },
  holy: {
    n: ['Consecrated ground', 'Sol consacré'],
    c: 'rgba(255,230,120,.42)',
    r: [
      'Undead and fiends inside have one less Mastery die.',
      "Les morts-vivants et fiélons à l'intérieur ont un dé de Maîtrise de moins.",
    ],
  },
};
let envSel = 'fire';
function envDC() {
  const v = +document.getElementById('envdc').value;
  return v >= 5 && v <= 30 ? v : 12;
}
function envOf(key) {
  const v = ENV[key];
  return v ? (typeof v === 'string' ? { k: v, dc: 12 } : v) : null;
}
function envRule(e) {
  return tr(ENVT[e.k].r).replace(/DD \d+|DC \d+/g, (lang === 'fr' ? 'DD ' : 'DC ') + e.dc);
}
let FLOATQ = [];
function drawFloat() {
  const tm = (performance.now() - t0) / 1000;
  for (const [vx, vy, h, x, y, k] of FLOATQ) {
    const lift = LH * (k === 'fog' ? 1.1 : 1.5),
      [cx, cy] = scr(vx + 0.5, vy + 0.5, Math.max(h, 0));
    const by = cy - lift;
    for (let i = 0; i < 4; i++) {
      const dx = (rnd(x, y, i) - 0.5) * TW * 0.55 + (reduce ? 0 : Math.sin(tm * 0.6 + i + x) * TW * 0.06),
        dy = (rnd(x, y, i + 9) - 0.5) * TW * 0.25 + (reduce ? 0 : Math.cos(tm * 0.5 + i + y) * TW * 0.03),
        r = TW * (0.32 + rnd(x, y, i + 4) * 0.18);
      const g = ctx.createRadialGradient(cx + dx, by + dy, 0, cx + dx, by + dy, r);
      if (k === 'fog') {
        g.addColorStop(0, 'rgba(240,243,246,.62)');
        g.addColorStop(0.6, 'rgba(225,230,236,.35)');
        g.addColorStop(1, 'rgba(225,230,236,0)');
      } else {
        g.addColorStop(0, 'rgba(12,8,22,.85)');
        g.addColorStop(0.55, 'rgba(30,14,48,.55)');
        g.addColorStop(1, 'rgba(40,20,60,0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx + dx, by + dy, r, r * 0.62, 0, 0, 7);
      ctx.fill();
    }
  }
  FLOATQ = [];
}
// hidden from players: the GM sees it faded
function drawEnv(a, ...r) {
  if (!(a && a.hid)) return drawEnv0(a, ...r);
  ctx.save();
  ctx.globalAlpha *= 0.4;
  const v = drawEnv0(a, ...r);
  ctx.restore();
  return v;
}
function drawEnv0(k, vx, vy, h, x, y) {
  k = (k && k.k) || k;
  const e = ENVT[k];
  if (!e) return;
  const t = tileCorners(vx, vy, Math.max(h, 0)),
    tm = (performance.now() - t0) / 1000;
  if (k === 'fog' || k === 'dark') {
    poly(t, k === 'fog' ? 'rgba(220,225,230,.22)' : 'rgba(10,8,20,.35)');
    FLOATQ.push([vx, vy, h, x, y, k]);
    return;
  }
  poly(t, e.c);
  if (TW < 9) return;
  const [cx, cy] = t[0];
  ctx.save();
  poly(t);
  ctx.clip();
  if (k === 'fire') {
    for (let i = 0; i < 3; i++) {
      const [px, py] = tilePoint(cx, cy, 0.25 + rnd(x, y, i) * 0.5, 0.25 + rnd(x, y, i + 5) * 0.5),
        f = reduce ? 1 : 1 + 0.15 * Math.sin(tm * 8 + i * 2 + x),
        s = TW * 0.12 * f;
      ctx.fillStyle = i % 2 ? '#ffb02e' : '#ff5a1f';
      ctx.beginPath();
      ctx.moveTo(px, py - s * 2.2);
      ctx.quadraticCurveTo(px + s, py - s * 0.6, px, py);
      ctx.quadraticCurveTo(px - s, py - s * 0.6, px, py - s * 2.2);
      ctx.fill();
    }
  } else if (k === 'acid' || k === 'poison') {
    ctx.fillStyle = k === 'acid' ? 'rgba(200,255,120,.8)' : 'rgba(220,170,255,.6)';
    for (let i = 0; i < 4; i++) {
      const [px, py] = tilePoint(cx, cy, 0.2 + rnd(x, y, i) * 0.6, 0.2 + rnd(x, y, i + 7) * 0.6);
      ctx.beginPath();
      ctx.arc(px, py, TW * (k === 'acid' ? 0.03 : 0.09) * (0.6 + rnd(x, y, i + 3)), 0, 7);
      ctx.fill();
    }
  } else if (k === 'ice') {
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 2; i++) {
      const [a1, b1] = tilePoint(cx, cy, 0.2 + i * 0.35, 0.15),
        [a2, b2] = tilePoint(cx, cy, 0.45 + i * 0.35, 0.5);
      ctx.beginPath();
      ctx.moveTo(a1, b1);
      ctx.lineTo(a2, b2);
      ctx.stroke();
    }
  } else if (k === 'web') {
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 0.8;
    const [mx, my] = tilePoint(cx, cy, 0.5, 0.5);
    for (const p of t) {
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();
    }
    for (const r of [0.15, 0.3]) {
      ctx.beginPath();
      t.forEach((p, i) => {
        const q = [mx + (p[0] - mx) * r * 2, my + (p[1] - my) * r * 2];
        i ? ctx.lineTo(...q) : ctx.moveTo(...q);
      });
      ctx.closePath();
      ctx.stroke();
    }
  } else if (k === 'thorns') {
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const [px, py] = tilePoint(cx, cy, 0.2 + rnd(x, y, i) * 0.6, 0.25 + rnd(x, y, i + 4) * 0.5),
        s2 = TW * 0.1;
      ctx.strokeStyle = '#2f6b22';
      ctx.lineWidth = Math.max(1.2, TW * 0.025);
      ctx.beginPath();
      ctx.moveTo(px - s2, py + s2 * 0.3);
      ctx.bezierCurveTo(px - s2 * 0.4, py - s2 * 0.9, px + s2 * 0.4, py + s2 * 0.6, px + s2, py - s2 * 0.4);
      ctx.stroke();
      ctx.strokeStyle = '#1d4214';
      ctx.lineWidth = 1;
      for (const f of [-0.6, 0, 0.6]) {
        const qx = px + f * s2,
          qy = py - f * s2 * 0.3;
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(qx + s2 * 0.18, qy - s2 * 0.35);
        ctx.stroke();
      }
      ctx.fillStyle = '#5fa84a';
      ctx.beginPath();
      ctx.ellipse(px + s2 * 0.3, py - s2 * 0.25, s2 * 0.22, s2 * 0.11, -0.6, 0, 7);
      ctx.fill();
    }
  } else if (k === 'holy') {
    ctx.strokeStyle = 'rgba(255,245,200,.9)';
    ctx.lineWidth = 1.5;
    const [px, py] = tilePoint(cx, cy, 0.5, 0.5);
    ctx.beginPath();
    ctx.moveTo(px, py - TW * 0.12);
    ctx.lineTo(px, py + TW * 0.04);
    ctx.moveTo(px - TW * 0.06, py - TW * 0.06);
    ctx.lineTo(px + TW * 0.06, py - TW * 0.06);
    ctx.stroke();
  }
  ctx.restore();
}
function fillEnv() {
  const el = document.getElementById('envk');
  if (!el) return;
  el.innerHTML = Object.keys(ENVT)
    .map(
      k =>
        `<option value="${k}"${k === envSel ? ' selected' : ''} title="${esc(tr(ENVT[k].r))}">${esc(tr(ENVT[k].n))}</option>`,
    )
    .join('');
}
document.getElementById('objk').addEventListener('change', e => {
  objSel = e.target.value;
  setTool('obj');
});
document.getElementById('prefk').addEventListener('change', e => {
  prefSel = e.target.value;
  PREFP = null;
  setTool('pref');
});
document.getElementById('envk').addEventListener('change', e => {
  envSel = e.target.value;
  setTool('env');
});
document.getElementById('surfk').addEventListener('change', e => {
  surfSel = +e.target.value;
  setTool('surf');
});

function drawMarks() {
  MARKS.forEach((m, i) => {
    if (m.x < 0 || m.y < 0 || m.x >= N || m.y >= N) return;
    const [x, y] = ctr(m),
      s = Math.max(10, TW * 0.2);
    ctx.save();
    if (m.hid) ctx.globalAlpha *= 0.4;
    ctx.strokeStyle = '#2a1a33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - s * 2.6);
    ctx.stroke();
    ctx.fillStyle = m.id === selMark ? '#f2c14e' : '#7a3fb0';
    ctx.beginPath();
    ctx.moveTo(x, y - s * 2.6);
    ctx.lineTo(x + s * 1.7, y - s * 2.1);
    ctx.lineTo(x, y - s * 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${Math.max(10, s * 0.8)}px "Alegreya Sans",sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = m.id === selMark ? '#2a1a33' : '#fff';
    ctx.fillText(i + 1, x + s * 0.65, y - s * 2.1);
    ctx.restore();
  });
}
function renderMarks() {
  if (typeof renderTpls === 'function' && TPLK) renderTpls();
  const L = document.getElementById('mk_list');
  if (!L) return;
  if (L.contains(document.activeElement) && L.querySelectorAll('input').length === MARKS.length) {
    L.querySelectorAll('li').forEach((li, i) => li.classList.toggle('sel', MARKS[i] && MARKS[i].id === selMark));
    return;
  }
  L.innerHTML =
    MARKS.map(
      (m, i) =>
        `<li class="${m.id === selMark ? 'sel' : ''}"><span class="n">${i + 1}</span><input data-id="${esc(m.id)}" value="${esc(m.l)}" placeholder="${esc(t('mk_ph'))}" aria-label="${esc(t('mk_title'))} ${i + 1}"><button type="button" data-mkdel="${esc(m.id)}" aria-label="${esc(t('del'))}">✕</button></li>`,
    ).join('') || `<li class="small">${esc(t('mk_none'))}</li>`;
}
document.getElementById('mk_list').addEventListener('input', e => {
  const m = MARKS.find(x => x.id === e.target.dataset.id);
  if (m) {
    m.l = e.target.value.slice(0, 200);
    clearTimeout(window._mkT);
    window._mkT = setTimeout(save, 300);
  }
});
document.getElementById('mk_list').addEventListener('focusin', e => {
  if (e.target.dataset.id) {
    selMark = e.target.dataset.id;
    draw();
  }
});
document.getElementById('mk_list').addEventListener('click', e => {
  const b = e.target.closest('[data-mkdel]');
  if (!b) return;
  snap();
  MARKS = MARKS.filter(m => m.id !== b.dataset.mkdel);
  save();
  draw();
});
function drawMeas() {
  const { a, b } = meas,
    [x1, y1] = ctr(a),
    [x2, y2] = ctr(b),
    dh = H[b.x][b.y] - H[a.x][a.y],
    d = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) + Math.abs(dh);
  ctx.save();
  ctx.strokeStyle = '#c0703a';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const [x, y] of [
    [x1, y1],
    [x2, y2],
  ]) {
    ctx.fillStyle = '#c0703a';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 7);
    ctx.fill();
  }
  const dist = unit === 'ft' ? `${d * 5} ${lang === 'fr' ? 'pieds' : 'ft'}` : `${num(d * 1.5)} m`;
  const hd = unit === 'ft' ? `${Math.abs(dh) * 5} ${lang === 'fr' ? 'pieds' : 'ft'}` : `${num(Math.abs(dh) * 1.5)} m`;
  const t =
    `${d} ${d > 1 ? T[lang].sqs : T[lang].sq} · ${dist}` +
    (dh ? ` (${T[lang].incl} ${hd} ${dh > 0 ? T[lang].up : T[lang].down})` : '');
  ctx.font = '600 15px "Alegreya Sans",sans-serif';
  const w = ctx.measureText(t).width + 18;
  if (meas.drag && d === 0 && !dh) {
    ctx.restore();
    return;
  }
  const lx = Math.min(W - w - 6, Math.max(6, (x1 + x2) / 2 - w / 2)),
    ly = Math.max(6, Math.min(y1, y2) - 40);
  ctx.fillStyle = 'rgba(30,26,22,.88)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(lx, ly, w, 28, 8);
  else ctx.rect(lx, ly, w, 28);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(t, lx + 9, ly + 14);
  ctx.restore();
}
let ticking = false;
function tick() {
  if (ticking) return;
  ticking = true;
  setTimeout(() => {
    ticking = false;
    draw();
  }, 90);
}
