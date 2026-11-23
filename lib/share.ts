import type { WishList } from "./types";

/**
 * Für den Prototyp steckt der ganze Wunschzettel komprimiert im Link
 * (hinter dem #, wird also nie an einen Server geschickt).
 * Später ersetzt eine Datenbank (z. B. Supabase) das durch kurze Links.
 */

type Shared = Omit<WishList, "id" | "createdAt" | "updatedAt">;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeList(list: WishList): Promise<string> {
  const data: Shared = {
    title: list.title,
    subtitle: list.subtitle,
    template: list.template,
    layout: list.layout,
    wishes: list.wishes,
    design: list.design,
  };
  const json = new TextEncoder().encode(JSON.stringify(data));
  return toBase64Url(await pipe(json, new CompressionStream("deflate-raw")));
}

export async function decodeList(code: string): Promise<Shared> {
  const bytes = await pipe(fromBase64Url(code), new DecompressionStream("deflate-raw"));
  return JSON.parse(new TextDecoder().decode(bytes)) as Shared;
}
