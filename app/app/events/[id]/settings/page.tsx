import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadHosts } from "@/lib/db/cohosts";
import { getSiteUrl } from "@/lib/site-url";
import { Choice, Switch } from "@/components/host/fields";
import { SettingBox } from "@/components/host/SettingBox";
import { HostsCard } from "@/components/host/HostsCard";
import { DeleteEvent } from "@/components/host/DeleteEvent";
import { setEventSwitch, setPartyMode } from "@/app/app/events/[id]/actions";
import { Mono } from "@/components/art/mono";

// Settings: the facts about this event, and who is allowed to change them.
//
// Everything here is a fact about the event rather than about one part of it, which is the test
// for whether something belongs on this screen. Switching Bring a plate on changes the invite,
// the Plan tab and what guests can do, so it does not belong on any one of them.
//
// A block each, rather than one card with four rows and a Change button. Marcia: "add blocks like
// this in settings for each item so it's a bit more fun to look at, add a little symbol for each
// item, allow toggle on or off, and add a pen on the top right to click and edit that setting via
// the drawer window." The switch is on the block because that is what most visits come for; the
// pencil opens the same sheet the invite's pencils open, for everything else the setting can do.
//
// The status is deliberately not here, although the design put it on both. It lives in the badge
// at the top of every screen, and two controls for one setting is the exact shape of every
// expensive mistake on this project: a host changes one, checks the other, and finds it has not
// moved.
//
// The message templates are on Invite rather than here. The message carries the invite and is
// written in the same sitting as it, and it is the one thing whose result cannot be seen anywhere
// else, so it stays next to the thing it delivers.
export default async function Settings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests, hosts, site] = await Promise.all([loadEvent(id), loadGuests(id), loadHosts(id), getSiteUrl()]);
  const split = e.ask_party_mode === "split";
  const groupLink = e.group_link_enabled !== false;
  const on = (v: boolean) => (v ? copy.host.ovOn : copy.host.ovOff);
  // Whether the person reading owns this event. The database decides what they may actually do;
  // this only decides what is worth drawing them. An event whose members cannot be read yet
  // reads as owned, because the one host there has always been is the owner.
  const me = hosts.find((h) => h.me);
  const amOwner = !me || me.role === "owner";
  const link = e.join_code ? `${site}/join/${e.join_code}` : "";

  return (
    <>
      <p className="hint">{copy.host.setBoardHint}</p>
      <div className="board">
        <SettingBox
          eventId={e.id}
          icon={<Mono name="plate" size={34} />}
          title={copy.host.ovPlateChip}
          value={on(Boolean(e.plate_enabled))}
          on={Boolean(e.plate_enabled)}
          blurb={copy.host.setPlateHint}
          fields={["plate_enabled", "plate_block", "plate_mode", "plate_host_note"]}
          onToggle={async (next) => { "use server"; await setEventSwitch(e.id, "plate_enabled", next); }}
        >
          <Switch id="plate_enabled" label={copy.host.ovPlateChip} value={e.plate_enabled} hint={copy.host.setPlateHint} />
          <Switch id="plate_block" label={copy.host.plateBlock} value={e.plate_block !== false} hint={copy.host.plateBlockHint} />
        </SettingBox>

        <SettingBox
          eventId={e.id}
          icon={<Mono name="gift" size={34} />}
          title={copy.host.ovGiftChip}
          value={on(Boolean(e.group_gift_enabled))}
          on={Boolean(e.group_gift_enabled)}
          blurb={copy.host.setGiftHint}
          fields={["group_gift_enabled"]}
          onToggle={async (next) => { "use server"; await setEventSwitch(e.id, "group_gift_enabled", next); }}
        >
          <Switch id="group_gift_enabled" label={copy.host.ovGiftChip} value={e.group_gift_enabled} hint={copy.host.setGiftHint} />
        </SettingBox>

        <SettingBox
          eventId={e.id}
          icon={<Mono name="kids" size={34} />}
          title={copy.host.ovSplitChip}
          value={split ? copy.host.setSplitOn : copy.host.setSplitOff}
          on={split}
          blurb={copy.host.setSplitHint}
          fields={["ask_party_mode"]}
          onToggle={async (next) => { "use server"; await setPartyMode(e.id, next); }}
        >
          <Choice
            id="ask_party_mode"
            label={copy.host.ovSplitChip}
            value={e.ask_party_mode}
            options={[["split", copy.host.setSplitOn], ["single", copy.host.setSplitOff]]}
            hint={copy.host.setSplitHint}
          />
        </SettingBox>

        <SettingBox
          eventId={e.id}
          icon={<Mono name="gate" size={34} />}
          title={copy.host.setGroupLink}
          value={on(groupLink)}
          on={groupLink}
          blurb={copy.host.setGroupLinkHint}
          fields={["group_link_enabled"]}
          onToggle={async (next) => { "use server"; await setEventSwitch(e.id, "group_link_enabled", next); }}
        >
          <Switch id="group_link_enabled" label={copy.host.setGroupLink} value={groupLink} hint={copy.host.setGroupLinkHint} />
        </SettingBox>

        {/* People rather than a setting, so it has no switch: a co-host is added by being sent a
            link and removed by name. Same block, same pencil, so it reads as one board. */}
        <HostsCard eventId={e.id} hosts={hosts} link={link} on={e.join_code_enabled === true} amOwner={amOwner} />
      </div>

      {/* Only the owner, because only the owner can: the policy says so and the screen should not
          offer what the database will refuse. */}
      {amOwner && (
        <DeleteEvent
          id={e.id}
          title={e.title}
          counts={{ guests: guests.length, replies: guests.filter((g) => g.status !== "pending").length }}
        />
      )}
    </>
  );
}
