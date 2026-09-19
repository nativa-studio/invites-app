#!/usr/bin/env python3
"""Run SQL against the Supabase project, through the management API.

Why a script rather than a curl line: the token never appears in a command, the project is named
in one place, a migration runs inside a transaction so a half applied one is not possible, and
every use reads as one obvious command rather than a wall of headers.

Credentials, in order of preference:
  SUPABASE_ACCESS_TOKEN in the environment, or a line in .env.local, which is git ignored.
  SUPABASE_PROJECT_REF likewise, falling back to the one project this app uses.

  scripts/supabase-sql.py check
  scripts/supabase-sql.py apply supabase/migrations/0005_group_links.sql
  scripts/supabase-sql.py query "select count(*) from public.guests"
"""
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_REF = "kihsdobmmvnfvokbmmgj"

# What is applied and what is not, without changing anything. Written as one query so a single
# read answers the question rather than three round trips.
CHECK = r"""
select '0003 get_invite_card' as migration,
       coalesce(string_agg(p.proname, ', '), 'NOT APPLIED') as state
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'get_invite_card'
union all
select '0004 section columns',
       coalesce(string_agg(column_name, ', ' order by column_name), 'NOT APPLIED')
  from information_schema.columns
 where table_schema = 'public' and table_name = 'events' and column_name like 'show\_%'
union all
select '0005 claim_group_link',
       coalesce(string_agg(pg_get_function_identity_arguments(p.oid), ' | '), 'NOT APPLIED')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'claim_group_link'
union all
-- 0006 to 0009 each add one column and re-create event_public_json to carry it. The column alone
-- is not enough: without the function the host side saves happily and the guest page never sees
-- it. So both halves are checked, and a row reads OK only when both are there.
select m.name,
       case
         when not exists (select 1 from information_schema.columns c
                           where c.table_schema = 'public' and c.table_name = 'events'
                             and c.column_name = m.col) then 'NOT APPLIED, no column ' || m.col
         when not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                           where n.nspname = 'public' and p.proname = 'event_public_json'
                             and p.prosrc like '%' || m.col || '%')
           then 'HALF APPLIED, column is there but event_public_json does not send it'
         else 'ok, column and event_public_json'
       end
  from (values
    ('0006 section_order', 'section_order'),
    ('0007 ask_note', 'ask_note'),
    ('0008 signoff', 'signoff_note'),
    ('0009 know_order', 'know_order'),
    ('0013 ask_name', 'ask_name')
  ) as m(name, col)
"""


def secrets() -> tuple[str, str]:
    token = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
    ref = os.environ.get("SUPABASE_PROJECT_REF", "")
    # Only these two names are read out of .env.local, so an unrelated line in that file can
    # never end up somewhere it was not meant to go.
    env_local = ROOT / ".env.local"
    if env_local.exists():
        for line in env_local.read_text().splitlines():
            name, _, value = line.partition("=")
            value = value.strip().strip("\"'")
            if name.strip() == "SUPABASE_ACCESS_TOKEN" and not token:
                token = value
            if name.strip() == "SUPABASE_PROJECT_REF" and not ref:
                ref = value
    if not token:
        sys.exit(
            "No SUPABASE_ACCESS_TOKEN. Put it in .env.local or the session's environment "
            "variables.\nMake one at https://supabase.com/dashboard/account/tokens (starts with sbp_)."
        )
    return token, ref or DEFAULT_REF


def run(sql: str) -> None:
    token, ref = secrets()
    request = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        body = urllib.request.urlopen(request, timeout=120).read().decode()
    except urllib.error.HTTPError as err:
        sys.exit(f"FAILED {err.code}: {err.read().decode()[:2000]}")
    try:
        print(json.dumps(json.loads(body), indent=2)[:8000])
    except json.JSONDecodeError:
        print(body[:2000])


def main(argv: list[str]) -> None:
    what = argv[1] if len(argv) > 1 else ""
    if what == "check":
        run(CHECK)
    elif what == "apply":
        if len(argv) < 3:
            sys.exit("apply needs a migration file")
        given = Path(argv[2])
        path = (ROOT / given).resolve()
        migrations = (ROOT / "supabase" / "migrations").resolve()
        if path.parent != migrations or path.suffix != ".sql":
            sys.exit("apply only runs .sql files in supabase/migrations. Use query for anything else.")
        if not path.exists():
            sys.exit(f"No such file: {given}")
        print(f"== {given}")
        # Wrapped, so a migration that fails partway leaves nothing behind. 0005 drops a function
        # and recreates it, and without this there is a moment where the group link is broken.
        run(f"begin;\n{path.read_text()}\ncommit;")
    elif what == "query":
        if len(argv) < 3:
            sys.exit("query needs some sql")
        run(argv[2])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
