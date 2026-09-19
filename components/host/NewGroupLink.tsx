"use client";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { groupSlug } from "@/lib/groups";
import { groupInviteText, type TemplateEvent } from "@/lib/messages";
import { CopyButton } from "./CopyButton";

// A link for a group nobody is in yet.
//
// The groups above are built from the guest list, which is the right way round for the ones you
// already have and the wrong way round for the ones you are about to. A group link is how people
// who are not on the list get onto it, so there has to be a way to have one before anybody is in
// it. Nothing is stored: the group travels in the link, so naming it is enough to have it.
export function NewGroupLink({ base, event }: { base: string; event: TemplateEvent }) {
  const [name, setName] = useState("");
  const slug = groupSlug(name);
  const link = slug ? `${base}/${slug}` : "";

  return (
    <div className="newgroup">
      <span className="label-ish">{copy.host.groupLinks}</span>
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
    </div>
  );
}
