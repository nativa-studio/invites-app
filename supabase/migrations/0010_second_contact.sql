-- A second person to text about the same guest.
--
-- A guest is often a household, not a person: the invite is for Oliver, and the number belongs to
-- his mum. Sometimes it belongs to his mum and his dad, and a host who has both wants both, so
-- the one who answers is the one who answers. Two columns rather than an array, because each
-- number needs the name beside it to be any use: "0403..." on its own does not tell a host who
-- they are about to text.
--
-- Guest facing nothing changes. These are host side only, like contact_name and phone already
-- are, and no guest RPC returns them.

alter table public.guests
  add column if not exists contact_name_2 text,
  add column if not exists phone_2 text;
