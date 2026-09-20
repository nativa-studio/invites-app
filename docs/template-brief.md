# Brief: building a new invite template

For a designer joining Bunting. Everything here is read from the code as it stands, not from
intent. Where a number appears, it is the number the app uses.

Read `docs/design-brief.html` for the wording and feel, and `docs/journeys.html` for what the app
does step by step. This document is the contract a template has to meet.

---

## 1. What a template is, and what it is not

A template is a **skin over one fixed invite builder**. It is not an invite.

The host builds the invite: they write the words, switch parts on and off, and drag the parts into
the order they want. The template decides what all of that **looks like**. A template that invents
its own order, drops a part, or adds one nobody can edit is broken, however good it looks.

Concretely, one module dispatches every design (`components/invite/InviteBody.tsx`), and each design
receives exactly the same content and the same arrangement. Today there are two in the range:

| Design | id | What it is |
| --- | --- | --- |
| Pokémon | `suite` | Cards with tape, tilted, arriving in an envelope that opens |
| Illustrated strip | `strip` | One ink on paper, straight down the page, no envelope |

A third, `lineup`, is retired: still drawn for events already on it, no longer offered.

**The test of a template is that it can be swapped.** Take an event built on one design, switch it
to yours, and nothing the host wrote should go missing, move, or stop being editable.

---

## 2. The three places every template is drawn

This is the rule that has cost this project the most, so it is first.

Every setting that decides what a guest sees is honoured in three places, and **two of them must
agree exactly**:

1. **The guest's own page.** `/i/<token>` and `/e/<slug>`. Authoritative: a part switched off here
   is never sent from the database, not sent and hidden.
2. **The host's preview as a guest.** `/app/preview/<id>?as=guest`. Must match 1 exactly.
3. **The host's preview while editing.** `/app/preview/<id>?pick=1`. Deliberately **not** the same:
   the plate and gift blocks still draw here when switched off, faded and labelled, because the
   switch that turns them back on lives in the drawer behind that card and nothing else opens it.

A template that is only checked in one of these will ship a switch that saves, says it saved, and
changes nothing. That has happened twice.

---

## 3. Editing by pointing

In the host's editor the invite runs in a frame, and a tap anywhere inside a part opens a drawer
holding that part's wording and its on/off switch.

The whole mechanism is **one HTML attribute**. Every part carries `data-section="<id>"`, and the
editor reads nothing else.

So, for every part your template draws:

- Put `data-section` on **one element that wraps the whole part**, including its heading and any
  picture belonging to it. If the title sits outside the marked element, tapping the title does
  nothing, which is where a host actually aims.
- Never nest one `data-section` inside another.
- The ids are fixed. They are listed in the next section.

Reordering needs nothing from you beyond reading the order you are given, in order.

---

## 4. The anatomy: every part, in order

The cover is always first and cannot be moved. Everything below it is in the host's order, which
you read from `section_order`; a part with nothing in it draws nothing.

| # | id | Name a host sees | Switch column | What it holds |
| --- | --- | --- | --- | --- |
| — | `cover` | The cover | none | Artwork or set pictures, the title, a line or two of intro. Always first. |
| 1 | `updates` | Updates | none | Anything the host has posted since sending. Appears only when there is one. |
| 2 | `details` | The details | `show_details` | Date, start and end time, a time note, venue, address, Open in Maps. |
| 3 | `reply` | The reply | none | The RSVP. Yes and No, the questions, the reply-by date, and after answering the thank-you card with calendar buttons. The point of the invite: it has no switch. |
| 4 | `day` | The order of the afternoon | `show_runsheet` | A timeline, read from the runsheet items marked visible to guests. Time, icon, title, note. |
| 5 | `know` | Info booth | `show_good_to_know` | Up to eight lines the host writes, each with a kind: siblings, bring, serve, drinks, plate, gifts, photos, other. Each kind picks its own picture. |
| 6 | `plate` | Bring a plate | `plate_enabled` | The dish board. Draws only for a guest who has said yes. |
| 7 | `after` | Questions | `show_after` | Who to ask and how, plus the photo reminder. Two cells side by side. |
| 8 | `signoff` | The sign-off | `show_signoff` | The host's closing message and who it is from. No label and no picture: this is the bit that stops being a document. |

