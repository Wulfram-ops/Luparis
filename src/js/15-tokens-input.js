const IMGC = new Map();
function tokImg(k) {
  const ch = k.cid ? CH.list.find(c => c.id === k.cid) : null,
    m = k.mid ? MON.find(x => x.id === k.mid) : null,
    src = k.img || (ch && ch.img) || (m && m.img) || '';
  if (!src) return null;
  let im = IMGC.get(src);
  if (!im) {
    im = new Image();
    im.onload = () => draw();
    im.src = src;
    IMGC.set(src, im);
  }
  return im.complete && im.naturalWidth ? im : null;
}
function imgShrink(file, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    const im = new Image();
    im.onload = () => {
      const S = 128,
        c = document.createElement('canvas');
      c.width = c.height = S;
      const x = c.getContext('2d'),
        m = Math.min(im.width, im.height);
      x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, S, S);
      cb(c.toDataURL('image/webp', 0.8));
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
}
// hidden from players: the GM sees it faded
function drawTok(a, ...r) {
  if (!(a && a.hid)) return drawTok0(a, ...r);
  ctx.save();
  ctx.globalAlpha *= 0.4;
  const v = drawTok0(a, ...r);
  ctx.restore();
  return v;
}
function drawTok0(k, vx, vy, h, sc = 1) {
  const [cx, cy] = scr(vx, vy, h);
  const y = cy + TW / 4,
    r = TW * 0.24 * (sc > 1 ? sc * 0.82 : sc);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(cx, y + r * 0.35, r, r * 0.45, 0, 0, 7);
  ctx.fill();
  const g = ctx.createRadialGradient(cx - r * 0.3, y - r * 1.2, r * 0.1, cx, y - r * 0.8, r * 1.1);
  const c = k.t === 'pj' ? ['#7fb0e6', '#2b5c9c'] : k.hp === 0 ? ['#9a9590', '#4d4944'] : ['#ec8a7a', '#9c2f25'];
  g.addColorStop(0, c[0]);
  g.addColorStop(1, c[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, y - r * 0.8, r, 0, 7);
  ctx.fill();
  const TI = tokImg(k);
  if (TI) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, y - r * 0.8, r * 0.86, 0, 7);
    ctx.clip();
    ctx.drawImage(TI, cx - r * 0.86, y - r * 0.8 - r * 0.86, r * 1.72, r * 1.72);
    if (k.hp === 0 && k.hpMax) {
      ctx.fillStyle = 'rgba(60,55,50,.6)';
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(255,255,255,.75)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const cy0 = y - r * 0.8;
  if (INI.o.length && INI.o[INI.cur] && INI.o[INI.cur].id === k.id) {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy0, r + 4, 0, 7);
    ctx.stroke();
  }
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (TI) {
    if (k.num) {
      ctx.font = `700 ${Math.max(9, r * 0.55)}px "Alegreya Sans",sans-serif`;
      ctx.fillStyle = '#1b1816';
      ctx.beginPath();
      ctx.arc(cx + r * 0.75, cy0 + r * 0.7, r * 0.42, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(k.num, cx + r * 0.75, cy0 + r * 0.72);
    }
  } else if (k.ty && icon(k.ty, cx, cy0, r)) {
    if (k.num) {
      ctx.font = `700 ${Math.max(9, r * 0.55)}px "Alegreya Sans",sans-serif`;
      ctx.fillStyle = '#1b1816';
      ctx.beginPath();
      ctx.arc(cx + r * 0.75, cy0 + r * 0.7, r * 0.42, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(k.num, cx + r * 0.75, cy0 + r * 0.72);
    }
  } else {
    ctx.font = `700 ${Math.max(9, r * (k.n.length > 2 ? 0.7 : 0.95))}px "Alegreya Sans",sans-serif`;
    ctx.fillText(k.n, cx, cy0);
  }
  if (k.hpMax) {
    const n = k.hpMax,
      w = Math.min(TW * 0.9 * Math.max(1, sc * 0.8), Math.max(r * 2, n * 5)),
      x0 = cx - w / 2,
      yb = y - r * 2.2,
      bh = Math.max(4, TW * 0.06);
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(x0 - 1, yb - 1, w + 2, bh + 2);
    if (n <= 16) {
      const sw = w / n;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i < k.hp ? '#e0503c' : '#3a3330';
        ctx.fillRect(x0 + i * sw + 0.5, yb, sw - 1, bh);
      }
    } else {
      ctx.fillStyle = '#3a3330';
      ctx.fillRect(x0, yb, w, bh);
      ctx.fillStyle = '#e0503c';
      ctx.fillRect(x0, yb, (w * k.hp) / n, bh);
    }
  }
}
function icon(ty, cx, cy, r) {
  const s = r / 10;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const P = (pts, f = true) => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    f ? ctx.fill() : ctx.stroke();
  };
  const C = (x, y, rr, f = true) => {
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, 7);
    f ? ctx.fill() : ctx.stroke();
  };
  let ok = true;
  const cut = f => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    f();
    ctx.restore();
  };
  switch (ty) {
    case 'humanoid':
      ctx.beginPath();
      ctx.arc(0, 1, 6, Math.PI, 0);
      ctx.lineTo(6, 4);
      ctx.lineTo(-6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-1, -1, 2, 7);
      cut(() => {
        ctx.fillRect(-5, 0, 3.2, 1.8);
        ctx.fillRect(1.8, 0, 3.2, 1.8);
      });
      break;
    case 'undead':
      C(0, -1, 5.6);
      ctx.fillRect(-3.2, 3, 6.4, 3.4);
      cut(() => {
        C(-2.2, -1, 1.6);
        C(2.2, -1, 1.6);
        ctx.fillRect(-0.4, 4, 0.8, 2.4);
        ctx.fillRect(-2.2, 4, 0.8, 2.4);
        ctx.fillRect(1.4, 4, 0.8, 2.4);
      });
      break;
    case 'beast':
      P([
        [-6, -6],
        [-3, -2],
        [3, -2],
        [6, -6],
        [5.5, 1],
        [0, 7],
        [-5.5, 1],
      ]);
      cut(() => {
        C(-2.4, 0, 1.1);
        C(2.4, 0, 1.1);
      });
      break;
    case 'dragon':
      P([
        [-6, -5],
        [-3, -2],
        [4, -3],
        [7, 1],
        [3, 2],
        [3, 5],
        [-2, 5],
        [-5, 2],
      ]);
      P([
        [-4, -3],
        [-7, -7],
        [-2, -3],
      ]);
      cut(() => C(1, -1, 1.1));
      break;
    case 'fiend':
      C(0, 1, 4.6);
      P([
        [-4, -1],
        [-7, -7],
        [-2, -3],
      ]);
      P([
        [4, -1],
        [7, -7],
        [2, -3],
      ]);
      cut(() => {
        C(-1.8, 1, 1);
        C(1.8, 1, 1);
      });
      break;
    case 'giant':
      C(0, -2, 4.4);
      P([
        [-4.4, 0],
        [4.4, 0],
        [3, 7],
        [-3, 7],
      ]);
      cut(() => {
        ctx.fillRect(-3, -3, 2, 1.2);
        ctx.fillRect(1, -3, 2, 1.2);
      });
      break;
    case 'ooze':
      ctx.beginPath();
      ctx.moveTo(-7, 5);
      ctx.quadraticCurveTo(-7, -6, 0, -6);
      ctx.quadraticCurveTo(7, -6, 7, 5);
      ctx.closePath();
      ctx.fill();
      cut(() => {
        C(-2.4, -1, 1.3);
        C(2.4, 0, 1);
      });
      break;
    case 'monstrosity':
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4.5, 0, 0, 7);
      ctx.fill();
      cut(() => C(0, 0, 2.6));
      C(0, 0, 1.2);
      break;
    case 'elemental':
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.quadraticCurveTo(6, 0, 4, 4);
      ctx.quadraticCurveTo(2, 7, 0, 7);
      ctx.quadraticCurveTo(-5, 7, -5, 2);
      ctx.quadraticCurveTo(-4, -2, -1, -3);
      ctx.quadraticCurveTo(-1, 1, 1, 2);
      ctx.quadraticCurveTo(2, -2, 0, -7);
      ctx.fill();
      break;
    case 'celestial':
      ctx.beginPath();
      ctx.ellipse(0, -5.5, 5, 1.6, 0, 0, 7);
      ctx.stroke();
      C(0, 1.5, 4.2);
      break;
    case 'plant':
      ctx.beginPath();
      ctx.moveTo(-5, 6);
      ctx.quadraticCurveTo(-7, -6, 6, -6);
      ctx.quadraticCurveTo(6, 6, -5, 6);
      ctx.fill();
      cut(() => {
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-4, 5);
        ctx.lineTo(4, -4);
        ctx.stroke();
      });
      break;
    case 'fey':
      ctx.beginPath();
      ctx.ellipse(-3.4, -2, 3.4, 4.4, -0.5, 0, 7);
      ctx.ellipse(3.4, -2, 3.4, 4.4, 0.5, 0, 7);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-2.6, 3.6, 2.2, 2.8, 0.4, 0, 7);
      ctx.ellipse(2.6, 3.6, 2.2, 2.8, -0.4, 0, 7);
      ctx.fill();
      break;
    case 'construct':
      for (let i = 0; i < 8; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 4);
        ctx.fillRect(-1.3, -7, 2.6, 3);
        ctx.restore();
      }
      C(0, 0, 5);
      cut(() => C(0, 0, 2));
      break;
    default:
      ok = false;
  }
  ctx.restore();
  return ok;
}
function inPoly(p, x, y) {
  let s = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [a, b] = p[i],
      [c, d] = p[j];
    if (b > y !== d > y && x < ((c - a) * (y - b)) / (d - b) + a) s = !s;
  }
  return s;
}
function shape(c) {
  const h = H[c.x][c.y];
  if (h <= 0) return dia(c.vx, c.vy, 0);
  const t = dia(c.vx, c.vy, h),
    g = dia(c.vx, c.vy, 0);
  return [t[0], t[1], g[1], g[2], g[3], t[3]];
}
function pick(mx, my) {
  const S0 = (my - oy) / (TW / 4),
    D0 = (mx - ox) / (TW / 2);
  let best = null,
    bs = -1e9;
  for (let S = Math.floor(S0 - 5); S <= Math.ceil(S0 + (3 * LH) / (TW / 4) + 2); S++)
    for (let D = Math.floor(D0 - 2); D <= Math.ceil(D0 + 2); D++) {
      if ((S + D) & 1) continue;
      const vx = (S + D) / 2,
        vy = (S - D) / 2;
      if (vx < 0 || vy < 0 || vx >= N || vy >= N) continue;
      const [x, y] = unview(vx, vy),
        c = { x, y, vx, vy };
      if (inPoly(shape(c), mx, my)) {
        const sc = S * 1000 + vx;
        if (sc > bs) {
          bs = sc;
          best = c;
        }
      }
    }
  return best;
}
function pos(e) {
  const r = cv.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}
