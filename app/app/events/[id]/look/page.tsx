import { redirect } from "next/navigation";

// The template and the colours are part of the invite now.
//
// A redirect rather than a deletion: this address has been in a browser history, a bookmark and
// a message. A tab that moved is not the same thing as a page that is gone, and a 404 cannot
// tell a host which of the two happened.
export default async function Moved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/events/${id}/invite`);
}
