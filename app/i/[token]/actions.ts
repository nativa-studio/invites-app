"use server";
import { submitRsvp } from "@/lib/guest/invite";
import { isValidToken } from "@/lib/tokens";
import type { PublicGuest } from "@/lib/db/types";

export type RsvpState = { ok: true; guest: PublicGuest } | { ok: false; error?: string };

function str(fd: FormData, k: string): string { return String(fd.get(k) ?? "").trim(); }
function num(fd: FormData, k: string): number | null { const v = Number(fd.get(k)); return Number.isFinite(v) && fd.get(k) !== null && fd.get(k) !== "" ? v : null; }

export async function rsvpAction(_prev: RsvpState, fd: FormData): Promise<RsvpState> {
  const token = str(fd, "token");
  const status = str(fd, "status");
  if (!isValidToken(token) || (status !== "yes" && status !== "no")) return { ok: false, error: "Something went wrong. Please try again." };
  try {
    const guest = await submitRsvp(token, {
      status,
      children: num(fd, "children"),
      adults: num(fd, "adults"),
      party_size: num(fd, "party_size"),
      party_names: str(fd, "party_names").split(/,|\n|\band\b|&/).map((s) => s.trim()).filter(Boolean),
      dietary: fd.getAll("dietary").map(String).filter(Boolean),
      dietary_note: str(fd, "dietary_note"),
      accessibility_note: str(fd, "accessibility_note"),
      custom_answer: str(fd, "custom_answer"),
      note: str(fd, "note"),
      emergency_name: str(fd, "emergency_name"),
      emergency_phone: str(fd, "emergency_phone"),
    });
    return { ok: true, guest };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message.includes("unknown token") ? "This link doesn't look right. Ask the host to send it again." : "Your reply didn't go through. Please try again." };
  }
}
