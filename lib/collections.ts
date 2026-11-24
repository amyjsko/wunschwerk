"use client";
/**
 * Sammlungen mit gemerkten Pins und Bildern. Mit Konto liegen sie in Supabase,
 * ohne Konto nur in diesem Browser. Gespeichert werden nur Links, keine Bilder.
 */
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { uid } from "./format";

export interface CollectionItem {
  id: string;
  /** Link zum Bild */
  src: string;
  /** Seitenverhältnis Breite / Höhe */
  ratio: number;
  /** Seite, von der das Bild stammt */
  link?: string;
  title?: string;
  credit?: string;
  addedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
  /** false = liegt nur in diesem Browser */
  cloud: boolean;
  updatedAt: number;
}

interface Row {
  id: string;
  name: string;
  items: CollectionItem[];
  updated_at: string;
}

const KEY = "wunschwerk:sammlungen";
const fromRow = (r: Row): Collection => ({ id: r.id, name: r.name, items: r.items ?? [], cloud: true, updatedAt: Date.parse(r.updated_at) });

function loadLocal(): Collection[] {
  try {
    return (JSON.parse(localStorage.getItem(KEY) || "[]") as Collection[]).map((c) => ({ ...c, cloud: false }));
  } catch {
    return [];
  }
}
function saveLocal(all: Collection[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    throw new Error("Der Speicher im Browser ist voll.");
  }
}

export async function listCollections(session: Session | null): Promise<Collection[]> {
  if (!session) return loadLocal().sort((a, b) => b.updatedAt - a.updatedAt);
  const { data, error } = await supabase().from("collections").select("id,name,items,updated_at").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function getCollection(session: Session | null, id: string): Promise<Collection | undefined> {
  const loc = loadLocal().find((c) => c.id === id);
  if (loc || !session) return loc;
  const { data } = await supabase().from("collections").select("id,name,items,updated_at").eq("id", id).maybeSingle();
  return data ? fromRow(data as Row) : undefined;
}

export async function createCollection(session: Session | null, name: string): Promise<Collection> {
  const clean = name.trim().slice(0, 80) || "Neue Sammlung";
  if (!session) {
    const c: Collection = { id: uid(), name: clean, items: [], cloud: false, updatedAt: Date.now() };
    saveLocal([c, ...loadLocal()]);
    return c;
  }
  const { data, error } = await supabase().from("collections").insert({ name: clean }).select("id,name,items,updated_at").single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function saveCollection(c: Collection): Promise<void> {
  if (!c.cloud) {
    const all = loadLocal();
    const i = all.findIndex((x) => x.id === c.id);
    const next = { ...c, updatedAt: Date.now() };
    if (i >= 0) all[i] = next;
    else all.unshift(next);
    return saveLocal(all);
  }
  const { error } = await supabase()
    .from("collections")
    .update({ name: c.name.trim().slice(0, 80), items: c.items, updated_at: new Date().toISOString() })
    .eq("id", c.id);
  if (error) throw error;
}

export async function removeCollection(c: Collection): Promise<void> {
  if (!c.cloud) return saveLocal(loadLocal().filter((x) => x.id !== c.id));
  const { error } = await supabase().from("collections").delete().eq("id", c.id);
  if (error) throw error;
}

/** Fügt ein Bild vorne in die Sammlung ein (doppelte Bilder werden übersprungen). */
export async function addToCollection(c: Collection, item: Omit<CollectionItem, "id" | "addedAt">): Promise<Collection> {
  if (c.items.some((i) => i.src === item.src)) return c;
  const next = { ...c, items: [{ ...item, id: uid(), addedAt: Date.now() }, ...c.items] };
  await saveCollection(next);
  return next;
}

/** Pinterest liefert kleine Vorschaubilder (236x). Größere Fassung derselben Datei. */
export function largerPin(src: string): string {
  return src.replace(/^(https:\/\/i\.pinimg\.com\/)(?:\d+x\d*|originals)\//, "$1736x/");
}

/** Misst das Seitenverhältnis eines Bildes im Browser. */
export function measure(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
    img.onerror = () => resolve(0);
    img.src = src;
    setTimeout(() => resolve(1), 8000);
  });
}

/**
 * Holt zu einem Link ein Bild: Pinterest-Pins über die offizielle Pin-Abfrage,
 * direkte Bildlinks so wie sie sind.
 */
export async function itemFromLink(link: string): Promise<Omit<CollectionItem, "id" | "addedAt">> {
  const url = link.trim();
  if (/pinterest\.|pin\.it\//i.test(url)) {
    const res = await fetch(`/api/pin?url=${encodeURIComponent(url)}`);
    const d = await res.json();
    if (!res.ok) throw new Error(d.error);
    const big = largerPin(d.src);
    const ratio = await measure(big);
    return ratio ? { src: big, ratio, link: d.link, credit: d.credit, title: d.title } : { src: d.src, ratio: d.ratio, link: d.link, credit: d.credit, title: d.title };
  }
  if (/^https:\/\/\S+\.(jpe?g|png|webp|gif|avif)(\?\S*)?$/i.test(url)) {
    const ratio = await measure(url);
    if (!ratio) throw new Error("Dieses Bild lässt sich nicht laden.");
    return { src: url, ratio, link: url };
  }
  throw new Error("Bitte den Link eines Pinterest-Pins oder eines Bildes einfügen. Für andere Seiten nimm den Knopf „Wunschwerk merken“.");
}
