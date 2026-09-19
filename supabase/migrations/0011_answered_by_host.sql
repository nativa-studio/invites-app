-- Whether the host set this guest's answer themselves.
--
-- A host needs to be able to answer for a guest: people say yes in the playground, or by text, or
-- at the school gate, and the host is the only one who will ever put that in. Without this column
-- the guest list would say "replied 19 Sep at 11:37 am" about a reply the guest never made, which
-- is a record that lies, and the trail is the one part of this a host has to be able to trust.
--
-- False by default, so every reply already in the table stays a reply the guest made.

alter table public.guests
  add column if not exists answered_by_host boolean not null default false;
