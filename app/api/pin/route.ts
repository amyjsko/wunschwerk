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
    let u = new URL(raw);
    // Kurzlinks aus der Pinterest-App (pin.it/…) leiten über Pinterest auf den Pin weiter
    const pinHost = (h: string) => h === "pin.it" || h === "api.pinterest.com";
    for (let hop = 0; hop < 3 && u.protocol === "https:" && pinHost(u.hostname) && !/^\/pin\/[^/]*\d/.test(u.pathname); hop++) {
      const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(6000) });
      const loc = r.headers.get("location");
      if (!loc) break;
      u = new URL(loc, u);
    }
    if (u.protocol === "https:" && /^([a-z]{2,3}\.)?pinterest\.(com|de|at|ch|fr|es|it|co\.uk|ca)$/.test(u.hostname))
      id = u.pathname.match(/^\/pin\/(?:[^/]*--)?(\d+)\/?/)?.[1];
  } catch {}
  if (!id) return NextResponse.json({ error: "Bitte den ganzen Link eines Pins einfügen (pinterest.de/pin/… oder pin.it/…)." }, { status: 400 });

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
      title: String(d.title || "").slice(0, 200),
      link,
    });
  } catch {
    return NextResponse.json({ error: "Dieser Pin ist nicht öffentlich oder gerade nicht erreichbar." }, { status: 404 });
  }
}
