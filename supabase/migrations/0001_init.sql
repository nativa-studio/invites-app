-- Bunting phase 1 foundation. Apply in order. Australian English in comments; no em dashes anywhere.
create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Unambiguous token alphabet: no 0, 1, i, l, o.
create or replace function public.new_token(len int default 10) returns text language plpgsql volatile as $$
declare alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789'; out text := ''; i int;
begin
  for i in 1..len loop
    out := out || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return out;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email)
  on conflict (id) do update set email = excluded.email, name = coalesce(public.profiles.name, excluded.name);
  -- Claim any seeded events that were reserved for this email address.
  insert into public.event_members (event_id, profile_id, role)
  select id, new.id, 'owner' from public.events where lower(claim_email) = lower(new.email)
  on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default public.new_token(8),
  type text not null default 'kids_party',
  title text not null,
  host_line text,
  intro text,
  date date,
  start_time time,
  end_time time,
  time_note text,
  venue text,
  address text,
  access_info text,
  parking text,
  facilities text[] not null default '{}',
  facilities_note text,
  public_transport text,
  serve_preset text,
  serve_text text,
  good_to_know text,
  what_to_bring text,
  gift_stance text not null default 'optional',
  gift_note text,
  gift_prefs_ok text[] not null default '{}',
  gift_prefs_avoid text[] not null default '{}',
  group_gift_enabled boolean not null default false,
  accessibility_venue text,
  parents_mode text not null default 'either',
  siblings_welcome boolean not null default false,
  photo_sharing text not null default 'none',
  rsvp_by date,
  save_the_date boolean not null default false,
  group_link_enabled boolean not null default true,
  look_mode text not null default 'artwork',
  theme_id text not null default 'summer',
  layout_id text not null default 'strip',
  ink text not null default 'charcoal',
  palette jsonb,
  invite_file_path text,
  invite_image_path text,
  details_strip boolean not null default true,
  accent text,
  share_title text,
  share_description text,
  share_image_path text,
  yes_label text,
  no_label text,
  ask_party_mode text not null default 'split',
  ask_names boolean not null default true,
  ask_dietary boolean not null default true,
  dietary_chips text[] not null default '{"Nut free","Gluten free","Dairy free","Vegetarian","Vegan","Egg free"}',
  ask_accessibility boolean not null default false,
  ask_emergency boolean not null default false,
  custom_question text,
  custom_question_type text,
  plate_enabled boolean not null default false,
  plate_mode text not null default 'free',
  plate_host_note text,
  text_template text,
  reminder_template text,
  see_you_soon_template text,
  thanks_template text,
  host_phone text,
  status text not null default 'live',
  claim_email text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger events_updated before update on public.events for each row execute function public.set_updated_at();

create table public.event_members (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'cohost' check (role in ('owner','cohost')),
  added_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  contact_name text,
  phone text,
  token text not null unique default public.new_token(10),
  groups text[] not null default '{}',
  role text,
  status text not null default 'pending' check (status in ('pending','yes','no')),
  party_size int,
  children int,
  adults int,
  party_names text[] not null default '{}',
  dietary text[] not null default '{}',
  dietary_note text,
  accessibility_note text,
  custom_answer text,
  note text,
  emergency_name text,
  emergency_phone text,
  source text not null default 'invited' check (source in ('invited','group_link')),
  sent_at timestamptz,
  sent_by uuid references public.profiles(id) on delete set null,
  opened_at timestamptz,
  replied_at timestamptz,
  reminded_at timestamptz,
  see_you_soon_sent_at timestamptz,
  dropped_out_at timestamptz,
  thanks_sent_at timestamptz,
  thanks_opened_at timestamptz,
  thanks_photo_path text,
  std_acknowledged_at timestamptz,
  added_by uuid references public.profiles(id) on delete set null,
  host_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index guests_event_idx on public.guests(event_id);
create trigger guests_updated before update on public.guests for each row execute function public.set_updated_at();

create table public.plate_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  quantity int,
  claimed_by_guest_id uuid references public.guests(id) on delete set null,
  added_by_guest_id uuid references public.guests(id) on delete set null,
  added_by_profile_id uuid references public.profiles(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index plate_items_event_idx on public.plate_items(event_id);

create table public.group_gift (
  event_id uuid primary key references public.events(id) on delete cascade,
  description text,
  target numeric,
  organiser_guest_id uuid references public.guests(id) on delete set null,
  organiser_profile_id uuid references public.profiles(id) on delete set null,
  pay_details text,
  pay_reference text,
  suggested_amount numeric,
  chip_in_by date,
  message text,
  latest_update text,
  surprise boolean not null default true
);

create table public.gift_contributions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  amount numeric,
  chipped_in_at timestamptz not null default now()
);

create table public.runsheet_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  time time,
  title text not null,
  note text,
  icon text,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  visibility text not null default 'hosts' check (visibility in ('hosts','guests','specific')),
  visible_guest_ids uuid[] not null default '{}',
  visible_roles text[] not null default '{}',
  sort int not null default 0
);
create index runsheet_event_idx on public.runsheet_items(event_id);

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  body text not null,
  posted_by uuid references public.profiles(id) on delete set null,
  posted_at timestamptz not null default now()
);

