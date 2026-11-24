import json,sys,statistics,math,random
from xml.sax.saxutils import escape,quoteattr
src,out=sys.argv[1],sys.argv[2]
d=json.load(open(src));p=d['pack'];W,H=d['info']['width'],d['info']['height'];SEED=int(d['info']['seed'])
V=[v['p'] for v in p['vertices']];cells=p['cells'];feat=p['features']
RENAME={'Sanctuaria':'Tlanoxa'}
STATE_RENAME={'Kethei':'Ketheia',"El'Diel":"El'Dielese"}
land=lambda c:c['h']>=20
def poly(c): return 'M'+'L'.join(f"{V[v][0]:.1f},{V[v][1]:.1f}" for v in c['v'])+'Z'
def islake(c): f=c['f']; return 0<f<len(feat) and feat[f] and feat[f].get('type')=='lake'
burg={b['name']:b for b in p['burgs'][1:] if b and 'x' in b}
def bxy(n): b=burg[n];return b['x'],b['y']
S_WAR,S_XAL,S_DES,S_ITZ,S_COP,S_KES,S_NIV,S_KET,S_SYL=7,8,15,20,26,28,9,16,5
BC={1:'#ead7a0',2:'#d9d3a6',3:'#dcdaa0',4:'#d3dea6',5:'#b4d095',6:'#b2cc95',7:'#a9c98f',8:'#afcb96',9:'#acc49e',10:'#dde0cf',11:'#f4f4f0',12:'#ccdca8'}
FOREST={5,6,7,8};CONIF={9}
SKY=bxy('Skyhills')
def dist(c,q): return math.hypot(c['p'][0]-q[0],c['p'][1]-q[1])
SNOWX={22};SNOWF={3}
BURG_MOVE={'Ende':22}
def snowy(c):
    s=c['state'];x,y=c['p']
    if c['i'] in SNOWX or c['f'] in SNOWF: return 'snow'
    if s==S_KES: return 'nw' if (x-424)/203+(y-231)/172<0.85 else 'tundra'
    if s==S_NIV or (s==S_KET and y<179): return 'snow'
    return None
def effh(c):
    h=c['h']
    if dist(c,SKY)<34: h=max(h,52 if dist(c,SKY)>14 else 46)
    return h
# --- Border Desolate Lands | Kaurgath-Thaukar redrawn as a line east of Ilkath; the wall follows it
_ilk=burg['Ilkath'];LINEX=_ilk['x']+11;MAINF=cells[_ilk['cell']]['f']
S_THA=next(s_['i'] for s_ in p['states'] if s_.get('name')=='Thaukar')
for c in cells:
    if c['f']==MAINF and land(c) and 670<=c['p'][1]<=795 and c['state'] in (S_DES,6,S_THA):
        if c['p'][0]>LINEX: c['state']=S_DES
        elif c['state']==S_DES: c['state']=6
def isWall(a,b): return MAINF==a['f']==b['f'] and S_DES in (a['state'],b['state']) and {a['state'],b['state']}-{S_DES}<= {6,S_THA} and min(a['p'][1],b['p'][1])<=800
def desx(c): return c['state']==S_DES
def basecol(c):
    s=c['state'];sn=snowy(c);h=effh(c)
    if sn=='nw': return '#e9ebe6'
    if sn=='tundra': return '#e2e6da'
    if sn=='snow': return '#eff2ef'
    if s==S_SYL: return '#94b77e'
    if desx(c): return '#ecd7a2'
    if s==S_WAR: return '#cf9a6a' if h>=27 else '#e1b783'
    if s in (S_XAL,S_ITZ): return '#9fc77c'
    if h>=48: return '#d6d0bf'
    return BC.get(c['biome'],'#d3dea6')
def terr(c):
    s=c['state'];sn=snowy(c);h=effh(c);b=c['biome']
    if sn=='nw': return 'mtns'
    if sn in('tundra','snow'):
        if h>=48: return 'mtns'
        if h>=38: return 'hill'
        if sn=='snow' and b in (5,6,7,8,9): return 'pines'
        return 'tuft'
    if desx(c): return 'mtn' if h>=48 else 'dune'
    if s==S_WAR: return 'mtnr' if h>=27 else 'scrub'
    if h>=62: return 'mtns'
    if h>=48: return 'mtn'
    if h>=38: return 'hill'
    if s==S_SYL: return 'wild'
    if s in (S_XAL,S_ITZ): return 'jungle'
    if b in FOREST: return 'trees'
    if b in CONIF: return 'pines'
    if b in (1,2): return 'dune'
    if b==12 and h<26: return 'marsh'
    if b==10: return 'tuft'
    return 'grass'
