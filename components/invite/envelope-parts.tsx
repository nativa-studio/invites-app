import type { PublicEvent } from "@/lib/db/types";
import { Mono } from "@/components/art/mono";
import { mascotFor, portraitFor, type Picture } from "@/lib/artwork";
import { stripSet } from "@/lib/strip-set";
import { Eye } from "./BandsEye";
import { Closure } from "./FileClosure";

// What each design puts on its envelope: the mark on the seal, and whether characters stand
// along it.
//
// Here rather than inside each layout because two screens draw that envelope. A guest sees the
// real one on their invite, and the host sees it again behind the cover in every tile of the
// Design gallery. The tile used to build its own: back, pocket and flap, and no seal at all, so
// the manila envelope came out as a plain beige band with no tie on it and the fur one had no eye.
// Nobody could see it was wrong, because nothing draws those two side by side except the gallery.
//
// Marcia, pointing at the real one and then at the tile: use this envelope here.

/** The mark on the seal. Undefined means the shared default, which is the suite's bolt. */
export function sealFor(layout: string | null | undefined, e: PublicEvent): React.ReactNode | undefined {
  if (layout === "bands") return <Eye size={24} bare />;
  if (layout === "file") return <Closure face={portraitFor(e.invite_image_path)?.src ?? null} />;
  // The strip's wax carries the middle doodle of the event's own set, so a Diwali invite is
  // sealed with a diya and a birthday with a cake.
  if (layout === "strip") return <Mono name={stripSet(e.strip_set, e.theme_id).trio[1]} size={26} />;
  return undefined;
}

/** The characters standing along the envelope, for the designs that have them there.
 *
 *  Only the two that do. Fur bands puts its sticker on with a custom property from the page, and
 *  the Staff file clips a polaroid to its tie, so handing either a mascot as well would put the
 *  same characters on one envelope twice. */
export function envelopeMascot(layout: string | null | undefined, e: PublicEvent): Picture | null {
  if (layout === "bands" || layout === "file" || layout === "strip") return null;
  return mascotFor(e.invite_image_path);
}
