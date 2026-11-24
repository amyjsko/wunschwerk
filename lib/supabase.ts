"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Verbindung zur Datenbank. Die beiden Werte sind öffentlich (sie stehen ohnehin
 * im Browser), der Schutz kommt von den Regeln in supabase/schema.sql.
 * Über NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY lässt sich ein anderes Projekt einstellen.
 */
import { SUPABASE_KEY as KEY, SUPABASE_URL as URL } from "./supabase-config";

export const cloudEnabled = Boolean(URL && KEY);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cloudEnabled) throw new Error("Supabase ist nicht eingerichtet");
  client ??= createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return client;
}
