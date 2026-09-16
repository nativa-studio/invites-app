import { copy } from "@/lib/copy";
export default function NotFound() {
  return (
    <main className="host" style={{ paddingTop: 64 }}>
      <h1 className="h1">{copy.notFound.title}</h1>
      <p className="muted">{copy.notFound.body}</p>
    </main>
  );
}
