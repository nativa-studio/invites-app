# Handoff: two new invite layouts, Fur bands and Staff file

For Claude Code, working in `nativa-studio/invites-app`. Read `CLAUDE.md` and `uploads/layout-brief.md`
(the engineering brief for a layout) first. Everything in them applies. This document adds the
design half, and `ACCEPTANCE.md` says how the work is judged. **Read `ACCEPTANCE.md` before you
write a line of code.** The work is not finished when it looks right. It is finished when every
gate in that file passes and the report it asks for is written.

## 1. What was approved

Marcia approved two layouts on 25 September 2026, drawn with Gabriel's 4th (the pilot event) in a
Monsters theme:

| Design name | Layout id | What it is | Envelope stock |
| --- | --- | --- | --- |
| Fur bands | `bands` | No cards. Full-width bands edge to edge, one per part, each with a scalloped fur edge along its top. The characters stand on the cover band. One big eye watches the reply. | `fur` |
| Staff file | `file` | The cover is a staff pass on a V lanyard. Every other part is one ruled sheet on a clipboard, filled in by hand: numbered sections, the reply as tick boxes and a rubber stamp, the info booth and the sign-off as post-its. | `manila` |

A third, Door station (`1a` in the design file), was parked. Do not build it.

**Fidelity: high.** Every colour, size, radius, shadow, font and position in the reference files
is final. There is no "close enough" and no room to substitute the codebase's nearest existing
style. Where the brief's contract and the design disagree, the contract wins and you stop and ask
(see `ACCEPTANCE.md`, Deviations).

## 2. The files in this package, and which one wins

| Path | What it is | Authority |
| --- | --- | --- |
| `spec/golden.json` | Every text, control, image and section of the approved design at 390px, measured from the browser: computed font, size, weight, line height, letter spacing, colour, and a box. | **Wins over everything.** The verification suite reads it. Never edit it. |
| `reference/*.png` | Pixel references: each page at 390 open, each envelope shut, each share card at 1200 × 630. | Wins over your eye. Compared pixel by pixel. |
| `reference/*.html` | The approved design, rendered, with every style inline and resolved. Open in a browser at 390 to see it; read it to lift exact CSS. | The source for every value you type. |
| `reference-html/Monster Layouts.dc.html` | The whole design canvas, with the Tweaks panel (envelope shut, reorder, switches). Needs its sibling `support.js`. | For behaviour: reordering and switches. |
| `artwork/` | The two pictures, ready for `public/artwork/`. | Use these files, do not re-export. |
| `verify/fidelity.spec.ts` | The Playwright suite that enforces `golden.json` and the PNGs. | Must pass. Do not loosen it. |

The reference HTML is a prototype. Do not ship it or copy its structure. Build each layout the way
`StripInvite.tsx` is built, and make the result **measure** the same as the reference.

## 3. Registration

`lib/layouts.ts`:

```ts
{ id: "bands", name: "Fur bands", line: "Colour bands, the characters on top", suits: ["kids_party", "birthday"] },
{ id: "file",  name: "Staff file", line: "A staff pass and a clipboard", suits: ["kids_party", "birthday"] },
```

`STOCK`: `bands: "fur"`, `file: "manila"`. `Stock` gains `"fur" | "manila"`.

`InviteBody.tsx`: one dispatch line each, the same props the strip gets, and both ids in the
`LAYOUTS` array at the foot. Files: `components/invite/BandsInvite.tsx` + `app/bands.css`,
`components/invite/FileInvite.tsx` + `app/file.css`. Root rules are `main.bands` and `main.file`,
and **every** descendant rule starts with them.

## 4. The fixture that reproduces the references

The references were drawn from this data. Create a scratch event with a `zz-` slug and these values,
one guest named **Mia**, and the pages must then match the references exactly. Delete it afterwards.

| Field | Value |
| --- | --- |
| slug | `zz-monsters` |
| type | `kids_party` |
| title | `Gabriel is turning 4` |
| intro | `A pool party! Come for a swim, a light spread and cake. All the family welcome.` |
| host_line | `With love from Gabriel's mum and dad` |
| date / start_time / time_note | `2026-11-01` / `14:00` / `From 2pm, come when you can` |
| venue / address | `Our place` / null |
| serve_text | `A light spread, and cake at 4` |
| what_to_bring | `Swimmers, a towel and a hat` |
| siblings_welcome | true |
| photo_sharing | `kids_off_social` |
| rsvp_by | `2026-10-25` |
| plate_enabled / plate_mode / plate_host_note | true / `free` / `Bring something for the table if you feel inspired. No pressure at all.` |
| plate_block, show_gifts, group gift | off |
| updates | none |
| host_phone, ask_phone | none (so the Questions line is plain text, not a link) |
| section_order | default |
| every other show_* | on, except About this app: off (section 9) |
| runsheet | `14:00 Arrive` "Come when you can. Swimmers on under clothes saves a lot of time." icon `gate`; `14:15 Swim` "Grown-ups in or poolside, whichever you like." icon `ring`; `16:00 Cake` "Candles, a song, and cake for everyone." icon `cake` |
| invite_image_path | the Monsters set from section 7 |
| layout_id | `bands` for one run, `file` for the other |

