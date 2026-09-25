# Acceptance: when these layouts are done

This file exists because previous handovers came back partly built and described as finished. So the
rule is simple and it is not negotiable:

> **The layout is done when `verify/fidelity.spec.ts` passes in full against the fixture, the manual
> gates below are ticked with evidence, and `REPORT.md` is written. Not before. "It looks right",
> "close enough", "mostly matches" and "should work" are not results.**

If you cannot make a gate pass, you do not change the gate. You write a deviation (below) and stop.

## Rules

1. **Never edit** `spec/golden.json`, `spec/golden-envelopes.json`, anything in `reference/`, or the
   tolerances in `verify/fidelity.spec.ts`. They are Marcia's approval, measured. Changing them to
   pass is the same as not passing.
2. **Read before you type.** Every value comes from `reference/*.html` or `golden.json`. If you are
   about to write a colour, a size or a spacing you cannot point to in one of them, stop and look it up.
3. **Build a part, measure the part.** Run the suite after each part (`--grep "bands details"` and so
   on), not once at the end. Parts are listed in the order they appear on the page.
4. **Every failure is either fixed or declared.** A failing check left out of the report is the one
   thing that will send this back.
5. **Do not special-case the fixture.** No `if (e.slug === "zz-monsters")`, no hard-coded Mia, no
   fixed heights that happen to match. The checks under "Robustness" exist to catch exactly that.

## Automated gates (`verify/fidelity.spec.ts`)

Run with the fixture from README section 4, against `npm run build && npx next start`, never the dev
server:

```
FIXTURE_TOKEN=<Mia's token> FIXTURE_SLUG=zz-monsters BASE_URL=http://localhost:3000 \
  npx playwright test design_handoff_monster_layouts/verify --reporter=list
```

It needs `pixelmatch` and `pngjs` as dev dependencies. For each layout it checks, at 390 × 844:

| # | Gate | Tolerance |
| --- | --- | --- |
| A | Parts appear in the golden order, each carrying `data-section`, one per part, none nested | exact |
| B | Every section: width, left, background colour, background image, padding | box ±1px, height ±4px, colours exact |
| C | Every golden text exists in the right section, with the same font family, size, weight, line height, letter spacing, case, colour and alignment | typography exact; text box position within its section ±2px x, ±3px y; width ±3px |
| D | Every button and link: background, border, radius, shadow, font, size, box | colours exact, box ±2px; 44px minimum height |
| E | Every artwork image: which file, box, fit and position | box ±3px |
| F | Whole page, envelope open, against `reference/<layout>-open-390.png` | page height ±8px; at most 1.5% of pixels differ (pixelmatch threshold 0.1); diff image written to `verify/out/` |
| G | Envelope shut: top of the page against `reference/2a-…` / `2c-…` | at most 2% of pixels differ |
| H | Share card `/s/i/<token>/card.png` against `reference/2b-…` / `2d-…` | 1200 × 630 exactly; at most 4% differ |
| I | No horizontal scroll at 390 and at 360 | `scrollWidth <= clientWidth` |
| J | Reduced motion: envelope opens with no wait | open in under 300ms |

A failing gate prints what it expected, what it found, and where. Fix the cause, re-run everything.

## Manual gates (tick each, with the evidence named)

- [ ] **Three drawings agree.** `/i/<token>`, `/e/zz-monsters` and `/app/preview/<id>?as=guest` look the
      same for both layouts. Evidence: three 390 screenshots per layout in `verify/out/`.
- [ ] **Pencils.** `/app/preview/<id>?edit=1`: one pencil per part, tapping the title opens the cover's
      drawer. Evidence: the count per layout (cover, details, reply, day, know, after, signoff = 7).
- [ ] **Switches.** Each `show_*` off in turn: the part goes, nothing else moves oddly, Staff file
      renumbers. Evidence: one screenshot per switch.
- [ ] **Reorder.** Move day above reply: both layouts follow, Staff file renumbers `01` to `04`.
- [ ] **Yes.** Press yes on the host's screen: the thank you and the plate board draw in the layout's
      clothes, not the suite's (no tape, no tilt, readable). These states were not drawn, so they are
      judged by eye: screenshot them for Marcia and list anything that looks foreign.
- [ ] **CSS scope.** `grep -nE "^\s*\.[a-z]" app/bands.css app/file.css` returns nothing: every rule
      starts `main.bands` or `main.file`. The `.env.fur` / `.env.manila` rules are compound.
- [ ] **Words.** No string in either component; no em dash anywhere a guest or Marcia reads.
- [ ] **Fixture deleted** afterwards.

## Robustness (automated, same suite)

A layout that only matches the fixture is not done. The suite also loads the fixture with a long
name ("Auntie Rose and the Nguyen family"), a fifth info-booth note, and the runsheet switched off,
and checks: no horizontal scroll, no clipped text (every text box inside its section), buttons still
44px, post-its still in two columns.

## Deviations

If the design cannot be built exactly inside the contract (the brief's rules, the shared
components), do not approximate. Add a row to `REPORT.md`:

| Where | Golden says | Built | Why it cannot match | Screenshot |
| --- | --- | --- | --- | --- |

and stop for Marcia's answer before calling it done. A deviation she has approved is a pass. One she
has not seen is a fail.

## REPORT.md (write it at the end, in the repo root of the branch)

1. The full suite output, every line, pass or fail.
2. The ticked manual list with the evidence paths.
3. The deviations table (empty is fine, and is the goal).
4. Side by side at 390, for each layout: reference PNG | built screenshot | diff image.
5. Every file changed outside the two layout files, and why (README section 10 is the allowed list).
6. The sentence "All gates pass" only if they all do. Otherwise, "Not done", followed by what is left.

Then open the pull request and ask Marcia once, plainly: "reply merge it and I will".
