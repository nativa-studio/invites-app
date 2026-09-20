"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import { buzz } from "@/lib/haptic";
import { formatShortDate, firstName, hostName } from "@/lib/format";
import type { PublicEvent, PublicGuest } from "@/lib/db/types";
import { rsvpAction, type RsvpState } from "@/app/i/[token]/actions";
import { Bolt } from "@/components/art/icons";
import { NoteQuestion, YesQuestions } from "./Questions";
import { ThanksCard } from "./Thanks";
import { PlateCard } from "./PlateCard";
import type { Plate } from "@/lib/guest/plate";

type Props = {
  token: string;
  event: PublicEvent;
  guest: PublicGuest;
  googleLink: string | null;
  icsLink: string;
  /** The board as it stood when the page loaded, which is a board at all only for a guest who
   *  had already said yes. A guest who says yes here gets a fresher one back with the reply. */
  plate?: Plate | null;
};

export function Rsvp({ token, event: e, guest, googleLink, icsLink, plate }: Props) {
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(rsvpAction, { ok: false });
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  // "Change my answer" is tied to the state it was clicked from, so a fresh submission closes it again.
  const [editingFrom, setEditingFrom] = useState<RsvpState | null>(null);
  const editing = editingFrom === state;
  const current: PublicGuest = state.ok ? state.guest : guest;
  const answered = current.status !== "pending";
  const host = hostName(e.host_line, "The host");
  const who = firstName(guest.name);

  if (answered && !editing) {
    // Whichever board is the newer one: the reply's, if they have just answered, otherwise the
    // one the page was rendered with. The board lives here rather than beside the reply in the
    // layout, because only this component knows what the current answer is.
    const board = state.ok ? state.plate : plate;
    return (
      <>
        <ThanksCard
          yes={current.status === "yes"}
          count={current.party_size ?? 0}
          host={host}
          dated={Boolean(e.date)}
          googleLink={googleLink}
          icsLink={icsLink}
          onChange={() => { setEditingFrom(state); setChoice(""); }}
          landed={state.ok}
        />
        {current.status === "yes" && board?.enabled && <PlateCard token={token} plate={board} />}
      </>
    );
  }

  return (
    <form action={formAction} className="pcard tilt-l reply">
      <input type="hidden" name="token" value={token} />
      <div className="rsvp-h"><Bolt size={24} /> {copy.rsvp.heading} <Bolt size={24} /></div>
      <div className="rsvp-q">Can <u>{who}</u> make it?</div>
      {e.rsvp_by && <div className="para" style={{ fontSize: 15 }}>{copy.rsvp.replyBy(formatShortDate(e.rsvp_by))}</div>}

      {choice === "" && (
        <>
          <button type="button" className="pbtn primary" onClick={() => setChoice("yes")}>{e.yes_label ?? copy.rsvp.yes}</button>
          <button type="button" className="pbtn" onClick={() => setChoice("no")}>{e.no_label ?? copy.rsvp.no}</button>
          {editing && <button type="button" className="pbtn small" onClick={() => setEditingFrom(null)}>{copy.rsvp.keep}</button>}
        </>
      )}

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
