"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Verbindung zur Datenbank. Die beiden Werte sind öffentlich (sie stehen ohnehin
 * im Browser), der Schutz kommt von den Regeln in supabase/schema.sql.
 * Ohne Werte läuft Wunschwerk wie bisher nur im Browser.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const cloudEnabled = Boolean(URL && KEY);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cloudEnabled) throw new Error("Supabase ist nicht eingerichtet");
  client ??= createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return client;
}
