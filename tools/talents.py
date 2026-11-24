# Talent data for Luparis: generates the JS table and the rules chapter (EN + FR).
import json

S = [40, 80, 160]
TAL = [
 # ---- martial
 dict(k='rage', g='mar', c=S, n=('Rage', 'Rage'),
  r=[('Bonus action, 2 Stamina, lasts 1 minute (ends early if you neither strike nor take a hit for a whole turn). +1 Mastery on Physical Power attacks; resistance to physical damage (halved before the thresholds). No spells and no school infusion while raging.',
      'Action bonus, 2 Souffle, dure 1 minute (s\'arrête si tu ne frappes ni ne subis de coup pendant un tour entier). +1 Maîtrise aux attaques de Puissance physique ; résistance aux dégâts physiques (divisés par deux avant les seuils). Ni sort ni infusion d\'école pendant la Rage.'),
     ('Wear costs you nothing while raging.', 'L\'usure ne te coûte rien pendant la Rage.'),
     ('Relentless: when you drop to 0 boxes while raging, Physical Resilience DC 10 (+5 each further time before a rest) to stay at 1 box.',
      'Rage implacable : quand tu tombes à 0 case en Rage, Résistance physique DD 10 (+5 à chaque nouvelle fois avant un repos) pour rester à 1 case.')]),
 dict(k='sneak', g='mar', c=S, n=('Sneak strike', 'Coup en traître'),
  r=[('Once per turn, when you hit with Physical Finesse a target you have advantage against, or that an ally threatens in melee: +1 Mastery die.',
      'Une fois par tour, quand tu touches en Finesse physique une cible contre qui tu as l\'avantage, ou qu\'un allié menace au contact : +1 dé de Maîtrise.'),
     ('+2 Mastery dice instead.', '+2 dés de Maîtrise à la place.'),
     ('+3 Mastery dice instead.', '+3 dés de Maîtrise à la place.')]),
 dict(k='second', g='mar', c=S[:2], n=('Second wind', 'Second souffle'), req=('Resilience +3', 'Résistance +3'), rq={'st': 'R', 'v': 3},
  r=[('Bonus action, once per short rest: regain 1 box and 2 Stamina.', 'Action bonus, une fois par repos court : tu regagnes 1 case et 2 Souffle.'),
     ('2 boxes and 4 Stamina, twice per short rest.', '2 cases et 4 Souffle, deux fois par repos court.')]),
 dict(k='dodge', g='mar', c=S[:1], n=('Uncanny dodge', 'Esquive instinctive'), req=('Finesse +3', 'Finesse +3'), rq={'st': 'F', 'v': 3},
  r=[('Reaction when a hit you can see lands, 1 Stamina: its damage is halved before the thresholds. Once per round.',
      'Réaction quand un coup que tu vois venir te touche, 1 Souffle : ses dégâts sont divisés par deux avant les seuils. Une fois par round.')]),
 dict(k='stance', g='mar', c=S, n=('Stances', 'Postures'),
  r=[('Bonus action: take a stance you know. It lasts until you change it or fall unconscious; one at a time. Rank 1: you know one stance.',
      'Action bonus : tu adoptes une posture que tu connais. Elle dure jusqu\'à ce que tu en changes ou que tu tombes inconscient ; une seule à la fois. Rang 1 : tu connais une posture.'),
     ('You know two stances.', 'Tu connais deux postures.'),
     ('You know three stances, and changing stance is free once per turn.', 'Tu connais trois postures, et changer de posture est gratuit une fois par tour.')]),
 dict(k='prey', g='mar', c=S[:2], n=('Marked prey', 'Proie marquée'),
  r=[('Bonus action, 1 Stamina: mark a creature you can see for 1 hour. +1 Mastery on attacks against it, advantage to track it.',
      'Action bonus, 1 Souffle : tu marques une créature visible pour 1 heure. +1 Maîtrise aux attaques contre elle, avantage pour la pister.'),
     ('When the prey falls, the mark moves to another creature for free; +2 tiles of movement when you move toward your prey.',
      'Quand la proie tombe, la marque passe gratuitement à une autre créature ; +2 cases de déplacement quand tu vas vers ta proie.')]),
 dict(k='palm', g='mar', c=S[:2], n=('Open hand', 'Main ouverte'), req=('Martial arts Tier 1', 'Arts martiaux Tier 1'), rq={'fam': 'martial', 'v': 1},
  r=[('Bonus action, 1 Stamina: one more unarmed strike, or Dash, or Disengage.', 'Action bonus, 1 Souffle : une attaque à mains nues de plus, ou Foncer, ou Se désengager.'),
     ('Your Parry works against missiles without a shield. 2 Stamina when an unarmed strike hits: the target is stunned until the end of its next turn (Physical Resilience against your DC).',
      'Ta Parade marche contre les projectiles, même sans bouclier. 2 Souffle quand une attaque à mains nues touche : la cible est étourdie jusqu\'à la fin de son prochain tour (Résistance physique contre ton DD).')]),
 dict(k='momentum', g='mar', c=S[:1], n=('Momentum', 'Élan'),
  r=[('When you roll a natural 20 or drop an enemy to 0 boxes, regain 2 Stamina.', 'Quand tu fais un 20 naturel ou fais tomber un ennemi à 0 case, tu regagnes 2 Souffle.')]),
 dict(k='pas', g='mar', c=[40, 40], n=('Fleet-footed', 'Pas rapide'),
  r=[('+2 tiles of movement.', '+2 cases de déplacement.'), ('+4 tiles of movement in total.', '+4 cases de déplacement au total.')]),
 # ---- magic
 dict(k='meta', g='mag', c=S, n=('Metamagic', 'Métamagie'), req=('a school at Tier 1', 'une école au Tier 1'), rq={'sch': 1},
  r=[('Subtle spell: no visible gesture or words, no extra cost. Quickened spell: cast a spell as a bonus action for +2 Mana, once per turn.',
      'Sort discret : aucun geste ni parole visibles, sans surcoût. Sort accéléré : un sort en action bonus pour +2 Mana, une fois par turn.'.replace('par turn', 'par tour')),
     ('Overcharge: a spell\'s effects may exceed your Tier by 1; that extra point costs 2 Mana and 1 Stamina.',
      'Surcharge : les effets d\'un sort peuvent dépasser ton Tier de 1 ; ce point en trop coûte 2 Mana et 1 Souffle.'),
     ('Lingering spell: Persistence lasts 10 minutes instead of 1. Twinned spell: the first Multiply of each spell costs 1 instead of 2.',
      'Sort prolongé : la Persistance dure 10 minutes au lieu d\'une. Sort jumelé : la première Multiplication de chaque sort coûte 1 au lieu de 2.')]),
 dict(k='shape', g='mag', c=S, n=('Shapeshifting', 'Métamorphose'),
  r=[('Action, 2 Mana or 2 Stamina: take the shape of a beast you have seen, for 1 hour. You keep your mental and social cells, your boxes and your Mana; you take the beast\'s Evasion, speed, senses and attacks (Bestiary), and use the better thresholds, yours or its. No spells. Rank 1: CR 1/2 or less, no flying or swimming.',
      'Action, 2 Mana ou 2 Souffle : tu prends la forme d\'une bête que tu as vue, pour 1 heure. Tu gardes tes cases mentales et sociales, tes cases de Vitalité et ton Mana ; tu prends l\'Esquive, le déplacement, les sens et les attaques de la bête (Bestiaire), et tu gardes les meilleurs seuils, les tiens ou les siens. Pas de sorts. Rang 1 : FP 1/2 au plus, ni vol ni nage.'),
     ('CR 2 or less, swimming allowed.', 'FP 2 au plus, la nage est permise.'),
     ('CR 4 or less, flying allowed; once per shape you may switch to another form at no cost.', 'FP 4 au plus, le vol est permis ; une fois par transformation, tu peux changer de forme sans coût.')]),
 dict(k='beast', g='mag', c=S, n=('Companion', 'Compagnon'),
  r=[('A beast bound to you (Bestiary, CR 1/4 or less). It acts on your initiative when you command it (bonus action); otherwise it only defends itself. If it dies, a new one answers an 8-hour ritual.',
      'Une bête liée à toi (Bestiaire, FP 1/4 au plus). Elle agit à ton initiative sur ton ordre (action bonus) ; sinon elle se défend seulement. Si elle meurt, une autre répond à un rituel de 8 heures.'),
     ('CR 1 or less; you share its senses as an action.', 'FP 1 au plus ; tu partages ses sens par une action.'),
     ('CR 3 or less; it acts on its own without a command.', 'FP 3 au plus ; elle agit seule, sans ordre.')]),
 # ---- group
 dict(k='insp', g='grp', c=S[:2], n=('Inspiration', 'Inspiration'),
  r=[('Bonus action, 1 Mana or 1 Stamina: an ally who hears you gains +1 Mastery on their next roll within 10 minutes.',
      'Action bonus, 1 Mana ou 1 Souffle : un allié qui t\'entend gagne +1 Maîtrise à son prochain jet dans les 10 minutes.'),
     ('The ally also regains 1 Stamina, and you can grant the bonus as a reaction after they roll, before the GM gives the result.',
      'L\'allié regagne aussi 1 Souffle, et tu peux donner le bonus en réaction après son jet, avant que le MJ annonce le résultat.')]),
 dict(k='tag', g='grp', c=S[:1], n=('Tag team', 'Action conjuguée'),
  r=[('Once per short rest, when you and an ally act together on the same target or task, you both roll the d20 and both keep the better result.',
      'Une fois par repos court, quand un allié et toi agissez ensemble sur la même cible ou la même tâche, vous lancez chacun le d20 et gardez tous les deux le meilleur.')]),
 dict(k='rally', g='grp', c=S[:2], n=('Rallying cry', 'Cri de ralliement'),
  r=[('Bonus action, once per short rest: every ally within 30 ft who hears you regains 2 Stamina and ignores frightened until your next turn.',
      'Action bonus, une fois par repos court : chaque allié à 30 pieds qui t\'entend regagne 2 Souffle et ignore l\'état effrayé jusqu\'à ton prochain tour.'),
     ('Twice per short rest, and a stabilized ally at 0 boxes gets back up with 1 box.', 'Deux fois par repos court, et un allié stabilisé à 0 case se relève avec 1 case.')]),
 dict(k='pact', g='pac', c=S, n=('Pact', 'Pacte'),
  r=[('You are bound to an entity met in the story. Favors: rank + 1 per long rest. Spend a Favor to pay 2 Mana or 2 Stamina of a cost, to gain +1 Mastery on a roll (before rolling), or to call on a gift of your entity. Each Favor spent adds 1 Debt. Rank 1 gift of your entity.',
      'Tu es lié à une entité rencontrée dans le récit. Faveurs : rang + 1 par repos long. Une Faveur paie 2 Mana ou 2 Souffle d\'un coût, donne +1 Maîtrise à un jet (avant de lancer) ou appelle un don de ton entité. Chaque Faveur dépensée ajoute 1 Dette. Don de rang 1 de ton entité.'),
     ('Rank 2 gift of your entity.', 'Don de rang 2 de ton entité.'),
     ('Rank 3 gift of your entity; your Debt threshold rises by 2.', 'Don de rang 3 de ton entité ; ton seuil de Dette monte de 2.')]),
]
SF = [20, 40, 80]
PATRONS = [
 ('fiend', ('Fiend', 'Fiélon'), ('Infernal bargains, fire and ambition.', 'Marchés infernaux, feu et ambition.'),
  [('When you drop an enemy to 0 boxes, regain 2 Stamina or 2 Mana.', 'Quand tu fais tomber un ennemi à 0 case, tu regagnes 2 Souffle ou 2 Mana.'),
   ('Resistance to fire.', 'Résistance au feu.'),
   ('1 Favor when you hit: the blow costs 1 more box (once per round).', '1 Faveur quand tu touches : le coup coûte 1 case de plus (une fois par round).')]),
 ('fey', ('Archfey', 'Fée'), ('Whims, glamour and old oaths.', 'Caprices, enchantements et vieux serments.'),
  [('1 Favor: light control (pushed or slowed) on a creature you see, no roll to hit, Mental save against your DC.', '1 Faveur : contrôle léger (repoussé ou ralenti) sur une créature visible, sans jet d\'attaque, sauvegarde mentale contre ton DD.'),
   ('Advantage against charmed; you cannot be put to sleep by magic.', 'Avantage contre l\'état charmé ; la magie ne peut pas t\'endormir.'),
   ('Reaction, 1 Favor, when you lose a box: you become invisible until the end of your next turn.', 'Réaction, 1 Faveur, quand tu perds une case : tu deviens invisible jusqu\'à la fin de ton prochain tour.')]),
 ('abyss', ('Great Old One', 'Grand Ancien'), ('Whispers from beyond the stars.', 'Murmures venus d\'au-delà des étoiles.'),
  [('Telepathy with any creature within 30 ft that speaks a language.', 'Télépathie avec toute créature à 30 pieds qui parle une langue.'),
   ('Advantage against charmed and frightened; resistance to psychic damage.', 'Avantage contre charmé et effrayé ; résistance aux dégâts psychiques.'),
   ('1 Favor: a creature you see is frightened or charmed until the end of its next turn (Mental Resilience against your DC).', '1 Faveur : une créature visible est effrayée ou charmée jusqu\'à la fin de son prochain tour (Résistance mentale contre ton DD).')]),
 ('celestial', ('Celestial', 'Céleste'), ('A bright and demanding light.', 'Une lumière éclatante et exigeante.'),
  [('1 Favor, bonus action: an ally within 30 ft regains 1 box.', '1 Faveur, action bonus : un allié à 30 pieds regagne 1 case.'),
   ('Resistance to radiant damage; you shed light at will.', 'Résistance aux dégâts radiants ; tu émets de la lumière à volonté.'),
   ('2 Favors, action: an ally at 0 boxes within 30 ft gets up with 2 boxes.', '2 Faveurs, action : un allié à 0 case à 30 pieds se relève avec 2 cases.')]),
 ('dead', ('The Dead', 'Les Morts'), ('Ghosts, liches and forgotten tombs.', 'Spectres, liches et tombeaux oubliés.'),
  [('You see spirits and can ask a corpse three questions once per long rest.', 'Tu vois les esprits et peux poser trois questions à un cadavre une fois par repos long.'),
   ('Resistance to necrotic damage; advantage against poisoned.', 'Résistance aux dégâts nécrotiques ; avantage contre l\'état empoisonné.'),
   ('Once per long rest, when you drop to 0 boxes, you stay up with 1 box until the end of your next turn, then fall.', 'Une fois par repos long, quand tu tombes à 0 case, tu restes debout avec 1 case jusqu\'à la fin de ton prochain tour, puis tu tombes.')]),
 ('dragon', ('Elder dragon', 'Dragon ancien'), ('A wyrm older than kingdoms.', 'Un dragon plus vieux que les royaumes.'),
  [('Draconic scales: natural armor 2 (keep the better of natural and worn armor).', 'Écailles draconiques : armure naturelle 2 (on garde la meilleure entre armure naturelle et portée).'),
   ('1 Favor, action: breath in a 15 ft cone, your rank × d8 damage of your dragon\'s element, Physical Finesse save for half.', '1 Faveur, action : souffle en cône de 15 pieds, ton rang × d8 dégâts de l\'élément de ton dragon, Finesse physique pour moitié.'),
   ('2 Favors, bonus action: wings for 1 minute (flight at your speed).', '2 Faveurs, action bonus : des ailes pour 1 minute (vol à ta vitesse).')]),
]
STANCES = [
 ('Rock', 'Roc', 'Major and Severe thresholds +2; −2 tiles of movement; you cannot be moved against your will.', 'Seuils Majeur et Sévère +2 ; −2 cases de déplacement ; on ne peut pas te déplacer contre ton gré.'),
 ('Blade', 'Lame', '+1 Mastery on melee attacks; −2 Evasion.', '+1 Maîtrise aux attaques au contact ; −2 Esquive.'),
 ('Wind', 'Vent', '+2 tiles of movement; leaving melee never provokes; −1 Mastery on attacks.', '+2 cases de déplacement ; quitter le contact ne provoque jamais d\'attaque ; −1 Maîtrise aux attaques.'),
 ('Guardian', 'Gardien', 'Interception without a shield; adjacent allies get +1 Evasion; −2 tiles of movement.', 'Interception sans bouclier ; les alliés adjacents ont +1 Esquive ; −2 cases de déplacement.'),
 ('Serpent', 'Serpent', 'When an enemy misses you in melee, 1 Stamina: a free basic attack against it, once per round.', 'Quand un ennemi te rate au contact, 1 Souffle : une attaque de base gratuite contre lui, une fois par round.'),
 ('Hawk', 'Faucon', 'If you have not moved this turn: +1 Mastery on ranged attacks and you ignore half cover.', 'Si tu n\'as pas bougé ce tour : +1 Maîtrise aux attaques à distance et tu ignores le couvert partiel.'),
]
G = {'mar': ('Martial', 'Martiaux'), 'mag': ('Magic and nature', 'Magie et nature'), 'grp': ('Group', 'Groupe'), 'pac': ('Pacts', 'Pactes')}

