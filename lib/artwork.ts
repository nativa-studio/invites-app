// The pictures that belong to one event's artwork.
//
// Until hosts can upload a set of their own, a set is bundled here against the file it was cut
// from: events.invite_image_path names the set, and each layout asks this module for the piece
// it needs. The cover wants a poster, the lineup and the envelope want a band to stand
// along. Artwork with no set here gets no picture, which every layout is built to
// survive. Once uploads are wired, these come from Storage and their sizes from the conversion
// step, and nothing in the layouts has to change.

export type Picture = { src: string; w: number; h: number };

const GABRIEL = "/artwork/gabriel-lineup.png";
// The second bundled set, for the Monsters designs. Two pictures rather than one: the pair stand
// on the cover of Fur bands and again as the sticker on its envelope, and the single character is
// the photograph on the Staff file pass and the polaroid clipped to its envelope. Marcia's own
// pictures for a private party, the same standing as the Pikachu set: bundled for the pilot only.
const MONSTERS = "/artwork/monsters-pair.png";

/** The poster at the top of the cover card. Marcia's own, shown whole and cropped by the frame. */
const COVERS: Record<string, Picture> = {
  [GABRIEL]: { src: "/artwork/gabriel-cover.jpg", w: 1012, h: 1934 },
  [MONSTERS]: { src: MONSTERS, w: 680, h: 650 },
};

/** A square photograph of one character, for a pass or a polaroid. Only the sets that have one:
 *  the lineup band is a row of characters and cropping it square gives half of two of them. */
const PORTRAITS: Record<string, Picture> = {
  [MONSTERS]: { src: "/artwork/monsters-mike.jpg", w: 606, h: 1280 },
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
