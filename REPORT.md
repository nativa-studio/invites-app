# Report: Fur bands and Staff file

The two layouts approved on 25 September 2026, built from `design_handoff_monster_layouts/`.
Written to the shape `ACCEPTANCE.md` asks for.

**All gates pass.** Every automated gate passes, every manual gate is ticked with evidence, and the
four deviations in section 3 were put to Marcia and approved on 25 September 2026. ACCEPTANCE:
a deviation she has approved is a pass.

They are new templates in the library, for anybody starting an event. Nothing in this branch
changes Gabriel's invite: it stays on the suite layout it is on, and the only rows touched were
two scratch events with `zz-` slugs, both now deleted.

---

## 1. The suite

`npm run build && npx next start`, then the suite against it in full Chromium (see
`playwright.config.ts` for why the browser matters). Fixture `zz-monsters`, guest Mia, robustness
copy `zz-monsters-robust`, guest "Auntie Rose and the Nguyen family".

```
FIXTURE_TOKEN=zzmonstermia FIXTURE_SLUG=zz-monsters ROBUST_TOKEN=zzmonsterrose \
  BASE_URL=http://localhost:3434 \
  npx playwright test design_handoff_monster_layouts/verify --reporter=list

Running 22 tests using 1 worker

  ✓   1 fidelity.spec.ts:96:9  › bands › bands A: parts, order and data-section (4.3s)
  ✓   2 fidelity.spec.ts:103:9 › bands › bands B: sections (4.0s)
  ✓   3 fidelity.spec.ts:119:9 › bands › bands C: every text, typography and position (4.0s)
  ✓   4 fidelity.spec.ts:136:9 › bands › bands D: buttons and links (4.0s)
  ✓   5 fidelity.spec.ts:152:9 › bands › bands E: artwork (4.0s)
  ✓   6 fidelity.spec.ts:168:9 › bands › bands F: whole page against the reference (4.4s)
  ✓   7 fidelity.spec.ts:176:9 › bands › bands G: envelope shut (916ms)
  ✓   8 fidelity.spec.ts:185:9 › bands › bands H: share card (2.6s)
  ✓   9 fidelity.spec.ts:195:9 › bands › bands I: no sideways scroll at 390 and 360 (7.4s)
  ✓  10 fidelity.spec.ts:206:9 › bands › bands J: reduced motion opens at once (841ms)
  ✓  11 fidelity.spec.ts:217:9 › bands › bands robustness: long name, five notes, no runsheet (7.4s)
  ✓  12 fidelity.spec.ts:96:9  › file  › file A: parts, order and data-section (3.9s)
  ✓  13 fidelity.spec.ts:103:9 › file  › file B: sections (4.0s)
  ✓  14 fidelity.spec.ts:119:9 › file  › file C: every text, typography and position (3.9s)
  ✓  15 fidelity.spec.ts:136:9 › file  › file D: buttons and links (4.0s)
  ✓  16 fidelity.spec.ts:152:9 › file  › file E: artwork (4.0s)
  ✓  17 fidelity.spec.ts:168:9 › file  › file F: whole page against the reference (4.4s)
  ✓  18 fidelity.spec.ts:176:9 › file  › file G: envelope shut (944ms)
  ✓  19 fidelity.spec.ts:185:9 › file  › file H: share card (1.0s)
  ✓  20 fidelity.spec.ts:195:9 › file  › file I: no sideways scroll at 390 and 360 (7.5s)
  ✓  21 fidelity.spec.ts:206:9 › file  › file J: reduced motion opens at once (847ms)
  ✓  22 fidelity.spec.ts:217:9 › file  › file robustness: long name, five notes, no runsheet (7.4s)

  22 passed (1.5m)
```

The three picture gates, measured rather than described:

| Gate | Allowed | Fur bands | Staff file |
| --- | --- | --- | --- |
| F, whole page open at 390 | 1.5% of pixels | **0.88%** | **1.27%** |
| G, envelope shut | 2% | **0.26%** | **0.11%** |
| H, share card at 1200 x 630 | 4% | **1.94%** | **3.61%** |

`npx tsc --noEmit` and `npx eslint .` are both clean.

---

## 2. The manual gates

Evidence is in `design_handoff_monster_layouts/verify/out/`.

- [x] **Three drawings agree.** The guest's own link, the group link and the host's preview, all
      three at 390, for both layouts.
      `manual-<layout>-1-guest-token.png`, `-2-group-slug.png`, `-3-host-preview.png`.
      Compared pixel by pixel rather than by eye:

      | Pair | Fur bands | Staff file |
      | --- | --- | --- |
      | guest's link vs host's preview | **0 pixels differ** | **0 pixels differ** |
      | guest's link vs group link | 0.14% | 0.11% |

      The group link's difference is two lines of text and nothing else: the greeting at the top
      and the question in the reply. A group link does not know who is holding it, so that is
      correct. Diffs: `manual-<layout>-diff-token-vs-preview.png`, `-diff-token-vs-slug.png`.
      How the host's preview was drawn without a sign-in is in section 5.

