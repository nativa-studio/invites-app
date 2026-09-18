import { publicEnv } from "@/lib/env";

// Shown instead of a crash when this deployment has no Supabase settings. Sign-in cannot work, so
// say so in words, and name the exact setting that is missing rather than leaving it to guesswork.
export function NotConfigured() {
  const missing = publicEnv.missing;
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
    </main>
  );
}
