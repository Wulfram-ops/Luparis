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
BC={1:'#e6cf96',2:'#dccd98',3:'#d8cf98',4:'#ccd096',5:'#b2bf84',6:'#adbb83',7:'#a5b77e',8:'#abbb86',9:'#a3b48b',10:'#d6d2bb',11:'#f1eee4',12:'#bfcb98'}
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
    if sn=='nw': return '#e8e6db'
    if sn=='tundra': return '#dedccb'
    if sn=='snow': return '#f1eee4'
    if s==S_SYL: return '#8fa96f'
    if desx(c): return '#e8d098'
    if s==S_WAR: return '#c99a6a' if h>=27 else '#dcb684'
    if s in (S_XAL,S_ITZ): return '#9bb676'
    if h>=48: return '#d6ccb2'
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
from shapely.geometry import Polygon
from shapely.ops import unary_union
def dissolve(cl,simp=.35):
    ps=[Polygon([V[v] for v in c['v']]).buffer(0) for c in cl]
    if not ps: return ''
    u=unary_union(ps).simplify(simp,preserve_topology=True)
    geoms=getattr(u,'geoms',[u]);out=[]
    for g in geoms:
        for ring in [g.exterior,*g.interiors]:
            pts=list(ring.coords)[:-1]
            if len(pts)>=3: out.append('M'+'L'.join(f"{x:.1f},{y:.1f}" for x,y in pts)+'Z')
    return ''.join(out)
def grp(fn):
    g={}
    for c in cells:
        k=fn(c)
        if k is not None: g.setdefault(k,[]).append(c)
    return g
