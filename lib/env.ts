// Only the publishable key is ever read by app code. The secret key is for migrations from a
// developer's machine and must never appear here.
// Values are read lazily so a build (which evaluates modules without serving requests) does not
// need them; a real request without them fails with a clear message.
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Set it for this deployment's environment.`);
  return value;
}

export const publicEnv = {
  get supabaseUrl() { return required("NEXT_PUBLIC_SUPABASE_URL"); },
  get supabaseKey() { return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"); },
  get siteUrl() { return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""; },
  // Which of the two settings sign-in needs are not set here. Empty means sign-in can work.
  // Read this before anything that runs on every request, so one unset variable cannot take down
  // the pages that do not need it, and so a screen can name what is missing rather than guess.
  get missing() {
    return (["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as const).filter((n) => !process.env[n]);
  },
  get configured() { return this.missing.length === 0; },
};
