"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { formatDateTime } from "@/lib/format";
import { inviteText, reminderText, smsLink, whatsappLink, type TemplateEvent } from "@/lib/messages";
import type { GuestRow } from "@/lib/db/types";
import { markSent, newLink, removeGuest, setGuestGroup } from "@/app/app/events/[id]/actions";
import { CopyButton } from "./CopyButton";
import { useHasShare } from "./capabilities";

type Props = { eventId: string; guests: GuestRow[]; event: TemplateEvent; site: string };

export function GuestList({ eventId, guests, event, site }: Props) {
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "pending" | "unsent" | "nogroup">("all");
  const canShare = useHasShare();
  const [busy, setBusy] = useState<string | null>(null);
  // Which guest has their ways-to-share open. One at a time, so the list stays a list.
  const [sharing, setSharing] = useState<string | null>(null);
  const [, start] = useTransition();
  // "No group" is here because finding the unlabelled ones by scrolling is the thing that makes
  // labelling a long list not worth starting.
  const shown = guests.filter((g) =>
    filter === "all" ? true
      : filter === "unsent" ? !g.sent_at
      : filter === "nogroup" ? !g.groups?.length
      : g.status === filter);
  // The groups already on this list. Offering them by name is what stops "School" and "school"
  // becoming two groups, which is the whole value of the label.
  const known = [...new Set(guests.flatMap((g) => g.groups ?? []))].sort((a, b) => a.localeCompare(b));

  // Changing a guest's group. A new name is asked for rather than typed into every row, because
  // a host names a group once and then uses it forty times.
  function changeGroup(g: GuestRow, picked: string) {
    if (picked === "__new") {
      const name = window.prompt(copy.host.guestGroupAsk, "")?.trim();
      if (!name) return;
      start(() => { void setGuestGroup(eventId, g.id, name); });
      return;
    }
    start(() => { void setGuestGroup(eventId, g.id, picked); });
  }
  const unsent = guests.filter((g) => !g.sent_at);
  const next = unsent[0];

  async function shareVia(g: GuestRow, remind = false) {
    const link = `${site}/i/${g.token}`;
    const body = remind ? reminderText(event, g, link) : inviteText(event, g, link);
    try {
      await navigator.share({ text: body });
    } catch {
      // The person closed the share sheet without sending, so nothing is marked.
      return;
    }
    start(() => { void markSent(eventId, g.id, remind ? "reminded" : "sent"); });
  }

  // Opening WhatsApp leaves this page, which would cancel a request still in flight, so the
  // guest is marked as sent before anything navigates. Messages does not unload the page, but
  // the same order keeps both routes honest.
  async function sendVia(g: GuestRow, kind: "sms" | "wa", remind = false) {
    if (busy) return;
    setBusy(g.id);
    const link = `${site}/i/${g.token}`;
    const body = remind ? reminderText(event, g, link) : inviteText(event, g, link);
    const href = kind === "sms" ? smsLink(g.phone ?? "", body) : whatsappLink(g.phone ?? "", body);
    try {
      await markSent(eventId, g.id, remind ? "reminded" : "sent");
    } catch {
      // Sending matters more than the record of it. Open the message either way.
    }
    setBusy(null);
    window.location.href = href;
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {next ? (
        <div className="card">
          <h2 className="h2">{copy.host.sendNext}</h2>
          <p><b>{next.contact_name || next.name}</b> <span className="muted">({unsent.length} to go)</span></p>
          <div className="actions">
            <button className="btn primary small" type="button" disabled={busy !== null} onClick={() => void sendVia(next, "sms")}>{next.phone ? copy.host.text : copy.host.textPick}</button>
            {next.phone && <button className="btn small" type="button" disabled={busy !== null} onClick={() => void sendVia(next, "wa")}>{copy.host.whatsapp}</button>}
            {canShare && <button className="btn small" type="button" onClick={() => void shareVia(next)}>{copy.host.share}</button>}
          </div>
        </div>
      ) : guests.length > 0 && <p className="muted">{copy.host.allSent}</p>}

      <div className="actions" role="tablist" aria-label="Filter guests">
        {(["all", "yes", "no", "pending", "unsent", "nogroup"] as const).map((f) => (
          <button key={f} type="button" className="btn small" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "yes" ? "Yes" : f === "no" ? "No" : f === "pending" ? "No reply" : f === "unsent" ? "Not sent" : copy.host.guestGroupNone}
          </button>
        ))}
      </div>

      <div className="guest-list">
        {shown.map((g) => {
          const link = `${site}/i/${g.token}`;
          const trail = [
            g.sent_at ? `${copy.host.trail.sent} ${formatDateTime(g.sent_at)}` : g.source === "group_link" ? "came in via the group link" : copy.host.trail.added,
            g.opened_at ? `${copy.host.trail.opened} ${formatDateTime(g.opened_at)}` : null,
            g.replied_at ? `${copy.host.trail.replied} ${formatDateTime(g.replied_at)}` : null,
            g.reminded_at ? `${copy.host.trail.reminded} ${formatDateTime(g.reminded_at)}` : null,
          ].filter(Boolean).join(" · ");
          const remind = g.status === "pending" && Boolean(g.sent_at);
          const expecting = copy.host.expecting(g.expected_children, g.expected_adults);
          const detail = g.status === "yes"
            ? [g.party_size ? `${g.party_size} coming` : null, g.party_names.length ? g.party_names.join(", ") : null, g.dietary.length ? g.dietary.join(", ") : null, g.dietary_note, g.accessibility_note ? `Access: ${g.accessibility_note}` : null, g.note ? `"${g.note}"` : null].filter(Boolean).join(" · ")
            : [g.status === "pending" && expecting ? expecting : null, g.note ? `"${g.note}"` : null].filter(Boolean).join(" · ");
          return (
            <article className="guest" key={g.id}>
              <div className="row">
                <span className="name">{g.name}{g.contact_name && g.contact_name !== g.name ? <span className="muted"> · {g.contact_name}</span> : null}</span>
                {/* "No reply" on a guest who has never been sent their link reads as their fault.
                    Until it goes out, the thing that has not happened is the sending. */}
                <span className={`pill ${g.status === "pending" && !g.sent_at ? "unsent" : g.status}`}>
                  {g.status === "yes" ? "Yes" : g.status === "no" ? "No" : g.sent_at ? copy.host.noReply : copy.host.notSent}
                </span>
              </div>
              {detail && <p style={{ fontSize: 14 }}>{detail}</p>}
              <p className="trail">{trail}{g.phone ? ` · ${g.phone}` : " · no mobile, pick them in Messages"}</p>
              <label className="guest-group">
                <span>{copy.host.guestGroup}</span>
                <select
                  value={g.groups?.[0] ?? ""}
                  onChange={(ev) => changeGroup(g, ev.target.value)}
                  aria-label={`${copy.host.guestGroup} for ${g.name}`}
                >
                  <option value="">{copy.host.guestGroupNone}</option>
                  {known.map((n) => <option key={n} value={n}>{n}</option>)}
                  {/* A guest may already carry a group nobody else has, so it is never missing
                      from its own list. */}
                  {g.groups?.[0] && !known.includes(g.groups[0]) && <option value={g.groups[0]}>{g.groups[0]}</option>}
                  <option value="__new">{copy.host.guestGroupNew}</option>
                </select>
              </label>
              {/* One Share, which opens the ways to share. Six buttons on every row meant the two
                  that matter, Text and WhatsApp, sat in a crowd with New link and Remove, and a
                  destructive button was one row away from the one you tap fifty times. */}
              {sharing === g.id ? (
                <div className="actions">
                  <button type="button" className="btn small primary" disabled={busy !== null} onClick={() => void sendVia(g, "sms", remind)}>{g.phone ? copy.host.text : copy.host.textPick}</button>
                  {g.phone && <button type="button" className="btn small" disabled={busy !== null} onClick={() => void sendVia(g, "wa", remind)}>{copy.host.whatsapp}</button>}
                  {canShare && <button type="button" className="btn small" onClick={() => void shareVia(g, remind)}>{copy.host.shareMore}</button>}
                  <CopyButton text={link} label={copy.host.copy} />
                  <button type="button" className="btn small" onClick={() => setSharing(null)}>{copy.host.shareClose}</button>
                </div>
              ) : (
                <div className="actions">
                  <button type="button" className="btn small primary" onClick={() => setSharing(g.id)}>{remind ? copy.host.remind : copy.host.share}</button>
                  <button type="button" className="btn small" onClick={() => { if (confirm("Make a new link? The old one stops working.")) start(() => { void newLink(eventId, g.id); }); }}>{copy.host.newLink}</button>
                  <button type="button" className="btn small" onClick={() => { if (confirm(`Remove ${g.name}?`)) start(() => { void removeGuest(eventId, g.id); }); }}>Remove</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
