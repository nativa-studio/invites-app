"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { buzz } from "@/lib/haptic";
import { formatShortDate, hostName } from "@/lib/format";
import type { PublicEvent } from "@/lib/db/types";
import { Bolt } from "@/components/art/icons";
import { NoteQuestion, YesQuestions } from "./Questions";
import { ThanksCard } from "./Thanks";
import { PlateCard } from "./PlateCard";
import { GiftCard } from "./GiftCard";
import type { Plate } from "@/lib/guest/plate";
import type { Gift } from "@/lib/guest/gift";

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
// Not a token, and not shaped like one. Nothing inside the inert block can be tapped, so this is
// never sent anywhere; if it ever were, it fails the token check and writes nothing.
const PREVIEW_TOKEN = "preview";

export function TryReply({ e, who, googleLink, icsLink, plate, gift }: {
  e: PublicEvent;
  who: string;
  googleLink: string | null;
  icsLink: string | null;
  /** Built from the host's own rows, because a preview has no token to read them with. */
  plate?: Plate | null;
  gift?: Gift | null;
}) {
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  const [sent, setSent] = useState<{ yes: boolean } | null>(null);
  const host = hostName(e.host_line, "The host");

  if (sent) {
    return (
      <>
        <ThanksCard
          yes={sent.yes}
          host={host}
          dated={Boolean(e.date)}
          googleLink={googleLink}
          icsLink={icsLink}
          onChange={() => { setSent(null); setChoice(""); }}
          landed
        />
        {/* The two things guests write to, shown as they will see them, on the same rule the real
            invite uses: the plate for a yes, the gift for either answer.

            Inert rather than rebuilt. These are the guest's own components with the host's own
            rows poured into them, so what a host checks here cannot drift from what a guest
            opens. What they cannot be is live: there is no guest row and no token to claim a dish
            as, and a host pressing a button on their own party must not turn up in their own
            numbers. inert takes the whole subtree out of reach of a tap and out of the
            accessibility tree, without greying anything out, so it still looks like the guest's. */}
        {(plate?.enabled || gift?.enabled) && (
          <div className="tryextras" inert>
            {sent.yes && plate?.enabled && <PlateCard token={PREVIEW_TOKEN} plate={plate} />}
            {gift?.enabled && <GiftCard token={PREVIEW_TOKEN} gift={gift} />}
          </div>
        )}
      </>
    );
  }

  function send(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSent({ yes: choice === "yes" });
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
