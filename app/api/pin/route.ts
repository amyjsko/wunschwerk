import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fragt einen öffentlichen Pin über die offizielle oEmbed-Schnittstelle von
 * Pinterest ab. Das Bild wird nicht kopiert, sondern mit Quellenlink angezeigt.
 */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let id: string | undefined;
  try {
    const u = new URL(raw);
    if (u.protocol === "https:" && /^([a-z]{2,3}\.)?pinterest\.(com|de|at|ch|fr|es|it|co\.uk|ca)$/.test(u.hostname))
      id = u.pathname.match(/^\/pin\/(?:[^/]*--)?(\d+)\/?/)?.[1];
  } catch {}
  if (!id) return NextResponse.json({ error: "Bitte den ganzen Link eines Pins einfügen (pinterest.de/pin/…)." }, { status: 400 });

  const link = `https://www.pinterest.com/pin/${id}/`;
  try {
    const res = await fetch(`https://www.pinterest.com/oembed.json?url=${encodeURIComponent(link)}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    const image = new URL(String(d.thumbnail_url));
    if (image.protocol !== "https:" || image.hostname !== "i.pinimg.com") throw new Error();
    const ratio = Number(d.thumbnail_width) / Number(d.thumbnail_height);
    return NextResponse.json({
      src: image.toString(),
      ratio: Number.isFinite(ratio) && ratio > 0 ? ratio : 1,
      credit: String(d.author_name || "Pinterest").slice(0, 60),
      link,
    });
  } catch {
    return NextResponse.json({ error: "Dieser Pin ist nicht öffentlich oder gerade nicht erreichbar." }, { status: 404 });
  }
}
