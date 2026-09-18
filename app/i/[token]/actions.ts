"use server";
import { submitRsvp } from "@/lib/guest/invite";
import { isValidToken } from "@/lib/tokens";
import { answerFromForm, formString } from "@/lib/rsvp-form";
import type { PublicGuest } from "@/lib/db/types";

export type RsvpState = { ok: true; guest: PublicGuest } | { ok: false; error?: string };

export async function rsvpAction(_prev: RsvpState, fd: FormData): Promise<RsvpState> {
  const token = formString(fd, "token");
  const answer = answerFromForm(fd);
  if (!isValidToken(token) || !answer) return { ok: false, error: "Something went wrong. Please try again." };
  try {
    return { ok: true, guest: await submitRsvp(token, answer) };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message.includes("unknown token") ? "This link doesn't look right. Ask the host to send it again." : "Your reply didn't go through. Please try again." };
  }
}
