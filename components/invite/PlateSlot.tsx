"use client";
import { PlateCard } from "./PlateCard";
import { useReply } from "./ReplyState";

// Bring a plate, in its own place on the page rather than underneath the reply.
//
// It draws nothing until somebody has said yes, which is the same rule it has always had: what
// to bring is a question for a person who is coming, and a dish claimed by somebody who then says
// no is a dish nobody is carrying.
export function PlateSlot({ title, announce }: { title?: string; announce?: React.ReactNode }) {
  const ctx = useReply();
  if (!ctx) return <>{announce}</>;
  const { token, status, plate, pretend } = ctx.reply;
  // The board once somebody has said yes, and before that whatever the invite wants to say about
  // the plate: the announcement where the host has switched it on, nothing where they have not.
  // One slot, one card in it, in the place the host put it. Read from the live answer rather than
  // from a prop, so the board replaces the announcement the moment they press yes rather than at
  // the next page load.
  if (status !== "yes" || !plate?.enabled) return <>{announce}</>;
  return <PlateCard token={token} plate={plate} pretend={pretend} title={title} />;
}
