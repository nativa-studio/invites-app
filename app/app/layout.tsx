import { publicEnv } from "@/lib/env";
import { NotConfigured } from "@/components/host/NotConfigured";

// Everything under /app needs a signed-in host, and sign-in needs the Supabase settings. If this
// deployment does not have them, say so rather than letting the first database call throw.
export default function HostLayout({ children }: { children: React.ReactNode }) {
  if (!publicEnv.configured) return <NotConfigured />;
  return <>{children}</>;
}
