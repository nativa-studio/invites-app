"use client";
import { useActionState, useState } from "react";
import { copy } from "@/lib/copy";
import { formatShortDate, firstName } from "@/lib/format";
import type { PublicEvent, PublicGuest } from "@/lib/db/types";
import { rsvpAction, type RsvpState } from "@/app/i/[token]/actions";
import { Bolt } from "@/components/art/icons";

type Props = { token: string; event: PublicEvent; guest: PublicGuest; googleLink: string | null; icsLink: string };

function Stepper({ name, label, initial }: { name: string; label: string; initial: number }) {
  const [n, setN] = useState(initial);
  return (
    <div className="stepper">
      <span className="ql">{label}</span>
      <div className="ctl">
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => setN(Math.max(0, n - 1))}>-</button>
        <output aria-live="polite">{n}</output>
        <button type="button" aria-label={`More ${label}`} onClick={() => setN(Math.min(20, n + 1))}>+</button>
      </div>
      <input type="hidden" name={name} value={n} />
    </div>
  );
}

export function Rsvp({ token, event: e, guest, googleLink, icsLink }: Props) {
  const [state, formAction, pending] = useActionState<RsvpState, FormData>(rsvpAction, { ok: false });
  const [choice, setChoice] = useState<"" | "yes" | "no">("");
  // "Change my answer" is tied to the state it was clicked from, so a fresh submission closes it again.
  const [editingFrom, setEditingFrom] = useState<RsvpState | null>(null);
  const editing = editingFrom === state;
  const current: PublicGuest = state.ok ? state.guest : guest;
  const answered = current.status !== "pending";
  const host = e.host_line?.replace(/^with love from /i, "") ?? "The host";
  const who = firstName(guest.name);

  if (answered && !editing) {
    const yes = current.status === "yes";
    const count = current.party_size ?? 0;
    return (
      <div className="pcard tilt-l" aria-live="polite">
        <div className="rsvp-h"><Bolt /> {yes ? copy.thanks.yesTitle : copy.thanks.noTitle} <Bolt /></div>
        <div className="para">{yes ? copy.thanks.yesBody(count, host) : copy.thanks.noBody(host)}</div>
        {yes && e.date && (
          <div className="cal">
            <div className="label sky">{copy.thanks.addToCalendar}</div>
            {googleLink && <a className="pbtn small" href={googleLink} target="_blank" rel="noreferrer">{copy.thanks.google}</a>}
            <a className="pbtn small" href={icsLink}>{copy.thanks.apple}</a>
          </div>
        )}
        <button type="button" className="pbtn small" onClick={() => { setEditingFrom(state); setChoice(""); }}>{copy.rsvp.change}</button>
      </div>
    );
  }

  const partyMode = e.ask_party_mode;
  const initialChildren = current.children ?? 1;
  const initialAdults = current.adults ?? 1;

  return (
    <form action={formAction} className="pcard tilt-l" style={{ border: "3px dashed var(--forest)" }}>
      <input type="hidden" name="token" value={token} />
      <div className="rsvp-h"><Bolt /> {copy.rsvp.heading} <Bolt /></div>
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
          <div className="q">
            <span className="ql">{copy.questions.howMany}</span>
            {partyMode === "split" ? (
              <>
                <Stepper name="children" label={copy.questions.children} initial={initialChildren} />
                <Stepper name="adults" label={copy.questions.adults} initial={initialAdults} />
              </>
            ) : (
              <Stepper name="party_size" label="people" initial={current.party_size ?? 1} />
            )}
          </div>
          {e.ask_names && (
            <div className="q">
              <label htmlFor="party_names">{copy.questions.names}</label>
              <input id="party_names" name="party_names" type="text" defaultValue={current.party_names.join(", ")} placeholder="Mia, Sam and Priya" autoComplete="off" />
              <span className="hint">{copy.questions.namesHint}</span>
            </div>
          )}
          {e.ask_dietary && (
            <div className="q">
              <span className="ql">{copy.questions.dietary}</span>
              <div className="chips">
                {e.dietary_chips.map((c) => (
                  <label className="chip" key={c}><input type="checkbox" name="dietary" value={c} defaultChecked={current.dietary.includes(c)} />{c}</label>
                ))}
              </div>
              <input name="dietary_note" type="text" defaultValue={current.dietary_note ?? ""} placeholder={copy.questions.dietaryNote} aria-label={copy.questions.dietaryNote} />
            </div>
          )}
          {e.ask_accessibility && (
            <div className="q">
              <label htmlFor="accessibility_note">{copy.questions.access}</label>
              <input id="accessibility_note" name="accessibility_note" type="text" defaultValue={current.accessibility_note ?? ""} />
              <span className="hint">{copy.questions.accessHint}</span>
            </div>
          )}
          {e.custom_question && (
            <div className="q">
              <label htmlFor="custom_answer">{e.custom_question}</label>
              <input id="custom_answer" name="custom_answer" type="text" defaultValue={current.custom_answer ?? ""} />
            </div>
          )}
          {e.ask_emergency && (
            <div className="q">
              <label htmlFor="emergency_name">{copy.questions.emergencyName}</label>
              <input id="emergency_name" name="emergency_name" type="text" defaultValue={current.emergency_name ?? ""} />
              <label htmlFor="emergency_phone">{copy.questions.emergencyPhone}</label>
              <input id="emergency_phone" name="emergency_phone" type="tel" defaultValue={current.emergency_phone ?? ""} />
            </div>
          )}
          <div className="q">
            <label htmlFor="note">{copy.questions.note}</label>
            <textarea id="note" name="note" defaultValue={current.note ?? ""} />
          </div>
        </>
      )}

      {choice === "no" && (
        <>
          <input type="hidden" name="status" value="no" />
          <div className="q">
            <label htmlFor="note">{copy.questions.note}</label>
            <textarea id="note" name="note" defaultValue={current.note ?? ""} placeholder="Have a wonderful day, sorry to miss it" />
          </div>
        </>
      )}

      {choice !== "" && (
        <>
          {!state.ok && state.error && <div className="err" role="alert">{state.error}</div>}
          <button type="submit" className="pbtn primary" disabled={pending}>{pending ? "Sending" : copy.questions.send}</button>
          <button type="button" className="pbtn small" onClick={() => setChoice("")}>Back</button>
        </>
      )}
    </form>
  );
}
