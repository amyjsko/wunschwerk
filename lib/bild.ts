/* Eigene Bilder fürs Scrapbook: verkleinern, als Daten-Link speichern, weißen Hintergrund entfernen. */

const MAX_SIDE = 1000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
    img.src = src;
  });
}

function toCanvas(img: HTMLImageElement, max = MAX_SIDE) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * s));
  c.height = Math.max(1, Math.round(img.naturalHeight * s));
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

function exportCanvas(c: HTMLCanvasElement) {
  const webp = c.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/png");
}

export interface Picture {
  src: string;
  ratio: number;
}

async function fromBlob(blob: Blob): Promise<Picture> {
  if (!blob.type.startsWith("image/")) throw new Error("Das ist kein Bild.");
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const c = toCanvas(img);
    return { src: exportCanvas(c), ratio: c.width / c.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Bild vom Computer oder Handy */
export function pictureFromFile(file: File) {
  return fromBlob(file);
}

/**
 * Bild aus einem Link. Das kann ein direkter Bild-Link sein oder eine Seite
 * (z. B. ein Pinterest-Pin), deren Vorschaubild wir nehmen.
 */
export async function pictureFromLink(link: string): Promise<Picture> {
  const href = link.trim();
  if (!/^https?:\/\//i.test(href)) throw new Error("Bitte einen vollständigen Link einfügen (mit https://).");
  let res = await fetch(`/api/bild?url=${encodeURIComponent(href)}`);
  if (!res.ok) {
    const p = await fetch(`/api/vorschau?url=${encodeURIComponent(href)}`).then((r) => r.json()).catch(() => null);
    if (!p?.image) throw new Error("Auf dieser Seite haben wir kein Bild gefunden.");
    res = await fetch(`/api/bild?url=${encodeURIComponent(p.image)}`);
    if (!res.ok) throw new Error("Das Bild ließ sich nicht laden.");
  }
  return fromBlob(await res.blob());
}

/**
 * Macht weißen (oder sehr hellen) Hintergrund durchsichtig. Es wird vom Rand aus
 * gefüllt, damit helle Stellen mitten im Motiv erhalten bleiben.
 */
export async function removeWhite(src: string, strength = 0.5): Promise<string> {
  const img = await loadImage(src);
  const c = toCanvas(img);
  const ctx = c.getContext("2d")!;
  const { width: w, height: h } = c;
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const tol = 18 + strength * 70;
  const isBg = (i: number) => {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    return px[i + 3] > 0 && 255 - min < tol && max - min < tol * 0.7;
  };
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    const k = y * w + x;
    if (!seen[k] && isBg(k * 4)) { seen[k] = 1; stack.push(k); }
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const k = stack.pop()!;
    const x = k % w, y = (k - x) / w;
    px[k * 4 + 3] = 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  // Weiche Kante: Randpixel neben entferntem Hintergrund je nach Helligkeit halb durchsichtig
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const k = y * w + x;
      if (seen[k]) continue;
      if (seen[k - 1] || seen[k + 1] || seen[k - w] || seen[k + w]) {
        const i = k * 4;
        const light = Math.min(px[i], px[i + 1], px[i + 2]) / 255;
        px[i + 3] = Math.round(px[i + 3] * Math.min(1, (1 - light) * 2.2 + 0.25));
      }
    }
  ctx.putImageData(data, 0, 0);
  return exportCanvas(c);
}
