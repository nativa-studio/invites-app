import type { Invite, Palette, PublicEvent, PublicGuest } from "@/lib/db/types";
import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";
import { eventForRender } from "@/lib/db/events";

// Guest pages only ever call these. They run as anon and hit security definer functions.
export async function getInvite(token: string): Promise<Invite | null> {
  if (!isValidToken(token)) return null;
  const invite = await callGuestRpc<Invite | null>("get_invite", { p_token: token });
  return invite ? { ...invite, event: eventForRender(invite.event) } : null;
}

// Somebody has looked at their invite. Its own call, because reading an invite and recording that
// it was read are two different things and get_invite used to do both: the page's generateMetadata
// calls it, and generateMetadata is what a chat app runs when it fetches the link to draw a
// preview card, so every guest was marked as having opened theirs seconds before it was sent.
//
// Never allowed to break the page it is measuring, and never awaited for anything the guest sees.
export async function markOpened(token: string): Promise<void> {
  if (!isValidToken(token)) return;
  try {
    await callGuestRpc<null>("mark_invite_opened", { p_token: token });
  } catch {
    // A database without migration 0032 has no function to call. The invite still opens.
  }
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  const data = await callGuestRpc<{ event: PublicEvent } | null>("get_event_by_slug", { p_slug: slug });
  return data?.event ? eventForRender(data.event) : null;
}

export type InviteCard = {
  addressee: string;
  title: string;
  share_title: string | null;
  share_description: string | null;
  intro: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  time_note: string | null;
  theme_id: string;
  palette: Palette | null;
  /** Which design, so the card knows which paper its envelope is cut from. Added in 0012, so an
   *  older database sends nothing and the card falls back to the suite's red. */
  layout_id: string | null;
  /** The one ink, for the design whose envelope is mixed rather than picked. Added in 0036, so
   *  an older database sends nothing and the mix falls back to charcoal. */
  ink?: string | null;
  invite_image_path: string | null;
};

// Everything the link preview needs, and nothing that records a visit.
export async function getInviteCard(token: string): Promise<InviteCard | null> {
  if (!isValidToken(token)) return null;
  return (await callGuestRpc<InviteCard | null>("get_invite_card", { p_token: token })) ?? null;
}

export type RsvpInput = {
  status: "yes" | "no";
  children?: number | null;
  adults?: number | null;
  party_size?: number | null;
  party_names?: string[];
  dietary?: string[];
  dietary_note?: string;
  allergies?: string;
  accessibility_note?: string;
  custom_answer?: string;
  note?: string;
  emergency_name?: string;
  emergency_phone?: string;
};

export async function submitRsvp(token: string, input: RsvpInput): Promise<PublicGuest> {
  return callGuestRpc<PublicGuest>("submit_rsvp", {
    p_token: token,
    p_status: input.status,
    p_children: input.children ?? null,
    p_adults: input.adults ?? null,
    p_party_size: input.party_size ?? null,
    p_party_names: input.party_names ?? null,
    p_dietary: input.dietary ?? null,
    p_dietary_note: input.dietary_note ?? null,
    p_allergies: input.allergies ?? null,
    p_accessibility_note: input.accessibility_note ?? null,
    p_custom_answer: input.custom_answer ?? null,
    p_note: input.note ?? null,
    p_emergency_name: input.emergency_name ?? null,
    p_emergency_phone: input.emergency_phone ?? null,
  });
}

// A host can hand out a link per group, so whoever replies through it arrives already labelled
// with where they are from. The group rides in the link rather than in a question, because the
// host already knows the answer and the guest should not have to.
//
// The four argument function arrives in migration 0005. A database that has not had it yet still
// claims the link; the label is the only thing lost, and the reply is the thing that matters.
export async function claimGroupLink(slug: string, name: string, phone: string, group?: string | null): Promise<string> {
  const args = { p_slug: slug, p_name: name, p_phone: phone || null };
  try {
    const data = await callGuestRpc<{ token: string }>("claim_group_link", { ...args, p_group: group || null });
    return data.token;
  } catch (err) {
    if (!isMissingFunction(err)) throw err;
    const data = await callGuestRpc<{ token: string }>("claim_group_link", args);
    return data.token;
  }
}

// Postgres and PostgREST word it differently, and neither carries a code we can read through the
// client, so the wording is what there is to go on.
function isMissingFunction(err: unknown): boolean {
  const m = err instanceof Error ? err.message : "";
  return /could not find the function|does not exist/i.test(m);
}
