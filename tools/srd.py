"""Convert the SRD 5.1 monsters of 5e-database into the Luparis bestiary (srd-monsters.json).

    python3 tools/srd.py 5e-SRD-Monsters.json srd-monsters.json

Source: https://github.com/5e-bits/5e-database (src/2014/en/5e-SRD-Monsters.json), MIT;
the SRD 5.1 text is CC BY 4.0. Each creature gets its French name, a Luparis Tier, attacks
in Luparis terms and the biomes of the battle map; generic NPCs are appended at the end.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
FR={'Aboleth':'Aboleth','Acolyte':'Acolyte','Air Elemental':"Élémentaire de l'air",'Androsphinx':'Androsphinx','Animated Armor':'Armure animée','Ankheg':'Ankheg','Ape':'Singe','Archmage':'Archimage','Assassin':'Assassin','Awakened Shrub':'Arbuste éveillé','Awakened Tree':'Arbre éveillé','Axe Beak':'Bec-de-hache','Azer':'Azer','Baboon':'Babouin','Badger':'Blaireau','Balor':'Balor','Bandit':'Bandit','Bandit Captain':'Capitaine bandit','Barbed Devil':'Diable barbelé','Basilisk':'Basilic','Bat':'Chauve-souris','Bearded Devil':'Diable barbu','Behir':'Béhir','Berserker':'Berserker','Black Bear':'Ours noir','Black Pudding':'Pouding noir','Blink Dog':'Chien clignotant','Blood Hawk':'Faucon de sang','Boar':'Sanglier','Bone Devil':"Diable osseux",'Brown Bear':'Ours brun','Bugbear':'Gobelours','Bulette':'Bulette','Camel':'Chameau','Cat':'Chat','Centaur':'Centaure','Chain Devil':'Diable enchaîné','Chimera':'Chimère','Chuul':'Chuul','Clay Golem':"Golem d'argile",'Cloaker':'Manteleur','Cloud Giant':'Géant des nuages','Cockatrice':'Cocatrix','Commoner':'Roturier','Constrictor Snake':'Serpent constricteur','Couatl':'Couatl','Crab':'Crabe','Crocodile':'Crocodile','Cult Fanatic':'Fanatique de secte','Cultist':'Sectateur','Darkmantle':'Manteau noir','Death Dog':'Chien de la mort','Deep Gnome (Svirfneblin)':'Gnome des profondeurs (svirfnebelin)','Deer':'Cerf','Deva':'Déva','Dire Wolf':'Loup sanguinaire','Djinni':'Djinn','Doppelganger':'Doppelganger','Draft Horse':'Cheval de trait','Dragon Turtle':'Tortue-dragon','Dretch':'Dretch','Drider':'Drider','Drow':'Drow','Druid':'Druide','Dryad':'Dryade','Duergar':'Duergar','Dust Mephit':'Méphite de poussière','Eagle':'Aigle','Earth Elemental':'Élémentaire de la terre','Efreeti':'Éfrit','Elephant':'Éléphant','Elk':'Élan','Erinyes':'Érinye','Ettercap':'Ettercap','Ettin':'Ettin','Fire Elemental':'Élémentaire du feu','Fire Giant':'Géant du feu','Flesh Golem':'Golem de chair','Flying Snake':'Serpent volant','Flying Sword':'Épée volante','Frog':'Grenouille','Frost Giant':'Géant du givre','Gargoyle':'Gargouille','Gelatinous Cube':'Cube gélatineux','Ghast':'Blême','Ghost':'Fantôme','Ghoul':'Goule','Gibbering Mouther':'Babélien','Glabrezu':'Glabrezu','Gladiator':'Gladiateur','Gnoll':'Gnoll','Goat':'Chèvre','Goblin':'Gobelin','Gorgon':'Gorgone','Gray Ooze':'Vase grise','Green Hag':'Guenaude verte','Grick':'Grick','Griffon':'Griffon','Grimlock':'Grimlock','Guard':'Garde','Guardian Naga':'Naga gardien','Gynosphinx':'Gynosphinx','Half-Red Dragon Veteran':'Vétéran demi-dragon rouge','Harpy':'Harpie','Hawk':'Faucon','Hell Hound':'Molosse infernal','Hezrou':'Hezrou','Hill Giant':'Géant des collines','Hippogriff':'Hippogriffe','Hobgoblin':'Hobgobelin','Homunculus':'Homoncule','Horned Devil':'Diable cornu','Hunter Shark':'Requin chasseur','Hydra':'Hydre','Hyena':'Hyène','Ice Devil':'Diable gelé','Ice Mephit':'Méphite de glace','Imp':'Diablotin','Invisible Stalker':'Traqueur invisible','Iron Golem':'Golem de fer','Jackal':'Chacal','Killer Whale':'Orque (épaulard)','Knight':'Chevalier','Kobold':'Kobold','Kraken':'Kraken','Lamia':'Lamie','Lemure':'Lémure','Lich':'Liche','Lion':'Lion','Lizard':'Lézard','Lizardfolk':'Homme-lézard','Mage':'Mage','Magma Mephit':'Méphite de magma','Magmin':'Magmin','Mammoth':'Mammouth','Manticore':'Manticore','Marilith':'Marilith','Mastiff':'Mâtin','Medusa':'Méduse','Merfolk':'Ondin','Merrow':'Merrow','Mimic':'Mimique','Minotaur':'Minotaure','Minotaur Skeleton':'Squelette de minotaure','Mule':'Mule','Mummy':'Momie','Mummy Lord':'Seigneur momie','Nalfeshnee':'Nalfeshnie','Night Hag':'Guenaude nocturne','Nightmare':'Destrier noir','Noble':'Noble','Ochre Jelly':'Gelée ocre','Octopus':'Pieuvre','Ogre':'Ogre','Ogre Zombie':"Ogre zombi",'Oni':'Oni','Orc':'Orque','Otyugh':'Otyugh','Owl':'Chouette','Owlbear':'Hibours','Panther':'Panthère','Pegasus':'Pégase','Phase Spider':'Araignée de phase','Pit Fiend':'Diantrefosse','Planetar':'Planétar','Plesiosaurus':'Plésiosaure','Poisonous Snake':'Serpent venimeux','Polar Bear':'Ours polaire','Pony':'Poney','Priest':'Prêtre','Pseudodragon':'Pseudodragon','Purple Worm':'Ver pourpre','Quasit':'Quasit','Quipper':'Piranha','Rakshasa':'Rakshasa','Rat':'Rat','Raven':'Corbeau','Reef Shark':'Requin de récif','Remorhaz':'Rémorhaz','Rhinoceros':'Rhinocéros','Riding Horse':'Cheval de selle','Roc':'Roc','Roper':'Enlaceur','Rug of Smothering':'Tapis étouffeur','Rust Monster':'Oxydeur','Saber-Toothed Tiger':'Tigre à dents de sabre','Sahuagin':'Sahuagin','Salamander':'Salamandre','Satyr':'Satyre','Scorpion':'Scorpion','Scout':'Éclaireur','Sea Hag':'Guenaude marine','Sea Horse':'Hippocampe','Shadow':'Ombre','Shambling Mound':'Tertre errant','Shield Guardian':'Gardien protecteur','Shrieker':'Criard','Skeleton':'Squelette','Solar':'Solar','Specter':'Spectre','Spider':'Araignée','Spirit Naga':'Naga corrupteur','Sprite':'Esprit follet','Spy':'Espion','Steam Mephit':'Méphite de vapeur','Stirge':'Stryge','Stone Giant':'Géant des pierres','Stone Golem':'Golem de pierre','Storm Giant':'Géant des tempêtes','Succubus/Incubus':'Succube/Incube','Tarrasque':'Tarasque','Thug':'Malfrat','Tiger':'Tigre','Treant':'Sylvanien','Tribal Warrior':'Guerrier tribal','Triceratops':'Tricératops','Troll':'Troll','Tyrannosaurus Rex':'Tyrannosaure','Unicorn':'Licorne','Vampire':'Vampire','Vampire Spawn':'Rejeton vampirique','Veteran':'Vétéran','Violet Fungus':'Champignon violet','Vrock':'Vrock','Vulture':'Vautour','Warhorse':'Cheval de guerre','Warhorse Skeleton':'Squelette de cheval de guerre','Water Elemental':"Élémentaire de l'eau",'Weasel':'Belette','Werebear':'Ours-garou','Wereboar':'Sanglier-garou','Wererat':'Rat-garou','Weretiger':'Tigre-garou','Werewolf':'Loup-garou','Wight':'Nécrophage','Will-o\'-Wisp':'Feu follet','Winter Wolf':"Loup arctique",'Wolf':'Loup','Worg':'Worg','Wraith':'Âme-en-peine','Wyvern':'Vouivre','Xorn':'Xorn','Zombie':'Zombi'}
COL={'Black':'noir','Blue':'bleu','Brass':'d\'airain','Bronze':'de bronze','Copper':'de cuivre','Gold':'d\'or','Green':'vert','Red':'rouge','Silver':'d\'argent','White':'blanc'}
def fr(n):
    if n in FR: return FR[n]
    m=re.match(r'(Young|Adult|Ancient) (\w+) Dragon$',n)
    if m: return {'Young':'Jeune','Adult':'Dragon','Ancient':'Dragon'}[m[1]]+(' dragon' if m[1]=='Young' else '')+' '+COL[m[2]]+{'Young':'','Adult':' adulte','Ancient':' vénérable'}[m[1]]
    m=re.match(r'(\w+) Dragon Wyrmling$',n)
    if m: return 'Dragonnet '+COL[m[1]]
    m=re.match(r'Swarm of (.+)$',n)
    if m: return 'Nuée de '+{'Bats':'chauves-souris','Beetles':'scarabées','Centipedes':'mille-pattes','Insects':'insectes','Poisonous Snakes':'serpents venimeux','Quippers':'piranhas','Rats':'rats','Ravens':'corbeaux','Spiders':'araignées','Wasps':'guêpes'}[m[1]]
    m=re.match(r'Giant (.+)$',n)
    if m:
        b={'Ape':'Singe géant','Badger':'Blaireau géant','Bat':'Chauve-souris géante','Boar':'Sanglier géant','Centipede':'Mille-pattes géant','Constrictor Snake':'Serpent constricteur géant','Crab':'Crabe géant','Crocodile':'Crocodile géant','Eagle':'Aigle géant','Elk':'Élan géant','Fire Beetle':'Scarabée de feu géant','Frog':'Grenouille géante','Goat':'Chèvre géante','Hyena':'Hyène géante','Lizard':'Lézard géant','Octopus':'Pieuvre géante','Owl':'Chouette géante','Poisonous Snake':'Serpent venimeux géant','Rat':'Rat géant','Rat (Diseased)':'Rat géant (malade)','Scorpion':'Scorpion géant','Sea Horse':'Hippocampe géant','Shark':'Requin géant','Spider':'Araignée géante','Toad':'Crapaud géant','Vulture':'Vautour géant','Wasp':'Guêpe géante','Weasel':'Belette géante','Wolf Spider':'Araignée-loup géante'}
        return b.get(m[1],n)
    return n
SZ={'Tiny':'T','Small':'S','Medium':'M','Large':'L','Huge':'H','Gargantuan':'G'}
def fpstr(c): return {0.125:'1/8',0.25:'1/4',0.5:'1/2'}.get(c,str(int(c)))
def tier(c): return max(1,min(5,int(1+c/4.5+.5)))
def prof(c): return 2 if c<5 else 3 if c<9 else 4 if c<13 else 5 if c<17 else 6 if c<21 else 7 if c<25 else 8 if c<29 else 9
AW={'Bite':'Morsure','Claw':'Griffe','Claws':'Griffes','Tail':'Queue','Horn':'Corne','Gore':'Encorner','Hooves':'Sabots','Slam':'Coup','Fist':'Poing','Talons':'Serres','Sting':'Dard','Tentacle':'Tentacule','Tentacles':'Tentacules','Longsword':'Épée longue','Shortsword':'Épée courte','Greatsword':'Épée à deux mains','Scimitar':'Cimeterre','Dagger':'Dague','Club':'Gourdin','Greatclub':'Massue','Spear':'Lance','Javelin':'Javeline','Shortbow':'Arc court','Longbow':'Arc long','Light Crossbow':'Arbalète légère','Heavy Crossbow':'Arbalète lourde','Mace':'Masse','Morningstar':'Morgenstern','Greataxe':'Grande hache','Battleaxe':'Hache','Handaxe':'Hachette','Warhammer':'Marteau de guerre','Maul':'Maillet','Rapier':'Rapière','Quarterstaff':'Bâton','Sling':'Fronde','Trident':'Trident','Pike':'Pique','Glaive':'Coutille','Halberd':'Hallebarde','Rock':'Rocher','Beak':'Bec','Pseudopod':'Pseudopode','Touch':'Toucher','Ram':'Charge','Tusk':'Défense','Wing':'Aile','Bites':'Morsures','Lance':'Lance d\'arçon','Whip':'Fouet','Net':'Filet','Trunk':'Trompe','Stomp':'Piétinement','Constrict':'Constriction','Hand Crossbow':'Arbalète de poing','Life Drain':'Absorption de vie','Withering Touch':'Toucher flétrissant'}
def hab(n,t,sub):
    l=n.lower()
    for c,h in (('red',['volcan','montagne']),('white',['neige']),('blue',['desert']),('green',['foret']),('black',['marais']),('brass',['desert']),('bronze',['prairie']),('copper',['montagne']),('silver',['montagne','neige']),('gold',['prairie'])):
        if t=='dragon' and l.startswith(('young '+c,'adult '+c,'ancient '+c,c+' dragon')): return h
    K=[(('polar','winter','mammoth','ice','frost','yeti','remorhaz'),['neige']),(('camel','scorpion','vulture','jackal','dust','sphinx','mummy','lamia','blue'),['desert']),(('crocodile','frog','toad','lizard','hag','shambling','bullywug','will-o','black pudding','otyugh','hydra','lizardfolk'),['marais']),(('goat','eagle','griffon','roc','stone giant','cloud','storm','hippogriff','gargoyle','manticore','wyvern','air elemental','earth elemental','ettin','orc','dwarf','duergar','xorn','bulette'),['montagne']),(('fire','magma','magmin','salamander','efreeti','azer','hell hound','steam','balor','pit fiend','imp'),['volcan']),(('wolf','bear','boar','elk','deer','owl','spider','dryad','sprite','satyr','treant','awakened','ettercap','centaur','unicorn','panther','tiger','badger','pegasus','blink','pixie','green hag','worg','weasel','ape','baboon','troll','goblin','bugbear','hobgoblin','ogre','gnoll'),['foret']),(('horse','lion','hyena','pony','mule','axe beak','rhinoceros','elephant','triceratops','tyranno','ankheg','hill giant','mastiff','cat','raven','hawk','gorgon','chimera','cockatrice','bandit','thug','tribal','scout','berserker','knight','veteran','guard','noble','commoner','priest','acolyte','spy','gladiator','mage','archmage','assassin','druid'),['prairie'])]
    for keys,h in K:
        if any(k in l for k in keys): return h
    if t in('undead','ooze','aberration','construct'): return ['donjon']
    if t=='fiend': return ['donjon','volcan']
    if t=='humanoid': return ['prairie']
    return []
TR={'Spellcasting':'Incantation','Innate Spellcasting':'Incantation innée','Legendary Resistance':'Résistance légendaire','Pack Tactics':'Tactique de groupe','Keen Smell':'Odorat aiguisé','Keen Hearing and Smell':'Ouïe et odorat aiguisés','Keen Sight':'Vue aiguisée','Keen Hearing and Sight':'Ouïe et vue aiguisées','Magic Resistance':'Résistance à la magie','Sunlight Sensitivity':'Sensibilité au soleil','Amphibious':'Amphibie','Pounce':'Bond','Charge':'Charge','Regeneration':'Régénération','Undead Fortitude':'Robustesse de mort-vivant','Spider Climb':'Pattes d\'araignée','Web Sense':'Perception des toiles','Web Walker':'Marche dans les toiles','Brave':'Courageux','Nimble Escape':'Fuite agile','Aggressive':'Agressif','Reckless':'Téméraire','Water Breathing':'Respiration aquatique','Hold Breath':'Apnée','Flyby':'Vol rasant','Incorporeal Movement':'Mouvement incorporel','Shapechanger':'Métamorphe','False Appearance':'Apparence trompeuse','Fey Ancestry':'Ascendance féerique','Devil\'s Sight':'Vision du diable','Siege Monster':'Engin de siège','Rampage':'Saccage','Martial Advantage':'Avantage martial','Sneak Attack':'Attaque sournoise','Blood Frenzy':'Frénésie sanglante','Trampling Charge':'Charge piétinante','Magic Weapons':'Armes magiques','Immutable Form':'Forme immuable','Fire Aura':'Aura de feu','Heated Body':'Corps brûlant','Death Burst':'Explosion mortelle','Stench':'Puanteur','Avoidance':'Esquive totale','Turn Resistance':'Résistance au renvoi','Sure-Footed':'Pied sûr','Ambusher':'Embusqué','Surprise Attack':'Attaque surprise','Echolocation':'Écholocalisation','Standing Leap':'Saut sans élan','Two Heads':'Deux têtes','Multiple Heads':'Têtes multiples','Reactive Heads':'Têtes réactives','Wakeful':'Vigilant','Rejuvenation':'Rajeunissement','Mimicry':'Imitation','Labyrinthine Recall':'Mémoire des labyrinthes','Petrifying Gaze':'Regard pétrifiant','Ooze Cube':'Cube de vase','Transparent':'Transparent','Corrode Metal':'Corrosion du métal','Grappler':'Lutteur','Adhesive':'Adhésif','Tree Stride':'Passage par les arbres','Speak with Beasts and Plants':'Parler avec les animaux et les plantes','Antimagic Susceptibility':'Vulnérabilité à l\'antimagie','Light Sensitivity':'Sensibilité à la lumière'}

def build(d: list) -> list:
    """Bestiary entries for the monster list d of 5e-database."""
    out=[];seen=set()
    for m in d:
        n=m['name']
        if re.search(r'(Bat|Mist) Form$',n) or re.search(r'Were\w+, (Human|Bear|Boar|Rat|Tiger|Wolf) Form$',n): continue
        n=re.sub(r', (Vampire|Hybrid) Form$','',n)
        if n in seen: continue
        seen.add(n)
        t=m['type'].split()[0] if not m['type'].startswith('swarm') else 'beast'
        c=float(m['challenge_rating']);T=tier(c);pb=prof(c)
        acts=[]
        multi=next((a for a in m.get('actions',[]) if a['name']=='Multiattack'),None)
        counts={}
        if multi and 'action_options' in multi:
            try:
                o=multi['action_options']['from']['options'][0]
                its=o['items'] if o['option_type']=='multiple' else [o]
                for it in its: counts[it['action_name']]=counts.get(it['action_name'],0)+int(it.get('count',1))
            except Exception: pass
        for a in m.get('actions',[]):
            if 'attack_bonus' not in a or not a.get('damage'): continue
            dd=a['damage'][0].get('damage_dice') if isinstance(a['damage'][0],dict) else None
            if not dd: continue
            mm=re.match(r'(\d+)d(\d+)',dd)
            if not mm: continue
            mod=a['attack_bonus']-pb;die=int(mm[2])
            nm=a['name'].split(' (')[0]
            k=counts.get(a['name'],1)
            acts.append((nm,k,mod+T+1,f"{T}d{die}"+(f"{mod:+d}" if mod else "")))
        sp=[s['name'].split(' (')[0] for s in m.get('special_abilities',[])][:4]
        leg=bool(m.get('legendary_actions'))
        def note(lang):
            parts=[]
            for nm,k,ab,dmg in acts[:4]:
                nn=AW.get(nm,nm) if lang=='fr' else nm
                parts.append(f"{nn}{' ×'+str(k) if k>1 else ''} {'+' if ab>=0 else ''}{ab}, {dmg}")
            s=('Attaques : ' if lang=='fr' else 'Attacks: ')+' · '.join(parts)+'.' if parts else ''
            if sp: s+=(' Capacités : ' if lang=='fr' else ' Traits: ')+', '.join((TR.get(x,x) if lang=='fr' else x) for x in sp)+'.'
            if leg: s+=' Légendaire.' if lang=='fr' else ' Legendary.'
            return s.strip()[:600]
        dex=m.get('dexterity',10)
        out.append({'id':'s-'+m['index'],'n':[n,fr(n)],'type':t,'fp':fpstr(c),'sz':SZ[m['size']],'ca':m['armor_class'][0]['value'],'pv':m['hit_points'],'init':(dex-10)//2,'hab':hab(n,t,m.get('subtype')),'no':note('fr'),'noen':note('en'),'src':'srd'})
    NPC=[('Innkeeper','Tavernier','0',10,9,0,'Club','Gourdin',4,0),('Merchant','Marchand','0',10,4,0,'Dagger','Dague',4,0),('Beggar','Mendiant','0',10,3,0,'Fist','Poing',4,0),('Farmer','Paysan','0',10,6,0,'Pitchfork','Fourche',6,0),('Sailor','Marin','1/8',12,9,1,'Cutlass','Coutelas',6,1),('Blacksmith','Forgeron','1/4',11,16,0,'Hammer','Marteau',8,2),('Hunter','Chasseur','1/4',13,13,2,'Longbow','Arc long',8,2),('Wandering bard','Barde ambulant','1/2',12,22,2,'Rapier','Rapière',8,2),('Novice adventurer','Aventurier novice','1/2',14,16,2,'Longsword','Épée longue',8,2),('Seasoned adventurer','Aventurier aguerri','3',16,52,2,'Longsword ×2','Épée longue ×2',8,3),('Town watch captain','Capitaine de la garde','2',16,45,1,'Longsword ×2','Épée longue ×2',8,3),('Village elder','Ancien du village','0',10,8,0,'Staff','Bâton',6,0)]
    for i,(en,f,fp,ca,pv,ini,a_en,a_fr,die,mod) in enumerate(NPC):
        c={'1/8':.125,'1/4':.25,'1/2':.5}.get(fp) or float(fp);T=tier(c)
        out.append({'id':'n-'+str(i),'n':[en,f],'type':'humanoid','fp':fp,'sz':'M','ca':ca,'pv':pv,'init':ini,'hab':['prairie'],'no':f"PNJ. Attaque : {a_fr} +{mod+T+1}, {T}d{die}{'+'+str(mod) if mod else ''}.",'noen':f"NPC. Attack: {a_en} +{mod+T+1}, {T}d{die}{'+'+str(mod) if mod else ''}.",'src':'npc'})

    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=Path, help="5e-SRD-Monsters.json (2014 edition)")
    ap.add_argument("output", type=Path, help="where to write srd-monsters.json")
    args = ap.parse_args()
    with args.source.open(encoding="utf-8") as fh:
        out = build(json.load(fh))
    args.output.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(out)} creatures written to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
