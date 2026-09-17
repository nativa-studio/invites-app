import Link from "next/link";
import { copy } from "@/lib/copy";
import { NewEventForm } from "@/components/host/NewEventForm";

export default function NewEvent() {
  return (
    <main className="host">
      <header className="top">
        <Link href="/app" className="brand">{copy.brand}</Link>
        <Link href="/app" className="btn small">Cancel</Link>
      </header>
      <h1 className="h1">{copy.app.newEvent}</h1>
      <p className="muted">Just enough to make the invite. Everything else comes next, and nothing here is final.</p>
      <NewEventForm />
    </main>
  );
}
