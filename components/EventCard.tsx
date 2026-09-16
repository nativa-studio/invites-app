import type { EventInfo } from "@/lib/airtable";
import { formatLongDate, formatShortDate } from "@/lib/format";

type Props = { event: EventInfo; greeting?: string };

export default function EventCard({ event, greeting }: Props) {
  const mapHref =
    event.mapLink ||
    (event.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}` : "");

  return (
    <section className="card">
      {event.coverImageUrl ? (
        // Airtable attachment URLs expire, so the image is served through /cover.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cover" src="/cover" alt="" />
      ) : (
        <div className="cover cover-fallback" aria-hidden="true">
          <span className="cover-mark">✦</span>
        </div>
      )}

      <div className="card-body">
        {greeting ? <p className="eyebrow">{greeting}</p> : <p className="eyebrow">You&rsquo;re invited</p>}
        <h1 className="title">{event.title}</h1>
        {event.intro ? <p className="intro">{event.intro}</p> : null}

        <dl className="facts">
          {event.date ? (
            <div>
              <dt>When</dt>
              <dd>
                {formatLongDate(event.date)}
                {event.time ? <span className="muted"> · {event.time}</span> : null}
              </dd>
            </div>
          ) : null}
          {event.venue || event.address ? (
            <div>
              <dt>Where</dt>
              <dd>
                {event.venue ? <strong>{event.venue}</strong> : null}
                {event.venue && event.address ? <br /> : null}
                {event.address}
                {mapHref ? (
                  <>
                    {" "}
                    <a className="inline-link" href={mapHref} target="_blank" rel="noopener noreferrer">
                      Map
                    </a>
                  </>
                ) : null}
              </dd>
            </div>
          ) : null}
          {event.details ? (
            <div>
              <dt>Good to know</dt>
              <dd className="prewrap">{event.details}</dd>
            </div>
          ) : null}
          {event.rsvpBy ? (
            <div>
              <dt>RSVP by</dt>
              <dd>{formatShortDate(event.rsvpBy)}</dd>
            </div>
          ) : null}
        </dl>

        {event.hostPhone ? (
          <p className="links">
            <a href={`sms:${event.hostPhone.replace(/[^\d+]/g, "")}`}>
              Questions? Text {event.hostName || "the host"}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
