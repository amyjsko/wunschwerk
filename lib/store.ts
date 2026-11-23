"use client";
/**
 * Speichert Wunschzettel entweder im Konto (Supabase) oder, wenn man nicht
 * angemeldet ist, nur im Browser.
 */
import type { Session } from "@supabase/supabase-js";
import * as local from "./storage";
import { supabase } from "./supabase";
import type { SharedList, WishList } from "./types";

interface Row {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  template: WishList["template"];
  layout: WishList["layout"];
  wishes: WishList["wishes"];
  design?: WishList["design"];
  created_at: string;
  updated_at: string;
}

const fromRow = (r: Row): WishList => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  template: r.template,
  layout: r.layout,
  wishes: r.wishes ?? [],
  design: r.design ?? null,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
});

const toRow = (l: WishList) => ({
  title: l.title,
  subtitle: l.subtitle,
  template: l.template,
  layout: l.layout,
  wishes: l.wishes,
  // Erst mitschicken, wenn es eine Gestaltung gibt, damit ältere Datenbanken weiter funktionieren
  ...(l.design ? { design: l.design } : {}),
  updated_at: new Date().toISOString(),
});

export function newSlug() {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

export async function listLists(session: Session | null): Promise<WishList[]> {
  if (!session) return local.loadLists();
  const { data, error } = await supabase().from("lists").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function getList(session: Session | null, id: string): Promise<WishList | undefined> {
  const loc = local.getList(id);
  if (loc || !session) return loc;
  const { data } = await supabase().from("lists").select("*").eq("id", id).maybeSingle();
  return data ? fromRow(data as Row) : undefined;
}

/** Legt einen neuen Wunschzettel an und gibt ihn mit seiner endgültigen id zurück. */
export async function createList(session: Session | null, list: WishList): Promise<WishList> {
  if (!session) {
    local.upsertList(list);
    return list;
  }
  const { data, error } = await supabase()
    .from("lists")
    .insert({ ...toRow(list), slug: newSlug() })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function saveList(list: WishList): Promise<void> {
  if (!list.slug) {
    local.upsertList(list);
    return;
  }
  const { error } = await supabase().from("lists").update(toRow(list)).eq("id", list.id);
  if (error) throw error;
}

export async function removeList(list: WishList): Promise<void> {
  if (!list.slug) return local.deleteList(list.id);
  const { error } = await supabase().from("lists").delete().eq("id", list.id);
  if (error) throw error;
}

/** Übernimmt Listen aus dem Browser in das Konto. */
export async function importLocalLists(session: Session): Promise<number> {
  const lists = local.loadLists();
  for (const l of lists) {
    await createList(session, l);
    local.deleteList(l.id);
  }
  return lists.length;
}

export async function getSharedList(slug: string): Promise<SharedList | null> {
  const { data, error } = await supabase().rpc("get_shared_list", { p_slug: slug });
  if (error) throw error;
  return (data as SharedList | null) ?? null;
}

export async function reserveWish(slug: string, wishId: string, name: string): Promise<string> {
  const { data, error } = await supabase().rpc("reserve_wish", { p_slug: slug, p_wish_id: wishId, p_name: name });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function cancelReservation(token: string): Promise<void> {
  const { error } = await supabase().rpc("cancel_reservation", { p_token: token });
  if (error) throw new Error(error.message);
}

/** Merkt sich im Browser des Gastes, welche Reservierungen von ihm sind. */
const MINE = "wunschwerk:meine-reservierungen";
export function myReservations(slug: string): Record<string, string> {
  try {
    return (JSON.parse(localStorage.getItem(MINE) || "{}")[slug] ?? {}) as Record<string, string>;
  } catch {
    return {};
  }
}
export function rememberReservation(slug: string, wishId: string, token: string | null) {
  try {
    const all = JSON.parse(localStorage.getItem(MINE) || "{}");
    all[slug] = { ...(all[slug] ?? {}) };
    if (token) all[slug][wishId] = token;
    else delete all[slug][wishId];
    localStorage.setItem(MINE, JSON.stringify(all));
  } catch {}
}
