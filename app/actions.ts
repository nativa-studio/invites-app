"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  AirtableError,
  GUEST_FIELDS,
  createGuest,
  getEvent,
  getGuestByToken,
  listGuests,
  updateGuest,
  type Guest,
  type RsvpStatus,
} from "@/lib/airtable";
import { clearHostCookie, passwordMatches, setHostCookie } from "@/lib/auth";
import { phoneKey } from "@/lib/format";
import { generateToken, isValidToken } from "@/lib/tokens";

export type RsvpState = {
  ok: boolean;
  error?: string;
  guest?: Pick<Guest, "name" | "status" | "partySize" | "message">;
};

export type SimpleState = { ok: boolean; error?: string };

const MAX_NAME = 80;
const MAX_MESSAGE = 500;

function text(fd: FormData, key: string, max: number): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function parseStatus(fd: FormData): RsvpStatus | null {
  const v = fd.get("status");
  return v === "Coming" || v === "Not coming" ? v : null;
}

function parsePartySize(fd: FormData, status: RsvpStatus, allowPlusOnes: boolean, max: number): number {
  if (status !== "Coming") return 0;
  if (!allowPlusOnes) return 1;
  const n = Number(fd.get("partySize"));
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.floor(n), 1), max);
}

function friendlyError(e: unknown): string {
  if (e instanceof AirtableError) {
    if (e.status === 0) return "The invite isn't connected to its guest list yet. Let the host know.";
    return "Couldn't save your reply just now. Please try again in a moment.";
  }
  return "Something went wrong. Please try again.";
}

// Personal link: the guest is already known, just record the answer.
export async function submitRsvp(_prev: RsvpState, fd: FormData): Promise<RsvpState> {
  const token = text(fd, "token", 40);
  const status = parseStatus(fd);
  if (!isValidToken(token) || !status) return { ok: false, error: "Please choose an answer." };

  try {
    const [guest, event] = await Promise.all([getGuestByToken(token), getEvent()]);
    if (!guest) return { ok: false, error: "This invite link doesn't look right." };

    const partySize = parsePartySize(fd, status, event?.allowPlusOnes ?? false, event?.maxPartySize ?? 6);
    const message = text(fd, "message", MAX_MESSAGE);

    const updated = await updateGuest(guest.id, {
      [GUEST_FIELDS.status]: status,
      [GUEST_FIELDS.partySize]: partySize,
      [GUEST_FIELDS.message]: message,
      [GUEST_FIELDS.respondedAt]: new Date().toISOString(),
    });

    revalidatePath(`/i/${token}`);
    revalidatePath("/host");
    return {
      ok: true,
      guest: { name: updated.name, status: updated.status, partySize: updated.partySize, message: updated.message },
    };
  } catch (e) {
    console.error("submitRsvp failed", e);
    return { ok: false, error: friendlyError(e) };
  }
}

// Open link: we don't know who they are, so ask. If the name or phone matches
// an invited guest who hasn't replied yet, record it against that row instead
// of creating a duplicate. Otherwise a new row is created and flagged
// "Open link" so the host can see it came in unprompted.
export async function submitOpenRsvp(_prev: RsvpState, fd: FormData): Promise<RsvpState> {
  // Honeypot: real people never fill this hidden field.
  if (text(fd, "website", 10)) redirect("/");

  const name = text(fd, "name", MAX_NAME);
  const phone = text(fd, "phone", 30);
  const status = parseStatus(fd);
  if (!name) return { ok: false, error: "Please tell us your name." };
  if (!status) return { ok: false, error: "Please choose an answer." };

  let token = "";
  try {
    const [event, guests] = await Promise.all([getEvent(), listGuests()]);
    const partySize = parsePartySize(fd, status, event?.allowPlusOnes ?? false, event?.maxPartySize ?? 6);
    const message = text(fd, "message", MAX_MESSAGE);

    const key = phoneKey(phone);
    const lowerName = name.toLowerCase();
    const match =
      (key && guests.find((g) => g.status === "Pending" && phoneKey(g.phone) === key)) ||
      guests.find((g) => g.status === "Pending" && g.name.trim().toLowerCase() === lowerName);

    const fields = {
      [GUEST_FIELDS.status]: status,
      [GUEST_FIELDS.partySize]: partySize,
      [GUEST_FIELDS.message]: message,
      [GUEST_FIELDS.respondedAt]: new Date().toISOString(),
    };

    if (match) {
      token = match.token || generateToken();
      await updateGuest(match.id, {
        ...fields,
        ...(match.token ? {} : { [GUEST_FIELDS.token]: token }),
        ...(match.phone || !phone ? {} : { [GUEST_FIELDS.phone]: phone }),
      });
    } else {
      token = generateToken();
      await createGuest({
        [GUEST_FIELDS.name]: name,
        [GUEST_FIELDS.phone]: phone,
        [GUEST_FIELDS.token]: token,
        [GUEST_FIELDS.source]: "Open link",
        ...fields,
      });
    }
    revalidatePath("/host");
  } catch (e) {
    console.error("submitOpenRsvp failed", e);
    return { ok: false, error: friendlyError(e) };
  }

  // Send them to their own link so they can change their answer later.
  redirect(`/i/${token}?done=1`);
}

// ---- Host ------------------------------------------------------------------

export async function hostLogin(_prev: SimpleState, fd: FormData): Promise<SimpleState> {
  const password = text(fd, "password", 200);
  if (!passwordMatches(password)) return { ok: false, error: "That password isn't right." };
  await setHostCookie();
  return { ok: true };
}

export async function hostLogout(): Promise<void> {
  await clearHostCookie();
  redirect("/host");
}

export async function addGuest(_prev: SimpleState, fd: FormData): Promise<SimpleState> {
  const { isHostAuthed } = await import("@/lib/auth");
  if (!(await isHostAuthed())) return { ok: false, error: "Please log in again." };

  const name = text(fd, "name", MAX_NAME);
  const phone = text(fd, "phone", 30);
  if (!name) return { ok: false, error: "A name is needed." };

  try {
    await createGuest({
      [GUEST_FIELDS.name]: name,
      [GUEST_FIELDS.phone]: phone,
      [GUEST_FIELDS.token]: generateToken(),
      [GUEST_FIELDS.status]: "Pending",
      [GUEST_FIELDS.source]: "Invited",
    });
    revalidatePath("/host");
    return { ok: true };
  } catch (e) {
    console.error("addGuest failed", e);
    return { ok: false, error: friendlyError(e) };
  }
}
