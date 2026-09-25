import { defineConfig, devices } from "@playwright/test";

// How the fidelity suite is run. The suite itself is Marcia's approval, measured, and is not ours
// to touch: this says which browser to run it in and nothing else.
//
// `channel: "chromium"` matters more than it looks. Playwright's default for a headless run is the
// headless shell, a cut-down build, and it shapes text differently from a real Chromium: the same
// page, the same fonts, the same CSS, and "Google Calendar" in Lilita One at 15px measures 115px
// in the shell and 104.6px in full Chromium. The approved design was measured in a real browser,
// so 104.6 is what the golden holds and the shell fails a gate the page passes. An afternoon went
// into finding that, hence this comment.
export default defineConfig({
  testDir: "design_handoff_monster_layouts/verify",
  reporter: "list",
  // The gates are slow (a page load, an envelope, a screenshot each) and they share one server.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices["Desktop Chrome"],
    channel: "chromium",
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
  },
});
