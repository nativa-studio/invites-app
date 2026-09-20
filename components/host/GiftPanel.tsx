"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { formatMoney, firstName } from "@/lib/format";
import { smsLink, whatsappLink } from "@/lib/messages";
import type { GiftTally, HostGift } from "@/lib/db/gift";
import { saveGift } from "@/app/app/events/[id]/actions";
import { CopyButton } from "./CopyButton";

// The group gift, from the host's side.
//
// Three questions and then a handover. The host says what the present is, roughly what it might
// come to, and who is running it, and then their job is to send that person their link. After
// that the host is a spectator: the organiser owns the bank details, the note and the updates,
// because the organiser is usually not the host and the feature exists so the host does not have
// to chase forty people for money at their own party.
export function GiftPanel({ eventId, eventTitle, enabled, gift, tally, candidates, organiserLink, organiserPhone, heading }: {
  eventId: string;
  eventTitle: string;
  enabled: boolean;
  gift: HostGift | null;
  tally: GiftTally;
  candidates: { id: string; name: string }[];
  organiserLink: string | null;
  organiserPhone: string | null;
  heading: string;
}) {
  const [pending, start] = useTransition();
  const [on, setOn] = useState(enabled);
  const [what, setWhat] = useState(gift?.description ?? "");
  const [target, setTarget] = useState(gift?.target != null ? String(gift.target) : "");
  const [organiser, setOrganiser] = useState(gift?.organiserGuestId ?? "");

  function save(next?: Partial<{ on: boolean }>) {
    const isOn = next?.on ?? on;
    const money = target.replace(/[^0-9.]/g, "");
    start(async () => {
      await saveGift(eventId, {
        enabled: isOn,
        description: what.trim() || null,
        target: money === "" || Number.isNaN(Number(money)) ? null : Number(money),
        organiserGuestId: organiser || null,
      });
    });
  }

  const who = gift?.organiserName ?? null;
  const handover = who && organiserLink
    ? copy.host.giftHandoverBody(firstName(who), gift?.description || eventTitle, organiserLink)
    : "";

  return (
    <>
      <div className="card">
        <h2 className="h2">{heading}</h2>
        <p className="muted">{copy.host.giftBlurb}</p>
        <label className="switch">
          <input
            type="checkbox"
            checked={on}
            disabled={pending}
            onChange={(ev) => { setOn(ev.target.checked); save({ on: ev.target.checked }); }}
          />
          {copy.host.giftSwitch}
        </label>
      </div>

      {on && (
        <div className="card">
          <div className="field">
            <label htmlFor="gift-what">{copy.host.giftWhat}</label>
            <input id="gift-what" type="text" value={what} onChange={(ev) => setWhat(ev.target.value)} onBlur={() => save()} autoComplete="off" />
            <span className="hint">{copy.host.giftWhatHint}</span>
          </div>
          <div className="field">
            <label htmlFor="gift-target">{copy.host.giftTarget}</label>
            <input id="gift-target" type="text" inputMode="decimal" value={target} onChange={(ev) => setTarget(ev.target.value)} onBlur={() => save()} autoComplete="off" />
            <span className="hint">{copy.host.giftTargetHint}</span>
          </div>
          <div className="field">
            <label htmlFor="gift-organiser">{copy.host.giftOrganiser}</label>
            <select
              id="gift-organiser"
              value={organiser}
              disabled={pending || candidates.length === 0}
              onChange={(ev) => { setOrganiser(ev.target.value); start(async () => {
                const money = target.replace(/[^0-9.]/g, "");
                await saveGift(eventId, {
                  enabled: true,
                  description: what.trim() || null,
                  target: money === "" || Number.isNaN(Number(money)) ? null : Number(money),
                  organiserGuestId: ev.target.value || null,
                });
              }); }}
            >
              <option value="">{copy.host.giftOrganiserNone}</option>
              {candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="hint">{candidates.length === 0 ? copy.host.giftPickFirst : copy.host.giftOrganiserHint}</span>
          </div>
        </div>
      )}

      {/* The handover. It is the host's only remaining job, so it gets its own card rather than
          a link tucked under the picker. */}
      {on && who && organiserLink && (
        <div className="card">
          <h2 className="h2">{copy.host.giftHandover}</h2>
          <p className="muted">{copy.host.giftHandoverHint}</p>
          <div className="actions">
            {organiserPhone && <a className="btn primary small" href={smsLink(organiserPhone, handover)}>{copy.host.giftText}</a>}
            {organiserPhone && <a className="btn small" href={whatsappLink(organiserPhone, handover)}>{copy.host.giftWhatsapp}</a>}
            <CopyButton text={handover} label={copy.host.giftCopy} />
          </div>
          {!gift?.payDetails && <p className="hint">{copy.host.giftWaitingSetup(firstName(who))}</p>}
        </div>
      )}

      {on && (
        <div className="card">
          <h2 className="h2">{copy.host.giftHow}</h2>
          {/* A surprise gift is usually a gift for the host reading this, so the numbers are
              withheld by the row policy rather than by this screen choosing not to show them.
              Null means withheld; zero means nobody has chipped in. They read very differently. */}
          {gift?.surprise && tally.count === 0 && !gift.organiserProfileId
            ? <p className="muted">{copy.host.giftHidden}</p>
            : tally.count
              ? <p>{copy.host.giftSoFar(formatMoney(tally.total ?? 0), tally.count)}</p>
              : <p className="muted">{copy.host.giftNobody}</p>}
        </div>
      )}
    </>
  );
}
