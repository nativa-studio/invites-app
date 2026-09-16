# Build brief: phase 1

Working name: invites-app. Event invites you text, RSVPs that sort themselves.

This is the engineering brief. Two other documents sit beside it and are the source of truth for behaviour and intent:

- `docs/journeys.html`: every user journey step by step, plus the default wording. What the app does.
- `docs/design-brief.html`: the brief for visual design and the wording pass. What it should feel like.

When this brief and the journeys page disagree on behaviour, the journeys page wins. When either disagrees with Marcia in the conversation, Marcia wins.

## What we are building

A mobile-first web app. A host signs in with Google, creates an event, adds guests. Every guest gets a personal link. The host texts the links from their own phone, one tap per guest, so the message arrives from someone the guest knows. The guest opens a page that greets them by name, taps yes or no, answers a few optional questions, and is done. Hosts and co-hosts then run the event from the same place: reminders, updates, bring-a-plate, group gift, runsheet, a see-you-soon message, and thank-you photos afterwards.

## Decisions that are locked

| Topic | Decision |
| --- | --- |
| Stack | Next.js 16 App Router, React 19, TypeScript, plain CSS with design tokens. Deployed on Vercel. |
| Database, sign-in, files | Supabase: Postgres with row-level security, Supabase Auth with Google, Supabase Storage. Sydney region. |
| Host sign-in | Google only in the UI. Email magic link may be used for local testing. |
| Sending | From the host's own phone via `sms:` and WhatsApp links. The app never sends messages itself in phase 1. |
| Guest identity | A secret token per guest in their personal link. No guest accounts, no phone verification. |
| Invite looks | The guest page is an illustrated strip: cover, the details, the day (from the runsheet), good to know, RSVP, after. Three cover modes, all available on every event type: just text, our artwork (gallery set), upload (a plain photo or a finished invite as PDF, PNG, JPG; a photo gets the title typed over or under it, a finished invite is shown as is). Phase 1 gallery is six monoline illustration sets (SVG, one ink, five inks to pick from, fixed paper tint). Colour sets are phase 2. |
| Uploaded PDFs | Converted to an image server-side at upload time. First page only. Original kept for download. |
| Payments | None in phase 1. Group gift is PayID or bank details typed by the organiser. |
| Guest cap | None. Hosts invite the right number. |
| Language | Australian English. Never an em dash in any user-facing text. Dates day-month, mobiles 04xx. Default timezone Australia/Brisbane. |
| Theme | Light only in phase 1. |

## Data model

All tables in the `public` schema with row-level security enabled. `id` columns are UUIDs, timestamps are `timestamptz`.

