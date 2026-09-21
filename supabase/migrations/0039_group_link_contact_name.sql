-- The adult's name, as its own answer.
--
-- The group link asked for "adult name and contact number" in the phone box, so whoever replied
-- typed both into one field and the host got "Sarah 0412 345 678" where a number should be. The
-- column for this already exists: guests.contact_name is what the message templates fall back to
-- when the guest themselves is a child.
--
-- Dropped and recreated rather than overloaded, the same reasoning as migration 0005: two
-- versions differing only by a defaulted argument make every call ambiguous. The new argument is
-- last and defaulted, so a browser still running the old page calls this with four named
-- arguments and it resolves, which means no deploy window where replies fail.
drop function if exists public.claim_group_link(text, text, text, text);

create or replace function public.claim_group_link(
  p_slug text, p_name text, p_phone text default null, p_group text default null, p_contact_name text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.events; g public.guests; key text; grp text; who text;
begin
  select * into e from public.events where slug = p_slug and group_link_enabled;
  if not found then raise exception 'link closed'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'name required'; end if;
  grp := nullif(left(trim(coalesce(p_group, '')), 40), '');
  who := nullif(left(trim(coalesce(p_contact_name, '')), 80), '');
  key := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 9);
  if key <> '' then
    select * into g from public.guests where event_id = e.id and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = key limit 1;
  end if;
  if g.id is null then
    select * into g from public.guests where event_id = e.id and lower(trim(name)) = lower(trim(p_name)) limit 1;
  end if;
  if g.id is null then
    insert into public.guests (event_id, name, contact_name, phone, groups, source)
    values (e.id, trim(p_name), who, nullif(trim(p_phone), ''), case when grp is null then '{}'::text[] else array[grp] end, 'group_link')
    returning * into g;
    insert into public.activity (event_id, actor_guest_id, kind, detail)
    values (e.id, g.id, 'joined', case when grp is null then 'via the group link' else 'via the ' || grp || ' link' end);
  else
    -- Somebody the host already had. Where they are from and who to ring are both new
    -- information, so both are filled in, and nothing they already carry is taken off them: a
    -- contact name the host typed themselves is not overwritten by a blank.
    update public.guests
       set groups = case when grp is not null and not (grp = any(groups)) then groups || grp else groups end,
           contact_name = coalesce(contact_name, who)
     where id = g.id
     returning * into g;
  end if;
  return jsonb_build_object('token', g.token);
end $$;

revoke all on function public.claim_group_link(text, text, text, text, text) from public;
grant execute on function public.claim_group_link(text, text, text, text, text) to anon, authenticated;
