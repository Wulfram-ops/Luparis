let RNG = Math.random;
const R = n => Math.floor(RNG() * n),
  ok = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
function genFree() {
  const p = B[bio].gen;
  if (p.rooms) {
    for (let x = 0; x < N; x++) {
      H[x][0] = 3;
      H[x][N - 1] = 3;
    }
    for (let y = 0; y < N; y++) {
      H[0][y] = 3;
      H[N - 1][y] = 3;
    }
    const cx = 3 + R(N - 6),
      cy = 3 + R(N - 6);
    for (let x = 1; x < N - 1; x++) if (Math.abs(x - cy) > 1) H[x][cy] = 3;
    for (let y = 1; y < N - 1; y++) if (Math.abs(y - cx) > 1 && H[cx][y] !== 3) H[cx][y] = 3;
    for (let i = 0; i < N / 3; i++) {
      const x = 1 + R(N - 2),
        y = 1 + R(N - 2);
      if (!H[x][y]) H[x][y] = R(2) + 1;
    }
  }
  const walls = Math.round((2 + N / 5) * (p.walls || 0));
  for (let i = 0; i < walls; i++) {
    let x = R(N),
      y = R(N);
    const dx = RNG() < 0.5 ? 1 : 0,
      dy = 1 - dx,
      len = 2 + R(Math.ceil(N / 3)),
      h = 1 + R(3);
    for (let j = 0; j < len; j++) {
      if (ok(x, y)) H[x][y] = p.ridge ? Math.min(3, h + (j % 3 === 1 ? 1 : 0)) : h;
      x += dx;
      y += dy;
    }
  }
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (!H[x][y] && RNG() < (p.scatter || 0)) H[x][y] = 1 + R(3);
  if (p.river) {
    let y = R(N);
    for (let x = 0; x < N; x++) {
      if (ok(x, y)) H[x][y] = -1;
      if (RNG() < 0.35) {
        y = Math.max(0, Math.min(N - 1, y + (RNG() < 0.5 ? -1 : 1)));
        if (ok(x, y)) H[x][y] = -1;
      }
    }
  }
  const pits = Math.round((1 + N / 8) * (p.pits || 0));
  for (let i = 0; i < pits; i++) {
    const cx = R(N),
      cy = R(N);
    for (let x = cx - 1; x <= cx + 1; x++)
      for (let y = cy - 1; y <= cy + 1; y++)
        if (ok(x, y) && H[x][y] < 3 && RNG() < 0.75) H[x][y] = x === cx && y === cy ? -2 : -1;
  }
}
const rr = () => RNG(),
  pickw = a => {
    let t = rr() * a.reduce((s, x) => s + x[1], 0);
    for (const [v, w] of a) {
      if ((t -= w) <= 0) return v;
    }
    return a[0][0];
  };
function wander(len, lo, hi, w) {
  const out = [];
  let y = lo + R(hi - lo + 1);
  for (let x = 0; x < len; x++) {
    for (let k = 0; k < w; k++) out.push([x, y + k]);
    if (rr() < 0.32) {
      const ny = Math.max(lo, Math.min(hi, y + (rr() < 0.5 ? -1 : 1)));
      if (ny !== y) {
        for (let k = 0; k < w; k++) out.push([x, ny + k]);
        y = ny;
      }
    }
  }
  return out;
}
function distMap(src) {
  const D = blank(N).map(r => r.map(() => 99)),
    q = [];
  let qi = 0;
  for (const [x, y] of src)
    if (ok(x, y) && D[x][y]) {
      D[x][y] = 0;
      q.push([x, y]);
    }
  while (qi < q.length) {
    const [x, y] = q[qi++];
    for (const [a,b] of hexNeighbours(x,y)) {
        if (ok(a, b) && D[a][b] > D[x][y] + 1) {
          D[a][b] = D[x][y] + 1;
          q.push([a, b]);
        }
      }
  }
  return D;
}
let NZ = null;
function noise(x, y) {
  if (!NZ || NZ.n !== N) {
    const s = Math.max(3, Math.round(N / (4 + RNG() * 3))),
      g = Math.ceil(N / s) + 2;
    NZ = { n: N, s, g: Array.from({ length: g }, () => Array.from({ length: g }, () => RNG())) };
  }
  const { s, g } = NZ,
    fx = x / s,
    fy = y / s,
    ix = Math.floor(fx),
    iy = Math.floor(fy),
    u = fx - ix,
    v = fy - iy,
    sm = t => t * t * (3 - 2 * t);
  const a = g[ix][iy],
    b = g[ix + 1][iy],
    c = g[ix][iy + 1],
    d = g[ix + 1][iy + 1];
  return (a + (b - a) * sm(u)) * (1 - sm(v)) + (c + (d - c) * sm(u)) * sm(v);
}
function orient(pts) {
  const fx = rr() < 0.5,
    sw = rr() < 0.5;
  return pts.map(([x, y]) => {
    let a = fx ? N - 1 - x : x,
      b = y;
    return sw ? [b, a] : [a, b];
  });
}
function house(x0, y0, w, h, lv) {
  for (let x = x0; x < x0 + w; x++)
    for (let y = y0; y < y0 + h; y++)
      if (ok(x, y)) {
        H[x][y] = lv;
        F[x][y] = 4;
      }
}
function freeRect(x0, y0, w, h, m) {
  for (let x = x0 - m; x < x0 + w + m; x++)
    for (let y = y0 - m; y < y0 + h + m; y++) {
      const inn = x >= x0 && y >= y0 && x < x0 + w && y < y0 + h;
      if (!ok(x, y)) {
        if (inn) return false;
        continue;
      }
      if (inn ? H[x][y] || F[x][y] : H[x][y] > 0 || F[x][y] === 4) return false;
    }
  return true;
}
const RW = () => Math.max(2, Math.round(N / 10)),
  SK = () => Math.max(1, N / 16),
  HS = () => Math.max(1, Math.round(N / 24)),
  Dk = v => Math.ceil(v / SK());