def grp(fn):
    g={}
    for c in cells:
        k=fn(c)
        if k is not None: g.setdefault(k,[]).append(poly(c))
    return g
base=grp(lambda c: basecol(c) if land(c) else None)
lakes=[poly(c) for c in cells if not land(c) and islake(c)]
coast=[];border=[];wall=[]
for c in cells:
    for j in c['c']:
        if j<=c['i'] or j>=len(cells): continue
        o=cells[j];sv=set(o['v']);sh=[v for v in c['v'] if v in sv]
        if len(sh)<2: continue
        a,b=V[sh[0]],V[sh[1]];seg=f"M{a[0]:.1f},{a[1]:.1f}L{b[0]:.1f},{b[1]:.1f}"
        if land(c)!=land(o): coast.append(seg)
        elif land(c) and c['state']!=o['state']:
            border.append(seg)
            if isWall(c,o): wall.append(seg)
O='#3b3026'
SYM={
'mtn':f'<symbol id="i-mtn" viewBox="-13 -18 26 19" overflow="visible"><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0Z" fill="#cfc6b2"/><path d="M3,-17 L12,0 L4,0 L1,-8 L-1,-12 L0,-14Z" fill="#8f816d"/><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0" fill="none" stroke="{O}" stroke-width=".9" stroke-linejoin="round"/><path d="M-6,-6 L-4,-8 M-8,-3 L-6,-5" stroke="{O}" stroke-width=".5"/></symbol>',
'mtns':f'<symbol id="i-mtns" viewBox="-13 -18 26 19" overflow="visible"><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0Z" fill="#d3cbb9"/><path d="M3,-17 L12,0 L4,0 L1,-8 L-1,-12 L0,-14Z" fill="#8f816d"/><path d="M-5.5,-10.5 L-2,-16 L0,-14 L3,-17 L6.6,-10.4 L4,-11.5 L2,-9.5 L0,-11 L-2.5,-9Z" fill="#ffffff"/><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0" fill="none" stroke="{O}" stroke-width=".9" stroke-linejoin="round"/></symbol>',
'mtnr':f'<symbol id="i-mtnr" viewBox="-13 -18 26 19" overflow="visible"><path d="M-12,0 L-6,-9 L-3,-7 L1,-16 L5,-10 L7,-12 L12,0Z" fill="#c7855a"/><path d="M1,-16 L5,-10 L7,-12 L12,0 L3,0 L1,-7Z" fill="#8c4f33"/><path d="M-12,0 L-6,-9 L-3,-7 L1,-16 L5,-10 L7,-12 L12,0" fill="none" stroke="#4a2a1c" stroke-width=".9" stroke-linejoin="round"/></symbol>',
'hill':f'<symbol id="i-hill" viewBox="-8 -6 16 7" overflow="visible"><path d="M-7,0 Q-3,-6 1,-5 Q5,-4.5 7,0Z" fill="#c4bb8f"/><path d="M1,-5 Q5,-4.5 7,0 L2,0 Q3,-3 1,-5Z" fill="#a39a6f"/><path d="M-7,0 Q-3,-6 1,-5 Q5,-4.5 7,0" fill="none" stroke="#6d6447" stroke-width=".8"/></symbol>',
'tree':f'<symbol id="i-tree" viewBox="-4 -9 8 10" overflow="visible"><path d="M-.5,0 L-.5,-3 L.5,-3 L.5,0Z" fill="#5b4430"/><circle cx="0" cy="-5.2" r="3.6" fill="#5f9150" stroke="#2f4a2a" stroke-width=".6"/><path d="M0,-8.8 A3.6,3.6 0 0 1 3.6,-5.2 L1.6,-5.2 A1.6,1.6 0 0 0 0,-7Z" fill="#7fb06a"/><path d="M-3.6,-5.2 A3.6,3.6 0 0 0 0,-1.6 L0,-3 Q-2,-3.5 -2.4,-5.2Z" fill="#4a7a40"/></symbol>',
'wtree':f'<symbol id="i-wtree" viewBox="-4 -9 8 10" overflow="visible"><path d="M-.5,0 L-.5,-3 L.5,-3 L.5,0Z" fill="#4a3624"/><circle cx="0" cy="-5.2" r="3.8" fill="#3f6e3c" stroke="#223a20" stroke-width=".6"/><path d="M0,-9 A3.8,3.8 0 0 1 3.8,-5.2 L1.6,-5.2 A1.6,1.6 0 0 0 0,-7Z" fill="#5a8a4e"/></symbol>',
'pine':f'<symbol id="i-pine" viewBox="-4 -11 8 12" overflow="visible"><path d="M-.5,0 L.5,0 L.5,-2 L-.5,-2Z" fill="#5b4430"/><path d="M-3.4,-1.6 L0,-10.5 L3.4,-1.6Z" fill="#3f6b4c" stroke="#24402e" stroke-width=".6" stroke-linejoin="round"/><path d="M0,-10.5 L3.4,-1.6 L.8,-1.6Z" fill="#2f5340"/></symbol>',
'spine':f'<symbol id="i-spine" viewBox="-4 -11 8 12" overflow="visible"><path d="M-.5,0 L.5,0 L.5,-2 L-.5,-2Z" fill="#5b4430"/><path d="M-3.4,-1.6 L0,-10.5 L3.4,-1.6Z" fill="#3a6048" stroke="#24402e" stroke-width=".6" stroke-linejoin="round"/><path d="M-1.6,-6 L0,-10.5 L1.6,-6 L.6,-6.8 L0,-6 L-.7,-6.8Z" fill="#ffffff"/><path d="M-3,-2.4 L-1.8,-4 L-.4,-3 L1,-4.2 L3,-2.4" fill="none" stroke="#ffffff" stroke-width=".8"/></symbol>',
'palm':f'<symbol id="i-palm" viewBox="-5 -10 10 11" overflow="visible"><path d="M0,0 Q.8,-4 .2,-7.5" stroke="#6b5232" stroke-width="1" fill="none"/><path d="M.2,-7.5 Q-2.6,-9 -4.6,-6.2 M.2,-7.5 Q3,-9 4.8,-6.4 M.2,-7.5 Q-1.4,-10.4 -3.6,-10 M.2,-7.5 Q1.8,-10.4 3.8,-10.2 M.2,-7.5 Q.6,-10.8 .4,-11" stroke="#2f7a3c" stroke-width="1.4" fill="none" stroke-linecap="round"/></symbol>',
'bush':f'<symbol id="i-bush" viewBox="-3 -4 6 5" overflow="visible"><circle cx="-1.2" cy="-1.6" r="1.8" fill="#4f8a43" stroke="#2c4a26" stroke-width=".5"/><circle cx="1.3" cy="-1.8" r="1.6" fill="#5e9a50" stroke="#2c4a26" stroke-width=".5"/></symbol>',
'dune':f'<symbol id="i-dune" viewBox="-7 -4 14 5" overflow="visible"><path d="M-6,0 Q-2,-4 3,-3 Q5,-2.4 6,0Z" fill="#e2c584"/><path d="M-6,0 Q-2,-4 3,-3 Q5,-2.4 6,0" fill="none" stroke="#b08a4a" stroke-width=".7"/><path d="M-1,-2.5 Q1,-1 0,0" fill="none" stroke="#b08a4a" stroke-width=".5"/></symbol>',
'scrub':f'<symbol id="i-scrub" viewBox="-4 -4 8 5" overflow="visible"><path d="M-3.5,0 L-2.2,-2.2 L-.6,-1.2 L.4,-2.8 L2.2,-1 L3.6,0Z" fill="#b9784c" stroke="#5a3422" stroke-width=".5"/><path d="M2.6,-.2 L2.8,-2.4 M3.2,-.2 L3.8,-2 M2,-.2 L1.6,-1.8" stroke="#7d7330" stroke-width=".5"/></symbol>',
'marsh':f'<symbol id="i-marsh" viewBox="-4 -4 8 5" overflow="visible"><path d="M-3.5,0 L3.5,0" stroke="#7aa3b0" stroke-width=".7"/><path d="M-1.6,0 L-2.4,-3 M-.6,0 L-.6,-3.6 M.4,0 L1.2,-3" stroke="#5d7d4a" stroke-width=".6"/></symbol>',
'tuft':f'<symbol id="i-tuft" viewBox="-3 -3 6 4" overflow="visible"><path d="M-2,0 L-2.6,-2 M-.8,0 L-.8,-2.6 M.4,0 L1,-2" stroke="#8b958a" stroke-width=".55"/><path d="M1,.2 Q2.2,-.6 3,.2" stroke="#ffffff" stroke-width=".8" fill="none"/></symbol>',
'grass':f'<symbol id="i-grass" viewBox="-3 -3 6 4" overflow="visible"><path d="M-1.6,0 L-2.2,-2 M-.6,0 L-.6,-2.5 M.4,0 L1,-2" stroke="#7f9a5a" stroke-width=".55"/></symbol>',
}
defs='<defs>'+''.join(SYM.values())+'<pattern id="po" width="26" height="14" patternUnits="userSpaceOnUse"><path d="M2,8 Q6,5 10,8 T18,8" fill="none" stroke="#ffffff" stroke-opacity=".2" stroke-width=".7"/></pattern></defs>'
# landmarks positions
TREE=(bxy('Vardrassil')[0]+20,bxy('Vardrassil')[1]+6)
nx,ny=bxy('Namunzdus');cand=[c for c in cells if land(c) and c['p'][1]<ny-6 and math.hypot(c['p'][0]-nx,c['p'][1]-ny)<90]
v=max(cand,key=lambda c:c['h']);VOL=(v['p'][0]+4,v['p'][1]-4)
PYR={}
for st in (S_ITZ,S_XAL):
    cb=p['burgs'][p['states'][st]['capital']];PYR[cb['name']]=(cb['x']+9,cb['y']+3)