- **profiles**: one per signed-in host. `id` equals `auth.users.id`. `name`, `email`, `phone`.
- **events**: `slug` (unique, for the group link), `type`, `title`, `host_line`, `intro`, `date`, `start_time`, `end_time`, `time_note`, `venue`, `address`, `access_info` (yes guests only), `serve_preset`, `serve_text`, `good_to_know`, `what_to_bring`, `gift_stance`, `gift_note`, `gift_prefs_ok[]`, `gift_prefs_avoid[]`, `group_gift_enabled`, `accessibility_venue`, `parents_mode`, `siblings_welcome`, `rsvp_by`, `save_the_date`, `group_link_enabled`, `look_mode`, `theme_id`, `ink` (charcoal, olive, terracotta, cobalt, burgundy), `invite_file_path`, `invite_image_path`, `details_strip`, `accent`, `share_title`, `share_description`, `share_image_path`, `yes_label`, `no_label`, `ask_party_mode` (single or split), `ask_names`, `ask_dietary`, `dietary_chips[]`, `ask_accessibility`, `custom_question`, `custom_question_type`, `plate_enabled`, `plate_mode`, `plate_host_note`, `text_template`, `reminder_template`, `see_you_soon_template`, `thanks_template`, `status` (draft, live, thanks, archived), `created_by`.
- **event_members**: `event_id`, `profile_id`, `role` (owner, cohost). The ownership table. Every host-side query joins through it.
- **guests**: `event_id`, `name`, `contact_name`, `phone`, `token` (unique, 10 to 12 chars from an unambiguous alphabet), `groups[]`, `role` (nullable: speaker, mc, performer, photographer, helper, custom text), `status` (pending, yes, no), `party_size`, `children`, `adults`, `party_names[]`, `dietary[]`, `dietary_note`, `accessibility_note` (free text, no chips), `custom_answer`, `note`, `emergency_name`, `emergency_phone`, `source` (invited, group_link), `sent_at`, `sent_by`, `opened_at`, `replied_at`, `reminded_at`, `see_you_soon_sent_at`, `dropped_out_at`, `thanks_sent_at`, `thanks_opened_at`, `thanks_photo_path`, `std_acknowledged_at`, `added_by`, `host_notes`.
- **plate_items**: `event_id`, `label`, `quantity`, `claimed_by_guest_id` (nullable), `added_by_guest_id` (nullable), `added_by_profile_id` (nullable), `tags[]` (nut free, gluten free, dairy free, vegan).
- **group_gift**: one per event. `event_id` unique, `description`, `target`, `organiser_guest_id` or `organiser_profile_id`, `pay_details`, `pay_reference`, `suggested_amount`, `chip_in_by`, `message`, `latest_update`, `surprise`.
- **gift_contributions**: `gift_id`, `guest_id`, `amount` (nullable), `chipped_in_at`.
- **runsheet_items**: `event_id`, `time`, `title`, `note`, `owner_profile_id` (nullable), `visibility` (hosts, guests, specific), `visible_guest_ids[]`, `visible_roles[]`, `sort`.
- **updates**: `event_id`, `body`, `posted_by`, `posted_at`.
- **shared_photos**: `event_id`, `path`, `sort`.
- **activity**: `event_id`, `actor` (profile or guest), `kind`, `detail`, `at`. Feeds the dashboard and the who-did-what trail.

Storage buckets: `invites` (uploads and converted images), `photos` (thank-you photos), `share` (generated share cards). Private buckets, read through signed URLs or short-lived public paths generated server-side. Storage paths always start with the event id so cleanup on delete is one prefix.

## Security model

- Hosts act under their own Supabase session. Every host table has policies of the form "the row's event has an `event_members` row for `auth.uid()`". Owners can delete the event and remove members; co-hosts can do everything else.
- Guests have no session. Guest pages run on the server and call Postgres functions marked `security definer` that take the token or slug as an argument and return only that guest's or event's public data. Nothing on the guest side ever queries a table directly, and no guest RPC accepts an id in place of a token.
- The service role key is never used by the running app. It is for migrations and seed scripts only, from a developer's machine, and lives in `.env.local` which is git-ignored.
- Deleting an event deletes every dependent row (cascade) and every storage object under its prefix. This is the privacy promise: allergy notes and children's names are gone when the host says so.
- Tokens can be regenerated per guest ("New link"). The old token stops working immediately.

## Routes

| Path | Who | What |
| --- | --- | --- |
| `/` | public | Landing with Continue with Google. |
| `/auth/callback` | public | Supabase auth callback. |
| `/app` | host | Event list, New event. |
| `/app/events/new` | host | Setup flow: Basics, Details, Look, Ask guests, Guests, Share. Save at each step. |
| `/app/events/[id]` | host | Dashboard: counts, nudges, guest list, actions. |
| `/app/events/[id]/(guests, remind, updates, plate, gift, runsheet, thanks, settings)` | host | Sub-screens. Keep them as tabs or sections of one page on mobile. |
| `/e/[slug]` | public | Group link invite. Asks "Who's this from?" after yes or no. |
| `/i/[token]` | public | Personal invite, RSVP, thank-you, extras, see-you-soon view, thank-you page after the event. Records `opened_at` on first view. |
| `/i/[token]/organiser` | public | Group gift organiser page, only for the organiser's token. |
| `/e/[slug]/invite.ics`, `/i/[token]/invite.ics` | public | Calendar file. |
| `/s/[event]/card.png` | public | Share card image, versioned by a hash so chat apps refresh it. |
| `/join/[code]` | host | Co-host invite link. |

## Key behaviours

