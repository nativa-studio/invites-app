import { loadEvent } from "@/lib/db/host";
import { InviteEditor } from "@/components/host/InviteEditor";

// Preview: the invite as a guest opens it, in a phone, and the place you edit it from. It reads
// the event row rather than a guest's link, so it works on a draft, before a single guest exists,
// and it never marks anyone as having opened theirs.
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await loadEvent(id);
  return <InviteEditor e={e} />;
}
