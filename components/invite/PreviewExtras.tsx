import { copy } from "@/lib/copy";

// The plate board and the gift block, as the host's preview draws them while editing.
//
// The guest's versions of these are live: they claim dishes and tick that they have paid, and
// both need a token the host does not have. So these are drawn rather than wired, the same trick
// the reply card uses: show the thing, do not describe it. Pressing them for real is what the
// guest view is for.
//
// data-section is the whole point of them. Without a card on the editing side there was nothing
// to tap, so the one way to change what these say was to remember which tab they lived on. The
// names match the entries in sections.tsx, the same as every other card.
export function PreviewPlate({ note, mode, off }: { note: string | null; mode: string; off?: boolean }) {
  return (
    <div className={`pcard tilt-r plate${off ? " off" : ""}`} data-section="plate">
      <div className="tape tl" />
      <div className="tape tr" />
      <div className="label red">{copy.plate.heading}</div>
      <p className="para">{note || (mode === "everyone" ? copy.plate.everyone : copy.plate.free)}</p>
      <div className="small">{off ? copy.host.blockOff : copy.host.previewPlate}</div>
    </div>
  );
}
