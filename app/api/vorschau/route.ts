import { NextResponse } from "next/server";
import { extractProduct, looksBlocked, titleFromUrl } from "@/lib/extract";

export const runtime = "nodejs";

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;

export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get("url");
  let url: URL;
  try {
    url = new URL(target ?? "");
    if (!/^https?:$/.test(url.protocol) || PRIVATE_HOST.test(url.hostname)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Das sieht nicht nach einem gültigen Link aus." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "de-DE,de;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = (await res.text()).slice(0, 2_000_000);
    const preview = extractProduct(html, res.url || url.toString());
    if (looksBlocked(preview.title)) throw new Error("blocked");
    return NextResponse.json(preview);
  } catch {
    // Shop blockiert (z. B. Amazon) oder nicht erreichbar:
    // Shop-Namen und, wenn möglich, einen Titel aus dem Link zurückgeben
    return NextResponse.json({
      shop: url.hostname.replace(/^www\./, ""),
      title: titleFromUrl(url.toString()),
      blocked: true,
    });
  }
}
