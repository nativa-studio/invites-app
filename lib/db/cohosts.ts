import "server-only";
import { createClient, createAnonClient } from "@/lib/supabase/server";

// Who is running an event, and the link that lets somebody else join them.
//
// The ownership table has been here since the first migration and nothing could ever write a
// second row into it. See supabase/migrations/0049 for the half that was missing.

/** One person with a hand on this event. `me` is whoever is reading. */
export type Host = {
  profile_id: string;
  name: string | null;
  email: string | null;
  role: "owner" | "cohost";
  added_at: string;
  me: boolean;
};

/** Everybody running this event, owner first. Empty for anybody who is not a member, which is
 *  the function's own rule rather than this file's. */
export async function loadHosts(eventId: string): Promise<Host[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("event_hosts", { p_event: eventId });
  // A database without migration 0049 has no function to call. One host, the one reading, is a
  // truthful fallback for a screen whose whole subject is that there can now be more than one.
  if (error) return [];
  return (data ?? []) as Host[];
}

/** What a join link says before anybody signs in: whose party it is, and nothing else.
 *
 *  Anon, because the person holding the link has no session yet, and that is the point of the
 *  page. Null means the code is unknown or the link has been switched off, which the page and
 *  the sign-in door both read as closed. */
export async function peekJoin(code: string): Promise<{ title: string; host_line: string | null } | null> {
  if (!/^[a-z0-9]{6,24}$/.test(code)) return null;
  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("join_peek", { p_code: code });
  if (error) return null;
  return (data ?? null) as { title: string; host_line: string | null } | null;
}

export type JoinResult =
  | { ok: true; event_id: string; role: "owner" | "cohost"; joined: boolean }
  | { ok: false; reason: "signed_out" | "closed" };

/** Taking up the invitation, as whoever is signed in. */
export async function joinEvent(code: string): Promise<JoinResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_event", { p_code: code });
  if (error) return { ok: false, reason: "closed" };
  return data as JoinResult;
}
