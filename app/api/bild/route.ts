import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;
const MAX = 6 * 1024 * 1024;

/**
 * Holt Produktbilder über unseren Server. So laden sie auch bei Shops, die
 * fremde Seiten sperren, und das Scrapbook lässt sich als Bild speichern.
 */
export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get("url");
  let url: URL;
  try {
    url = new URL(target ?? "");
    if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) throw new Error();
  } catch {
    return new NextResponse("Ungültiger Link", { status: 400 });
  }
  try {
    const res = await fetch(url, {
      headers: { accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/") || type.includes("svg")) throw new Error();
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX) throw new Error();
    return new NextResponse(buf, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return new NextResponse("Bild nicht erreichbar", { status: 404 });
  }
}
