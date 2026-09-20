-- Columns on public.events that guests never receive.
--
-- event_public_json lists every field by hand, which is deliberate: it is an allowlist, so a
-- column is private until somebody decides otherwise. The cost is that adding a column and
-- forgetting this function makes a setting that saves, reports that it saved, and changes
-- nothing on the invite. That has happened four times.
--
-- So this names the gap instead of waiting for somebody to notice. Run it after any migration
-- that adds a column to events:
--
--   python3 scripts/supabase-sql.py query "$(cat supabase/checks/public-json-coverage.sql)"
--
-- Anything it lists is either deliberately private, in which case add it to the expected list
-- below, or a column somebody forgot, in which case the invite is quietly ignoring it.
-- One event first, then its keys. Written the other way round, the limit lands on the keys
-- rather than on the row and the whole check compares against a single field, which is how its
-- first run reported that almost every column on the table was missing.
with one as (
  select public.event_public_json(e) as j from public.events e limit 1
), sent as (
  select jsonb_object_keys(j) as key from one
), private_on_purpose(key) as (values
  -- The host's own drafts and workings. No guest has any business with these.
  ('access_info'), ('text_template'), ('reminder_template'), ('see_you_soon_template'),
  ('thanks_template'), ('created_by'), ('share_image_path'), ('invite_file_path'),
  ('plate_host_note'), ('gift_prefs_ok'), ('gift_prefs_avoid'), ('created_at'), ('updated_at'),
  -- The address an event is waiting to be claimed by, which makes somebody an owner the moment
  -- they sign in with it. A guest reading that would be reading how to take the event over.
  ('claim_email')
)
select c.column_name as not_reaching_guests
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'events'
  and c.column_name not in (select key from sent)
  and c.column_name not in (select key from private_on_purpose)
order by c.column_name;