base=grp(lambda c: basecol(c) if land(c) else None)
lakes=dissolve([c for c in cells if not land(c) and islake(c)])
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
'mtn':f'<symbol id="i-mtn" viewBox="-13 -18 26 19" overflow="visible"><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0Z" fill="#ede2c6"/><path d="M3,-17 L12,0 L4,0 L1,-8 L-1,-12 L0,-14Z" fill="#b39d78"/><path d="M5,-11 L8,-4 M7,-12.5 L10,-5 M4,-7 L6,-2 M3.5,-13 L6,-7" stroke="{O}" stroke-width=".45" opacity=".75"/><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0" fill="none" stroke="{O}" stroke-width=".9" stroke-linejoin="round"/><path d="M-6,-6 L-4,-8 M-8,-3 L-6,-5" stroke="{O}" stroke-width=".5"/></symbol>',
'mtns':f'<symbol id="i-mtns" viewBox="-13 -18 26 19" overflow="visible"><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0Z" fill="#ebe1c8"/><path d="M3,-17 L12,0 L4,0 L1,-8 L-1,-12 L0,-14Z" fill="#a99372"/><path d="M5,-9 L8,-3 M7,-10 L10,-4 M4,-5 L6,-1" stroke="{O}" stroke-width=".45" opacity=".75"/><path d="M-5.5,-10.5 L-2,-16 L0,-14 L3,-17 L6.6,-10.4 L4,-11.5 L2,-9.5 L0,-11 L-2.5,-9Z" fill="#ffffff"/><path d="M-12,0 L-2,-16 L0,-14 L3,-17 L12,0" fill="none" stroke="{O}" stroke-width=".9" stroke-linejoin="round"/></symbol>',
'mtnr':f'<symbol id="i-mtnr" viewBox="-13 -18 26 19" overflow="visible"><path d="M-12,0 L-6,-9 L-3,-7 L1,-16 L5,-10 L7,-12 L12,0Z" fill="#c7855a"/><path d="M1,-16 L5,-10 L7,-12 L12,0 L3,0 L1,-7Z" fill="#8c4f33"/><path d="M-12,0 L-6,-9 L-3,-7 L1,-16 L5,-10 L7,-12 L12,0" fill="none" stroke="#4a2a1c" stroke-width=".9" stroke-linejoin="round"/></symbol>',
'hill':f'<symbol id="i-hill" viewBox="-8 -6 16 7" overflow="visible"><path d="M-7,0 Q-3,-6 1,-5 Q5,-4.5 7,0Z" fill="#c4bb8f"/><path d="M1,-5 Q5,-4.5 7,0 L2,0 Q3,-3 1,-5Z" fill="#a39a6f"/><path d="M-7,0 Q-3,-6 1,-5 Q5,-4.5 7,0" fill="none" stroke="#6d6447" stroke-width=".8"/></symbol>',
'tree':f'<symbol id="i-tree" viewBox="-4 -9 8 10" overflow="visible"><path d="M-.5,0 L-.5,-3 L.5,-3 L.5,0Z" fill="#5b4430"/><circle cx="0" cy="-5.2" r="3.6" fill="#6f8c4a" stroke="#2c3520" stroke-width=".6"/><path d="M0,-8.8 A3.6,3.6 0 0 1 3.6,-5.2 L1.6,-5.2 A1.6,1.6 0 0 0 0,-7Z" fill="#8ea862"/><path d="M-3.6,-5.2 A3.6,3.6 0 0 0 0,-1.6 L0,-3 Q-2,-3.5 -2.4,-5.2Z" fill="#56703a"/></symbol>',
'wtree':f'<symbol id="i-wtree" viewBox="-4 -9 8 10" overflow="visible"><path d="M-.5,0 L-.5,-3 L.5,-3 L.5,0Z" fill="#4a3624"/><circle cx="0" cy="-5.2" r="3.8" fill="#4f6d3a" stroke="#22301c" stroke-width=".6"/><path d="M0,-9 A3.8,3.8 0 0 1 3.8,-5.2 L1.6,-5.2 A1.6,1.6 0 0 0 0,-7Z" fill="#6a8a4c"/></symbol>',
'pine':f'<symbol id="i-pine" viewBox="-4 -11 8 12" overflow="visible"><path d="M-.5,0 L.5,0 L.5,-2 L-.5,-2Z" fill="#5b4430"/><path d="M-3.4,-1.6 L0,-10.5 L3.4,-1.6Z" fill="#4c6845" stroke="#24321f" stroke-width=".6" stroke-linejoin="round"/><path d="M0,-10.5 L3.4,-1.6 L.8,-1.6Z" fill="#3a5235"/></symbol>',
'spine':f'<symbol id="i-spine" viewBox="-4 -11 8 12" overflow="visible"><path d="M-.5,0 L.5,0 L.5,-2 L-.5,-2Z" fill="#5b4430"/><path d="M-3.4,-1.6 L0,-10.5 L3.4,-1.6Z" fill="#47634a" stroke="#24321f" stroke-width=".6" stroke-linejoin="round"/><path d="M-1.6,-6 L0,-10.5 L1.6,-6 L.6,-6.8 L0,-6 L-.7,-6.8Z" fill="#ffffff"/><path d="M-3,-2.4 L-1.8,-4 L-.4,-3 L1,-4.2 L3,-2.4" fill="none" stroke="#ffffff" stroke-width=".8"/></symbol>',
'palm':f'<symbol id="i-palm" viewBox="-5 -10 10 11" overflow="visible"><path d="M0,0 Q.8,-4 .2,-7.5" stroke="#6b5232" stroke-width="1" fill="none"/><path d="M.2,-7.5 Q-2.6,-9 -4.6,-6.2 M.2,-7.5 Q3,-9 4.8,-6.4 M.2,-7.5 Q-1.4,-10.4 -3.6,-10 M.2,-7.5 Q1.8,-10.4 3.8,-10.2 M.2,-7.5 Q.6,-10.8 .4,-11" stroke="#4f7a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/></symbol>',
'bush':f'<symbol id="i-bush" viewBox="-3 -4 6 5" overflow="visible"><circle cx="-1.2" cy="-1.6" r="1.8" fill="#5f7f45" stroke="#2c3a22" stroke-width=".5"/><circle cx="1.3" cy="-1.8" r="1.6" fill="#6e8f50" stroke="#2c3a22" stroke-width=".5"/></symbol>',
'dune':f'<symbol id="i-dune" viewBox="-7 -4 14 5" overflow="visible"><path d="M-6,0 Q-2,-4 3,-3 Q5,-2.4 6,0Z" fill="#e2c584"/><path d="M-6,0 Q-2,-4 3,-3 Q5,-2.4 6,0" fill="none" stroke="#b08a4a" stroke-width=".7"/><path d="M-1,-2.5 Q1,-1 0,0" fill="none" stroke="#b08a4a" stroke-width=".5"/></symbol>',
'scrub':f'<symbol id="i-scrub" viewBox="-4 -4 8 5" overflow="visible"><path d="M-3.5,0 L-2.2,-2.2 L-.6,-1.2 L.4,-2.8 L2.2,-1 L3.6,0Z" fill="#b9784c" stroke="#5a3422" stroke-width=".5"/><path d="M2.6,-.2 L2.8,-2.4 M3.2,-.2 L3.8,-2 M2,-.2 L1.6,-1.8" stroke="#7d7330" stroke-width=".5"/></symbol>',
'marsh':f'<symbol id="i-marsh" viewBox="-4 -4 8 5" overflow="visible"><path d="M-3.5,0 L3.5,0" stroke="#7aa3b0" stroke-width=".7"/><path d="M-1.6,0 L-2.4,-3 M-.6,0 L-.6,-3.6 M.4,0 L1.2,-3" stroke="#5d7d4a" stroke-width=".6"/></symbol>',
'tuft':f'<symbol id="i-tuft" viewBox="-3 -3 6 4" overflow="visible"><path d="M-2,0 L-2.6,-2 M-.8,0 L-.8,-2.6 M.4,0 L1,-2" stroke="#8b958a" stroke-width=".55"/><path d="M1,.2 Q2.2,-.6 3,.2" stroke="#ffffff" stroke-width=".8" fill="none"/></symbol>',
'grass':f'<symbol id="i-grass" viewBox="-3 -3 6 4" overflow="visible"><path d="M-1.6,0 L-2.2,-2 M-.6,0 L-.6,-2.5 M.4,0 L1,-2" stroke="#7f9a5a" stroke-width=".55"/></symbol>',
}
# ---- new terrain icons (generated) ----
def _pts(L): return ' '.join(f'{x},{y}' for x,y in L)
MSH={
 'a':dict(sil=[(-13,0),(-7,-8),(-5,-7),(0,-20),(4,-13),(6,-14),(13,0)],
          sh=[[(0,-20),(4,-13),(6,-14),(13,0),(1,0),(1.5,-7),(-1,-13)]],
          rid=[[(0,-20),(-1,-13),(1.5,-7),(1,0)],[(-7,-8),(-6,-4)]],
          snow=[[(-4,-12.5),(0,-20),(3.6,-13.6),(2,-12.8),(.6,-14.2),(-1.2,-12),(-2.6,-13.2)]],
          hat=[(2,-15,4,-12),(3,-11,6,-8),(4,-7,8,-4),(6,-11,9,-7),(2.5,-6,5,-2),(8,-6,11,-2)]),
 'b':dict(sil=[(-14,0),(-6,-16),(-3,-12),(2,-19),(7,-10),(9,-11),(14,0)],
          sh=[[(2,-19),(7,-10),(9,-11),(14,0),(4,0),(4,-9)],[(-6,-16),(-3,-12),(-2,-8),(-3,0),(-5,-7)]],
          rid=[[(2,-19),(4,-9),(4,0)],[(-6,-16),(-5,-7),(-3,0)]],
          snow=[[(-1.5,-13),(2,-19),(5.2,-13.4),(3.5,-12.6),(2.2,-14),(.4,-12.2)],[(-8.6,-12),(-6,-16),(-4,-13),(-5.6,-12.4),(-7,-11.4)]],
          hat=[(5,-14,7,-11),(5.5,-9,9,-6),(7,-5,11,-2),(9.5,-8,12,-4),(-4,-11,-3,-8),(-3.5,-6,-3,-3)]),
 'c':dict(sil=[(-14,0),(-9,-7),(-3,-17),(0,-15),(3,-19),(9,-8),(14,0)],
          sh=[[(3,-19),(9,-8),(14,0),(2,0),(2.5,-9),(1,-14)]],
          rid=[[(3,-19),(1,-14),(2.5,-9),(2,0)],[(-3,-17),(-4,-10),(-6,-4)]],
          snow=[[(-5,-13.5),(-3,-17),(0,-15),(3,-19),(6,-13.2),(4.2,-13.8),(2.4,-12.6),(.6,-14),(-1.6,-12.6),(-3.4,-13.8)]],
          hat=[(4,-15,6,-12),(4,-11,8,-8),(4,-6,8,-3),(8,-9,11,-5),(9,-4,12,-1)])}