Two more that are not in the host's reorderable list:

- **`gift`** — the group gift block, tied to `group_gift_enabled`. It rides immediately before the
  reply, with the plate announcement, because news about what the day involves is the last thing a
  guest reads before deciding.
- **About this app** — a fixed block, always the very last thing on the page, after the sign-off.
  Not a host part, not reorderable, not switchable. Style it quietly; it is about the software, not
  the party.

**Where a thing goes is decided by the moment it is needed, not by its topic.** Deciding whether to
come: date, time, place, who is hosting. Replying: the questions and nothing else. Coming: what to
bring, parking, gifts. On the day: access, timeline. After: thanks and photos. A detail never rides
in a block above its moment just because it shares a subject with that block.

---

## 5. The envelope

Two faces of one object. A guest sees the **front** in their chat app, taps it, and the page opens
on the **back**. They must read as one envelope turned over, not as two envelopes.

Not every template needs one. The strip has none. If yours does, both faces are your job.

### 5.1 The back — on the invite page

This is the face with the flap and the seal, the one the guest taps to open. **Nothing is written
on it beyond the name**: the guest has already been greeted by name directly above it.

Geometry as built, in CSS pixels at a 390px design width:

| Piece | Measurement |
| --- | --- |
| Stage | 390 wide, 500 tall, pulled up 150 behind the greeting |
| Envelope body | full width, 200 tall, sits 180 down the stage, 10px corner radius |
| Flap | 120 tall, hinged at the top, a triangle to a point at 50% |
| Seal | 52 × 52 circle, centred, 104 down, 3px border |
| Characters (optional) | 118 wide, standing at the bottom right, inset 14 right and 12 bottom |
| Card inside | lies on its side, rotated −90°, scaled to 0.50, held to 640 tall |

That last row is the one that catches people. The card turns a quarter turn about its centre and
halves, so **the card's height becomes its width on screen**. At 719 tall a cover came out 364
across inside a 342 envelope and stuck out 11px each side. Hold the card to a height and let the
artwork give up the difference: it crops rather than squashes.

The opening runs flap (900ms) → card rises (750ms) → envelope drops away (900ms), then the page
scrolls to the top. It starts on a tap, or by itself after 2.6 seconds. Under
`prefers-reduced-motion: reduce` every wait becomes zero and the card is simply there.

### 5.2 The front — in the chat message

The face a letter shows coming towards you. It carries what a postie puts on a letter and **has no
flap and no seal**, because both are round the other side.

- **Stamp**, top right: 132 × 156, white border 9, rotated 2°, holding a panel with a 3px keyline,
  a small emblem, and the age where a denomination goes.
- **Postmark**, struck **across** the stamp so it franks it: two concentric rings and four waves,
  drawn after the stamp so it prints over it. It ran clear of the stamp once and read as two marks
  side by side rather than one cancelling the other. Low contrast on purpose: it must not compete
  with the name.
- **Seam** along the top, a single line, the only sign from this side that there is a flap at all.
- **Name**, bottom left, in the same place and fitted the same way as on the back.
- **Characters**, bottom right, the same band.

### 5.3 The name

Fitted to the space, never a fixed size. A guest is called whatever they are called: a fixed size
either strands a word on a second line or wastes half the envelope on a short name.

The room is **624px** and the sizing costs **0.72em per capital** at this face. Both numbers were
wrong once and were fixed by measuring the card, not by reasoning about it. Size a shade small; a
stranded word always shows and a slightly small name never does.

### 5.4 Stock

An envelope is cut from a paper stock, which belongs to the design rather than to the event:

| Stock | Body | Flap | Rim | Ink on it |
| --- | --- | --- | --- | --- |
| `red` | the event's red, darkened 18% | the event's red | darkened 32% | pale |
| `beige` | `#E9DCC1` | `#F4EAD6` | `#CDBB98` | `#2B2119` |

