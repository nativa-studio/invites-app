# Setting up the pilot (Gabriel's 4th)

Three things need doing outside this repo. Each takes a few minutes.

## 1. Load the database

Open the Supabase dashboard for the `invites-dev` project (Sydney), go to **SQL Editor**, and run these two files in order, each pasted whole:

1. `supabase/migrations/0001_init.sql` (tables, security policies, guest functions, storage buckets)
2. `supabase/migrations/0002_expected_party.sql` (how many the host expects per guest)
3. `supabase/seed.sql` (Gabriel's party, the guest-visible order of the afternoon, one preview guest)

Run any new file in `supabase/migrations/` the same way, in number order. Each one is safe to run once.

The seed can be run again later: it replaces the event with slug `gabriel-4`.

The event belongs to whoever signs in with `marcia@nativa.studio`. That link is made automatically the first time that Google account signs in.

## 2. Google sign-in

In Supabase: **Authentication, Providers, Google**, switch it on and paste a Google OAuth client id and secret (Google Cloud Console, APIs and Services, Credentials, OAuth client, type Web). Add the redirect URL Supabase shows you to that Google client. Then in **Authentication, URL Configuration**, set the Site URL to the deployed address and add `https://<your-domain>/auth/callback` to the redirect list (plus `http://localhost:3000/auth/callback` for local work).

## 3. Deploy

Import the repo into Vercel. Environment variables:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | the project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the publishable key (`sb_publishable_...`) |
| `NEXT_PUBLIC_SITE_URL` | the deployed URL, no trailing slash |

Never add the secret key to Vercel. The app does not read it.

## Then

1. Open the site, **Continue with Google**, and Gabriel's party is on your event list.
2. Open the dashboard, add guests (name, who you text, mobile), and use **Text** or **Send next**.
3. The preview link `/i/previewgab4?open=1` shows the invite without the envelope opening.
4. Two details are still blank in the seed because I did not have them: the **address** and your **mobile** for the "Questions? Text" line. Set them in the SQL editor for now:

```sql
update public.events set address = '12 Example Street, Suburb', host_phone = '04xx xxx xxx' where slug = 'gabriel-4';
```

## Local development

A local Postgres stands in for Supabase on the guest side (no sign-in locally yet):

```
npm run db:local
LOCAL_PG_URL=postgres://postgres:postgres@localhost/bunting_test NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=x npm run dev
```

Then open `http://localhost:3000/i/previewgab4`.

## Applying migrations

Migrations are SQL files in `supabase/migrations/`, numbered and applied in order. Two ways to
run them.

**From the Supabase dashboard.** SQL Editor, paste the file, run. Always available, needs nothing
set up.

**From a Claude Code session or your own machine**, with `scripts/supabase-sql.py`:

```
python3 scripts/supabase-sql.py check                                   # what is applied
python3 scripts/supabase-sql.py apply supabase/migrations/0005_group_links.sql
python3 scripts/supabase-sql.py query "select count(*) from public.guests"
```

It needs a Supabase personal access token from
https://supabase.com/dashboard/account/tokens, as `SUPABASE_ACCESS_TOKEN`. Put it in `.env.local`
for your own machine. For Claude Code on the web, set it as an environment variable on the
environment instead, so it is not pasted into a conversation and survives a new session.

This is not the secret key and not the database password. It is revocable in one click and the
running app never reads it. The secret key still belongs only in `.env.local` on your own machine.

`apply` wraps each migration in a transaction, so one that fails partway leaves nothing behind,
and it refuses any file outside `supabase/migrations/`.

### Letting a Claude Code session run it

A session is stopped from running this script unless the repository carries a permission rule, and
a session cannot add that rule itself: committing a change to its own permissions is refused, by
design. So this is a person's job, once.

It has to be on `main`, because a new session clones `main`. On a feature branch it has no effect.

Through the GitHub web interface: Add file, Create new file, name it `.claude/settings.json`,
paste the block below, then commit **directly to `main`** rather than to a new branch.

```json
{
  "permissions": {
    "allow": [
      "Bash(python3 scripts/supabase-sql.py:*)",
      "Bash(python3 scripts/supabase-sql.py *)",
      "Bash(./scripts/supabase-sql.py:*)",
      "Bash(./scripts/supabase-sql.py *)"
    ]
  }
}
```

The rule names this one script, not `curl` in general, so it does not become permission to call
anything on the internet.

That is half of it. The other half is the token: set `SUPABASE_ACCESS_TOKEN` as an environment
variable on the Claude Code environment, not in `.env.local`, which is git ignored and so never
reaches a new session. With the rule but no token the script has no credentials; with the token but
no rule the session is stopped before it runs. Both, once, and it stops coming up.
