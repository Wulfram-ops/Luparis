# Flat "atlas" style (Sword Coast-like): exec'd from world4.py with its variables in scope.
# Writes world-full.svg (all art, used only to render the rasters) and the burgs json.
from collections import deque
def _chaikin(pts,n=2):
    for _ in range(n):
        q_=[]
        for i in range(len(pts)):
            a=pts[i];b=pts[(i+1)%len(pts)]
            q_+= [(a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25),(a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75)]
        pts=q_
    return pts
def sdis(cl,r=2.5,simp=.6,ch=2,minA=6):
    ps=[Polygon([V[v] for v in c['v']]).buffer(0) for c in cl]
    if not ps: return ''
    u=unary_union(ps)
    if r: u=u.buffer(r,join_style=1).buffer(-2*r,join_style=1).buffer(r,join_style=1)
    u=u.simplify(simp,preserve_topology=True);out=[]
    for g in getattr(u,'geoms',[u]):
        if g.is_empty or g.area<minA: continue
        for ring in [g.exterior,*g.interiors]:
            pts=list(ring.coords)[:-1]
            if len(pts)<3: continue
            pts=_chaikin(pts,ch)
            out.append('M'+'L'.join(f"{x:.1f},{y:.1f}" for x,y in pts)+'Z')
    return ''.join(out)
P_={}
P_['stip']='<pattern id="p-stip" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><circle cx=".8" cy=".9" r=".55" fill="#235c3c" fill-opacity=".55"/><circle cx="2.4" cy="2.3" r=".45" fill="#7cc191" fill-opacity=".45"/></pattern>'
P_['crag']='<pattern id="p-crag" width="5.5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><path d="M.3,3.5 L1.5,1.2 L2.3,2.2 L3.4,.6 L5.2,3.5" fill="none" stroke="#5e564c" stroke-width=".42" stroke-linejoin="round"/><path d="M3.4,.6 L3.9,2.1 L5.2,3.5" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width=".3"/></pattern>'
P_['hill']='<pattern id="p-hill" width="6.5" height="4.5" patternUnits="userSpaceOnUse"><path d="M.5,3.5 Q2,1 3.6,3.5" fill="none" stroke="#8e7a4a" stroke-width=".42"/><path d="M3.8,1.6 Q5,.2 6.2,1.6" fill="none" stroke="#8e7a4a" stroke-opacity=".6" stroke-width=".35"/></pattern>'
P_['dune']='<pattern id="p-dune" width="9" height="5" patternUnits="userSpaceOnUse"><path d="M0,3.5 Q2.2,1.6 4.5,3.5 T9,3.5" fill="none" stroke="#b9925a" stroke-width=".38"/></pattern>'
P_['snow']='<pattern id="p-snow" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0,2 L4,2" stroke="#c3ccd2" stroke-width=".35"/></pattern>'
P_['marsh']='<pattern id="p-marsh" width="6" height="4.5" patternUnits="userSpaceOnUse"><path d="M.5,2 L2.3,2 M3.4,3.8 L5.4,3.8" stroke="#4f86b0" stroke-width=".35"/><path d="M1.2,2 L.9,.9 M1.6,2 L1.7,.7" stroke="#5f8a52" stroke-width=".3"/></pattern>'
P_['scrub']='<pattern id="p-scrub" width="5" height="4" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.3" r=".55" fill="#9a6a44" fill-opacity=".55"/><circle cx="3.6" cy="3" r=".45" fill="#9a6a44" fill-opacity=".45"/></pattern>'
P_['swirl']='<pattern id="p-swirl" width="46" height="34" patternUnits="userSpaceOnUse"><path d="M3,10 C9,4 17,4 21,10 S33,16 39,9" fill="none" stroke="#ffffff" stroke-opacity=".16" stroke-width=".7"/><path d="M8,26 C14,21 20,22 24,27 S34,31 42,25" fill="none" stroke="#1f5a86" stroke-opacity=".14" stroke-width=".7"/><path d="M26,17 q3,-3 6,0" fill="none" stroke="#ffffff" stroke-opacity=".13" stroke-width=".5"/></pattern>'
defs='<defs>'+''.join(P_.values())+'<filter id="f-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="7"/></filter></defs>'
o=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" id="wsvg">',defs]
# --- land
LAND=[c for c in cells if land(c)]
LANDD=sdis(LAND,1.2,.3,2,0)
o.append(f'<path d="{LANDD}" fill="#cfe3a3"/>')
def cls(c):
    t=terr(c);sn=snowy(c)
    if t in('trees','wild','jungle'): return 'forest'
    if t=='pines': return 'snowpine' if sn else 'pine'
    if t in('mtn','mtns','mtnr'): return 'snowmtn' if (sn or t=='mtns') else ('redmtn' if t=='mtnr' else ('desmtn' if desx(c) else 'mtn'))
    if t=='hill': return 'hill'
    if t=='dune': return 'dune'
    if t=='marsh': return 'marsh'
    if t=='scrub': return 'scrub'
    if sn: return 'snow'
    return None
STY={'snow':('#f4f7f7','p-snow',None),'dune':('#ead09a','p-dune',None),'scrub':('#d9b98a','p-scrub',None),'marsh':('#bcd8b6','p-marsh',None),'hill':('#dccb93','p-hill',None),
     'mtn':('#b9b0a2','p-crag','#6b6257'),'desmtn':('#cbb48c','p-crag','#7a6446'),'redmtn':('#c48a64','p-crag','#6e3f28'),'snowmtn':('#e7ebee','p-crag','#8a939a'),
     'forest':('#3f9463','p-stip','#215a3b'),'pine':('#357f58','p-stip','#1d4c34'),'snowpine':('#4a8667','p-stip','#24503a')}
