import type { ProductPreview } from "./types";

/** Liest Titel, Bild und Preis aus dem HTML einer Produktseite. */
export function extractProduct(html: string, pageUrl: string): ProductPreview {
  const meta = (keys: string[]) => {
    for (const key of keys) {
      const re = new RegExp(
        `<meta[^>]+(?:property|name|itemprop)=["']${key.replace(/[:.]/g, "\\$&")}["'][^>]*>`,
        "i",
      );
      const tag = html.match(re)?.[0];
      const m = tag?.match(/content=(?:"([^"]*)"|'([^']*)')/i);
      const content = m?.[1] ?? m?.[2];
      if (content) return decodeEntities(content.trim());
    }
    return undefined;
  };

  const ld = findJsonLdProduct(html);

  const title =
    ld?.name ??
    meta(["og:title", "twitter:title"]) ??
    decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "") ??
    undefined;

  const rawImage = ld?.image ?? meta(["og:image", "og:image:secure_url", "twitter:image", "image"]);

  const priceStr =
    ld?.price ??
    meta(["product:price:amount", "og:price:amount", "price", "twitter:data1"]) ??
    html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i)?.[1];

  const currency =
    ld?.currency ?? meta(["product:price:currency", "og:price:currency", "priceCurrency"]) ?? "EUR";

  let shop: string | undefined;
  try {
    shop = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {}

  return {
    title: title || undefined,
    image: rawImage ? absolutize(rawImage, pageUrl) : undefined,
    price: parsePrice(priceStr),
    currency: currency.length === 3 ? currency.toUpperCase() : "EUR",
    shop,
  };
}

interface LdProduct {
  name?: string;
  image?: string;
  price?: string;
  currency?: string;
}

function findJsonLdProduct(html: string): LdProduct | undefined {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const [, body] of scripts) {
    let data: unknown;
    try {
      data = JSON.parse(body.trim());
    } catch {
      continue;
    }
    const product = walk(data);
    if (product) return product;
  }
  return undefined;
}

function walk(node: unknown): LdProduct | undefined {
  if (!node || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = walk(n);
      if (r) return r;
    }
    return undefined;
  }
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
  if (isProduct) {
    const offers = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
    const o = (offers ?? {}) as Record<string, unknown>;
    const price = o.price ?? o.lowPrice ?? (o.priceSpecification as Record<string, unknown>)?.price;
    let image = obj.image as unknown;
    if (Array.isArray(image)) image = image[0];
    if (image && typeof image === "object") image = (image as Record<string, unknown>).url;
    return {
      name: typeof obj.name === "string" ? decodeEntities(obj.name) : undefined,
      image: typeof image === "string" ? image : undefined,
      price: price != null ? String(price) : undefined,
      currency: typeof o.priceCurrency === "string" ? o.priceCurrency : undefined,
    };
  }
  if (obj["@graph"]) return walk(obj["@graph"]);
  return undefined;
}

export function parsePrice(s?: string): number | undefined {
  if (!s) return undefined;
  const m = s.replace(/\s/g, "").match(/\d[\d.,]*/);
  if (!m) return undefined;
  let n = m[0];
  // "1.299,99" -> 1299.99 ; "1,299.99" -> 1299.99 ; "29,99" -> 29.99
  const lastComma = n.lastIndexOf(",");
  const lastDot = n.lastIndexOf(".");
  if (lastComma > lastDot) n = n.replace(/\./g, "").replace(",", ".");
  else n = n.replace(/,/g, "");
  const v = parseFloat(n);
  return Number.isFinite(v) ? v : undefined;
}

function absolutize(src: string, base: string) {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

/** Seiten, die statt des Produkts eine Sperr- oder Captcha-Seite liefern. */
const BLOCK_TITLES =
  /too many requests|robot check|captcha|access denied|just a moment|attention required|are you a (human|robot)|zugriff verweigert|service unavailable|forbidden|bot verification|^amazon\.[a-z.]+$|^error\b/i;

export function looksBlocked(title?: string): boolean {
  return !title || BLOCK_TITLES.test(title.trim());
}

/** Macht aus einem Link wie amazon.de/Kuschelige-Wolldecke-Grau/dp/B0... einen lesbaren Titel. */
export function titleFromUrl(pageUrl: string): string | undefined {
  try {
    const parts = new URL(pageUrl).pathname
      .split("/")
      .map((p) => decodeURIComponent(p).replace(/\.(html?|php|aspx?)$/i, ""))
      .filter((p) => /[a-zäöüß]{3,}.*[-_].*[a-zäöüß]{2,}/i.test(p) && !/^(dp|gp|p|product|produkt|artikel|shop|de|en)$/i.test(p));
    const best = parts.sort((a, b) => b.length - a.length)[0];
    if (!best) return undefined;
    const words = best
      .split(/[-_+]+/)
      .filter((w) => w && !/^[A-Z0-9]{8,}$/.test(w) && !/^\d+$/.test(w));
    if (words.length < 2) return undefined;
    const t = words.join(" ");
    return t.charAt(0).toUpperCase() + t.slice(1);
  } catch {
    return undefined;
  }
}
