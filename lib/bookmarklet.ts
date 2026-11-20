/**
 * „Merken“-Knopf für die Lesezeichenleiste. Er läuft direkt auf der Shop-Seite
 * im Browser der Nutzerin, darum können Shops ihn nicht blockieren wie unsere
 * Server-Abfrage. Er liest Titel, Bild und Preis und öffnet Wunschwerk.
 */
function collect(origin: string) {
  const d = document;
  const meta = (...keys: string[]) => {
    for (const k of keys) {
      const el = d.querySelector<HTMLMetaElement>(
        `meta[property="${k}"],meta[name="${k}"],meta[itemprop="${k}"]`,
      );
      if (el?.content) return el.content.trim();
    }
    return undefined;
  };
  let name: string | undefined, image: string | undefined, price: unknown, currency: string | undefined;
  const find = (n: unknown): void => {
    if (!n || typeof n !== "object" || name) return;
    if (Array.isArray(n)) return n.forEach(find);
    const o = n as Record<string, unknown>;
    const t = o["@type"];
    if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) {
      name = o.name as string;
      let img = o.image as unknown;
      if (Array.isArray(img)) img = img[0];
      if (img && typeof img === "object") img = (img as Record<string, unknown>).url;
      image = typeof img === "string" ? img : undefined;
      let off = o.offers as unknown;
      if (Array.isArray(off)) off = off[0];
      const of = (off ?? {}) as Record<string, unknown>;
      price = of.price ?? of.lowPrice;
      currency = of.priceCurrency as string;
      return;
    }
    if (o["@graph"]) find(o["@graph"]);
  };
  d.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      find(JSON.parse(s.textContent || ""));
    } catch {}
  });
  const priceEl = d.querySelector<HTMLElement>('[itemprop="price"]');
  const data = {
    url: location.href.split("#")[0],
    title: name || meta("og:title", "twitter:title") || d.title,
    image: image || meta("og:image", "twitter:image"),
    price: String(
      price ?? meta("product:price:amount", "og:price:amount") ?? priceEl?.getAttribute("content") ?? priceEl?.textContent ?? "",
    ),
    currency: currency || meta("product:price:currency", "og:price:currency") || "EUR",
    shop: location.hostname.replace(/^www\./, ""),
  };
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  window.open(`${origin}/merken#d=${encodeURIComponent(b)}`, "_blank");
}

export function bookmarkletHref(origin: string): string {
  return `javascript:(${collect.toString()})(${JSON.stringify(origin)});void 0`;
}

export interface Captured {
  url?: string;
  title?: string;
  image?: string;
  price?: string;
  currency?: string;
  shop?: string;
}

export function decodeCaptured(hash: string): Captured | null {
  try {
    const raw = new URLSearchParams(hash.replace(/^#/, "")).get("d");
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(escape(atob(raw)))) as Captured;
  } catch {
    return null;
  }
}