POR=(890.0,758.0)
ZIG=(1302.0,427.0);ANOR=(bxy("Anor'Londo")[0],bxy("Anor'Londo")[1]+2)
burgcells={b['cell'] for b in p['burgs'][1:] if b and 'cell' in b}|set(BURG_MOVE.values())
avoid=[(TREE,30),(VOL,34),(POR,12),(ZIG,22),((ANOR[0],ANOR[1]-6),18)]+[(q,14) for q in PYR.values()]
# stamps
rng=random.Random(SEED)
stamps=[]
def add(kind,x,y,s=1): stamps.append((y,kind,x,s))
for c in cells:
    if not land(c): continue
    x,y=c['p']
    if any(math.hypot(x-q[0],y-q[1])<r for q,r in avoid): continue
    if c['i'] in burgcells: continue
    t=terr(c);r=lambda a: (rng.random()-.5)*a
    if t in('mtn','mtns','mtnr'): add(t,x+r(4),y+r(3)+6,.85+rng.random()*.35)
    elif t=='hill':
        add('hill',x+r(5)-3,y+r(4)+2,1);add('hill',x+r(5)+4,y+r(4)+5,.8)
    elif t=='trees':
        for dx,dy in((-4,-1),(3,0),(0,4),(-2,6) if rng.random()<.5 else (5,5)): add('tree',x+dx+r(2),y+dy+r(2),.9+rng.random()*.25)
    elif t=='wild':
        for dx,dy in((-5,-2),(0,-3),(4,0),(-3,3),(2,5),(-6,5)): add('wtree',x+dx+r(2),y+dy+r(2),.95+rng.random()*.25)
    elif t=='pines':
        for dx,dy in((-4,0),(2,-1),(0,4),(5,4)): add('spine' if snowy(c) else 'pine',x+dx+r(2),y+dy+r(2),.9+rng.random()*.25)
    elif t=='jungle':
        add('palm',x-3+r(2),y+1+r(2),1);add('palm',x+4+r(2),y+3+r(2),.9);add('bush',x+r(3),y+6+r(2),1.2);add('bush',x-6+r(2),y+5,1)
    elif t=='dune':
        if rng.random()<.75: add('dune',x+r(6),y+r(5),.9+rng.random()*.4)
    elif t=='scrub':
        if rng.random()<.6: add('scrub',x+r(6),y+r(5),1+rng.random()*.3)
    elif t=='marsh':
        if rng.random()<.4: add('marsh',x+r(6),y+r(5),1)
    elif t=='tuft':
        if rng.random()<.45: add('tuft',x+r(6),y+r(5),1.1)
    elif t=='grass':
        if rng.random()<.22: add('grass',x+r(8),y+r(6),1.1)