def js():
    o = {t['k']: {'g': t['g'], 'c': t['c'], 'n': list(t['n']), 'r': [list(x) for x in t['r']], **({'q': list(t['req'])} if t.get('req') else {}), **({'rq': t['rq']} if t.get('rq') else {})} for t in TAL}
    return ('const TAL=' + json.dumps(o, ensure_ascii=False, separators=(',', ':')) + ',TALG=' + json.dumps({k: list(v) for k, v in G.items()}, ensure_ascii=False) +
            ',STANCES=' + json.dumps([list(s) for s in STANCES], ensure_ascii=False, separators=(',', ':')) + ',SFC=' + json.dumps(SF) + ',PATR=' + json.dumps({k: {'n': list(n), 'd': list(d), 'g': [list(x) for x in g]} for k, n, d, g in PATRONS}, ensure_ascii=False, separators=(',', ':')) + ';')

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;')

def html(L):
    i = 0 if L == 'en' else 1
    T = lambda en, fr: en if L == 'en' else fr
    h = [f'<h2 id="r-talents">{T("7. Talents", "7. Talents")}</h2>',
         T('<p>Talents are the class features of D&D, sold à la carte. Buy them with XP like everything else, as many as you like, as long as the story follows: a Rage needs a reason to rage, a Companion needs to be met. Rank 2 is open from level 5, rank 3 from level 11. Unless noted, a talent costs 40, 80 then 160 XP per rank.</p>',
           '<p>Les talents sont les capacités de classe de D&D, à la carte. On les achète en XP comme le reste, autant qu\'on veut, tant que le récit suit : une Rage a besoin d\'une raison de se mettre en rage, un Compagnon d\'une rencontre. Le rang 2 s\'ouvre au niveau 5, le rang 3 au niveau 11. Sauf mention, un talent coûte 40, 80 puis 160 XP par rang.</p>')]
    for g, gn in G.items():
        h.append(f'<h3>{gn[i]}</h3><table><thead><tr><th>{T("Talent", "Talent")}</th><th>{T("Effect", "Effet")}</th><th>{T("XP per rank", "XP par rang")}</th></tr></thead><tbody>')
        for t in TAL:
            if t['g'] != g: continue
            rk = '<br>'.join((f'<b>Rang {j+1} :</b> ' if L == 'fr' else f'<b>Rank {j+1}:</b> ') + esc(x[i]) for j, x in enumerate(t['r'])) if len(t['r']) > 1 else esc(t['r'][0][i])
            rq = f'<br><i>{T("Requires", "Prérequis")}{" :" if L == "fr" else ":"} {esc(t["req"][i])}</i>' if t.get('req') else ''
            h.append(f'<tr><td><b>{t["n"][i]}</b></td><td>{rk}{rq}</td><td>{", ".join(map(str, t["c"]))}</td></tr>')
        h.append('</tbody></table>')
        if g == 'mar':
            h.append(f'<p><b>{T("Stances", "Postures")}</b></p><table><thead><tr><th>{T("Stance", "Posture")}</th><th>{T("Effect", "Effet")}</th></tr></thead><tbody>' +
                     ''.join(f'<tr><td>{s[i]}</td><td>{esc(s[2+i])}</td></tr>' for s in STANCES) + '</tbody></table>')
    h.append(T('<p><b>Debt.</b> Each Favor spent adds 1 Debt. The GM may spend 1 Debt at any time for a complication: a vision, an order, a visible mark, a rival who smells the pact. When Debt reaches 3 × your rank (+2 at rank 3), the entity calls it in: a service to perform. Until it is done, you have no Favors; once it is done, Debt goes back to 0. Refusing breaks the pact: the talent is lost, the XP with it, and the entity remembers.</p>',
               '<p><b>Dette.</b> Chaque Faveur dépensée ajoute 1 Dette. Le MJ peut dépenser 1 Dette à tout moment pour une complication : une vision, un ordre, une marque visible, un rival qui flaire le pacte. Quand la Dette atteint 3 × ton rang (+2 au rang 3), l\'entité la réclame : un service à rendre. Tant qu\'il n\'est pas rendu, tu n\'as plus de Faveurs ; une fois rendu, la Dette retombe à 0. Refuser rompt le pacte : le talent est perdu, l\'XP avec, et l\'entité s\'en souvient.</p>'))
    h.append(f'<table><thead><tr><th>{T("Entity", "Entité")}</th><th>{T("Rank 1", "Rang 1")}</th><th>{T("Rank 2", "Rang 2")}</th><th>{T("Rank 3", "Rang 3")}</th></tr></thead><tbody>' +
             ''.join(f'<tr><td><b>{n[i]}</b><br><i>{esc(d[i])}</i></td>' + ''.join(f'<td>{esc(x[i])}</td>' for x in g) + '</tr>' for k, n, d, g in PATRONS) + '</tbody></table>')
    h.append(T('<p>The entity is yours to name: Asmodeus, the Queen of Thorns, a drowned god of Luparis. The table gives its kind.</p>', '<p>Le nom de l\'entité est à toi : Asmodée, la Reine des ronces, un dieu noyé de Luparis. Le tableau en donne la nature.</p>'))
    h.append(T('<h3>Expertise</h3><p>Pick a precise field: lockpicking, tracking, herbalism, the history of Luparis, sailing… Your checks in that field add +2, +4 then +6 (ranks 1 to 3, for 20, 40 then 80 XP). Buy it for as many fields as you like. It is the answer to "how good is my character at this", outside combat.</p>',
               '<h3>Savoir-faire</h3><p>Choisis un domaine précis : crochetage, pistage, herboristerie, histoire de Luparis, navigation… Tes tests dans ce domaine ajoutent +2, +4 puis +6 (rangs 1 à 3, pour 20, 40 puis 80 XP). Achetable pour autant de domaines que tu veux. C\'est la réponse à « mon personnage sait-il faire ça ? » hors combat.</p>'))
    return '\n'.join(h)
