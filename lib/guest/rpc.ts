import "server-only";
import { createAnonClient } from "@/lib/supabase/server";

// Guest RPC calls go to Supabase as anon. When LOCAL_PG_URL is set (local development and
// screenshots only) the same functions run on a local Postgres as the anon role instead.
export async function callGuestRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (process.env.LOCAL_PG_URL) return callLocal<T>(name, args);
  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

async function callLocal<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.LOCAL_PG_URL });
  await client.connect();
  try {
    await client.query("set role anon");
    const keys = Object.keys(args);
    const sql = `select public.${name}(${keys.map((k, i) => `${k} := $${i + 1}`).join(", ")}) as result`;
    const values = keys.map((k) => {
      const v = args[k];
      return Array.isArray(v) ? v : v === undefined ? null : v;
    });
    const res = await client.query(sql, values);
    return res.rows[0]?.result as T;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e));
  } finally {
    await client.end();
  }
}
