"use client";

import { useActionState, useState } from "react";
import { submitOpenRsvp, submitRsvp, type RsvpState } from "@/app/actions";
import type { RsvpStatus } from "@/lib/airtable";

type Props = {
  mode: "personal" | "open";
  token?: string;
  hostName: string;
  allowPlusOnes: boolean;
  maxPartySize: number;
  initialStatus?: RsvpStatus;
  initialPartySize?: number | null;
  initialMessage?: string;
  justSubmitted?: boolean;
  // Calendar links shown once the guest says yes. Null when the event has no date.
  calendarGoogle: string | null;
  calendarIcs: string | null;
};

const initialState: RsvpState = { ok: false };

export default function RsvpForm(props: Props) {
  const action = props.mode === "personal" ? submitRsvp : submitOpenRsvp;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [status, setStatus] = useState<RsvpStatus | "">(
    props.initialStatus && props.initialStatus !== "Pending" ? props.initialStatus : "",
  );
  const [partySize, setPartySize] = useState(Math.max(1, props.initialPartySize ?? 1));
  // "Change my answer" is tied to the state it was clicked from, so a fresh
  // successful submission automatically closes the edit form again.
  const [editingFrom, setEditingFrom] = useState<RsvpState | null>(null);
  const editing = editingFrom === state;

  const answered = state.ok || (props.initialStatus && props.initialStatus !== "Pending");
  const current = state.ok
    ? state.guest
    : props.initialStatus && props.initialStatus !== "Pending"
      ? { status: props.initialStatus, partySize: props.initialPartySize ?? null, message: props.initialMessage ?? "" }
      : null;

  if (answered && current && !editing) {
    const coming = current.status === "Coming";
    const heads = coming ? Math.max(1, current.partySize ?? 1) : 0;
    return (
      <section className="card rsvp" aria-live="polite">
        <div className="card-body">
          <p className="eyebrow">{state.ok || props.justSubmitted ? "Thank you" : "Your reply"}</p>
          <h2 className="rsvp-title">
            {coming ? "You're coming!" : "Sorry you can't make it"}
          </h2>
          <p className="intro">
            {coming
              ? heads > 1
                ? `We've got you down for ${heads} people. ${props.hostName || "The host"} can't wait to see you.`
                : `We've got you down. ${props.hostName || "The host"} can't wait to see you.`
              : `${props.hostName || "The host"} will miss you. Thanks for letting us know.`}
          </p>
          {current.message ? <p className="quote">&ldquo;{current.message}&rdquo;</p> : null}
          {coming && (props.calendarGoogle || props.calendarIcs) ? (
            <div className="actions">
              {props.calendarGoogle ? (
                <a className="btn btn-primary" href={props.calendarGoogle} target="_blank" rel="noopener noreferrer">
                  Add to Google Calendar
                </a>
              ) : null}
              {props.calendarIcs ? (
                <a className="btn" href={props.calendarIcs}>
                  Apple / Outlook calendar
                </a>
              ) : null}
            </div>
          ) : null}
          <p className="muted small">Plans change? Come back to this link any time to update your answer.</p>
          <button type="button" className="btn btn-ghost" onClick={() => setEditingFrom(state)}>
            Change my answer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card rsvp">
      <form action={formAction} className="card-body">
        <p className="eyebrow">RSVP</p>
        <h2 className="rsvp-title">Can you make it?</h2>

        {props.mode === "personal" ? <input type="hidden" name="token" value={props.token} /> : null}

        {props.mode === "open" ? (
          <>
            <label className="field">
              <span>Your name</span>
              <input name="name" required maxLength={80} autoComplete="name" placeholder="e.g. Sarah Jones" />
            </label>
            <label className="field">
              <span>
                Mobile <span className="muted">(optional, in case the host needs to reach you)</span>
              </span>
              <input name="phone" type="tel" maxLength={30} autoComplete="tel" placeholder="04..." />
            </label>
            <div className="hp" aria-hidden="true">
              <label>
                Website <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </>
        ) : null}

        <div className="choice" role="radiogroup" aria-label="Are you coming?">
          <label className={`choice-btn ${status === "Coming" ? "on" : ""}`}>
            <input
              type="radio"
              name="status"
              value="Coming"
              checked={status === "Coming"}
              onChange={() => setStatus("Coming")}
              required
            />
            <span className="choice-icon">🎉</span>
            <span>Yes, I&rsquo;m coming</span>
          </label>
          <label className={`choice-btn ${status === "Not coming" ? "on" : ""}`}>
            <input
              type="radio"
              name="status"
              value="Not coming"
              checked={status === "Not coming"}
              onChange={() => setStatus("Not coming")}
            />
            <span className="choice-icon">😢</span>
            <span>Sorry, can&rsquo;t make it</span>
          </label>
        </div>

        {props.allowPlusOnes && status === "Coming" ? (
          <div className="field">
            <span>How many of you in total?</span>
            <div className="stepper">
              <button
                type="button"
                aria-label="Fewer people"
                onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                disabled={partySize <= 1}
              >
                −
              </button>
              <output aria-live="polite">
                {partySize} {partySize === 1 ? "person" : "people"}
              </output>
              <button
                type="button"
                aria-label="More people"
                onClick={() => setPartySize((n) => Math.min(props.maxPartySize, n + 1))}
                disabled={partySize >= props.maxPartySize}
              >
                +
              </button>
              <input type="hidden" name="partySize" value={partySize} />
            </div>
            <span className="muted small">Including yourself.</span>
          </div>
        ) : null}

        <label className="field">
          <span>
            A note for {props.hostName || "the host"} <span className="muted">(optional)</span>
          </span>
          <textarea
            name="message"
            rows={2}
            maxLength={500}
            defaultValue={props.initialMessage ?? ""}
            placeholder="Dietary needs, a song request, anything at all"
          />
        </label>

        {state.error ? (
          <p className="error" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={pending || !status}>
            {pending ? "Sending…" : "Send my reply"}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={() => setEditingFrom(null)}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
