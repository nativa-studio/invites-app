// The illustrated strip: which pictures, which ink, which paper.
//
// This is the design from round one, `design/round1/StripPoolParty.dc.html` and the three beside
// it, carried into the app. Its whole idea is in the annotation on that board: one skeleton for
// every event, and what changes between events is the illustration set and the ink colour, never
// the order. So everything that varies is here, in a table, rather than spread through the
// layout: six sets of pictures, one ink each, one paper tint each.
//
// Data and no JSX on purpose. The host's design picker is a server screen and the invite is a
// server screen, and both need to know what a set is called. The pictures themselves are in
// `components/art/mono.tsx`, which is where the drawing goes.

/** The five inks the brief names, plus the two already saved on real events. */
const INKS: Record<string, string> = {
  charcoal: "#1F1B17",
  olive: "#4F6B4A",
  terracotta: "#9C4A22",
  cobalt: "#2C2A5A",
  burgundy: "#6E2430",
  sage: "#4F6B4A",
  navy: "#1B2A4A",
};

/** The paper a set is printed on. A tint of its own ink, never white: the mocks are all warm. */
const PAPERS: Record<string, string> = {
  charcoal: "#FBF6EC",
  olive: "#F6F8F2",
  terracotta: "#FBF4EE",
  cobalt: "#F7F4FB",
  burgundy: "#FBF3F4",
  sage: "#F6F8F2",
  navy: "#F4F6FA",
};

// Type-only, so this module still pulls in nothing at runtime: it is the picture names, checked.
import type { MonoName } from "@/components/art/mono";

export type StripSet = {
  id: string;
  name: string;
  /** The three pictures standing over the title. The cover, and the only picture above the fold. */
  trio: [MonoName, MonoName, MonoName];
};

// Six sets, keyed by the theme a host has already chosen. The event type picks the theme at
// creation, so a host who has touched nothing still gets the right three pictures: a pram on a
// baby shower, a candle on a memorial, balloons on a birthday.
const SETS: Record<string, StripSet> = {
  birthday: { id: "birthday", name: "Birthday", trio: ["balloon", "cake", "bunting"] },
  summer: { id: "summer", name: "Summer", trio: ["sun", "ring", "glasses"] },
  baby: { id: "baby", name: "Baby", trio: ["bunting", "pram", "leaf"] },
  quiet: { id: "quiet", name: "Quiet", trio: ["leaf", "candle", "leaf"] },
  night: { id: "night", name: "A night out", trio: ["glasses", "disco", "glasses"] },
  home: { id: "home", name: "Home and family", trio: ["leaf", "plate", "cup"] },
};

const FALLBACK: StripSet = SETS.birthday;

/** Every set, for a picker to offer. */
export const STRIP_SETS: StripSet[] = Object.values(SETS);

/** The pictures for an event. A theme with no set of its own gets the birthday one rather than
 *  nothing: three pictures is the cover, and an invite with no cover is not an invite. */
export function stripSet(themeId: string | null | undefined): StripSet {
  return SETS[themeId ?? ""] ?? FALLBACK;
}

export function inkFor(ink: string | null | undefined): string {
  return INKS[ink ?? ""] ?? INKS.charcoal;
}

export function paperFor(ink: string | null | undefined): string {
  return PAPERS[ink ?? ""] ?? PAPERS.charcoal;
}
