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
      <p className="hint">{copy.notYet.hint}</p>
      <div className="actions">
        <Link className="btn" href="/">{copy.notYet.back}</Link>
      </div>
    </main>
  );
}
