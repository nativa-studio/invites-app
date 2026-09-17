// Only the publishable key is ever read by app code. The secret key is for migrations from a
// developer's machine and must never appear here.
// Values are read lazily so a build (which evaluates modules without serving requests) does not
// need them; a real request without them fails with a clear message.
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const publicEnv = {
  get supabaseUrl() { return required("NEXT_PUBLIC_SUPABASE_URL"); },
  get supabaseKey() { return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"); },
  get siteUrl() { return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""; },
};
