# Builds srd-details.json (full SRD 5.1 stat block text, CC BY 4.0) keyed like srd-monsters.json ids.
import json,sys
d=json.load(open(sys.argv[1]));out={}
def dmgl(x): return ', '.join(v if isinstance(v,str) else v.get('name','') for v in x)
for m in d:
    pr=m.get('proficiencies',[])
    sv=', '.join(p['proficiency']['name'].replace('Saving Throw: ','').title()+f" +{p['value']}" for p in pr if p['proficiency']['name'].startswith('Saving'))
    sk=', '.join(p['proficiency']['name'].replace('Skill: ','')+f" +{p['value']}" for p in pr if p['proficiency']['name'].startswith('Skill'))
    sen=', '.join(f"{k.replace('_',' ')} {v}" for k,v in m.get('senses',{}).items())
    spd=', '.join((k+' ' if k!='walk' else '')+str(v) for k,v in m.get('speed',{}).items() if k!='hover')+(' (hover)' if m.get('speed',{}).get('hover') else '')
    L=lambda key:[[a['name'],a.get('desc','')] for a in m.get(key,[]) or []]
    out['s-'+m['index']]=dict(al=m.get('alignment',''),sub=m.get('subtype') or '',hd=m.get('hit_dice',''),spd=spd,ab=[m[k] for k in ('strength','dexterity','constitution','intelligence','wisdom','charisma')],
        sv=sv,sk=sk,vul=dmgl(m.get('damage_vulnerabilities',[])),res=dmgl(m.get('damage_resistances',[])),imm=dmgl(m.get('damage_immunities',[])),cimm=dmgl(m.get('condition_immunities',[])),
        sen=sen,lng=m.get('languages',''),xp=m.get('xp',0),tr=L('special_abilities'),act=L('actions'),leg=L('legendary_actions'),rea=L('reactions'))
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,separators=(',',':'))
print(len(out))
