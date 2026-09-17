import type { Invite, Palette, PublicEvent, PublicGuest } from "@/lib/db/types";
import { isValidToken } from "@/lib/tokens";
import { callGuestRpc } from "./rpc";
import { withSectionDefaults } from "@/lib/db/events";

// Guest pages only ever call these. They run as anon and hit security definer functions.
export async function getInvite(token: string): Promise<Invite | null> {
  if (!isValidToken(token)) return null;
  const invite = await callGuestRpc<Invite | null>("get_invite", { p_token: token });
  return invite ? { ...invite, event: withSectionDefaults(invite.event) } : null;
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  const data = await callGuestRpc<{ event: PublicEvent } | null>("get_event_by_slug", { p_slug: slug });
  return data?.event ? withSectionDefaults(data.event) : null;
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
    p_accessibility_note: input.accessibility_note ?? null,
    p_custom_answer: input.custom_answer ?? null,
    p_note: input.note ?? null,
    p_emergency_name: input.emergency_name ?? null,
    p_emergency_phone: input.emergency_phone ?? null,
  });
}

export async function claimGroupLink(slug: string, name: string, phone: string): Promise<string> {
  const data = await callGuestRpc<{ token: string }>("claim_group_link", { p_slug: slug, p_name: name, p_phone: phone || null });
  return data.token;
}
