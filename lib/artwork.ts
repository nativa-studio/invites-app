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

/** The poster at the top of the cover card. Marcia's own, shown whole and cropped by the frame. */
const COVERS: Record<string, Picture> = {
  [GABRIEL]: { src: "/artwork/gabriel-cover.jpg", w: 1200, h: 2400 },
};

/** The band the lineup stands along the bottom of its cover. */
const BANDS: Record<string, Picture> = {
  [GABRIEL]: { src: GABRIEL, w: 1173, h: 420 },
};

/** The characters that stand along the envelope. The same band the lineup layout uses. */
const MASCOTS: Record<string, Picture> = {
  [GABRIEL]: { src: GABRIEL, w: 1173, h: 420 },
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
