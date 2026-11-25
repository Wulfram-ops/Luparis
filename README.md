# Luparis

Site tout-en-un pour la campagne Luparis (règles maison D&D 5.5 × Daggerheart) : battle map isométrique, fiches de personnage par campagne, bestiaire avec générateur IA, livre de règles, carte du monde et cartes de villes jouables. Bilingue anglais/français.

Version en ligne : https://wulfram-ops.github.io/Luparis/

## Lancer en local

Sous Windows : double-clic sur `Lancer-Luparis.bat` (il faut Python). Il reconstruit `app.js` puis ouvre le site.

Sinon, depuis le dossier du dépôt :

```
python3 tools/build_site.py
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000/index.html. Ouvert en double-clic (sans serveur), le site ne peut pas lire ses fichiers voisins (carte du monde, bestiaire SRD, règles).

## Modifier le site

| Quoi | Où | Ensuite |
| --- | --- | --- |
| Code | `src/js/*.js` (un fichier par domaine, chargés dans l'ordre des noms) | `python3 tools/build_site.py` |
| Styles | `css/luparis.css` | `python3 tools/build_site.py` (met à jour le numéro de version) |
| Règles | `rules/en.html`, `rules/fr.html` | rien |
| Talents | `tools/talents.py` (source unique) | `python3 tools/talents.py` |
| Structure de la page | `index.html` | rien |

`app.js` est **généré** : ne pas le modifier à la main. `tools/build_site.py --check` signale un `app.js` en retard sur `src/js/`.

Les fichiers de `src/js/` partagent une même portée (comme l'ancien script unique) : une fonction déclarée dans un fichier est visible partout. Ordre : état et traductions, rendu de la carte, pions et saisie, scènes et villes, bestiaire, données des talents, personnage, table de jeu (initiative, main, IA), carte du monde, interface, outils (sauvegarde, recherche, zones), notes de séance et multijoueur, démarrage.

Avec `?debug=1` dans l'adresse, `window.DBG('expression')` donne accès à l'état de l'application depuis la console (utilisé par les tests).

## Tests

```
pip install -r tools/requirements.txt
python3 tools/validate_data.py    # forme des JSON, du SVG et des règles
python3 tests/smoke.py            # le site dans un vrai navigateur : onglets, carte, recherche, sauvegarde, multijoueur
```

Les mêmes vérifications tournent sur GitHub à chaque push (`.github/workflows/checks.yml`).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de la page |
| `app.js` | Code du site, généré depuis `src/js/` |
| `css/luparis.css` | Styles |
| `rules/en.html`, `rules/fr.html` | Livre de règles, chargé à la première ouverture |
| `world-lo.webp`, `world-hi.webp` | Carte du monde en image (la haute définition n'est chargée qu'en zoomant) |
| `world.svg` | Calques interactifs de la carte du monde (frontières, villes, noms des pays) |
| `world-burgs.json` | Villes et bourgs : position, pays, population, remparts, port… |
| `srd-monsters.json` | Créatures du SRD 5.1 converties aux règles Luparis, plus des PNJ génériques |
| `srd-details.json` | Texte complet des fiches SRD, chargé à l'ouverture d'une fiche |
| `ROADMAP.md` | Feuille de route : prochaines étapes, améliorations, dette technique |

### Outils (`tools/`)

| Commande | Rôle |
| --- | --- |
| `python3 tools/build_site.py` | Assemble `app.js` et met à jour les versions dans `index.html` |
| `python3 tools/talents.py` | Régénère la table des talents (`src/js/30-talents-data.js`) et le chapitre des règles |
| `python3 tools/build_world.py Luparis_Full.json` | Régénère la carte du monde depuis l'export Azgaar (`world_data.py` → `world_flat.py` → `world_raster.py`) |
| `python3 tools/srd.py 5e-SRD-Monsters.json srd-monsters.json` | Régénère le bestiaire SRD depuis 5e-database (édition 2014) |
| `python3 tools/srd_details.py 5e-SRD-Monsters.json srd-details.json` | Régénère le texte complet des fiches SRD |
| `python3 tools/validate_data.py` | Vérifie les fichiers de données |

Dépendances : `tools/requirements.txt`. La carte du monde demande un Chrome (celui du système ou `python3 -m playwright install chromium`). L'export Azgaar (≈ 6,6 Mo) n'est pas versionné.

## Données

Personnages, bestiaire, cartes, villes, campagnes, notes de séance et réglages sont enregistrés dans le navigateur (localStorage). Le bouton 💾 en haut de page exporte tout dans un fichier et le réimporte sur un autre ordinateur. Le passage à une base partagée (Firebase ou Supabase) est prévu.

Le générateur IA de monstres fonctionne avec l'API intégrée de claude.ai, une clé personnelle (Claude, Gemini, OpenAI, serveur compatible) gardée dans le navigateur, ou par copier-coller sans clé.

## Licences et crédits

- Ce projet contient du contenu du System Reference Document 5.1 de Wizards of the Coast LLC, disponible sur https://dnd.wizards.com/resources/systems-reference-document et publié sous licence Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/legalcode). Les données ont été extraites du projet 5e-database (https://github.com/5e-bits/5e-database), sous licence MIT.
- Carte du monde générée avec Azgaar's Fantasy Map Generator.
- Plans de ville optionnels : Medieval Fantasy City Generator de watabou.
