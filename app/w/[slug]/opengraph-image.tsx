import { ImageResponse } from "next/og";
import { paperMap, templatePaper } from "@/lib/design";
import { formatPrice } from "@/lib/format";
import { fetchSharedList } from "@/lib/shared-server";
import type { Wish } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "Vorschau des Wunschzettels";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

/** Lädt eine Google-Schrift als TTF (ohne Browserkennung liefert Google TTF) */
function googleFont(family: string, weight = 400): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}`;
  if (!fontCache.has(key))
    fontCache.set(
      key,
      (async () => {
        try {
          const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`, { signal: AbortSignal.timeout(4000) })).text();
          const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
          if (!url) return null;
          return await (await fetch(url, { signal: AbortSignal.timeout(4000) })).arrayBuffer();
        } catch {
          return null;
        }
      })(),
    );
  return fontCache.get(key)!;
}

/** Holt ein Produktbild als Daten-URL; fehlerhafte oder blockierte Bilder werden übersprungen */
async function imageData(src?: string): Promise<string | null> {
  if (!src || !/^https:\/\//.test(src)) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(3500), headers: { accept: "image/png,image/jpeg" } });
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!res.ok || !/^image\/(png|jpeg|jpg)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 3_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

const tapes = [
  "repeating-linear-gradient(45deg, #b5573b 0 10px, #f6ead8 10px 22px)",
  "repeating-linear-gradient(90deg, #6f8c6a 0 14px, #e9efe1 14px 26px)",
  "repeating-linear-gradient(-45deg, #d9a3a0 0 8px, #fbf0ea 8px 18px)",
];

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await fetchSharedList(slug);
  const paper = paperMap[list?.design && !list.design.off ? list.design.paper : templatePaper[list?.template ?? "weihnachten"]] ?? paperMap.creme;
  const bg = String(paper.style.backgroundColor ?? "#fbf6ec");
  const dark = !!paper.dark;
  const ink = dark ? "#f3d27a" : "#3b2f2a";
  const soft = dark ? "#e8dcc4" : "#7a6a5e";

  const wishes: Wish[] = [...(list?.wishes ?? [])].sort((a, b) => b.priority - a.priority).slice(0, 3);
  const [script, serif, ...imgs] = await Promise.all([
    googleFont("Great Vibes"),
    googleFont("Cormorant Garamond", 600),
    ...wishes.map((w) => imageData(w.image)),
  ]);
  const fonts = [
    ...(script ? [{ name: "Script", data: script, weight: 400 as const }] : []),
    ...(serif ? [{ name: "Serif", data: serif, weight: 600 as const }] : []),
  ];
  const title = list?.title || "Mein Wunschzettel";
  const n = list?.wishes.length ?? 0;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: bg, padding: 56, fontFamily: "Serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: wishes.length ? 520 : 1088 }}>
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: soft }}>Wunschzettel</div>
          <div style={{ fontFamily: script ? "Script" : "Serif", fontSize: title.length > 22 ? 76 : 96, lineHeight: 1.05, color: ink, marginTop: 10 }}>{title}</div>
          <div style={{ width: 220, height: 6, borderRadius: 3, background: "#b5573b", marginTop: 18, opacity: 0.85 }} />
          {list?.subtitle ? <div style={{ fontSize: 34, color: soft, marginTop: 20 }}>{list.subtitle}</div> : null}
          <div style={{ fontSize: 28, color: soft, marginTop: 28 }}>
            {list ? `${n} ${n === 1 ? "Wunsch" : "Wünsche"} · gestaltet mit Wunschwerk` : "gestaltet mit Wunschwerk"}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", position: "relative" }}>
          {wishes.map((w, i) => {
            const rot = [-6, 3, -3][i];
            const pos = [{ left: 0, top: 120 }, { left: 190, top: 80 }, { left: 378, top: 140 }][i];
            const price = formatPrice(w.price, w.currency);
            return (
              <div key={w.id} style={{ position: "absolute", ...pos, width: 196, display: "flex", flexDirection: "column", background: "#fffdf9", padding: "14px 14px 12px", boxShadow: "0 8px 24px rgba(40,25,15,.3)", transform: `rotate(${rot}deg)` }}>
                <div style={{ position: "absolute", top: -16, left: 48, width: 100, height: 28, background: tapes[i], opacity: 0.85, transform: `rotate(${-rot - 3}deg)` }} />
                <div style={{ width: 168, height: 168, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3ece2" }}>
                  {imgs[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                    <img src={imgs[i]!} style={{ maxWidth: 168, maxHeight: 168, objectFit: "contain" }} />
                  ) : (
                    <svg width="70" height="62" viewBox="0 0 24 22"><path d="M12 21s-8.5-5.3-10.6-10.2C-.1 6.9 2.3 2 6.6 2 9.1 2 11 3.6 12 5.3 13 3.6 14.9 2 17.4 2c4.3 0 6.7 4.9 5.2 8.8C20.5 15.7 12 21 12 21Z" fill="#b5573b" opacity=".75" /></svg>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8, fontSize: 19, color: "#3b2f2a" }}>
                  <span style={{ maxWidth: price ? 100 : 168, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{w.title}</span>
                  {price ? <span style={{ fontSize: 16 }}>{price}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
