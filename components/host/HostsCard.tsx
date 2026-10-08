"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import type { Host } from "@/lib/db/cohosts";
import { removeHost, setJoinLink } from "@/app/app/events/[id]/actions";
import { CopyButton } from "./CopyButton";
import { Sheet } from "./Sheet";
import { Mono } from "@/components/art/mono";

// Who is running this event, and how somebody else joins them.
//
// A link rather than a box for an email address: the owner has the other person's phone, not
// necessarily the address they sign in to Google with. Whoever taps the link is the one who signs
// in, so the address cannot be wrong.
//
// Three things are the owner's alone, which is the brief's rule and the database's: handing over
// the link, taking somebody off, and deleting the event. A co-host sees who else is here and a
// way to leave, and nothing with a key on it.
export function HostsCard({ eventId, hosts, link, on, amOwner }: {
  eventId: string;
  hosts: Host[];
  /** The full address of the invite, or empty when there has never been one. */
  link: string;
  on: boolean;
  amOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const others = hosts.filter((h) => !h.me).length;
  return (
    <>
      <div className={`sbox${others > 0 ? " on" : ""}`}>
        <span className="sbox-art" aria-hidden="true"><Mono name="cap" size={34} /></span>
        <span className="sbox-name">{copy.host.hostsHeading}</span>
        <span className="sbox-foot"><span className="sbox-val">{copy.host.hostsCount(hosts.length)}</span></span>
        {/* No switch: a co-host is added by being sent a link and removed by name, so there is
            nothing here to flick. The pencil is in the same corner as every other block's. */}
        <button type="button" className="sbox-pen" onClick={() => setOpen(true)} aria-label={copy.host.editThing(copy.host.hostsHeading)}>
          <Pen />
        </button>
      </div>
      {open && (
        <Sheet title={copy.host.hostsHeading} blurb={copy.host.hostsBlurb} onClose={() => setOpen(false)}>
          <div className="sheet-body">
            <ul className="rows hosts">
              {hosts.map((h) => (
                <li key={h.profile_id}>
                  <span className="what">
                    <span className="n">{h.name || h.email || copy.host.hostsNameless}</span>
                    <span className="said">{h.role === "owner" ? copy.host.hostsOwner : copy.host.hostsCohost}{h.me ? copy.host.hostsYou : ""}</span>
                    {h.email && h.name && <span className="said">{h.email}</span>}
                  </span>
                  {/* Taking somebody off is the owner's. Leaving is everybody's own, and an owner
                      is not offered it: an event whose owner walked out has nobody who can delete
                      it or hand it on. An owner who wants out deletes the event. */}
                  {((amOwner && !h.me) || (h.me && h.role !== "owner")) && (
                    <Remove eventId={eventId} profileId={h.profile_id} mine={h.me} />
                  )}
                </li>
              ))}
            </ul>

            {amOwner ? (
              <Invite eventId={eventId} link={link} on={on} />
            ) : (
              <p className="hint">{copy.host.hostsCohostNote}</p>
            )}
          </div>
        </Sheet>
      )}
    </>
  );
}

function Invite({ eventId, link, on }: { eventId: string; link: string; on: boolean }) {
  const [pending, start] = useTransition();
  return (
    <section className="invitelink">
      <span className="label-ish">{copy.host.hostsInvite}</span>
      <p className="hint">{copy.host.hostsInviteHint}</p>
      {on && link ? (
        <>
          <code>{link}</code>
          <div className="actions">
            <CopyButton text={link} label={copy.host.hostsCopy} />
            <button type="button" className="btn small" disabled={pending} onClick={() => start(() => { void setJoinLink(eventId, true, true); })}>
              {copy.host.hostsNewLink}
            </button>
            <button type="button" className="btn small" disabled={pending} onClick={() => start(() => { void setJoinLink(eventId, false); })}>
              {copy.host.hostsStop}
            </button>
          </div>
          <p className="hint">{copy.host.hostsStopHint}</p>
        </>
      ) : (
        <button type="button" className="btn primary" disabled={pending} onClick={() => start(() => { void setJoinLink(eventId, true); })}>
          {copy.host.hostsStart}
        </button>
      )}
    </section>
  );
}

function Remove({ eventId, profileId, mine }: { eventId: string; profileId: string; mine: boolean }) {
  const [sure, setSure] = useState(false);
  const [pending, start] = useTransition();
  if (!sure) {
    return <button type="button" className="btn small" onClick={() => setSure(true)}>{mine ? copy.host.hostsLeave : copy.host.hostsRemove}</button>;
  }
  return (
    <span className="actions">
      <button type="button" className="btn small danger" disabled={pending} onClick={() => start(() => { void removeHost(eventId, profileId); })}>
        {pending ? copy.host.hostsRemoving : copy.host.hostsSure}
      </button>
      <button type="button" className="btn small" onClick={() => setSure(false)}>{copy.host.hostsCancel}</button>
    </span>
  );
}

/** The same pencil the invite draws on each part, and the settings board on each block. */
function Pen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}
