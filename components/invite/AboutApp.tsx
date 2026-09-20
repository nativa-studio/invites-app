"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { curiousAction, feedbackAction, type CuriousState, type FeedbackState } from "@/app/i/[token]/about-actions";

// About this app, at the foot of every invite.
//
// A details element, so it is shut until somebody wants it and costs one line of the page until
// then. Native rather than a toggle of our own: it opens without JavaScript, the keyboard and
// screen readers already know what it is, and a guest who never taps it never loads anything.
//
// Discreet is the whole brief. Somebody opened this to find out about a party, not to read about
// the software that drew it, and a product pitch above the sign-off would be taking a moment that
// belongs to the host.
export function AboutApp({ token, curious, pretend }: { token: string | null; curious: boolean; pretend?: boolean }) {
  const [state, act, pending] = useActionState<CuriousState, FormData>(
    curiousAction,
    { token: token ?? "", curious },
  );
  // The host trying their own invite. There is no guest row to write a thumbs up against, so the
  // button keeps its answer in the browser and nothing is saved. It was left out entirely, which
  // meant the one screen built to answer "what do my guests see" was the one place the ask and
  // the button could not be seen at all.
  const [local, setLocal] = useState(false);
  const on = pretend ? local : state.curious;

  // The feedback box. Its own state, because saying something and putting your hand up are two
  // different things and doing one must not close the other.
  const [note, act2, sending] = useActionState<FeedbackState, FormData>(feedbackAction, {});
  const [pretendSent, setPretendSent] = useState(false);
  // "Say something else" is tied to the result it was pressed from, the same trick Change my
  // answer uses on the reply card: a fresh submission is a new object, so it stops matching and
  // the thank you comes back by itself.
  const [againFrom, setAgainFrom] = useState<FeedbackState | null>(null);
  const sent = (pretend ? pretendSent : note.sent === true) && againFrom !== note;

  // The nudge. It is the last thing on a long page, it is shut, and it is one quiet line, so it
  // is easy to scroll past without registering that there is anything there. When it comes into
  // view it waves once: a small tilt, half a second, and then it stops and never does it again.
  //
  // Once, on purpose. A thing that moves every time you scroll past is not an invitation to look,
  // it is a fly in the room, and this sits under somebody's party invitation rather than on a
  // shop window. It also only waves while shut: once it is open the waving is over, the reader
  // is already there.
  //
  // Nothing moves for a reader who has asked their phone to stop animating things, and nothing
  // moves in a browser without IntersectionObserver, which is the state the page is already in.
  const box = useRef<HTMLDetailsElement>(null);
  const waved = useRef(false);
  const [wave, setWave] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || waved.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || waved.current) continue;
          waved.current = true;
          io.disconnect();
          // A beat after it arrives, so it waves at a reader who has stopped, not at a scroll
          // that is still flying past it.
          setTimeout(() => setWave(true), 350);
        }
      },
      // Most of it has to be on screen, or it waves while it is still a sliver at the bottom edge.
      { threshold: 0.9 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const ask = (body: React.ReactNode) => (pretend
    ? <form onSubmit={(ev) => { ev.preventDefault(); setLocal((v) => !v); }}>{body}</form>
    : <form action={act}>{body}</form>);

  return (
    <details className={`about${wave ? " wave" : ""}`} ref={box} onToggle={() => setWave(false)}>
      <summary>
        {copy.about.summary}
        {/* The instruction is separate from the fact, and quieter, so the line reads as her
            saying something rather than as a button asking to be pressed. */}
        <span className="peek">{copy.about.peek}</span>
      </summary>
      <div className="inner">
        <p>{copy.about.body}</p>
        <p>{copy.about.what}</p>
        {/* No token and not a preview means the group link before anybody has replied: there is
            no row to record a thumbs up against yet, so the text stands on its own rather than
            offering a button that would have nowhere to write. */}
        {(token || pretend) && (
          on ? ask(
            <>
              <p className="ta">{copy.about.done}</p>
              <button type="submit" className="as-quiet" disabled={pending}>{copy.about.undo}</button>
            </>,
          ) : ask(
            <>
              <p>{copy.about.ask}</p>
              <button type="submit" className="pbtn small" disabled={pending}>👍 {copy.about.up}</button>
            </>,
          )
        )}
        {state.error && <p className="ta">{copy.about.failed}</p>}

        {/* Feedback, under the hand up rather than over it, because one is a tap and the other is
            typing, and the tap should not have to wait behind a box nobody is going to fill in.
            Same rule as the rest of this card: no token and no preview means nowhere to write. */}
        {(token || pretend) && (
          sent ? (
            <div className="feedback">
              <p className="ta">{copy.about.feedbackDone}</p>
              <button
                type="button"
                className="as-quiet"
                onClick={() => { if (pretend) setPretendSent(false); else setAgainFrom(note); }}
              >
                {copy.about.feedbackAgain}
              </button>
            </div>
          ) : (
            <form
              className="feedback"
              {...(pretend
                ? { onSubmit: (ev: React.FormEvent<HTMLFormElement>) => {
                    ev.preventDefault();
                    if (String(new FormData(ev.currentTarget).get("body") ?? "").trim()) setPretendSent(true);
                  } }
                : { action: act2 })}
            >
              <input type="hidden" name="token" value={token ?? ""} />
              <label htmlFor="about-feedback">{copy.about.feedbackLabel}</label>
              <textarea
                id="about-feedback"
                name="body"
                rows={3}
                placeholder={copy.about.feedbackPlaceholder}
                maxLength={2000}
              />
              <button type="submit" className="pbtn small" disabled={sending}>{copy.about.feedbackSend}</button>
              {note.error && <p className="ta">{copy.about.failed}</p>}
            </form>
          )
        )}
      </div>
    </details>
  );
}