stamps.sort()
DIM={'mtn':(26,19),'mtns':(26,19),'mtnr':(26,19),'hill':(16,7),'tree':(8,10),'wtree':(8,10),'pine':(8,12),'spine':(8,12),'palm':(10,11),'bush':(6,5),'dune':(14,5),'scrub':(8,5),'marsh':(8,5),'tuft':(6,4),'grass':(6,4)}
VB={'mtn':(-13,-18),'mtns':(-13,-18),'mtnr':(-13,-18),'hill':(-8,-6),'tree':(-4,-9),'wtree':(-4,-9),'pine':(-4,-11),'spine':(-4,-11),'palm':(-5,-10),'bush':(-3,-4),'dune':(-7,-4),'scrub':(-4,-4),'marsh':(-4,-4),'tuft':(-3,-3),'grass':(-3,-3)}
o=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" id="wsvg">',defs,f'<rect x="0" y="0" width="{W}" height="{H}" fill="#6aa0bf"/><rect x="0" y="0" width="{W}" height="{H}" fill="url(#po)"/>']
o.append(f'<path d="{"".join(coast)}" fill="none" stroke="#a7cfdf" stroke-width="16" stroke-opacity=".4" stroke-linecap="round" stroke-linejoin="round"/>')
o.append(f'<path d="{"".join(coast)}" fill="none" stroke="#d3e9f0" stroke-width="6" stroke-opacity=".7" stroke-linecap="round" stroke-linejoin="round"/>')
for col,ps in base.items(): o.append(f'<path d="{"".join(ps)}" fill="{col}" stroke="{col}" stroke-width="0.8"/>')
if lakes: o.append(f'<path d="{"".join(lakes)}" fill="#8fc0d6" stroke="#8fc0d6" stroke-width="0.8"/>')
o.append(f'<path d="{"".join(coast)}" fill="none" stroke="#3d4f57" stroke-width="1.3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>')
bd="".join(border)
def edge_mid(a,b):
    sv=set(cells[b]['v']);sh=[v for v in cells[a]['v'] if v in sv]
    if len(sh)<2: return None
    return ((V[sh[0]][0]+V[sh[1]][0])/2,(V[sh[0]][1]+V[sh[1]][1])/2)
