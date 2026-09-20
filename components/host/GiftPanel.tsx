"use client";
import { useState, useTransition } from "react";
import { copy } from "@/lib/copy";
import { formatMoney, firstName } from "@/lib/format";
import { smsLink, whatsappLink } from "@/lib/messages";
import type { GiftTally, GiftWho, HostGift } from "@/lib/db/gift";
import { postGiftUpdate, saveGift, saveGiftDetails } from "@/app/app/events/[id]/actions";
import { CopyButton } from "./CopyButton";

const money = (v: string) => {
  const raw = v.replace(/[^0-9.]/g, "");
  return raw === "" || Number.isNaN(Number(raw)) ? null : Number(raw);
};

// The group gift, from the host's side.
//
// Two shapes, depending on who is running it. Hand it to a guest and the host's job is three
// questions and a handover text, after which they are a spectator. Keep it yourself and the rest
// of it opens up here: where the money goes, the note, the updates, who has paid and who still
// needs asking. The same columns either way, so a gift handed over later loses nothing.
export function GiftPanel({ eventId, eventTitle, enabled, gift, tally, who, candidates, organiserLink, organiserPhone, inviteLinks, heading }: {
  eventId: string;
  eventTitle: string;
  enabled: boolean;
  gift: HostGift | null;
  tally: GiftTally;
  who: GiftWho | null;
  candidates: { id: string; name: string }[];
  organiserLink: string | null;
  organiserPhone: string | null;
  /** A guest's own invite link, for the chase texts, keyed by guest id. */
  inviteLinks: Record<string, string>;
  heading: string;
}) {
  const [pending, start] = useTransition();
  const [on, setOn] = useState(enabled);
  const [what, setWhat] = useState(gift?.description ?? "");
  const [target, setTarget] = useState(gift?.target != null ? String(gift.target) : "");
  const [organiser, setOrganiser] = useState(gift?.organiserProfileId ? "me" : gift?.organiserGuestId ?? "");

  // The host's own organiser fields, only ever shown when the host is the organiser.
  const [pay, setPay] = useState(gift?.payDetails ?? "");
  const [ref, setRef] = useState(gift?.payReference ?? "");
  const [note, setNote] = useState(gift?.message ?? "");
  const [suggested, setSuggested] = useState(gift?.suggestedAmount != null ? String(gift.suggestedAmount) : "");
  const [by, setBy] = useState(gift?.chipInBy ?? "");
  const [surprise, setSurprise] = useState(Boolean(gift?.surprise));
  const [update, setUpdate] = useState(gift?.latestUpdate ?? "");

  const mine = Boolean(gift?.organiserProfileId);

  function save(next?: { on?: boolean; organiser?: string }) {
    start(async () => {
      await saveGift(eventId, {
        enabled: next?.on ?? on,
        description: what.trim() || null,
        target: money(target),
        organiser: (next?.organiser ?? organiser) || null,
      });
    });
  }

  const saveMine = () => start(async () => {
    await saveGiftDetails(eventId, {
      payDetails: pay.trim() || null,
      payReference: ref.trim() || null,
      message: note.trim() || null,
      suggested: money(suggested),
      chipInBy: by || null,
      surprise,
    });
  });

  const name = gift?.organiserName ?? null;
  const handover = name && organiserLink
    ? copy.host.giftHandoverBody(firstName(name), gift?.description || eventTitle, organiserLink)
    : "";
  const nudge = (n: string, id: string) =>
    copy.host.giftNudge(firstName(n), gift?.description || eventTitle, inviteLinks[id] ?? "");

  return (
    <>
      <div className="card">
        <h2 className="h2">{heading}</h2>
        <p className="muted">{copy.host.giftBlurb}</p>
        <label className="switch">
          <input type="checkbox" checked={on} disabled={pending}
            onChange={(ev) => { setOn(ev.target.checked); save({ on: ev.target.checked }); }} />
          {copy.host.giftSwitch}
        </label>
      </div>

      {on && (
        <div className="card">
          <div className="field">
            <label htmlFor="gift-what">{copy.host.giftWhat}</label>
            <input id="gift-what" type="text" value={what} onChange={(e) => setWhat(e.target.value)} onBlur={() => save()} autoComplete="off" />
            <span className="hint">{copy.host.giftWhatHint}</span>
          </div>
          <div className="field">
            <label htmlFor="gift-target">{copy.host.giftTarget}</label>
            <input id="gift-target" type="text" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} onBlur={() => save()} autoComplete="off" />
            <span className="hint">{copy.host.giftTargetHint}</span>
          </div>
          <div className="field">
            <label htmlFor="gift-organiser">{copy.host.giftOrganiser}</label>
            <select id="gift-organiser" value={organiser} disabled={pending}
              onChange={(ev) => { setOrganiser(ev.target.value); save({ organiser: ev.target.value }); }}>
              <option value="">{copy.host.giftOrganiserNone}</option>
              {/* You, first, because a host setting this up is often the one who will run it. */}
              <option value="me">{copy.host.giftOrganiserMe}</option>
              {candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="hint">
              {mine ? copy.host.giftOrganiserHintMe : candidates.length === 0 ? copy.host.giftPickFirst : copy.host.giftOrganiserHint}
            </span>
          </div>
        </div>
      )}

      {/* Handing it to a guest: the host's last job is the text that sends them their page. */}
      {on && !mine && name && organiserLink && (
        <div className="card">
          <h2 className="h2">{copy.host.giftHandover}</h2>
          <p className="muted">{copy.host.giftHandoverHint}</p>
          <div className="actions">
            {organiserPhone && <a className="btn primary small" href={smsLink(organiserPhone, handover)}>{copy.host.giftText}</a>}
            {organiserPhone && <a className="btn small" href={whatsappLink(organiserPhone, handover)}>{copy.host.giftWhatsapp}</a>}
            <CopyButton text={handover} label={copy.host.giftCopy} />
          </div>
          {!gift?.payDetails && <p className="hint">{copy.host.giftWaitingSetup(firstName(name))}</p>}
        </div>
      )}

      {/* Running it yourself: everything the organiser page gives a guest, here instead. */}
      {on && mine && (
        <>
          <div className="card">
            <h2 className="h2">{copy.host.giftYours}</h2>
            <p className="muted">{copy.host.giftYoursBlurb}</p>
            <div className="field">
              <label htmlFor="gift-pay">{copy.host.giftPay}</label>
              <textarea id="gift-pay" rows={3} value={pay} onChange={(e) => setPay(e.target.value)} onBlur={saveMine} />
              <span className="hint">{copy.host.giftPayHint}</span>
            </div>
            <div className="field">
              <label htmlFor="gift-ref">{copy.host.giftRef}</label>
              <input id="gift-ref" type="text" value={ref} onChange={(e) => setRef(e.target.value)} onBlur={saveMine} autoComplete="off" />
              <span className="hint">{copy.host.giftRefHint}</span>
            </div>
            <div className="field">
              <label htmlFor="gift-note">{copy.host.giftNote}</label>
              <textarea id="gift-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveMine} />
              <span className="hint">{copy.host.giftNoteHint}</span>
            </div>
            <div className="field">
              <label htmlFor="gift-suggested">{copy.host.giftSuggested}</label>
              <input id="gift-suggested" type="text" inputMode="decimal" value={suggested} onChange={(e) => setSuggested(e.target.value)} onBlur={saveMine} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="gift-by">{copy.host.giftBy}</label>
              <input id="gift-by" type="date" value={by} onChange={(e) => setBy(e.target.value)} onBlur={saveMine} />
            </div>
            <label className="switch">
              <input type="checkbox" checked={surprise} disabled={pending}
                onChange={(ev) => { setSurprise(ev.target.checked); start(async () => {
                  await saveGiftDetails(eventId, {
                    payDetails: pay.trim() || null, payReference: ref.trim() || null, message: note.trim() || null,
                    suggested: money(suggested), chipInBy: by || null, surprise: ev.target.checked,
                  });
                }); }} />
              {copy.host.giftSurprise}
            </label>
            <span className="hint">{copy.host.giftSurpriseHint}</span>
          </div>

          <div className="card">
            <h2 className="h2">{copy.host.giftTellHeading}</h2>
            <div className="field">
              <label htmlFor="gift-update">{copy.host.giftUpdate}</label>
              <input id="gift-update" type="text" value={update} onChange={(e) => setUpdate(e.target.value)} autoComplete="off" />
              <span className="hint">{copy.host.giftUpdateHint}</span>
            </div>
            <button className="btn small" type="button" disabled={pending}
              onClick={() => start(async () => { await postGiftUpdate(eventId, update); })}>
              {copy.host.giftPostIt}
            </button>
          </div>
        </>
      )}

      {on && (
        <div className="card">
          <h2 className="h2">{copy.host.giftHow}</h2>
          {/* Withheld and nobody-yet are different sentences. Which one this is comes from the
              gift row, not from an empty list: row level security filters rows rather than
              raising, so both used to arrive as a zero and both got read as nobody. */}
          {tally.hidden
            ? <p className="muted">{copy.host.giftHidden}</p>
            : tally.count > 0
              ? <p>{copy.host.giftSoFar(formatMoney(tally.total), tally.count)}</p>
              : <p className="muted">{copy.host.giftNobody}</p>}

          {mine && who && !tally.hidden && (
            <>
              {who.contributors.length > 0 && (
                <ul className="paidlist">
                  {who.contributors.map((c, i) => (
                    <li key={`${c.name}-${i}`}>
                      <span className="n">{c.name}</span>
                      <span className="b">{c.amount != null ? formatMoney(c.amount) : copy.host.giftNoAmount}</span>
                    </li>
                  ))}
                </ul>
              )}
              <h2 className="h2">{copy.host.giftStillToAsk}</h2>
              {who.waiting.length === 0 ? (
                <p className="muted">{copy.host.giftAllIn}</p>
              ) : (
                <ul className="paidlist">
                  {who.waiting.map((g) => (
                    <li key={g.id}>
                      <span className="n">{g.name}</span>
                      {g.phone && (
                        <span className="b">
                          <a className="btn small" href={smsLink(g.phone, nudge(g.name, g.id))}>{copy.host.giftText}</a>
                          <a className="btn small" href={whatsappLink(g.phone, nudge(g.name, g.id))}>{copy.host.giftWhatsapp}</a>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
