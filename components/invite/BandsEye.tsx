import "@/app/bands.css";

// The eye. Three rings: white, then the iris, then the pupil, and nothing about it is text.
//
// It is the one piece of furniture this design has instead of cards, and it appears three times
// at three sizes: half over the top edge of the reply band, small at the top of the sign-off, and
// on the envelope's seal. `bare` is the seal's, which sits inside a seal that already has the
// white disc and the ring.
export function Eye({ size, bare }: { size: number; bare?: boolean }) {
  // Bare is the seal's: there the envelope already draws the white disc and the ink ring, so the
  // eye is the iris itself rather than an eye with a white of its own.
  const iris = bare ? size : Math.round(size * 0.5);
  const pupil = Math.round(size * (bare ? 0.46 : 0.21));
  return bare ? (
    <span className="eye bare" aria-hidden="true" style={{ width: iris, height: iris }}>
      <span className="pupil" style={{ width: pupil, height: pupil }} />
    </span>
  ) : (
    <span className="eye" aria-hidden="true" style={{ width: size, height: size }}>
      <span className="iris" style={{ width: iris, height: iris }}>
        <span className="pupil" style={{ width: pupil, height: pupil }} />
      </span>
    </span>
  );
}

// In a file of its own because two screens draw it: the invite, through BandsInvite, and the
// envelope on the Design gallery's tile, which has to carry the same seal the real one does.