def smooth(pts):
    if len(pts)<3: return 'M'+'L'.join(f"{x:.1f},{y:.1f}" for x,y in pts)
    s=f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1,len(pts)-1):
        mx,my=(pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2
        s+=f"Q{pts[i][0]:.1f},{pts[i][1]:.1f} {mx:.1f},{my:.1f}"
    return s+f"L{pts[-1][0]:.1f},{pts[-1][1]:.1f}"
o.append('<g id="w-rivers" class="ly-rivers" fill="none" stroke="#4f86a8" stroke-linecap="round" stroke-linejoin="round">')
for r in p['rivers']:
    if not r or 'cells' not in r: continue
    ids=[i for i in r['cells'] if 0<=i<len(cells)];pts=[];end=None
    for k,i in enumerate(ids):
        if land(cells[i]): pts.append(tuple(cells[i]['p']))
        else:
            if pts and k>0: end=edge_mid(ids[k-1],i)
            break
    if end: pts.append(end)
    if len(pts)<2: continue
    w=max(.6,min(2.8,(r.get('discharge',10)**.5)/7))
    o.append(f'<path d="{smooth(pts)}" stroke-width="{w*1.3+.4:.2f}" vector-effect="non-scaling-stroke"/>')
o.append('</g><g id="w-routes" class="ly-routes" fill="none" stroke-linecap="round">')
sty={'roads':('#a8453a','1.5','5 3'),'trails':('#8f6748','0.9','2 3'),'searoutes':('#f4f1e6','0.9','6 5')}
for r in p['routes']:
    if not r or 'points' not in r: continue
    c,w,da=sty.get(r.get('group'),('#888','0.6',''))
    o.append(f'<path d="M'+'L'.join(f"{x:.1f},{y:.1f}" for x,y,*_ in r['points'])+f'" stroke="{c}" stroke-width="{w}" stroke-dasharray="{da}" vector-effect="non-scaling-stroke"/>')
o.append('</g><g id="w-icons">')
for y,k,x,s in stamps:
    w,h=DIM[k];vx,vy=VB[k]
    o.append(f'<use href="#i-{k}" x="{x+vx*s:.1f}" y="{y+vy*s:.1f}" width="{w*s:.1f}" height="{h*s:.1f}"/>')
o.append('</g>')
o.append(f'<g id="w-borders" class="ly-states" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="{bd}" stroke="#fffaf0" stroke-opacity=".85" stroke-width="6.5" vector-effect="non-scaling-stroke"/><path d="{bd}" stroke="#6e1640" stroke-width="3.2" stroke-dasharray="12 5" vector-effect="non-scaling-stroke"/></g>')
o.append('<g id="w-lm">')
if wall:
    w_="".join(wall)
    o.append(f'<path d="{w_}" fill="none" stroke="#3a3128" stroke-width="5.2" stroke-linecap="round"/><path d="{w_}" fill="none" stroke="#9b9285" stroke-width="3.4" stroke-linecap="round"/><path d="{w_}" fill="none" stroke="#3a3128" stroke-width="1.6" stroke-dasharray="1.1 1.3"/>')
def tree(x,y,s=1):
    g=f'<g transform="translate({x:.1f},{y:.1f}) scale({s})">'
    g+='<path d="M-2.2,0 Q-1.5,-9 -1,-14 L1,-14 Q1.5,-9 2.2,0 Q4,1 6,1 L-6,1 Q-4,1 -2.2,0Z" fill="#6b4a2e" stroke="#3b2a1a" stroke-width=".5"/>'
    for cx,cy,r,col in((-9,-17,8,'#3f6f3c'),(9,-17,8,'#3f6f3c'),(0,-24,10,'#4c8546'),(-6,-27,6,'#5a9452'),(7,-27,6,'#5a9452'),(0,-32,6.5,'#69a35e')):
        g+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}" stroke="#2c4a2a" stroke-width=".5"/>'
    g+='<circle cx="-3" cy="-30" r="1.6" fill="#a9d48f" opacity=".8"/><circle cx="4" cy="-22" r="1.2" fill="#e8f2c8" opacity=".8"/><circle cx="-5" cy="-18" r=".9" fill="#ffe9a0"/><circle cx="6" cy="-26" r=".9" fill="#ffe9a0"/></g>'
    return g
