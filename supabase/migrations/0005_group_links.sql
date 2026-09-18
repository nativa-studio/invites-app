-- A link per group, so a host knows where a person is from.
--
-- One group link for everyone means every reply arrives unlabelled, and the host has to ask or
-- guess whether a name came from school or from the street. A host can now paste a different
-- link into each chat, and whoever answers through it lands in the guest list already marked.
-- The group travels in the link rather than in a question, so the guest is never asked something
-- the host already knows.
--
-- The three-argument version is replaced rather than left beside this one: two overloads that
-- differ only by a defaulted argument make every call ambiguous.

drop function if exists public.claim_group_link(text, text, text);

create or replace function public.claim_group_link(p_slug text, p_name text, p_phone text default null, p_group text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.events; g public.guests; key text; grp text;
begin
  select * into e from public.events where slug = p_slug and group_link_enabled;
  if not found then raise exception 'link closed'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'name required'; end if;
  grp := nullif(left(trim(coalesce(p_group, '')), 40), '');
  key := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 9);
  if key <> '' then
    select * into g from public.guests where event_id = e.id and right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9) = key limit 1;
  end if;
  if g.id is null then
    select * into g from public.guests where event_id = e.id and lower(trim(name)) = lower(trim(p_name)) limit 1;
  end if;
  if g.id is null then
    insert into public.guests (event_id, name, phone, groups, source)
    values (e.id, trim(p_name), nullif(trim(p_phone), ''), case when grp is null then '{}'::text[] else array[grp] end, 'group_link')
    returning * into g;
    insert into public.activity (event_id, actor_guest_id, kind, detail)
    values (e.id, g.id, 'joined', case when grp is null then 'via the group link' else 'via the ' || grp || ' link' end);
  elsif grp is not null and not (grp = any(g.groups)) then
    -- Someone the host already had, arriving through a group link. Where they are from is new
    -- information, so it is added. Nothing they already carry is taken off them.
    update public.guests set groups = groups || grp where id = g.id returning * into g;
  end if;
  return jsonb_build_object('token', g.token);
end $$;

revoke all on function public.claim_group_link(text, text, text, text) from public;
grant execute on function public.claim_group_link(text, text, text, text) to anon, authenticated;