def msym(sid,shape,lit,shade,ink,snow=False):
    S=MSH[shape];g=f'<symbol id="i-{sid}" viewBox="-15 -21 30 22" overflow="visible">'
    g+=f'<ellipse cx="3" cy="0" rx="14" ry="2.2" fill="#3b2a1a" opacity=".16"/>'
    g+=f'<polygon points="{_pts(S["sil"]+[(S["sil"][-1][0],0),(S["sil"][0][0],0)])}" fill="{lit}"/>'
    for P in S['sh']: g+=f'<polygon points="{_pts(P)}" fill="{shade}"/>'
    if snow:
        for P in S['snow']: g+=f'<polygon points="{_pts(P)}" fill="#fbfaf4" stroke="{ink}" stroke-width=".35" stroke-linejoin="round"/>'
    g+='<g stroke="'+ink+'" stroke-width=".45" stroke-linecap="round" opacity=".7">'+''.join(f'<path d="M{a},{b} L{c},{d}"/>' for a,b,c,d in S['hat'])+'</g>'
    for R_ in S['rid']: g+=f'<polyline points="{_pts(R_)}" fill="none" stroke="{ink}" stroke-width=".55" stroke-linecap="round" opacity=".8"/>'
    g+=f'<polyline points="{_pts(S["sil"])}" fill="none" stroke="{ink}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/>'
    return g+'</symbol>'
