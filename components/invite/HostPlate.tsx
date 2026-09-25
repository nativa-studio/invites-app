"use client";
import { PlateSlot } from "./PlateSlot";
import { PreviewPlate } from "./PreviewExtras";
import { useReply } from "./ReplyState";

// Bring a plate, on the host's own screen, where it has to be two things at once.
//
// A guest sees the board only after they have said yes, which is right: what to bring is a
// question for somebody who is coming. A host has not said yes and never will, so on their screen
// the board would simply not be there, and with it would go the pencil, and with the pencil the
// only way to reach what the block says.
//
// So: the stand-in until they press yes, the real board after. Press yes on your own invite and
// the board appears and works, exactly as a guest's does, which is the whole point of there being
// one screen rather than an editing one and a preview one.
export function HostPlate({ note, mode, off }: { note: string | null; mode: string; off?: boolean }) {
  const ctx = useReply();
  // Off means the block is switched off for guests. It still draws here, faded, because the
  // switch that turns it back on is behind this card's pencil and nothing else opens it.
  if (!off && ctx?.reply.status === "yes") return <PlateSlot />;
  return <PreviewPlate note={note} mode={mode} off={off} />;
}
