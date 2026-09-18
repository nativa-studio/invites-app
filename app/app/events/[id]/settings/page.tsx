import { redirect } from "next/navigation";

// Settings became five headers. Anything still pointing here lands on the words.
export default async function Settings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/events/${id}/details`);
}
