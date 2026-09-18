// Shown instead of a crash when this deployment has no Supabase settings. Sign-in cannot work,
// so say that in words rather than letting the first database call throw an error nobody can read.
export function NotConfigured() {
  return (
    <main className="host">
      <h1 className="h1">This deployment is not set up yet</h1>
      <p className="notice">
        Sign-in needs <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
        At least one of them is not set here, so no host screen can load.
      </p>
      <p className="hint">In Vercel: Settings, Environment Variables, and tick Preview as well as Production.</p>
    </main>
  );
}
