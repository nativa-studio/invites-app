"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";

// `what` is what the fallback box calls the thing, for the browsers with no clipboard API. It
// holds a whole message on a guest's row and a bare link everywhere else, and "Copy this link"
// over four lines of text was a small lie.
export function CopyButton({ text, label, what = "link" }: { text: string; label: string; what?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn small" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { window.prompt(`Copy this ${what}`, text); }
    }}>{done ? copy.host.copied : label}</button>
  );
}
