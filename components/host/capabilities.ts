"use client";
import { useSyncExternalStore } from "react";

// What the phone in the host's hand can actually do. Read after hydration, so the server and
// the browser agree on the first render and a button never appears that would do nothing.
const noSubscribe = () => () => {};
const no = () => false;

export type ContactsApi = { select: (props: string[], opts?: { multiple?: boolean }) => Promise<{ name?: string[]; tel?: string[] }[]> };

function nav(): (Navigator & { contacts?: ContactsApi }) | null {
  return typeof navigator === "undefined" ? null : navigator;
}

export function useHasShare(): boolean {
  return useSyncExternalStore(noSubscribe, () => typeof nav()?.share === "function", no);
}

// Chrome on Android offers the phone's own contact picker. Safari on iPhone has no such API,
// so hosts there paste a list or type names in instead.
export function useHasContactPicker(): boolean {
  return useSyncExternalStore(noSubscribe, () => typeof nav()?.contacts?.select === "function", no);
}

export function contactPicker(): ContactsApi | null {
  const c = nav()?.contacts;
  return c && typeof c.select === "function" ? c : null;
}
