# Bunting (invites-app)

Read `docs/build-brief.md` before doing anything. It is the engineering brief for phase 1: stack, data model, security model, routes, milestones and conventions. Behaviour comes from `docs/journeys.html`; look and wording intent from `docs/design-brief.html`.

@docs/build-brief.md

## Working rules

- This is NOT the Next.js you know. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code (params and cookies are async, `proxy.ts` replaces middleware, fetch is uncached by default).
- Australian English everywhere. Dates day-month, mobiles 04xx, times Australia/Brisbane.
- Never use an em dash in anything Marcia will read or send: UI copy, README, commit messages, approval artifacts, handover notes, anything drafted for her to publish. She reads them as AI-written. Use a comma, full stop, colon or brackets.
- This product is Nativa Studio's own, not client work. It never lives in a client's repository, and no client repository is needed to build it.
- Copy strings live in `lib/copy.ts`, never inline in components.
- Guest pages never touch tables directly; they call the security-definer RPCs with a token or slug.
- The Supabase secret key is for migrations and seeds only. App code reads only the publishable key.
- Before pushing: `npm run typecheck`, `npm run lint`, `npm run test:e2e` all green.
- Every milestone ends with 390 px screenshots for Marcia.

## Self-check before publishing any screen or page

Place information by the moment it is needed, not by what it is related to. Before putting anything on a screen, ask when the reader needs it. Deciding whether to come: date, time, place, who is hosting. Replying: the questions and nothing else. Coming: what to bring, parking, facilities, gifts. On the day: access details, timeline. After: thanks and photos. A detail never rides in a block above its moment just because it shares a topic with that block. Run this check over every screen before publishing, and say in the handover where anything borderline was placed and why.

## The invite is drawn three times, and two of them must agree exactly

Every setting that decides what a guest sees is honoured in these places. Adding one and testing
the one you were thinking about is how a switch comes to save, say it saved, and change nothing.

1. **The guest's own page**, through the security-definer functions in `supabase/migrations/`.
   `get_plate` and `get_gift` are the gates, and they are authoritative: off here means the data
   is never sent, rather than sent and not drawn.
2. **The host's preview, as a guest** (`?as=guest`), through `lib/db/preview-extras.ts`. Since
   migration 0027 this is not a second implementation: `preview_plate` and `preview_gift` take an
   event id, check the caller is a member, and call the same builders the guest functions call.
   Keep it that way. It was a hand-written copy of the same rules in TypeScript, and both of the
   data faults of 20 September lived in the gap between the two.
3. **The host's preview, editing** (`?pick=1`), in `app/app/preview/[id]/page.tsx`. This one is
   deliberately *not* the same: a part switched off still draws here, faded, because the switch
   that turns it back on lives in the drawer behind that card and nothing else opens that drawer.
   Hiding it would leave a host looking at a setting they can no longer reach.

The bug that wrote this rule: `plate_block` and `gift_block` were added, gated in 1, and missed in
2 and 3. Marcia switched both blocks off, the database was correct and her guests were already
getting nothing, and the preview she was checking in kept drawing them.

So: after adding any switch that hides part of the invite, load a real invite and both preview
modes before saying it works. `npm run typecheck` and `npm run lint` cannot see any of this.

Two things are still drawn from more than one file and will drift if nobody watches them: the
plate card and the gift card each exist three times, as the live one a guest acts on
(`PlateCard`, `GiftCard`), the announcement before the reply (`Announce.tsx`) and the one the
editor draws (`PreviewExtras.tsx`). Restyling one means changing three. Left that way on purpose:
the duplication is cosmetic, and the copy that mattered is gone.

## No guessing

Every expensive hour on this project has been spent on a guess that read like an answer. Six
rounds of screenshots to find one mis-scoped environment variable, two wrong theories about the
Vercel deploy, an instruction to run git commands at a terminal Marcia does not have, and a
settings file sent to a branch no future session would ever read. None of it was hard. All of it
was answered in one lookup, once the lookup happened.

So:

- **Look it up before answering.** If the question is about a tool, a product, an API or a UI, read
  the docs, the source or the live response first. One fetch beats three plausible answers. This
  applies hardest when the answer feels obvious.
- **Say "I do not know, let me check."** That sentence costs one line. A confident wrong answer
  costs Marcia a round trip, and she is usually on a phone with one bar.
- **Never guess twice about the same thing.** A second guess means stop and go and measure.
- **Measure, do not eyeball.** Bounding boxes, field manifests, HTTP status, the actual row in the
  database. "It looks right" is not a result.
