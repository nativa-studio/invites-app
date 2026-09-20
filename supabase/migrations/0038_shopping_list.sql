-- The shopping list: what still has to be bought, and who is buying it.
--
-- Host side only, and deliberately so. Bring a plate is the guest-facing food list and this is
-- not that: it is the trolley, and a guest has no business reading that the cake is still not
-- bought. Nothing here goes through a guest function and no guest page can reach it.
--
-- It is the other half of "sharing the load with whoever else is organising": a co-host at the
-- shops opens the same list, ticks off the ice, and the host at home stops buying it too.
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  -- Free text, not a number. What a host writes is "2 kg", "a dozen", "enough for 30", and a
  -- number with a units dropdown beside it is three taps to say something they can type in one.
  quantity text,
  note text,
  got boolean not null default false,
  got_at timestamptz,
  got_by uuid references public.profiles(id) on delete set null,
  added_by uuid references public.profiles(id) on delete set null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists shopping_items_event_idx on public.shopping_items(event_id);

-- The same members test every other host table has, applied the same way.
alter table public.shopping_items enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'shopping_items' and policyname = 'members all') then
    create policy "members all" on public.shopping_items
      for all using (public.is_member(event_id)) with check (public.is_member(event_id));
  end if;
end $$;
