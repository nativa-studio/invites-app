import { redirect } from "next/navigation";

// Settings became headers, and then three. Anything still pointing here lands on the invite,
// which is where the wording is edited now.
export default async function Settings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/events/${id}`);
}
