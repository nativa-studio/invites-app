-- Whether the plate and the gift draw a block on the invite, or only a line in Good to know.
--
-- Both already put a line in Good to know and a block under the reply. The line is the
-- announcement, which everybody reads while deciding; the block is where a guest acts, and it is
-- a whole card. A host running a small potluck by text does not want a card for it, and one
-- mentioning a group gift somebody else is running does not want to give it a panel.
--
-- On by default, because that is what every event already does and a switch that silently
-- changes an existing invite is worse than one more switch.
alter table public.events add column if not exists plate_block boolean not null default true;
alter table public.events add column if not exists gift_block boolean not null default true;
