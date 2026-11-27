// ---- "Lavis & Aquarelle" battle map: the whole static map (paper, washes, ink, hatching, stamps) is painted once
// into an offscreen canvas, in view coordinates; drawNow only lays it under the tokens, zones and tools.
// Rebuilt when the terrain, the objects, the biome, the size or the rotation change.
let wcBuild;
{
  // Luparis — "Lavis & Aquarelle" battle map mock-up.
  // Static layer (paper, washes, ink, hatching, stamps) is drawn once into an offscreen canvas;
  // the live layer (tokens, fog, pencil) is redrawn only when something moves.
  let S = 34; // pixels per cell, chosen at each build
  const PAL = {
    paper: '#f2e8d3',
    ink: '#2f261d',
    water: '#5f8fa8',
    floor: '#c9a46c',
    stone: '#b7ab97',
    path: '#c7a676',
    grass: '#8faa63',
    forest: '#5f7f43',
    rock: '#8d877b',
    snow: '#e9eef2',
    sand: '#dcc48e',
    mud: '#7d6847',
    ice: '#a9cbd8',
    wood: '#a8794a',
  };
  const BIO = {
    gen: '#b5ba92',
    foret: '#9db36f',
    prairie: '#b2bf78',
    montagne: '#b3ad97',
    volcan: '#8e7c6c',
    donjon: '#b9b0a2',
    neige: '#e6ebee',
    desert: '#dcc690',
    marais: '#8f9a6a',
  };
  // what fills the hollows: water, or lava on a volcano
  const LIQ = { volcan: '#c4552a', marais: '#6f8a5e' };

  function rng(a) {
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---- procedural paper: white cold-pressed watercolour paper, no image to download
  function paper(w, h) {
    const c = new OffscreenCanvas(w, h),
      g = c.getContext('2d'),
      R = rng(7);
    g.fillStyle = '#fbf9f3';
    g.fillRect(0, 0, w, h);
    // the grain: thousands of tiny pits and bumps
    for (let i = 0; i < w * h * 0.02; i++) {
      const x = R() * w,
        y = R() * h,
        v = R();
      g.fillStyle = v < 0.5 ? `rgba(120,110,95,${0.04 + R() * 0.05})` : `rgba(255,255,255,${0.3 + R() * 0.4})`;
      g.fillRect(x, y, 1 + R() * 1.5, 1 + R() * 1.5);
    }
    for (let i = 0; i < 25; i++) {
      const x = R() * w,
        y = R() * h,
        r = 60 + R() * 200,
        gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(190,175,150,${0.03 + R() * 0.03})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return c;
  }
  // a noise field for pigment granulation and blooms
  let NOISE = null;
  function noise(w, h) {
    if (NOISE && NOISE.width === w && NOISE.height === h) return NOISE;
    const c = new OffscreenCanvas(w, h),
      g = c.getContext('2d'),
      R = rng(99);
    for (let i = 0; i < 900; i++) {
      const x = R() * w,
        y = R() * h,
        r = 6 + R() * 40,
        gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${0.25 + R() * 0.45})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < w * h * 0.03; i++) {
      g.fillStyle = `rgba(0,0,0,${R() * 0.5})`;
      g.fillRect(R() * w, R() * h, 1.5, 1.5);
    }
    return (NOISE = c);
  }

  // ---- classify each cell
  function cls(m, x, y) {
    const h = m.H[x][y],
      f = m.F[x][y];
    if (f === 4 && h > 0) return 'wall';
    if (h < 0) return 'water';
    // raised natural cells take the biome's decor: trees, pines, bushes, reeds… or rocks
    if (h > 0 && !f && m.D) {
      const d = m.D[x][y];
      return d === 'rock' ? 'outcrop' : d ? 'veg' : 'mound';
    }
    if (h > 0 && (f === 0 || f === 6 || f === 13 || f === 7))
      return (m.bio === 'foret' || m.bio === 'marais' || m.bio === 'prairie' || m.bio === 'gen') &&
        f !== 13 &&
        f !== 7 &&
        h === 1
        ? 'tree'
        : 'outcrop';
    if (f === 2 || f === 4 || f === 7) return m.bio === 'donjon' ? 'stone' : f === 2 ? 'stone' : 'rockfloor';
    if (f === 3 || f === 5) return 'wood';
    if (f === 1 || f === 11) return 'path';
    if (f === 6) return 'grass';
    if (f === 8) return 'snow';
    if (f === 9) return 'sand';
    if (f === 10) return 'mud';
    if (f === 12) return 'ice';
    if (f === 13) return 'rockfloor';
    return 'ground';
  }
  const WASH = {
    water: PAL.water,
    stone: PAL.stone,
    rockfloor: PAL.rock,
    wood: PAL.wood,
    path: PAL.path,
    grass: PAL.grass,
    snow: PAL.snow,
    sand: PAL.sand,
    mud: PAL.mud,
    ice: PAL.ice,
    tree: PAL.grass,
    outcrop: PAL.grass,
  };

  // one wash: the region's cells, softened, with uneven pigment (granulation, blooms) and a darker dried edge.
  // spread > 0 lets the colour bleed past the cells like a loose brush.
  function wash(g, cells, color, alpha, seed, rim = true, spread = 0.18) {
    if (!cells.length) return;
    const w = g.canvas.width,
      h = g.canvas.height,
      R = rng(seed),
      M = new OffscreenCanvas(w, h),
      m = M.getContext('2d');
    // mask: each cell a slightly wobbly square, a bit larger than the cell, then softened
    m.fillStyle = '#000';
    for (const [x, y] of cells) {
      const e = S * spread;
      m.beginPath();
      m.moveTo(x * S - e * R(), y * S - e * R());
      m.lineTo((x + 1) * S + e * R(), y * S - e * R());
      m.lineTo((x + 1) * S + e * R(), (y + 1) * S + e * R());
      m.lineTo(x * S - e * R(), (y + 1) * S + e * R());
      m.fill();
    }
    const P = new OffscreenCanvas(w, h),
      p = P.getContext('2d');
    p.filter = `blur(${Math.round(S * 0.28)}px)`;
    p.drawImage(M, 0, 0);
    p.drawImage(M, 0, 0);
    p.filter = 'none';
    p.globalCompositeOperation = 'source-in';
    p.fillStyle = color;
    p.fillRect(0, 0, w, h);
    // granulation: lift some pigment off in soft patches
    p.globalCompositeOperation = 'destination-out';
    p.globalAlpha = 0.55;
    p.drawImage(noise(w, h), (R() - 0.5) * 200, (R() - 0.5) * 200);
    g.save();
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = alpha;
    g.drawImage(P, 0, 0);
    g.restore();
    if (!rim || cells.length < 4) return;
    // dried edge: the crisp mask minus a shrunken, softer copy leaves a band along the border
    const E = new OffscreenCanvas(w, h),
      e = E.getContext('2d');
    e.filter = 'blur(1.5px)';
    e.drawImage(M, 0, 0);
    e.filter = 'blur(6px)';
    e.globalCompositeOperation = 'destination-out';
    e.drawImage(M, 0, 0);
    e.drawImage(M, 0, 0);
    e.filter = 'none';
    e.globalCompositeOperation = 'source-in';
    e.fillStyle = color;
    e.fillRect(0, 0, w, h);
    g.save();
    g.globalCompositeOperation = 'multiply';
    g.globalAlpha = alpha * 0.8;
    g.drawImage(E, 0, 0);
    g.restore();
  }

  // outline loops of a set of cells, smoothed (Chaikin) so banks and shores read as curves
  function contours(cells, N) {
    const inSet = new Set(cells.map(([x, y]) => x + ',' + y)),
      has = (x, y) => inSet.has(x + ',' + y),
      edges = new Map(),
      key = (x, y) => x + ',' + y;
    const add = (a, b) => edges.set(key(...a), b);
    for (const [x, y] of cells) {
      if (!has(x, y - 1)) add([x, y], [x + 1, y]);
      if (!has(x + 1, y)) add([x + 1, y], [x + 1, y + 1]);
      if (!has(x, y + 1)) add([x + 1, y + 1], [x, y + 1]);
      if (!has(x - 1, y)) add([x, y + 1], [x, y]);
    }
    const loops = [];
    while (edges.size) {
      const [k0, v0] = edges.entries().next().value;
      edges.delete(k0);
      const loop = [k0.split(',').map(Number), v0];
      let cur = v0;
      for (let i = 0; i < 10000; i++) {
        const nx = edges.get(key(...cur));
        if (!nx) break;
        edges.delete(key(...cur));
        loop.push(nx);
        cur = nx;
      }
      // drop the map edge itself: a river leaving the map has no bank there
      loops.push(loop);
    }
    const chaikin = pts => {
      const o = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i],
          [bx, by] = pts[i + 1];
        o.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
      }
      return o;
    };
    return loops.map(l =>
      chaikin(chaikin(chaikin(chaikin(l)))).map(([x, y]) => [
        x,
        y,
        x <= 0.01 || y <= 0.01 || x >= N - 0.01 || y >= N - 0.01,
      ]),
    );
  }

  // a slightly trembling ink line
  function inkLine(g, x1, y1, x2, y2, R, wd = 1.2) {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 8));
    g.lineWidth = wd * (0.8 + R() * 0.5);
    g.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        jx = (R() - 0.5) * 0.9,
        jy = (R() - 0.5) * 0.9;
      const px = x1 + (x2 - x1) * t + jx,
        py = y1 + (y2 - y1) * t + jy;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
  }

  // ---- object stamps (Path2D-like drawing in cell units, ink + a touch of wash)
  function stamp(g, o, R) {
    const cx = (o.x + 0.5) * S,
      cy = (o.y + 0.5) * S,
      k = o.k;
    g.save();
    g.translate(cx, cy);
    g.rotate(((o.r || 0) * Math.PI) / 2);
    g.strokeStyle = PAL.ink;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    const ink = (path, fill) => {
      if (fill) {
        g.globalAlpha = 0.55;
        g.fillStyle = fill;
        g.fill(path);
        g.globalAlpha = 1;
      }
      g.lineWidth = 1.4;
      g.stroke(path);
    };
    const P = () => new Path2D(),
      s = S;
    let p = P();
    switch (k) {
      case 'door':
        p.rect(-s * 0.5, -s * 0.12, s, s * 0.24);
        ink(p, o.o ? null : PAL.wood);
        if (o.o) {
          const q = P();
          q.moveTo(-s * 0.5, -s * 0.1);
          q.lineTo(-s * 0.5, s * 0.45);
          g.lineWidth = 2;
          g.stroke(q);
        }
        break;
      case 'chest':
      case 'crate': {
        const a = k === 'chest' ? 0.3 : 0.32;
        p.rect(-s * a, -s * (k === 'chest' ? 0.2 : a), s * a * 2, s * (k === 'chest' ? 0.4 : a * 2));
        ink(p, PAL.wood);
        const q = P();
        if (k === 'crate') {
          q.moveTo(-s * a, -s * a);
          q.lineTo(s * a, s * a);
          q.moveTo(s * a, -s * a);
          q.lineTo(-s * a, s * a);
        } else {
          q.moveTo(-s * a, 0);
          q.lineTo(s * a, 0);
        }
        g.lineWidth = 0.9;
        g.stroke(q);
        break;
      }
      case 'barrel':
        p.arc(0, 0, s * 0.3, 0, 7);
        ink(p, PAL.wood);
        p = P();
        p.arc(0, 0, s * 0.18, 0, 7);
        g.lineWidth = 0.8;
        g.stroke(p);
        break;
      case 'table':
      case 'counter':
      case 'bench':
      case 'bed':
      case 'shelf':
      case 'rack': {
        const dims = {
          table: [0.42, 0.3],
          counter: [0.48, 0.2],
          bench: [0.42, 0.12],
          bed: [0.3, 0.45],
          shelf: [0.48, 0.16],
          rack: [0.45, 0.1],
        }[k];
        p.rect(-s * dims[0], -s * dims[1], s * dims[0] * 2, s * dims[1] * 2);
        ink(p, k === 'bed' ? '#b89a7a' : PAL.wood);
        if (k === 'bed') {
          const q = P();
          q.rect(-s * 0.24, -s * 0.4, s * 0.48, s * 0.16);
          ink(q, '#efe6d4');
        }
        if (k === 'shelf' || k === 'rack') {
          const q = P();
          for (let i = -2; i <= 2; i++) {
            q.moveTo(i * s * 0.18, -s * dims[1]);
            q.lineTo(i * s * 0.18, s * dims[1]);
          }
          g.lineWidth = 0.7;
          g.stroke(q);
        }
        break;
      }
      case 'chair':
      case 'throne':
        p.rect(-s * 0.18, -s * 0.18, s * 0.36, s * 0.36);
        ink(p, k === 'throne' ? '#a6463a' : PAL.wood);
        p = P();
        p.moveTo(-s * 0.2, -s * 0.24);
        p.lineTo(s * 0.2, -s * 0.24);
        g.lineWidth = 2.4;
        g.stroke(p);
        break;
      case 'altar':
        p.rect(-s * 0.4, -s * 0.24, s * 0.8, s * 0.48);
        ink(p, '#d9d2c5');
        p = P();
        p.rect(-s * 0.3, -s * 0.14, s * 0.6, s * 0.28);
        g.lineWidth = 0.8;
        g.stroke(p);
        break;
      case 'statue':
        p.arc(0, 0, s * 0.34, 0, 7);
        ink(p, '#d9d2c5');
        p = P();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          p[i ? 'lineTo' : 'moveTo'](Math.cos(a) * s * 0.22, Math.sin(a) * s * 0.22);
        }
        p.closePath();
        g.lineWidth = 0.9;
        g.stroke(p);
        break;
      case 'brazier':
      case 'campfire':
      case 'hearth': {
        const r = k === 'campfire' ? 0.3 : 0.24;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2,
            q = P();
          q.arc(Math.cos(a) * s * r, Math.sin(a) * s * r, s * 0.07, 0, 7);
          ink(q, '#9b958a');
        }
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.6);
        gr.addColorStop(0, 'rgba(236,140,40,.75)');
        gr.addColorStop(1, 'rgba(236,140,40,0)');
        g.fillStyle = gr;
        g.beginPath();
        g.arc(0, 0, s * 0.6, 0, 7);
        g.fill();
        break;
      }
      case 'sarco':
        p.roundRect(-s * 0.26, -s * 0.44, s * 0.52, s * 0.88, s * 0.18);
        ink(p, '#cfc6b6');
        p = P();
        p.moveTo(0, -s * 0.28);
        p.lineTo(0, s * 0.22);
        p.moveTo(-s * 0.13, -s * 0.1);
        p.lineTo(s * 0.13, -s * 0.1);
        g.lineWidth = 1;
        g.stroke(p);
        break;
      case 'bones':
        g.lineWidth = 1.6;
        for (let i = 0; i < 3; i++) {
          const a = R() * Math.PI,
            x = (R() - 0.5) * s * 0.4,
            y = (R() - 0.5) * s * 0.4;
          inkLine(
            g,
            x - Math.cos(a) * s * 0.16,
            y - Math.sin(a) * s * 0.16,
            x + Math.cos(a) * s * 0.16,
            y + Math.sin(a) * s * 0.16,
            R,
            1.6,
          );
        }
        p.arc(s * 0.12, -s * 0.1, s * 0.09, 0, 7);
        ink(p, '#efe6d4');
        break;
      case 'trap':
        g.setLineDash([3, 3]);
        p.rect(-s * 0.36, -s * 0.36, s * 0.72, s * 0.72);
        ink(p, o.o ? '#2f261d' : null);
        g.setLineDash([]);
        break;
      case 'tent':
        p.moveTo(-s * 0.45, s * 0.4);
        p.lineTo(0, -s * 0.45);
        p.lineTo(s * 0.45, s * 0.4);
        p.closePath();
        ink(p, '#c9b37f');
        p = P();
        p.moveTo(0, -s * 0.45);
        p.lineTo(0, s * 0.4);
        g.lineWidth = 0.9;
        g.stroke(p);
        break;
      case 'well':
        p.arc(0, 0, s * 0.36, 0, 7);
        ink(p, '#9b958a');
        p = P();
        p.arc(0, 0, s * 0.22, 0, 7);
        ink(p, PAL.water);
        break;
      case 'cart':
        p.rect(-s * 0.36, -s * 0.24, s * 0.72, s * 0.48);
        ink(p, PAL.wood);
        g.lineWidth = 3;
        inkLine(g, -s * 0.2, -s * 0.32, s * 0.2, -s * 0.32, R, 3);
        inkLine(g, -s * 0.2, s * 0.32, s * 0.2, s * 0.32, R, 3);
        break;
      case 'crystal':
        for (let i = 0; i < 3; i++) {
          const q = P(),
            x = (i - 1) * s * 0.18,
            hgt = s * (0.25 + R() * 0.15);
          q.moveTo(x, -hgt);
          q.lineTo(x + s * 0.08, 0);
          q.lineTo(x, hgt * 0.4);
          q.lineTo(x - s * 0.08, 0);
          q.closePath();
          ink(q, '#8fb8d4');
        }
        break;
      case 'cage':
        p.rect(-s * 0.36, -s * 0.36, s * 0.72, s * 0.72);
        ink(p, null);
        p = P();
        for (let i = -2; i <= 2; i++) {
          p.moveTo(i * s * 0.14, -s * 0.36);
          p.lineTo(i * s * 0.14, s * 0.36);
        }
        g.lineWidth = 0.8;
        g.stroke(p);
        break;
      case 'lever':
        p.rect(-s * 0.12, -s * 0.12, s * 0.24, s * 0.24);
        ink(p, '#9b958a');
        inkLine(g, 0, 0, s * 0.2, o.o ? s * 0.25 : -s * 0.25, R, 2);
        break;
      case 'stall':
        p.rect(-s * 0.42, -s * 0.3, s * 0.84, s * 0.6);
        ink(p, '#c9675a');
        p = P();
        for (let i = -3; i <= 3; i++) {
          p.moveTo(i * s * 0.12, -s * 0.3);
          p.lineTo(i * s * 0.12, s * 0.3);
        }
        g.lineWidth = 0.6;
        g.stroke(p);
        break;
      case 'tree':
        canopy(g, 0, 0, s * 0.5, R);
        break;
      default:
        p.arc(0, 0, s * 0.25, 0, 7);
        ink(p, '#cfc6b6');
    }
    g.restore();
  }

  // a tree seen from above: cast shadow, shaded canopy (light from the top left), scalloped ink edge
  function canopy(g, x, y, r, R) {
    const n = 10,
      p = new Path2D();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2,
        rr = r * (0.8 + R() * 0.25),
        px = x + Math.cos(a) * rr,
        py = y + Math.sin(a) * rr;
      if (!i) p.moveTo(px, py);
      else {
        const am = a - Math.PI / n,
          cr = rr * 1.2;
        p.quadraticCurveTo(x + Math.cos(am) * cr, y + Math.sin(am) * cr, px, py);
      }
    }
    g.save();
    g.globalCompositeOperation = 'multiply';
    // canopy: mid green, dark lower right, light upper left
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r * 1.1);
    gr.addColorStop(0, 'rgba(170,195,120,.9)');
    gr.addColorStop(0.55, 'rgba(105,140,75,.85)');
    gr.addColorStop(1, 'rgba(55,85,45,.9)');
    g.fillStyle = gr;
    g.fill(p);
    g.globalCompositeOperation = 'source-over';
    // a few leaf clusters
    g.strokeStyle = 'rgba(40,55,30,.5)';
    g.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const a = R() * Math.PI * 2,
        d = r * (0.2 + R() * 0.45);
      g.beginPath();
      g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.18, Math.PI * 0.1, Math.PI * 1.1);
      g.stroke();
    }
    g.strokeStyle = 'rgba(40,35,28,.85)';
    g.lineWidth = 1;
    g.stroke(p);
    g.restore();
  }

  // the biome's decor on raised ground, seen from above
  function veg(g, k, x, y, R) {
    const s = S;
    if (k === 'tree') return canopy(g, x, y, s * 0.6, R);
    if (k === 'bush') return canopy(g, x, y, s * 0.36, R);
    g.save();
    g.strokeStyle = 'rgba(40,35,28,.85)';
    g.lineCap = 'round';
    if (k === 'pine' || k === 'pinesnow') {
      // a star of needles, darker green; snow on the upper side
      const p = new Path2D(),
        n = 9;
      for (let i = 0; i <= n * 2; i++) {
        const a = (i / (n * 2)) * Math.PI * 2,
          r = i % 2 ? s * 0.2 : s * (0.44 + R() * 0.06);
        p[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      p.closePath();
      g.fillStyle = 'rgba(52,88,62,.9)';
      g.fill(p);
      g.lineWidth = 1;
      g.stroke(p);
      if (k === 'pinesnow') {
        g.fillStyle = 'rgba(255,255,255,.8)';
        g.beginPath();
        g.arc(x - s * 0.08, y - s * 0.08, s * 0.2, 0, 7);
        g.fill();
      }
    } else if (k === 'dead') {
      for (let i = 0; i < 6; i++) {
        const a = R() * Math.PI * 2,
          l = s * (0.25 + R() * 0.2);
        inkLine(g, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, R, 1.1);
      }
    } else if (k === 'reed') {
      for (let i = 0; i < 7; i++) {
        const px = x + (R() - 0.5) * s * 0.6,
          py = y + (R() - 0.3) * s * 0.4;
        g.strokeStyle = 'rgba(70,90,50,.85)';
        inkLine(g, px, py, px + (R() - 0.5) * 4, py - s * (0.25 + R() * 0.2), R, 1);
      }
    } else if (k === 'hay' || k === 'cactus') {
      g.fillStyle = k === 'hay' ? 'rgba(214,180,90,.9)' : 'rgba(95,140,80,.9)';
      g.beginPath();
      g.arc(x, y, s * (k === 'hay' ? 0.32 : 0.2), 0, 7);
      g.fill();
      g.lineWidth = 1;
      g.stroke();
      if (k === 'hay') {
        g.beginPath();
        g.arc(x, y, s * 0.18, 0, 7);
        g.stroke();
      } else
        for (const a of [0, 2.1, 4.2])
          inkLine(
            g,
            x + Math.cos(a) * s * 0.2,
            y + Math.sin(a) * s * 0.2,
            x + Math.cos(a) * s * 0.36,
            y + Math.sin(a) * s * 0.36,
            R,
            2,
          );
    } else if (k === 'crate') stamp(g, { x: x / s - 0.5, y: y / s - 0.5, k: 'crate' }, R);
    else if (k === 'pillar') {
      g.fillStyle = '#d9d3c6';
      g.beginPath();
      g.arc(x, y, s * 0.32, 0, 7);
      g.fill();
      g.lineWidth = 1.2;
      g.stroke();
      g.beginPath();
      g.arc(x, y, s * 0.22, 0, 7);
      g.lineWidth = 0.7;
      g.stroke();
    } else canopy(g, x, y, s * 0.4, R);
    g.restore();
  }
  // a stone block wall cell: grey wash, cast shadow, two courses of irregular ink stones
  function stones(g, x, y, R, open) {
    const X = x * S,
      Y = y * S;
    g.save();
    g.fillStyle = '#d8d3c8';
    g.fillRect(X, Y, S, S);
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = `rgba(150,145,135,${0.35 + R() * 0.25})`;
    g.fillRect(X, Y, S, S);
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(40,35,28,.85)';
    g.lineWidth = 1;
    const rows = 2;
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? 0.5 : 0,
        y0 = Y + (r * S) / rows;
      let cx = X - off * (S / 2);
      while (cx < X + S) {
        const bw = S * (0.42 + R() * 0.2),
          x0 = Math.max(X, cx),
          x1 = Math.min(X + S, cx + bw);
        if (x1 - x0 > 4) {
          g.beginPath();
          g.roundRect(x0 + 1 + R(), y0 + 1 + R(), x1 - x0 - 2 - R(), S / rows - 2 - R(), 3);
          g.stroke();
        }
        cx += bw;
      }
    }
    // the face towards the open side gets a firmer line
    g.lineWidth = 1.8;
    for (const [a, b, x1, y1, x2, y2] of open) inkLine(g, x1 * S, y1 * S, x2 * S, y2 * S, R, 1.8);
    g.restore();
  }

  // ---- the static layer, built once per map
  function buildStatic(m) {
    const N = m.N,
      W = N * S,
      C = new OffscreenCanvas(W, W),
      g = C.getContext('2d'),
      R = rng(N * 31 + m.OBJS.length),
      K = [];
    for (let x = 0; x < N; x++) {
      K[x] = [];
      for (let y = 0; y < N; y++) K[x][y] = cls(m, x, y);
    }
    const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 'out' : K[x][y]),
      cellsOf = (...c) => {
        const a = [];
        for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) if (c.includes(K[x][y])) a.push([x, y]);
        return a;
      },
      dung = m.bio === 'donjon';
    g.drawImage(paper(W, W), 0, 0);
    // the land: a loose biome wash with a lighter, bleeding edge
    if (!dung)
      wash(
        g,
        cellsOf('ground', 'grass', 'tree', 'outcrop', 'wall', 'path', 'mud', 'sand', 'snow'),
        BIO[m.bio] || BIO.prairie,
        0.55,
        3,
        false,
        0.3,
      );
    let seed = 11;
    for (const [c, a] of [
      ['grass', 0.45],
      ['tree', 0.35],
      ['path', 0.45],
      ['sand', 0.5],
      ['mud', 0.5],
      ['snow', 0.4],
      ['ice', 0.5],
      ['rockfloor', 0.45],
      ['stone', 0.4],
      ['wood', 0.5],
      ['water', 0.8],
    ])
      wash(
        g,
        cellsOf(c),
        c === 'water' ? LIQ[m.bio] || WASH.water : WASH[c],
        a,
        seed++,
        true,
        c === 'water' ? 0.05 : 0.22,
      );
    // water: bluer middle, ink banks, a few ripples
    const water = cellsOf('water');
    if (water.length) {
      wash(
        g,
        water.filter(([x, y]) =>
          [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ].every(([a, b]) => at(x + a, y + b) === 'water' || at(x + a, y + b) === 'out'),
        ),
        m.bio === 'volcan' ? '#e0782e' : '#3f7fa0',
        0.35,
        71,
        false,
        -0.1,
      );
      g.strokeStyle = 'rgba(35,45,55,.85)';
      for (const loop of contours(water, N)) {
        g.lineWidth = 1.4;
        g.beginPath();
        let pen = false;
        for (const [x, y, edge] of loop) {
          if (edge) {
            pen = false;
            continue;
          }
          const px = x * S + (R() - 0.5) * 1.2,
            py = y * S + (R() - 0.5) * 1.2;
          pen ? g.lineTo(px, py) : g.moveTo(px, py);
          pen = true;
        }
        g.stroke();
      }
      g.strokeStyle = 'rgba(30,60,80,.45)';
      for (const [x, y] of water)
        if (R() < 0.3) {
          const px = (x + 0.2 + R() * 0.6) * S,
            py = (y + 0.3 + R() * 0.5) * S;
          g.lineWidth = 0.8;
          g.beginPath();
          g.moveTo(px - 7, py);
          g.quadraticCurveTo(px, py - 3, px + 7, py);
          g.stroke();
        }
    }
    // floors: boards and flagstones in fine ink
    g.strokeStyle = 'rgba(80,50,25,.3)';
    for (const [x, y] of cellsOf('wood'))
      for (let i = 1; i < 3; i++) inkLine(g, x * S, (y + i / 3) * S, (x + 1) * S, (y + i / 3) * S, R, 0.7);
    g.strokeStyle = 'rgba(60,50,40,.3)';
    for (const [x, y] of cellsOf('stone')) {
      if (R() < 0.55) continue; // worn flagstones: only some joints still show
      g.lineWidth = 0.7;
      const w = S * (0.35 + R() * 0.4),
        h = S * (0.3 + R() * 0.4);
      g.beginPath();
      g.roundRect(x * S + R() * (S - w), y * S + R() * (S - h), w, h, 3);
      g.stroke();
    }
    // ground details: pebbles and grass tufts, sparse
    g.strokeStyle = 'rgba(55,60,40,.55)';
    for (const [x, y] of cellsOf('ground', 'grass', 'path')) {
      if (R() < 0.12) {
        const px = (x + R()) * S,
          py = (y + R()) * S;
        g.lineWidth = 0.8;
        for (let i = -1; i <= 1; i++) inkLine(g, px + i * 2, py, px + i * 3.2, py - 4 - R() * 3, R, 0.7);
      }
      if (R() < 0.08) {
        g.lineWidth = 0.8;
        g.beginPath();
        g.ellipse((x + R()) * S, (y + R()) * S, 1.6 + R() * 1.6, 1.2 + R(), R() * 3, 0, 7);
        g.stroke();
      }
    }
    // the grid: hand-drawn ink, a little uneven
    g.save();
    g.strokeStyle = 'rgba(45,40,35,.42)';
    for (let i = 0; i <= N; i++) {
      inkLine(g, i * S, 0, i * S, W, R, 0.75);
      inkLine(g, 0, i * S, W, i * S, R, 0.75);
    }
    g.restore();
    // rock mass underground: hatching near the rooms, a pale grey further in
    const near = (x, y, d) => {
      for (let a = -d; a <= d; a++)
        for (let b = -d; b <= d; b++) if (at(x + a, y + b) !== 'wall' && at(x + a, y + b) !== 'out') return true;
      return false;
    };
    const sides = (x, y) =>
      [
        [1, 0, x + 1, y, x + 1, y + 1],
        [-1, 0, x, y, x, y + 1],
        [0, 1, x, y + 1, x + 1, y + 1],
        [0, -1, x, y, x + 1, y],
      ].filter(([a, b]) => {
        const n = at(x + a, y + b);
        return n !== 'wall' && n !== 'out';
      });
    if (dung) {
      g.strokeStyle = 'rgba(40,35,28,.8)';
      for (const [x, y] of cellsOf('wall'))
        if (!near(x, y, 1) && near(x, y, 2))
          for (let i = 0; i < 3; i++) {
            const a = R() * Math.PI,
              ox = (x + 0.15 + R() * 0.7) * S,
              oy = (y + 0.15 + R() * 0.7) * S;
            for (let j = -1; j <= 1; j++) {
              const dx = Math.cos(a + Math.PI / 2) * j * 3.2,
                dy = Math.sin(a + Math.PI / 2) * j * 3.2;
              inkLine(
                g,
                ox + dx - Math.cos(a) * 7,
                oy + dy - Math.sin(a) * 7,
                ox + dx + Math.cos(a) * 7,
                oy + dy + Math.sin(a) * 7,
                R,
                0.8,
              );
            }
          }
    }
    {
      const SH = new OffscreenCanvas(g.canvas.width, g.canvas.height),
        sh = SH.getContext('2d'),
        dot = (x, y, r) => (sh.beginPath(), sh.arc(x, y, r, 0, 7), sh.fill());
      sh.fillStyle = '#000';
      for (const [x, y] of cellsOf('wall'))
        if (!dung || near(x, y, 1)) sh.fillRect(x * S + S * 0.14, y * S + S * 0.18, S, S);
      for (const [x, y] of cellsOf('outcrop')) dot((x + 0.62) * S, (y + 0.66) * S, S * 0.36);
      for (const [x, y] of cellsOf('tree', 'veg')) dot((x + 0.64) * S, (y + 0.68) * S, S * 0.48);
      for (const o of m.OBJS) dot((o.x + 0.6) * S, (o.y + 0.64) * S, S * 0.3);
      g.save();
      g.globalCompositeOperation = 'multiply';
      g.globalAlpha = 0.22;
      g.filter = `blur(${Math.max(2, Math.round(S * 0.09))}px)`;
      g.drawImage(SH, 0, 0);
      g.restore();
    }
    // walls: stone blocks (underground, only the courses facing the rooms); outdoor house blocks become roofs
    const done = new Set(),
      houses = [];
    for (const [sx, sy] of cellsOf('wall')) {
      if (done.has(sx + ',' + sy)) continue;
      const comp = [],
        st = [[sx, sy]];
      done.add(sx + ',' + sy);
      while (st.length) {
        const [x, y] = st.pop();
        comp.push([x, y]);
        for (const [a, b] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + a,
            ny = y + b;
          if (at(nx, ny) === 'wall' && !done.has(nx + ',' + ny)) (done.add(nx + ',' + ny), st.push([nx, ny]));
        }
      }
      const xs = comp.map(c => c[0]),
        ys = comp.map(c => c[1]),
        x0 = Math.min(...xs),
        x1 = Math.max(...xs) + 1,
        y0 = Math.min(...ys),
        y1 = Math.max(...ys) + 1,
        inner = comp.filter(([x, y]) => !sides(x, y).length);
      const house =
        !dung && (inner.length >= 1 || (x1 - x0 >= 2 && y1 - y0 >= 2 && comp.length >= (x1 - x0) * (y1 - y0) * 0.8));
      if (house) houses.push({ comp, x0, x1, y0, y1 });
      else for (const [x, y] of comp) if (!dung || near(x, y, 1)) stones(g, x, y, R, sides(x, y));
    }
    // all the roofs in one wash: fast, and the colour varies across the village
    if (houses.length) {
      g.fillStyle = '#efe7da';
      for (const { comp } of houses) for (const [x, y] of comp) g.fillRect(x * S, y * S, S, S);
      wash(
        g,
        houses.flatMap(h => h.comp),
        '#b4643f',
        0.6,
        5,
        true,
        0,
      );
    }
    for (const { comp, x0, x1, y0, y1 } of houses) {
      {
        g.strokeStyle = 'rgba(70,35,20,.45)';
        for (const [x, y] of comp)
          for (let i = 1; i < 4; i++)
            x1 - x0 >= y1 - y0
              ? inkLine(g, x * S, (y + i / 4) * S, (x + 1) * S, (y + i / 4) * S, R, 0.6)
              : inkLine(g, (x + i / 4) * S, y * S, (x + i / 4) * S, (y + 1) * S, R, 0.6);
        g.strokeStyle = 'rgba(40,30,22,.9)';
        if (x1 - x0 >= y1 - y0)
          inkLine(g, (x0 + 0.5) * S, ((y0 + y1) / 2) * S, (x1 - 0.5) * S, ((y0 + y1) / 2) * S, R, 1.4);
        else inkLine(g, ((x0 + x1) / 2) * S, (y0 + 0.5) * S, ((x0 + x1) / 2) * S, (y1 - 0.5) * S, R, 1.4);
        for (const [x, y] of comp)
          for (const [, , ax, ay, bx, by] of sides(x, y)) inkLine(g, ax * S, ay * S, bx * S, by * S, R, 1.6);
      }
    }
    // relief: rocky outcrops and tree canopies
    for (const [x, y] of cellsOf('outcrop')) {
      const p = new Path2D(),
        cx = (x + 0.5) * S,
        cy = (y + 0.5) * S,
        n = 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + R() * 0.5,
          r = S * (0.3 + R() * 0.14);
        p[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      p.closePath();
      g.save();
      g.fillStyle = 'rgba(165,160,150,.8)';
      g.fill(p);
      g.restore();
      g.strokeStyle = 'rgba(40,35,28,.85)';
      g.lineWidth = 1.2;
      g.stroke(p);
      inkLine(g, cx - 5, cy + 2, cx + 2, cy - 5, R, 0.7);
    }
    for (const [x, y] of cellsOf('tree')) canopy(g, (x + 0.5) * S, (y + 0.5) * S, S * 0.6, R);
    for (const [x, y] of cellsOf('veg')) veg(g, m.D[x][y], (x + 0.5) * S, (y + 0.5) * S, R);
    // low mounds: a soft shadow on the lower right side
    g.save();
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = 'rgba(90,85,60,.18)';
    g.filter = 'blur(4px)';
    for (const [x, y] of cellsOf('mound')) g.fillRect(x * S + S * 0.3, y * S + S * 0.35, S * 0.8, S * 0.8);
    g.restore();
    // objects, each with a small shadow
    for (const o of m.OBJS) stamp(g, o, R);
    return C;
  }

  wcBuild = (m, cell) => {
    S = cell;
    return buildStatic(m);
  };
}
// the cached picture of the current map, rebuilt when it changes (a little later while the GM paints)
let WC = { k: '', c: null, t: 0, q: 0, busy: false, H: null, F: null, stale: false };
// while a button is held on the map (painting terrain, dragging), the picture waits: changed cells get a quick flat preview
document.addEventListener('pointerdown', e => {
  if (e.target && e.target.id === 'cv') WC.busy = true;
});
document.addEventListener('pointerup', () => {
  if (!WC.busy) return;
  WC.busy = false;
  if (WC.stale) setTimeout(draw, 30);
});
function wcSig() {
  let h = 2166136261 ^ N ^ (rot << 8);
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++) {
      h = Math.imul(h ^ (H[x][y] + 8), 16777619);
      h = Math.imul(h ^ F[x][y], 16777619);
    }
  let o = '';
  for (const b of OBJS) o += b.x + ',' + b.y + b.k + (b.o ? 1 : 0) + (b.r || 0) + ';';
  return bio + ':' + N + ':' + rot + ':' + (h >>> 0) + ':' + o;
}
function wcGet() {
  const k = wcSig();
  if (k === WC.k && WC.c) return ((WC.stale = false), WC.c);
  const now = performance.now();
  // while the map is being painted, wait for the button to be released (or a short pause) before repainting
  if (WC.c && WC.busy && WC.H && WC.H.length === N) {
    WC.stale = true;
    return WC.c;
  }
  WC.fresh = true;
  WC.stale = false;
  WC.H = H.map(r => r.slice());
  WC.F = F.map(r => r.slice());
  const Hv = [],
    Fv = [],
    Dv = [],
    dec = (B[bio] || B.gen).deco || [];
  for (let vx = 0; vx < N; vx++) {
    Hv[vx] = [];
    Fv[vx] = [];
    Dv[vx] = [];
    for (let vy = 0; vy < N; vy++) {
      const [x, y] = unview(vx, vy);
      Hv[vx][vy] = H[x][y];
      Fv[vx][vy] = F[x][y];
      Dv[vx][vy] = H[x][y] > 0 ? dec[Math.min(H[x][y], dec.length) - 1] || 0 : 0;
    }
  }
  const O = OBJS.map(b => {
    const [vx, vy] = view(b.x, b.y);
    return { ...b, x: vx, y: vy, r: ((b.r || 0) + rot) % 4 };
  });
  try {
    WC.c = wcBuild({ N, H: Hv, F: Fv, D: Dv, OBJS: O, bio }, Math.max(14, Math.min(40, Math.floor(2000 / N))));
  } catch (e) {
    WC.c = null;
  }
  WC.k = k;
  WC.t = performance.now();
  return WC.c;
}
