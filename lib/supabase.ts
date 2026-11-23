"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Verbindung zur Datenbank. Die beiden Werte sind öffentlich (sie stehen ohnehin
 * im Browser), der Schutz kommt von den Regeln in supabase/schema.sql.
 * Über NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY lässt sich ein anderes Projekt einstellen.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://szydavbuuaywjxelaias.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_F2OLDFiKx-0GzdlSJhC3Vg_dC9Jzj_G";

export const cloudEnabled = Boolean(URL && KEY);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cloudEnabled) throw new Error("Supabase ist nicht eingerichtet");
  client ??= createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return client;
}