create table public.shared_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  path text not null,
  sort int not null default 0
);

create table public.activity (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_guest_id uuid references public.guests(id) on delete set null,
  kind text not null,
  detail text,
  at timestamptz not null default now()
);
create index activity_event_idx on public.activity(event_id, at desc);

-- ---------- row level security: hosts ----------
create or replace function public.is_member(e uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.event_members m where m.event_id = e and m.profile_id = auth.uid());
$$;
create or replace function public.is_owner(e uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.event_members m where m.event_id = e and m.profile_id = auth.uid() and m.role = 'owner');
$$;

alter table public.events enable row level security;
create policy "members read events" on public.events for select using (public.is_member(id));
create policy "members update events" on public.events for update using (public.is_member(id)) with check (public.is_member(id));
create policy "signed in create events" on public.events for insert with check (auth.uid() is not null and created_by = auth.uid());
create policy "owners delete events" on public.events for delete using (public.is_owner(id));

alter table public.event_members enable row level security;
create policy "members read members" on public.event_members for select using (public.is_member(event_id));
create policy "creator becomes owner" on public.event_members for insert with check (
  profile_id = auth.uid() and (
    role = 'owner' and exists (select 1 from public.events e where e.id = event_id and e.created_by = auth.uid())
  )
);
create policy "owners remove members" on public.event_members for delete using (public.is_owner(event_id) or profile_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['guests','plate_items','group_gift','gift_contributions','runsheet_items','updates','shared_photos','activity'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "members all" on public.%I for all using (public.is_member(event_id)) with check (public.is_member(event_id))', t);
  end loop;
end $$;

-- ---------- guest side: security definer functions by token or slug ----------
-- Everything a guest page needs, and nothing else. No ids are accepted, only the token.

create or replace function public.event_public_json(e public.events) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'id', e.id, 'slug', e.slug, 'type', e.type, 'title', e.title, 'host_line', e.host_line, 'intro', e.intro,
    'date', e.date, 'start_time', e.start_time, 'end_time', e.end_time, 'time_note', e.time_note,
    'venue', e.venue, 'address', e.address, 'parking', e.parking, 'facilities', e.facilities, 'facilities_note', e.facilities_note,
    'public_transport', e.public_transport, 'serve_preset', e.serve_preset, 'serve_text', e.serve_text,
    'good_to_know', e.good_to_know, 'what_to_bring', e.what_to_bring, 'gift_stance', e.gift_stance, 'gift_note', e.gift_note,
    'gift_prefs_ok', e.gift_prefs_ok, 'gift_prefs_avoid', e.gift_prefs_avoid, 'group_gift_enabled', e.group_gift_enabled,
    'accessibility_venue', e.accessibility_venue, 'parents_mode', e.parents_mode, 'siblings_welcome', e.siblings_welcome
  ) || jsonb_build_object(
    'photo_sharing', e.photo_sharing, 'rsvp_by', e.rsvp_by, 'save_the_date', e.save_the_date, 'group_link_enabled', e.group_link_enabled,
    'look_mode', e.look_mode, 'theme_id', e.theme_id, 'layout_id', e.layout_id, 'ink', e.ink, 'palette', e.palette,
    'invite_image_path', e.invite_image_path, 'details_strip', e.details_strip, 'accent', e.accent,
    'share_title', e.share_title, 'share_description', e.share_description, 'yes_label', e.yes_label, 'no_label', e.no_label,
    'ask_party_mode', e.ask_party_mode, 'ask_names', e.ask_names, 'ask_dietary', e.ask_dietary, 'dietary_chips', e.dietary_chips,
    'ask_accessibility', e.ask_accessibility, 'ask_emergency', e.ask_emergency, 'custom_question', e.custom_question,
    'custom_question_type', e.custom_question_type, 'plate_enabled', e.plate_enabled, 'plate_mode', e.plate_mode, 'plate_host_note', e.plate_host_note,
    'host_phone', e.host_phone, 'status', e.status
  ) || jsonb_build_object(
    'runsheet', (select coalesce(jsonb_agg(jsonb_build_object('time', r.time, 'title', r.title, 'note', r.note, 'icon', r.icon) order by r.sort, r.time), '[]'::jsonb)
                 from public.runsheet_items r where r.event_id = e.id and r.visibility = 'guests'),
    'updates', (select coalesce(jsonb_agg(jsonb_build_object('body', u.body, 'posted_at', u.posted_at) order by u.posted_at desc), '[]'::jsonb)
                 from public.updates u where u.event_id = e.id)
  );
$$;

create or replace function public.guest_public_json(g public.guests) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'name', g.name, 'contact_name', g.contact_name, 'status', g.status, 'party_size', g.party_size, 'children', g.children, 'adults', g.adults,
    'party_names', g.party_names, 'dietary', g.dietary, 'dietary_note', g.dietary_note, 'accessibility_note', g.accessibility_note,
    'custom_answer', g.custom_answer, 'note', g.note, 'emergency_name', g.emergency_name, 'emergency_phone', g.emergency_phone,
    'replied_at', g.replied_at, 'dropped_out_at', g.dropped_out_at, 'see_you_soon_sent_at', g.see_you_soon_sent_at,
    'thanks_sent_at', g.thanks_sent_at, 'thanks_photo_path', g.thanks_photo_path, 'source', g.source
  );
