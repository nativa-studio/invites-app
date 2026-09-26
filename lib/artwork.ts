// The pictures that belong to one event's artwork.
//
// Until hosts can upload a set of their own, a set is bundled here against the file it was cut
// from: events.invite_image_path names the set, and each layout asks this module for the piece
// it needs. The cover wants a poster, the lineup and the envelope want a band to stand
// along. Artwork with no set here gets no picture, which every layout is built to
// survive. Once uploads are wired, these come from Storage and their sizes from the conversion
// step, and nothing in the layouts has to change.

export type Picture = {
  src: string; w: number; h: number;
  /** Which part of a tall picture a square frame should hold, when the stylesheet's own default
   *  lands in the wrong place. A set's problem rather than a layout's: the Monsters portrait is a
   *  character standing, and Gabriel's is a poster with a face across the foot of it, so one
   *  number in a stylesheet cannot serve both. Absent means the stylesheet decides. */
  pos?: string;
};

const GABRIEL = "/artwork/gabriel-lineup.png";
// The second bundled set, for the Monsters designs. Two pictures rather than one: the pair stand
// on the cover of Fur bands and again as the sticker on its envelope, and the single character is
// the photograph on the Staff file pass and the polaroid clipped to its envelope. Marcia's own
// pictures for a private party, the same standing as the Pikachu set: bundled for the pilot only.
const MONSTERS = "/artwork/monsters-pair.png";

// Four pictures make a set, one per place a design puts characters, and a design should never
// show the same picture as the design beside it in the gallery. That is the rule these four maps
// are for, and it is easy to break by accident: a role with no picture of its own borrows from
// another role, quietly, and two designs come out wearing one photograph.
//
//                | poster (Photo cards) | band (Fur bands) | square (Staff file) | sticker
//   Pikachu      | gabriel-cover        | gabriel-lineup   | pikachu-head        | gabriel-lineup
//   Monsters     | monsters-mike        | monsters-pair    | monsters-mike       | monsters-pair
//
// The two repeats left are both in the Monsters set, which has two pictures for four places. It
// needs one more: a tall one of the pair, or of Sulley on his own, for the poster. Until it
// arrives the poster borrows the square, which at least differs from the design next to it.

/** The poster at the top of the cover card. Marcia's own, shown whole and cropped by the frame. */
const COVERS: Record<string, Picture> = {
  [GABRIEL]: { src: "/artwork/gabriel-cover.jpg", w: 1012, h: 1934 },
  // Mike standing, not the pair. The pair is what Fur bands stands on its cover, so with the pair
  // here the two designs sat side by side in the gallery showing one photograph twice.
  [MONSTERS]: { src: "/artwork/monsters-mike.jpg", w: 606, h: 1280 },
};

/** A square photograph of one character, for a pass or a polaroid. Only the sets that have one:
 *  the lineup band is a row of characters and cropping it square gives half of two of them. */
const PORTRAITS: Record<string, Picture> = {
  [MONSTERS]: { src: "/artwork/monsters-mike.jpg", w: 606, h: 1280 },
  // This set's own head, cut out, from the peek cast. It was the poster held at its foot for a
  // moment, which put the same photograph on the Staff file pass and on the Photo cards cover.
  // A set with a picture for every place does not have to borrow, and this one has eight of its
  // characters cut out already.
  [GABRIEL]: { src: "/artwork/gabriel-peek/pikachu-head.png", w: 340, h: 420 },
};

/** The band the lineup stands along the bottom of its cover. */
const BANDS: Record<string, Picture> = {
  [GABRIEL]: { src: GABRIEL, w: 1173, h: 420 },
  [MONSTERS]: { src: MONSTERS, w: 680, h: 650 },
};

/** The characters that stand along the envelope. The same band the lineup layout uses. */
const MASCOTS: Record<string, Picture> = {
  [GABRIEL]: { src: GABRIEL, w: 1173, h: 420 },
  [MONSTERS]: { src: MONSTERS, w: 680, h: 650 },
};

// There is one bundled set, so an event that has not named one gets it rather than getting
// nothing. Asking a host to pick artwork from a list of one only ever produced invites with the
// pictures missing. When uploads land, an event names its own set and this fallback goes.
const set = (artwork: string | null | undefined) => artwork || GABRIEL;

export function coverFor(artwork: string | null | undefined): Picture | null {
  return COVERS[set(artwork)] ?? null;
}

export function bandFor(artwork: string | null | undefined): Picture | null {
  return BANDS[set(artwork)] ?? null;
}

export function mascotFor(artwork: string | null | undefined): Picture | null {
  return MASCOTS[set(artwork)] ?? null;
}

/** The square photograph, for the staff pass and the polaroid on its envelope. Null for a set
 *  with no single character in it, and both places are built to draw without one. */
export function portraitFor(artwork: string | null | undefined): Picture | null {
  return PORTRAITS[set(artwork)] ?? null;
}

/** The bundled sets, by the short name a link and the picker ask for them by. */
const SETS: Record<string, string> = { gabriel: GABRIEL, monsters: MONSTERS };

/** The sets a host can pick between, in the order they are offered.
 *
 *  public/artwork/README.md says nothing in that folder belongs in a gallery offered to every
 *  host, and that rule still stands for anything shipped. This picker is a deliberate exception,
 *  asked for by name while Marcia builds the library: two sets of her own, on her own app, so a
 *  design can be looked at in the pictures it was drawn around rather than in the other one's.
 *  When the real gallery lands, with drawings the product owns, this list is what it replaces,
 *  and these two go back to being one event's artwork. */
export const ARTWORK_SETS: { id: string; path: string; picture: Picture }[] = [
  { id: "gabriel", path: GABRIEL, picture: { src: GABRIEL, w: 1173, h: 420 } },
  { id: "monsters", path: MONSTERS, picture: { src: MONSTERS, w: 680, h: 650 } },
];

/** Which set an event's saved path is, for opening the picker on the right one. */
export function artworkId(artwork: string | null | undefined): string {
  return ARTWORK_SETS.find((a) => a.path === set(artwork))?.id ?? ARTWORK_SETS[0].id;
}

/** `?art=` on an invite link, for looking only.
 *
 *  A layout is drawn with the artwork its event names, and the two Monsters layouts were designed
 *  around pictures no event names yet, so opening one of them shows the design in somebody else's
 *  clothes. This is the same escape hatch `?layout=` already is: it overrides the picture for one
 *  view of one page, writes nothing, and an unknown name is ignored rather than drawing a gap.
 *
 *  It is deliberately not a picker. These sets are event artwork, Marcia's own pictures for one
 *  private party, and public/artwork/README.md is clear that nothing in that folder is offered to
 *  another host. A link somebody has to type themselves is not an offer. */
export function asArtwork(v: string | undefined): string | undefined {
  return v ? SETS[v] : undefined;
}
