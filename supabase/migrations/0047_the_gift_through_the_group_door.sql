-- The group gift, read through the group link.
--
-- A guest holding their own link gets the present and how to chip in. A guest who came by the
-- group link got a line saying how to chip in comes with your reply, because that page has no
-- token and there was no function that takes a slug. So the same invite said two different things
-- depending on which door somebody came through, which is the fault CLAUDE.md opens with, and
-- wish_state_slug is already here for exactly this reason.
--
-- p_guest is null, the same as the host's preview: nobody in particular, so nothing is chipped in
-- by them and nothing is theirs. What comes back is the present, the organiser's name, the
-- message, the amount, the date and where to send the money. What does not is anything about a
-- guest, because on this page there is not one.
--
-- Behind group_link_enabled, unlike wish_state_slug. A crossed out idea is a crossed out idea;
-- bank details are not, and a host who has closed their group link has closed it.
create or replace function public.gift_slug(p_slug text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e public.events;
begin
  select * into e from public.events where slug = p_slug;
  if not found or not e.group_link_enabled then return null; end if;
  return public.gift_json(e, null);
end $$;

revoke all on function public.gift_slug(text) from public;
grant execute on function public.gift_slug(text) to anon, authenticated;
