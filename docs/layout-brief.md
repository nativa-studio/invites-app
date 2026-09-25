# Designing a new invite layout for Bunting

This is the engineering half of the brief. It says what a layout is, what it must do, what it may
not do, and how to know it works. Marcia briefs the theme, the look and the feel separately; the
two halves together are the job.

Read `CLAUDE.md` first if you have not. Everything in it applies here, and two of its rules were
written by faults in this exact part of the codebase.

## What a layout is

An invite is one page a guest opens from a text message. A **layout** is one whole design for that
page: its shape, its colours, its furniture and the order things are drawn in. Three exist today.

| id | Name | What it is |
| --- | --- | --- |
| `suite` | Pokémon | An envelope that opens onto tilted cards with tape on them, a character standing in the corner. The default. |
| `strip` | Illustrated strip | One ink on a tint of that ink, straight down the page, no cards. Monoline doodles instead of photographs, so it suits an event nobody has made artwork for. |
| `lineup` | The lineup | One quiet page, artwork along the bottom. Retired and hidden, still drawn for events already on it. |

Two more, `peek` and `post`, exist in the code and are reachable only by `?layout=`. They are not
offered to hosts.

A layout is **not** a colour scheme, a font choice or a set of pictures. Those already vary inside
a layout: the event carries a palette, an ink and a theme, and the same layout draws in all of
them. A new layout earns its place by being a different **shape** of page.

## The one rule that matters most

The same invite is drawn in three places, and they must agree.

1. **The guest's own page**, `/i/<token>`.
2. **The group link**, `/e/<slug>`, where nobody has a token yet.
3. **The host's own screen**, `/app/preview/<id>`, which is the same page with a pencil on each
   part, plus the same page full size with the envelope shut.

All three call one component, `InviteBody`, which dispatches to your layout. So you write the page
once and all three get it. The way to break this is to special-case the host's view inside your
layout. Do not. `InviteBody` already hands you the two overrides that need to differ, and nothing
else about the host's screen is your business.

The reason this is rule one: every expensive bug in this project has been one drawing of the invite
disagreeing with another.

## The contract

### The file

`components/invite/<Name>Invite.tsx`, one named export (`export function <Name>Invite`), plus
`app/<name>.css` which that file imports at the top. Use `StripInvite.tsx` as the model. It is the
newest and the cleanest.

### The props you are given

```ts
{
  event: PublicEvent;        // everything about the party, see below
  greeting: string;          // "Hi Ann, you're invited", already built. Draw it, do not compose it.
  reply: React.ReactNode;    // the RSVP, plus the plate announcement over it and the calendar
                             // buttons under it. One node. Put it where it belongs and do not
                             // unpack it.
  after?: React.ReactNode;   // About this app. Last thing on the page, after the sign-off.
  plate?: React.ReactNode;   // Bring a plate. Draw what you are given.
  gifts?: React.ReactNode;   // The gifts block, when the host's editor is overriding it.
  skipAnimation?: boolean;   // pass straight through to Envelope.
}
```

`reply`, `after` and `plate` are built by callers who know things you do not: whether this guest
has answered, whether they have a row to write against, whether anything written here should be
saved. Render them. Never rebuild them.

`gifts` is an override and may be undefined. When it is undefined, draw the gifts block yourself
from `GiftsContent`. When it is given, draw it instead of yours. It is the host's editor handing
you a faded card for a block that is switched off, so there is something to put a pencil on.
Same for `plate`: given, draw it; not given, draw `<PlateSlot />`.

### What you must draw

Every part below, in the host's order, each one hidden when its switch is off:

| part | switch | what it is |
| --- | --- | --- |
| `updates` | none, shows when there are any | News posted since the invite went out |
| `details` | `show_details` | Date, time, place, Open in Maps |
| `reply` | none | The RSVP. Always drawn. |
| `day` | `show_runsheet` | The order of the afternoon, from `event.runsheet` |
| `know` | `show_good_to_know` | The info booth: parking, what to wear, access |
| `plate` | `plate_enabled` | Bring a plate |
| `gifts` | `show_gifts` | Gifts: the host's note, the hints list, the group gift |
| `after` | `show_after` | Questions: who to text, photos |
| `signoff` | `show_signoff` (absent means on) | The host's closing line |

The cover is always first and is not in that list. An invite that opens on anything other than
what it is for is not an invite.

The order comes from `orderedParts(event.section_order)`. Build a `Record<InvitePart, ReactNode>`
and map over that function's result, exactly as `StripInvite` does. Do not hard-code the order.
The lineup was retired for hard-coding it: reordering worked on two designs and silently did
nothing on the third.

