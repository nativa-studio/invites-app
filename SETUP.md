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

## Putting it on your own address

The site answers on `invites-app-xi.vercel.app`. Pointing your own name at it is four steps, all in a browser, and nothing in the code changes.

**Everything below is done from a phone. There is no terminal step.**

### 1. Get the name

Three endings are worth thinking about, and the rules behind them are not the same.

- **`.au` on its own, like `bunting.au`. This is the recommendation.** It is the shortest, it reads
  as Australian, and it is the only Australian ending with no rule about what the name has to be.
  auDA asks one thing, an Australian presence, and an ABN satisfies it, as does being an Australian
  citizen or permanent resident. Nothing has to match a business name or a trade mark. Buy it from
  an Australian registrar (VentraIP, Crazy Domains, Netregistry), then do step 2.
- **`.com.au`, like `bunting.com.au`.** More familiar, and still the ending an Australian business
  is expected to have. The catch is eligibility. A `.com.au` must be a match or acronym of your
  registered name, or a match of your Australian trade mark, or, for now, a synonym of a good or
  service you provide. That last path is the one "Bunting is a thing Nativa Studio sells" would
  lean on, and auDA's board approved removing it in principle in August 2026. Eligibility is
  checked at renewal as well as at registration, so a name held on that basis may not survive its
  first renewal. If you want `.com.au`, register **Bunting** as a business name with ASIC under the
  Nativa Studio ABN first, about $44 for three years. The domain is then a match of your business
  name, and the rule change does not touch it.
- **`.com`, `.app` or `.party`**: buy it inside Vercel. Open the project, **Settings**, **Domains**,
  type the name you want, and if it is free Vercel offers to sell it to you. Vercel is then your
  registrar as well as your host, so it writes the DNS itself and step 2 does not happen at all.
  This is the least that can go wrong, and the trade is that nothing in the address says Australia.

Vercel does not sell `.au` or `.com.au`. Any domain can be pointed at the project whoever sold it
to you, which is what step 2 is for.

### 2. Point it at Vercel (only if you bought it elsewhere)

In Vercel: project, **Settings**, **Domains**, **Add**, type the domain. Vercel then shows you a card with the exact records to create. **Read the values off that card.** They are specific to this project, and any A record or `cname.vercel-dns.com` value you find written down elsewhere, including in an older note from me, is likely to be the wrong one now.

There will be two:

- the bare name (`bunting.au`) as an **A record**, pointing at the address on the card
- `www` as a **CNAME**, pointing at the value on the card

Add both in your registrar's DNS screen. Then leave it. It is usually live within the hour, though the official answer is up to 48.

Add both `bunting.au` and `www.bunting.au` to the Vercel project, and set the `www` one to redirect to the bare one, so people who type either land in the same place.

You do not have to do anything about the certificate. Vercel gets one free from Let's Encrypt as soon as the records resolve, renews it by itself, and sends every `http` visitor to `https`.

### 3. Tell the app its own name

Still in Vercel: **Settings**, **Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to `https://bunting.au`, with no slash on the end, then redeploy.

Skipping this does not break the site, but every invite link the app writes into a text message would keep saying `invites-app-xi.vercel.app`, because that is the address the request came in on. The whole point is the link a guest reads.

### 4. Tell Supabase

In the Supabase dashboard: **Authentication**, **URL Configuration**. Set **Site URL** to `https://bunting.au` and add `https://bunting.au/auth/callback` to the redirect list. Leave the old entries there until you are sure, they cost nothing.

Google needs nothing. Google sends people back to Supabase, not to us, and that address is not changing.

### Worth knowing before you pick a name

Guests read it out of a text message, so it is doing the work a business card does. Short,
spellable down the phone, and it wants to sit comfortably in `bunting.au/i/k3m9xq7wp2` rather than
fight it.

Length is not only taste. A text message holds 160 characters before the phone splits it in two.
The default invite wording, with a short name and a short title, measures 153 characters on
`invites-app-xi.vercel.app` and 138 on `bunting.au`. The address we are on today is seven
characters away from turning every invite into two messages. A short one buys back about fifteen.

The links already sent out keep working. Vercel keeps answering on the old address, so nothing
breaks the moment you switch, and that holds for every address the project has ever had as long as
you leave it attached. It is still the reason to pick once rather than move twice: those links sit
in guests' messages for months.
