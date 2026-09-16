import { redirect } from "next/navigation";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle } from "@/app/auth/actions";

export default async function Landing({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/app");
  return (
    <main className="host" style={{ paddingTop: 64 }}>
      <p className="brand">{copy.brand}</p>
      <h1 className="h1">{copy.landing.title}</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>{copy.landing.lede}</p>
      {error === "signin" && <p className="notice">{copy.landing.signinError}</p>}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next ?? "/app"} />
        <button className="btn primary" type="submit">{copy.landing.google}</button>
      </form>
    </main>
  );
}
