"use client";
import { useActionState } from "react";
import { copy } from "@/lib/copy";
import { curiousAction, type CuriousState } from "@/app/i/[token]/about-actions";

// About this app, at the foot of every invite.
//
// A details element, so it is shut until somebody wants it and costs one line of the page until
// then. Native rather than a toggle of our own: it opens without JavaScript, the keyboard and
// screen readers already know what it is, and a guest who never taps it never loads anything.
//
// Discreet is the whole brief. Somebody opened this to find out about a party, not to read about
// the software that drew it, and a product pitch above the sign-off would be taking a moment that
// belongs to the host.
export function AboutApp({ token, curious }: { token: string | null; curious: boolean }) {
  const [state, act, pending] = useActionState<CuriousState, FormData>(
    curiousAction,
    { token: token ?? "", curious },
  );

  return (
    <details className="about">
      <summary>{copy.about.summary}</summary>
      <div className="inner">
        <p>{copy.about.body}</p>
        <p>{copy.about.what}</p>
        {/* No token means the group link before anybody has replied: there is no row to record a
            thumbs up against yet, so the text stands on its own rather than offering a button
            that would have nowhere to write. */}
        {token && (
          state.curious ? (
            <form action={act}>
              <p className="ta">{copy.about.done}</p>
              <button type="submit" className="as-quiet" disabled={pending}>{copy.about.undo}</button>
            </form>
          ) : (
            <form action={act}>
              <p>{copy.about.ask}</p>
              <button type="submit" className="pbtn small" disabled={pending}>👍 {copy.about.up}</button>
            </form>
          )
        )}
        {state.error && <p className="ta">{copy.about.failed}</p>}
      </div>
    </details>
  );
}
