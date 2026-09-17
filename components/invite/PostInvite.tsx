import Image from "next/image";
import "@/app/invite.css";
import "@/app/post.css";
import type { PublicEvent } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { formatInviteDate, formatTimeRange, hostName } from "@/lib/format";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { castFor, type PeekChar } from "@/lib/artwork";
import { AfterCard, DayCard, DetailsCard, KnowCard, UpdatesCard } from "./Cards";
import { Envelope } from "./Envelope";

// In the post: the stationery suite with the peek characters, on the paper they were drawn on.
//
// The invitation comes first. An envelope, always, with a card inside drawn at the size a card
// is when it fits that envelope, and nothing above it competing for the eye. Only once that has
// been read do the characters start: one leaning on each card down the page, the first section
// taking two. The cast is bound to Gabriel's artwork; any other artwork gets the same page with
// nobody leaning on it, which it is built to survive.

function Peeker({ who, side }: { who: PeekChar | undefined; side: "left" | "right" }) {
  if (!who) return null;
  return <Image className={`peeker ${side}`} src={who.src} alt={who.alt} width={who.w} height={who.h} sizes="200px" />;
}

// A card, with whoever leans on it. The slot spans the page so a character is cut by the page
// edge, not by the card. Each one's head tucks behind the card above, so they come up from
// between the cards rather than being cropped in mid air: slots stack downwards in z-order,
// each painting over the next one's character. `lift` raises a character whose pale bill would
// vanish into the card it leans on. Some cards take two, one at each edge.
function Slot({ who, second, order, lift, children }: { who?: PeekChar; second?: PeekChar; order: number; lift?: boolean; children: React.ReactNode }) {
  return (
    <div className={`slot ${who || second ? "leaned" : ""} ${lift ? "lifted" : ""}`} style={{ zIndex: 40 - order }}>
      <Peeker who={who} side="left" />
      <Peeker who={second} side="right" />
      {children}
    </div>
  );
}

// The card inside the envelope. What a guest needs to decide whether to come, and no more:
// what, when, where, who from. The address and the rest follow down the page once it is open.
function CoverCard({ e, hero, greeting }: { e: PublicEvent; hero?: PeekChar; greeting: string }) {
  const age = e.title.match(/turning (\d+)/i)?.[1];
  // The group link's greeting is already "You're invited", so the eyebrow would say it twice.
  const eyebrow = age ? copy.envelope.eyebrowBirthday : copy.greetingGroup;
  return (
    <div className={`post-card ${hero ? "with-hero" : ""}`}>
      <div className="text">
        {eyebrow.toLowerCase() !== greeting.toLowerCase() && <div className="eyebrow">{eyebrow}</div>}
        <div className="title">{e.title}</div>
        <div className="when">
          <b>{formatInviteDate(e.date)}</b>
          {formatTimeRange(e.start_time, e.end_time, e.time_note)}
          {e.venue && <span className="where">{e.venue}</span>}
        </div>
        {e.host_line && <div className="from">{e.host_line}</div>}
      </div>
      {hero && <Image className="hero" src={hero.src} alt={hero.alt} width={hero.w} height={hero.h} priority sizes="200px" />}
    </div>
  );
}

export function PostInvite({
  event: e, greeting, addressee, reply, skipAnimation,
}: { event: PublicEvent; greeting: string; addressee: string; reply: React.ReactNode; skipAnimation?: boolean }) {
  const p = paletteFor(e.palette, e.theme_id);
  const host = hostName(e.host_line);
  const age = e.title.match(/turning (\d+)/i)?.[1] ?? "";
  const cast = castFor(e.invite_image_path);
  const hostMobile = e.host_phone ? `sms:${e.host_phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <main className="post" style={paletteVars(p)}>
      <div className="page">
        <div className="greet">{greeting}</div>

        <div className="opening">
          <Envelope
            variant="post"
            addressee={addressee}
            stamp={age}
            card={<CoverCard e={e} hero={cast.hero} greeting={greeting} />}
            openLabel={copy.envelope.open}
            skipAnimation={skipAnimation}
          />
        </div>

        <div className="strip">
          {e.updates.length > 0 && <Slot order={0}><UpdatesCard e={e} /></Slot>}
          {e.show_details && <Slot who={cast.details} order={1}><DetailsCard e={e} /></Slot>}
          {e.show_runsheet && e.runsheet.length > 0 && <Slot second={cast.day} order={2}><DayCard e={e} /></Slot>}
          {e.show_good_to_know && <Slot who={cast.know} order={3}><KnowCard e={e} /></Slot>}
          <Slot second={cast.reply} order={4} lift>{reply}</Slot>
          {e.show_after && <Slot who={cast.topLeft} second={cast.topRight} order={5}><AfterCard /></Slot>}
          <div className="foot">{hostMobile ? <a href={hostMobile}>{copy.sections.questions(host)}</a> : copy.sections.questions(host)}</div>
        </div>
      </div>
    </main>
  );
}
