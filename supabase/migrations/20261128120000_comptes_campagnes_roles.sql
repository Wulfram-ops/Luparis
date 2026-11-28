-- Luparis — accounts, campaigns and roles (ROADMAP §1.4, lot A). Decided by Fred on 28 November 2026.
--
-- Applied by Supabase itself: the project's GitHub integration ("Deploy to production") runs every new
-- file of supabase/migrations/ on a push to main. Never edit a migration that has been pushed: add a new
-- file (a later timestamp) instead. This one is idempotent anyway ("if not exists", "create or replace").
--
-- The rules, enforced here by the database (Row Level Security), not by the site:
--   * only an owner (Fred, listed in public.owners) creates, renames, archives or deletes a campaign
--     and gives roles; a role (gm or player) is per campaign;
--   * a GM reads and writes the GM notes of their own campaigns only (an owner too: add yourself as gm);
--   * a character belongs to its player and sits in one campaign at a time, or none; the player moves it
--     to any campaign they are a member of; the campaign's GMs change its XP and its used boxes/Mana
--     only, never anything else; a player never changes their own XP;
--   * the owner may create a character, edit it and give it to a player (for players who would rather
--     have Fred do it); the character must then sit in a campaign its new player belongs to, or none;
--   * nothing here holds AI keys or the Discord webhook: those stay in each browser.
--
-- Only the public "anon" key and the project URL go into the site. The "service_role" key bypasses every
-- rule below: it never leaves the Supabase dashboard.

-- ---------------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  prefs jsonb not null default '{}'::jsonb check (jsonb_typeof(prefs) = 'object' and octet_length(prefs::text) <= 200000),
  updated_at timestamptz not null default now()
);

-- Owners: filled by hand in the dashboard (Table editor › owners › Insert row › your user id).
-- No policy lets anyone write here from the site.
create table if not exists public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  archived boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('gm', 'player')),
  added_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);
create index if not exists members_user_idx on public.members (user_id);

-- One campaign at a time is a column, not a link table: a character cannot be in two campaigns.
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade default auth.uid(),
  campaign_id uuid references public.campaigns (id) on delete set null,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 1000000),
  rev integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists characters_owner_idx on public.characters (owner);
create index if not exists characters_campaign_idx on public.characters (campaign_id);

-- What the players see of a campaign between sessions: map, tokens, initiative, objects, public rolls.
create table if not exists public.campaign_state (
  campaign_id uuid primary key references public.campaigns (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 5000000),
  rev integer not null default 0,
  updated_at timestamptz not null default now()
);

-- GM only: notes, secret rolls, prepared encounters, home-made monsters.
create table if not exists public.gm_notes (
  campaign_id uuid primary key references public.campaigns (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 5000000),
  rev integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------------
-- Who is who. SECURITY DEFINER so the policies can read members/owners without looping through their
-- own policies; search_path pinned so nothing can be swapped in.
-- ---------------------------------------------------------------------------------------------------

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.owners where user_id = auth.uid());
$$;

