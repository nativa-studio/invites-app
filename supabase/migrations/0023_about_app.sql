-- A guest putting their hand up about the app itself.
--
-- The invite carries a quiet About this app line at the foot, and somebody who opens it can say
-- they would like to know more or help test it before launch. Without somewhere to record that,
-- the button is decoration: a host would have no way of knowing anybody pressed it.
--
-- On the guest row rather than a table of its own. It is one timestamp about a person who already
-- has a row, it is deleted with the event like everything else about them, and a table would need
-- its own policies to say the same thing.
alter table public.guests add column if not exists app_curious_at timestamptz;

-- Pressed by somebody holding a link, so it takes the token and nothing else. Idempotent: the
-- first press is the one that counts, and pressing again does not move the date, because the
-- interesting thing is when somebody first said yes rather than how many times they tapped.
create or replace function public.app_curious(p_token text) returns boolean
language plpgsql security definer set search_path = public as $$
declare g public.guests;
begin
  select * into g from public.guests where token = p_token;
  if not found then return false; end if;
  update public.guests set app_curious_at = coalesce(app_curious_at, now()) where id = g.id;
  return true;
end $$;

-- Taking it back, because a thumbs up somebody cannot undo is not really a choice.
create or replace function public.app_not_curious(p_token text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.guests set app_curious_at = null where token = p_token;
  return true;
end $$;

-- Whether this guest has already pressed it, so the invite opens showing the truth rather than
-- offering a thumbs up to somebody who gave one last week.
create or replace function public.is_app_curious(p_token text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select app_curious_at is not null from public.guests where token = p_token), false);
$$;
