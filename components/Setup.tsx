import { missingConfig } from "@/lib/env";

// Shown on guest pages when the app can't reach Airtable, and on the host
// page with the list of missing settings.
export function NotReady({ detail }: { detail?: boolean }) {
  const missing = missingConfig();
  return (
    <main className="page">
      <section className="card">
        <div className="card-body">
          <p className="eyebrow">Almost there</p>
          <h1 className="rsvp-title">The invite isn&rsquo;t set up yet</h1>
          {detail ? (
            <>
              <p className="intro">
                {missing.length
                  ? "These environment variables still need to be set:"
                  : "The settings are present but Airtable returned an error. Check the base ID, the token's scopes, and that the table and field names match the README."}
              </p>
              {missing.length ? (
                <ul className="plain">
                  {missing.map((m) => (
                    <li key={m}>
                      <code>{m}</code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="intro">Please check back a little later.</p>
          )}
        </div>
      </section>
    </main>
  );
}
