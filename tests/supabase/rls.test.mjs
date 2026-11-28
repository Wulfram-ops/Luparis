// Tests of supabase/migrations/*.sql (ROADMAP §1.4, lot A): the rules are enforced by the database itself.
// Runs the schema in a real PostgreSQL (PGlite, WebAssembly: no server, no network) with a small stand-in
// for Supabase's auth schema, then plays each role.  Run:  cd tests/supabase && npm install && npm test
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';

const db = new PGlite();
let failed = 0,
  passed = 0;
const ok = (name, cond, extra = '') => {
  if (cond) passed++;
  else {
    failed++;
    console.log('FAIL', name, extra);
  }
};

// --- Supabase stand-in: the auth schema, auth.uid() from the JWT claim, the anon/authenticated roles
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`);
// every migration, in order, as Supabase applies them on a push to main
const MIG = new URL('../../supabase/migrations/', import.meta.url);
for (const f of readdirSync(MIG)
  .filter(f => f.endsWith('.sql'))
  .sort())
  await db.exec(readFileSync(new URL(f, MIG), 'utf8'));

const U = {
  fred: '00000000-0000-0000-0000-00000000f0ed',
  thomas: '00000000-0000-0000-0000-0000000000a1',
  lea: '00000000-0000-0000-0000-0000000000b2',
  stranger: '00000000-0000-0000-0000-0000000000c3',
};
for (const [n, id] of Object.entries(U)) await db.query('insert into auth.users values ($1, $2)', [id, n + '@x']);
await db.query('insert into public.owners values ($1)', [U.fred]); // done by hand in the dashboard

// act as someone (null = a visitor who is not signed in)
async function as(who, sql, params = []) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [who ? U[who] : '']);
  await db.exec(`set role ${who ? 'authenticated' : 'anon'}`);
  try {
    return { rows: (await db.query(sql, params)).rows, error: null };
  } catch (e) {
    return { rows: [], error: e.message };
  } finally {
    await db.exec('reset role');
  }
}
const refused = r => !!r.error;

// --- campaigns: only Fred creates them
let r = await as('fred', "insert into campaigns (name) values ('Tyranny of Dragons') returning id");
const TOD = r.rows[0]?.id;
ok('the owner creates a campaign', !!TOD, r.error);
r = await as('fred', "insert into campaigns (name) values ('Bac à sable de Thomas') returning id");
const SAND = r.rows[0]?.id;
ok(
  'a player cannot create a campaign',
  refused(await as('thomas', "insert into campaigns (name) values ('Ma campagne')")),
);
ok('a visitor cannot create a campaign', refused(await as(null, "insert into campaigns (name) values ('x')")));
r = await as('thomas', "update campaigns set name = 'Volée' where id = $1 returning id", [TOD]);
ok('a player cannot rename a campaign', r.rows.length === 0);

// --- roles, per campaign, given by Fred
for (const [c, u, role] of [
  [TOD, 'fred', 'gm'],
  [TOD, 'thomas', 'player'],
  [TOD, 'lea', 'player'],
  [SAND, 'thomas', 'gm'],
  [SAND, 'lea', 'player'],
])
  ok(
    `the owner gives ${u} the ${role} role`,
    !(await as('fred', 'insert into members values ($1, $2, $3)', [c, U[u], role])).error,
  );
ok(
  'a player cannot give himself a role',
  refused(await as('stranger', "insert into members values ($1, $2, 'gm')", [TOD, U.stranger])),
);
r = await as('thomas', "update members set role = 'gm' where campaign_id = $1 and user_id = $2 returning role", [
  TOD,
  U.thomas,
]);
ok('a player cannot promote himself to GM', r.rows.length === 0);
r = await as('thomas', 'select id, name from campaigns order by name');
ok('a member sees only his campaigns', r.rows.length === 2);
r = await as('stranger', 'select id from campaigns');
ok('a non-member sees no campaign', r.rows.length === 0);
r = await as('fred', 'select user_id from owners');
ok('the owner learns he is owner', r.rows.length === 1);
r = await as('thomas', 'select user_id from owners');
ok('a player does not see the owners list', r.rows.length === 0);

// --- GM notes: only the GMs of that campaign
ok(
  'Fred writes his notes',
  !(await as('fred', `insert into gm_notes values ($1, '{"secret":"le dragon est Corellus"}')`, [TOD])).error,
);
ok(
  'Thomas writes the notes of his sandbox',
  !(await as('thomas', `insert into gm_notes values ($1, '{"t":"test"}')`, [SAND])).error,
);
r = await as('thomas', 'select data from gm_notes where campaign_id = $1', [TOD]);
ok("a player who is GM elsewhere does not read Fred's notes", r.rows.length === 0);
r = await as('thomas', 'select campaign_id from gm_notes');
ok('Thomas reads only the notes of the campaign he runs', r.rows.length === 1 && r.rows[0].campaign_id === SAND);
r = await as('lea', 'select data from gm_notes');
ok('a plain player reads no GM notes', r.rows.length === 0);
r = await as('thomas', `update gm_notes set data = '{}' where campaign_id = $1 returning 1`, [TOD]);
ok("a player cannot overwrite Fred's notes", r.rows.length === 0);
r = await as('fred', 'select data from gm_notes where campaign_id = $1', [SAND]);
ok("the owner does not read a campaign's notes without being its GM", r.rows.length === 0);
ok('a visitor reads nothing', refused(await as(null, 'select * from gm_notes')));

// --- campaign state: members read, GMs write
ok('the GM saves the table', !(await as('fred', `insert into campaign_state values ($1, '{"map":1}')`, [TOD])).error);
r = await as('lea', 'select data from campaign_state where campaign_id = $1', [TOD]);
ok('a member reads the table', r.rows.length === 1);
r = await as('lea', `update campaign_state set data = '{"map":2}' where campaign_id = $1 returning 1`, [TOD]);
ok('a player cannot write the table', r.rows.length === 0);
r = await as('stranger', 'select 1 from campaign_state');
ok('a non-member does not read the table', r.rows.length === 0);
r = await as('fred', `update campaign_state set data = '{"map":3}' where campaign_id = $1 returning rev`, [TOD]);
ok('each save bumps the revision', r.rows[0]?.rev === 1, JSON.stringify(r));

// --- characters: owned by the player, one campaign at a time
r = await as(
  'thomas',
  `insert into characters (data, campaign_id) values ('{"n":"Kael","xp":9999}', $1) returning id, data`,
  [TOD],
);
const KAEL = r.rows[0]?.id;
ok('a player creates his character in his campaign', !!KAEL, r.error);
ok('a player does not set his own XP when creating it', r.rows[0] && !('xp' in r.rows[0].data));
ok(
  'a player cannot create a character for someone else',
  refused(await as('thomas', 'insert into characters (owner, data) values ($1, \'{"n":"x"}\')', [U.lea])),
);
ok(
  'a player cannot put a character in a campaign he is not in',
  refused(await as('stranger', `insert into characters (data, campaign_id) values ('{"n":"Spy"}', $1)`, [TOD])),
);
r = await as('lea', 'select data from characters where id = $1', [KAEL]);
ok("the campaign's other players see Kael", r.rows.length === 1);
r = await as('stranger', 'select 1 from characters where id = $1', [KAEL]);
ok('outsiders do not', r.rows.length === 0);
r = await as('fred', `update characters set data = jsonb_set(data, '{xp}', '300') where id = $1 returning rev`, [KAEL]);
ok('the GM gives XP', r.rows.length === 1, r.error);
ok(
  'a player cannot change his own XP',
  refused(await as('thomas', `update characters set data = jsonb_set(data, '{xp}', '5000') where id = $1`, [KAEL])),
);
r = await as(
  'thomas',
  `update characters set data = jsonb_set(data, '{bio}', '"né à Hjartvik"') where id = $1 returning data->>'xp' as xp`,
  [KAEL],
);
ok('a player edits the rest of his sheet', r.rows[0]?.xp === '300', r.error);
r = await as('fred', `update characters set data = jsonb_set(data, '{used}', '{"hp":2}') where id = $1 returning 1`, [
  KAEL,
]);
ok('the GM marks used boxes', r.rows.length === 1, r.error);
// a GM who is not the owner: Thomas runs the sandbox, Léa plays in it
r = await as('lea', `insert into characters (data, campaign_id) values ('{"n":"Ilya"}', $1) returning id`, [SAND]);
const ILYA = r.rows[0]?.id;
r = await as('thomas', `update characters set data = jsonb_set(data, '{xp}', '200') where id = $1 returning 1`, [ILYA]);
ok('a GM (not owner) gives XP in his campaign', r.rows.length === 1, r.error);
ok(
  "a GM (not owner) cannot rewrite the rest of a player's sheet",
  refused(await as('thomas', `update characters set data = jsonb_set(data, '{n}', '"Renamed"') where id = $1`, [ILYA])),
);
ok(
  "a GM (not owner) cannot move a player's character",
  refused(await as('thomas', 'update characters set campaign_id = null where id = $1', [ILYA])),
);
r = await as('lea', `update characters set data = '{}' where id = $1 returning 1`, [KAEL]);
ok('another player cannot touch Kael', r.rows.length === 0);
r = await as('thomas', 'update characters set campaign_id = $2 where id = $1 returning campaign_id', [KAEL, SAND]);
ok('a player moves his character to another campaign he is in', r.rows[0]?.campaign_id === SAND, r.error);
r = await as('fred', 'select 1 from characters where id = $1 and campaign_id = $2', [KAEL, TOD]);
ok('the character is no longer in the first campaign (one at a time)', r.rows.length === 0);
r = await as('lea', `insert into characters (data, campaign_id) values ('{"n":"Shynalee"}', $1) returning id`, [TOD]);
const SHY = r.rows[0]?.id;
ok(
  'a player cannot move his character into a campaign he is not in',
  refused(await as('lea', 'update characters set campaign_id = gen_random_uuid() where id = $1', [SHY])),
);
ok(
  'a character cannot change player',
  refused(await as('lea', 'update characters set owner = $2 where id = $1', [SHY, U.thomas])),
);
r = await as('lea', 'delete from characters where id = $1 returning 1', [KAEL]);
ok("a player cannot delete someone else's character", r.rows.length === 0);

// --- Fred creates a character for a player who would rather he did it, then gives it to him
r = await as(
  'fred',
  `insert into characters (data, campaign_id) values ('{"n":"Gyatso","xp":150}', $1) returning id, data`,
  [TOD],
);
const GYA = r.rows[0]?.id;
ok('the owner creates a character (with its XP)', !!GYA && r.rows[0].data.xp === 150, r.error);
r = await as('fred', 'update characters set owner = $2 where id = $1 returning owner', [GYA, U.thomas]);
ok('the owner gives it to a player of that campaign', r.rows[0]?.owner === U.thomas, r.error);
r = await as('thomas', 'select data from characters where id = $1 and owner = $2', [GYA, U.thomas]);
ok('the player now owns it', r.rows.length === 1);
ok(
  'the owner cannot give a character into a campaign its player is not in',
  refused(await as('fred', 'update characters set owner = $2 where id = $1', [GYA, U.stranger])),
);
r = await as(
  'fred',
  `update characters set data = jsonb_set(data, '{bio}', '"écrit par Fred"') where id = $1 returning 1`,
  [GYA],
);
ok("the owner edits a player's sheet for him", r.rows.length === 1, r.error);
r = await as('fred', `insert into characters (owner, data) values ($1, '{"n":"Corellus"}') returning owner`, [U.lea]);
ok('the owner creates a character directly for a player', r.rows[0]?.owner === U.lea, r.error);
ok(
  'a GM who is not owner still cannot give a character away',
  refused(await as('thomas', 'update characters set owner = $2 where id = $1', [GYA, U.lea])),
);

// --- leaving a campaign takes the characters out of it
ok(
  'a player may leave a campaign',
  !(await as('lea', 'delete from members where campaign_id = $1 and user_id = $2', [TOD, U.lea])).error,
);
r = await as('lea', 'select campaign_id from characters where id = $1', [SHY]);
ok('her character left with her', r.rows[0] && r.rows[0].campaign_id === null);
ok(
  'leaving a campaign does not unlock the XP',
  refused(await as('lea', `update characters set data = jsonb_set(data, '{xp}', '5000') where id = $1`, [SHY])),
);
r = await as('lea', 'delete from members where campaign_id = $1 and user_id = $2 returning 1', [SAND, U.thomas]);
ok('a player cannot remove someone else', r.rows.length === 0);

// --- profiles
ok(
  'a player saves his profile',
  !(await as('thomas', `insert into profiles (id, name, prefs) values ($1, 'Thomas', '{"lang":"fr"}')`, [U.thomas]))
    .error,
);
ok(
  "a player cannot write someone else's profile",
  refused(await as('thomas', "insert into profiles (id, name) values ($1, 'x')", [U.lea])),
);
await as('stranger', "insert into profiles (id, name) values ($1, 'Inconnu')", [U.stranger]);
r = await as('lea', 'select name from profiles where id = $1', [U.thomas]);
ok('people who play together see each other names', r.rows.length === 1);
r = await as('thomas', 'select name from profiles where id = $1', [U.stranger]);
ok('but not strangers', r.rows.length === 0);
r = await as('fred', 'select name from profiles');
ok('the owner sees every profile (to invite)', r.rows.length === 2);

// --- the wake-up call works for visitors and reveals nothing
r = await as(null, 'select public.ping() as p');
ok('ping answers a visitor', r.rows[0]?.p === 1, r.error);
ok('a visitor cannot read campaigns', refused(await as(null, 'select * from campaigns')));

// --- deleting a campaign is the owner's
r = await as('thomas', 'delete from campaigns where id = $1 returning 1', [SAND]);
ok('a GM cannot delete the campaign he runs', r.rows.length === 0);
r = await as('fred', 'delete from campaigns where id = $1 returning 1', [SAND]);
ok('the owner deletes a campaign', r.rows.length === 1);
r = await as('thomas', 'select campaign_id from characters where id = $1', [KAEL]);
ok('its characters are kept, out of any campaign', r.rows[0] && r.rows[0].campaign_id === null);

console.log(failed ? `${failed} failure(s), ${passed} passed` : `All ${passed} database checks passed.`);
process.exit(failed ? 1 : 0);
