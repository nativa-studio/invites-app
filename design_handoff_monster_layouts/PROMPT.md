# Paste this to Claude Code

Build the two approved invite layouts in `design_handoff_monster_layouts/` (copy the folder into the
repo root first).

1. Read, in this order: `CLAUDE.md`, `uploads/layout-brief.md` (the layout contract),
   `design_handoff_monster_layouts/README.md`, then `design_handoff_monster_layouts/ACCEPTANCE.md`.
2. Build `bands` (Fur bands) and `file` (Staff file) exactly as the README describes, lifting every
   value from `reference/*.html`. Do not build Door station.
3. Create the `zz-monsters` fixture from README section 4, and a second copy for the robustness gate.
4. Run `verify/fidelity.spec.ts` after each part, and again at the end. Every gate must pass.
   Never edit `spec/`, `reference/` or the tolerances in the suite.
5. Anything you cannot match inside the contract is a deviation: write it in `REPORT.md` and stop
   for my answer. Do not approximate it.
6. Write `REPORT.md` as `ACCEPTANCE.md` describes, with the side-by-side screenshots, and only say
   "All gates pass" if they do. Delete the fixtures. Open the pull request and ask me to merge.
