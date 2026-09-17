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
