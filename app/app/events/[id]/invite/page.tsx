import { copy } from "@/lib/copy";
import { loadEvent } from "@/lib/db/host";

// Preview: the invite as a guest opens it, in a phone. It reads the event row rather than a
// guest's link, so it works on a draft, before a single guest exists, and it never marks anyone
// as having opened theirs.
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await loadEvent(id);
  const src = `/app/preview/${id}`;
  return (
    <>
      <p className="hint">{copy.host.previewHint}</p>
      <div className="screen tall"><iframe src={src} title="Your invite" /></div>
      <div className="actions"><a className="btn small" href={src} target="_blank" rel="noreferrer">{copy.host.openFull}</a></div>
    </>
  );
}
