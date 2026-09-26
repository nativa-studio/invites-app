import "@/app/strip.css";
import type { PublicEvent } from "@/lib/db/types";
import { Mono } from "@/components/art/mono";
import { stripSet } from "@/lib/strip-set";

// The Illustrated strip's cover, in a file of its own, for the same reason as BandsCover: a
// guest's invite draws it and so does the tile in the host's Design gallery.
//
// The gallery used to build its own likeness of this one, a span with the three doodles and the
// title in it, which drifted from the real cover the moment either changed. Now there is one.

/** Three doodles and the title, and no photograph. One element around all three, because
 *  data-section is the handle the host's editor edits by, and the drawer behind it holds the
 *  title and the line under it: marked on the doodles alone, tapping the title did nothing, and
 *  the title is the one place on a cover a host is most likely to tap. */
export function StripCover({ event: e }: { event: PublicEvent }) {
  const set = stripSet(e.strip_set, e.theme_id);
  return (
    <div className="cover" data-section="cover">
      <div className="trio">
        {set.trio.map((n, i) => <Mono key={i} name={n} size={56} />)}
      </div>
      <h1>{e.title}</h1>
      {e.intro && <p className="para">{e.intro}</p>}
    </div>
  );
}
