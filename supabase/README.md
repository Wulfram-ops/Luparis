# Supabase : comptes, campagnes et rôles (lot A)

Ce dossier contient la base de données en ligne prévue dans `ROADMAP.md` §1.4 : les tables, et surtout les **règles de sécurité appliquées par la base elle-même**. Même quelqu'un qui fouille le code du site ne peut pas les contourner.

## Les règles (décidées par Fred le 28 novembre 2026)

- **Seul le propriétaire (Fred) crée les campagnes** et donne les rôles. Un rôle (MJ ou joueur) se donne **par campagne**.
- **Les notes MJ d'une campagne ne sont lisibles que par les MJ de cette campagne.** Un joueur qui est MJ de sa propre partie test ne voit pas les notes de la campagne de Fred. Fred lui-même ne lit les notes d'une autre campagne que s'il s'en ajoute MJ, ce que tous les membres voient.
- **Un personnage appartient à son joueur** et se trouve dans **une seule campagne à la fois**, ou dans aucune. Le joueur le déplace vers n'importe quelle campagne dont il est membre.
- **Le MJ de la campagne** donne l'XP et coche les cases ou le Mana utilisés. Il ne peut rien changer d'autre sur la fiche d'un joueur, ni la déplacer. **Un joueur ne modifie jamais son propre XP.**
- Un joueur peut quitter une campagne : ses personnages en sortent avec lui. Si une campagne est supprimée, les personnages sont gardés, simplement sans campagne.
- **Le propriétaire peut créer un personnage, le modifier et l'attribuer à un joueur**, pour ceux qui préfèrent que Fred le fasse. Le personnage doit alors être dans une campagne dont ce joueur est membre, ou dans aucune.
- Un visiteur non connecté ne voit rien (sauf `ping()`, qui sert à garder le projet éveillé : lot H).
- **Aucune clé IA ni aucun webhook Discord** ne va dans cette base : ils restent dans le navigateur de chacun.

## Mise en place (Fred, une seule fois, environ 15 minutes)

1. Créer un compte sur <https://supabase.com>, puis un projet (offre **Free**). Choisir la région **Europe (Paris ou Francfort)** et noter le mot de passe de la base dans un endroit sûr. Il ne sert qu'en cas de besoin, le site ne l'utilise pas.
2. **Rien à coller** (intégration activée le 28 novembre) : le projet est relié au dépôt GitHub, avec « Deploy to production » activé et le dossier de travail `.`. Supabase applique donc lui-même chaque nouveau fichier de `supabase/migrations/` à chaque envoi sur `main`. Si un jour l'intégration est coupée, on peut coller les fichiers de `supabase/migrations/` dans **SQL Editor**, dans l'ordre.
3. Ouvrir **Authentication › Providers** :
   - activer **Email**, avec le lien de connexion par e-mail (« magic link ») ;
   - activer **Google** : le tableau de bord Supabase explique comment créer l'identifiant Google, environ 10 minutes.
4. Ouvrir **Authentication › URL Configuration** et mettre `https://wulfram-ops.github.io/Luparis/` dans **Site URL** et dans **Redirect URLs**.
5. Se connecter une première fois sur le site, une fois le lot B fait. Puis, dans **Table editor › owners › Insert row**, coller **son propre identifiant**. On le trouve dans **Authentication › Users**, colonne « UID ».
6. Dans **Project Settings › API**, copier **Project URL** et la clé **anon public**, et les donner à l'IA qui fait le lot B. Ces deux-là peuvent être publiques.
   - ⚠️ La clé **service_role** donne tous les droits, en ignorant toutes les règles. **Elle ne sort jamais du tableau de bord** : ni dans le code, ni dans un message, ni à une IA.

## Les tables

| Table | Contenu | Qui lit | Qui écrit |
|---|---|---|---|
| `profiles` | nom, préférences et disposition des modules (`prefs`) | soi ; les gens avec qui on joue ; le propriétaire | soi |
| `owners` | les comptes propriétaires (Fred) | soi (pour savoir si on l'est) | personne depuis le site (tableau de bord seulement) |
| `campaigns` | nom, archivée ou non | ses membres ; le propriétaire | le propriétaire |
| `members` | qui est dans quelle campagne, avec quel rôle (`gm` ou `player`) | les membres de la campagne ; le propriétaire | le propriétaire (un joueur peut seulement se retirer) |
| `characters` | la fiche (`data`, même format que `luparis-chars`), son joueur (`owner`), sa campagne (`campaign_id`, une seule) | son joueur ; les membres de sa campagne ; le propriétaire | son joueur (sauf l'XP) ; les MJ de sa campagne (XP et `used` seulement) ; le propriétaire (tout, y compris l'attribuer à un joueur) |
| `campaign_state` | la table entre deux séances : carte, pions, initiative, objets, jets publics | les membres | les MJ de la campagne |
| `gm_notes` | notes MJ, jets secrets, rencontres préparées, monstres maison | **les MJ de la campagne seulement** | les MJ de la campagne |

- Chaque enregistrement de `characters`, `campaign_state` et `gm_notes` incrémente `rev` et met à jour `updated_at`. Le site s'en sert pour repérer qu'une fiche a changé ailleurs (lots D et F).
- Tailles maximales : 200 Ko pour les préférences, 1 Mo pour une fiche, 5 Mo pour l'état d'une campagne et pour ses notes MJ.

## Pour les IA qui font les lots suivants

- Le site ne parle à la base qu'avec la clé `anon` et la session de l'utilisateur. Toute la sécurité est ici : ne jamais la « compléter » côté site par des contrôles qui la remplaceraient.
- **Une règle à changer ?** On **ajoute** un fichier dans `supabase/migrations/`, avec un horodatage plus récent dans le nom. On ne modifie jamais une migration déjà envoyée. On adapte aussi `tests/supabase/rls.test.mjs`. L'envoi sur `main` la déploie : seuls Fred et Claude envoient sur `main`.
- Fonctions disponibles pour les requêtes : `is_owner()`, `is_member(campagne)`, `is_gm(campagne)`.
- **Lot G (reprise des données de Fred) :** le propriétaire peut créer un personnage pour un joueur, le modifier et le lui attribuer (décision du 28 novembre, pour les joueurs moins à l'aise). Les fiches actuelles peuvent donc être importées par Fred, puis attribuées à chaque joueur.

## Tests

`tests/supabase/rls.test.mjs` charge toutes les migrations, dans l'ordre, dans un vrai PostgreSQL (PGlite, en WebAssembly : pas de serveur, pas de réseau), avec une imitation du schéma `auth` de Supabase. Il joue ensuite chaque rôle : propriétaire, MJ, joueur, joueur MJ ailleurs, inconnu, visiteur non connecté. Il vérifie chaque règle ci-dessus, soit 68 contrôles.

```
cd tests/supabase
npm install
npm test
```

La vérification automatique de GitHub (`.github/workflows/checks.yml`) les lance à chaque envoi.
