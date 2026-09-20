import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/lib/copy";

// Where somebody lands when they sign in and are not on the list yet.
//
// A public page with no session behind it, because the callback signs them out before sending
// them here: there is nothing to be signed in to yet. It is written as an apology and an invite
// to come back, not as a wall, since the people who find this are far more likely to be a friend
// Marcia mentioned it to than anybody unwelcome.
export const metadata: Metadata = { title: copy.notYet.title, robots: { index: false, follow: false } };

export default function NotYet() {
  return (
    <main className="host">
      <h1 className="h1">{copy.notYet.title}</h1>
      <p className="muted">{copy.notYet.body}</p>
      {/* What it is, in the same words the invite uses. Somebody who has just tried to sign in
          is asking what this is, and an apology with no answer in it wastes the question.
          Read from copy.about rather than written again here, so the two cannot drift. */}
      <p className="muted">{copy.about.body}</p>
      <p className="muted">{copy.about.what}</p>
      {/* The hand up on the invite is a button, because there is a guest row to write it against.
          Here there is nobody signed in and nothing to write to, so the line below says how to
          put your hand up instead: tell her which address you used. */}
      <p className="muted">{copy.about.ask}</p>
      <p className="hint">{copy.notYet.hint}</p>
      <div className="actions">
        <Link className="btn" href="/">{copy.notYet.back}</Link>
      </div>
    </main>
  );
}
