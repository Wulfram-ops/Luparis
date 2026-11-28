# Instructions for AI agents working on Luparis

Read this whole file before changing anything. It lists what the site must keep doing, how to change it safely, and the owner's rules. Several agents (Claude, Codex, others) have worked on this repository; features have already been lost when one agent rebuilt a screen without knowing what the previous one had added. This file exists to stop that.

## Owner and permissions

- The project belongs to Fred (Frédéric Scraigne), the game master. **Nobody but Fred and the agent he is working with changes the site.** Do not add collaborators, open the repository to contributions, or relax GitHub settings.
- Fred's decisions win over your taste. When a change would remove or replace something listed under "Fundamentals", ask Fred first, in plain words, and say what would disappear.
- Commit to `main` only when Fred asked for the change. Pull (rebase) before committing: other agents push in parallel.
- The site and its UI are bilingual. Fred writes in French; reply to him in French.

## Secrets

- AI keys (Gemini, Groq, Cerebras, OpenRouter, Mistral, Claude, OpenAI) live **only in the GM's browser** (`localStorage` keys `luparis-ai-keys` and the legacy `luparis-ai-key`). Never put a key in the code, the repository, a test, the multiplayer messages or the backup file (`bkCollect` excludes `luparis-ai-key*`; keep it that way).
- The Discord webhook URL of the chat mirror (GM only) lives **only in the GM's browser** (`luparis-discord`). Same hygiene as the AI keys: never in the code, the repository, a test or a backup (`bkCollect` excludes `luparis-discord`; keep it that way). Whispers are never mirrored.

## How the site is built

- Static site on GitHub Pages: `index.html`, `css/luparis.css`, `app.js`, JSON data, `rules/*.html`. No framework, no bundler.
- **Edit `src/js/*.js`, never `app.js`.** `python3 tools/build_site.py` concatenates them (name order) into `app.js` and stamps cache-busting versions into `index.html`. All files after `00-prelude.js` share **one block scope**: a function declared in one file is visible in all the others, and later files may wrap earlier functions (`renderHand = wrapper(renderHand)`).
- Talents come from `tools/talents.py` (`python3 tools/talents.py` regenerates `src/js/30-talents-data.js`; run it again after formatting).
- Format the JS files you touch with `npx --yes prettier@3 --write <files>`.
- Every visible string goes through `L2('English', 'Français')`, `t('key')` (tables in `05-state.js` / `40-table.js`) or `data-i18n` / `data-play-i18n`. Content rendered from JS must be re-rendered when the language changes (see `setLang` in `50-ui.js`).
- `?debug=1` exposes `DBG('expression')` for tests and debugging.

## Checks before every commit

```
python3 tools/build_site.py
node --check app.js
python3 -m http.server 8765 &      # the smoke test expects this server
python3 tests/smoke.py             # must end with "All checks passed."
python3 tools/validate_data.py
ruff check tools tests --select F,E9   # same lint as the CI
(cd tests/supabase && npm ci && npm test)   # when supabase/migrations/ changes: the database rules
```

The same checks run on GitHub (`.github/workflows/checks.yml`). Look at the screen too: take Playwright screenshots of what you changed, at desktop (1440×900) and phone (390×844) sizes, in French.

When you change a behaviour, **update the smoke test** so the new behaviour is checked; when you remove a test, say why in the commit message. Never delete a check just to make the suite pass.

## Fundamentals that must not disappear

Each point below was asked for by Fred. Most are covered by `tests/smoke.py`; keep them covered.

### Navigation and interface
- Left rail (`header.rail`): the six tabs (World, Play, Character, Bestiary, Rules, Multiplayer) with number-key shortcuts, universal search (Ctrl+K), language EN/FR, units ft/m, backup 💾. It folds to icons (remembered) and becomes a compact top bar on phones.
- Sober, minimal interface; useful information reachable without scrolling. Help text is folded (`details.help`), quick placement opens from its button.
- The floating **Chat** and **Rolls** panels at the bottom right, available from every tab; the newest roll at the bottom; your own rolls highlighted.

### Play tab (`#carte`, file `57-layout.js`)
- A **12-column modular grid** (rows of 8 px). Every panel is a module: the map, the character header (`hero`), the check matrix (`pf`), **each character card** (`c:k-…`), initiative, token, markers/zones, illustrations, GM notes.
- A module moves by its **title** (the map by its ⠿ grip) and resizes by its corner; the modules in the way **move down as a live preview**; release keeps, Esc cancels; double-click the corner fits the content.
- **No module ever needs an inner scrollbar**: heights fit the content and grow with it (`gGrow`).
- Presets **Table, Combat, Exploration, Preparation** (Preparation is GM-only and switches to Edit mode). There is no "Character/Fiche" preset (Fred removed it). "Customize" shows/hides modules; layouts are saved per role (table / player / spectator) and per preset; "Reset layout" rebuilds the preset.
- Cards share one structure: family line (Combat, Magic, Checks, Gear, Character, Table), title, content, buttons; one top colour per family; no duplicated numbers between the header and the cards; effects above the character's tier are summarised in one line, not shown greyed out.
- Titles do not fold modules on the Play tab.

