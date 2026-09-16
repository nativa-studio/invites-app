"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn small" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { window.prompt("Copy this link", text); }
    }}>{done ? copy.host.copied : label}</button>
  );
}
