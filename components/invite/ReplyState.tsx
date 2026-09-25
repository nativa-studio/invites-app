"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { Plate } from "@/lib/guest/plate";
import type { Gift } from "@/lib/guest/gift";
import type { WishState } from "@/lib/guest/wishes";

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
  /** Which ideas have been crossed off, and which of them by you. Null is a page with no list to
   *  speak of; an empty array is a list with nothing crossed off yet, and the two draw
   *  differently, so they are not folded together. */
  wishes: WishState[] | null;
  /** The host trying their own invite. Everything works and nothing is written. */
  pretend?: boolean;
};

const Ctx = createContext<{ reply: Reply; report: (r: Partial<Reply>) => void } | null>(null);

// Reported in parts, not replaced.
//
// It took whole values until the wish list arrived. The reply knows the answer and the two boards
// that come back with it, and knows nothing about which ideas have been crossed off; the list
// knows that and nothing about the answer. Handing over a whole value meant whichever spoke last
// wiped what the other had said, and crossing an idea off unset the guest's own reply until the
// page was reloaded. Merging is what the two of them actually mean: this part changed, the rest
// stands.
export function ReplyProvider({ initial, children }: { initial: Reply; children: React.ReactNode }) {
  const [reply, setReply] = useState<Reply>(initial);
  const report = useCallback((patch: Partial<Reply>) => setReply((v) => ({ ...v, ...patch })), []);
  return <Ctx.Provider value={{ reply, report }}>{children}</Ctx.Provider>;
}

// Null outside a provider, which is the editor drawing the invite with nobody answering. Every
// reader has to cope with that rather than assume, since the editor is a real page.
export function useReply() {
  return useContext(Ctx);
}