const SZN = { T: 0.5, S: 1, M: 1, L: 2, H: 3, G: 4 };
function tfp(k) {
  return Math.max(1, Math.floor(SZN[k.sz] || 1));
}
function covers(k, x, y) {
  const n = tfp(k);
  return x >= k.x && y >= k.y && x < k.x + n && y < k.y + n;
}
function tokAt(c) {
  return tokens.findIndex(k => covers(k, c.x, c.y));
}
function fits(x, y, n, id) {
  if (x < 0 || y < 0 || x + n > N || y + n > N) return false;
  for (let i = x; i < x + n; i++)
    for (let j = y; j < y + n; j++) {
      if (H[i][j] <= -2) return false;
      if (tokens.some(k => k.id !== id && covers(k, i, j))) return false;
    }
  return true;
}
function anchor(c, n) {
  return {
    x: Math.max(0, Math.min(N - n, c.x - Math.floor((n - 1) / 2))),
    y: Math.max(0, Math.min(N - n, c.y - Math.floor((n - 1) / 2))),
  };
}
function tokAnchor(k) {
  const n = tfp(k);
  if (n === 1) return [k.x, k.y];
  let bx = k.x,
    by = k.y,
    bs = -1;
  for (let i = k.x; i < k.x + n; i++)
    for (let j = k.y; j < k.y + n; j++) {
      const [vx, vy] = view(i, j),
        sc = (vx + vy) * 1000 + vx;
      if (sc > bs) {
        bs = sc;
        bx = i;
        by = j;
      }
    }
  return [bx, by];
}
function tokCell(k, c) {
  const n = tfp(k);
  if (n === 1) return k.x === c.x && k.y === c.y;
  let bx = -1,
    by = -1,
    bs = -1;
  for (let i = k.x; i < k.x + n; i++)
    for (let j = k.y; j < k.y + n; j++) {
      const [vx, vy] = view(i, j),
        sc = (vx + vy) * 1000 + vx;
      if (sc > bs) {
        bs = sc;
        bx = i;
        by = j;
      }
    }
  return bx === c.x && by === c.y;
}
function drawTokAt(k) {
  const n = tfp(k);
  let sx = 0,
    sy = 0,
    hm = 0;
  for (let i = k.x; i < k.x + n; i++)
    for (let j = k.y; j < k.y + n; j++) {
      const [vx, vy] = view(i, j);
      sx += vx;
      sy += vy;
      hm = Math.max(hm, H[i][j]);
    }
  const hh = n === 1 && H[k.x][k.y] < 0 ? -0.5 : Math.max(hm, 0);
  drawTok(k, sx / (n * n), sy / (n * n), hh, n === 1 && k.sz === 'T' ? 0.62 : n);
}
function nextName(t) {
  const n = tokens.filter(k => k.t === t).length + 1;
  return t === 'pj' ? String(n) : String.fromCharCode(64 + ((n - 1) % 26) + 1);
}
const ELEV = [
  null,
  ['Elevation 1: difficult terrain', 'Élévation 1 : terrain difficile'],
  ['Elevation 2: needs a jump or a climb', 'Élévation 2 : demande un saut ou une escalade'],
  [
    'Elevation 3: high jump (strong characters only), flight or a climbing check',
    "Élévation 3 : saut en hauteur (personnages assez forts seulement), vol ou jet d'escalade",
  ],
];
function label(h, f) {
  if (f && h >= 0) return tr(FL[f]) + (h > 0 ? ` (+${h})` : '');
  const L = B[bio].L;
  return h === 0 ? t('ground') : h > 0 ? `${tr(L[h])} (+${h})` : `${tr(L['m' + -h])} (${h})`;
}
// GM: hide something from players, or show it again (token, object, marker, hazard, zone)
function hideToggle(c) {
  const tg = x => {
    if (x.hid) delete x.hid;
    else x.hid = 1;
    save();
    draw();
    if (typeof renderIni === 'function') renderIni();
    return true;
  };
  const i = tokAt(c);
  if (i >= 0) return tg(tokens[i]);
  const o = objAt(c.x, c.y);
  if (o >= 0) return tg(OBJS[o]);
  const m = MARKS.find(m => m.x === c.x && m.y === c.y);
  if (m) return tg(m);
  const e = ENV[c.x + ',' + c.y];
  if (e) return tg(e);
  for (let j = TPLS.length - 1; j >= 0; j--)
    if (tplCells(TPLS[j]).some(([x, y]) => x === c.x && y === c.y)) return tg(TPLS[j]);
  return false;
}
// put a character's token on the map, or move it there if it is already on the map
function placeAlly(ch, c) {
  if (!ch || !c || !ok(c.x, c.y) || H[c.x][c.y] <= -2) return false;
  const k0 = tokens.find(k => k.cid === ch.id);
  if (k0) {
    if (tokAt(c) >= 0 && tokens[tokAt(c)] !== k0) return false;
    k0.x = c.x;
    k0.y = c.y;
    return true;
  }
  if (tokAt(c) >= 0) return false;
  const D = derived(ch);
  tokens.push({
    id: tid(),
    x: c.x,
    y: c.y,
    t: 'pj',
    cid: ch.id,
    n: abbr(ch.name || '?'),
    nm: ch.name || '?',
    esq: D.eva,
    maj: D.major,
    sev: D.severe,
    hp: D.hp - (ch.used ? ch.used.hp || 0 : 0),
    hpMax: D.hp,
    init: D.init,
  });
  return true;
}
function apply(c, inv) {
  const key = c.x + ',' + c.y;
  if (painting && lastPainted === key) return;
  lastPainted = key;
  const h = H[c.x][c.y];
  let t = tool;
  if (t === 'hide') {
    painting = null;
    hideToggle(c);
    return;
  }
  if (inv && t !== 'mark') {
    if (t === 'up') t = 'down';
    else if (t === 'down') t = 'up';
    else if (t === 'pj' || t === 'foe' || t === 'move' || t === 'place') {
      const i = tokAt(c);
      if (i >= 0) {
        const id = tokens[i].id;
        tokens.splice(i, 1);
        INI.o = INI.o.filter(o => o.id !== id);
      }
      return;
    }
  }
  if (t === 'up') H[c.x][c.y] = Math.min(3, h + 1);
  else if (t === 'down') {
    H[c.x][c.y] = Math.max(-2, h - 1);
    if (H[c.x][c.y] < 0) F[c.x][c.y] = 0;
  } else if (t === 'flat') {
    H[c.x][c.y] = 0;
    F[c.x][c.y] = 0;
  } else if (t === 'env') {
    const key = c.x + ',' + c.y,
      cur = envOf(key);
    if (!painting.em) painting.em = cur && cur.k === envSel ? 'del' : 'set';
    if (painting.em === 'del') delete ENV[key];
    else ENV[key] = { k: envSel, dc: envDC() };
    return;
  } else if (t === 'obj') {
    painting = null;
    if (h < 0) return;
    const i = objAt(c.x, c.y);
    if (i >= 0 && OBJS[i].k === objSel) OBJS.splice(i, 1);
    else {
      if (i >= 0) OBJS.splice(i, 1);
      OBJS.push({ x: c.x, y: c.y, k: objSel, o: false, r: OBJR });
    }
    save();
    return;
  } else if (t === 'pref') {
    painting = null;
    hist.pop();
    prefPlace(c, prefSel, false, prefPend());
    PREFP = null;
    prefPend();
    return;
  } else if (t === 'mark') {
    const i = MARKS.findIndex(m => m.x === c.x && m.y === c.y);
    if (inv) {
      if (i >= 0) {
        MARKS.splice(i, 1);
        save();
      }
    } else if (i >= 0) {
      selMark = MARKS[i].id;
      const e = document.querySelector(`#mk_list input[data-id="${selMark}"]`);
      if (e) setTimeout(() => e.focus(), 30);
    } else {
      const m = { id: tid(), x: c.x, y: c.y, l: '' };
      MARKS.push(m);
      selMark = m.id;
      save();
      setTimeout(() => {
        const e = document.querySelector(`#mk_list input[data-id="${esc(m.id)}"]`);
        if (e) e.focus();
      }, 30);
    }
    painting = null;
    return;
  } else if ((t === 'pj' || t === 'foe') && tokAt(c) < 0 && h > -2)
    tokens.push({ id: tid(), x: c.x, y: c.y, t, n: nextName(t), init: 0 });
  else if (t === 'place' && placing && tokAt(c) < 0 && h > -2) {
    if (placing.ally) {
      const ch = CH.list.find(x => x.id === placing.ally);
      if (!ch) return;
      placeAlly(ch, c);
      // a player places their own token: the GM's table decides, then sends the map back
      if (MP.role === 'player') {
        mpSend({ type: 'place', me: ch.id, x: c.x, y: c.y });
        painting = null;
        placing = null;
        setTool('move');
        mpRender();
      }
      return;
    }
    const m = placing,
      v = conv(m),
      ab = abbr(tr(m.n)),
      nb = tokens.filter(k => k.ab === ab).length + 1;
    const sz = monSz(m),
      nn = Math.max(1, Math.floor(SZN[sz] || 1)),
      a = anchor(c, nn);
    if (!fits(a.x, a.y, nn)) return;
    tokens.push({
      id: tid(),
      mid: m.id,
      no: noT(m),
      x: a.x,
      y: a.y,
      sz,
      t: 'foe',
      ab,
      n: ab + nb,
      ty: m.type,
      nm: m.n,
      num: nb,
      esq: v.esq,
      maj: v.maj,
      sev: v.sev,
      hp: v.cases,
      hpMax: v.cases,
      init: +m.init || 0,
    });
  }
}
cv.addEventListener('contextmenu', e => e.preventDefault());
let pan = null;
cv.addEventListener(
  'wheel',
  e => {
    e.preventDefault();
    const [mx, my] = pos(e);
    zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, mx, my);
  },
  { passive: false },
);
const AREA_T = new Set(['up', 'down', 'flat', 'env', 'surf']);
function inArea(c, ar) {
  return (
    ar &&
    c.x >= Math.min(ar.a.x, ar.b.x) &&
    c.x <= Math.max(ar.a.x, ar.b.x) &&
    c.y >= Math.min(ar.a.y, ar.b.y) &&
    c.y <= Math.max(ar.a.y, ar.b.y)
  );
}
function areaApply(ar) {
  const x0 = Math.min(ar.a.x, ar.b.x),
    x1 = Math.max(ar.a.x, ar.b.x),
    y0 = Math.min(ar.a.y, ar.b.y),
    y1 = Math.max(ar.a.y, ar.b.y);
  let allEnv = true;
  if (tool === 'env')
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) {
        const v = ENV[x + ',' + y];
        if (!v || (v.k || v) !== envSel) allEnv = false;
      }
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++) {
      const h = H[x][y];
      if (tool === 'up') H[x][y] = Math.min(3, h + 1);
      else if (tool === 'down') {
        const v = Math.max(-2, h - 1);
        setH({ x, y }, v);
      } else if (tool === 'flat') {
        H[x][y] = 0;
        F[x][y] = 0;
        const oi = objAt(x, y);
        if (oi >= 0) OBJS.splice(oi, 1);
      } else if (tool === 'env') {
        const key = x + ',' + y;
        if (allEnv) delete ENV[key];
        else ENV[key] = { k: envSel, dc: envDC() };
      } else if (tool === 'surf') {
        if (H[x][y] >= 0) F[x][y] = surfSel;
      }
    }
}
cv.addEventListener('pointerdown', e => {
  const [mx, my] = pos(e),
    c = pick(mx, my);
  if (tool === 'tpl' && e.button === 0 && c && MP.role !== 'player') {
    tplClick(c);
    return;
  }
  if (
    MP.role === 'player' &&
    e.button === 0 &&
    c &&
    !(
      tool === 'measure' ||
      (tool === 'place' && placing && placing.ally && placing.ally === MP.me && MP.prole !== 'spec') ||
      (tool === 'move' && tokAt(c) >= 0 && tokens[tokAt(c)].cid && tokens[tokAt(c)].cid === MP.me)
    )
  ) {
    if (!(tool === 'move' && tokAt(c) < 0)) return;
  }
  if (
    e.button === 1 ||
    e.button === 2 ||
    (!c && CAM.z > 1) ||
    (c && tool === 'move' && e.button === 0 && tokAt(c) < 0 && objAt(c.x, c.y) < 0 && CAM.z > 1)
  ) {
    cv.setPointerCapture(e.pointerId);
    pan = { x: e.clientX, y: e.clientY };
    cv.style.cursor = 'grabbing';
    e.preventDefault();
    return;
  }
  if (!c) return;
  cv.setPointerCapture(e.pointerId);
  snap();
  const inv = e.button === 2;
  if (tool === 'move' && !inv && tokAt(c) < 0 && objToggle(c)) return;
  if (tool === 'move' && !inv) {
    const i = tokAt(c);
    if (i >= 0) {
      drag = i;
      meas = { a: { x: c.x, y: c.y }, b: { x: c.x, y: c.y }, live: false, drag: true };
      draw();
    }
    return;
  }
  if (tool === 'measure') {
    meas = { a: c, b: c, live: true };
    draw();
    return;
  }
  if (AREA_T.has(tool) && !inv) {
    painting = { inv, area: { a: c, b: c } };
    draw();
    return;
  }
  painting = { inv };
  lastPainted = '';
  apply(c, inv);
  draw();
});
cv.addEventListener('pointermove', e => {
  if (pan) {
    CAM.px += e.clientX - pan.x;
    CAM.py += e.clientY - pan.y;
    pan = { x: e.clientX, y: e.clientY };
    camSet();
    drawMove();
    return;
  }
  const [mx, my] = pos(e),
    c = pick(mx, my);
  hover = c;
  if (c && held.size) {
    const k = [...held].pop();
    setH(c, KH[k]);
    save();
    drawDirty(c);
  }
  if (meas && meas.live && c) meas.b = c;
  if (drag !== null && c && tokens[drag]) {
    const k = tokens[drag],
      n = tfp(k),
      a = anchor(c, n);
    if ((a.x !== k.x || a.y !== k.y) && fits(a.x, a.y, n, k.id)) {
      k.x = a.x;
      k.y = a.y;
      if (meas && meas.drag) meas.b = { x: c.x, y: c.y };
    }
  } else if (painting && painting.area && c) painting.area.b = c;
  else if (painting && c && (tool === 'up' || tool === 'down' || tool === 'flat' || tool === 'env')) {
    apply(c, painting.inv);
    drawDirty(c);
    return;
  }
  if (
    (!painting || painting.area) &&
    !held.size &&
    (drag === null || (BCAM && tokens[drag] && BCAM.hide === tokens[drag].id))
  )
    drawLite();
  else draw();
});
const end = () => {
  if (drag !== null) setTimeout(draw, 0);
  if (painting && painting.area) {
    areaApply(painting.area);
    painting = null;
    save();
    draw();
    return;
  }
  if (pan) {
    pan = null;
    cv.style.cursor = tool === 'move' ? 'grab' : 'crosshair';
    return;
  }
  if (drag !== null && meas && meas.drag && meas.a.x === meas.b.x && meas.a.y === meas.b.y && tokens[drag]) {
    selTok = tokens[drag].id;
    renderTok();
  }
  if (painting || drag !== null) save();
  painting = null;
  drag = null;
  if (meas) {
    meas.live = false;
    if (meas.drag) {
      meas = null;
      draw();
    }
  }
};
cv.addEventListener('pointerup', end);
cv.addEventListener('pointercancel', end);
cv.addEventListener('pointerleave', () => {
  hover = null;
  drawLite();
});
cv.addEventListener('dblclick', e => {
  const [mx, my] = pos(e),
    c = pick(mx, my);
  if (!c) return;
  const i = tokAt(c);
  if (i < 0) return;
  const k = tokens[i],
    m = k.mid && MON.find(x => x.id === k.mid);
  if (m && !(MP.role === 'player')) monSheet(m, k);
});
document.getElementById('in_list').addEventListener(
  'click',
  e => {
    const b = e.target.closest('[data-isb]');
    if (!b) return;
    e.stopPropagation();
    const k = tokens.find(x => x.id === b.dataset.isb),
      m = k && k.mid && MON.find(x => x.id === k.mid);
    if (m) monSheet(m, k);
  },
  true,
);
document.getElementById('tools').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || !b.dataset.t) return;
  setTool(b.dataset.t);
});
function setTool(t) {
  tool = t;
  if (t !== 'place') {
    placing = null;
    const a = document.getElementById('pl_ally'),
      f = document.getElementById('pl_foe');
    if (a) a.value = '';
    if (f) f.value = '';
  }
  if (t !== 'measure') meas = null;
  if (t !== 'tpl') TPLA = null;
  {
    const g = document.getElementById('tools');
    if (g) g.dataset.tool = t;
  }
  if (typeof toolHint === 'function') toolHint();
  for (const x of document.querySelectorAll('#tools button')) x.setAttribute('aria-pressed', x.dataset.t === t);
  cv.style.cursor = t === 'move' ? 'grab' : 'crosshair';
  draw();
}
const bz = document.getElementById('biomes');
document.getElementById('biosel').addEventListener('change', e => {
  const b = bz.querySelector(`button[data-b="${e.target.value}"]`);
  if (b) b.click();
});
function fillBio() {
  const el = document.getElementById('biosel');
  if (!el) return;
  el.innerHTML = ORDER.map(
    (k, i) => `<option value="${k}"${k === bio ? ' selected' : ''}>${esc(tr(B[k].n))}</option>`,
  ).join('');
}
bz.insertAdjacentHTML(
  'beforeend',
  ORDER.map(
    k =>
      `<button data-b="${k}" aria-pressed="${k === bio}"><span class="dot" style="background:${B[k].g[0]}"></span><span class="bn"></span></button>`,
  ).join(''),
);
function legend() {
  const b = B[bio];
  if (typeof fillBio === 'function') {
    const el = document.getElementById('biosel');
    if (el && el.options.length && el.value !== bio) el.value = bio;
    else if (el && !el.options.length) fillBio();
  }
  const it = [
    [b.g[0], t('ground')],
    [b.top[0], label(1)],
    [b.top[1], label(2)],
    [b.top[2], label(3)],
    [
      b.pit === 'lava'
        ? '#ff6a1a'
        : b.pit === 'water'
          ? '#3f7fb0'
          : b.pit === 'ice'
            ? '#9ccbe6'
            : b.pit === 'sand'
              ? '#c79a5a'
              : b.pit === 'swamp'
                ? '#4b5a32'
                : '#2b2622',
      `${tr(b.L.m1)} / ${tr(b.L.m2)}`,
    ],
  ];
  document.getElementById('legend').innerHTML = it
    .map(([c, t]) => `<span><span class="sw" style="background:${c}"></span>${t}</span>`)
    .join('');
  if (typeof fillScenes === 'function' && typeof SCN_BIO !== 'undefined') fillScenes();
}
bz.addEventListener('click', e => {
  const b = e.target.closest('button[data-b]');
  if (!b) return;
  bio = b.dataset.b;
  for (const x of bz.querySelectorAll('button')) x.setAttribute('aria-pressed', x === b);
  legend();
  if (typeof fillScenes === 'function') fillScenes();
  save();
  draw();
});
document.getElementById('rot').onclick = () => {
  rot = (rot + 1) % 4;
  save();
  draw();
};
document.getElementById('zin').onclick = () => zoomAt(1.4, W / 2, Hc / 2);
document.getElementById('zout').onclick = () => zoomAt(1 / 1.4, W / 2, Hc / 2);
document.getElementById('zfit').onclick = () => {
  CAM.z = 1;
  CAM.px = 0;
  CAM.py = 0;
  camSet();
  draw();
};
document.getElementById('undo').onclick = () => {
  const s = hist.pop();
  if (!s) return;
  const d = JSON.parse(s);
  H = d.H;
  F = d.F || blank(N);
  tokens = d.tokens;
  MARKS = d.marks || MARKS;
  ENV = d.env || {};
  OBJS = d.objs || [];
  TPLS = d.tpls || [];
  save();
  draw();
};
const KH = { 0: 0, 1: 1, 2: 2, 3: 3, 4: -1, 5: -2 },
  held = new Set();