## 5. Fur bands, part by part

Page: `main.bands`, background `#F1DDBA`, ink `#1F2530`, no side padding (bands are full bleed at
390). Greeting at the top: Patrick Hand SC 15px, letter spacing 0.14em, upper case, centred, 28px
from the top.

Every band after the cover has the same fur edge: a 14px strip sitting 13px above the band, the
band's own colour drawn as a row of 10px circles every 20px
(`radial-gradient(circle at 10px 14px, <band colour> 10px, transparent 10.5px) 0 0 / 20px 14px repeat-x`).
Draw it as a pseudo-element on the band, never as an element with a bare class.

| Part | Band | What is in it |
| --- | --- | --- |
| cover | page colour | "Scarer wanted" (new copy, `#3B1F63`, hand 20px), the title in **Luckiest Guy 56px** (section 8), the intro, then the pair of characters, 340px wide, centred, 18px clear of the next band. The picture's edges fade into the page (mask in the reference). |
| details | `#97C93D` | Lilita One 34px heading; clock and pin as monoline icons (`Mono`, 40px, ink); "Open in Maps" is an underlined link **inline after the venue**, not a pill. |
| reply | `#6A3FA0`, white text | The eye (76px, 4px ink ring, iris `#3F9E5A`, pupil ink) half over the top edge. Then the shared reply, restyled (section 5a). |
| day | `#FFF9EE` | Heading, then rows: time (Lilita 18px, centred in 56px), Mono icon 48px, title (Lilita 19px) and note (14px). No boxes. |
| know | `#35A9B8` with purple spots (exact gradients in the reference) | Heading, then one row per note: Mono icon 40px and 16px text. |
| after | `#97C93D` | Two cells: Mono icon 48px, Lilita 22px heading, 14px line. |
| signoff | `#1F2530`, text `#F3E4C6` | A small eye (44px), the message in hand 26px, the host line in `#C6EB85`. |

### 5a. The shared reply inside the purple band

You do not rebuild the reply. `reply` arrives as one node (the plate announcement, `Rsvp`, and
`HoldTheDate`). Put it inside the band and restyle the shared classes under `main.bands`. This is
the mapping from the reference elements to the real classes; every value is in
`reference/bands-page.html` and is checked by the suite.

| Reference element | Real selector |
| --- | --- |
| "RSVP" Lilita 40px white | `main.bands .rsvp-h` (and hide `.rsvp-h svg`, the bolts belong to Pokémon) |
| "Can Mia make it?" hand 23px, name `#C6EB85` with a 2px `#97C93D` underline | `main.bands .rsvp-q`, `main.bands .rsvp-q u` |
| Nudge 15px / 1.5 | `main.bands .pcard.reply .nudge` |
| Yes: lime `#97C93D` with two dark spots, 4px ink border, radius `32px / 38px 38px 26px 26px`, hard shadow `0 6px 0 #1F2530`, Lilita 22px, 64px tall | `main.bands .pbtn.primary` |
| No: same shape, teal `#35A9B8` with purple spots | `main.bands .pbtn:not(.primary):not(.small)` |
| Reply by, 13px white, full opacity | `main.bands .replyby` |
| The calendar block with its dotted top rule | `main.bands .hold`, `.hold .q`, `.hold .row .pbtn`, `.hold .note`. The existing rules are `.invite .hold`, so none of them reach this page: write every property. Links are 44px tall here, not 40. |
| The card around it | `main.bands .pcard.reply`: no background, border, shadow, tilt or padding |

## 6. Staff file, part by part

Page: `main.file`, background `#35A9B8`, side padding 16px.

- **Header**: a full-width white band, 13px top, 12px bottom, the greeting in ink, hand 15px. It sits
  above the lanyard, which starts behind it.
- **Cover (the pass)**: the V lanyard (two 14px `#6A3FA0` straps at ±26°, 150px long), a 16px metal
  crimp, a 20px ring, a purple tab dropping into the pass's slot. The pass is 310px wide, radius 18,
  3px ink border, tilted −1.5°, purple top band with the white slot and "Scarer wanted", a 190px
  square photo (Mike, section 7), the title in **Luckiest Guy 38px**, the intro, a 14px lime foot.
  The whole pass group, lanyard included, carries the tilt.
- **Clipboard**: board `#4A2878`, 3px ink border, radius 16; metal clip centred on its top edge. The
  sheet is `#FFF9EE` ruled every 32px in `rgba(53,169,184,.28)`. Parts are separated by a 2px dashed
  rule.
- **Numbers**: details, reply, day and know are numbered `01` to `04` in their drawn order
  (Nunito 700 12px, 0.16em, `#1B6F7C`). Count from the parts actually drawn, so a hidden part does
  not leave a gap. After and signoff carry no number. Reordering renumbers.
