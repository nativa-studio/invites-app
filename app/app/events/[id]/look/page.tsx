import { copy } from "@/lib/copy";
import { loadEvent } from "@/lib/db/host";
import { LookPanel } from "@/components/host/panels/LookPanel";

// Layout: the shape of the invite, its picture, and which parts of it show at all.
export default async function Look({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const e = await loadEvent(id);
  return (
    <>
      {isNew === "1" && <p className="notice">{copy.host.newEventNext}</p>}
      <LookPanel e={e} />
    </>
  );
}
