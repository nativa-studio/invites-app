-- The link preview needs to know which design the event uses, because the envelope it draws is
-- cut from different paper per design: the suite's is red, the lineup's is beige. Without this
-- a lineup event got a beige page and a red envelope in the chat, which is two envelopes again.
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
    'invite_image_path', e.invite_image_path
  );
end $$;
revoke all on function public.get_invite_card(text) from public;
grant execute on function public.get_invite_card(text) to anon, authenticated;
