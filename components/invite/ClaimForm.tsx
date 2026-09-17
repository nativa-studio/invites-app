"use client";
import { useActionState } from "react";
import { copy } from "@/lib/copy";
import { claimAction, type ClaimState } from "@/app/e/[slug]/actions";
import { Bolt } from "@/components/art/icons";

export function ClaimForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(claimAction, {});
  return (
    <form action={formAction} className="pcard tilt-l reply">
      <input type="hidden" name="slug" value={slug} />
      <div className="rsvp-h"><Bolt /> {copy.rsvp.heading} <Bolt /></div>
      <div className="rsvp-q">{copy.rsvp.whoIsThis}</div>
      <div className="q"><label htmlFor="name">{copy.rsvp.yourName}</label><input id="name" name="name" type="text" required autoComplete="name" /></div>
      <div className="q"><label htmlFor="phone">{copy.rsvp.yourMobile}</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      {state.error && <div className="err" role="alert">{state.error}</div>}
      <button type="submit" className="pbtn primary" disabled={pending}>{pending ? "One moment" : copy.rsvp.continue}</button>
    </form>
  );
}
