"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { groupSlug } from "@/lib/groups";
import { CopyButton } from "./CopyButton";
import { groupInviteText, type TemplateEvent } from "@/lib/messages";

// A link per group, made by naming the group.
//
// This used to list only the groups the guest list already carried, which had it backwards: a
// group link is how people who are not on the list yet get onto it, so deriving it from people
// already on the list meant it appeared only after the thing it exists to cause had happened. A
// host with no guests saw an empty box telling them to come back later.
//
// Nothing is stored. The group travels in the link, so naming one is enough to have it.
//
// Two ways to take a link away: the link on its own, for a poster or a QR code, and the whole
// message with the link inside it, for pasting into the chat the group link exists for. The
// second is what a host wants nine times out of ten, and it used to be the one they could not
// have without typing the words out again.
export function GroupLinks({ base, inUse, event }: { base: string; inUse: string[]; event: TemplateEvent }) {
  const [name, setName] = useState("");
  const slug = groupSlug(name);
  const link = slug ? `${base}/${slug}` : "";

  return (
    <section className="card">
      <h2 className="h2">{copy.host.groupLinks}</h2>
      <p className="hint">{copy.host.groupLinksHint}</p>

      <div className="field">
        <label htmlFor="group_name">{copy.host.groupLinkName}</label>
        <input
          id="group_name"
          type="text"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder={copy.host.groupLinkNameHint}
          autoComplete="off"
        />
      </div>

      {link ? (
        <div className="grouplink">
          <b>{name.trim()}</b>
          <code>{link}</code>
          <div className="actions">
            <CopyButton text={groupInviteText(event, link)} label={copy.host.copyMessage} what="message" />
            <CopyButton text={link} label={copy.host.copy} />
          </div>
        </div>
      ) : (
        <p className="hint">{copy.host.groupLinkNameBlank}</p>
      )}

      {inUse.length > 0 && (
        <>
          <span className="label-ish">{copy.host.groupLinksInUse}</span>
          <div className="grouplinks">
            {inUse.map((g) => (
              <div className="grouplink" key={g}>
                <b>{g}</b>
                <code>{`${base}/${groupSlug(g)}`}</code>
                <div className="actions">
                  <CopyButton text={groupInviteText(event, `${base}/${groupSlug(g)}`)} label={copy.host.copyMessage} what="message" />
                  <CopyButton text={`${base}/${groupSlug(g)}`} label={copy.host.copy} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