### `data-section`, which is not optional

Every block you draw carries `data-section="<part>"` on its outermost element. The names are
exactly: `cover`, `updates`, `details`, `reply`, `day`, `know`, `plate`, `gifts`, `after`,
`signoff`.

This is the handle the host's editor edits by. A pencil is drawn into each marked element, and
tapping it opens the drawer holding that part's wording. A block without the mark is a part a host
cannot change from their own screen. Put it on the whole block, not on the heading: a host tapping
the title of the cover means "change the cover".

### Shared components you must use rather than rewrite

- `Envelope`: the opening. Every layout uses it, from one file, because an animation written
  twice is an animation that drifts. It takes `cover`, `children`, `openLabel`, `skipAnimation`,
  and optionally `stock` (`"red" | "beige" | "ink"`), `seal`, `mascot`, `bodyClassName`.
- `GiftsContent` and `hasGifts`: what the gifts block says. Five layouts draw a gifts block and
  only their clothes differ, so the words live in one file. Wrap it in your own container, which
  must carry the class `gifts` for four rules in `invite.css` to find.
- `PlateSlot`, `AboutApp`, `CalendarButtons`: given to you through props. Render them.
- `copy.ts`: every string a guest reads. No strings inline in components, ever. If your design
  needs a word that does not exist yet, add it to `lib/copy.ts` and read it from there.
- The formatting helpers in `lib/format.ts`: `formatInviteDate`, `formatTime`, `formatTimeRange`.
  Dates are day-month and times are Australia/Brisbane. Do not format dates by hand.

## The CSS contract, and the fault it exists to prevent

`InviteBody` imports every layout so it can dispatch to any of them, which means **every layout's
stylesheet is loaded on every invite page**. A bare class name at the top of your stylesheet is
not yours to take.

So: the root rule of your stylesheet names the element it is on, `main.<name>`, and so does every
descendant rule under it.

```css
main.mylayout { ... }
main.mylayout .cover { ... }
```

Never `.mylayout`, never a bare `.cover`, `.card`, `.pick`, `.strip`, `.peek`.

This has now gone wrong three times:

- `app/peek.css` declared `.peek { min-height: 100vh }`. The About this app block contained a
  `<span class="peek">`. Every invite in the app drew an 844px empty cream panel at its foot.
- `app/strip.css` declared `.strip { --ink: ...; --red: var(--ink) }`. The celebration's streamers
  are `<span class="flag pop c0 strip">`. A third of the bunting came out charcoal on a blue
  invite, because each streamer was handed the strip's entire one-ink token set.
- A tappable word in the hints list was given `class="pick"`, and `globals.css` has a bare `.pick`
  on it that is `display: grid`.

None of these is visible to typecheck, to lint, or to a page that does not happen to have the
other thing on it.

### Tokens your root rule must define

The reply form, the plate board, the gifts block and the celebration are shared across layouts and
read colours from custom properties. Your `main.<name>` rule has to supply them or those parts
will draw in whatever the last layout left behind.

```
--navy  --red  --sky  --yel  --forest  --crm  --paper
--sky-ink  --on-sky
--flag-0 --flag-1 --flag-2 --flag-3 --flag-4 --flag-edge
```

The suite gets these from the event's palette through `paletteVars`. The strip, which is one ink,
maps them all onto its ink and paper. Either is fine. What is not fine is leaving them unset.

Also on the root rule: `overflow-x: clip` (the envelope's flap is wider than the page and without
this the page scrolls sideways at 390), `min-height: 100vh`, a `background`, a `color`, and
`font-family: var(--font-body)`.

Fonts available: `--font-display` (Lilita One), `--font-hand` (Patrick Hand SC), `--font-body`
(Nunito). Adding a font is a decision to make deliberately, not a side effect of a design.

## What the event gives you

`PublicEvent` in `lib/db/types.ts` is the whole of it. The parts a layout usually wants:

- **Cover**: `title`, `intro`, `invite_image_path`, `theme_id`, `palette`, `ink`, `strip_set`
- **Details**: `date`, `start_time`, `end_time`, `time_note`, `venue`, `address`, `parking`,
  `facilities`, `facilities_note`, `public_transport`
- **The day**: `runsheet` (time, title, note, icon)
- **Info booth**: built for you by `orderedNotes(e)` in `lib/good-to-know.ts`
- **Gifts**: `show_gifts`, `wishlist`, `group_gift_what`, `group_gift_note`, `gift_note`
- **Plate**: `plate_enabled`, `plate_block`, `plate_mode`, `plate_host_note`
- **Questions**: `askContacts(e)` and `photoLine(e)` in `lib/ask-line.ts`
- **Sign-off**: `signoffMessage(e)`, `host_line`
- **Shape**: `section_order`, and every `show_*` switch

