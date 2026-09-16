"use client";

import { useActionState } from "react";
import { addGuest, hostLogin, type SimpleState } from "@/app/actions";

const initial: SimpleState = { ok: false };

export function LoginForm() {
  const [state, action, pending] = useActionState(hostLogin, initial);
  return (
    <form action={action} className="card-body">
      <p className="eyebrow">Host area</p>
      <h1 className="rsvp-title">Who&rsquo;s coming?</h1>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required autoComplete="current-password" autoFocus />
      </label>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Checking…" : "Open dashboard"}
      </button>
    </form>
  );
}

export function AddGuestForm() {
  const [state, action, pending] = useActionState(addGuest, initial);
  return (
    <form action={action} className="add-guest" key={state.ok ? "reset" : "form"}>
      <label className="field">
        <span>Name</span>
        <input name="name" required maxLength={80} placeholder="Sarah, or Sarah & Tom" />
      </label>
      <label className="field">
        <span>Mobile</span>
        <input name="phone" type="tel" maxLength={30} placeholder="04..." />
      </label>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Adding…" : "Add guest"}
      </button>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