- **Reply**: its section is tinted `rgba(151,201,61,.16)`. The number sits on the baseline of
  "RSVP". Buttons are tick-box rows: hand 24px, left aligned, 3px ink rule under each, a 26px box
  before the words (`::before`), Yes highlighted `rgba(151,201,61,.45)`. The reply-by line is a
  rubber stamp: 3px double `#6A3FA0`, rotated −4°, right aligned. Same mapping approach as 5a, under
  `main.file`.
- **Info booth**: a two-column grid of post-its, 124px min height, tints `#E3F1BF`, `#C9EAEE`,
  `#E6DCF3`, `#F6E9C8` in that order, tilts −2.5°, 1.8°, 1.2°, −1.6°, a darker sticky strip along
  each top, Mono icon 30px and hand 18px text. The colour and tilt follow the note's position, so a
  fifth note repeats the first.
- **Sign-off**: one yellow post-it `#F7E48A`, 250px wide, tilted −3°, message hand 26px, host line
  `#4A2878` hand 17px.

## 7. Envelopes and artwork

Both use the shared `Envelope`. No second animation. Exact geometry, colours and layer order are
in `reference/*-envelope-back.html` and `spec/golden-envelopes.json`.

**fur** (bands): back `#5CC0CC` with `#7A52B0` spots; pocket sides `#2B8A97`, edge `#35A9B8` at
0.6; flap `.front` `#237580`; flap `.rim` repurposed as the spotted teal face
(`inset: 0 0 5px; clip-path: polygon(0 0,100% 0,50% 100%)`, `#35A9B8` with `#6A3FA0` spots), so a dark
lip shows at the point. Seal: white, 3px ink, holding the eye (24px iris `#3F9E5A`). The mascot is the
pair as a sticker: `.env.fur .cast` 104 × 100, `border: 5px solid #fff`, radius 14, `object-fit: cover`,
`object-position: 50% 60%`, rotated −4°.

**manila** (file): a flat internal-mail envelope. Override the flap and pocket shapes for this stock
only: flap 64px tall, no clip path, `#D9BE8A`, radius `6px 6px 14px 14px`, 3px `#BFA06A` lower edge;
pocket and back plain `#E8D3A6`, radius 6, with four punched holes (16px, page colour) drawn in the
back's background. The seal becomes the string-and-button closure: two `#6A3FA0` buttons with 3px
ink rings, the top one carrying a white eye, joined by a figure-of-eight string `#8A6A30`. Pass it
through `seal` and restyle `.env.manila .seal` to be a transparent 60 × 120 box. The polaroid of
Mike with its paperclip is part of the seal node, positioned from it, because `mascot` cannot carry
a frame and a clip.

Artwork goes into `public/artwork/` and `lib/artwork.ts` as a bundled set, the same way Gabriel's is:
`monsters-pair.png` (cover for bands, mascot for bands) and `monsters-mike.jpg` (the pass photo and
the polaroid for file, `object-position: 50% 94%` in the pass, `50% 90%` or as the reference in the
polaroid). Add a `portraitFor()` beside `coverFor()` for the square photo. The characters are Marcia's
own pictures for a private party, the same standing as the Pikachu set: bundled for the pilot only.

**Share cards**: `reference/*-share-card.png` and `.html`, 1200 × 630. Satori takes no `clip-path` and
no `color-mix`, so draw spots as an SVG pattern and everything else as boxes. Fur: spotted teal paper,
a seam 70px down, a stamp with the eye and "4", a postmark struck across it, "Mia" in Luckiest Guy
120px on a paper label, the pair as a sticker. Manila: the routing grid with two crossed-out rows
and Mia on the next line in `#4A2878` hand 44px, the "Scarer wanted" stamp, the Mike polaroid.

## 8. Type

Lilita One, Patrick Hand SC and Nunito as today. **Luckiest Guy is new**, used only for the event
title on both layouts and the name on the fur share card. Add it in `app/layout.tsx` as
`--font-title` and add its `.ttf` to `lib/fonts/` for Satori. This is a deliberate addition; say so
in the handover.

## 9. Copy (add to `lib/copy.ts`, never inline)

- `Scarer wanted` (the eyebrow on both covers and the manila stamp)
- Share card grid: `To`, `Floor`, and the two crossed-out rows `Floor manager` / `Scare floor F`,
  `Door 4` / `Door vault`
- Everything else on the pages is existing wording, drawn from the event.

About this app is **off** for Marcia's trial client and absent from the references. That needs a
`show_about` switch (absent means on) that `InviteBody` honours for every layout. It is a change
outside the two files: say so.

## 10. Outside your two files, the complete list

`lib/layouts.ts`, `InviteBody.tsx` (dispatch, `LAYOUTS`, `show_about`), `app/invite.css` (the two
`.env.<stock>` blocks, compound selectors only), `lib/artwork.ts` + `public/artwork/`,
`app/layout.tsx` + `lib/fonts/` (Luckiest Guy), `lib/copy.ts`, `components/share/envelope-card.tsx`
(two stocks), a migration for `show_about`. Anything else you touch is a deviation.
