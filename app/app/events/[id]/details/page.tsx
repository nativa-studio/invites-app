import { loadEvent } from "@/lib/db/host";
import { DetailsPanel } from "@/components/host/panels/DetailsPanel";

// Details: everything the invite says in words, and what the reply asks.
export default async function Details({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await loadEvent(id);
  return <DetailsPanel e={e} />;
}
