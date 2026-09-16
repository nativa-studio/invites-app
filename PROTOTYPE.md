> Historical. This describes the Airtable prototype, tagged `prototype-airtable` in git. The product now runs on Supabase; see README.md and SETUP.md.

# Prototype: single-event invite (Airtable-backed)

A small Next.js app for sending a party invite by text and collecting RSVPs.

- Every guest gets a **personal link** (`/i/<code>`), so when they open it the invite greets them by name and their reply is matched to them with no typing.
- A **general link** (`/`) works for anyone else. It asks for their name and an optional mobile number, then gives them their own link too.
- The **host dashboard** (`/host`) shows who is coming, how many people in total, who has not replied, and has a Text button per guest that opens Messages with the invite link already written.
- The guest list and the party details live in an **Airtable base**, so you can edit the invite or add guests in Airtable without touching the code.

## How guests are identified

A phone number cannot be read from a tapped link, so the app uses the next best thing: a unique code per guest baked into the link you text them. The host dashboard creates these codes automatically for every row in the Guests table. If someone forwards the general link to a friend, that friend replies with their name and the row is flagged "via general link" so you can see it came in unprompted.

## Setup (once)

1. **Airtable.** The base "Birthday RSVP" already exists with the right tables (see the schema below). Create a personal access token at https://airtable.com/create/tokens with the scopes `data.records:read` and `data.records:write`, and give it access to that base.
2. **Deploy on Vercel.** Import this repository, set the project **Root Directory** to `birthday-invite`, and add these environment variables:

   | Variable | Value |
   | --- | --- |
   | `AIRTABLE_TOKEN` | the token from step 1 |
   | `AIRTABLE_BASE_ID` | the base ID, starts with `app` |
   | `HOST_PASSWORD` | any password for the dashboard |
   | `NEXT_PUBLIC_SITE_URL` | the deployed URL, e.g. `https://party.vercel.app` (optional but recommended) |

3. **Fill in the Event row** in Airtable: title, date, time, venue, details, cover photo and so on. Changes show up within a minute.
4. **Update the Invite link formula** in the Guests table so it uses your real domain. That column is only a convenience for copying links from Airtable; the dashboard always shows the right links.
5. Open `/host`, log in, add guests (or paste them into Airtable), and tap **Text** next to each one.

## Airtable schema

Field names must match exactly. Table names can be changed with `AIRTABLE_GUESTS_TABLE` and `AIRTABLE_EVENT_TABLE`.

**Guests**

| Field | Type | Notes |
| --- | --- | --- |
| Name | Single line text | Primary field. "Sarah" or "Sarah & Tom" |
| Phone | Phone | Used by the Text button |
| Token | Single line text | Filled in by the app |
| Status | Single select | Pending, Coming, Not coming |
| Party size | Number | Total people coming, including the guest |
| Message | Long text | Note left by the guest |
| Responded at | Date with time | Set by the app |
| Source | Single select | Invited, Open link |
| Host notes | Long text | Yours, never shown to guests |
| Invite link | Formula | `IF({Token}, "https://YOUR-DOMAIN/i/" & {Token}, "")` |

**Event** (one row)

| Field | Type | Notes |
| --- | --- | --- |
| Title | Single line text | Primary field |
| Host name | Single line text | |
| Intro | Long text | Welcome message |
| Date | Date | |
| Time | Single line text | Free text, e.g. "6:30pm till late" |
| Venue | Single line text | |
| Address | Single line text | |
| Map link | URL | Optional, otherwise the address is used |
| Details | Long text | Dress code, parking, gifts |
| RSVP by | Date | Optional |
| Allow plus ones | Checkbox | Shows the "how many of you" control |
| Max party size | Number | Default 6 |
| Host phone | Phone | Shows "Questions? Text ..." |
| Cover image | Attachment | Optional photo at the top |
| Accent colour | Single line text | Optional hex, e.g. `#E04E6B` |
| Text message | Long text | Template for the Text button. `{name}` and `{link}` are replaced |

## Running locally

```bash
cd birthday-invite
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

## Notes

- Airtable attachment links expire, so the cover image is served through `/cover`, which fetches a fresh copy as needed.
- `/invite.ics` gives guests an Apple or Outlook calendar entry. The Google Calendar link is built on the fly.
- The dashboard cookie is a keyed hash of the password. Changing `HOST_PASSWORD` logs every device out.
- Guest pages are rendered on every request and never cached, so replies show up immediately. The Event row is cached for 60 seconds.
