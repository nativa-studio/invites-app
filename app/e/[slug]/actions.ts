"use server";
import { claimGroupLink, getEventBySlug, submitRsvp } from "@/lib/guest/invite";
import { isValidToken } from "@/lib/tokens";
import { answerFromForm, formString } from "@/lib/rsvp-form";
import { googleCalendarLink } from "@/lib/calendar";
import { getPlate, type Plate } from "@/lib/guest/plate";
import { getGift, type Gift } from "@/lib/guest/gift";
import { getSiteUrl, inviteLink } from "@/lib/site-url";
import type { PublicGuest } from "@/lib/db/types";

export type GroupState =
  // The plate board rides back with the reply. A guest on the group link has no token until they
  // answer, so there is no earlier moment to have fetched it, and the page they are standing on
  // was rendered before they existed.
  | { ok: true; guest: PublicGuest; token: string; googleLink: string | null; icsLink: string; plate: Plate | null; gift: Gift | null }
  | { ok: false; error?: string };

// Replying through the group link.
//
// It used to be two pages: a form that asked who you were, then a jump to a personal link where
// the actual question waited. So the first thing a guest met was a form about themselves, and
// the invite they had just opened disappeared. Now the reply is the reply. The name is asked as
// part of answering, once there is an answer worth attaching it to, and the yes or no and the
// thank you happen where the guest is already standing.
export async function groupRsvpAction(_prev: GroupState, fd: FormData): Promise<GroupState> {
  const slug = formString(fd, "slug");
  const answer = answerFromForm(fd);
  if (!answer) return { ok: false, error: "Something went wrong. Please try again." };

  // Changing an answer: the guest already has a link of their own from the first reply, so there
  // is nobody new to claim and no risk of a second row under the same name.
  let token = formString(fd, "token");
  if (!isValidToken(token)) {
    const name = formString(fd, "name");
    if (name.length < 2) return { ok: false, error: "Please put your name in, so the host knows who replied." };
    try {
      token = await claimGroupLink(slug, name, formString(fd, "phone"), formString(fd, "group") || null);
    } catch (e) {
      const closed = e instanceof Error && e.message.includes("link closed");
      return { ok: false, error: closed ? "This link has been closed. Text the host and they'll send you your own." : "That didn't go through. Please try again." };
    }
  }

  try {
    const guest = await submitRsvp(token, answer);
    const e = await getEventBySlug(slug);
    const site = await getSiteUrl();
    return {
      ok: true,
      guest,
      token,
      googleLink: e ? googleCalendarLink(e, inviteLink(site, token)) : null,
      icsLink: `/i/${token}/invite.ics`,
      plate: guest.status === "yes" ? await getPlate(token) : null,
      gift: await getGift(token),
    };
  } catch {
    return { ok: false, error: "Your reply didn't go through. Please try again." };
  }
}
