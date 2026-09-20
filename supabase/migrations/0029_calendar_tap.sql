-- Who tapped Add to calendar.
--
-- A guest who puts the party in their calendar has done the one thing that makes them turn up,
-- and until now it left no trace at all. This stamps the first tap and only the first, the same
-- shape as opened_at: the question is whether they did it, not how many times.
--
-- What it does not know, and the host screen says so rather than implying otherwise: this records
-- the calendar file being taken, not the event being saved. A phone that previews the file and is
-- tapped away from looks the same from here.
alter table public.guests add column if not exists calendar_at timestamptz;

-- Guest side, so it goes through a security definer function with the token, like everything else
-- a guest page touches. No id, no table access, and nothing readable comes back: a guest cannot
-- use this to find out anything, only to say that they did something.
create or replace function public.calendar_tapped(p_token text)
returns void language plpgsql security definer set search_path = public as $$
declare g public.guests;
begin
  select * into g from public.guests where token = p_token;
  if not found then return; end if;
  -- First tap only. A guest who adds it to two calendars is still one guest who did it.
  if g.calendar_at is not null then return; end if;
  update public.guests set calendar_at = now() where id = g.id;
  insert into public.activity (event_id, actor_guest_id, kind, detail)
  values (g.event_id, g.id, 'calendar', null);
end $$;

revoke all on function public.calendar_tapped(text) from public;
grant execute on function public.calendar_tapped(text) to anon, authenticated;
