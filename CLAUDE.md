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