create or replace function public.is_member(c uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select c is not null and exists (select 1 from public.members where campaign_id = c and user_id = auth.uid());
$$;

create or replace function public.is_gm(c uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select c is not null and exists (
    select 1 from public.members where campaign_id = c and user_id = auth.uid() and role = 'gm'
  );
$$;

-- Is user u a member of campaign c (used to check where a character may go)?
create or replace function public.user_in(c uuid, u uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select c is not null and exists (select 1 from public.members where campaign_id = c and user_id = u);
$$;

-- Do I share a campaign with user u (to see their name)?
create or replace function public.shares_campaign(u uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.members a join public.members b on a.campaign_id = b.campaign_id
    where a.user_id = auth.uid() and b.user_id = u
  );
$$;

-- For the daily wake-up (lot H): proves the project answers, reveals nothing.
create or replace function public.ping() returns integer
language sql stable as $$ select 1 $$;

-- ---------------------------------------------------------------------------------------------------
-- Triggers: revision numbers, and what a GM may change on someone else's character.
-- ---------------------------------------------------------------------------------------------------

create or replace function public.bump_rev() returns trigger
language plpgsql as $$
begin
  new.rev := old.rev + 1;
  new.updated_at := now();
  return new;
end $$;

create or replace function public.guard_character() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    return new; -- dashboard / service role
  end if;
  if tg_op = 'INSERT' then
    if new.owner is distinct from me and not public.is_owner() then
      raise exception 'a character is created by its own player';
    end if;
    if not public.is_gm(new.campaign_id) and not public.is_owner() then
      new.data := new.data - 'xp'; -- a player does not set their own XP (the campaign GM does)
    end if;
    if new.campaign_id is not null and not public.user_in(new.campaign_id, new.owner) then
      raise exception 'the player is not a member of that campaign';
    end if;
    return new;
  end if;
  if public.is_owner() and me is distinct from old.owner then
    -- the owner (Fred): may rewrite or give a character to a player, who must belong to its campaign
    if new.campaign_id is not null and not public.user_in(new.campaign_id, new.owner) then
      raise exception 'the player is not a member of that campaign';
    end if;
    return new;
  end if;
  if new.owner is distinct from old.owner then
    if public.is_owner() then -- the owner gives away one of their own characters
      if new.campaign_id is not null and not public.user_in(new.campaign_id, new.owner) then
        raise exception 'the player is not a member of that campaign';
      end if;
      return new;
    end if;
    raise exception 'a character cannot change player';
  end if;
  if new.campaign_id is null and old.campaign_id is not null
     and not public.user_in(old.campaign_id, old.owner) and new.data = old.data then
    return new; -- the player left the campaign, or it was deleted: the character simply leaves it
  end if;
  if me = old.owner then
    -- the player: anything but their XP, unless they are also GM of the campaign it sits in
    if (new.data -> 'xp') is distinct from (old.data -> 'xp') and not public.is_gm(old.campaign_id) then
      raise exception 'only the campaign GM changes XP';
    end if;
    if new.campaign_id is distinct from old.campaign_id and new.campaign_id is not null
       and not public.user_in(new.campaign_id, new.owner) then
      raise exception 'the player is not a member of that campaign';
    end if;
    return new;
  end if;
  -- someone else (a GM of the character's campaign, per the policies): XP and used boxes/Mana only
  if new.campaign_id is distinct from old.campaign_id then
    raise exception 'only the player moves their character';
  end if;
  if (new.data - 'xp' - 'used') is distinct from (old.data - 'xp' - 'used') then
    raise exception 'a GM changes only XP and used boxes/Mana on a player''s character';
  end if;
  return new;
end $$;

-- A player who leaves a campaign takes their characters out of it.
create or replace function public.release_characters() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.characters set campaign_id = null
  where campaign_id = old.campaign_id and owner = old.user_id;
  return old;
end $$;

drop trigger if exists characters_guard on public.characters;
create trigger characters_guard before insert or update on public.characters
  for each row execute function public.guard_character();
drop trigger if exists characters_rev on public.characters;
create trigger characters_rev before update on public.characters
  for each row execute function public.bump_rev();
drop trigger if exists campaign_state_rev on public.campaign_state;
create trigger campaign_state_rev before update on public.campaign_state
  for each row execute function public.bump_rev();
drop trigger if exists gm_notes_rev on public.gm_notes;
create trigger gm_notes_rev before update on public.gm_notes
  for each row execute function public.bump_rev();
drop trigger if exists members_release on public.members;
create trigger members_release after delete on public.members
  for each row execute function public.release_characters();

-- ---------------------------------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.owners enable row level security;
alter table public.campaigns enable row level security;
alter table public.members enable row level security;
alter table public.characters enable row level security;
alter table public.campaign_state enable row level security;
alter table public.gm_notes enable row level security;

-- Visitors who are not signed in (anon) get nothing but ping().
revoke all on public.profiles, public.owners, public.campaigns, public.members, public.characters,
  public.campaign_state, public.gm_notes from anon;
grant select, insert, update, delete on public.profiles, public.campaigns, public.members, public.characters,
  public.campaign_state, public.gm_notes to authenticated;
grant select on public.owners to authenticated;
revoke execute on function public.is_owner(), public.is_member(uuid), public.is_gm(uuid), public.user_in(uuid, uuid),
  public.shares_campaign(uuid) from public, anon;
grant execute on function public.is_owner(), public.is_member(uuid), public.is_gm(uuid), public.user_in(uuid, uuid),
  public.shares_campaign(uuid) to authenticated;
grant execute on function public.ping() to anon, authenticated;

-- profiles: your own; the names of people you play with; the owner sees everyone (to invite them).
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_owner() or public.shares_campaign(id));
drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete to authenticated using (id = auth.uid());

-- owners: you may only learn whether you are one.
drop policy if exists owners_read on public.owners;
create policy owners_read on public.owners for select to authenticated using (user_id = auth.uid());

-- campaigns: members see theirs; only an owner creates, changes or deletes.
drop policy if exists campaigns_read on public.campaigns;
create policy campaigns_read on public.campaigns for select to authenticated
  using (public.is_owner() or public.is_member(id));
drop policy if exists campaigns_insert on public.campaigns;
create policy campaigns_insert on public.campaigns for insert to authenticated with check (public.is_owner());
drop policy if exists campaigns_update on public.campaigns;
create policy campaigns_update on public.campaigns for update to authenticated
  using (public.is_owner()) with check (public.is_owner());
drop policy if exists campaigns_delete on public.campaigns;
create policy campaigns_delete on public.campaigns for delete to authenticated using (public.is_owner());

-- members: members see the table of their campaign; only an owner gives or removes roles,
-- except that a player may leave a campaign.
drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated
  using (public.is_owner() or public.is_member(campaign_id));
drop policy if exists members_insert on public.members;
create policy members_insert on public.members for insert to authenticated with check (public.is_owner());
drop policy if exists members_update on public.members;
create policy members_update on public.members for update to authenticated
  using (public.is_owner()) with check (public.is_owner());
drop policy if exists members_delete on public.members;
create policy members_delete on public.members for delete to authenticated
  using (public.is_owner() or user_id = auth.uid());

-- characters: the player reads and writes theirs; members of its campaign read it; the campaign's GMs
-- update it (the trigger limits them to XP and used boxes/Mana); the owner reads, creates, edits,
-- gives and deletes any of them.
drop policy if exists characters_read on public.characters;
create policy characters_read on public.characters for select to authenticated
  using (owner = auth.uid() or public.is_owner() or public.is_member(campaign_id));
drop policy if exists characters_insert on public.characters;
create policy characters_insert on public.characters for insert to authenticated
  with check (owner = auth.uid() or public.is_owner());
drop policy if exists characters_update on public.characters;
create policy characters_update on public.characters for update to authenticated
  using (owner = auth.uid() or public.is_gm(campaign_id) or public.is_owner())
  with check (owner = auth.uid() or public.is_gm(campaign_id) or public.is_owner());
drop policy if exists characters_delete on public.characters;
create policy characters_delete on public.characters for delete to authenticated
  using (owner = auth.uid() or public.is_owner());

-- campaign_state: members read; GMs write; an owner may delete.
drop policy if exists state_read on public.campaign_state;
create policy state_read on public.campaign_state for select to authenticated using (public.is_member(campaign_id));
drop policy if exists state_insert on public.campaign_state;
create policy state_insert on public.campaign_state for insert to authenticated with check (public.is_gm(campaign_id));
drop policy if exists state_update on public.campaign_state;
create policy state_update on public.campaign_state for update to authenticated
  using (public.is_gm(campaign_id)) with check (public.is_gm(campaign_id));
drop policy if exists state_delete on public.campaign_state;
create policy state_delete on public.campaign_state for delete to authenticated using (public.is_owner());

-- gm_notes: the campaign's GMs only, for reading too. Being owner is not enough: an owner who wants
-- to read a campaign's notes adds themself as its GM, which every member can see.
drop policy if exists notes_read on public.gm_notes;
create policy notes_read on public.gm_notes for select to authenticated using (public.is_gm(campaign_id));
drop policy if exists notes_insert on public.gm_notes;
create policy notes_insert on public.gm_notes for insert to authenticated with check (public.is_gm(campaign_id));
drop policy if exists notes_update on public.gm_notes;
create policy notes_update on public.gm_notes for update to authenticated
  using (public.is_gm(campaign_id)) with check (public.is_gm(campaign_id));
drop policy if exists notes_delete on public.gm_notes;
create policy notes_delete on public.gm_notes for delete to authenticated using (public.is_gm(campaign_id) or public.is_owner());
