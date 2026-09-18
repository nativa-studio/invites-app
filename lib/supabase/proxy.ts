import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

// Refreshes the auth cookies on every request and sends signed-out visitors away from /app.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  // This runs on every request. Without the Supabase settings there is no session to refresh, and
  // throwing here would take down the landing page and every guest link as well, with an error
  // nobody can read. Let the request through and let the page that needs sign-in say so.
  if (!publicEnv.configured) return response;
  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // getClaims validates the JWT locally; do not swap it for getSession, which trusts the cookie.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;
  if (!signedIn && (path === "/app" || path.startsWith("/app/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return response;
}
