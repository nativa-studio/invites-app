import { publicEnv } from "@/lib/env";

// Shown instead of a crash when this deployment has no Supabase settings. Sign-in cannot work, so
// say so in words, and name the exact setting that is missing rather than leaving it to guesswork.
//
// It also prints what the deployment knows about itself: which environment it built for, which
// commit it is, and which NEXT_PUBLIC_ names reached it. Names only, never values. Without that,
// working out why a setting is missing means a screenshot round trip for every guess.
export function NotConfigured() {
  const missing = publicEnv.missing;
  const publicNames = Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_")).sort();
  const facts: [string, string][] = [
    ["Environment", process.env.VERCEL_ENV ?? "not set"],
    ["Target", process.env.VERCEL_TARGET_ENV ?? "not set"],
    ["Commit", (process.env.VERCEL_GIT_COMMIT_SHA ?? "not set").slice(0, 7)],
    ["Branch", process.env.VERCEL_GIT_COMMIT_REF ?? "not set"],
    ["Public names", publicNames.length ? publicNames.join(", ") : "none"],
  ];
  return (
    <main className="host">
      <h1 className="h1">This deployment is not set up yet</h1>
      <p className="notice">
        {missing.length === 1 ? "This setting is not set here" : "Neither of these settings is set here"}, so sign-in cannot work and no host screen can load:
      </p>
      <ul className="hint" style={{ margin: 0, paddingLeft: 20 }}>
        {missing.map((name) => <li key={name}><code>{name}</code></li>)}
      </ul>
      <p className="hint">In Vercel: Settings, Environment Variables, open each one and tick Preview as well as Production, then redeploy this branch.</p>
      <dl className="hint" style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "4px 10px", margin: 0 }}>
        {facts.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt style={{ fontWeight: 600 }}>{k}</dt>
            <dd style={{ margin: 0, wordBreak: "break-word" }}>{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
