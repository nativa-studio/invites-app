"use client";
import { useActionState, useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { buzz } from "@/lib/haptic";
import { formatShortDate, firstName, hostName } from "@/lib/format";
import type { PublicEvent, PublicGuest } from "@/lib/db/types";
import { rsvpAction, type RsvpState } from "@/app/i/[token]/actions";
import { Bolt } from "@/components/art/icons";
import { NoteQuestion, YesQuestions } from "./Questions";
import { ThanksCard } from "./Thanks";
import { GiftCard } from "./GiftCard";
import { useReply } from "./ReplyState";
import type { Plate } from "@/lib/guest/plate";
import type { Gift } from "@/lib/guest/gift";

type Props = {
  token: string;
  event: PublicEvent;
  guest: PublicGuest;
  googleLink: string | null;
  icsLink: string;
  /** Only so the page can hand it to the reply provider as the starting value. The board itself
   *  is drawn further down the invite, by its own part, which reads that provider. */
  plate?: Plate | null;
  /** The gift block as it stood on load, which is a block at all only for a guest who had
   *  already answered. Answering here brings a fresher one back with the reply. */
  gift?: Gift | null;
};

export function Rsvp({ token, event: e, guest, googleLink, icsLink, gift }: Props) {
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(rsvpAction, { ok: false });
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  // "Change my answer" is tied to the state it was clicked from, so a fresh submission closes it again.
  const [editingFrom, setEditingFrom] = useState<RsvpState | null>(null);
  const editing = editingFrom === state;
  const current: PublicGuest = state.ok ? state.guest : guest;
  const answered = current.status !== "pending";
  const host = hostName(e.host_line, "The host");
  const who = firstName(guest.name);

  // The plate board is its own part of the invite now, below the info booth, so it cannot read
  // the answer off this component the way it did when it was drawn here. It is told instead, and
  // only when a reply actually lands: the initial value is already in the provider, put there by
  // the server, so reporting on every render would be saying the same thing twice.
  const ctx = useReply();
  const report = ctx?.report;
  useEffect(() => {
    if (!state.ok || !report) return;
    report({ token, status: state.guest.status, plate: state.plate, gift: state.gift });
  }, [state, report, token]);

  if (answered && !editing) {
    // Whichever gift is the newer one: the reply's, if they have just answered, otherwise the
    // one the page was rendered with. The plate is no longer here: it is a part of the invite in
    // its own right, further down the page, and reads the answer from the provider.
    const present = state.ok ? state.gift : gift;
    return (
      <>
        <ThanksCard
          yes={current.status === "yes"}
          host={host}
          dated={Boolean(e.date)}
          googleLink={googleLink}
          icsLink={icsLink}
          onChange={() => { setEditingFrom(state); setChoice(""); }}
          landed={state.ok}
        />
        {/* Either answer, unlike the plate: somebody who cannot come may still want to chip in. */}
        {present?.enabled && <GiftCard token={token} gift={present} />}
      </>
    );
  }

  return (
    <form action={formAction} className="pcard tilt-l reply">
      <input type="hidden" name="token" value={token} />
      <div className="rsvp-h"><Bolt size={24} /> {copy.rsvp.heading} <Bolt size={24} /></div>
      <div className="rsvp-q">Can <u>{who}</u> make it?</div>
      <div className="para nudge">{copy.rsvp.nudge}</div>

      {choice === "" && (
        <>
          <button type="button" className="pbtn primary" onClick={() => setChoice("yes")}>{e.yes_label ?? copy.rsvp.yes}</button>
          <button type="button" className="pbtn" onClick={() => setChoice("no")}>{e.no_label ?? copy.rsvp.no}</button>
          {editing && <button type="button" className="pbtn small" onClick={() => setEditingFrom(null)}>{copy.rsvp.keep}</button>}
        </>
      )}
      {/* Under the buttons, and only while nothing has been chosen: once a guest is answering
          the questions, the deadline is behind them. */}
      {choice === "" && e.rsvp_by && <div className="replyby">{copy.rsvp.replyBy(formatShortDate(e.rsvp_by))}</div>}

      {choice === "yes" && (
        <>
          <input type="hidden" name="status" value="yes" />
          <YesQuestions e={e} had={current} expected={{ children: guest.expected_children, adults: guest.expected_adults }} />
        </>
      )}

      {choice === "no" && (
        <>
          <input type="hidden" name="status" value="no" />
          <NoteQuestion had={current} placeholder="Have a wonderful day, sorry to miss it" />
        </>
      )}

      {choice !== "" && (
        <>
          {!state.ok && state.error && <div className="err" role="alert">{state.error}</div>}
          <button type="submit" className="pbtn primary" disabled={pending} onClick={() => { if (choice === "yes") buzz(); }}>{pending ? "Sending" : copy.questions.send}</button>
          <button type="button" className="pbtn small" onClick={() => setChoice("")}>Back</button>
        </>
      )}
    </form>
  );
}
