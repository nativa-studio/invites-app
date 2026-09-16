import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

// A Supabase client bound to the current request's cookies. Use in Server Components,
// Server Actions and Route Handlers. Cookie writes are ignored inside Server Components
// (the proxy refreshes the session there), which is what the try/catch is for.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component. Safe to ignore.
        }
      },
    },
  });
}

// Guest pages have no session. This client carries no cookies at all, so a guest request
// can never accidentally act as a signed-in host.
export function createAnonClient() {
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