Beige paper takes dark writing, red paper takes pale, so **the ink travels with the stock**. If
your template needs a third stock, it is five colours: ground, body, flap, rim, ink.

---

## 6. The share card

The picture that appears when the link is pasted into a message. **1200 × 630**, four variants,
`front` is the default:

| Variant | What it is |
| --- | --- |
| `front` | The addressed, stamped, franked envelope. The default. |
| `back` | The flap and the seal, the face the page then opens. |
| `posted` | A cream letter, hand addressed. Older, kept for comparison. |
| `opening` | Flap up, card halfway out. Older, kept for comparison. |

It is drawn by **Satori**, not a browser, and Satori is strict:

- **No `clip-path`.** CSS border triangles come out as blocks. Anything with a diagonal has to be
  inline SVG.
- **Text is set far better as positioned boxes than as SVG text.** Draw the shape in SVG, lay the
  words over it in HTML.
- **Images must be absolute URLs.** Satori fetches them itself.
- **Fonts are files, not CSS.** Three are loaded: Lilita One, Patrick Hand SC, Nunito Bold. A
  fourth face means adding a `.ttf` to `lib/fonts/`.

---

## 7. Colour

Two models. Pick one; do not mix them.

### The palette model (what Pokémon uses)

Seven tokens, set per event, available as CSS variables:

```
--sky      the ground the invite sits on
--navy     the keyline and the body ink
--yel      tape, seals, highlights
--crm      a warm card
--red      labels, headings, the primary button
--paper    the card stock
--forest   a second accent
```

Two more are **measured, not chosen**: `--sky-ink` and `--on-sky` pick the first of sky, forest or
navy that reaches 4.5:1 against the surface behind it. Do not hardcode text colour over these.

### The one-ink model (what the strip uses)

One ink on one paper, and every colour on the page is one of the two. Seven inks, each with its own
paper tint:

| Ink | Hex | Paper | Contrast |
| --- | --- | --- | --- |
| Charcoal | `#1F1B17` | `#FBF6EC` | 15.88 |
| Navy | `#1B2A4A` | `#F4F6FA` | 13.14 |
| Cobalt | `#2C2A5A` | `#F7F4FB` | 12.16 |
| Burgundy | `#6E2430` | `#FBF3F4` | 9.82 |
| Marigold | `#8A4A08` | `#FFF6E6` | 6.39 |
| Terracotta | `#9C4A22` | `#FBF4EE` | 5.64 |
| Olive | `#4F6B4A` | `#F6F8F2` | 5.55 |

**Every ink must measure 4.5:1 or better against its own paper.** Run
`node scripts/check-ink-contrast.mjs` before proposing one. A bright saffron looks like Diwali and
measures about 2:1, which is a paragraph nobody can read; the marigold above is the same idea taken
dark enough to read.

---

## 8. Pictures

Two sets exist, in two different languages. A template uses one.

**Poster set** (`components/art/icons.tsx`): flat colour shapes with a keyline. 64 × 64 viewBox,
3px keyline, fills from the palette tokens above.

**Monoline set** (`components/art/mono.tsx`): one line, no fill. 64 × 64 viewBox, stroke width 2.2,
round caps and joins, `stroke="currentColor"` so one ink governs the whole page.

### The name contract

This is the part that breaks quietly. A host picks a picture for each runsheet stop, and the app
stores **the name**, not the drawing. Every set must answer to the same names, or a host who
switches template finds their timeline drawn wrong.

Names a set must cover:

```
cap  ball  ring  cake  car  gift  camera  kids  towel  plate  bbq  gate  bolt  clock  pin
```

Plus the ones the info booth picks by itself, from the kind of line and sometimes from its wording:

```
kids  sun  towel  bbq  cake  cup  plate  gift  camera  shower  bubble
```

A line about sunscreen gets the sun in **every** template, so a host who switches design does not
find their invite saying something different. Two names may be aliases (`bbq` → `sausage`,
`pin` → `map`), and anything genuinely missing falls back rather than drawing the wrong thing.

