-- Feedback about Bunting itself, from the people meeting it on somebody's invite.
--
-- Its own table rather than a column on guests, because one person can have more than one thought
-- and the second one must not write over the first. A guest deleted with their event takes their
-- message with them (cascade), which is the same privacy promise the rest of the app makes.
create table if not exists public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete cascade,
  body text not null,
  at timestamptz not null default now()
);
create index if not exists app_feedback_at on public.app_feedback (at desc);

-- Locked. No policies at all, for anyone.
--
-- This is product feedback for Nativa Studio, not event data for the host. A host reading what
-- their guests said about the software would be reading over a shoulder, and the person writing
-- it is not expecting their host to see it. It is written through the function below and read
-- only with the secret key, from a migration or a script.
alter table public.app_feedback enable row level security;

-- Written with a token, like everything else a guest page touches. Returns nothing: this is a
-- place to say something, never a place to read anything back.
create or replace function public.leave_app_feedback(p_token text, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare g public.guests; msg text;
begin
  msg := nullif(btrim(p_body), '');
  if msg is null then return; end if;
  -- A phone keyboard and a long thought, but not an essay and not a paste of somebody's whole
  -- clipboard. Trimmed rather than refused, so nobody loses what they wrote to a limit they were
  -- never shown.
  msg := left(msg, 2000);
  select * into g from public.guests where token = p_token;
  if not found then return; end if;
  insert into public.app_feedback (event_id, guest_id, body) values (g.event_id, g.id, msg);
end $$;

revoke all on function public.leave_app_feedback(text, text) from public;
grant execute on function public.leave_app_feedback(text, text) to anon, authenticated;