- **Personal links** are `/i/<token>`. The dashboard creates a token the moment a guest is added. Tokens use the alphabet `abcdefghjkmnpqrstuvwxyz23456789`.
- **Text buttons** build `sms:<number>?&body=<encoded>` (works on iOS and Android) and `https://wa.me/<number>?text=<encoded>`. Tapping marks the guest as sent by the current host. The Share button uses the Web Share API where available.
- **Send next** walks the filtered list one guest at a time with a counter.
- **Templates** use `{name}`, `{title}`, `{date}`, `{link}`. Name resolves to `contact_name` when set, otherwise the first name from `name`.
- **Share card** is 1200 by 630, generated with `next/og` from the invite image or theme plus the title, cached, and re-versioned when the invite changes.
- **PDF conversion** happens in a server route at upload time using pdf.js with a Node canvas, first page rendered at 2x for a 1200 px wide image. If conversion fails the upload is rejected with a clear message.
- **Open in Maps**: Google Maps search URL from the address, with an Apple Maps URL on iOS user agents.
- **Allergy banner** on the plate list shows counts by dietary chip only, never names or free text.
- **Event types** set defaults for every switch (see the journeys page table). Defaults are applied once at creation, then the host owns the settings.
- **Group link** can be switched off; a closed link shows the closed wording with a text-the-host button.
- **Opened tracking**: first view of a personal link sets `opened_at`; the thank-you page sets `thanks_opened_at`.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=            # migrations and seeds only, never read by app code
NEXT_PUBLIC_SITE_URL=           # optional, otherwise derived from the request
```

Development project: `invites-dev` in Sydney. Production project: `invites-prod`, created when phase 1 is accepted; its keys go straight into Vercel.

Migrations are SQL files in `supabase/migrations/`, numbered, applied in order. A seed script in `supabase/seed.sql` creates the example event (Leo's 6th, see the design brief) for local testing and screenshots.

## Milestones, in order

1. **Foundation.** Migrations for all tables, policies and guest RPCs. Google sign-in and profile creation. Event list and New event with Basics only. Add a guest. Personal link opens the text-only invite with the greeting. Seed script.
2. **RSVP.** The full RSVP conversation on the personal link with every optional question, the thank-you screen with calendar buttons, change my answer, group link flow with "Who's this from?", duplicate matching, opened tracking.
3. **Share and dashboard.** Templates, Text, WhatsApp, Share, Copy, Send next, group link on and off, QR download, co-host invites, dashboard counts and nudges, guest list with trail and filters, Remind, New link, Merge.
4. **Looks.** Upload with PDF conversion, ink pick from the artwork, six monoline illustration sets as inline SVG in the chosen ink, the illustrated timeline read from guest-visible runsheet items, share card, live preview in the Look step.
5. **Extras.** Updates, bring-a-plate with allergy banner, group gift with organiser page, runsheet with visibility and the now / next view, see-you-soon flow with drop-out button, save the date.
6. **After and next time.** Thank-you mode with per-guest photos, shared photos, duplicate event, copy guest list, delete event with full cleanup.
7. **Design drop.** Apply the design system and wording from Claude Design across everything. Accessibility pass to WCAG AA. Playwright suite green on mobile viewport.

Each milestone ends with screenshots on a 390 px viewport posted to Marcia and a short note of what to try.

## Conventions

- Branch per milestone, small commits, push often. `main` is always deployable.
- Typecheck, lint and the Playwright suite pass before every push.
- Tests run against the development Supabase project with the seed data, never against production.
- Components live in `components/`, data access in `lib/db/` (one module per table), guest RPC wrappers in `lib/guest/`, server actions in `app/**/actions.ts`.
- No UI framework or component library until the design drop; plain CSS with tokens in `app/globals.css`.
- Copy lives in `lib/copy.ts` as the single source of default wording, mirroring the journeys page table. No strings inline in components.
- Never commit `.env.local`, keys, or seed data with real people in it.

## Not in phase 1

Payments and in-app gift collection, sending texts or emails from the app, automatic reminders, day-of check-in, checklist, waitlist, view-only links, CSV export, marketing site, dark theme, custom domains per host.