- **Verify the capability before asking for access.** Check the call works before sending her to
  fetch a token. A credential in a transcript that turns out to be unusable is a real cost.
- **Ask which thing she is looking at.** Which URL, which branch, which environment, which app.
  Taking "it has not changed" at face value once cost more than any other mistake here.

## What Marcia actually has in front of her

Get this wrong and the instructions are useless however correct they are.

- **She works from a phone, and has no terminal.** Never hand her shell commands as the only path.
  Give her the web UI route: GitHub in a browser, the Supabase dashboard, claude.ai/code.
- **The GitHub mobile app cannot create files.** It edits files that already exist and merges pull
  requests, nothing else. File creation needs github.com in a browser.
- **Anything a future session must read has to be on `main`.** A new session clones `main`. A
  settings file on a feature branch does nothing at all.
- **Write findings into the repo, not into the conversation.** A recipe that lives in a chat is
  gone by the next session. `SETUP.md` is where operational knowledge goes.
- **Lead with the fastest route, every time.** She is on a phone, often one handed, often with one
  bar. A direct URL she can paste into the address bar beats a tap-through path, and a tap-through
  path beats a description of where the thing lives. Give the fast way first and the fallback
  underneath it, not the other way round. Where a dashboard has stable URLs, work them out and
  hand them over: Supabase is
  `supabase.com/dashboard/project/kihsdobmmvnfvokbmmgj/<section>`, and Vercel is the project's own
  address with `/settings/environment-variables` on the end. Never send her hunting through a
  menu for something that has an address.

## Nothing is fixed until `main` moves, and a session cannot move it

This cost four rounds on 20 September. The About this app block was fixed, tested and pushed, and
Marcia kept photographing it in the wrong place, because a push to a branch changes nothing she
can see. She was looking at the live site, which is `main`, and `main` had not moved.

- **Pushing a branch is not publishing.** The live site builds `main`. Until `main` changes,
  everything done in a session is invisible to her, however green the tests were.
- **A session cannot push to `main`.** It is blocked here as a production deploy. The route is:
  work on the branch, push it, open a pull request, and it is merged. Merging through the GitHub
  API is blocked too until Marcia says to go ahead, so ask once, plainly: "reply merge it and I
  will". Do not keep repeating the link at her instead of offering.
- **Never say a change is live because it was pushed.** Check it: `git fetch origin main` and
  confirm the commit is an ancestor of `origin/main`, then read the deployed page itself, see
  "Checking a deploy from a session" in `SETUP.md`. Reading the HTML found this fault in one
  fetch, after two rounds of guessing at it.
- **Vercel takes a minute or two** after the merge, and then she has to reload. Tell her to pull
  down to refresh, never to press Back: Back restores the page her phone already had, which is
  the old one, and that looks exactly like the fix not working.
- **She only ever has to tap Merge.** Never hand her git commands, and never leave the work
  finished-but-unmerged without saying so in the same breath as saying it is done.

## Facts about this setup, so they are not rediscovered

- There is **one Supabase project, `invites-dev`** (ref `kihsdobmmvnfvokbmmgj`, Sydney). There is no
  `invites-prod`. The live site runs on the dev database, so a test against it is a test against
  real guest data.
- **Migrations**: `scripts/supabase-sql.py check | apply | query`, see `SETUP.md`. It needs a
  Supabase personal access token, not the secret key, in `SUPABASE_ACCESS_TOKEN`, and a permission
  rule in `.claude/settings.json` on `main`. Without the rule the session is stopped before it runs.
- **Environment variables** live behind the cloud icon above the message box at claude.ai/code:
  hover the environment, click the gear, fill the Environment variables box. There is no settings
  page and no direct URL. Values are copied once at session start, so a change lands next session.
- **The live site is `https://invites-app-xi.vercel.app`.** Not `invites-app.vercel.app`, which is
  somebody else's project and answers with a PHP error page. Vercel deploys `main` on push.
- **A browser cannot reach `*.vercel.app` from a session** (certificate not trusted through the
  proxy). Read the live site with `curl`, and do browser testing against a local production build.
- **Link shape is not frozen yet.** As of 19 September 2026 three of 27 guests have a `sent_at`
  stamp, and Marcia can resend to all of them. So a change that invalidates existing links, a shorter token, a different path, a
  regenerated set, is allowed and does not need designing around. **This stops being true the
  moment a real guest list goes out.** Check the `sent_at` column before relying on it: more than
  a handful of rows with a timestamp means the links are out in the world and are now permanent.
- **The dev server does not hydrate client components here.** Test interaction against
  `npm run build` plus `npx next start`, never `npm run dev`.