o.append(tree(TREE[0],TREE[1],1.15))
vx,vy=VOL
o.append(f'<g transform="translate({vx:.1f},{vy:.1f})"><path d="M-26,0 L-7,-30 L7,-30 L26,0Z" fill="#7d6a58" stroke="#3b2f25" stroke-width=".8"/><path d="M0,-30 L7,-30 L26,0 L8,0Z" fill="#5c4c3e"/><path d="M-7,-30 Q0,-27 7,-30" fill="#c4442a"/><path d="M-3,-29 Q-5,-18 -9,-8 M2,-29 Q4,-20 2,-12 Q1,-6 5,0" stroke="#e8732f" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M-2,-33 Q-7,-40 -2,-46 Q3,-52 -1,-60 M3,-33 Q9,-41 6,-50" stroke="#7a7a7a" stroke-opacity=".55" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>')
def pyr(x,y,s=1):
    g=f'<g transform="translate({x:.1f},{y:.1f}) scale({s})">'
    for i,(w,h) in enumerate(((11,0),(8.6,-3.6),(6.2,-7.2),(3.8,-10.8))):
        g+=f'<path d="M{-w},{h} L{w},{h} L{w-2.4},{h-3.6} L{-w+2.4},{h-3.6}Z" fill="{"#d8b77a" if i%2==0 else "#cfab6c"}" stroke="#6b5030" stroke-width=".5"/>'
    return g+'<path d="M-1.4,-14.4 L1.4,-14.4 L1.4,-17 L-1.4,-17Z" fill="#a87d48" stroke="#6b5030" stroke-width=".5"/><path d="M0,0 L0,-14.4" stroke="#8a6a3c" stroke-width="1.6"/></g>'