for sh in 'abc':
    SYM['mtn'+sh]=msym('mtn'+sh,sh,'#efe5ca','#b9a37e',O)
    SYM['mtns'+sh]=msym('mtns'+sh,sh,'#ece3cc','#a99476',O,True)
    SYM['mtnr'+sh]=msym('mtnr'+sh,sh,'#d38f62','#94553a','#4a2a1c')
    SYM['mtnd'+sh]=msym('mtnd'+sh,sh,'#ead7a6','#c4a46e','#5a4026')
def tsym(sid,dark,mid,light,ink):
    g=f'<symbol id="i-{sid}" viewBox="-5 -11 10 12" overflow="visible"><ellipse cx="1" cy="0" rx="3.6" ry="1" fill="#2a2414" opacity=".22"/><path d="M-.6,0 L-.5,-3.5 L.5,-3.5 L.6,0Z" fill="#5a4129" stroke="{ink}" stroke-width=".35"/>'
    C=[(-2.2,-5,2.6),(2.1,-5.3,2.5),(0,-7.6,2.8),(0,-4,2.4)]
    g+=''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{mid}" stroke="{ink}" stroke-width=".7"/>' for x,y,r in C)
    g+=''.join(f'<circle cx="{x}" cy="{y}" r="{r-.35}" fill="{mid}"/>' for x,y,r in C)
    g+=f'<path d="M1.2,-3 A2.6,2.6 0 0 0 4.3,-5.6 A2.4,2.4 0 0 1 1,-2Z" fill="{dark}"/><path d="M-2.4,-4.2 Q0,-2.6 2.4,-3.6 Q1,-1.8 -.2,-1.8 Q-1.8,-2.2 -2.4,-4.2Z" fill="{dark}" opacity=".8"/>'
    g+=f'<circle cx="-.9" cy="-8.4" r="1.2" fill="{light}"/><circle cx="-2.9" cy="-5.8" r=".9" fill="{light}"/>'
    return g+'</symbol>'
def psym(sid,dark,mid,ink,snow=False):
    g=f'<symbol id="i-{sid}" viewBox="-4 -12 8 13" overflow="visible"><ellipse cx="1" cy="0" rx="3" ry=".9" fill="#2a2414" opacity=".22"/><path d="M-.5,0 L.5,0 L.5,-1.8 L-.5,-1.8Z" fill="#5a4129"/>'
    for y0,w,h in ((-1.6,3.6,4.6),(-4.4,2.9,4.4),(-7.1,2.1,4.2)):
        g+=f'<path d="M{-w},{y0} L0,{y0-h} L{w},{y0} Q0,{y0+.8} {-w},{y0}Z" fill="{mid}" stroke="{ink}" stroke-width=".55" stroke-linejoin="round"/><path d="M0,{y0-h} L{w},{y0} Q{w/2},{y0+.5} .3,{y0+.4}Z" fill="{dark}"/>'
        if snow: g+=f'<path d="M{-w*.7},{y0-h*.32} L0,{y0-h} L{w*.6},{y0-h*.35} L.2,{y0-h*.5}Z" fill="#fbfaf4"/>'
    return g+'</symbol>'
