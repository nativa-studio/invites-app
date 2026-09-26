import "@/app/file.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { portraitFor } from "@/lib/artwork";

// The Staff file cover, the pass on its lanyard, in a file of its own. Same reason as BandsCover,
// which has the long version of it: a guest's invite draws this and so does the tile in the
// host's Design gallery, and the host app should not import a whole layout to get one cover.

export function FileCover({ event: e }: { event: PublicEvent }) {
  const face = portraitFor(e.invite_image_path);
  return (
    <div className="cover" data-section="cover">
      <div className="pass-group">
        <span className="lanyard" aria-hidden="true"><i className="strap l" /><i className="strap r" /></span>
        <span className="crimp" aria-hidden="true" />
        <span className="ring" aria-hidden="true" />
        <span className="tab" aria-hidden="true" />
        <div className="pass">
          <div className="top">
            <span className="slot" aria-hidden="true" />
            <span className="eyebrow">{copy.sections.scarerWanted}</span>
          </div>
          <div className="body">
            {face && (
              <div className="photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={face.src} alt="" width={face.w} height={face.h} style={face.pos ? { objectPosition: face.pos } : undefined} />
              </div>
            )}
            <h1>{e.title}</h1>
            {e.intro && <p className="intro">{e.intro}</p>}
          </div>
          <span className="foot" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
