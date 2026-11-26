"""School equivalents for the spells actually present in the imported 2014 SRD."""
import re

# Each entry gives the source name, its French name and a playable Luparis effect.
GROUPS = [
    ("afflux", 0, "Strike one target", "Frapper une cible", "fire bolt|Trait de feu;produce flame|Flamme;shocking grasp|Poigne électrique;sacred flame|Flamme sacrée;ray of frost|Rayon de givre;magic missile|Projectile magique"),
    ("afflux", 1, "Strike one target, +1 box on a hit", "Frapper une cible, +1 case sur une touche", "guiding bolt|Éclair traçant;acid arrow|Flèche acide;disintegrate|Désintégration;heat metal|Métal brûlant"),
    ("afflux", 3, "Blast within 4 tiles, Physical save for half damage", "Explosion dans un rayon de 4 cases, sauvegarde physique pour demi-dégâts", "fireball|Boule de feu;flame strike|Colonne de feu;lightning bolt|Éclair;cone of cold|Cône de froid;ice storm|Tempête de grêle;cloudkill|Nuage toxique;insect plague|Fléau d’insectes"),
    ("afflux", 2, "Raise a burning wall for one minute", "Dresser un mur de flammes pendant une minute", "wall of fire|Mur de feu"),
    ("harmonie", 1, "Push one target back with a shock wave", "Repousser une cible par une onde sonore", "thunderwave|Vague tonnante"),
    ("egide", 1, "Reaction, +3 Evasion for self or an ally within 6 tiles", "Réaction, +3 en Esquive pour soi ou un allié à 6 cases", "shield|Bouclier;shield of faith|Bouclier de foi;mage armor|Armure de mage;sanctuary|Sanctuaire;fire shield|Bouclier de feu;globe of invulnerability|Globe de protection"),
    ("egide", 2, "Create a barrier for one minute", "Dresser une barrière pendant une minute", "wall of force|Mur de force;blade barrier|Barrière de lames"),
    ("egide", 2, "Manifest a guardian or weapon for one minute", "Matérialiser un gardien ou une arme pendant une minute", "spiritual weapon|Arme spirituelle;guardian of faith|Gardien de la foi;conjure elemental|Invocation élémentaire;creation|Création"),
    ("eidolon", 1, "Inflict a lingering curse for one minute", "Maudire une cible pendant une minute", "bestow curse|Malédiction;contagion|Contagion;geas|Quête imposée;ray of enfeeblement|Rayon affaiblissant"),
    ("eidolon", 0, "Strike the target with necrotic energy", "Frapper une cible avec de l’énergie nécrotique", "inflict wounds|Blessure;blight|Flétrissement;harm|Mise à mal;finger of death|Doigt de mort;power word kill|Parole de mort"),
    ("eidolon", 1, "Bind a spirit to remains for one minute", "Lier un esprit à une dépouille pendant une minute", "animate dead|Animation des morts;spirit guardians|Esprits gardiens"),
    ("eidolon", 3, "Break one magical influence", "Rompre une influence magique", "dispel magic|Dissipation de la magie;remove curse|Délivrance des malédictions;dispel evil and good|Dissipation du mal et du bien;counterspell|Contresort"),
    ("eidolon", 4, "Recall a recently departed willing soul to its body", "Rappeler dans son corps une âme consentante récemment partie", "raise dead|Rappel à la vie"),
    ("eidolon", 5, "Restore a willing soul to life", "Rendre la vie à une âme consentante", "resurrection|Résurrection"),
    ("creuset", 4, "Healing feast within 4 tiles, restore two boxes per guest", "Festin de soin dans un rayon de 4 cases, rendre deux cases par convive", "heroes' feast|Festin des héros"),
    ("creuset", 0, "Stabilise a creature at zero boxes", "Stabiliser une créature à zéro case", "spare the dying|Stabilisation"),
    ("creuset", 1, "Restore two boxes to a living creature", "Rendre deux cases à une créature vivante", "cure wounds|Soins;goodberry|Baie nourricière"),
    ("creuset", 1, "Treat a lesser affliction", "Soulager une affection mineure", "lesser restoration|Restauration mineure;protection from poison|Protection contre le poison"),
    ("creuset", 4, "Cleanse a severe affliction", "Purger une affection grave", "greater restoration|Restauration supérieure"),
    ("creuset", 2, "Restrain one target with roots", "Entraver une cible avec des racines", "entangle|Enchevêtrement"),
    ("creuset", 1, "Reaction, harden skin for +2 Evasion", "Réaction, durcir la peau pour +2 en Esquive", "barkskin|Peau d’écorce;stoneskin|Peau de pierre"),
    ("creuset", 1, "Move a willing target through the air", "Déplacer dans les airs une cible consentante", "fly|Vol;gaseous form|Forme gazeuse;wind walk|Marche sur le vent"),
    ("creuset", 2, "Change a living body for one minute", "Transformer un corps vivant pendant une minute", "enlarge/reduce|Agrandissement ou réduction;water breathing|Respiration aquatique;freedom of movement|Liberté de mouvement"),
    ("creuset", 0, "Channel a basic strike through a staff", "Canaliser une frappe magique dans un bâton", "shillelagh|Gourdin magique"),
    ("horizon", 2, "Teleport yourself or one willing target", "Téléporter sa personne ou une cible consentante", "misty step|Pas brumeux;dimension door|Porte dimensionnelle;teleport|Téléportation;plane shift|Changement de plan"),
    ("horizon", 3, "Teleport one enemy on a failed save", "Téléporter un ennemi s’il rate sa sauvegarde", "banishment|Bannissement"),
    ("horizon", 1, "Move a target or arrest its fall", "Déplacer une cible ou freiner sa chute", "levitate|Lévitation;telekinesis|Télékinésie;feather fall|Feuille morte;longstrider|Grande foulée;mage hand|Main du mage"),
    ("horizon", 3, "Freeze one target in time (major control)", "Figer une cible dans le temps (contrôle majeur)", "time stop|Arrêt du temps"),
    ("mirage", 1, "Blind or restrain one target (heavy control)", "Aveugler ou entraver une cible (contrôle lourd)", "blindness/deafness|Cécité ou surdité;darkness|Ténèbres;fog cloud|Nappe de brouillard;confusion|Confusion"),
    ("mirage", 2, "Stun or paralyse one target (major control)", "Étourdir ou paralyser une cible (contrôle majeur)", "sleep|Sommeil;hold person|Immobilisation de personne;hold monster|Immobilisation de monstre;power word stun|Parole étourdissante;dominate person|Domination de personne;dominate monster|Domination de monstre"),
    ("mirage", 1, "Influence one target with a brief suggestion", "Influencer une cible par une brève suggestion", "charm person|Charme-personne;suggestion|Suggestion;command|Injonction;calm emotions|Apaisement"),
    ("mirage", 2, "Maintain a visual illusion for one minute", "Entretenir une illusion visuelle pendant une minute", "invisibility|Invisibilité;greater invisibility|Invisibilité supérieure;mirror image|Images miroir;major image|Image majeure;disguise self|Déguisement;blur|Flou;pass without trace|Passage sans trace"),
    ("mirage", 0, "Strike one target with psychic damage", "Frapper une cible par des dégâts psychiques", "vicious mockery|Moquerie cruelle"),
]
# Utility for which the common effect menu has no direct equivalent. Chapter 10
# prices an improvised effect by spell level (0, 1, 2, 3, 4, 4, then 5).
UTILITY = {
    "afflux": "0 light|Éclairer un objet;0 dancing lights|Faire danser des lumières;1 faerie fire|Révéler une silhouette lumineuse",
    "mirage": "0 minor illusion|Créer une illusion mineure;2 detect thoughts|Lire les pensées de surface;5 dream|Visiter un rêve;3 nondetection|Masquer sa trace magique;5 mind blank|Protéger son esprit",
    "eidolon": "1 detect evil and good|Sentir une présence surnaturelle;1 detect magic|Percevoir la magie;1 identify|Identifier un enchantement;4 divination|Consulter un présage;4 commune|Interroger un esprit;4 legend lore|Lire la mémoire d’une légende;5 true seeing|Percer une illusion",
    "creuset": "0 druidcraft|Produire un signe naturel;0 mending|Réparer un petit objet;3 create food and water|Créer des vivres et de l’eau;5 control weather|Infléchir la météo",
    "horizon": "2 locate object|Localiser un objet;3 clairvoyance|Observer un lieu éloigné;4 scrying|Observer une cible à distance",
    "harmonie": "0 thaumaturgy|Amplifier sa voix ou produire un présage;0 prestidigitation|Produire un tour mineur;1 bless|Bénir un allié;1 speak with animals|Parler aux bêtes;2 animal messenger|Porter un message par un animal;3 tongues|Comprendre une langue;2 zone of truth|Faire résonner la vérité;2 silence|Étouffer les sons",
}
SPELLS = {}
for school, cost, en, fr, entries in GROUPS:
    for item in entries.split(";"):
        key, name = item.split("|")
        SPELLS[key] = (school, cost, [key.title(), name], [en, fr])
