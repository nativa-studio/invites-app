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

### The domain: `bunting.cloud`, bought

Bought on 19 September 2026. The app is called Bunting and the site is `bunting.cloud`.

`bunting.com`, `bunting.com.au`, `bunting.au`, `bunting.app`, `bunting.net.au`, `bunting.io` and
`bunting.co` were all taken, which is why it is none of those. `bunting.day`, `bunting.party`,
`bunting.cards`, `bunting.events` and `bunting.rsvp` were all free at the time and were the
shortlist before `.cloud` was bought.

A personal link reads `https://bunting.cloud/i/7ym7kq5wwb`: 34 characters against the 46 of the
Vercel address, and the line a chat app prints under the preview card drops from 25 characters to
13.

Bought **inside Vercel**, so Vercel is the registrar as well as the host and writes the DNS
itself. Step 2 does not happen: there are no records to copy anywhere. An earlier version of this
note said Vercel does not sell `.cloud`. It does.

The name was re-opened once and settled. Around forty alternatives were checked, and the test that
decided it is whether a guest who hears the name once can type it correctly. Bunting passes: one
spelling, one meaning, unmistakably a party. The only real contender was **Hurrah**, free on `.au`,
`.com.au`, `.net.au`, `.day`, `.party` and `.cards`, and it fails that same test, because hurrah,
hurray, hoorah and hooray are four spellings of one noise. Also checked and rejected:
`confetti.au` (generic, and likely somebody's trade mark in event services), `backyard.au` (warm,
says nothing about invitations), `comeover.au` (two words jammed together), `littleday.au` (right
for a fourth birthday, wrong for the memorial this app also supports), `plate.au` (reads as a food
app), and `trestle`, `verandah`, `garland` and `shindig`, all of which have both `.au` and
`.com.au` already gone.

Availability is not clearance. Marcia checked the trade mark register and found Bunting clear.
Nothing in this file has been checked against IP Australia by anyone else, so treat the list above
as availability only.

### 1. Get the name (done)

Kept for the next event, or the next product. Two routes, and which one you are on depends on
whether Vercel sells the ending.

- **Try Vercel first.** Open the project, **Settings**, **Domains**, type `bunting.cloud`. If Vercel
  can sell it, it offers, and it is then your registrar as well as your host: it writes the DNS
  itself and step 2 does not happen at all. This is the least that can go wrong, and it is worth
  the thirty seconds of typing it in to find out. Vercel definitely sells `.com`, `.app` and
  `.party`; whether it carries `.day` is a question its own box answers faster than anyone can
  look it up.
- **If it does not offer**, buy `bunting.cloud` from any registrar that carries it and do step 2.
  `.day` is run by Google's registry, the same family as `.app` and `.dev`, so a big registrar
  (Cloudflare, Namecheap, Porkbun) is a safer bet than a small one.
- **A `.com.au` or `.au`**: Vercel does not sell these, and it cannot, because they are country
  domains that need an Australian business behind them. Buy it from an Australian registrar
  (VentraIP, Crazy Domains, Netregistry) using the Nativa Studio ABN, then do step 2.

### 2. Point it at Vercel (skipped for `bunting.cloud`, since Vercel sold it)

In Vercel: project, **Settings**, **Domains**, **Add**, type the domain. Vercel then shows you a card with the exact records to create. **Read the values off that card.** They are specific to this project, and any A record or `cname.vercel-dns.com` value you find written down elsewhere, including in an older note from me, is likely to be the wrong one now.

There will be two:

- the bare name (`bunting.cloud`) as an **A record**, pointing at the address on the card
- `www` as a **CNAME**, pointing at the value on the card

Add both in your registrar's DNS screen. Then leave it. It is usually live within the hour, though the official answer is up to 48.

Add both `bunting.cloud` and `www.bunting.cloud` to the Vercel project, and set the `www` one to redirect to the bare one, so people who type either land in the same place.

You do not have to do anything about the certificate. Vercel gets one free from Let's Encrypt as soon as the records resolve, renews it by itself, and sends every `http` visitor to `https`.

### 2b. Attach it to this project

Buying the domain puts it on the account, not on the project. Vercel then offers "Deploy
something", "Proxy an existing site", "Redirect this domain" and "Set up email". **Take none of
them**: the first makes a second project, and this one already exists.

Instead open the **invites-app** project, **Settings**, **Domains**, **Add**, and type
`bunting.cloud`. Because Vercel is the registrar it attaches with nothing to copy and no records
to add. Add `www.bunting.cloud` the same way and set it to redirect to the bare name, so whichever
one a guest types lands in the same place.

The certificate looks after itself. Vercel gets one free from Let's Encrypt as soon as the
nameservers finish propagating, renews it, and sends every `http` visitor to `https`.

### 3. Tell the app its own name

Still in Vercel: **Settings**, **Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to `https://bunting.cloud`, with no slash on the end, then redeploy.

Skipping this does not break the site, but every invite link the app writes into a text message would keep saying `invites-app-xi.vercel.app`, because that is the address the request came in on. The whole point is the link a guest reads.

### 4. Tell Supabase

In the Supabase dashboard: **Authentication**, **URL Configuration**. Set **Site URL** to `https://bunting.cloud` and add `https://bunting.cloud/auth/callback` to the redirect list. Leave the old entries there until you are sure, they cost nothing.

Google needs nothing. Google sends people back to Supabase, not to us, and that address is not changing.

### Worth knowing before you pick a name

Guests read it out of a text message, so it is doing the work a business card does. Short, spellable down the phone, and it wants to sit comfortably in `bunting.cloud/i/k3m9x2` rather than fight it.

The links already sent out keep working. Vercel keeps answering on the old address, so nothing breaks the moment you switch.
