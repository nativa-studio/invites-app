"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { formatDateTime } from "@/lib/format";
import { inviteText, reminderText, smsLink, whatsappLink, type TemplateEvent } from "@/lib/messages";
import type { GuestRow } from "@/lib/db/types";
import { markSent, newLink, removeGuest } from "@/app/app/events/[id]/actions";
import { CopyButton } from "./CopyButton";
import { useHasShare } from "./capabilities";

type Props = { eventId: string; guests: GuestRow[]; event: TemplateEvent; site: string };

export function GuestList({ eventId, guests, event, site }: Props) {
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "pending" | "unsent">("all");
  const canShare = useHasShare();
  const [, start] = useTransition();
  const shown = guests.filter((g) => filter === "all" ? true : filter === "unsent" ? !g.sent_at : g.status === filter);
  const unsent = guests.filter((g) => !g.sent_at);
  const next = unsent[0];

  async function shareVia(g: GuestRow, remind = false) {
    const link = `${site}/i/${g.token}`;
    const body = remind ? reminderText(event, g, link) : inviteText(event, g, link);
    try {
      await navigator.share({ text: body });
      start(() => { void markSent(eventId, g.id, remind ? "reminded" : "sent"); });
    } catch {
      // The person closed the share sheet, or the browser has no share support.
    }
  }

  function sendVia(g: GuestRow, kind: "sms" | "wa", remind = false) {
    const link = `${site}/i/${g.token}`;
    const body = remind ? reminderText(event, g, link) : inviteText(event, g, link);
    const href = kind === "sms" ? smsLink(g.phone ?? "", body) : whatsappLink(g.phone ?? "", body);
    start(() => { void markSent(eventId, g.id, remind ? "reminded" : "sent"); });
    window.location.href = href;
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {next ? (
        <div className="card">
          <h2 className="h2">{copy.host.sendNext}</h2>
          <p><b>{next.contact_name || next.name}</b> <span className="muted">({unsent.length} to go)</span></p>
          <div className="actions">
            <button className="btn primary small" type="button" onClick={() => sendVia(next, "sms")}>{next.phone ? copy.host.text : copy.host.textPick}</button>
            {next.phone && <button className="btn small" type="button" onClick={() => sendVia(next, "wa")}>{copy.host.whatsapp}</button>}
            {canShare && <button className="btn small" type="button" onClick={() => void shareVia(next)}>{copy.host.share}</button>}
          </div>
        </div>
      ) : guests.length > 0 && <p className="muted">{copy.host.allSent}</p>}

      <div className="actions" role="tablist" aria-label="Filter guests">
        {(["all", "yes", "no", "pending", "unsent"] as const).map((f) => (
          <button key={f} type="button" className="btn small" aria-pressed={filter === f} style={filter === f ? { background: "var(--ink)", color: "#fff" } : undefined} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "yes" ? "Yes" : f === "no" ? "No" : f === "pending" ? "No reply" : "Not sent"}
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
                <span className={`pill ${g.status}`}>{g.status === "yes" ? "Yes" : g.status === "no" ? "No" : "No reply"}</span>
              </div>
              {detail && <p style={{ fontSize: 14 }}>{detail}</p>}
              <p className="trail">{trail}{g.phone ? ` · ${g.phone}` : " · no mobile, pick them in Messages"}</p>
              <div className="actions">
                <button type="button" className="btn small primary" onClick={() => sendVia(g, "sms", remind)}>{remind ? copy.host.remind : g.phone ? copy.host.text : copy.host.textPick}</button>
                {g.phone && <button type="button" className="btn small" onClick={() => sendVia(g, "wa", remind)}>{copy.host.whatsapp}</button>}
                {canShare && <button type="button" className="btn small" onClick={() => void shareVia(g, remind)}>{copy.host.share}</button>}
                <CopyButton text={link} label={copy.host.copy} />
                <button type="button" className="btn small" onClick={() => { if (confirm("Make a new link? The old one stops working.")) start(() => { void newLink(eventId, g.id); }); }}>{copy.host.newLink}</button>
                <button type="button" className="btn small" onClick={() => { if (confirm(`Remove ${g.name}?`)) start(() => { void removeGuest(eventId, g.id); }); }}>Remove</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