function setH(c, v) {
  if (!c || H[c.x][c.y] === v) return;
  H[c.x][c.y] = v;
  if (v < 0) F[c.x][c.y] = 0;
  if (v === -2) tokens = tokens.filter(k => !covers(k, c.x, c.y));
}
function pickTool(t) {
  const b = document.querySelector(`#tools button[data-t="${t}"]`);
  if (b) b.click();
}
document.addEventListener('keydown', e => {
  if (e.target.closest('input,textarea,select')) return;
  if (document.getElementById('v-carte').hidden) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z') {
    e.preventDefault();
    document.getElementById('undo').click();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const dg = /^Digit([0-5])$/.exec(e.code);
  if (dg && e.shiftKey) {
    const kk = dg[1];
    e.preventDefault();
    if (!held.has(kk)) {
      held.add(kk);
      snap();
    }
    setH(hover, KH[kk]);
    save();
    draw();
    return;
  }
  if (k === 'escape') {
    setTool('move');
    return;
  }
  if (hover && (k === '-' || k === '+' || k === '=')) {
    const i = tokAt(hover);
    if (i >= 0 && tokens[i].hpMax) {
      tokHp(tokens[i], k === '-' ? -1 : 1);
    }
    return;
  }
});
document.addEventListener('keyup', e => {
  const dg = /^Digit([0-5])$/.exec(e.code);
  if (dg) held.delete(dg[1]);
});
window.addEventListener('blur', () => held.clear());
document.getElementById('clear').onclick = () => {
  snap();
  H = blank(N);
  F = blank(N);
  tokens = [];
  MARKS = [];
  OBJS = [];
  TPLS = [];
  ENV = {};
  save();
  draw();
};
