# Prompt for Claude Design: draft a new invite template

Paste everything between the rules into Claude Design, after filling in THE IDEA at the top.
Claude Design cannot see this repository, so the prompt carries its own facts. The long version,
for whoever builds the result, is `docs/template-brief.md`.

Keep this file up to date when the anatomy, the colour models or the type change. A prompt that
describes last month's app produces a design nobody can build.

---

You are designing a new invite template for **Bunting**, a mobile-first web app for event invites
and RSVPs. A host makes an invite, texts every guest their own private link, and the guest opens a
page that greets them by name, says yes or no, and answers a few questions. Guests have no account
and never sign in. Almost everybody is on a phone, often one handed.

## THE IDEA

> **Fill this in.** One or two sentences. For example: "A botanical template: pressed flowers and
> hand-drawn botany, for a garden party, a christening or an engagement." Or: "A retro cinema
> ticket: perforated stubs, one bold ink, for a milestone birthday."
>
> If you have a mood, a reference or a photograph, put it here too.

## What a template is

A template is the **whole invite**: its layout, its pictures, its envelope, its colour model and
its share card. It is not a colour scheme applied to an existing layout.

Two exist already. Do not repeat either.

- **Pokémon** (`suite`): a stationery suite. Cards on a polka-dot ground, tilted, stuck down with
  tape, arriving in an envelope that opens. Seven colour tokens per event, photographic cover.
- **Illustrated strip** (`strip`): one ink on one tinted paper, monoline drawings, no photographs.
  Seven inks and seven picture sets (Birthday, Summer, Baby, Quiet, A night out, Home and family,
  Diwali).

## The parts, in order

The cover is always first and cannot be moved. Everything under it is in the host's own order, and
a part with nothing in it draws nothing. Design every part; assume any of them can be switched off.

| id | What a host calls it | What it holds |
| --- | --- | --- |
| `cover` | The cover | Artwork, the title, a line or two of intro. Always first. |
| `updates` | Updates | Anything posted since the invite went out. Only when there is one. |
| `details` | The details | Date, time, venue, address, Open in Maps. |
| `reply` | The reply | Yes and no, the questions, the reply-by date. No switch: this is the point of the whole page. |
| `day` | The order of the afternoon | A timeline: time, picture, title, note. |
| `know` | Info booth | Up to eight short lines, each with a kind (siblings, bring, serve, drinks, plate, gifts, photos, other) that picks its own picture. |
| `plate` | Bring a plate | A board of dishes to claim. Only for a guest who has said yes. |
| `after` | Questions | Who to ask and how. Two cells side by side. |
| `signoff` | The sign-off | The host's closing line and who it is from. No label, no picture. |

Two more ride outside that list: the **group gift** block, immediately before the reply, and a
small fixed **About this app** block, always the very last thing on the page.

## The rule that decides where anything goes

Place information by the moment it is needed, not by what it is related to.

- Deciding whether to come: date, time, place, who is hosting.
- Replying: the questions and nothing else.
- Coming: what to bring, parking, gifts.
- On the day: access, the timeline.
- After: thanks and photos.

A detail never rides in a block above its moment just because it shares a topic with that block.

## The envelope

Two faces of one object, and they must read as one envelope turned over.

- **The front** is what a chat app draws when the link is pasted: the guest's name written on it,
  a stamp, a postmark, a seal. It is the first thing anybody sees and it is often the only thing,
  so it has to work at thumbnail size.
- **The back** is the top of the invite page. It opens on a tap and the cover comes out of it.

An envelope is cut from a paper stock that belongs to the design, not to the event. Two exist:
`red` (dark body, pale ink) and `beige` (`#E9DCC1` body, `#2B2119` ink). The ink travels with the
stock. A third stock is five colours: ground, body, flap, rim, ink.

A template with no envelope has nothing to tap on arrival, so it needs its own cue that the page
continues below.

## Colour: pick one model

**Palette**, seven tokens set per event:

```
--sky     the ground the invite sits on      --red     labels, headings, the primary button
--navy    the keyline and the body ink       --paper   the card stock
--yel     tape, seals, highlights            --forest  a second accent
--crm     a warm card
```

**One ink**, one colour on one tinted paper, and every colour on the page is one of the two. The
seven that exist, all measured: Charcoal `#1F1B17` on `#FBF6EC` (15.88), Navy `#1B2A4A` on
`#F4F6FA` (13.14), Cobalt `#2C2A5A` on `#F7F4FB` (12.16), Burgundy `#6E2430` on `#FBF3F4` (9.82),
Marigold `#8A4A08` on `#FFF6E6` (6.39), Terracotta `#9C4A22` on `#FBF4EE` (5.64), Olive `#4F6B4A`
on `#F6F8F2` (5.55).

**Every colour pair you propose must measure 4.5:1 or better and you must state the number.** A
bright saffron looks like Diwali and measures about 2:1, which is a paragraph nobody can read. Take
the same idea dark enough to read, the way the marigold above is.

## Type

Three faces are already loaded and cost nothing:

- **Lilita One**, display: the title, headings, big numbers.
- **Patrick Hand SC**, hand: labels, section headings, anything that should look written.
- **Nunito**, body.

A fourth face is possible but costs a font file. Say so early if the design needs one.

## Pictures

Either a frame for the host's own photograph, or a set of drawings. If drawings, they must cover
every kind in the `know` table above plus the cover. Inline SVG on a 64 viewBox, no external
references, no `<style>` blocks, no ids (two copies of one drawing land on the same page).

## Non-negotiable

- Design at **390px**. Survive **360px** and **200% text size**. The page never scrolls sideways.
- **44px minimum** for anything tappable.
- **WCAG AA**, measured and stated, not eyeballed.
- `prefers-reduced-motion: reduce` removes every wait, not just the flourish.
- **Australian English.** Dates day-month, mobiles 04xx.
- **Never an em dash**, anywhere a guest or a host reads. A comma, a full stop, a colon or brackets.
- The invite has to work for a birthday, a wake, a christening and a fortieth. Nothing may assume
  children, or a party, or good news.

## What to deliver

One `.dc.html` page per screen on a canvas, the way the round-one board worked, at 390px:

1. **The invite, as a guest sees it**, top to bottom, with every part drawn.
2. **The same invite after the guest has said yes**, so the reply card, the plate board and the
   gift block can be seen in place.
3. **The envelope front**, at the size a chat app draws it, and **the envelope back**, closed and
   open.
4. **The share card**, 1200 × 630.
5. **A colour sheet**: every colourway with its measured contrast ratio next to it.
6. **A picture sheet**: every drawing in the set, on its 64 grid.

Show the empty cases too. A template is judged on the invite with no runsheet, no plate and no
gift, because most of them are.

---