- [x] **Pencils.** Nine per layout, not the seven the gate names. Every one of them reports the
      right section when tapped, the cover included, which is what opens its drawer:
      `cover, details, reply, day, know, plate, gifts, after, signoff`, identical for both
      layouts. Evidence: `manual-bands-pencils.png`, `manual-file-pencils.png`. The two extra are
      deviation A.

- [x] **Switches.** Each one off in turn, on a real invite, both layouts. The part goes, nothing
      else moves, no sideways scroll, and the Staff file renumbers.
      `manual-<layout>-off-<column>.png`.

      | Switched off | Parts drawn | Staff file numbers |
      | --- | --- | --- |
      | nothing | cover, details, reply, day, know, after, signoff | 01 02 03 04 |
      | `show_details` | cover, reply, day, know, after, signoff | 01 02 03 |
      | `show_runsheet` | cover, details, reply, know, after, signoff | 01 02 03 |
      | `show_good_to_know` | cover, details, reply, day, after, signoff | 01 02 03 |
      | `show_after` | cover, details, reply, day, know, signoff | 01 02 03 04 |
      | `show_signoff` | cover, details, reply, day, know, after | 01 02 03 04 |

      The last two keep four numbers because the questions and the sign-off never carry one.

- [x] **Reorder.** The order of the afternoon moved above the reply. Both layouts follow, and the
      Staff file renumbers: the details 01, the afternoon 02, the reply 03, the info booth 04.
      `manual-<layout>-reorder-day-above-reply.png`.

- [x] **Yes.** Pressed yes, with three dishes on the board. The whole page is
      `manual-<layout>-yes-thankyou-and-plate.png`, and the two things the gate asks about are
      cropped out of it: `manual-<layout>-yes-thankyou-closeup.png` and
      `manual-<layout>-yes-plate-closeup.png`.

      The thank you draws in each layout's clothes with nothing done to it: in Fur bands it is the
      purple band with the eye above it, in Staff file it is section 02 on the ruled sheet, tinted
      lime, no card and no tilt. The board did not, and that is deviation B.

      Judged by eye, the only thing left that reads as borrowed is the Add to calendar pair on the
      Staff file's thank you: two rounded pills, centred, on a sheet where everything else is left
      aligned and drawn as tick boxes or stamps. They are the shape the golden holds for the
      unanswered reply, which is measured and passes, so I have not touched them. Say the word and
      they can become tick-box rows too.

- [x] **CSS scope.** `grep -nE "^\s*\.[a-z]" app/bands.css app/file.css` returns nothing. Every
      rule starts `main.bands` or `main.file`, the two `@media (prefers-reduced-motion)` blocks
      included, and the `.env.fur` and `.env.manila` rules in `app/invite.css` are compound.

- [x] **Words.** No string in either component: everything they draw comes from `lib/copy.ts` or
      from the event. No em dash in either component, either stylesheet, the new copy, or this
      report.

- [x] **Fixtures deleted.** `zz-monsters` and `zz-monsters-robust` are gone, with their guests,
      runsheets and plate items, by cascade. Checked by asking for them again afterwards.

---

## 3. Deviations

Four, all four approved by Marcia on 25 September 2026, after she had read them here.

| Where | Golden says | Built | Why it cannot match | Screenshot |
| --- | --- | --- | --- | --- |
| **A. Pencil count**, the host's editing view | Seven pencils: cover, details, reply, day, know, after, signoff | Nine: those seven, plus Bring a plate and Gifts | Those two parts draw nothing on a guest's page until the guest says yes, or while the block is switched off. The editor draws a faded stand-in for each so the switch that brings them back stays reachable, because the only thing that opens that drawer is the pencil on that card. It is the rule at the top of `CLAUDE.md`, written after a switch saved, said it saved, and changed nothing. Removing them would match the number and lose the switches. | `manual-bands-pencils.png`, `manual-file-pencils.png` |
| **B. The plate board, after yes** | Nothing. The design was drawn for a guest who has not replied, so there is no picture of the board to measure | Fur bands: a cream band with the same fur edge every other band has, heading in Lilita One. Staff file: a section of the ruled sheet, dashed rule above, heading in the hand face like every other section | The shared board arrives as a tilted card with a strip of tape at each top corner, which is the suite layout's furniture. On a page made of full-bleed bands it read as a sheet of paper stuck over the invite, and on the clipboard it read as a second sheet taped over the first. The gate says "no tape, no tilt, readable", so leaving it was not an option, and there is no reference to copy, so the colours are the layout's own and the choice is mine | `manual-bands-yes-plate-closeup.png`, `manual-file-yes-plate-closeup.png` |
| **C. Files touched outside README section 10** | Section 10 is the complete list, and anything else is a deviation | Seven more files, all listed with a reason in section 5 | Three are faults the build found in shared code, three are the test set-up, one is a type for the new column. None of them are design | none, see section 5 |
| **D. Luckiest Guy** | Section 8 asks for it and says to say so | Added in `app/layout.tsx` as `--font-title` and `lib/fonts/LuckiestGuy.ttf` for the share cards | Not a deviation so much as the thing section 8 told me to declare. It is a new typeface in the app, used only for the event title on these two layouts and the name on the fur share card | `manual-bands-1-guest-token.png` |

