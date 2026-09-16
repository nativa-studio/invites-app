import "@/app/invite.css";
import type { Invite } from "@/lib/db/types";
import { copy } from "@/lib/copy";
import { firstName } from "@/lib/format";
import { googleCalendarLink } from "@/lib/calendar";
import { paletteFor, paletteVars } from "@/components/art/palette";
import { Envelope } from "./Envelope";
import { AfterCard, CoverCard, DayCard, DetailsCard, KnowCard, UpdatesCard } from "./Cards";
import { Rsvp } from "./Rsvp";

export function InvitePage({ invite, token, link, skipAnimation }: { invite: Invite; token: string; link: string; skipAnimation?: boolean }) {
  const { event: e, guest } = invite;
  const p = paletteFor(e.palette, e.theme_id);
  const who = firstName(guest.contact_name || guest.name);
  const age = e.title.match(/turning (\d+)/i)?.[1] ?? "";
  const hostMobile = e.host_phone ? `sms:${e.host_phone.replace(/[^\d+]/g, "")}` : null;
  const hostShort = e.host_line?.replace(/^with love from /i, "") ?? "the host";
  const answered = guest.status !== "pending";
  return (
    <main className="invite" style={paletteVars(p)}>
      <div className="wrap">
        <div className="greet">{copy.greeting(who)}</div>
        <Envelope addressee={guest.name} addresseeLine={guest.name !== guest.contact_name && guest.contact_name ? undefined : undefined} stamp={age} cover={<CoverCard e={e} />} openLabel="Tap to open" skipAnimation={skipAnimation || answered}>
          <UpdatesCard e={e} />
          <DetailsCard e={e} />
          <DayCard e={e} />
          <KnowCard e={e} />
          <Rsvp token={token} event={e} guest={guest} googleLink={googleCalendarLink(e, link)} icsLink={`/i/${token}/invite.ics`} />
          <AfterCard />
          <div className="foot">{hostMobile ? <a href={hostMobile}>{copy.sections.questions(hostShort)}</a> : copy.sections.questions(hostShort)}</div>
        </Envelope>
      </div>
    </main>
  );
}