$$;

create or replace function public.get_invite(p_token text) returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  update public.guests set opened_at = coalesce(opened_at, now()) where id = g.id;
  return jsonb_build_object('event', public.event_public_json(e), 'guest', public.guest_public_json(g),
    'access_info', case when g.status = 'yes' then e.access_info else null end);
end $$;

create or replace function public.get_event_by_slug(p_slug text) returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.events;
begin
  select * into e from public.events where slug = p_slug;
  if not found then return null; end if;
  return jsonb_build_object('event', public.event_public_json(e));
end $$;

-- The RSVP. Every optional field may be null. Status flips to yes or no; a later call overwrites.
create or replace function public.submit_rsvp(p_token text, p_status text, p_children int default null, p_adults int default null,
  p_party_size int default null, p_party_names text[] default null, p_dietary text[] default null, p_dietary_note text default null,
  p_accessibility_note text default null, p_custom_answer text default null, p_note text default null,
  p_emergency_name text default null, p_emergency_phone text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.guests;
begin
  if p_status not in ('yes','no') then raise exception 'status must be yes or no'; end if;
  select * into g from public.guests where token = p_token;
  if not found then raise exception 'unknown token'; end if;
  update public.guests set
    status = p_status,
    children = case when p_status = 'yes' then p_children else null end,
    adults = case when p_status = 'yes' then p_adults else null end,
    party_size = case when p_status = 'yes' then coalesce(p_party_size, coalesce(p_children,0) + coalesce(p_adults,0)) else 0 end,
    party_names = case when p_status = 'yes' then coalesce(p_party_names, '{}') else '{}' end,
    dietary = case when p_status = 'yes' then coalesce(p_dietary, '{}') else '{}' end,
    dietary_note = case when p_status = 'yes' then nullif(trim(p_dietary_note), '') else null end,
    accessibility_note = case when p_status = 'yes' then nullif(trim(p_accessibility_note), '') else null end,
    custom_answer = nullif(trim(p_custom_answer), ''),
    note = nullif(trim(p_note), ''),
    emergency_name = case when p_status = 'yes' then nullif(trim(p_emergency_name), '') else null end,
    emergency_phone = case when p_status = 'yes' then nullif(trim(p_emergency_phone), '') else null end,
    replied_at = now(),
    dropped_out_at = case when p_status = 'no' and g.status = 'yes' and g.see_you_soon_sent_at is not null then now() else dropped_out_at end
  where id = g.id;
  insert into public.activity (event_id, actor_guest_id, kind, detail) values (g.event_id, g.id, 'rsvp', p_status);
  select * into g from public.guests where id = g.id;
  return public.guest_public_json(g);
end $$;

-- Group link: "Who's this from?" creates or matches a guest, then returns their personal token.
create or replace function public.claim_group_link(p_slug text, p_name text, p_phone text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.events; g public.guests; key text;
begin
  select * into e from public.events where slug = p_slug and group_link_enabled;
  if not found then raise exception 'link closed'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'name required'; end if;
  key := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 9);
  if key <> '' then
    select * into g from public.guests where event_id = e.id and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = key limit 1;
  end if;
  if g.id is null then
    select * into g from public.guests where event_id = e.id and lower(trim(name)) = lower(trim(p_name)) limit 1;
  end if;
  if g.id is null then
    insert into public.guests (event_id, name, phone, source) values (e.id, trim(p_name), nullif(trim(p_phone), ''), 'group_link') returning * into g;
    insert into public.activity (event_id, actor_guest_id, kind, detail) values (e.id, g.id, 'joined', 'via group link');
  end if;
  return jsonb_build_object('token', g.token);
end $$;

revoke all on function public.get_invite(text), public.get_event_by_slug(text), public.claim_group_link(text, text, text),
  public.submit_rsvp(text, text, int, int, int, text[], text[], text, text, text, text, text, text) from public;
grant execute on function public.get_invite(text), public.get_event_by_slug(text), public.claim_group_link(text, text, text),
  public.submit_rsvp(text, text, int, int, int, text[], text[], text, text, text, text, text, text) to anon, authenticated;

-- Hosts' helpers
create or replace function public.create_event_with_owner(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare eid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.events (title, type, date, start_time, end_time, venue, address, intro, host_line, created_by)
  values (p->>'title', coalesce(p->>'type','kids_party'), (p->>'date')::date, (p->>'start_time')::time, (p->>'end_time')::time,
          p->>'venue', p->>'address', p->>'intro', p->>'host_line', auth.uid())
  returning id into eid;
  insert into public.event_members (event_id, profile_id, role) values (eid, auth.uid(), 'owner');
  return eid;
end $$;
revoke all on function public.create_event_with_owner(jsonb) from public;
grant execute on function public.create_event_with_owner(jsonb) to authenticated;

create or replace function public.regenerate_token(p_guest uuid) returns text language plpgsql security definer set search_path = public as $$
declare t text; e uuid;
begin
  select event_id into e from public.guests where id = p_guest;
  if e is null or not public.is_member(e) then raise exception 'not allowed'; end if;
  t := public.new_token(10);
  update public.guests set token = t where id = p_guest;
  return t;
end $$;
revoke all on function public.regenerate_token(uuid) from public;
grant execute on function public.regenerate_token(uuid) to authenticated;

-- ---------- storage buckets ----------
insert into storage.buckets (id, name, public) values ('invites','invites', false), ('photos','photos', false), ('share','share', true)
on conflict (id) do nothing;