const SCN = {
  forest_road: {
    bio: 'foret',
    run() {
      const rw = RW(),
        road = orient(wander(N, 2, N - rw - 2, rw));
      if (RNG() < 0.4) {
        const m = road[Math.floor(road.length / 2)];
        let x = m[0],
          y = m[1];
        const dx = RNG() < 0.5 ? 1 : -1;
        while (ok(x, y)) {
          for (let k = 0; k < rw; k++) road.push([x + k, y]);
          y += dx;
          if (RNG() < 0.3) x += RNG() < 0.5 ? 1 : -1;
          x = Math.max(0, Math.min(N - 1, x));
        }
      }
      for (const [x, y] of road) if (ok(x, y)) F[x][y] = 1;
      const D = distMap(road);
      const cl = { x: R(N), y: R(N) };
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          if (F[x][y]) continue;
          const d = Dk(D[x][y]);
          if (Math.hypot(x - cl.x, y - cl.y) < 2.2 * SK() && d > 2) continue;
          H[x][y] =
            d === 1
              ? pickw([
                  [0, 8],
                  [1, 1],
                ])
              : d === 2
                ? pickw([
                    [0, 4],
                    [1, 2],
                    [2, 2],
                    [3, 1.5],
                  ])
                : pickw([
                    [0, 2],
                    [1, 1],
                    [2, 2],
                    [3, 5],
                  ]);
        }
      if (rr() < 0.6) {
        const [x, y] = road[R(road.length)];
        if (ok(x, y)) {
          H[x][y] = 1;
          F[x][y] = 0;
        }
      }
    },
  },
  mtn_bend: {
    bio: 'montagne',
    run() {
      const cx = Math.floor(N * 0.4) + R(Math.max(1, Math.floor(N * 0.25))),
        cy = Math.floor(N * 0.3) + R(Math.max(1, Math.floor(N * 0.25)));
      const pts = [];
      const rw = RW();
      for (let x = 0; x < cx + rw; x++) for (let k = 0; k < rw; k++) pts.push([x, cy + k]);
      for (let y = cy; y < N; y++) for (let k = 0; k < rw; k++) pts.push([cx + k, y]);
      const flip = rr() < 0.5,
        inner = (x, y) => flip !== (x < cx && y > cy + rw - 1),
        fx = rr() < 0.5,
        sw = rr() < 0.5,
        tf = (x, y) => {
          let a = fx ? N - 1 - x : x,
            b = y;
          return sw ? [b, a] : [a, b];
        };
      const road = pts.map(p => tf(...p));
      for (const [x, y] of road) if (ok(x, y)) F[x][y] = 1;
      const D = distMap(road);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          let lx, ly;
          {
            let a = sw ? y : x,
              b = sw ? x : y;
            lx = fx ? N - 1 - a : a;
            ly = b;
          }
          if (F[x][y]) continue;
          const d = Dk(D[x][y]);
          H[x][y] = inner(lx, ly)
            ? d === 1
              ? pickw([
                  [0, 5],
                  [-1, 3],
                ])
              : pickw([
                  [-1, 1],
                  [-2, 4],
                ])
            : d === 1
              ? pickw([
                  [0, 4],
                  [1, 3],
                  [2, 1],
                ])
              : d === 2
                ? pickw([
                    [1, 1],
                    [2, 4],
                    [3, 2],
                  ])
                : pickw([
                    [2, 1],
                    [3, 6],
                  ]);
        }
      for (const [x, y] of road)
        if (ok(x, y) && rr() < 0.05 / rw) {
          H[x][y] = 2;
          F[x][y] = 0;
        }
    },
  },
  outskirts: {
    bio: 'prairie',
    run() {
      const rw = RW(),
        hs = HS(),
        main = orient(wander(N, 3, N - rw - 3, rw));
      for (const [x, y] of main) if (ok(x, y)) F[x][y] = 2;
      const sx = 2 + R(N - 4),
        side = [];
      for (let y = 0; y < N; y++) {
        if (F[sx][y]) break;
        for (let k = 0; k < Math.max(1, rw - 1); k++) if (ok(sx + k, y)) side.push([sx + k, y]);
      }
      if (side.length < 3) side.length = 0;
      for (const [x, y] of side) F[x][y] = 2;
      let tries = 0,
        n = 0;
      while (tries++ < 600 + (N * N) / 4 && n < Math.round((N * N) / (20 * hs * hs))) {
        const w = (2 + R(2)) * hs,
          h = (2 + R(2)) * hs,
          x0 = R(N),
          y0 = R(N);
        if (!freeRect(x0, y0, w, h, 1)) continue;
        const D = distMap([...main, ...side]);
        let near = false;
        for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) if (D[x][y] <= 2 * SK()) near = true;
        if (!near && rr() < 0.8) continue;
        house(x0, y0, w, h, rr() < 0.7 ? 3 : 2);
        n++;
        if (rr() < 0.5) {
          const cx = x0 + w,
            cy = y0 + R(h);
          if (ok(cx, cy) && !H[cx][cy] && !F[cx][cy]) {
            H[cx][cy] = 1;
            F[cx][cy] = 5;
          }
        }
      }
      for (let i = 0; i < 50; i++) {
        const x = R(N),
          y = R(N);
        if (!F[x][y] && !H[x][y]) {
          H[x][y] = -1;
          break;
        }
      }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (!F[x][y] && !H[x][y] && rr() < 0.06)
            H[x][y] = pickw([
              [1, 1],
              [3, 1],
            ]);
    },
  },
  tavern: {
    bio: 'prairie',
    run() {
      const mid = { x: Math.floor(N / 2), y: Math.floor(N / 2) },
        r = prefPlace(mid, 'tavern', true) || prefPlace(mid, 'house', true);
      if (!r) return;
      const x0 = r.x0,
        y0 = r.y0,
        w = r.W,
        h = r.Hh;
      const dr = OBJS.find(
        o => o.k === 'door' && (o.x === x0 || o.y === y0 || o.x === x0 + w - 1 || o.y === y0 + h - 1),
      ) || { x: x0, y: y0 + h - 1 };
      const ddx = dr.x === x0 ? -1 : dr.x === x0 + w - 1 ? 1 : 0,
        ddy = ddx ? 0 : dr.y === y0 ? -1 : 1;
      const path = [];
      let x = dr.x + ddx,
        y = dr.y + ddy;
      while (ok(x, y)) {
        path.push([x, y]);
        if (rr() < 0.3) {
          if (ddx) y = Math.max(0, Math.min(N - 1, y + (rr() < 0.5 ? -1 : 1)));
          else x = Math.max(0, Math.min(N - 1, x + (rr() < 0.5 ? -1 : 1)));
        }
        path.push([x, y]);
        x += ddx;
        y += ddy;
      }
      for (const [a, b] of path) if (ok(a, b) && !F[a][b]) F[a][b] = 1;
      const sw = rr() < 0.5,
        sx = sw ? x0 + w + 1 : x0 - 4,
        sy = y0 + R(Math.max(1, h - 2));
      if (freeRect(sx, sy, 3, 2, 0)) house(sx, sy, 3, 2, 2);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (!F[x][y] && !H[x][y]) {
            const r = rr();
            if (r < 0.05) H[x][y] = 1;
            else if (r < 0.1) H[x][y] = 3;
            else if (r < 0.12) {
              H[x][y] = 1;
              F[x][y] = 5;
            }
          }
    },
  },
  bridge: {
    bio: 'prairie',
    run() {
      const rw = Math.max(2, Math.round(N / 7)),
        riv = orient(wander(N, 2, N - rw - 2, rw)),
        road = [];
      const vert = riv.length && false;
      for (const [x, y] of riv) if (ok(x, y)) H[x][y] = -1;
      const D = distMap(riv);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (H[x][y] === -1) {
            let c = 0;
            for (const [a, b] of [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ])
              if (ok(x + a, y + b) && H[x + a][y + b] === -1) c++;
            if (c >= 3 && rr() < 0.6) H[x][y] = -2;
          }
      const horiz =
        riv.filter(([x]) => x === riv[0][0]).length >= 1 &&
        Math.abs(riv[0][0] - riv[riv.length - 1][0]) > Math.abs(riv[0][1] - riv[riv.length - 1][1]);
      const bw = Math.max(1, RW() - 1),
        k = 2 + R(Math.max(1, N - 4 - bw));
      for (let t = 0; t < N; t++)
        for (let o = 0; o < bw; o++) {
          const [x, y] = horiz ? [k + o, t] : [t, k + o];
          if (!ok(x, y)) continue;
          if (H[x][y] < 0) {
            H[x][y] = 0;
            F[x][y] = 3;
          } else F[x][y] = 1;
        }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (!F[x][y] && H[x][y] === 0) {
            const d = D[x][y];
            if (d === 1 && rr() < 0.25) H[x][y] = 1;
            else if (d > 2 && rr() < 0.12)
              H[x][y] = pickw([
                [2, 1],
                [3, 2],
              ]);
          }
    },
  },
  forest_clearing: {
    bio: 'foret',
    run() {
      const cx = N / 2 + (RNG() - 0.5) * N * 0.3,
        cy = N / 2 + (RNG() - 0.5) * N * 0.3,
        rad = N * (0.18 + RNG() * 0.12);
      const roads = [];
      if (RNG() < 0.7) {
        let x = Math.round(cx),
          y = Math.round(cy);
        const dx = RNG() < 0.5 ? 1 : -1,
          rw = Math.max(1, RW() - 1);
        while (ok(x, y)) {
          for (let k = 0; k < rw; k++)
            if (ok(x, y + k)) {
              roads.push([x, y + k]);
              F[x][y + k] = 1;
            }
          x += dx;
          if (RNG() < 0.3) y += RNG() < 0.5 ? 1 : -1;
          y = Math.max(0, Math.min(N - 1, y));
        }
      }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          if (F[x][y]) continue;
          const d = Math.hypot(x - cx, y - cy) / rad + noise(x, y) * 0.5;
          H[x][y] =
            d < 1
              ? RNG() < 0.04
                ? 1
                : 0
              : d < 1.3
                ? pickw([
                    [0, 3],
                    [1, 2],
                    [2, 1],
                  ])
                : pickw([
                    [1, 1],
                    [2, 3],
                    [3, 4],
                    [0, 0.5],
                  ]);
        }
      const camp = RNG() < 0.6;
      if (camp) {
        for (let i = 0; i < 3 + R(4); i++) {
          const a = RNG() * 6.28,
            r = rad * 0.55;
          const x = Math.round(cx + Math.cos(a) * r),
            y = Math.round(cy + Math.sin(a) * r);
          if (ok(x, y) && ok(x + 1, y + 1)) {
            house(x, y, 2, 2, 2);
            F[x][y] = 5;
            F[x + 1][y] = 5;
            F[x][y + 1] = 5;
            F[x + 1][y + 1] = 5;
          }
        }
      }
      if (RNG() < 0.5) {
        const x = Math.round(cx + (RNG() - 0.5) * rad),
          y = Math.round(cy + (RNG() - 0.5) * rad);
        for (let a = x - 1; a <= x + 1; a++)
          for (let b = y - 1; b <= y + 1; b++) if (ok(a, b) && !F[a][b]) H[a][b] = a === x && b === y ? -2 : -1;
      }
    },
  },
  mtn_pass: {
    bio: () => (RNG() < 0.5 ? 'neige' : 'montagne'),
    run() {
      const w = 3 + R(Math.max(1, Math.round(N / 10)));
      const p = orient(wander(N, 2, N - w - 2, w));
      for (const [x, y] of p) if (ok(x, y)) F[x][y] = 1;
      const D = distMap(p);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          if (F[x][y]) {
            if (RNG() < 0.04) {
              H[x][y] = 1 + R(2);
              F[x][y] = 0;
            }
            continue;
          }
          const d = D[x][y] + noise(x, y) * 2,
            A = Math.max(2, N * 0.1);
          H[x][y] =
            d < A
              ? pickw([
                  [0, 6],
                  [1, 2],
                ])
              : d < A * 1.8
                ? pickw([
                    [1, 2],
                    [2, 3],
                    [0, 1],
                  ])
                : d < A * 2.6
                  ? pickw([
                      [2, 2],
                      [3, 3],
                    ])
                  : 3;
        }
      if (RNG() < 0.4) {
        const [x, y] = p[R(p.length)];
        for (let a = x - 1; a <= x + 1; a++)
          if (ok(a, y)) {
            H[a][y] = -1;
            F[a][y] = 0;
          }
      }
    },
  },
  river_ford: {
    bio: () => (RNG() < 0.5 ? 'foret' : 'prairie'),
    run() {
      const w = Math.max(3, Math.round(N / 7)) + R(2),
        riv = orient(wander(N, 2, N - w - 2, w));
      for (const [x, y] of riv) if (ok(x, y)) H[x][y] = -2;
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (H[x][y] === -2) {
            let c = 0;
            for (const [a, b] of [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ])
              if (ok(x + a, y + b) && H[x + a][y + b] !== -2) c++;
            if (c) H[x][y] = -1;
          }
      const D = distMap(riv),
        horiz = Math.abs(riv[0][0] - riv[riv.length - 1][0]) > Math.abs(riv[0][1] - riv[riv.length - 1][1]),
        k = 3 + R(N - 6);
      for (let t2 = 0; t2 < N; t2++)
        for (let o = 0; o < 2; o++) {
          const [x, y] = horiz ? [k + o, t2] : [t2, k + o];
          if (!ok(x, y)) continue;
          if (H[x][y] < 0) H[x][y] = -1;
          else F[x][y] = 1;
        }
      for (let i = 0; i < N / 3; i++) {
        const [x, y] = riv[R(riv.length)];
        if (ok(x, y) && H[x][y] === -1 && RNG() < 0.5) H[x][y] = 1;
      }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (!F[x][y] && H[x][y] === 0) {
            const d = D[x][y];
            if (d === 1 && RNG() < 0.3) H[x][y] = 1;
            else if (d > 2 && RNG() < 0.18 + noise(x, y) * 0.2)
              H[x][y] = pickw([
                [1, 1],
                [2, 2],
                [3, 2],
              ]);
          }
    },
  },
  marsh_walk: {
    bio: 'marais',
    run() {
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          const v = noise(x, y) + RNG() * 0.25;
          H[x][y] =
            v > 0.75
              ? pickw([
                  [1, 1],
                  [2, 1],
                  [3, 2],
                ])
              : v > 0.45
                ? 0
                : v > 0.3
                  ? -1
                  : -2;
        }
      const bw = Math.max(1, Math.round(N / 24)),
        p = orient(wander(N, 2, N - bw - 2, bw));
      for (const [x, y] of p)
        if (ok(x, y)) {
          H[x][y] = 0;
          F[x][y] = 3;
        }
      if (RNG() < 0.6) {
        const q = orient(wander(N, 2, N - bw - 2, bw));
        for (const [x, y] of q.slice(0, Math.round(q.length * 0.6)))
          if (ok(x, y)) {
            H[x][y] = 0;
            F[x][y] = 3;
          }
      }
    },
  },
  oasis: {
    bio: 'desert',
    run() {
      const cx = N / 2 + (RNG() - 0.5) * N * 0.3,
        cy = N / 2 + (RNG() - 0.5) * N * 0.3,
        r = N * (0.08 + RNG() * 0.07);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          const d = Math.hypot(x - cx, y - cy);
          if (d < r * 0.6) H[x][y] = -2;
          else if (d < r) H[x][y] = -1;
          else if (d < r + 1.6) H[x][y] = RNG() < 0.45 ? 2 : 0;
          else {
            const v = noise(x, y);
            H[x][y] =
              v > 0.78
                ? pickw([
                    [1, 2],
                    [3, 1],
                  ])
                : v > 0.62
                  ? 1
                  : 0;
          }
        }
      if (RNG() < 0.6) {
        const pw = Math.max(1, RW() - 1),
          p = orient(wander(N, 1, N - pw - 2, pw));
        for (const [x, y] of p)
          if (ok(x, y) && H[x][y] >= 0) {
            H[x][y] = 0;
            F[x][y] = 1;
          }
      }
      for (let i = 0; i < 1 + R(3); i++) {
        const x = R(N - 3),
          y = R(N - 3);
        if (freeRect(x, y, 3, 2, 1)) house(x, y, 3, 2, 2);
      }
    },
  },
  ruins: {
    bio: () => (RNG() < 0.5 ? 'gen' : 'prairie'),
    run() {
      const hs = HS(),
        rooms = 2 + Math.round((N * N) / (90 * hs * hs));
      for (let i = 0; i < rooms; i++) {
        const w = (4 + R(5)) * hs,
          h = (4 + R(5)) * hs,
          x0 = R(N - w),
          y0 = R(N - h);
        for (let x = x0; x < x0 + w; x++)
          for (let y = y0; y < y0 + h; y++) {
            const e = x === x0 || y === y0 || x === x0 + w - 1 || y === y0 + h - 1;
            if (e) {
              if (RNG() < 0.65) {
                H[x][y] = 1 + R(3);
                F[x][y] = 4;
              }
            } else if (RNG() < 0.7 && !F[x][y]) F[x][y] = 2;
          }
      }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++)
          if (!H[x][y] && RNG() < 0.07) {
            H[x][y] = 1;
          }
      if (RNG() < 0.5) {
        const x = R(N),
          y = R(N);
        for (let a = x - 1; a <= x + 1; a++)
          for (let b = y - 1; b <= y + 1; b++)
            if (ok(a, b)) {
              H[a][b] = -1;
              F[a][b] = 0;
            }
      }
    },
  },
  dungeon: {
    bio: 'donjon',
    run() {
      for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) H[x][y] = 3;
      const rs = [],
        n = 3 + Math.round((N * N) / 70);
      for (let i = 0; i < n * 4 && rs.length < n; i++) {
        const w = 3 + R(Math.max(2, Math.round(N / 5))),
          h = 3 + R(Math.max(2, Math.round(N / 5))),
          x0 = 1 + R(Math.max(1, N - w - 2)),
          y0 = 1 + R(Math.max(1, N - h - 2));
        if (rs.some(r => x0 < r.x + r.w + 1 && x0 + w + 1 > r.x && y0 < r.y + r.h + 1 && y0 + h + 1 > r.y)) continue;
        rs.push({ x: x0, y: y0, w, h });
      }
      for (const r of rs) {
        for (let x = r.x; x < r.x + r.w; x++) for (let y = r.y; y < r.y + r.h; y++) H[x][y] = 0;
        if (r.w > 5 && r.h > 5 && RNG() < 0.6)
          for (const [a, b] of [
            [1, 1],
            [r.w - 2, 1],
            [1, r.h - 2],
            [r.w - 2, r.h - 2],
          ])
            H[r.x + a][r.y + b] = 2;
        for (let i = 0; i < R(3); i++) {
          const x = r.x + R(r.w),
            y = r.y + R(r.h);
          H[x][y] = 1;
        }
        if (RNG() < 0.15) {
          const x = r.x + 1 + R(Math.max(1, r.w - 2)),
            y = r.y + 1 + R(Math.max(1, r.h - 2));
          H[x][y] = -2;
        }
      }
      rs.sort((a, b) => a.x - b.x);
      for (let i = 1; i < rs.length; i++) {
        const a = rs[i - 1],
          b = rs[i];
        let x = a.x + (a.w >> 1),
          y = a.y + (a.h >> 1);
        const tx = b.x + (b.w >> 1),
          ty = b.y + (b.h >> 1);
        const wd = Math.max(1, Math.round(N / 20)) + (RNG() < 0.3 ? 1 : 0);
        while (x !== tx) {
          for (let k = 0; k < wd; k++) if (ok(x, y + k) && H[x][y + k] > 0) H[x][y + k] = 0;
          x += Math.sign(tx - x);
        }
        while (y !== ty) {
          for (let k = 0; k < wd; k++) if (ok(x + k, y) && H[x + k][y] > 0) H[x + k][y] = 0;
          y += Math.sign(ty - y);
        }
      }
    },
  },
  cave: {
    bio: () => (RNG() < 0.5 ? 'donjon' : 'montagne'),
    run() {
      let G = blank(N).map(r => r.map(() => (RNG() < 0.45 ? 1 : 0)));
      for (let it = 0; it < 5; it++) {
        const G2 = blank(N);
        for (let x = 0; x < N; x++)
          for (let y = 0; y < N; y++) {
            let c = 0;
            for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (!ok(x + a, y + b) || G[x + a][y + b]) c++;
            G2[x][y] = c >= 5 ? 1 : 0;
          }
        G = G2;
      }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          if (G[x][y]) {
            H[x][y] = 3;
            continue;
          }
          let c = 0;
          for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (ok(x + a, y + b) && G[x + a][y + b]) c++;
          H[x][y] = c >= 4 && RNG() < 0.4 ? 1 + R(2) : RNG() < 0.03 ? -1 : 0;
        }
      for (let i = 0; i < Math.round(N / 8); i++) {
        const x = R(N),
          y = R(N);
        if (!G[x][y]) H[x][y] = -2;
      }
    },
  },
  village_square: {
    bio: 'prairie',
    run() {
      const cx = Math.round(N / 2 + (RNG() - 0.5) * N * 0.2),
        cy = Math.round(N / 2 + (RNG() - 0.5) * N * 0.2),
        r = Math.max(3, Math.round(N * (0.14 + RNG() * 0.08)));
      const roads = [];
      for (let x = cx - r; x <= cx + r; x++)
        for (let y = cy - r; y <= cy + r; y++)
          if (ok(x, y) && (RNG() < 0.9 || Math.max(Math.abs(x - cx), Math.abs(y - cy)) < r)) {
            F[x][y] = 2;
            roads.push([x, y]);
          }
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ])
        if (RNG() < 0.75) {
          let x = cx,
            y = cy;
          while (ok(x, y)) {
            for (let k = 0; k < RW(); k++) {
              const a = x + (dy ? k : 0),
                b = y + (dx ? k : 0);
              if (ok(a, b)) {
                F[a][b] = 2;
                roads.push([a, b]);
              }
            }
            x += dx;
            y += dy;
            if (RNG() < 0.15) {
              if (dx) y += RNG() < 0.5 ? 1 : -1;
              else x += RNG() < 0.5 ? 1 : -1;
            }
          }
        }
      if (RNG() < 0.7) {
        H[cx][cy] = -1;
        F[cx][cy] = 0;
      } else {
        H[cx][cy] = 3;
        F[cx][cy] = 4;
      }
      for (let i = 0; i < r * 2; i++) {
        const x = cx - r + R(2 * r + 1),
          y = cy - r + R(2 * r + 1);
        if (ok(x, y) && F[x][y] === 2 && !H[x][y] && Math.hypot(x - cx, y - cy) > 1.5 && RNG() < 0.5) {
          H[x][y] = 1;
          F[x][y] = 5;
        }
      }
      const D = distMap(roads),
        hs = HS();
      let n = 0;
      for (let i = 0; i < (N * N) / 3 && n < (N * N) / (18 * hs * hs); i++) {
        const w = (2 + R(3)) * hs,
          h = (2 + R(3)) * hs,
          x0 = R(N),
          y0 = R(N);
        if (!freeRect(x0, y0, w, h, 1)) continue;
        let near = 99;
        for (let x = x0; x < x0 + w; x++)
          for (let y = y0; y < y0 + h; y++) if (ok(x, y)) near = Math.min(near, D[x][y]);
        if (near > 2 * SK()) continue;
        house(x0, y0, w, h, RNG() < 0.6 ? 3 : 2);
        n++;
      }
      for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (!H[x][y] && !F[x][y] && RNG() < 0.05) H[x][y] = 3;
    },
  },
  docks: {
    bio: 'prairie',
    run() {
      const sh = Math.round(N * (0.55 + RNG() * 0.15));
      for (let x = 0; x < N; x++) for (let y = sh; y < N; y++) H[x][y] = y > sh + 1 ? -2 : -1;
      const qw = Math.max(2, RW() - 1),
        pw = Math.max(1, Math.round(N / 24));
      for (let x = 0; x < N; x++) for (let y = sh - qw; y < sh; y++) F[x][y] = 2;
      for (let x = 1 + R(3); x < N - 1; x += (4 + R(4)) * pw) {
        const len = 2 + R(Math.max(2, N - sh - 2));
        for (let y = sh; y < sh + len && y < N; y++)
          for (let o = 0; o < pw; o++)
            if (ok(x + o, y)) {
              H[x + o][y] = 0;
              F[x + o][y] = 3;
            }
      }
      const roads = [],
        hs = HS();
      for (let x = 0; x < N; x++) roads.push([x, sh - 1]);
      let n = 0;
      for (let i = 0; i < N * N && n < (N * N) / (30 * hs * hs); i++) {
        const w = (3 + R(3)) * hs,
          h = (2 + R(3)) * hs,
          x0 = R(N),
          y0 = R(Math.max(1, sh - 4));
        if (y0 + h > sh - 3 || !freeRect(x0, y0, w, h, 1)) continue;
        house(x0, y0, w, h, RNG() < 0.5 ? 3 : 2);
        n++;
      }
      for (let x = 0; x < N; x++)
        for (let y = sh - 2; y < sh; y++)
          if (RNG() < 0.12) {
            H[x][y] = 1;
            F[x][y] = 5;
          }
      if (RNG() < 0.6) {
        const x = R(N),
          y = R(Math.max(1, sh - 3));
        for (let a = 0; a < N && y > 0; a++) if (ok(a, y) && !F[a][y] && !H[a][y]) F[a][y] = 2;
      }
    },
  },
  crossroads: {
    bio: () => (RNG() < 0.6 ? 'prairie' : 'foret'),
    run() {
      const rw = RW(),
        a = orient(wander(N, 2, N - rw - 2, rw)),
        b0 = wander(N, 2, N - rw - 2, rw).map(([x, y]) => [y, x]),
        b = RNG() < 0.35 ? b0.slice(0, Math.round(N * 0.55)) : b0;
      const rs = [...a, ...b];
      for (const [x, y] of rs) if (ok(x, y)) F[x][y] = 1;
      const D = distMap(rs);
      const sx = a[Math.round(a.length / 2)];
      if (sx && ok(sx[0] + 2, sx[1] + 2) && !F[sx[0] + 2][sx[1] + 2]) {
        H[sx[0] + 2][sx[1] + 2] = 1;
        F[sx[0] + 2][sx[1] + 2] = 5;
      }
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          if (F[x][y] || H[x][y]) continue;
          const d = Dk(D[x][y]);
          if (d === 2 && RNG() < 0.55) H[x][y] = 3;
          else if (d > 3 && RNG() < 0.1 + noise(x, y) * 0.15)
            H[x][y] = pickw([
              [1, 1],
              [2, 1],
              [3, 2],
            ]);
        }
      if (RNG() < 0.5) {
        const x = R(N - 4),
          y = R(N - 3);
        if (freeRect(x, y, 4, 3, 1)) house(x, y, 4, 3, 2);
      }
    },
  },
  farmland: {
    bio: 'prairie',
    run() {
      const rw = RW(),
        hs = HS(),
        rs = orient(wander(N, 2, N - rw - 2, rw));
      for (const [x, y] of rs) if (ok(x, y)) F[x][y] = 1;
      const fw = (5 + R(4)) * hs,
        fh = (4 + R(4)) * hs;
      for (let x0 = 0; x0 < N; x0 += fw)
        for (let y0 = 0; y0 < N; y0 += fh) {
          const kind = R(4);
          for (let x = x0; x < Math.min(N, x0 + fw); x++)
            for (let y = y0; y < Math.min(N, y0 + fh); y++) {
              if (F[x][y]) continue;
              const e = x === x0 || y === y0;
              if (e) {
                if (RNG() < 0.6) H[x][y] = 3;
              } else if (kind === 0 && (x - x0) % 2 === 0) H[x][y] = 1;
              else if (kind === 1 && RNG() < 0.12) H[x][y] = 1;
            }
        }
      const x = R(N - 5 * hs),
        y = R(N - 4 * hs);
      if (freeRect(x, y, 4 * hs, 3 * hs, 0)) house(x, y, 4 * hs, 3 * hs, 3);
      if (freeRect(x + 5 * hs, y, 3 * hs, 2 * hs, 0)) house(x + 5 * hs, y, 3 * hs, 2 * hs, 2);
      if (RNG() < 0.6) {
        const px = R(N - 3),
          py = R(N - 3);
        for (let a = px; a < px + 2; a++)
          for (let b = py; b < py + 2; b++)
            if (ok(a, b) && !F[a][b]) {
              H[a][b] = -1;
            }
      }
    },
  },
  lava_field: {
    bio: 'volcan',
    run() {
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          const v = noise(x, y);
          H[x][y] = v > 0.8 ? 3 : v > 0.68 ? 2 : v > 0.56 ? 1 : 0;
        }
      for (let i = 0; i < 1 + R(2); i++) {
        const lw = RW() + R(2),
          p = orient(wander(N, 1, N - lw - 2, lw));
        for (const [x, y] of p) if (ok(x, y)) H[x][y] = RNG() < 0.6 ? -2 : -1;
      }
      const qw = Math.max(1, RW() - 1),
        q = orient(wander(N, 2, N - qw - 2, qw));
      for (const [x, y] of q)
        if (ok(x, y)) {
          if (H[x][y] < 0) {
            H[x][y] = 0;
            F[x][y] = 2;
          } else if (H[x][y] > 1) H[x][y] = 1;
        }
    },
  },
  snow_forest: {
    bio: 'neige',
    run() {
      const rw = RW(),
        p = RNG() < 0.7 ? orient(wander(N, 2, N - rw - 2, rw)) : [];
      for (const [x, y] of p) if (ok(x, y)) F[x][y] = 1;
      const D = distMap(p.length ? p : [[R(N), R(N)]]);
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          if (F[x][y]) continue;
          const v = noise(x, y);
          H[x][y] =
            v > 0.55
              ? pickw([
                  [2, 5],
                  [3, 1],
                  [1, 1],
                  [0, 1],
                ])
              : v > 0.35
                ? pickw([
                    [0, 3],
                    [2, 1],
                    [1, 1],
                  ])
                : 0;
          if (Dk(D[x][y]) <= 1 && H[x][y] > 1) H[x][y] = 0;
        }
      if (RNG() < 0.6) {
        const cx = R(N),
          cy = R(N),
          r = Math.round((2 + R(3)) * SK());
        for (let x = cx - r; x <= cx + r; x++)
          for (let y = cy - r; y <= cy + r; y++)
            if (ok(x, y) && !F[x][y] && Math.hypot(x - cx, y - cy) < r) H[x][y] = -1;
      }
    },
  },
  bandit_camp: {
    bio: 'foret',
    run() {
      const cx = Math.round(N / 2),
        cy = Math.round(N / 2),
        r = Math.round(N * (0.25 + RNG() * 0.1));
      for (let x = 0; x < N; x++)
        for (let y = 0; y < N; y++) {
          const d = Math.hypot(x - cx, y - cy);
          if (d > r + 1.5)
            H[x][y] = pickw([
              [0, 1],
              [1, 1],
              [2, 3],
              [3, 3],
            ]);
          else if (Math.abs(d - r) < 0.7) {
            H[x][y] = 2;
            F[x][y] = 4;
          }
        }
      const ga = RNG() * 6.28,
        gx = Math.round(cx + Math.cos(ga) * r),
        gy = Math.round(cy + Math.sin(ga) * r);
      for (let a = gx - 1; a <= gx + 1; a++)
        for (let b = gy - 1; b <= gy + 1; b++)
          if (ok(a, b)) {
            H[a][b] = 0;
            F[a][b] = 1;
          }
      let x = gx,
        y = gy;
      while (ok(x, y)) {
        for (let k = 0; k < Math.max(1, RW() - 1); k++)
          if (ok(x, y + k)) {
            F[x][y + k] = 1;
            H[x][y + k] = 0;
          }
        x += Math.sign(gx - cx) || 1;
        y += Math.sign(gy - cy) * (RNG() < 0.5 ? 1 : 0);
      }
      for (let i = 0; i < 3 + R(4); i++) {
        const a = RNG() * 6.28,
          rr2 = r * (0.35 + RNG() * 0.35),
          tx = Math.round(cx + Math.cos(a) * rr2),
          ty = Math.round(cy + Math.sin(a) * rr2);
        const hs = HS();
        if (freeRect(tx, ty, 2 * hs, 2 * hs, 0)) house(tx, ty, 2 * hs, 2 * hs, 2);
      }
      for (let i = 0; i < r; i++) {
        const a = RNG() * 6.28,
          rr2 = RNG() * r * 0.8,
          tx = Math.round(cx + Math.cos(a) * rr2),
          ty = Math.round(cy + Math.sin(a) * rr2);
        if (ok(tx, ty) && !H[tx][ty] && !F[tx][ty]) {
          H[tx][ty] = 1;
          F[tx][ty] = 5;
        }
      }
    },
  },
  graveyard: {
    bio: 'gen',
    run() {
      const m = 1 + R(2);
      for (let i = m; i < N - m; i++)
        for (const [x, y] of [
          [i, m],
          [m, i],
          [N - 1 - m, i],
          [i, N - 1 - m],
        ])
          if (RNG() < 0.9) {
            H[x][y] = 1;
            F[x][y] = 4;
          }
      const gx = Math.round(N / 2);
      for (let k = 0; k < 2; k++)
        if (ok(gx + k, N - 1 - m)) {
          H[gx + k][N - 1 - m] = 0;
          F[gx + k][N - 1 - m] = 1;
        }
      for (let y = m + 2; y < N - m - 2; y += 2)
        for (let x = m + 2; x < N - m - 2; x++)
          if (x % 3 && RNG() < 0.75) {
            H[x][y] = 1;
            F[x][y] = 4;
          }
      const w = 4 + R(2),
        h = 4 + R(3),
        x0 = R(Math.max(1, N - w - 2 * m - 4)) + m + 2,
        y0 = m + 2;
      for (let x = x0; x < x0 + w; x++)
        for (let y = y0; y < y0 + h; y++)
          if (ok(x, y)) {
            H[x][y] = 3;
            F[x][y] = 4;
          }
      for (let y = 0; y < N; y++)
        for (let k = 0; k < 2; k++)
          if (ok(gx + k, y) && H[gx + k][y] < 3 && y > m) {
            H[gx + k][y] = 0;
            F[gx + k][y] = 1;
          }
      for (let i = 0; i < N / 2; i++) {
        const x = R(N),
          y = R(N);
        if (!H[x][y] && !F[x][y]) H[x][y] = 3;
      }
    },
  },
  free: {
    bio: null,
    run() {
      genFree();
    },
  },
};
function genCity(d) {
  d = d || {};
  const ft = d.ft || '',
    pop = +d.pop || 1500;
  bio = 'prairie';
  const L = ok;
  const port = !!d.port,
    river = !!d.river && !port,
    walls = ft.includes('w') || d.c === 'cap';
  const sh = port ? N - Math.round(N * (0.1 + RNG() * 0.06)) : N;
  if (port) {
    for (let x = 0; x < N; x++) for (let y = sh; y < N; y++) H[x][y] = y >= sh + 2 ? -2 : -1;
    for (let x = 0; x < N; x++) for (let y = sh - 2; y < sh; y++) F[x][y] = 2;
    for (let x = 3 + R(4); x < N - 3; x += 6 + R(5)) {
      const len = 3 + R(Math.max(2, Math.round(N * 0.07)));
      for (let y = sh; y < Math.min(N, sh + len); y++) {
        H[x][y] = 0;
        F[x][y] = 3;
        if (RNG() < 0.5 && L(x + 1, y)) {
          H[x + 1][y] = 0;
          F[x + 1][y] = 3;
        }
      }
    }
  }
  let rv = [];
  if (river) {
    let x = Math.round(N * (0.25 + RNG() * 0.5));
    const w = 3 + R(2);
    for (let y = 0; y < N; y++) {
      for (let k = 0; k < w; k++)
        if (L(x + k, y)) {
          H[x + k][y] = k === 0 || k === w - 1 ? -1 : -2;
          rv.push([x + k, y]);
        }
      if (RNG() < 0.3) x = Math.max(2, Math.min(N - w - 2, x + (RNG() < 0.5 ? -1 : 1)));
    }
  }
  const wm = walls ? (ft.includes('s') ? Math.round(N * 0.1) : 2) : -1,
    inner = (x, y) => wm < 0 || (x > wm && y > wm && x < N - 1 - wm && y < N - 1 - wm);
  const nAv = Math.max(2, Math.round(N / 16)),
    hs = [],
    vs = [];
  for (let i = 1; i <= nAv; i++) {
    hs.push(Math.round((i * sh) / (nAv + 1) + ((RNG() - 0.5) * N) / (nAv * 3)));
    vs.push(Math.round((i * N) / (nAv + 1) + ((RNG() - 0.5) * N) / (nAv * 3)));
  }
  const roads = [],
    mid = Math.floor(nAv / 2);
  const lay = (p, code) => {
    for (const [x, y] of p)
      if (L(x, y)) {
        roads.push([x, y]);
        if (H[x][y] < 0) {
          H[x][y] = 0;
          F[x][y] = 3;
        } else if (F[x][y] !== 3) F[x][y] = code;
      }
  };
  hs.forEach((y0, i) => {
    const w = i === mid ? 3 : 2;
    let y = y0;
    const p = [];
    for (let x = 0; x < N; x++) {
      for (let k = 0; k < w; k++) p.push([x, y + k]);
      if (RNG() < 0.12) {
        const ny = Math.max(2, Math.min(sh - 4, y + (RNG() < 0.5 ? -1 : 1)));
        for (let k = 0; k < w; k++) p.push([x, ny + k]);
        y = ny;
      }
    }
    lay(p, 2);
  });
  vs.forEach((x0, i) => {
    const w = i === mid ? 3 : 2;
    let x = x0;
    const p = [];
    for (let y = 0; y < sh; y++) {
      for (let k = 0; k < w; k++) p.push([x + k, y]);
      if (RNG() < 0.12) {
        const nx = Math.max(2, Math.min(N - 4, x + (RNG() < 0.5 ? -1 : 1)));
        for (let k = 0; k < w; k++) p.push([nx + k, y]);
        x = nx;
      }
    }
    lay(p, 2);
  });
  const xs = [0, ...vs, N],
    ys = [0, ...hs, sh];
  for (let i = 0; i + 1 < xs.length; i++)
    for (let j = 0; j + 1 < ys.length; j++) {
      const x0 = xs[i] + 3,
        x1 = xs[i + 1] - 1,
        y0 = ys[j] + 3,
        y1 = ys[j + 1] - 1;
      if (x1 - x0 > 9) {
        const lx = Math.round((x0 + x1) / 2);
        const p = [];
        for (let y = y0; y < y1; y++) p.push([lx, y]);
        lay(p, 1);
      }
      if (y1 - y0 > 9) {
        const ly = Math.round((y0 + y1) / 2);
        const p = [];
        for (let x = x0; x < x1; x++) p.push([x, ly]);
        lay(p, 1);
      }
    }
  const pcx = vs[mid] + 1,
    pcy = hs[mid] + 1,
    pr = Math.max(3, Math.round(N / 14));
  for (let x = pcx - pr; x <= pcx + pr; x++)
    for (let y = pcy - pr; y <= pcy + pr; y++)
      if (L(x, y) && H[x][y] >= 0) {
        H[x][y] = 0;
        F[x][y] = 2;
      }
  for (let x = pcx - 1; x <= pcx; x++)
    for (let y = pcy - 1; y <= pcy; y++)
      if (L(x, y)) {
        H[x][y] = -1;
        F[x][y] = 0;
      }
  for (let i = 0; i < pr * 2; i++) {
    const x = pcx - pr + 1 + R(pr * 2 - 1),
      y = pcy - pr + 1 + R(pr * 2 - 1);
    if (L(x, y) && H[x][y] === 0 && Math.abs(x - pcx) > 1 && Math.abs(y - pcy) > 1 && RNG() < 0.6) {
      H[x][y] = 1;
      F[x][y] = 5;
    }
  }
  if (ft.includes('t') || d.c !== 'town') {
    const w = 5 + R(3),
      h = 7 + R(3),
      x0 = pcx + pr + 2,
      y0 = pcy - Math.floor(h / 2);
    if (freeRect(x0, y0, w, h, 0)) house(x0, y0, w, h, 3);
  }
  if (ft.includes('c')) {
    const s = Math.round(N / 6),
      x0 = pcx < N / 2 ? N - s - wm - 3 : wm + 3,
      y0 = wm + 3;
    for (let x = x0; x < x0 + s; x++)
      for (let y = y0; y < y0 + s; y++)
        if (L(x, y) && H[x][y] >= 0) {
          const e = x === x0 || y === y0 || x === x0 + s - 1 || y === y0 + s - 1;
          H[x][y] = e ? 3 : 0;
          F[x][y] = e ? 4 : 2;
        }
    const k = Math.round(s / 3);
    house(x0 + k, y0 + k, s - 2 * k, s - 2 * k, 3);
    const gx = x0 + Math.floor(s / 2);
    H[gx][y0 + s - 1] = 0;
    F[gx][y0 + s - 1] = 2;
  }
  if (walls) {
    for (let i = wm; i < N - wm; i++)
      for (const [x, y] of [
        [i, wm],
        [wm, i],
        [N - 1 - wm, i],
        [i, N - 1 - wm],
      ]) {
        if (!L(x, y) || y >= sh - 2 || H[x][y] < 0 || F[x][y] === 2 || F[x][y] === 1 || F[x][y] === 3) continue;
        H[x][y] = 3;
        F[x][y] = 4;
      }
    for (let i = wm; i < N - wm; i += 8)
      for (const [x, y] of [
        [i, wm + 1],
        [wm + 1, i],
        [N - 2 - wm, i],
        [i, N - 2 - wm],
      ])
        if (L(x, y) && !F[x][y] && H[x][y] === 0 && y < sh - 2) {
          H[x][y] = 3;
          F[x][y] = 4;
        }
  }
  const D = distMap(roads),
    dens = Math.min(0.95, 0.55 + Math.log10(Math.max(100, pop)) / 12);
  let tries = 0,
    n = 0;
  const goal = Math.round((N * N * dens) / 9);
  while (tries++ < goal * 6 && n < goal) {
    const w = 2 + R(3),
      h = 2 + R(3),
      x0 = R(N),
      y0 = R(sh);
    let near = 99,
      ins = true;
    for (let x = x0; x < x0 + w; x++)
      for (let y = y0; y < y0 + h; y++)
        if (L(x, y)) {
          near = Math.min(near, D[x][y]);
          if (!inner(x, y)) ins = false;
        }
    if (near > 2 || (!ins && !ft.includes('s')) || !freeRect(x0, y0, w, h, 1)) continue;
    house(x0, y0, w, h, ins ? (RNG() < 0.55 ? 3 : 2) : RNG() < 0.6 ? 1 : 2);
    if (!ins) for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) if (L(x, y)) F[x][y] = 5;
    n++;
  }
  for (const [x, y] of roads)
    if (RNG() < 0.025 && F[x][y] === 2) {
      const nx = x + (RNG() < 0.5 ? -1 : 1);
      if (L(nx, y) && !H[nx][y] && !F[nx][y]) {
        H[nx][y] = 1;
        F[nx][y] = 5;
      }
    }
  for (let x = 0; x < N; x++)
    for (let y = 0; y < sh; y++)
      if (!H[x][y] && !F[x][y]) {
        const r = RNG();
        if (r < 0.06) H[x][y] = 3;
        else if (r < 0.08) H[x][y] = 1;
      }
  const k = R(4);
  if (k) {
    const h2 = blank(N),
      f2 = blank(N);
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++) {
        const [a, b] = k === 1 ? [N - 1 - y, x] : k === 2 ? [N - 1 - x, N - 1 - y] : [y, N - 1 - x];
        h2[a][b] = H[x][y];
        f2[a][b] = F[x][y];
      }
    H = h2;
    F = f2;
  }
}
function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedOf(id, d) {
  if (d && +d.seed) return +d.seed;
  let h = 2166136261;
  for (const c of String(id)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function ctxBar() {
  const el = document.getElementById('ctxbar');
  if (!el) return;
  el.hidden = !CTX;
  if (!CTX) return;
  const mem = CTX.startsWith('mem:');
  el.innerHTML = `<b>${esc(mem ? L2('Saved map', 'Carte enregistrée') : t('ctx_town'))} : ${esc(CTXN)} <span class="small">(${N}×${N})</span></b><button type="button" id="ctx_regen">${esc(mem ? L2('Back to the saved version', 'Revenir à la version enregistrée') : t('ctx_regen'))}</button><button type="button" class="go" id="ctx_back">${esc(t('ctx_back'))}</button>`;
}
document.getElementById('ctxbar').addEventListener('click', e => {
  if (e.target.id === 'ctx_back') leaveTown();
  else if (e.target.id === 'ctx_regen' && CTX) {
    if (CTX.startsWith('mem:')) {
      const m = memList().find(x => 'mem:' + x.id === CTX);
      if (m) {
        snap();
        applyState(m.st);
        finishCtx(null);
      }
      return;
    }
    const o = towns()[CTX];
    regenTown(o && o.src, CTX);
  }
});
function regenTown(d, id) {
  snap();
  ENV = {};
  N = d && d.c === 'town' ? 64 : 128;
  H = blank(N);
  F = blank(N);
  tokens = [];
  MARKS = [];
  OBJS = [];
  TPLS = [];
  INI = { o: [], cur: 0, round: 0 };
  rot = 0;
  const old = RNG;
  RNG = mulberry(seedOf(id, d));
  try {
    genCity(d);
  } finally {
    RNG = old;
  }
  finishCtx(d);
}
function finishCtx(d) {
  for (const x of bz.querySelectorAll('button')) x.setAttribute('aria-pressed', x.dataset.b === bio);
  legend();
  showSize();
  CAM.z = 1;
  CAM.px = 0;
  CAM.py = 0;
  save();
  if (d && CTX) {
    const o = towns();
    if (o[CTX]) {
      o[CTX].src = d;
      lsSet('luparis-towns', o);
    }
  }
  ctxBar();
  layout();
}
function memList() {
  try {
    return lsGet('luparis-maps', null) || [];
  } catch (e) {
    return [];
  }
}
function memSave(l) {
  try {
    localStorage.setItem('luparis-maps', JSON.stringify(l));
    return true;
  } catch (e) {
    alert(
      L2(
        'Browser storage is full: delete an old saved map.',
        'Le stockage du navigateur est plein : supprime une ancienne carte enregistrée.',
      ),
    );
    return false;
  }
}
function memThumb() {
  try {
    const c = document.createElement('canvas'),
      w = 240,
      h = Math.round((240 * cv.height) / cv.width);
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    x.fillStyle = '#2b2a26';
    x.fillRect(0, 0, w, h);
    x.drawImage(cv, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.7);
  } catch (e) {
    return '';
  }
}
function memStateNow() {
  return {
    v: 2,
    grid: 'hex-offset',
    N,
    H: encG(H, 1),
    F: encG(F, 0),
    scene,
    tokens,
    rot,
    bio,
    ini: INI,
    marks: MARKS,
    env: ENV,
    objs: OBJS,
    tpls: TPLS,
  };
}
document.getElementById('savemap').addEventListener('click', () => {
  const box = document.getElementById('savebox');
  box.hidden = false;
  const d = new Date();
  document.getElementById('save_n').value = (CTX && CTXN ? CTXN : tr(B[bio].n)) + ' — ' + d.toLocaleDateString(lang);
  document.getElementById('save_n').focus();
  document.getElementById('save_n').select();
});
document.getElementById('savebox').addEventListener('submit', e => {
  e.preventDefault();
  const n = document.getElementById('save_n').value.trim().slice(0, 80) || L2('Battle map', 'Battle map');
  const l = memList();
  l.unshift({ id: 'm' + Date.now().toString(36), n, d: new Date().toISOString(), st: memStateNow(), th: memThumb() });
  if (memSave(l)) {
    document.getElementById('savebox').hidden = true;
    document.getElementById('save_msg').textContent = L2(
      'Saved. Find it in the World tab, “Saved maps”.',
      "Enregistrée. Retrouve-la dans l'onglet Monde, « Cartes enregistrées ».",
    );
    setTimeout(() => {
      document.getElementById('save_msg').textContent = '';
    }, 4000);
    if (typeof renderMem === 'function') renderMem();
  }
});
document.getElementById('save_cancel').addEventListener('click', () => {
  document.getElementById('savebox').hidden = true;
});
function openMem(id) {
  const m = memList().find(x => x.id === id);
  if (!m) return;
  if (!CTX) save();
  CTX = 'mem:' + id;
  CTXN = m.n;
  const o = towns()[CTX];
  applyState(o && o.v === 2 ? o : m.st);
  finishCtx(null);
  location.hash = '#carte';
}

function openTown(id, name, d) {
  if (!CTX) save();
  CTX = 'town:' + id;
  CTXN = name;
  const o = towns()[CTX];
  if (o && applyState(o) && o.v === 2) {
    finishCtx(o.src || d);
  } else regenTown(d, CTX);
  location.hash = '#carte';
}
function leaveTown() {
  CTX = null;
  CTXN = '';
  try {
    localStorage.setItem('luparis-ctx', 'null');
  } catch (e) {}
  if (!load()) {
    H = blank(N);
    F = blank(N);
  }
  finishCtx(null);
}
window.lupOpenTown = openTown;
const SCN_ORDER = [
  'forest_road',
  'forest_clearing',
  'bandit_camp',
  'snow_forest',
  'mtn_bend',
  'mtn_pass',
  'cave',
  'dungeon',
  'ruins',
  'graveyard',
  'river_ford',
  'bridge',
  'marsh_walk',
  'oasis',
  'lava_field',
  'crossroads',
  'farmland',
  'tavern',
  'outskirts',
  'village_square',
  'docks',
  'free',
];
function runScene() {
  snap();
  H = blank(N);
  F = blank(N);
  tokens = [];
  MARKS = [];
  OBJS = [];
  TPLS = [];
  ENV = {};
  NZ = null;
  RNG = Math.random;
  const sc = SCN[scene] || SCN.free;
  sc.run();
  save();
  draw();
}
const SCN_BIO = {
  gen: ['ruins', 'graveyard', 'dungeon', 'cave', 'crossroads'],
  prairie: [
    'crossroads',
    'farmland',
    'tavern',
    'outskirts',
    'village_square',
    'docks',
    'bridge',
    'river_ford',
    'ruins',
    'graveyard',
  ],
  foret: ['forest_road', 'forest_clearing', 'bandit_camp', 'river_ford', 'crossroads', 'tavern', 'ruins'],
  montagne: ['mtn_bend', 'mtn_pass', 'cave', 'ruins', 'bridge'],
  volcan: ['lava_field', 'cave', 'mtn_pass', 'ruins'],
  desert: ['oasis', 'ruins', 'mtn_pass', 'crossroads', 'village_square'],
  neige: ['snow_forest', 'mtn_pass', 'mtn_bend', 'cave', 'village_square'],
  marais: ['marsh_walk', 'river_ford', 'ruins', 'bandit_camp'],
  donjon: ['dungeon', 'cave', 'graveyard', 'ruins'],
};
function scenesFor(b) {
  return [...(SCN_BIO[b] || []), 'free'];
}
function fillScenes() {
  const el = document.getElementById('scene'),
    L = t('scn');
  if (!L) return;
  const list = scenesFor(bio);
  if (!list.includes(scene)) scene = list[0];
  el.innerHTML = list
    .map(k => `<option value="${k}"${k === scene ? ' selected' : ''}>${esc(t('scn')[k])}</option>`)
    .join('');
}
document.getElementById('scene').addEventListener('change', e => {
  scene = e.target.value;
  runScene();
});
document.getElementById('gen').onclick = runScene;
setTimeout(() => {
  ctxBar();
  renderMarks();
  fillEnv();
  fillSurf();
});
document.getElementById('size').addEventListener('input', e => {
  const n = SIZES[+e.target.value] || 16;
  if (n === N) {
    showSize();
    return;
  }
  snap();
  resizeTo(n);
  showSize();
  save();
  layout();
});
cv.style.cursor = 'grab';
const ro = new ResizeObserver(layout);
