# Feuille de route — Luparis

Mise à jour : 26 novembre 2026. Ce fichier suit ce qui est fait, ce qui vient ensuite et la dette technique repérée à la relecture.

Principe d'interface retenu : **sobre et minimaliste, sans défilement pour trouver l'utile**. Un bandeau latéral gauche porte la navigation et les réglages. L'onglet **Jeu** est l'écran de partie : une grille de modules (carte, personnage, matrice, chaque carte, initiative, pion, repères, images, notes) que chacun dispose à sa guise, avec des presets. L'onglet **Personnage** est une fiche fixe qui sert à monter de niveau.

**Pour les IA qui reprennent le projet : lire `AGENTS.md` avant tout changement.** Il liste les fondamentaux qui ne doivent pas disparaître.

---

## 0. Règles : chantier en cours (avant le reste)

### 0.1 Équilibrage des personnages
- Refaire les calculs et les simulations de combat sur les personnages (niveaux 1, 5, 10, 15, 20) : coûts d'XP, plafonds de stats, Esquive et armures, seuils, Parade, talents, pactes.
- Vérifier aussi les monstres convertis du SRD, et le nouveau souffle à recharge (Tier dés par tour de recharge).
- Sortie attendue : un tableau des écarts (combien de coups pour tomber, dégâts par round) et les corrections proposées.
- **Recherche des répartitions d'XP (25 novembre, règles actuelles)** : meilleur build de chaque voie aux niveaux 1, 5, 10, 20.
  - La Parade rendait le bouclier obligatoire à bas niveau (2 mains, tir et mages à 35-45 % au niveau 1). **Fait (25 novembre) :** plus de Parade ni de jet ; le bouclier donne +1 à +3 d'Esquive selon sa taille, les grands boucliers plafonnent la Finesse comme une armure (+2 grand bouclier, +1 pavois) et gardent l'Interception (l'attaque vise ton Esquive). Simulation : les voies martiales restent entre 78 et 100 % à tous les niveaux ; le duelliste garde un petit bouclier, le tank en armure lourde prend le grand.
  - La stat de domaine physique sert à la fois au toucher, aux dégâts, à l'Esquive et aux seuils : tout martial la monte au maximum. Les mages doivent la monter pour se défendre et payer en plus la mentale pour attaquer : 65-80 % de l'optimum. Pistes : sort de base + Puissance mentale, Maîtrise par niveau (0.2).
  - Les Tiers sont moins rentables que les stats : l'optimum reste au Tier 2 au niveau 10. La Maîtrise par niveau (0.2) corrige ça.
  - Second achat (école pour l'infusion, Apex, 2e famille) : ±5 %, les hybrides ne sont ni punis ni favorisés.
  - Achats « au feeling » : 25 à 45 % de la puissance optimale en médiane, l'écart vient surtout des stats dispersées sur des cases inutilisées. Piste : une aide sur la fiche qui montre quelles stats servent à quoi.

### 0.2 Maîtrise façon Daggerheart (décidé le 25 novembre, chiffres à valider)
- **Décidé :** la **Maîtrise** donne le nombre de dés de dégâts, pour les armes comme pour la magie.
  - Une partie vient du niveau, gratuitement : 1 au niveau 1, 2 au 5, 3 au 10, 4 au 15, 5 au 20.
  - Le reste s'achète en XP, jusqu'à +5 au niveau 20, soit 10 dés au maximum.
- **Décidé :** les écoles de magie et les familles d'armes coûtent moins cher et gardent leurs passifs. Se spécialiser garde de vrais avantages : budget d'effets plus haut, passifs, affinité.
- **Décidé (25 novembre) : Luparis reste sans classes.** Tous les effets (dégâts, soin, protection, tank, contrôle, renfort, affaiblissement, placement, invocation) sont ouverts à toutes les écoles au même prix ; le récit dit comment chacune s'y prend. Chaque école garde un seul petit plus.
  - **Fait :** toutes les écoles lancent le d8 ; l'affinité de l'Afflux devient « ignore 2 points d'armure ».
  - **À écrire (v0.6) :** compléter le menu commun (renfort, affaiblissement, invocation, protection sur soi), et revoir les petits plus : Égide, une case absorbée de plus ; Creuset, une case soignée de plus ; Horizon, Déport gratuit et téléportation ; Mirage, une cible de contrôle de plus ; Harmonie, un allié de plus sur les effets d'aide ; Eidolon, voir les fils et malédictions qui durent d'elles-mêmes.
  - **Pistes issues des simulations :** le sort de base ajoute la Puissance mentale comme une arme ajoute son modificateur ; manœuvres martiales Garde, Premiers soins et Cri de ralliement pour que les martiaux puissent aussi protéger et soigner.
- **À chiffrer :**
  - le prix des crans de Maîtrise et leur plafond par niveau ;
  - le nouveau prix des écoles et des familles, et ce que chaque rang y apporte ;
  - le bonus au toucher : tient-il à la Maîtrise totale ou seulement à la part donnée par le niveau ?
  - l'effet sur les seuils et sur la conversion des monstres, si les dégâts maximums doublent (10 dés au lieu de 5).
- À valider par les simulations de 0.1.

### 0.3 Brainstorm : Luparis à travers les âges
- Luparis n'est pas seulement un monde médiéval : le système doit suivre la chronologie du monde, du lointain passé (D&D) jusqu'au lointain futur (inspiration Warhammer 40 000).
- À explorer : ce qui reste fixe (Matrice, seuils, cases, Maîtrise) et ce qui change d'une ère à l'autre (familles d'armes, armures, écoles, bestiaire, technologie, cartes).

## 1. Prochaines étapes (dans l'ordre)

### 1.1 Rôles MJ / joueur / spectateur — fait le 25 novembre
- Le joueur choisit son nom et son rôle (joueur ou spectateur) en rejoignant ; le MJ voit la liste, change un rôle ou retire quelqu'un.
- L'hôte filtre ce qu'il envoie : rien de ce qui est caché, aucun chiffre de monstre (Esquive, seuils, cases, notes), seulement « indemne / blessé / à terre ». Jets secrets du MJ en option.
- Outil 👁 Cacher (MJ) : token, objet, repère, danger ou zone ; le MJ le voit en transparence.
- Spectateur : lecture seule (ni jet, ni déplacement, ni personnage).
- Reste : brouillard de guerre (zones de carte non révélées).

### 1.2 Multijoueur fiable
- **Envoyer des différences, pas l'état complet** : aujourd'hui l'hôte renvoie carte + personnages + jets à chaque changement (200 ms de regroupement). Passer à des messages ciblés (`terrain` par cases, `token` par id, `ini`, `roll`) avec un numéro de révision ; état complet seulement à la connexion et en secours.
- Curseurs et sélections des autres participants (couleur par joueur, envoi limité à ~15 fois par seconde).
- ~~Reconnexion automatique~~ fait le 25 novembre : le joueur réessaie seul et reprend son personnage ; si le MJ recharge sa page, la partie se rouvre avec le même code.
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
  - Bâtiments des scènes Taverne et Village : intérieurs, portes vers la rue (aujourd'hui des blocs pleins).
  - Roche des souterrains : relief et teinte variés au lieu d'une masse uniforme ; rendre les murs plus bas loin des salles.
  - Vue isométrique : silhouette des pions cachés en plus de la transparence ; option pour baisser tous les murs (façon jeux de tactique).
  - Effets animés (feu, brouillard) : précalculer les sprites et n'animer que la partie visible.
  - Peindre le relief au pinceau : déjà en redessin partiel ; faire de même pour la zone rectangulaire au relâchement.
  - Lignes de vue / brouillard de guerre révélé par les tokens joueurs.
  - Mesure de zone : afficher les cibles touchées directement sur les tokens.
- **Personnage** : historique de progression (achats d'XP datés), annulation d'un achat.
- **Bestiaire** : rencontres prêtes (groupes de monstres) à glisser sur la carte, calcul de difficulté.
- **Carte du monde** : trajets du groupe, calendrier, liens vers les cartes de ville.
- **Accessibilité** : contraste du mode sombre, navigation clavier complète sur la carte.

---

## 3. Dette technique

### Relecture du 26 novembre (Claude)
- **Corrigé** : code mort de l'ancienne main de cartes (repli au clic, glisser pour réordonner, `hSaveOrder`, boutons `hfold`/`hmv`) retiré de `40-table.js` ; règle CSS associée retirée.
- **Corrigé** : `fadeCells` parcourait tous les objets pour chaque case testée ; un ensemble est construit une fois par dessin.
- **Corrigé** : la zone de redessin partiel était trop juste en vue isométrique (arbres et statues dépassaient) ; marges élargies.
- **Corrigé** : l'aperçu de bâtiment dessinait une seule arête verticale en isométrique ; il en dessine trois.
- **Corrigé** : les joueurs perdaient les presets de l'onglet Jeu et le choix de vue (règle CSS `mp-player` trop large).
- **À surveiller** : deux projections (iso / dessus) partagent les mêmes fonctions (`scr`, `tileQuad`, `tilePoint`, `pick`) ; tout nouveau dessin doit passer par elles, jamais par des calculs `TW / 2` ou `TW / 4` en dur.
- **À surveiller** : `57-layout.js` réécrit `renderHand` et `renderTok` ; une IA qui modifie ces fonctions doit garder les modules `data-gk` (sinon la grille perd ses cartes).
- **À faire** : `makeReorder` (50-ui) ne sert plus qu'au panneau latéral de l'onglet Monde ; l'ancienne clé `luparis-play-layout-v1` reste dans les navigateurs, sans effet.
- **À faire** : plusieurs fichiers écrits par d'autres agents ne sont pas formatés par Prettier (lignes très longues dans `57-layout.js` d'origine, `58-mapgen.js`, `10-render.js`) ; formater domaine par domaine, en commit séparé.

### Relectures du 25 novembre (avis croisés Claude / Gemini / GPT / Perplexity)

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
- **Interface (26 novembre)** : bandeau latéral gauche (navigation, recherche, langue, unités, sauvegarde), repliable en icônes, barre compacte sur téléphone ; barre de la carte sur une ligne avec les presets ; placement rapide et aide repliés ; bestiaire compact (actions sur une ligne).
- **Onglet Jeu modulaire (26 novembre)** : grille de 12 colonnes, chaque carte du personnage est un module ; déplacement par le titre avec aperçu des autres modules, redimensionnement par le coin ; aucun module ne défile ; presets Table, Combat, Exploration, Préparation (le preset Fiche est retiré) ; « Personnaliser » montre ou masque les modules.
- **Cartes unifiées (26 novembre)** : une structure et une couleur par famille, doublons retirés, options hors tier repliées, libellés traduits au changement de langue.
- **Vue isométrique 2:1 façon Dofus (26 novembre)** : vue par défaut, vue de dessus en option personnelle ; murs et objets devant un pion deviennent transparents.
- **Génération de cartes (26 novembre)** : souterrains creusés dans la roche, arbres en bosquets, plus d'éléments isolés, couvert et point haut garantis, étals décalés ; la nuit n'est plus une zone de ténèbres.
- Carte dessinée à partir d'une phrase (25 novembre) : champ « Décris la scène » dans la barre de la carte. Sans clé, mots-clés français et anglais (biomes, scènes, temple et bâtiments, « en ruines », « abandonné », objets, dangers, taille) ; avec une clé Gemini enregistrée dans le navigateur du MJ (⚙), l'IA écrit la recette. La clé n'est jamais exportée, même dans la sauvegarde 💾. Reste : d'autres générateurs (crypte, navire, grotte aménagée, camp militaire…), poser des monstres depuis la phrase.
- Bouclier réflexe (25 novembre) : réaction en Mana, +2 Esquive par point (Égide +3, et sur un allié). Simulation : rentable dès le niveau 10 (mages de 70 à 80 % de l'optimum), inutile au niveau 1 faute de Mana.
- Carte « Images » sur l'onglet Carte (25 novembre) : le MJ garde une galerie sur son ordinateur, montre une image aux joueurs (elle s'ouvre en grand chez eux), la masque d'un clic.

- **Performance de la carte** (novembre 2026)
  - Scène mise en cache avec marge hors écran : survol, déplacement, zoom et glisser de token sans redessin complet.
  - Tuiles du sol pré-rendues ; peinture du relief en redessin partiel ; zone de sélection en surcouche.
  - Bascule automatique en qualité allégée sur les PC lents (le réglage manuel a été retiré).
  - Sauvegarde différée (une écriture par geste, forcée à la fermeture de la page).
  - Bestiaire rendu à l'ouverture de l'onglet (page deux fois plus légère).
  - Carte du monde : déplacement en image, image HD chargée au premier zoom.
- **Sécurité multijoueur** : jets reçus des joueurs assainis ; un joueur n'agit que pour son personnage.
- **Structure** : code découpé et lisible (`src/js/`), CSS et règles séparés, outils Python reproductibles, tests navigateur et CI, sauvegarde complète exportable.
- **Interface** : barre d'outils contextuelle, aperçu avant placement (empreinte, rotation, hauteur), recherche universelle (Ctrl+K), fiche Personnage fixe en trois colonnes.
- **Jeu** : fiches de monstres depuis les tokens, zones d'effet (cercle, sphère, cône, ligne, cube), notes de séance du MJ, multijoueur de test.
- **Règles v0.5** : six stats, talents, pactes, équilibrage par simulations.
- **Bestiaire** : fiches de monstres minimalistes converties aux règles Luparis (EN/FR), dragons chaotiques neutres, souffles à recharge choisie (1 à 3 tours).
- **Carte du monde** : style atlas à plat, rendu en image.
