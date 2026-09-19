"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { formatDateTime } from "@/lib/format";
import { inviteText, reminderText, smsLink, whatsappLink, type TemplateEvent } from "@/lib/messages";
import type { GuestRow } from "@/lib/db/types";
import { markSent, setGuestGroup } from "@/app/app/events/[id]/actions";
import { CopyButton } from "./CopyButton";
import { Sheet } from "./Sheet";
import { EditGuest } from "./EditGuest";
import { useHasShare } from "./capabilities";

type Props = { eventId: string; guests: GuestRow[]; event: TemplateEvent; site: string };

export function GuestList({ eventId, guests, event, site }: Props) {
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "pending" | "unsent" | "nogroup">("all");
  const canShare = useHasShare();
  const [busy, setBusy] = useState<string | null>(null);
  // Which guest has their ways-to-share open. One at a time, so the list stays a list.
  const [sharing, setSharing] = useState<string | null>(null);
  // The guest waiting on a group name, which is what the New group sheet is for.
  const [naming, setNaming] = useState<GuestRow | null>(null);
  // The guest open in the edit sheet.
  const [editing, setEditing] = useState<GuestRow | null>(null);
  // Which message the open panel will send. Guessed from where the guest is up to, then the host
  // decides: the guess was the whole of it before, and it was unsayable and invisible.
  const [mode, setMode] = useState<"invite" | "remind">("invite");

  // A guest is marked as sent the moment the Text button is tapped, because opening Messages
  // leaves the page and there is no way back to find out whether anything was actually sent. So
  // "already sent" is a guess, and a wrong one every time a host taps Text and then thinks better
  // of it, or the message does not go. Sending the invite again has to stay possible.
  function openShare(g: GuestRow) {
    setMode(g.status === "pending" && g.sent_at ? "remind" : "invite");
    setSharing(g.id);
  }
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
  //
  // Naming one opens the sheet, not the browser's own prompt box. The prompt arrived as a grey
  // system dialog with nothing of this app about it, could not show the examples as a hint under
  // the field, and on iOS sits over the page looking like the browser asking, not us.
  //
  // Opening it is a state change, which re-renders the row, which is what puts the select back on
  // the group the guest actually has. Otherwise cancelling left the row reading "New group...".
  function changeGroup(g: GuestRow, picked: string) {
    if (picked === "__new") {
      setNaming(g);
      return;
    }
    start(() => { void setGuestGroup(eventId, g.id, picked); });
  }

  function saveNewGroup(name: string) {
    const g = naming;
    setNaming(null);
    if (!g) return;
    start(() => { void setGuestGroup(eventId, g.id, name); });
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
  async function sendVia(g: GuestRow, kind: "sms" | "wa", remind = false, to?: string | null) {
    if (busy) return;
    setBusy(g.id);
    const link = `${site}/i/${g.token}`;
    const body = remind ? reminderText(event, g, link) : inviteText(event, g, link);
    const number = to ?? g.phone ?? "";
    const href = kind === "sms" ? smsLink(number, body) : whatsappLink(number, body);
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
          // Only the open panel's switch decides what goes out. A guest with nothing sent yet has
          // no switch, so it can only be the invite.
          const sendAsRemind = Boolean(g.sent_at) && mode === "remind";
          // Who there is to text. One row unless the guest carries a second person, and the
          // fallback name is the guest's own, because "Text" with no name under it is fine when
          // there is only one of them.
          const people = [
            { key: "1", who: g.contact_name || g.name, phone: g.phone },
            ...(g.phone_2 || g.contact_name_2 ? [{ key: "2", who: g.contact_name_2 || "Also", phone: g.phone_2 ?? null }] : []),
          ];
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
                <>
                  {/* Which of the two messages, shown only where both make sense. A guest who has
                      never been sent anything has nothing to be reminded about. */}
                  {g.sent_at && (
                    <div className="actions" role="group" aria-label={`What to send ${g.name}`}>
                      <button type="button" className="btn small" aria-pressed={mode === "invite"} onClick={() => setMode("invite")}>{copy.host.sendInvite}</button>
                      <button type="button" className="btn small" aria-pressed={mode === "remind"} onClick={() => setMode("remind")}>{copy.host.sendReminder}</button>
                    </div>
                  )}
                  {/* One row per person to text, when the guest has two. The name is on the
                      button, because "0403..." twice tells a host nothing about who is who. */}
                  {people.map((p) => (
                    <div className="actions" key={p.key}>
                      {people.length > 1 && <span className="who">{p.who}</span>}
                      <button type="button" className="btn small primary" disabled={busy !== null} onClick={() => void sendVia(g, "sms", sendAsRemind, p.phone)}>{p.phone ? copy.host.text : copy.host.textPick}</button>
                      {p.phone && <button type="button" className="btn small" disabled={busy !== null} onClick={() => void sendVia(g, "wa", sendAsRemind, p.phone)}>{copy.host.whatsapp}</button>}
                    </div>
                  ))}
                  <div className="actions">
                    {canShare && <button type="button" className="btn small" onClick={() => void shareVia(g, sendAsRemind)}>{copy.host.shareMore}</button>}
                    <CopyButton text={link} label={copy.host.copy} />
                    <button type="button" className="btn small" onClick={() => setSharing(null)}>{copy.host.shareClose}</button>
                  </div>
                </>
              ) : (
                <div className="actions">
                  {/* Always Share, never only Remind. The button used to become Remind the moment
                      a guest had been sent anything, which took sending the invite off the row
                      altogether: a message that did not go, or went to the wrong number, left no
                      way back to it. Which of the two goes out is chosen inside. */}
                  <button type="button" className="btn small primary" onClick={() => openShare(g)}>{copy.host.share}</button>
                  <button type="button" className="btn small" onClick={() => setEditing(g)}>{copy.host.edit}</button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Keyed by guest, so opening one never holds the last one's typing. */}
      {editing && (
        <EditGuest
          key={editing.id}
          eventId={eventId}
          guest={guests.find((g) => g.id === editing.id) ?? editing}
          known={known}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Keyed by guest, so naming a group for one guest never opens holding the last one's typing. */}
      {naming && (
        <NewGroupSheet
          key={naming.id}
          guest={naming}
          onClose={() => setNaming(null)}
          onSave={saveNewGroup}
        />
      )}
    </section>
  );
}

// Naming a group, in the sheet everything else here uses.
function NewGroupSheet({ guest, onClose, onSave }: { guest: GuestRow; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const clean = name.trim();

  // The keyboard should be up and in the field, since typing a name is the only thing to do here.
  useEffect(() => { field.current?.focus(); }, []);

  return (
    <Sheet title={copy.host.guestGroupNewTitle} blurb={copy.host.guestGroupFor(guest.name)} dirty={clean.length > 0} onClose={onClose}>
      <form
        className="sheet-body"
        onSubmit={(ev) => { ev.preventDefault(); if (clean) onSave(clean); }}
      >
        <div className="field">
          <label htmlFor="new-group">{copy.host.guestGroupAsk}</label>
          <input
            id="new-group"
            ref={field}
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="done"
          />
          <span className="hint">{copy.host.guestGroupEg}</span>
        </div>
        <div className="sheet-foot">
          <button className="btn primary" type="submit" disabled={!clean}>{copy.host.guestGroupSave}</button>
        </div>
      </form>
    </Sheet>
  );
}
