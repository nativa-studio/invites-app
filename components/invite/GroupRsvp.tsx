"use client";
import { useActionState, useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { buzz } from "@/lib/haptic";
import { formatShortDate, hostName } from "@/lib/format";
import type { PublicEvent } from "@/lib/db/types";
import { groupRsvpAction, type GroupState } from "@/app/e/[slug]/actions";
import { Bolt } from "@/components/art/icons";
import { NoteQuestion, WhoQuestion, YesQuestions } from "./Questions";
import { ThanksCard } from "./Thanks";
import { useReply } from "./ReplyState";

// The reply on a group link. The same card a guest with their own link answers on, asking the
// one extra thing this link cannot know: who you are.
export function GroupRsvp({ slug, group, event: e }: { slug: string; group?: string; event: PublicEvent }) {
  const [state, formAction, pending] = useActionState<GroupState, FormData>(groupRsvpAction, { ok: false });
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  const [editingFrom, setEditingFrom] = useState<GroupState | null>(null);
  const editing = editingFrom === state;
  const host = hostName(e.host_line, "The host");
  const replied = state.ok ? state.guest : null;

  // Told to the rest of the page, so the plate part further down can draw itself. On a group link
  // the token does not exist until the reply makes one, which is why the provider starts empty
  // here and this is the only thing that ever fills it.
  const ctx = useReply();
  const report = ctx?.report;
  useEffect(() => {
    if (!state.ok || !report) return;
    report({ token: state.token, status: state.guest.status, plate: state.plate, gift: state.gift });
  }, [state, report]);

  if (replied && !editing) {
    return (
      <>
        <ThanksCard
          yes={replied.status === "yes"}
          host={host}
          dated={Boolean(e.date)}
          googleLink={state.ok ? state.googleLink : null}
          icsLink={state.ok ? state.icsLink : "#"}
          onChange={() => { setEditingFrom(state); setChoice(""); }}
          landed={state.ok}
        />
      </>
    );
  }

  return (
    <form action={formAction} className="pcard tilt-l reply">
      <input type="hidden" name="slug" value={slug} />
      {group && <input type="hidden" name="group" value={group} />}
      {/* Once they have replied once, the second answer goes to the row they already have. */}
      {state.ok && <input type="hidden" name="token" value={state.token} />}
      <div className="rsvp-h"><Bolt size={24} /> {copy.rsvp.heading} <Bolt size={24} /></div>
      <div className="rsvp-q">{copy.rsvp.questionGroup}</div>
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

      {choice !== "" && (
        <>
          <input type="hidden" name="status" value={choice} />
          {/* Who is replying comes first: it is the one thing the host cannot work out from
              anything else on the page, and everything below it hangs off the answer. */}
          {!state.ok && <WhoQuestion />}
          {choice === "yes"
            ? <YesQuestions e={e} had={replied ?? undefined} />
            : <NoteQuestion had={replied ?? undefined} placeholder="Have a wonderful day, sorry to miss it" />}
          {!state.ok && state.error && <div className="err" role="alert">{state.error}</div>}
          <button type="submit" className="pbtn primary" disabled={pending} onClick={() => { if (choice === "yes") buzz(); }}>{pending ? "Sending" : copy.questions.send}</button>
          <button type="button" className="pbtn small" onClick={() => setChoice("")}>Back</button>
        </>
      )}
    </form>
  );
}