for school, entries in UTILITY.items():
    for item in entries.split(";"):
        value, rest = item.split(" ", 1)
        key, name = rest.split("|")
        SPELLS[key] = (school, int(value), [key.title(), name], ["Utility effect", "Effet utilitaire"])

LIST_HEAD = re.compile(r"(?:Cantrips? \(at will\)|\d+(?:st|nd|rd|th) level \(\d+ slots?\)|At will|\d+/day(?: each)?):\s*", re.I)
LIMITS = {"self only": "soi uniquement", "any humanoid form": "forme humanoïde", "air elemental only": "élémentaire d’air uniquement", "fire elemental only": "élémentaire de feu uniquement", "can create wine instead of water": "peut créer du vin"}


def repertoire(text):
    parts = LIST_HEAD.split(text)
    entries = []
    if len(parts) == 1:
        entries.append(re.search(r"can innately cast ([a-z ]+?)(?:,| \()", text)[1])
    else:
        if "cast disguise self and invisibility at will" in parts[0]:
            entries.extend(["disguise self", "invisibility"])
        for part in parts[1:]:
            entries.extend(part.split("\n")[0].strip().split(", "))
    result = []
    for raw in entries:
        name, _, restriction = raw.strip(" *.").partition(" (")
        restriction = restriction.rstrip(")")
        school, cost, label, effect = SPELLS[name]
        row = dict(school=school, cost=cost, n=label, effect=effect)
        if restriction:
            row["limit"] = [restriction, LIMITS[restriction]]
        result.append(row)
    return result
