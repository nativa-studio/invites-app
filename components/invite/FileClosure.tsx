import "@/app/file.css";

// The envelope's closure, which is a string-and-button tie rather than a wax seal, with the
// polaroid of the character clipped beside it. Both hang off this one node because the envelope
// gives a seal a place and a mascot a place, and the polaroid needs the seal's.
export function Closure({ face }: { face: string | null }) {
  return (
    <span className="tie" aria-hidden="true">
      {/* The string, wound in a figure of eight between the two buttons. One path, drawn rather
          than described, because two curves crossing is not a thing CSS has. */}
      <svg className="string" viewBox="0 0 60 120" width="60" height="120">
        <path d="M30 22 C 6 42, 54 62, 30 94 M30 22 C 54 42, 6 62, 30 94" fill="none" stroke="#8A6A30" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="button top"><span className="pupilled"><i /></span></span>
      <span className="button bottom" />
      {face && (
        <span className="polaroid">
          {/* A background rather than an img on purpose. The same picture is the photograph on
              the pass, and while the envelope is shut the pass is in the card slot and this is
              on the seal: two elements with one filename. Anything looking for that picture on
              the page finds whichever comes first in the document, and once the envelope is open
              this one is inside a hidden stage and measures nothing at all. */}
          <span className="pic" style={{ backgroundImage: `url(${face})` }} />
          <i className="paperclip a" />
          <i className="paperclip b" />
        </span>
      )}
    </span>
  );
}

// In a file of its own for the same reason as BandsEye: the invite draws this seal and so does
// the envelope on the Design gallery's tile.