### Battle map (`10-render.js`, `15-tokens-input.js`, `55-tools.js`, `56-menu.js`)
- **"Lavis & Aquarelle" style, seen from above** (`11-watercolor.js`, Fred, 27 November): white paper, washes per terrain, hand-drawn grid, stone-block walls, roofs, tree canopies, ink stamps for objects. The whole map is painted once into an offscreen canvas (`wcGet`, rebuilt when terrain, objects, biome, size or rotation change; while a button is held on the map, changed cells get a flat preview). Tokens, zones, templates and tools are drawn on top. No image file: everything is drawn in code. The isometric view was removed at Fred's request: do not bring it back (`ISO()` stays false; its branches are dead code to clear).
- Rotation by quarter turns (`rot`), kept per player.
- Play / Edit modes; the asset mover (`shift`); doors and levers that players can open; right-drag pans; wheel and keys zoom; no zoom, fit or quality buttons (Fred removed them).
- Wounded monsters show a red ring and a drop of blood.
- Map size up to 128×128 must stay in sync in multiplayer (messages are cut into 48 KB pieces).

### Accounts and campaigns (ROADMAP §1.4, planned with Supabase, decided by Fred on 28 November)
- Only the owner (Fred) creates campaigns and gives roles; a role (GM or player) is per campaign.
- A GM reads GM notes of their own campaigns only, enforced by the database (RLS), not just hidden.
- A character belongs to its player and sits in one campaign at a time (or none); the player moves it freely between campaigns they belong to. The owner may create a character, edit it and give it to a player.
- Database changes are new files in `supabase/migrations/` (never edit a pushed one): Supabase deploys them on every push to main.
- Only the public `anon` key may be in the code. AI keys and the Discord webhook never go to Supabase.
- The site keeps working without an account, locally.
- `src/js/06-cloud.js`: the Supabase library (pinned version, SRI hash) is loaded only when someone signs in or already has a session; the session lives in `sb-luparis-auth`, outside the `luparis-` prefix, so it never goes into a backup. Sign-in uses the PKCE flow (`?code=`), which leaves the `#tab` routing alone.
- The site is served at https://luparis.fr/ (file `CNAME`, DNS at OVH); the old github.io address redirects there.

### World map (`45-world.js`)
- Towns and pins open a place sheet: description, link, and an illustration kept in the image gallery (IndexedDB, `luparis-images`) that the GM can show to the players.

### Map generation (`58-mapgen.js`, `59-map-presets.js`)
- A sentence becomes a recipe (keywords, or an AI with the GM's keys, tried in order: Gemini, Groq, Cerebras, OpenRouter, Mistral, Claude, OpenAI). The recipe is cleaned (`mgClean`) before drawing; a preview is shown before replacing the map; Undo restores.
- Coherence rules: underground places are dug into rock; no scene that contradicts the setting; doors only in real doorways; every place reachable (`mgAccess`); groups instead of lonely rocks, trees or puddles (`mgTidy`); enough cover and a high point (`mgCover`); "night" is not a darkness zone.
- Never generate a map in Fred's browser without telling him: it replaces his current map.

### Multiplayer (`60-session-multiplayer.js`)
- PeerJS; the host filters what it sends (`mpView`): no hidden element, no monster numbers, no secret GM roll; players only act for their own character.
- Players place their own token, open doors and levers, lay zones and effects, keep their own view angle, and pick a character no one else has claimed. Spectators are read-only.
- The players' bestiary shows only the creatures the GM reveals.
- In-game chat (`62-chat.js`): public messages and whispers. A player or spectator may whisper **only the GM**; the GM may whisper one player. The host is authoritative (author name, order, caps: 1000 chars, 200 messages, 8 messages per 10 seconds per connection); players see the public history synced in the state, their own whispers locally. The chat log feeds the session journal (`snMd`); the GM can mirror the **public** chat (and optionally public rolls) to a Discord webhook.

### Characters and rules (`35-character.js`, `40-table.js`, `rules/`)
- No classes: one shared menu of effects, each school only has a small extra. All schools roll d8; Surge ignores 2 armour.
- Attack: d20 + the Matrix cell chosen for the situation, **no Tier to hit** (Fred, 26 November). Damage: Tier dice of the weapon or magic school + Tier. Save DC: 8 + cell + Tier.
- Shields give Evasion by size (buckler +1, round +1, heater +2, great +3 with Finesse cap +2, pavise +3 with cap +1); no Parry roll; Interception targets the interceptor's Evasion.
- Mage reflex shield: reaction paid in Mana, +2 Evasion per point (Aegis +3 and on an ally).
- Campaign folders with campaign XP (GM only), rename and delete; XP purchases by players go through the host.
- Monsters follow the same logic (Fred, 26 November): to hit = modifier only, damage = Tier dice + Tier, DC = 8 + modifier + Tier (`tools/srd.py`, `tools/srd_luparis.py`, the AI monster prompt in `40-table.js`).

## When you finish

- Update `ROADMAP.md` (what was done, what is next, technical debt you noticed).
- If you add a fundamental feature, add it to this file and to the smoke test.
