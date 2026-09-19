"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";

// Which group a new guest goes in.
//
// It was a text box, which asked a host to type "Neighbours" for the fortieth time and spell it
// the same way every time. One "neighbors" and the group splits in two, and a group that has
// split is worse than no group at all: two links, two counts, and no way to see it has happened.
//
// So the groups that exist are offered by name, and typing is what you do for a new one. The
// value still travels as `group`, so the actions behind both forms are untouched.
export function GroupField({ id, groups, initial }: { id: string; groups: string[]; initial?: string }) {
  // A group carried in from the filter may not be in the list yet if the page is mid-refresh, so
  // it is put at the front rather than silently dropped.
  const known = initial && !groups.includes(initial) ? [initial, ...groups] : groups;
  const [picked, setPicked] = useState(initial ?? "");
  const [typed, setTyped] = useState("");
  const adding = picked === "__new";

  return (
    <div className="field">
      <label htmlFor={id}>{copy.host.group}</label>
      <select id={id} value={picked} onChange={(ev) => setPicked(ev.target.value)}>
        <option value="">{copy.host.guestGroupNone}</option>
        {known.map((g) => <option key={g} value={g}>{g}</option>)}
        <option value="__new">{copy.host.guestGroupNew}</option>
      </select>
      {adding && (
        <input
          type="text"
          value={typed}
          onChange={(ev) => setTyped(ev.target.value)}
          placeholder={copy.host.groupLinkNameHint}
          aria-label={copy.host.guestGroupNewTitle}
          autoComplete="off"
          autoFocus
        />
      )}
      {/* What actually gets submitted. The select is the control and this is the answer, so a
          form reset after adding a guest leaves the choice where the host put it. */}
      <input type="hidden" name="group" value={adding ? typed : picked} />
      <span className="hint">{copy.host.groupHint}</span>
    </div>
  );
}
