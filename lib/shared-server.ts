import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-config";
import type { SharedList } from "./types";

/** Liest einen geteilten Wunschzettel auf dem Server (für Vorschaubild und Seitentitel). */
export async function fetchSharedList(slug: string): Promise<SharedList | null> {
  if (!/^[a-z0-9]{4,32}$/i.test(slug)) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_shared_list`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ p_slug: slug }),
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const list = (await res.json()) as SharedList | null;
    return list && { ...list, wishes: (list.wishes ?? []).filter((w) => !w.hidden) };
  } catch {
    return null;
  }
}