groups={}
for c in LAND:
    k=cls(c)
    if k: groups.setdefault(k,[]).append(c)
dry=[c for c in LAND if not cls(c) and (c['biome'] in (1,2,3,4) or c['state']==S_WAR)]
if dry: o.append(f'<path d="{sdis(dry,3)}" fill="#dfdc9f"/>')
for k in ('snow','dune','scrub','marsh','hill','mtn','desmtn','redmtn','snowmtn','forest','pine','snowpine'):
    if k not in groups: continue
    col,pat,ln=STY[k];d=sdis(groups[k],2.5)
    o.append(f'<path d="{d}" fill="{col}"/><path d="{d}" fill="url(#{pat})"/>'+(f'<path d="{d}" fill="none" stroke="{ln}" stroke-width=".9" stroke-linejoin="round"/>' if ln else ''))
LAKES=sdis([c for c in cells if not land(c) and islake(c)],1,.3,2,0)
if LAKES: o.append(f'<path d="{LAKES}" fill="#9fd0e0" stroke="#3f6f8f" stroke-width=".8"/>')
o.append(f'<path d="{LANDD}" fill="none" stroke="#21425a" stroke-width="1.2" stroke-linejoin="round"/>')
# rivers & roads
o.append('<g fill="none" stroke-linecap="round" stroke-linejoin="round">')
for r in p['rivers']:
    if not r or 'cells' not in r: continue
    ids=[i for i in r['cells'] if 0<=i<len(cells)];pts=[];end=None
    for k_,i in enumerate(ids):
        if land(cells[i]): pts.append(tuple(cells[i]['p']))
        else:
            if pts and k_>0: end=edge_mid(ids[k_-1],i)
            break
    if end: pts.append(end)
    if len(pts)<2: continue
    w=max(.5,min(2.2,(r.get('discharge',10)**.5)/8))
    o.append(f'<path d="{smooth(pts)}" stroke="#3d7fb3" stroke-width="{w+.3:.2f}"/>')
for r in p['routes']:
    if not r or 'points' not in r: continue
    g_=r.get('group')
    if g_=='searoutes': continue
    col,w,da=('#d78a7e','1.1','') if g_=='roads' else ('#c79a7e','.7','2 2')
    o.append(f'<path d="M'+'L'.join(f"{x:.1f},{y:.1f}" for x,y,*_ in r['points'])+f'" stroke="{col}" stroke-width="{w}" stroke-dasharray="{da}"/>')
if wall:
    o.append(f'<path d="{"".join(wall)}" stroke="#3a3128" stroke-width="2.2"/><path d="{"".join(wall)}" stroke="#d9d2c4" stroke-width="1" stroke-dasharray="1.2 1"/>')
o.append('</g>')
bd="".join(border)
o.append(f'<g id="w-borders" class="ly-states" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="{bd}" stroke="#7a2335" stroke-opacity=".8" stroke-width="1.6" stroke-dasharray="5 2.5 1 2.5" vector-effect="non-scaling-stroke"/></g>')
o.append('<g id="w-burgs" class="ly-burgs"></g><g id="w-slabels">')
st={s['i']:s for s in p['states'] if not s.get('removed')}
for sid,s in st.items():
    pts=[c['p'] for c in cells if land(c) and c['state']==sid]
    if not pts:continue
    x,y=s['pole'] if s.get('pole') else (statistics.median(q_[0] for q_ in pts),statistics.median(q_[1] for q_ in pts))
    nm='United Hordes of War' if sid==S_WAR else STATE_RENAME.get(s['name'],s['name'])
    o.append(f'<text class="sl" x="{x:.1f}" y="{y:.1f}" data-area="{len(pts)}">{escape(nm)}</text>')
o.append('</g></svg>')
open(out.replace('.svg','-full.svg'),'w',encoding='utf-8').write(''.join(o))
B=[]
for b in p['burgs'][1:]:
    if not b or b.get('removed') or 'x' not in b:continue
    cap=b.get('capital',0);city=b.get('group')=='cities' or cap;nm=RENAME.get(b['name'],b['name'])
    e={'i':b['i'],'n':nm,'x':round(b['x'],1),'y':round(b['y'],1),'c':'cap' if cap else ('city' if city else 'town'),'s':STATE_RENAME.get(st.get(cells[b['cell']]['state'],{}).get('name',''),st.get(cells[b['cell']]['state'],{}).get('name','')),
       'pop':round(b.get('population',0)*1000),'ft':''.join(k[0] for k in ('citadel','walls','plaza','temple','shanty') if b.get(k)),'port':1 if b.get('port') else 0,'river':1 if cells[b['cell']].get('r') else 0,'seed':SEED+b['i']}
    if b['name'] in BURG_MOVE:
        mc=cells[BURG_MOVE[b['name']]];sn=st.get(mc['state'],{}).get('name','');e.update(x=round(mc['p'][0],1),y=round(mc['p'][1],1)+2,s=STATE_RENAME.get(sn,sn))
    if b['name']=='Zigilgathol': e.update(x=ZIG[0],y=ZIG[1])
    B.append(e)
json.dump(B,open(out.replace('.svg','-burgs.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('flat',len(''.join(o)),len(B))
