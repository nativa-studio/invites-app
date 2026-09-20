-- Reading an invite stops being the same thing as recording that it was read.
--
-- get_invite stamped opened_at on every call, and the page's generateMetadata calls it, which is
-- what a chat app runs when it fetches a link to draw its preview card. So the moment Marcia
-- tapped Share and picked WhatsApp, WhatsApp fetched the link, and the guest was marked as having
-- opened their invite seconds before it reached them.
--
-- 14 of the 16 guests on Gabriel's party who had both stamps were "opened" before they were sent,
-- 8 of them inside two minutes. It was not one bad row, it was the whole column.
--
-- So the function returns the invite and nothing else. Marking is a separate call the page makes
-- only when the request looks like a person rather than a preview fetcher, which is the same test
-- the calendar tap already uses.
create or replace function public.get_invite(p_token text) returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.guests; e public.events;
begin
  select * into g from public.guests where token = p_token;
  if not found then return null; end if;
  select * into e from public.events where id = g.event_id;
  return jsonb_build_object('event', public.event_public_json(e), 'guest', public.guest_public_json(g),
    'access_info', case when g.status = 'yes' then e.access_info else null end);
end $$;

-- First look only, the same shape it always had. A guest reading their invite four times has
-- opened it once, and the question is whether they ever did.
create or replace function public.mark_invite_opened(p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.guests set opened_at = now() where token = p_token and opened_at is null;
end $$;

revoke all on function public.mark_invite_opened(text) from public;
grant execute on function public.mark_invite_opened(text) to anon, authenticated;
