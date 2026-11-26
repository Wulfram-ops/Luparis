# Instructions for AI agents working on Luparis

Read this whole file before changing anything. It lists what the site must keep doing, how to change it safely, and the owner's rules. Several agents (Claude, Codex, others) have worked on this repository; features have already been lost when one agent rebuilt a screen without knowing what the previous one had added. This file exists to stop that.

## Owner and permissions

- The project belongs to Fred (Frédéric Scraigne), the game master. **Nobody but Fred and the agent he is working with changes the site.** Do not add collaborators, open the repository to contributions, or relax GitHub settings.
- Fred's decisions win over your taste. When a change would remove or replace something listed under "Fundamentals", ask Fred first, in plain words, and say what would disappear.
- Commit to `main` only when Fred asked for the change. Pull (rebase) before committing: other agents push in parallel.
- The site and its UI are bilingual. Fred writes in French; reply to him in French.

## Secrets

- AI keys (Gemini, Groq, Cerebras, OpenRouter, Mistral, Claude, OpenAI) live **only in the GM's browser** (`localStorage` keys `luparis-ai-keys` and the legacy `luparis-ai-key`). Never put a key in the code, the repository, a test, the multiplayer messages or the backup file (`bkCollect` excludes `luparis-ai-key*`; keep it that way).

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
```

The same checks run on GitHub (`.github/workflows/checks.yml`). Look at the screen too: take Playwright screenshots of what you changed, at desktop (1440×900) and phone (390×844) sizes, in French.

When you change a behaviour, **update the smoke test** so the new behaviour is checked; when you remove a test, say why in the commit message. Never delete a check just to make the suite pass.

## Fundamentals that must not disappear

Each point below was asked for by Fred. Most are covered by `tests/smoke.py`; keep them covered.

### Navigation and interface
- Left rail (`header.rail`): the six tabs (World, Play, Character, Bestiary, Rules, Multiplayer) with number-key shortcuts, universal search (Ctrl+K), language EN/FR, units ft/m, backup 💾. It folds to icons (remembered) and becomes a compact top bar on phones.
- Sober, minimal interface; useful information reachable without scrolling. Help text is folded (`details.help`), quick placement opens from its button.
- The floating **Rolls** panel at the bottom right, available from every tab; the newest roll at the bottom; your own rolls highlighted.

### Play tab (`#carte`, file `57-layout.js`)
- A **12-column modular grid** (rows of 8 px). Every panel is a module: the map, the character header (`hero`), the check matrix (`pf`), **each character card** (`c:k-…`), initiative, token, markers/zones, illustrations, GM notes.
- A module moves by its **title** (the map by its ⠿ grip) and resizes by its corner; the modules in the way **move down as a live preview**; release keeps, Esc cancels; double-click the corner fits the content.
- **No module ever needs an inner scrollbar**: heights fit the content and grow with it (`gGrow`).
- Presets **Table, Combat, Exploration, Preparation** (Preparation is GM-only and switches to Edit mode). There is no "Character/Fiche" preset (Fred removed it). "Customize" shows/hides modules; layouts are saved per role (table / player / spectator) and per preset; "Reset layout" rebuilds the preset.
- Cards share one structure: family line (Combat, Magic, Checks, Gear, Character, Table), title, content, buttons; one top colour per family; no duplicated numbers between the header and the cards; effects above the character's tier are summarised in one line, not shown greyed out.
- Titles do not fold modules on the Play tab.

### Battle map (`10-render.js`, `15-tokens-input.js`, `55-tools.js`, `56-menu.js`)
- **Isometric 2:1 view (Dofus-like) by default**, top-down view as a personal option (`PROJ`, `luparis-proj`, button `#proj`). Both views must keep working: drawing, picking (`pick`), zones, measures, objects, tokens, multiplayer.
- Rotation by quarter turns (`rot`), kept per player.
- **See-through walls**: raised cells and objects drawn in front of a token are faded (`fadeCells`).
- Play / Edit modes; the asset mover (`shift`); doors and levers that players can open; right-drag pans; wheel and keys zoom; no zoom, fit or quality buttons (Fred removed them).
- Wounded monsters show a red ring and a drop of blood.
- Map size up to 128×128 must stay in sync in multiplayer (messages are cut into 48 KB pieces).

### Map generation (`58-mapgen.js`, `59-map-presets.js`)
- A sentence becomes a recipe (keywords, or an AI with the GM's keys, tried in order: Gemini, Groq, Cerebras, OpenRouter, Mistral, Claude, OpenAI). The recipe is cleaned (`mgClean`) before drawing; a preview is shown before replacing the map; Undo restores.
- Coherence rules: underground places are dug into rock; no scene that contradicts the setting; doors only in real doorways; every place reachable (`mgAccess`); groups instead of lonely rocks, trees or puddles (`mgTidy`); enough cover and a high point (`mgCover`); "night" is not a darkness zone.
- Never generate a map in Fred's browser without telling him: it replaces his current map.

### Multiplayer (`60-session-multiplayer.js`)
- PeerJS; the host filters what it sends (`mpView`): no hidden element, no monster numbers, no secret GM roll; players only act for their own character.
- Players place their own token, open doors and levers, lay zones and effects, keep their own view angle, and pick a character no one else has claimed. Spectators are read-only.
- The players' bestiary shows only the creatures the GM reveals.

### Characters and rules (`35-character.js`, `40-table.js`, `rules/`)
- No classes: one shared menu of effects, each school only has a small extra. All schools roll d8; Surge ignores 2 armour.
- Attack: d20 + the Matrix cell chosen for the situation + Tier. Weapon damage: Tier dice + Tier.
- Shields give Evasion by size (buckler +1, round +1, heater +2, great +3 with Finesse cap +2, pavise +3 with cap +1); no Parry roll; Interception targets the interceptor's Evasion.
- Mage reflex shield: reaction paid in Mana, +2 Evasion per point (Aegis +3 and on an ally).
- Campaign folders with campaign XP (GM only), rename and delete; XP purchases by players go through the host.
- Open question for Fred: monsters still use Tier + 1 to hit.

## When you finish

- Update `ROADMAP.md` (what was done, what is next, technical debt you noticed).
- If you add a fundamental feature, add it to this file and to the smoke test.
