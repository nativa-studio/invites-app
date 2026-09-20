"use client";
import { PlateCard } from "./PlateCard";
import { useReply } from "./ReplyState";

// Bring a plate, in its own place on the page rather than underneath the reply.
//
// It draws nothing until somebody has said yes, which is the same rule it has always had: what
// to bring is a question for a person who is coming, and a dish claimed by somebody who then says
// no is a dish nobody is carrying.
export function PlateSlot() {
  const ctx = useReply();
  if (!ctx) return null;
  const { token, status, plate, pretend } = ctx.reply;
  if (status !== "yes" || !plate?.enabled) return null;
  return <PlateCard token={token} plate={plate} pretend={pretend} />;
}