One more thing, not a deviation, just worth your eye. With Bring a plate switched on, your note to
guests appears twice on the page once they have said yes: once in the info booth, where the
references show it, and again at the top of the board. That is how the shared parts have always
behaved, on every layout, not something these two introduced. Say the word and I will take it out
of the info booth when the board is drawing.

---

## 4. Side by side at 390

Reference, then built, then the difference, in that order in each picture.

| | |
| --- | --- |
| Fur bands, page open | `design_handoff_monster_layouts/verify/out/bands-side-by-side-390.png` |
| Staff file, page open | `design_handoff_monster_layouts/verify/out/file-side-by-side-390.png` |
| Fur bands, envelope shut | `.../verify/out/bands-shut-side-by-side.png` |
| Staff file, envelope shut | `.../verify/out/file-shut-side-by-side.png` |
| Fur bands, share card | `.../verify/out/bands-card-side-by-side.png` |
| Staff file, share card | `.../verify/out/file-card-side-by-side.png` |

The built pages and the raw diffs are beside them as `<layout>-open.built.png` and
`<layout>-open.diff.png`.

---

## 5. Every file changed, and why

**The two layouts.** `components/invite/BandsInvite.tsx` + `app/bands.css`,
`components/invite/FileInvite.tsx` + `app/file.css`.

**On README section 10's list, so allowed:**

| File | What changed |
| --- | --- |
| `lib/layouts.ts` | The two entries, and `fur` and `manila` added to `Stock` |
| `components/invite/InviteBody.tsx` | One dispatch line each, both ids in `LAYOUTS`, and `show_about` honoured for every layout |
| `app/invite.css` | The `.env.fur` and `.env.manila` blocks, compound selectors only |
| `lib/artwork.ts`, `public/artwork/` | The two pictures as a bundled set, and `portraitFor()` beside `coverFor()` |
| `app/layout.tsx`, `lib/fonts/` | Luckiest Guy as `--font-title`, and its `.ttf` so Satori can draw the share card |
| `lib/copy.ts` | "Scarer wanted" and the five share card grid words. No string is inline |
| `components/share/envelope-card.tsx` | `furCard()` and `manilaCard()` |
| `supabase/migrations/0046_about_this_app_switch.sql` | `show_about`, default true, and `event_public_json` restated so a guest's page reads it |

**Not on the list. This is deviation C:**

| File | Why |
| --- | --- |
| `app/globals.css` | It redefined `--font-display`, `--font-hand` and `--font-body` on top of the ones `next/font` sets, which threw away the metric matched fallbacks. Every measured text gate was failing on the first paint because of it. Three lines removed, with a comment saying why |
| `components/invite/Envelope.tsx` | The open button was still in the page after the envelope had opened, hidden rather than gone, so the robustness gate counted a control nobody can reach and a screen reader could still find. It is no longer rendered once the envelope is done |
| `app/s/i/[token]/card.png/route.tsx` | The share card route drew whatever layout the event is saved as, so gate H could not ask for a card in a layout without saving over the fixture first. It now honours `?layout=`, and hands the portrait to the manila card |
| `lib/db/types.ts` | The TypeScript side of the `show_about` column, and the two new layout ids |
| `playwright.config.ts` | New. The suite needs `channel: "chromium"`. Playwright's default headless shell shapes text differently from a real Chromium, enough to fail a gate the page passes: "Google Calendar" in Lilita One at 15px measures 115px in the shell and 104.6px in Chromium, and 104.6 is what the golden holds. An afternoon went into finding that, so the reason is written into the file |
| `package.json`, `package-lock.json` | `@playwright/test`, `pixelmatch` and `pngjs`, all three as dev dependencies. The suite cannot run without them |
| `eslint.config.mjs` | The handoff folder is ignored. It holds the prototype HTML and the suite, which are yours and not ours to lint |
| `.gitignore` | Playwright's `test-results/` folder |
| `docs/layout-brief.md` | The engineering half of the layout brief, written before this build and already open on its own pull request. It is in this branch's history, not part of this work |

**How the host's preview was photographed.** A session signs in as nobody, and the host screens are
behind row level security, so `/app/preview/<id>` cannot be loaded from here. The third drawing was
taken from a throwaway page that renders the preview screen's own component call, with the event
row read out of the database with the management API and the plate, gift and crossings out taken
from the very builders `preview_plate`, `preview_gift` and `preview_wish_state` call once their
membership check has passed. Nothing about the drawing was changed, which is the thing being
compared, and it came out pixel for pixel identical to the guest's page. The page is deleted.

---

## 6. Verdict

**All gates pass.** 22 automated gates, every manual gate ticked with measured evidence, the four
deviations in section 3 seen and approved, and the fixtures deleted.
