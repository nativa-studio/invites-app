"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import { formatShortDate, hostName } from "@/lib/format";
import type { PublicEvent } from "@/lib/db/types";
import { groupRsvpAction, type GroupState } from "@/app/e/[slug]/actions";
import { Bolt } from "@/components/art/icons";
import { NoteQuestion, WhoQuestion, YesQuestions } from "./Questions";
import { ThanksCard } from "./Thanks";
import { PlateCard } from "./PlateCard";

// The reply on a group link. The same card a guest with their own link answers on, asking the
// one extra thing this link cannot know: who you are.
export function GroupRsvp({ slug, group, event: e }: { slug: string; group?: string; event: PublicEvent }) {
  const [state, formAction, pending] = useActionState<GroupState, FormData>(groupRsvpAction, { ok: false });
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  const [editingFrom, setEditingFrom] = useState<GroupState | null>(null);
  const editing = editingFrom === state;
  const host = hostName(e.host_line, "The host");
  const replied = state.ok ? state.guest : null;

  if (replied && !editing) {
    const plate = state.ok ? state.plate : null;
    return (
      <>
        <ThanksCard
          yes={replied.status === "yes"}
          count={replied.party_size ?? 0}
          host={host}
          dated={Boolean(e.date)}
          googleLink={state.ok ? state.googleLink : null}
          icsLink={state.ok ? state.icsLink : "#"}
          onChange={() => { setEditingFrom(state); setChoice(""); }}
          landed={state.ok}
        />
        {/* The board, for somebody who has just said yes on a group link. They have a token now,
            which is the thing that was missing: it is made by the reply, not before it. */}
        {plate?.enabled && state.ok && replied.status === "yes" && <PlateCard token={state.token} plate={plate} />}
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
      {e.rsvp_by && <div className="para" style={{ fontSize: 15 }}>{copy.rsvp.replyBy(formatShortDate(e.rsvp_by))}</div>}

      {choice === "" && (
        <>
          <button type="button" className="pbtn primary" onClick={() => setChoice("yes")}>{e.yes_label ?? copy.rsvp.yes}</button>
          <button type="button" className="pbtn" onClick={() => setChoice("no")}>{e.no_label ?? copy.rsvp.no}</button>
          {editing && <button type="button" className="pbtn small" onClick={() => setEditingFrom(null)}>{copy.rsvp.keep}</button>}
        </>
      )}

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
          <button type="submit" className="pbtn primary" disabled={pending}>{pending ? "Sending" : copy.questions.send}</button>
          <button type="button" className="pbtn small" onClick={() => setChoice("")}>Back</button>
        </>
      )}
    </form>
  );
}
