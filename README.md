# Luparis

Site tout-en-un pour la campagne Luparis (règles maison D&D 5.5 × Daggerheart) : battle map isométrique, fiches de personnage par campagne, bestiaire avec générateur IA, livre de règles, carte du monde et cartes de villes jouables. Bilingue anglais/français.

## Lancer en local

Sous Windows : double-clic sur `Lancer-Luparis.bat` (il faut Python). Sinon :

Le site lit des fichiers voisins (`world.svg`, `world-burgs.json`, `srd-monsters.json`), il faut donc un petit serveur :

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000/index.html. En double-clic, la carte du monde et le bestiaire SRD ne se chargent pas.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Tout le site (HTML, CSS et JS dans un seul fichier) |
| `world.svg` | Carte du monde, générée depuis l'export Azgaar |
| `world-burgs.json` | Villes et bourgs : position, pays, population, remparts, port… |
| `srd-monsters.json` | Créatures du SRD 5.1 converties aux règles Luparis, plus des PNJ génériques |
| `tools/world4.py` | Régénère `world.svg` et `world-burgs.json` : `python3 tools/world4.py Luparis_Full.json world.svg` |
| `tools/srd.py` | Régénère `srd-monsters.json` depuis 5e-database : `python3 tools/srd.py 5e-SRD-Monsters.json srd-monsters.json` |

L'export Azgaar (≈ 6,6 Mo) n'est pas versionné.

## Données

Personnages, bestiaire, pions, repères et lore sont pour l'instant enregistrés dans le navigateur (localStorage). Le passage à une base partagée (Firebase ou Supabase) est prévu pour l'hébergement.

Le générateur IA de monstres utilise l'API `sample` de claude.ai et ne fonctionne que dans la version publiée sur claude.ai.

## Licences et crédits

- Ce projet contient du contenu du System Reference Document 5.1 de Wizards of the Coast LLC, disponible sur https://dnd.wizards.com/resources/systems-reference-document et publié sous licence Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/legalcode). Les données ont été extraites du projet 5e-database (https://github.com/5e-bits/5e-database), sous licence MIT.
- Carte du monde générée avec Azgaar's Fantasy Map Generator.
- Plans de ville optionnels : Medieval Fantasy City Generator de watabou.