SYM['tree']=tsym('tree','#56713a','#7d9a52','#a6bd78','#27301b')
SYM['wtree']=tsym('wtree','#3c5530','#57733f','#7f9a5c','#1f2a17')
SYM['pine']=psym('pine','#344b30','#4e6a45','#1f2a19')
SYM['spine']=psym('spine','#3d5240','#566f55','#1f2a19',True)
defs='<defs>'+''.join(SYM.values())+'<pattern id="po" width="34" height="18" patternUnits="userSpaceOnUse"><path d="M3,10 Q7,7 11,10 T19,10" fill="none" stroke="#2f4a46" stroke-opacity=".22" stroke-width=".6"/><path d="M20,3 Q23,1 26,3" fill="none" stroke="#2f4a46" stroke-opacity=".15" stroke-width=".5"/></pattern></defs>'
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
avoid=[(TREE,34),((TREE[0],TREE[1]-38),34),(VOL,34),(POR,12),(ZIG,22),((ANOR[0],ANOR[1]-6),18)]+[(q,14) for q in PYR.values()]
# stamps
rng=random.Random(SEED)
stamps=[];MC=[];TC=[]
def add(kind,x,y,s=1): stamps.append((y,kind,x,s))
for c in cells:
    if not land(c): continue
    x,y=c['p']
    if any(math.hypot(x-q[0],y-q[1])<r for q,r in avoid): continue
    if c['i'] in burgcells: continue
    t=terr(c);r=lambda a: (rng.random()-.5)*a
    if t in('mtn','mtns','mtnr'):
        k=('mtnd' if t=='mtn' and desx(c) else t);hh=effh(c);sc=max(.8,min(1.45,.8+(hh-48)/55))
        MC.append((sc,k,x+r(5),y+r(4)+5));
        if hh>=60: MC.append((sc*.85,k,x+r(14),y+r(10)+5))
    elif t=='hill':
        add('hill',x+r(5)-3,y+r(4)+2,1);add('hill',x+r(5)+4,y+r(4)+5,.8)
    elif t in('trees','wild','pines'):
        k={'trees':'tree','wild':'wtree'}.get(t,'spine' if snowy(c) else 'pine')
        for _ in range(7): TC.append((k,x+r(22),y+r(20)+3,.85+rng.random()*.25))
    elif t=='jungle':
        add('palm',x-3+r(2),y+1+r(2),1);add('palm',x+4+r(2),y+3+r(2),.9);add('bush',x+r(3),y+6+r(2),1.2);add('bush',x-6+r(2),y+5,1)
    elif t=='dune':
        if rng.random()<.75: add('dune',x+r(6),y+r(5),.9+rng.random()*.4)
    elif t=='scrub':
        if rng.random()<.6: add('scrub',x+r(6),y+r(5),1+rng.random()*.3)
    elif t=='marsh':
        if rng.random()<.4: add('marsh',x+r(6),y+r(5),1)
    elif t=='tuft':
        if rng.random()<.3: add('tuft',x+r(6),y+r(5),1.1)
    elif t=='grass':
        if rng.random()<.12: add('grass',x+r(8),y+r(6),1.1)
