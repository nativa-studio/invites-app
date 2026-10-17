"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import type { EventRow } from "@/lib/db/types";
import { Field } from "./fields";

// The whole of a group gift, in the gifts drawer.
//
// It used to be a panel of its own, reached by tapping the card that appears after the reply.
// That card only exists once the gift is switched on, and the switch was on the card, so setting
// one up meant finding the toggle on the Settings tab first and then coming back. Meanwhile the
// gifts block, which is where the group gift is announced, had a box for the wording and nothing
// else, and its hint talked about a switch that lived somewhere else entirely.
//
// So gifts are one drawer: what you want to say, the wish list, and whether there is a group gift
// and what it is. Tapping either gift card on the invite opens this.
//
// The switch shows and hides the rest rather than the panel re-rendering from the server, so
// turning it on and typing what the present is happens in one sitting. Hidden, not unmounted: an
// input that is not in the form sends nothing, and the save action cannot tell nothing from
// cleared, so unmounting these would wipe what the present is every time a host switched the
// gift off. That is the same class of fault the field manifest exists to prevent.
export function GroupGiftFields({ e }: { e: EventRow }) {
  const [on, setOn] = useState(Boolean(e.group_gift_enabled));
  // "me" when the host is running it, a guest's id when somebody else is, empty when nobody is.
  const organiser = e.gift_organiser_profile_id ? "me" : e.gift_organiser_guest_id ?? "";
  return (
    <>
      <div className="panel-split" />
      <div className="field">
        <label className="switch" htmlFor="group_gift_enabled">
          <input
            id="group_gift_enabled" type="checkbox" name="group_gift_enabled"
            checked={on} onChange={(ev) => setOn(ev.target.checked)}
          />
          <span>{copy.host.giftSwitch}</span>
        </label>
        <span className="hint">{copy.host.giftAlongside}</span>
      </div>
      <div hidden={!on}>
        <Field id="gift_description" label={copy.host.giftWhat} value={e.gift_description ?? null} rows={2} hint={copy.host.giftWhatHint} />
        {/* The wording that replaces the sentence the invite would write for itself. Directly
            under what the present is, because it is the same thought said in the host's voice. */}
        <Field id="group_gift_note" label={copy.host.groupGiftLine} value={e.group_gift_note} rows={2} hint={copy.host.groupGiftLineHint} />
        <Field id="gift_target" label={copy.host.giftTarget} value={e.gift_target != null ? String(e.gift_target) : null} hint={copy.host.giftTargetHint} />
        {/* Who runs it, here rather than only on the Plan tab. Gifts are edited by tapping the
            card on the invite now, and handing the job to somebody is part of setting a group
            gift up, not a separate errand on another screen. The Plan tab keeps its fuller
            view: the money in, who has chipped in, and the message that sends them their link. */}
        <div className="field">
          <label htmlFor="gift_organiser">{copy.host.giftOrganiser}</label>
          <select id="gift_organiser" name="gift_organiser" defaultValue={organiser}>
            <option value="">{copy.host.giftOrganiserNone}</option>
            <option value="me">{copy.host.giftOrganiserMe}</option>
            {(e.gift_candidates ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="hint">
            {(e.gift_candidates ?? []).length === 0 ? copy.host.giftPickFirst : copy.host.giftOrganiserHint}
          </span>
        </div>
      </div>
    </>
  );
}
