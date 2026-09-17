-- What a chat app needs to draw the link preview, and nothing more.
-- Deliberately separate from get_invite, which records that the guest opened their invite.
-- WhatsApp and iMessage fetch the preview themselves, so reusing get_invite here would mark
-- every guest as having opened the moment the host sent the message.
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
    'invite_image_path', e.invite_image_path
  );
end $$;
revoke all on function public.get_invite_card(text) from public;
grant execute on function public.get_invite_card(text) to anon, authenticated;