Anything not on that object is not available to a layout. In particular a layout never queries the
database and never takes a token: guest pages reach data only through the security-definer
functions, and by the time your component runs that has already happened.

## Registering it

Three places, all small, plus your stylesheet:

1. `lib/layouts.ts`, add to `LAYOUTS` with `id`, `name`, an optional `line` for the tile, and
   `suits` (which kinds of party it is offered for first: `kids_party`, `birthday`, `gathering`,
   `baby_shower`, `memorial`). Add its envelope stock to `STOCK`.
2. `components/invite/InviteBody.tsx`, one line in the dispatch, and the id in the `LAYOUTS`
   array at the foot of that file.
3. `app/<name>.css`, your stylesheet, imported by your component.
4. Nothing else. The picker, the thumbnails, the design sheet and the host's editor all read the
   list.

A layout is retired by setting `hidden: true`, never by deleting the row. A deleted row makes
every event already saved on it read as unset, and the next save writes the default over the
host's choice.

## Constraints that are not negotiable

- **Mobile first, 390px.** That is the width every screenshot is taken at and the width Marcia
  reviews on. Check 960 too, but 390 is the design.
- **Light theme only** in phase 1.
- **Australian English.** Dates day-month, mobiles 04xx, times Australia/Brisbane.
- **Never an em dash**, anywhere a guest or Marcia will read. Use a comma, a full stop, a colon
  or brackets.
- **WCAG AA.** Real contrast, 44px minimum touch targets, a visible focus ring, and every
  decorative picture `aria-hidden` with the name carried by something a screen reader can read.
- **`prefers-reduced-motion`** turns off every animation, including the envelope's.
- **Server components by default.** A layout is server-rendered. Anything that needs a browser
  (state, an effect, a click handler) is a small client component of its own that the layout
  renders. Note the hard rule in `CLAUDE.md`: a server screen cannot call a plain function out of
  a `"use client"` file. Components may cross that line, functions may not.

## Information belongs at the moment it is needed

This is the self-check `CLAUDE.md` asks for, and it decides layout more than any style choice.

Before putting anything on the page, ask when the reader needs it.

- **Deciding whether to come**: date, time, place, who is hosting.
- **Replying**: the questions and nothing else.
- **Coming**: what to bring, parking, facilities, gifts.
- **On the day**: access details, the order of the afternoon.
- **After**: thanks and photos.

A detail never rides in a block above its moment just because it shares a topic with that block.
The default `section_order` is built on this, which is why the reply sits in the middle of the
page and not at the bottom.

## How to know it works

Typecheck and lint cannot see anything that matters here. Every one of these is a page you load
and a thing you measure.

1. `npm run build` then `npx next start`. Never `npm run dev`: the dev server does not hydrate
   client components in this environment.
2. Load a real guest link, `/i/<token>`, at 390. The envelope arrives shut, opens on a tap, and
   the page behind it is your design.
3. Load the group link, `/e/<slug>`. Same design, no token, the reply is the group one.
4. Load the host's screen, `/app/preview/<id>?edit=1`. Every block has a pencil. Count them
   against your list of parts: a missing pencil is a missing `data-section`.
5. Turn each `show_*` switch off in turn and confirm the part goes, and that nothing above or
   below it collapses oddly.
6. Reorder the sections and confirm your layout follows.
7. Press yes on the host's screen and watch the reply become a thank you and the plate board
   appear.
8. At 390: no horizontal scroll, nothing clipped, no touch target under 44px.
9. Screenshots at 390 of the whole page, top to bottom, for Marcia.

Use a scratch event with a `zz-` slug for anything that writes, and delete it afterwards. The live
site runs on the development database, so a careless test is a test against real guest data.

## What to hand back

- `components/invite/<Name>Invite.tsx`
- `app/<name>.css`
- The four-line registration in `lib/layouts.ts` and `InviteBody.tsx`
- Any new strings added to `lib/copy.ts`
- 390px screenshots of the whole page, and one of the envelope shut
- A note of anything you had to change outside your own two files, and why

## Things that have already been tried

- **Hard-coding the section order.** Retired a layout.
- **Writing the gifts block or the plate card again inside a layout.** They exist three times
  already and `CLAUDE.md` records that they will drift. Do not make it four.
- **A second RSVP.** There is one, it is handed to you, and it is the only part of the invite that
  writes to a guest's row.
- **Special-casing the host's preview.** The overrides in the props are the whole of what differs.
- **A bare class name in a layout stylesheet.** Three times, three bugs, none of them visible to
  any tool.
