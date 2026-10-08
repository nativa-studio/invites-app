-- Co-hosts: a second pair of hands on an event.
--
-- The ownership table and its policies have been here since 0001, and nothing could ever write a
-- second row into it. event_members has an insert policy for the creator becoming owner and that
-- is all, so an event has had exactly one host since the day it was built. This is the half that
-- was missing: a way for an owner to hand somebody a link, and for that person to end up in the
-- table as a cohost.
--
-- A link rather than typing an email address. The host has the other person's phone, not
-- necessarily their Google address, and asking for the exact address somebody signs in with is
-- asking them to guess. A link is the shape the rest of this product already uses, and the person
-- who taps it is the one who signs in, so the address can only ever be right.

-- One code per event, like the group link's slug, and off until the owner turns it on.
--
-- Off by default on purpose: an event that nobody has asked to share should have no door at all,
-- not a door with a long key in it. Switching it off invalidates the link, which is what a host
-- wants the moment the party is run.
alter table public.events add column if not exists join_code text unique;
alter table public.events add column if not exists join_code_enabled boolean not null default false;

-- Who is already a host somewhere.
--
-- The build allowlist is "who may start using a half built product", and a person a host has
-- handed their party to has been vouched for by somebody already past the door. Without this a
-- co-host gets in once, through their invite, and is turned away at /app on every visit after,
-- which is a worse state than never being let in.
create or replace function public.is_any_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.event_members m where m.profile_id = auth.uid());
$$;

-- What a join link says before anybody joins, and the one thing the sign-in door needs to know.
--
-- Title and host only: enough for the page to say whose party this is, and nothing a stranger
-- holding a guessed code could use. Granted to anon as well as authenticated because the door
-- asks before there is a session to ask with.
create or replace function public.join_peek(p_code text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('title', e.title, 'host_line', e.host_line)
    from public.events e
   where e.join_code = p_code and e.join_code_enabled
   limit 1;
$$;

-- Taking up the invitation.
--
-- Security definer because there is no policy that could express this: the person is not a member
-- yet, so no member policy can let them in, and a policy loose enough to let them add themselves
-- would let them add themselves to any event whose id they could guess. The code is the proof,
-- and it is checked here.
--
-- Already a member comes back as success rather than an error. A host who taps their own link, or
-- a co-host who taps it twice, should land on the event and not on a page telling them off.
create or replace function public.join_event(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e public.events; me uuid := auth.uid(); existing text;
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'signed_out'); end if;
  select * into e from public.events where join_code = p_code and join_code_enabled;
  if not found then return jsonb_build_object('ok', false, 'reason', 'closed'); end if;

  select role into existing from public.event_members where event_id = e.id and profile_id = me;
  if existing is not null then
    return jsonb_build_object('ok', true, 'event_id', e.id, 'role', existing, 'joined', false);
  end if;

  insert into public.event_members (event_id, profile_id, role) values (e.id, me, 'cohost');
  -- The host's half of it. Two people running one party means every line in the feed has to be
  -- able to name which of them did it, and this is the first such line.
  insert into public.activity (event_id, actor_profile_id, kind, detail)
  values (e.id, me, 'joined_cohost', null);
  return jsonb_build_object('ok', true, 'event_id', e.id, 'role', 'cohost', 'joined', true);
end $$;

-- Turning the link on, off, or over. Owner only: handing somebody the keys is the owner's to do,
-- and it is the one thing on this screen a co-host does not get, alongside deleting the event and
-- removing people. Returns the code so the screen can draw the link without a second read.
create or replace function public.set_join_code(p_event uuid, p_on boolean, p_roll boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not public.is_owner(p_event) then return jsonb_build_object('ok', false, 'reason', 'not_owner'); end if;
  select join_code into code from public.events where id = p_event;
  if code is null or p_roll then
    -- 12 characters from the unambiguous alphabet. Longer than a guest token because a guest
    -- token opens one invitation and this one hands over the party.
    loop
      code := public.new_token(12);
      exit when not exists (select 1 from public.events where join_code = code);
    end loop;
  end if;
  update public.events set join_code = code, join_code_enabled = p_on where id = p_event;
  return jsonb_build_object('ok', true, 'code', code, 'on', p_on);
end $$;

revoke all on function public.join_peek(text) from public;
revoke all on function public.join_event(text) from public;
revoke all on function public.set_join_code(uuid, boolean, boolean) from public;
revoke all on function public.is_any_member() from public;
grant execute on function public.join_peek(text) to anon, authenticated;
grant execute on function public.join_event(text) to authenticated;
grant execute on function public.set_join_code(uuid, boolean, boolean) to authenticated;
grant execute on function public.is_any_member() to authenticated;

-- Who is running this event, with names.
--
-- A function rather than a policy on profiles. The screen needs a co-host's name and the address
-- they signed in with, so the owner can tell which Tommy they have handed the party to, and that
-- is the whole of what it needs: widening the profiles policy to "anybody who shares an event
-- with you" would hand over every column on the row, now and whatever is added to it later. This
-- hands over three, to members only, and nothing else can ever ride along.
create or replace function public.event_hosts(p_event uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'profile_id', m.profile_id,
           'name', p.name,
           'email', p.email,
           'role', m.role,
           'added_at', m.added_at,
           'me', m.profile_id = auth.uid()
         ) order by (m.role = 'owner') desc, m.added_at), '[]'::jsonb)
    from public.event_members m
    join public.profiles p on p.id = m.profile_id
   where m.event_id = p_event and public.is_member(p_event);
$$;

revoke all on function public.event_hosts(uuid) from public;
grant execute on function public.event_hosts(uuid) to authenticated;
