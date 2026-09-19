"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { buzz } from "@/lib/haptic";
import { formatShortDate, hostName } from "@/lib/format";
import type { PublicEvent } from "@/lib/db/types";
import { Bolt } from "@/components/art/icons";
import { NoteQuestion, YesQuestions } from "./Questions";
import { ThanksCard } from "./Thanks";

// The reply block, for a host trying their own invite.
//
// The host's preview used to draw a reply card with dead buttons under a line explaining that a
// guest answers here. That showed the shape of the thing and none of the thing: whether the
// questions are the right ones, how long the form feels on a phone, what the thank you says. A
// host who cannot press their own yes button finds all of that out from a guest.
//
// So this is the guest's form, the real one: the same questions from the same module, the same
// thank you card, the same calendar buttons. The only difference is the last step. Nothing is
// written, because there is nobody to write it against: a preview has no guest row and no token,
// and a host pressing yes on their own party must never turn up in their own numbers.
export function TryReply({ e, who, googleLink, icsLink }: {
  e: PublicEvent;
  who: string;
  googleLink: string | null;
  icsLink: string | null;
}) {
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  const [sent, setSent] = useState<{ yes: boolean; count: number } | null>(null);
  const host = hostName(e.host_line, "The host");

  if (sent) {
    return (
      <ThanksCard
        yes={sent.yes}
        count={sent.count}
        host={host}
        dated={Boolean(e.date)}
        googleLink={googleLink}
        icsLink={icsLink}
        onChange={() => { setSent(null); setChoice(""); }}
        landed
      />
    );
  }

  function send(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const n = (k: string) => Number(f.get(k) ?? 0) || 0;
    const count = e.ask_party_mode === "split" ? n("children") + n("adults") : n("party_size");
    setSent({ yes: choice === "yes", count });
  }

  return (
    <form className="pcard tilt-l reply" onSubmit={send}>
      <div className="rsvp-h"><Bolt size={24} /> {copy.rsvp.heading} <Bolt size={24} /></div>
      <div className="rsvp-q">Can <u>{who}</u> make it?</div>
      {e.rsvp_by && <div className="para" style={{ fontSize: 15 }}>{copy.rsvp.replyBy(formatShortDate(e.rsvp_by))}</div>}

      {choice === "" && (
        <>
          <button type="button" className="pbtn primary" onClick={() => setChoice("yes")}>{e.yes_label ?? copy.rsvp.yes}</button>
          <button type="button" className="pbtn" onClick={() => setChoice("no")}>{e.no_label ?? copy.rsvp.no}</button>
        </>
      )}

      {choice === "yes" && <YesQuestions e={e} />}
      {choice === "no" && <NoteQuestion placeholder="Have a wonderful day, sorry to miss it" />}

      {choice !== "" && (
        <>
          <button type="submit" className="pbtn primary" onClick={() => { if (choice === "yes") buzz(); }}>{copy.questions.send}</button>
          <button type="button" className="pbtn small" onClick={() => setChoice("")}>Back</button>
        </>
      )}
    </form>
  );
}
