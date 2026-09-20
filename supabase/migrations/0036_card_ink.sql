-- The link preview needs the event's ink, because the illustrated strip's envelope is mixed from
-- it rather than picked from a list of papers. Without this a strip event got its own ink on the
-- page and a stranger's envelope in the chat, which is two envelopes again: the exact fault
-- migration 0012 was written to fix, one design later.
--
-- The rest of the function is copied unchanged rather than retyped. This is the only line added.
create or replace function public.get_invite_card(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  return jsonb_build_object(
    'addressee', g.name,
    'title', e.title,
    'share_title', e.share_title,
    'share_description', e.share_description,
    'intro', e.intro,
    'date', e.date,
    'start_time', e.start_time,
    'end_time', e.end_time,
    'time_note', e.time_note,
    'theme_id', e.theme_id,
    'palette', e.palette,
    'layout_id', e.layout_id,
    'ink', e.ink,
    'invite_image_path', e.invite_image_path
  );
end $$;
revoke all on function public.get_invite_card(text) from public;
grant execute on function public.get_invite_card(text) to anon, authenticated;
