import "@/app/invite.css";
import type { Invite } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { firstName, hostName } from "@/lib/format";
import { googleCalendarLink } from "@/lib/calendar";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { Envelope } from "./Envelope";
import { AfterCard, CoverCard, DayCard, DetailsCard, KnowCard, UpdatesCard } from "./Cards";
import { Rsvp } from "./Rsvp";
import { LineupInvite } from "./LineupInvite";
import { PeekInvite } from "./PeekInvite";

export function InvitePage({ invite, token, link, skipAnimation }: { invite: Invite; token: string; link: string; skipAnimation?: boolean }) {
  const { event: e, guest } = invite;
  // The lineup and the peek are each their own page from top to bottom, so they take over
  // before the suite is built.
  if (e.layout_id === "lineup" || e.layout_id === "peek") {
    const Whole = e.layout_id === "peek" ? PeekInvite : LineupInvite;
    return (
      <Whole
        event={e}
        greeting={copy.greeting(firstName(guest.name))}
        reply={<Rsvp token={token} event={e} guest={guest} googleLink={googleCalendarLink(e, link)} icsLink={`/i/${token}/invite.ics`} />}
      />
    );
  }
  const p = paletteFor(e.palette, e.theme_id);
  const who = firstName(guest.name);
  const age = e.title.match(/turning (\d+)/i)?.[1] ?? "";
  const hostMobile = e.host_phone ? `sms:${e.host_phone.replace(/[^\d+]/g, "")}` : null;
  const hostShort = hostName(e.host_line);
  const answered = guest.status !== "pending";
  return (
    <main className="invite" style={paletteVars(p)}>
      <div className="wrap">
        <div className="greet">{copy.greeting(who)}</div>
        <Envelope addressee={guest.name} stamp={age} cover={<CoverCard e={e} />} openLabel="Tap to open" skipAnimation={skipAnimation ?? answered}>
          <UpdatesCard e={e} />
          {e.show_details && <DetailsCard e={e} />}
          {e.show_runsheet && <DayCard e={e} />}
          {e.show_good_to_know && <KnowCard e={e} />}
          <Rsvp token={token} event={e} guest={guest} googleLink={googleCalendarLink(e, link)} icsLink={`/i/${token}/invite.ics`} />
          {e.show_after && <AfterCard />}
          <div className="foot">{hostMobile ? <a href={hostMobile}>{copy.sections.questions(hostShort)}</a> : copy.sections.questions(hostShort)}</div>
        </Envelope>
      </div>
    </main>
  );
}
