import { getEvent } from "@/lib/airtable";

// Airtable attachment URLs expire after a couple of hours, so the invite
// references this stable path instead. The image is re-fetched from Airtable
// as needed and cached briefly at the edge.
export async function GET() {
  try {
    const event = await getEvent();
    if (!event?.coverImageUrl) return new Response("No cover image", { status: 404 });
    const upstream = await fetch(event.coverImageUrl, { cache: "no-store" });
    if (!upstream.ok) return new Response("Image unavailable", { status: 502 });
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
}
