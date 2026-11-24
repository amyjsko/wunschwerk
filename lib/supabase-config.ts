/**
 * Öffentliche Verbindungsdaten der Datenbank (stehen ohnehin im Browser).
 * Der Schutz kommt von den Regeln in supabase/schema.sql.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://szydavbuuaywjxelaias.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_F2OLDFiKx-0GzdlSJhC3Vg_dC9Jzj_G";
