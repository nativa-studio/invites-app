import { copy } from "@/lib/copy";
import { loadEvent, loadGuests } from "@/lib/db/host";
import { loadPlate } from "@/lib/db/plate";
import { PlateBoard } from "@/components/host/PlateBoard";
import { EditCard, Sum } from "@/components/host/EditCard";
import { Choice, Field, Switch } from "@/components/host/fields";
import { foodSummary } from "@/components/host/replies";
import { PLATE_MODES } from "@/lib/good-to-know";

// Potluck: whether you are asking, what you are asking for, and who has claimed what.
//
// It was a card at the foot of Guests with its settings on the other side of the app, in the Good
// to know drawer. Two places for one feature, which is the shape of every mistake this project
// has made this week, so the settings moved here and the Good to know row points at this tab
// rather than carrying a second copy of them.
//
// Guests still read the words "bring a plate" on their invite, because that is what the ask is
// called when somebody is being asked. Potluck is what it is called when you are running it.
export default async function Potluck({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e, guests] = await Promise.all([loadEvent(id), loadGuests(id)]);
  const items = e.plate_enabled ? await loadPlate(id) : [];
  const mode = PLATE_MODES.find(([v]) => v === e.plate_mode)?.[1] ?? e.plate_mode;

  return (
    <>
      <EditCard
        eventId={e.id}
        title={copy.host.potluckHeading}
        blurb={copy.host.potluckBlurb}
        fields={["plate_enabled", "plate_mode", "plate_host_note"]}
        summary={
          <>
            <Sum label="Right now" value={e.plate_enabled ? copy.host.potluckOn : copy.host.potluckOff} />
            {e.plate_enabled && <Sum label={copy.host.potluckHowMuch} value={mode} />}
          </>
        }
      >
        <Switch id="plate_enabled" label={copy.host.potluckSwitch} value={e.plate_enabled} />
        <Choice id="plate_mode" label={copy.host.potluckMode} value={e.plate_mode} options={PLATE_MODES} hint={copy.host.potluckModeHint} />
        <Field id="plate_host_note" label={copy.host.potluckNote} value={e.plate_host_note} rows={2} hint={copy.host.potluckNoteHint} />
      </EditCard>

      {/* The two food lists are next to each other in the tab bar and are easy to mix up, so the
          one guests can see says so. */}
      <p className="hint">{copy.host.shopNotPotluck}</p>

      <PlateBoard
        eventId={e.id}
        items={items}
        enabled={e.plate_enabled}
        mode={e.plate_mode}
        hostNote={e.plate_host_note}
        allergies={foodSummary(guests).counts}
        guests={guests.filter((g) => g.status === "yes").map((g) => ({ id: g.id, name: g.name }))}
      />
    </>
  );
}
