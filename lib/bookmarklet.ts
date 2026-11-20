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
  const clean = (v?: unknown) => {
    if (typeof v !== "string" || !v.trim()) return undefined;
    const t = new DOMParser().parseFromString(v, "text/html").documentElement.textContent || v;
    return t.replace(/\s+/g, " ").trim();
  };
  const text = (sel: string) => clean(d.querySelector<HTMLElement>(sel)?.textContent);
  let name: string | undefined, brand: string | undefined, image: string | undefined;
  let price: unknown, currency: string | undefined;
  const find = (n: unknown): void => {
    if (!n || typeof n !== "object" || name) return;
    if (Array.isArray(n)) return n.forEach(find);
    const o = n as Record<string, unknown>;
    const t = o["@type"];
    if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) {
      name = clean(o.name);
      const br = o.brand as unknown;
      brand = clean(typeof br === "object" && br ? (br as Record<string, unknown>).name : br);
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
  const isVariant = (v?: string) => !v || v.length < 12 || /^[\d.,\s]+(ml|l|g|kg|cm|mm|m|stk|stück)?$/i.test(v);
  const pageTitle = clean(d.title)?.replace(/\s*[:|–-]\s*(Amazon\.[a-z.]+|Douglas|Thalia)\b.*$/i, "");
  const h1 = text("#productTitle") || text("h1");
  let title = name;
  if (isVariant(title)) {
    const full = [clean(meta("og:title")), h1, pageTitle].find((c) => !isVariant(c));
    title = full ? (name && !full.includes(name) ? `${full} ${name}` : full) : title;
  }
  if (title && brand && !title.toLowerCase().includes(brand.toLowerCase())) title = `${brand} ${title}`;
  title = title || clean(meta("og:title", "twitter:title")) || h1 || pageTitle;
  const amazonImg = d.querySelector<HTMLImageElement>("#landingImage, #imgBlkFront, #main-image");
  const priceEl = d.querySelector<HTMLElement>('[itemprop="price"]');
  const data = {
    url: location.href.split("#")[0],
    title,
    image:
      image ||
      meta("og:image", "twitter:image") ||
      amazonImg?.getAttribute("data-old-hires") ||
      amazonImg?.src ||
      undefined,
    price: String(
      price ??
        meta("product:price:amount", "og:price:amount") ??
        priceEl?.getAttribute("content") ??
        priceEl?.textContent ??
        text("#corePrice_feature_div .a-offscreen, #corePriceDisplay_desktop_feature_div .a-offscreen, .priceToPay .a-offscreen, #price_inside_buybox, .a-price .a-offscreen") ??
        "",
    ),
    currency: currency || meta("product:price:currency", "og:price:currency") || "EUR",
    shop: location.hostname.replace(/^www\./, ""),
  };
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  window.open(`${origin}/merken#d=${encodeURIComponent(b)}`, "_blank");
}

export function bookmarkletHref(origin: string): string {
  // Kommentare und Zeilenumbrüche würden den Knopf kaputt machen, wenn der Browser
  // ihn als Lesezeichen speichert. Darum wird der Code vollständig kodiert.
  const code = `(${collect.toString()})(${JSON.stringify(origin)});void 0`;
  return `javascript:${encodeURIComponent(code)}`;
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
