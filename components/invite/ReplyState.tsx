"use client";
import { createContext, useContext, useState } from "react";
import type { Plate } from "@/lib/guest/plate";
import type { Gift } from "@/lib/guest/gift";

// Where the guest's answer lives, so that more than one part of the invite can read it.
//
// The plate board used to be drawn by the reply itself, because the reply is the only thing that
// knows whether somebody has just said yes, and a card that only exists for a yes has to sit with
// whatever knows that. That tied it to the reply's position on the page. It is its own part now,
// below the info booth, so the answer has to be readable from further down.
//
// One value, one setter, and the reply is the only thing that ever sets it. Nothing here fetches
// anything: the boards arrive with the reply's own result, the same way they always have.
export type Reply = {
  token: string;
  status: "pending" | "yes" | "no";
  plate: Plate | null;
  gift: Gift | null;
  /** The host trying their own invite. Everything works and nothing is written. */
  pretend?: boolean;
};

const Ctx = createContext<{ reply: Reply; report: (r: Reply) => void } | null>(null);

export function ReplyProvider({ initial, children }: { initial: Reply; children: React.ReactNode }) {
  const [reply, report] = useState<Reply>(initial);
  return <Ctx.Provider value={{ reply, report }}>{children}</Ctx.Provider>;
}

// Null outside a provider, which is the editor drawing the invite with nobody answering. Every
// reader has to cope with that rather than assume, since the editor is a real page.
export function useReply() {
  return useContext(Ctx);
}
