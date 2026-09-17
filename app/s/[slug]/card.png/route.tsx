import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/guest/invite";
import { paletteFor } from "@/components/art/palette";
import { formatInviteDate, formatTimeRange } from "@/lib/format";

// The picture a chat app shows under the link: 1200 by 630, in the event's palette.
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const p = paletteFor(e.palette, e.theme_id);
  const title = (e.share_title ?? e.title).replace(/ turning (\d+)/i, "\u00a0turning\u00a0$1");
  const when = [formatInviteDate(e.date), formatTimeRange(e.start_time, e.end_time, e.time_note).toLowerCase()].filter(Boolean).join(", ");
  const age = e.title.match(/turning (\d+)/i)?.[1];
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: p.sky, backgroundImage: `radial-gradient(circle at 1px 1px, ${p.navy}33 2px, transparent 0)`, backgroundSize: "18px 18px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 940, height: 470, background: p.paper, border: `8px solid ${p.navy}`, borderRadius: 24, transform: "rotate(-1.5deg)", boxShadow: `0 30px 60px -20px ${p.navy}99`, padding: "40px 60px" }}>
          <div style={{ position: "absolute", top: -22, left: 380, width: 180, height: 44, background: p.yellow, opacity: 0.9, transform: "rotate(-3deg)", borderRadius: 4 }} />
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: p.red, textTransform: "uppercase", marginBottom: 18 }}>{age ? "Trainer wanted" : "You're invited"}</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: p.navy, textAlign: "center", marginBottom: 22, maxWidth: 820 }}>{title}</div>
          <div style={{ display: "flex", width: 90, height: 10, background: p.yellow, border: `3px solid ${p.navy}`, borderRadius: 4, marginBottom: 22 }} />
          <div style={{ display: "flex", fontSize: 32, color: p.navy, textAlign: "center", maxWidth: 780 }}>{when}</div>
          <div style={{ display: "flex", fontSize: 26, color: p.navy, opacity: 0.7, marginTop: 20 }}>Tap to see the details and reply</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}