for q in PYR.values(): o.append(pyr(q[0],q[1],1.1))
px,py=POR
o.append(f'<g transform="translate({px:.1f},{py:.1f})"><ellipse rx="10" ry="4" cy="1" fill="#2a0f1a" opacity=".35"/><path d="M-7,0 L-7,-13 Q0,-22 7,-13 L7,0" fill="none" stroke="#2b2523" stroke-width="3"/><path d="M-5.2,0 L-5.2,-12.4 Q0,-19.5 5.2,-12.4 L5.2,0Z" fill="#7b2a7a"/><path d="M-3.5,-1 L-3.5,-11.5 Q0,-16.5 3.5,-11.5 L3.5,-1Z" fill="#b84ac0"/><path d="M-1.6,-2 Q-2,-8 0,-12 Q2,-8 1.6,-2Z" fill="#7cf09a" opacity=".85"/></g>')
def silvermtn(x,y):
    g=f'<g transform="translate({x:.1f},{y+17:.1f})">'
    g+='<ellipse cx="0" cy="1" rx="30" ry="4" fill="#4a525a" opacity=".25"/>'
    g+='<path d="M-30,0 L-14,-20 L-9,-16 L-1,-36 L7,-24 L11,-28 L30,0Z" fill="#e6eaee" stroke="#3e464e" stroke-width=".8" stroke-linejoin="round"/>'
    g+='<path d="M-1,-36 L7,-24 L11,-28 L30,0 L6,0 L3,-14 L-2,-22Z" fill="#a2acb6"/><path d="M-14,-20 L-9,-16 L-12,-6 L-20,0 L-30,0Z" fill="#c3cbd3"/>'
    g+='<path d="M-1,-36 L3,-31 L0,-30 L-3,-31Z M11,-28 L13,-25 L10,-25Z" fill="#ffffff"/>'
    g+='<path d="M-22,-6 L-16,-9 M14,-10 L20,-6 M-6,-27 L-3,-24 M4,-8 L9,-5" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity=".9"/>'
    # town on the slope
    g+='<path d="M-11,-12 L9,-12 L9,-6 L-11,-6Z" fill="#8c8478" stroke="#2a211a" stroke-width=".6"/>'
    for hx,hc in((-9,'#5d6f86'),(-4,'#7a8ea6'),(1,'#5d6f86'),(5,'#7a8ea6')):
        g+=f'<path d="M{hx},-12 L{hx+1.8},-15.5 L{hx+3.6},-12Z" fill="{hc}" stroke="#2a211a" stroke-width=".5"/>'
    g+='<path d="M-1.5,-12 L-1.5,-19 L.5,-21 L2.5,-19 L2.5,-12Z" fill="#b9c2cb" stroke="#2a211a" stroke-width=".5"/><path d="M.5,-21 L.5,-24" stroke="#2a211a" stroke-width=".5"/><path d="M-.6,-9 L1.6,-9 L1.6,-6 L-.6,-6Z" fill="#2a211a"/>'
    return g+'</g>'
o.append(silvermtn(*ZIG))
def flycath(x,y):
    g=f'<g transform="translate({x:.1f},{y:.1f})"><ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#1e2a1a" opacity=".3"/>'
    for ax,tx in((-16,-8),(16,8),(-5,-3),(7,3)):
        mx=(ax+tx)/2+(2 if ax<0 else -2);g+=f'<path d="M{ax},-1 Q{mx},-12 {tx},-23" fill="none" stroke="#3a342e" stroke-width=".9" stroke-dasharray="1.3 .5"/><path d="M{ax},-1 Q{mx},-12 {tx},-23" fill="none" stroke="#b8ada0" stroke-width=".35" stroke-dasharray=".6 1.2"/>'
        g+=f'<path d="M{ax-1.3},.6 L{ax+1.3},.6 L{ax+.7},-1.4 L{ax-.7},-1.4Z" fill="#5a5248" stroke="#2b2723" stroke-width=".4"/>'
    g+='<path d="M-15,-25 Q0,-23 15,-25 L9,-17 L3,-10 L-1,-8 L-5,-12 L-11,-18Z" fill="#7c6a56" stroke="#3a2e22" stroke-width=".6"/><path d="M3,-10 L9,-17 L15,-25 Q8,-24 4,-24 L2,-15Z" fill="#5e4f40"/>'
    g+='<path d="M-15,-25 Q0,-27 15,-25 Q0,-23 -15,-25Z" fill="#6e9a58"/>'
    # cathedral
    g+='<path d="M-9,-25 L-9,-36 L9,-36 L9,-25Z" fill="#ddd6c4" stroke="#3a3128" stroke-width=".6"/><path d="M-9,-36 L0,-42 L9,-36Z" fill="#6c7a8c" stroke="#3a3128" stroke-width=".6"/>'
    for sx,sh in((-11,-44),(11,-44)):
        g+=f'<path d="M{sx-2.4},-25 L{sx-2.4},-38 L{sx+2.4},-38 L{sx+2.4},-25Z" fill="#e8e2d2" stroke="#3a3128" stroke-width=".6"/><path d="M{sx-2.6},-38 L{sx},{sh-4} L{sx+2.6},-38Z" fill="#59677a" stroke="#3a3128" stroke-width=".5"/>'
    g+='<path d="M-2,-36 L-2,-47 L2,-47 L2,-36Z" fill="#e8e2d2" stroke="#3a3128" stroke-width=".5"/><path d="M-2.4,-47 L0,-56 L2.4,-47Z" fill="#59677a" stroke="#3a3128" stroke-width=".5"/><path d="M0,-56 L0,-59 M-1,-58 L1,-58" stroke="#d9b54a" stroke-width=".6"/>'
    g+='<circle cx="0" cy="-32" r="2.2" fill="#e9c25a" stroke="#3a3128" stroke-width=".5"/>'
    for wx in(-6,-3,3,6): g+=f'<path d="M{wx-.8},-26 L{wx-.8},-29.5 Q{wx},-31 {wx+.8},-29.5 L{wx+.8},-26Z" fill="#e9c25a"/>'
    g+='<path d="M-1.4,-25 L-1.4,-28 Q0,-29.4 1.4,-28 L1.4,-25Z" fill="#3a3128"/>'
    return g+'</g>'