The monoline set also carries subject pictures for the cover sets: `balloon  bunting  glasses
disco  pram  candle  leaf  sausage  map  diya  lantern  rangoli`.

### Cover sets

A template with no photograph needs a **cover set**: three pictures that stand over the title. Six
exist, keyed to the theme an event type already picks, so an invite made in thirty seconds still
has a cover:

| Set | The three |
| --- | --- |
| Birthday | balloon, cake, bunting |
| Summer | sun, ring, glasses |
| Baby | bunting, pram, leaf |
| Quiet | leaf, candle, leaf |
| A night out | glasses, disco, glasses |
| Home and family | leaf, plate, cup |
| Diwali | lantern, diya, rangoli |

Three is the number because it fills the width at 56px each without crowding, and because a
symmetrical trio (leaf, candle, leaf) reads as quiet while an asymmetrical one reads as busy. Use
that.

---

## 9. Assets you deliver

Per template:

- [ ] **Cover treatment.** Either a frame for the host's own artwork, or a cover set of three
      pictures per theme (seven themes).
- [ ] **A picture set** covering every name in section 8, as inline SVG on a 64 viewBox.
- [ ] **Envelope, both faces**, if your template has one: body, flap, rim, seal, stamp, postmark,
      and the stock colours from 5.4.
- [ ] **Share card**, 1200 × 630, front and back, inside the Satori limits in section 6.
- [ ] **Colour**, as either seven palette tokens or an ink and paper pair per colourway, with the
      contrast measured.
- [ ] **Type**, from the three faces already loaded, or a `.ttf` for a fourth.

### Formats

| Thing | Format | Notes |
| --- | --- | --- |
| Icons and line art | **Inline SVG** | No external references, no `<style>` blocks, no ids that could collide across two copies on one page. Stroke `currentColor` for monoline; palette variables for poster. |
| Photographic artwork | **JPEG q90, no chroma subsampling** | Keeps flat colour and line work clean. ~300 KB for a full cover. |
| Artwork with transparency | **PNG** | The character band is 1173 × 420. |
| Uploaded invites | PDF, PNG or JPEG | PDFs are converted server-side at upload, first page only, rendered at 2× to 1200px wide. |

Storage paths always start with the event id, so deleting an event cleans up with one prefix.

---

## 10. Type

Three faces are loaded and cost nothing to use:

- **Lilita One** — display. Headings, the title, big numbers.
- **Patrick Hand SC** — hand. Labels, section headings, anything that should look written.
- **Nunito** — body.

A fourth face costs a Google Fonts link for the app plus a `.ttf` in `lib/fonts/` for the share
card. Worth it if the template needs it; say so early.

---

## 11. Canvas and behaviour

- **Design at 390px.** Content is capped at 430. Everything must survive **360px** and **200% text
  size**: both have broken tiles in this app before.
- **The page never scrolls sideways.** Tables, code and wide diagrams get their own scroller.
- **44px minimum for anything tappable.**
- **WCAG AA**, measured rather than eyeballed.
- **`prefers-reduced-motion: reduce`** removes every wait, not just the flourish.
- A template with no envelope has nothing to tap on arrival, so it needs a cue that the page
  continues.

---

## 12. Words

- Copy lives in `lib/copy.ts`. **Never inline a string in a component.**
- **Australian English.** Dates day-month, mobiles 04xx, times Australia/Brisbane.
- **Never an em dash** in anything a guest or a host reads. Use a comma, a full stop, a colon or
  brackets.

---

## 13. How it gets checked before it ships

In this order, and none of it is optional:

1. `npm run typecheck`, `npm run lint`, `npm run build`.
2. Load a **real invite**, the **group link**, and **both preview modes**. Typecheck and lint cannot
   see a single one of the faults this document is about.
3. Tap every part in the editor and confirm the right drawer opens, including the title.
4. Reorder the parts and confirm the template follows.
5. Switch every part off, one at a time, and confirm it goes on the guest page and stays reachable
   in the editor.
6. Screenshots at 390px, top to bottom, for Marcia.
7. Measure, do not eyeball: bounding boxes, contrast ratios, the actual row in the database.
