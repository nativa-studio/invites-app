"use server";
import { submitRsvp } from "@/lib/guest/invite";
import { isValidToken } from "@/lib/tokens";
import { answerFromForm, formString } from "@/lib/rsvp-form";
import { getPlate, type Plate } from "@/lib/guest/plate";
import type { PublicGuest } from "@/lib/db/types";

// The plate board rides back with the reply, exactly as it does on the group link.
//
// It has to. The page a guest is standing on was rendered before they answered, when they were
// still pending and there was no board to send them, and replying swaps one card for another in
// the browser rather than asking the server for the page again. So a guest who tapped yes on
// their own link saw the thank you and never saw the list: it only turned up if they happened to
// open the link a second time, days later, which is not a thing anybody does.
//
// Fetched only for a yes. A no does not open the board, and there is no reason to go and get one.
export type RsvpState =
  | { ok: true; guest: PublicGuest; plate: Plate | null }
  | { ok: false; error?: string };

export async function rsvpAction(_prev: RsvpState, fd: FormData): Promise<RsvpState> {
  const token = formString(fd, "token");
  const answer = answerFromForm(fd);
  if (!isValidToken(token) || !answer) return { ok: false, error: "Something went wrong. Please try again." };
  try {
    const guest = await submitRsvp(token, answer);
    return { ok: true, guest, plate: guest.status === "yes" ? await getPlate(token) : null };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message.includes("unknown token") ? "This link doesn't look right. Ask the host to send it again." : "Your reply didn't go through. Please try again." };
  }
}
