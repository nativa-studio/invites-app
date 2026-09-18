import Image from "next/image";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { coverFor } from "@/lib/artwork";
import { formatInviteDate, formatTimeRange, formatTime } from "@/lib/format";
import { ICONS, Bubble, Camera, Gift, Kids, Plate, Cap, Cake } from "@/components/art/icons";

export function mapsLink(e: PublicEvent): string | null {
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

// data-section on each card is the handle the host's preview edits by: tap a card there and the
// drawer knows which part of the invite you meant. The names are the contract, so they match the
// sections a host is offered. A guest page carries the attribute and nothing reads it.
//
// The cover: the host's own picture at the top, then everything a guest needs to decide whether
// to come. The picture is theirs. Nothing here is drawn for them.
export function CoverCard({ e }: { e: PublicEvent }) {
  const age = e.title.match(/turning (\d+)/i)?.[1];
  const art = coverFor(e.invite_image_path);
  return (
    <div className="pcard tilt-l" data-section="cover">
      <div className="tape" />
      {art && (
        <div className="art">
          <Image src={art.src} alt="" width={art.w} height={art.h} priority sizes="(max-width: 430px) 100vw, 340px" />
        </div>
      )}
      <div className="eyebrow">{age ? copy.envelope.eyebrowBirthday : copy.greetingGroup}</div>
      <div className="title">{e.title}</div>
      {e.intro && <div className="intro">{e.intro}</div>}
      <div className="rule" />
      <div className="para">{formatInviteDate(e.date)}<br />{formatTimeRange(e.start_time, e.end_time, e.time_note)}</div>
      {e.venue && <div className="where">{e.venue}</div>}
      {e.host_line && <div className="small">{e.host_line}</div>}
    </div>
  );
}

export function DetailsCard({ e }: { e: PublicEvent }) {
  const maps = mapsLink(e);
  return (
    <div className="pcard white tilt-r" data-section="details">
      <div className="label red">{copy.sections.details}</div>
      <div className="kv">
        <div className="k">{copy.sections.when}</div><div>{formatInviteDate(e.date)}, {formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase()}</div>
        <div className="k">{copy.sections.where}</div><div>{e.venue}{e.address ? <><br />{e.address}</> : null}</div>
        {e.what_to_bring && <><div className="k">{copy.sections.wear}</div><div>{e.what_to_bring}</div></>}
      </div>
      {maps && <a className="pill-link" href={maps} target="_blank" rel="noreferrer">{copy.sections.openInMaps}</a>}
    </div>
  );
}

export function DayCard({ e }: { e: PublicEvent }) {
  if (!e.runsheet.length) return null;
  return (
    <div className="pcard cream tilt-l" data-section="day">
      <div className="label sky">{copy.sections.afternoon}</div>
      <div className="stops">
        {e.runsheet.map((s, i) => {
          const Icon = ICONS[s.icon ?? ""] ?? Cap;
          return (
            <div className="stop" key={i}>
              <div className="t">{formatTime(s.time)}</div>
              <div><Icon size={52} /></div>
              <div><div className="n">{s.title}</div>{s.note && <div className="b">{s.note}</div>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KnowCard({ e }: { e: PublicEvent }) {
  const lines: { icon: React.ReactNode; text: string }[] = [];
  if (e.serve_text) lines.push({ icon: /cake/i.test(e.serve_text) ? <Cake /> : <Plate />, text: e.serve_text });
  if (e.plate_enabled && e.plate_host_note) lines.push({ icon: <Plate />, text: e.plate_host_note });
  if (e.type === "kids_party") {
    if (e.parents_mode === "stay") lines.push({ icon: <Kids />, text: e.siblings_welcome ? `${copy.lines.parentsStay} ${copy.lines.siblingsWelcome}` : copy.lines.parentsStay });
    if (e.parents_mode === "drop_off") lines.push({ icon: <Kids />, text: copy.lines.dropOff });
  }
  if (e.gift_stance === "none") lines.push({ icon: <Gift />, text: copy.lines.giftsNone });
  if (e.gift_stance === "optional") lines.push({ icon: <Gift />, text: e.gift_note ? `${copy.lines.giftsOptional} ${e.gift_note}` : copy.lines.giftsOptional });
  if (e.photo_sharing === "kids_off_social") lines.push({ icon: <Camera />, text: copy.lines.photosKidsOff });
  if (e.photo_sharing === "ask") lines.push({ icon: <Camera />, text: copy.lines.photosAsk });
  if (e.photo_sharing === "share") lines.push({ icon: <Camera />, text: copy.lines.photosShare });
  if (e.good_to_know) lines.push({ icon: <Bubble />, text: e.good_to_know });
  if (!lines.length) return null;
  return (
    <div className="pcard white tilt-r" data-section="know">
      <div className="tape sky" />
      <div className="label red">{copy.sections.goodToKnow}</div>
      <div className="lines">{lines.map((l, i) => <div className="line" key={i}>{l.icon}<div>{l.text}</div></div>)}</div>
    </div>
  );
}

export function AfterCard() {
  return (
    <div className="pcard cream" data-section="after">
      <div className="two">
        <div><Bubble /><div className="n">{copy.sections.updates}</div><div className="b">{copy.sections.updatesBody}</div></div>
        <div><Camera /><div className="n">{copy.sections.photos}</div><div className="b">{copy.sections.photosBody}</div></div>
      </div>
    </div>
  );
}

export function UpdatesCard({ e }: { e: PublicEvent }) {
  if (!e.updates.length) return null;
  return (
    <div className="pcard white" data-section="updates">
      <div className="label sky">{copy.sections.updates}</div>
      <div className="lines">{e.updates.map((u, i) => <div className="line" key={i}><Bubble size={36} /><div>{u.body}</div></div>)}</div>
    </div>
  );
}
