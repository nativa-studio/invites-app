# invites-app

Read `docs/build-brief.md` before doing anything. It is the engineering brief for phase 1: stack, data model, security model, routes, milestones and conventions. Behaviour comes from `docs/journeys.html`; look and wording intent from `docs/design-brief.html`.

@docs/build-brief.md

## Working rules

- This is NOT the Next.js you know. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code (params and cookies are async, `proxy.ts` replaces middleware, fetch is uncached by default).
- Australian English everywhere. Never use an em dash in any text a person will read: UI copy, README, commit messages. Use a comma, full stop, colon or brackets.
- Copy strings live in `lib/copy.ts`, never inline in components.
- Guest pages never touch tables directly; they call the security-definer RPCs with a token or slug.
- The Supabase secret key is for migrations and seeds only. App code reads only the publishable key.
- Before pushing: `npm run typecheck`, `npm run lint`, `npm run test:e2e` all green.
- Every milestone ends with 390 px screenshots for Marcia.