o.append(flycath(*ANOR))
o.append('</g><g id="w-burgs" class="ly-burgs"></g><g id="w-slabels">')
st={s['i']:s for s in p['states'] if not s.get('removed')}
for sid,s in st.items():
    pts=[c['p'] for c in cells if land(c) and c['state']==sid]
    if not pts:continue
    x,y=s['pole'] if s.get('pole') else (statistics.median(q[0] for q in pts),statistics.median(q[1] for q in pts))
    nm='United Hordes of War' if sid==S_WAR else STATE_RENAME.get(s['name'],s['name'])
    o.append(f'<text class="sl" x="{x:.1f}" y="{y:.1f}" data-area="{len(pts)}">{escape(nm)}</text>')
o.append('</g></svg>')
open(out,'w',encoding='utf-8',errors='replace').write(''.join(o))
B=[]
for b in p['burgs'][1:]:
    if not b or b.get('removed') or 'x' not in b:continue
    cap=b.get('capital',0);city=b.get('group')=='cities' or cap;nm=RENAME.get(b['name'],b['name'])
    e={'i':b['i'],'n':nm,'x':round(b['x'],1),'y':round(b['y'],1),'c':'cap' if cap else ('city' if city else 'town'),'s':STATE_RENAME.get(st.get(cells[b['cell']]['state'],{}).get('name',''),st.get(cells[b['cell']]['state'],{}).get('name','')),
       'pop':round(b.get('population',0)*1000),'ft':''.join(k[0] for k in ('citadel','walls','plaza','temple','shanty') if b.get(k)),'port':1 if b.get('port') else 0,'river':1 if cells[b['cell']].get('r') else 0,'seed':SEED+b['i']}
    if b['name'] in BURG_MOVE:
        mc=cells[BURG_MOVE[b['name']]];sn=st.get(mc['state'],{}).get('name','');e.update(x=round(mc['p'][0],1),y=round(mc['p'][1],1)+2,s=STATE_RENAME.get(sn,sn))
    if b['name']=='Vardrassil': e.update(lm='tree',x=round(TREE[0],1),y=round(TREE[1],1),lh=40)
    if b['name']=='Zigilgathol': e.update(lm='silver',x=ZIG[0],y=ZIG[1],lh=22)
    if b['name']=="Anor'Londo": e.update(lm='cath',x=round(ANOR[0],1),y=round(ANOR[1],1),lh=58)
    if b['name'] in PYR: e.update(lm='pyr',x=round(PYR[b['name']][0],1),y=round(PYR[b['name']][1],1),lh=19)
    B.append(e)
json.dump(B,open(out.replace('.svg','-burgs.json'),'w',encoding='utf-8',errors='replace'),ensure_ascii=False,separators=(',',':'))
print(len(''.join(o)),len(B),len(stamps))
