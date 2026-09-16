# Bunting (working name)

Event invites you text, RSVPs that sort themselves. Repository name stays invites-app until the name clears its checks.

A host creates an event, adds guests, and texts each guest a personal link from their own phone. The guest opens a page that greets them by name, taps yes or no, answers a couple of quick questions if asked, and is done. The host sees who is coming, how many, and what they need, and runs the rest of the event from the same place: reminders, updates, bring-a-plate, group gift, runsheet, thank-yous.

## Status

Phase 1 is being built from the spec in `docs/` on Supabase (Postgres, Google sign-in, file storage, Sydney region). The code currently in this repository is the single-event prototype (Airtable-backed, one host, password-protected dashboard) whose guest pages phase 1 grows out of; its data layer is being replaced.

## Documents

- `docs/journeys.html`: every user journey step by step, plus the default wording. The behavioural spec.
- `docs/design-brief.html`: the brief for the visual design and the wording pass.

Both are also published as pages on claude.ai for commenting.

## Running the prototype locally

```bash
cp .env.example .env.local   # fill in the Airtable token, base ID and a host password
npm install
npm run dev
```

See `PROTOTYPE.md` for the prototype's Airtable schema and setup notes.

## Status

Phase 1 foundation is in: schema and policies (`supabase/`), Google sign-in, event list, host dashboard with guest list and texting, and the guest invite with the envelope opening, RSVP questions, calendar and group link. The pilot event is Gabriel's 4th. See `SETUP.md` to load it.

The Airtable prototype this replaced is tagged `prototype-airtable`.