# spaced placement: mountains (big first), then trees
_grid={}
def _near(x,y,R_):
    gx,gy=int(x//24),int(y//24)
    for i in range(gx-2,gx+3):
        for j in range(gy-2,gy+3):
            for q in _grid.get((i,j),()): yield q
def _put(q): _grid.setdefault((int(q[0]//24),int(q[1]//24)),[]).append(q)
MC.sort(key=lambda t:-t[0])
for sc,k,x,y in MC:
    if all(((x-a)/(9.5*(sc+b)))**2+((y-c_)/(5.2*(sc+b)))**2>=1 for a,c_,b,_ in _near(x,y,0)):
        _put((x,y,sc,'m'));add(k+'abc'[int(rng.random()*3)],x,y,sc)
_tg={}
for k,x,y,sc in TC:
    gx,gy=int(x//10),int(y//10)
    if any(math.hypot(x-a,y-b)<5.2 for i in range(gx-1,gx+2) for j in range(gy-1,gy+2) for a,b in _tg.get((i,j),())): continue
    if any(((x-a)/(9.5*(b+.4)))**2+((y-c_)/(5.2*(b+.4)))**2<1 for a,c_,b,_ in _near(x,y,0)): continue
    _tg.setdefault((gx,gy),[]).append((x,y));add(k,x,y,sc)
stamps.sort()
DIM={**{m+v:(30,22) for m in ('mtn','mtns','mtnr','mtnd') for v in 'abc'},'mtn':(26,19),'mtns':(26,19),'mtnr':(26,19),'hill':(16,7),'tree':(10,12),'wtree':(10,12),'pine':(8,13),'spine':(8,13),'palm':(10,11),'bush':(6,5),'dune':(14,5),'scrub':(8,5),'marsh':(8,5),'tuft':(6,4),'grass':(6,4)}
VB={**{m+v:(-15,-21) for m in ('mtn','mtns','mtnr','mtnd') for v in 'abc'},'mtn':(-13,-18),'mtns':(-13,-18),'mtnr':(-13,-18),'hill':(-8,-6),'tree':(-5,-11),'wtree':(-5,-11),'pine':(-4,-12),'spine':(-4,-12),'palm':(-5,-10),'bush':(-3,-4),'dune':(-7,-4),'scrub':(-4,-4),'marsh':(-4,-4),'tuft':(-3,-3),'grass':(-3,-3)}
o=[f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" id="wsvg">',defs,f'<rect x="0" y="0" width="{W}" height="{H}" fill="#7b9893"/>']
o.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="url(#po)"/>')
cj=dissolve([c for c in cells if land(c)],.25)
o.append(f'<defs><path id="cst" d="{cj}"/></defs><g fill="none" stroke-linecap="round" stroke-linejoin="round">')
o.append('<use href="#cst" stroke="#9ab2a7" stroke-opacity=".35" stroke-width="110"/><use href="#cst" stroke="#9fb7ab" stroke-opacity=".45" stroke-width="64"/>')
for w_ in (34,24,15):
    o.append(f'<use href="#cst" stroke="#3f5c57" stroke-opacity=".38" stroke-width="{w_}"/><use href="#cst" stroke="#a2b9ad" stroke-width="{w_-1.3}"/>')
o.append('</g>')
for col,ps in base.items(): o.append(f'<path d="{dissolve(ps)}" fill="{col}" stroke="{col}" stroke-width="0.8" stroke-linejoin="round"/>')
FCOL={'trees':'#8fa463','wild':'#6c8450','pines':'#6f8562','jungle':'#86a35e'}
for t_,col in FCOL.items():
    ps=dissolve([c for c in cells if land(c) and terr(c)==t_ and not any(math.hypot(c['p'][0]-q[0],c['p'][1]-q[1])<r_ for q,r_ in avoid)])
    if ps: o.append(f'<path d="{ps}" fill="{col}" stroke="{col}" stroke-width="5" stroke-linejoin="round" opacity=".85"/>')
if lakes: o.append(f'<path d="{"".join(lakes)}" fill="#9ab8b0" stroke="#9ab8b0" stroke-width="0.8"/>')
o.append(f'<use href="#cst" fill="none" stroke="#2e2419" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>')
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
o.append('<g id="w-rivers" class="ly-rivers" fill="none" stroke="#4d7a80" stroke-linecap="round" stroke-linejoin="round">')
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
sty={'roads':('#a8453a','1.5','5 3'),'trails':('#8f6748','0.9','2 3'),'searoutes':('#5a3b24','1','7 5')}
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
    rr=random.Random(7)
    g=f'<g transform="translate({x:.1f},{y:.1f}) scale({s})">'
    g+='<defs><radialGradient id="wtg"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset=".55" stop-color="#e9f3a8" stop-opacity=".25"/><stop offset="1" stop-color="#e9f3a8" stop-opacity="0"/></radialGradient></defs>'
    g+='<ellipse cx="0" cy="-52" rx="62" ry="54" fill="url(#wtg)"/><ellipse cx="4" cy="2" rx="40" ry="6" fill="#2a2414" opacity=".25"/>'
    # roots
    for d in ('M-6,-4 Q-18,-2 -30,4','M-4,-2 Q-12,2 -18,7','M5,-4 Q18,-3 31,3','M3,-1 Q10,3 16,8','M0,-1 Q1,4 -2,9'):
        g+=f'<path d="{d}" fill="none" stroke="#3b2a1a" stroke-width="4.2" stroke-linecap="round"/><path d="{d}" fill="none" stroke="#7a5636" stroke-width="2.6" stroke-linecap="round"/>'
    # trunk with branches
    g+='<path d="M-11,0 Q-7,-14 -6,-26 Q-7,-36 -16,-46 L-12,-48 Q-4,-40 -2,-34 Q-1,-44 -6,-58 L-1,-59 Q3,-46 3,-36 Q8,-46 17,-50 L19,-46 Q9,-40 7,-28 Q7,-14 12,0Z" fill="#7a5636" stroke="#2e2014" stroke-width="1.1" stroke-linejoin="round"/>'
    g+='<path d="M3,-36 Q8,-24 7,-12 Q8,-5 12,0 L4,0 Q3,-14 3,-36Z" fill="#5a3e25"/>'
    g+='<path d="M-6,-6 Q-4,-16 -5,-24 M-1,-8 Q0,-18 -1,-28 M4,-10 Q5,-18 4,-26" fill="none" stroke="#3b2a1a" stroke-width=".6" opacity=".7"/>'
    # canopy: many leaf clusters, back to front
    cl=[]
    for k in range(34):
        a=rr.uniform(0,2*math.pi);rad=rr.uniform(0,1)**.6
        cx=math.cos(a)*44*rad;cy=-66+math.sin(a)*30*rad-(1-rad)*6;cl.append((cy,cx,rr.uniform(8,13)))
    cl.sort()
    g+=''.join(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r_:.1f}" fill="#4f7a3c" stroke="#1f2e17" stroke-width="1.2"/>' for cy,cx,r_ in cl)
    g+=''.join(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r_-.7:.1f}" fill="{["#4f7a3c","#5d8a45","#67974c"][i%3]}"/>' for i,(cy,cx,r_) in enumerate(cl))
    g+=''.join(f'<path d="M{cx-r_*.55:.1f},{cy-r_*.2:.1f} A{r_*.6:.1f},{r_*.6:.1f} 0 0 1 {cx+r_*.3:.1f},{cy-r_*.62:.1f}" fill="none" stroke="#a8cc7a" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>' for cy,cx,r_ in cl[::2])
    g+=''.join(f'<path d="M{cx-r_*.5:.1f},{cy+r_*.55:.1f} A{r_*.7:.1f},{r_*.7:.1f} 0 0 0 {cx+r_*.7:.1f},{cy+r_*.1:.1f}" fill="none" stroke="#2f4a24" stroke-width="1.2" opacity=".6"/>' for cy,cx,r_ in cl[1::2])
    # glowing lights and small dwellings in the crown
    for k in range(22):
        a=rr.uniform(0,2*math.pi);rad=rr.uniform(.15,.95);px=math.cos(a)*42*rad;py=-64+math.sin(a)*27*rad
        g+=f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rr.uniform(.7,1.3):.1f}" fill="#ffe58a" opacity=".95"/>'
    for hx,hy in ((-18,-50),(14,-56),(-4,-78),(22,-70),(-26,-66)):
        g+=f'<path d="M{hx-3},{hy} L{hx-3},{hy-3} L{hx},{hy-5.5} L{hx+3},{hy-3} L{hx+3},{hy}Z" fill="#d9c59a" stroke="#2e2014" stroke-width=".5"/><path d="M{hx-3.6},{hy-3} L{hx},{hy-6.3} L{hx+3.6},{hy-3}" fill="none" stroke="#7a3a2a" stroke-width="1"/><rect x="{hx-.7}" y="{hy-2.2}" width="1.4" height="1.6" fill="#ffd35a"/>'
    # hanging bridges
    g+='<path d="M-18,-50 Q-2,-44 14,-56" fill="none" stroke="#3b2a1a" stroke-width=".6" stroke-dasharray="1 .8"/><path d="M-4,-78 Q10,-70 22,-70" fill="none" stroke="#3b2a1a" stroke-width=".6" stroke-dasharray="1 .8"/>'
    return g+'</g>'
o.append(tree(TREE[0],TREE[1],.62))
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

# sea decorations: serpents and ships in open water
_lp=[c['p'] for c in cells if land(c)][::3]
def _far(x,y): return min(math.hypot(x-a,y-b) for a,b in _lp)
_cand=[c for c in cells[::5] if not land(c) and not islake(c) and 80<c['p'][0]<W-80 and 80<c['p'][1]<H-80]
_cand=[(c['p'],_far(*c['p'])) for c in _cand]
_cand.sort(key=lambda t:-t[1])
_deco=[]
for (x,y),d in _cand:
    if d<55: break
    if all(math.hypot(x-a,y-b)>260 for a,b,_ in _deco): _deco.append((x,y,len(_deco)))
    if len(_deco)>=6: break
def serpent(x,y,s=1,flip=1):
    g=f'<g transform="translate({x:.1f},{y:.1f}) scale({s*flip},{s})" opacity=".9">'
    for i,(cx,r) in enumerate(((-16,6),(-3,7),(10,5.5))):
        g+=f'<path d="M{cx-r},0 A{r},{r*1.1} 0 0 1 {cx+r},0" fill="#5f7d64" stroke="#22301f" stroke-width=".9"/><path d="M{cx-r*.6},-{r*.55} A{r*.6},{r*.6} 0 0 1 {cx+r*.4},-{r*.85}" fill="none" stroke="#a7bf8e" stroke-width=".7"/>'
        g+=f'<path d="M{cx-r-2},1.2 Q{cx},2.6 {cx+r+2},1.2" fill="none" stroke="#e9efe2" stroke-width=".7" opacity=".8"/>'
    g+='<path d="M16,0 Q17,-12 24,-13 Q30,-13 30,-9 L25,-8 Q22,-7 21,0Z" fill="#5f7d64" stroke="#22301f" stroke-width=".9"/><circle cx="26" cy="-11" r=".9" fill="#f3d36b"/><path d="M20,-12 L18,-17 L22,-13 L22,-18 L24,-13" fill="#a8463a" stroke="#22301f" stroke-width=".5"/><path d="M-22,0 Q-27,-4 -29,1 Q-26,-1 -24,1" fill="#5f7d64" stroke="#22301f" stroke-width=".8"/>'
    return g+'</g>'
def ship(x,y,s=1):
    g=f'<g transform="translate({x:.1f},{y:.1f}) scale({s})">'
    g+='<path d="M-11,0 L11,0 L7,5 L-8,5Z" fill="#7a5234" stroke="#2e2419" stroke-width=".8"/><path d="M0,0 L0,-19" stroke="#2e2419" stroke-width="1"/>'
    g+='<path d="M.8,-18 Q9,-12 .8,-3Z" fill="#efe6cc" stroke="#2e2419" stroke-width=".7"/><path d="M-.8,-16 Q-8,-11 -.8,-4Z" fill="#e6dcc0" stroke="#2e2419" stroke-width=".7"/><path d="M0,-19 L5,-20 L0,-17" fill="#a8463a"/>'
    g+='<path d="M-14,6 Q-9,4 -4,6 T6,6 T15,6" fill="none" stroke="#e9efe2" stroke-width=".8"/></g>'
    return g
for x,y,i in _deco: o.append(serpent(x,y,2.3,-1 if i%2 else 1) if i%3!=1 else ship(x,y,2.2))
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
    if b['name']=='Vardrassil': e.update(lm='tree',x=round(TREE[0],1),y=round(TREE[1],1),lh=62)
    if b['name']=='Zigilgathol': e.update(lm='silver',x=ZIG[0],y=ZIG[1],lh=22)
    if b['name']=="Anor'Londo": e.update(lm='cath',x=round(ANOR[0],1),y=round(ANOR[1],1),lh=58)
    if b['name'] in PYR: e.update(lm='pyr',x=round(PYR[b['name']][0],1),y=round(PYR[b['name']][1],1),lh=19)
    B.append(e)
json.dump(B,open(out.replace('.svg','-burgs.json'),'w',encoding='utf-8',errors='replace'),ensure_ascii=False,separators=(',',':'))
print(len(''.join(o)),len(B),len(stamps))
