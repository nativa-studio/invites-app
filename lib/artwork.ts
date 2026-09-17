// The pictures that belong to one event's artwork.
//
// Until hosts can upload a set of their own, a set is bundled here against the file it was cut
// from: events.invite_image_path names the set, and each layout asks this module for the piece
// it needs. The cover wants a poster, the lineup wants a band to stand along, the peek wants
// cut-out characters. Artwork with no set here gets no picture, which every layout is built to
// survive. Once uploads are wired, these come from Storage and their sizes from the conversion
// step, and nothing in the layouts has to change.

export type Picture = { src: string; w: number; h: number };

export type PeekChar = Picture & { alt: string };

export type PeekCast = {
  /** The two that lean in over the title. */
  topLeft?: PeekChar;
  topRight?: PeekChar;
  /** The one that climbs up from under the cover. */
  hero?: PeekChar;
  /** One per section, alternating sides down the page. */
  details?: PeekChar;
  day?: PeekChar;
  know?: PeekChar;
  reply?: PeekChar;
};

const GABRIEL = "/artwork/gabriel-lineup.png";

const g = (name: string, w: number, h: number, alt: string): PeekChar => ({ src: `/artwork/gabriel-peek/${name}.png`, w, h, alt });

/** The poster at the top of the cover card. Marcia's own, shown whole and cropped by the frame. */
const COVERS: Record<string, Picture> = {
  [GABRIEL]: { src: "/artwork/gabriel-cover.jpg", w: 1200, h: 2400 },
};

/** The band the lineup stands along the bottom of its cover. */
const BANDS: Record<string, Picture> = {
  [GABRIEL]: { src: GABRIEL, w: 1173, h: 420 },
};

const CASTS: Record<string, PeekCast> = {
  [GABRIEL]: {
    topLeft: g("bulbasaur", 200, 365, ""),
    topRight: g("charmander", 250, 301, ""),
    hero: g("pikachu", 533, 427, ""),
    details: g("squirtle", 281, 374, ""),
    day: g("eevee", 364, 492, ""),
    know: g("jigglypuff", 267, 420, ""),
    reply: g("psyduck", 280, 389, ""),
  },
};

export function coverFor(artwork: string | null | undefined): Picture | null {
  return (artwork && COVERS[artwork]) || null;
}

export function bandFor(artwork: string | null | undefined): Picture | null {
  return (artwork && BANDS[artwork]) || null;
}

export function castFor(artwork: string | null | undefined): PeekCast {
  return (artwork && CASTS[artwork]) || {};
}
