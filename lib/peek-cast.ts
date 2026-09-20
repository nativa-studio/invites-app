// The peek layout wants a cast: separate cut-out characters that lean on the page from the
// edges, rather than one picture in a box. Until hosts can upload a set of their own, a cast
// is bundled against the artwork it was cut from, and any other artwork gets no characters,
// which the layout is built to survive.

export type PeekChar = { src: string; w: number; h: number; alt: string };

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

const g = (name: string, w: number, h: number, alt: string): PeekChar => ({ src: `/artwork/gabriel-peek/${name}.png`, w, h, alt });

const GABRIEL: PeekCast = {
  topLeft: g("bulbasaur", 200, 365, ""),
  topRight: g("charmander", 250, 301, ""),
  hero: g("pikachu", 533, 427, ""),
  details: g("squirtle", 281, 374, ""),
  day: g("eevee", 364, 492, ""),
  know: g("jigglypuff", 267, 420, ""),
  reply: g("psyduck", 280, 389, ""),
};

const CASTS: Record<string, PeekCast> = {
  "/artwork/gabriel-lineup.png": GABRIEL,
};

// There is one bundled set, so an event that has not named artwork gets it rather than getting
// nothing. Same fallback lib/artwork.ts uses for the cover and the band, and for the same reason:
// every event in the database carries null here, so a strict lookup meant no characters at all.
export function castFor(artwork: string | null | undefined): PeekCast {
  return CASTS[artwork || "/artwork/gabriel-lineup.png"] ?? {};
}
