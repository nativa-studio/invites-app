import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { AddGuestForm, LoginForm } from "@/components/HostForms";
import { NotReady } from "@/components/Setup";
import { hostLogout } from "@/app/actions";
import { ensureTokens, getEvent, listGuests, type Guest } from "@/lib/airtable";
import { isHostAuthed } from "@/lib/auth";
import { env, airtableConfigured } from "@/lib/env";
import { formatDateTime, formatLongDate } from "@/lib/format";
import { smsLink, textMessageFor } from "@/lib/messages";
import { getSiteUrl, inviteLink } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata = { title: "Host dashboard" };

function heads(guests: Guest[]): number {
  return guests.filter((g) => g.status === "Coming").reduce((sum, g) => sum + Math.max(1, g.partySize ?? 1), 0);
}

export default async function HostPage() {
  if (!env.hostPassword || !airtableConfigured()) return <NotReady detail />;

  if (!(await isHostAuthed())) {
    return (
      <main className="page">
        <section className="card">
          <LoginForm />
        </section>
      </main>
    );
  }

  let event;
  let guests: Guest[];
  try {
    [event, guests] = await Promise.all([getEvent(), listGuests()]);
    // Anyone added straight into Airtable gets their link code here.
    guests = await ensureTokens(guests);
  } catch (e) {
    console.error("host load failed", e);
    return <NotReady detail />;
  }
  const siteUrl = await getSiteUrl();

  const coming = guests.filter((g) => g.status === "Coming");
  const notComing = guests.filter((g) => g.status === "Not coming");
  const pending = guests.filter((g) => g.status === "Pending");
  const order: Guest[] = [...pending, ...coming, ...notComing];

  return (
    <main className="page wide">
      <header className="host-head">
        <div>
          <p className="eyebrow">Host dashboard</p>
          <h1 className="rsvp-title">{event?.title ?? "Your party"}</h1>
          {event?.date ? <p className="muted">{formatLongDate(event.date)}</p> : null}
        </div>
        <form action={hostLogout}>
          <button type="submit" className="btn btn-ghost btn-small">
            Log out
          </button>
        </form>
      </header>

      <section className="stats">
        <div className="stat">
          <strong>{heads(guests)}</strong>
          <span>people coming</span>
        </div>
        <div className="stat">
          <strong>{coming.length}</strong>
          <span>said yes</span>
        </div>
        <div className="stat">
          <strong>{notComing.length}</strong>
          <span>said no</span>
        </div>
        <div className="stat">
          <strong>{pending.length}</strong>
          <span>no reply yet</span>
        </div>
      </section>

      <section className="card">
        <div className="card-body">
          <h2 className="h2">Share</h2>
          <p className="muted small">
            Each guest below has their own link, so their reply is matched to them automatically. Tap{" "}
            <strong>Text</strong> to open Messages with the link ready to send, or copy it into any chat. The general
            link below works for anyone: it asks for their name.
          </p>
          <div className="share-row">
            <code className="url">{siteUrl}</code>
            <CopyButton text={siteUrl} label="Copy general link" />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-body">
          <h2 className="h2">Add a guest</h2>
          <AddGuestForm />
          <p className="muted small">
            You can also add rows straight into the{" "}
            <a href={`https://airtable.com/${env.airtableBaseId}`} target="_blank" rel="noopener noreferrer">
              Airtable base
            </a>
            . Links are created the next time this page loads.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="table-wrap">
          <table className="guests">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Reply</th>
                <th>Note</th>
                <th>Invite</th>
              </tr>
            </thead>
            <tbody>
              {order.map((g) => {
                const link = g.token ? inviteLink(siteUrl, g.token) : "";
                const body = event ? textMessageFor(event, g.name, link) : link;
                return (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.name || "(no name)"}</strong>
                      {g.phone ? <div className="muted small">{g.phone}</div> : null}
                      {g.source === "Open link" ? <span className="tag">via general link</span> : null}
                    </td>
                    <td>
                      <span className={`pill ${pillClass(g.status)}`}>{g.status}</span>
                      {g.status === "Coming" ? (
                        <div className="muted small">
                          {Math.max(1, g.partySize ?? 1)} {Math.max(1, g.partySize ?? 1) === 1 ? "person" : "people"}
                        </div>
                      ) : null}
                      {g.respondedAt ? <div className="muted small">{formatDateTime(g.respondedAt)}</div> : null}
                    </td>
                    <td className="note">{g.message}</td>
                    <td className="cell-actions">
                      {link ? (
                        <>
                          {g.phone ? (
                            <a className="btn btn-small btn-primary" href={smsLink(g.phone, body)}>
                              Text
                            </a>
                          ) : null}
                          <CopyButton text={link} />
                          <Link className="btn btn-small" href={`/i/${g.token}`} target="_blank">
                            View
                          </Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {order.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    No guests yet. Add one above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function pillClass(status: Guest["status"]): string {
  if (status === "Coming") return "yes";
  if (status === "Not coming") return "no";
  return "pending";
}
