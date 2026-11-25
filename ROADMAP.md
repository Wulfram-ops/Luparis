# Feuille de route — Luparis

Mise à jour : 25 novembre 2026. Ce fichier suit ce qui est fait, ce qui vient ensuite et la dette technique repérée à la relecture.

Principe d'interface retenu : **sobre et minimaliste**. L'onglet **Carte** est l'écran de jeu (jets, jauges, inventaire, notes, initiative). L'onglet **Personnage** est une fiche fixe qui sert à monter de niveau.

---

## 1. Prochaines étapes (dans l'ordre)

### 1.1 Rôles MJ / joueur / spectateur
- Rôle choisi en rejoignant la partie ; le MJ peut changer le rôle d'un participant.
- Côté joueur : masquer notes de séance, PV et seuils des monstres, fiches de monstres, secrets, repères et zones non révélés.
- Côté spectateur : lecture seule, aucun jet ni déplacement.
- Ajouter un état « révélé / caché » aux repères, zones, objets et tokens (bascule MJ en un clic).

### 1.2 Multijoueur fiable
- **Envoyer des différences, pas l'état complet** : aujourd'hui l'hôte renvoie carte + personnages + jets à chaque changement (200 ms de regroupement). Passer à des messages ciblés (`terrain` par cases, `token` par id, `ini`, `roll`) avec un numéro de révision ; état complet seulement à la connexion et en secours.
- Curseurs et sélections des autres participants (couleur par joueur, envoi limité à ~15 fois par seconde).
- Reconnexion automatique (relance de la connexion PeerJS, reprise avec le même personnage).
- Conflits d'édition : l'hôte fait foi ; chaque objet porte une révision, la plus récente validée par l'hôte gagne ; verrou léger pendant qu'un token est tenu.
- Identité des joueurs : aujourd'hui un joueur se déclare sur un personnage. Lier la connexion à un personnage (fait en partie) puis, avec la connexion Google, à un compte.

### 1.3 Onglet Campagne
- Préparation de séance (fil, scènes prévues, PNJ, rencontres prêtes à poser sur la carte).
- Journal des séances : retour de séance, import de la transcription de la séance 10.
- Brainstorm assisté par IA (accroches, PNJ, conséquences des choix des joueurs).
- Regroupe l'XP de campagne et l'historique des notes de séance déjà existants.

### 1.4 Comptes et données partagées
- Connexion Google + base partagée (Firebase ou Supabase) pour personnages, bestiaire, cartes et campagnes.
- Règle d'écriture : seul le MJ (et toi) modifie ; les joueurs ne modifient que leur personnage.
- Migration des données du navigateur (localStorage) vers la base, export/import JSON conservé.

### 1.5 Google Drive
- Mettre à jour les documents de règles et de lore sur Drive depuis le site (export des règles, des fiches, des notes de séance).

---

## 2. Améliorations prévues (sans ordre strict)

- **Carte de bataille**
  - Effets animés (feu, brouillard) : précalculer les sprites et n'animer que la partie visible.
  - Peindre le relief au pinceau : déjà en redessin partiel ; faire de même pour la zone rectangulaire au relâchement.
  - Lignes de vue / brouillard de guerre révélé par les tokens joueurs.
  - Mesure de zone : afficher les cibles touchées directement sur les tokens.
- **Personnage** : historique de progression (achats d'XP datés), annulation d'un achat.
- **Bestiaire** : rencontres prêtes (groupes de monstres) à glisser sur la carte, calcul de difficulté.
- **Carte du monde** : trajets du groupe, calendrier, liens vers les cartes de ville.
- **Accessibilité** : contraste du mode sombre, navigation clavier complète sur la carte.

---

## 3. Dette technique (relectures du 25 novembre, avis croisés Claude / Gemini / GPT / Perplexity)

| Sujet | État | Suite |
| --- | --- | --- |
| Fichier unique de ~420 Ko | **Fait** : CSS, règles et code séparés ; code lisible en 14 fichiers `src/js/` assemblés en `app.js` | Passer aux modules ES (imports explicites) domaine par domaine, en commençant par le multijoueur |
| Variables partagées entre domaines | Toujours une seule portée (comme avant le découpage) | À réduire au fil des modules ES ; règles de jeu en fonctions pures testables |
| Persistance dispersée | **Fait** : `lsGet`/`lsSet`, alerte en cas d'échec, version de schéma, sauvegarde complète 💾 | Couche « dépôt » pour brancher Firebase/Supabase sans toucher au reste |
| Données reçues ou sauvegardées | **Fait** : jets assainis (y compris restaurés), fiches des joueurs filtrées, miniatures limitées aux images | Étendre la validation à l'import de cartes et de bestiaire |
| Outils Python | **Fait** : plus d'`exec`, CLI `argparse`, `build_world.py` unique, `requirements.txt`, Chrome configurable ; sorties identiques à l'octet près | Tests pytest des conversions SRD |
| Tests | **Fait** : `tests/smoke.py` (navigateur), `tools/validate_data.py`, CI GitHub | Tests unitaires des règles (coûts d'XP, dérivés de fiche) une fois extraites en fonctions pures |
| Images de la carte du monde | **Fait** : `world-lo.webp` 616 → 391 Ko sans perte visible ; HD chargée au premier zoom | — |
| Grilles en tableaux de tableaux | Correct (le dessin coûte bien plus que les données) | Tableaux typés avec la synchro multijoueur par différences |
| PeerJS chargé depuis unpkg | Version épinglée 1.5.4 | Empreinte d'intégrité ou fichier hébergé |
| Versions publiées | Une seule branche, pas d'étiquette | Étiqueter les versions jouées en séance (`v0.5`, …) |

Points des avis externes écartés : framework (React/Vue) inutile pour l'instant ; TypeScript/Vitest/ESLint prématurés avant les modules ES ; « JSON embarqués » et « images chargées au démarrage » ne correspondaient pas au code (déjà chargés à la demande) ; un aperçu de carte à 150 Ko n'est pas réaliste pour une image de 3840 px qui sert aussi d'affichage principal.

## 4. Fait récemment

- **Performance de la carte** (novembre 2026)
  - Scène mise en cache avec marge hors écran : survol, déplacement, zoom et glisser de token sans redessin complet.
  - Tuiles du sol pré-rendues ; peinture du relief en redessin partiel ; zone de sélection en surcouche.
  - Réglage Qualité (Auto / Haute / Allégée), bascule automatique sur les PC lents.
  - Sauvegarde différée (une écriture par geste, forcée à la fermeture de la page).
  - Bestiaire rendu à l'ouverture de l'onglet (page deux fois plus légère).
  - Carte du monde : déplacement en image, image HD chargée au premier zoom.
- **Sécurité multijoueur** : jets reçus des joueurs assainis ; un joueur n'agit que pour son personnage.
- **Structure** : code découpé et lisible (`src/js/`), CSS et règles séparés, outils Python reproductibles, tests navigateur et CI, sauvegarde complète exportable.
- **Interface** : barre d'outils contextuelle, aperçu avant placement (empreinte, rotation, hauteur), recherche universelle (Ctrl+K), titres de cartes cliquables (réduire) et déplaçables (maintenir), fiche Personnage fixe en trois colonnes.
- **Jeu** : fiches de monstres depuis les tokens, zones d'effet (cercle, sphère, cône, ligne, cube), notes de séance du MJ, multijoueur de test.
- **Règles v0.5** : six stats, talents, pactes, équilibrage par simulations.
- **Carte du monde** : style atlas à plat, rendu en image.
