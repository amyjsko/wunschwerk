/**
 * Entfernt einen hellen Hintergrund, aber nur dort, wo er mit dem Bildrand
 * verbunden ist. Weiße Flächen im Motiv bleiben dadurch erhalten.
 * strength: 0 (nur reines Weiß) bis 100 (auch Hellgrau).
 */
export function removeWhite(data: ImageData, strength: number): void {
  const { width: w, height: h, data: px } = data;
  const limit = 252 - strength * 0.8;
  const spread = 12 + strength * 0.35;
  const light = (p: number) => {
    const i = p * 4;
    if (px[i + 3] < 16) return true;
    const lo = Math.min(px[i], px[i + 1], px[i + 2]);
    const hi = Math.max(px[i], px[i + 1], px[i + 2]);
    return lo >= limit && hi - lo <= spread;
  };
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (p: number) => {
    if (!bg[p] && light(p)) {
      bg[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (p >= w) push(p - w);
    if (p < w * (h - 1)) push(p + w);
  }
  for (let p = 0; p < w * h; p++) {
    if (bg[p]) {
      px[p * 4 + 3] = 0;
      continue;
    }
    // Randpixel leicht weichzeichnen, damit kein harter weißer Saum bleibt
    const x = p % w;
    let n = 0;
    if (x > 0 && bg[p - 1]) n++;
    if (x < w - 1 && bg[p + 1]) n++;
    if (p >= w && bg[p - w]) n++;
    if (p < w * (h - 1) && bg[p + w]) n++;
    if (n) px[p * 4 + 3] = Math.round(px[p * 4 + 3] * (1 - n * 0.22));
  }
}

/** Verkleinert ein Bild, stellt es auf Wunsch frei und schneidet leere Ränder ab. */
export function prepareImage(img: HTMLImageElement, cut: boolean, strength: number, max = 640): { src: string; ratio: number } {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * s));
  const h = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  let out = c;
  if (cut) {
    const data = ctx.getImageData(0, 0, w, h);
    removeWhite(data, strength);
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (data.data[(y * w + x) * 4 + 3] > 20) {
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
    if (x1 >= x0) {
      ctx.putImageData(data, 0, 0);
      out = document.createElement("canvas");
      out.width = x1 - x0 + 1;
      out.height = y1 - y0 + 1;
      out.getContext("2d")!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    }
  }
  // Safari kann kein WebP schreiben und liefert dann automatisch PNG
  let src = out.toDataURL("image/webp", 0.82);
  if (!src.startsWith("data:image/webp") && !cut) src = out.toDataURL("image/jpeg", 0.82);
  return { src, ratio: out.width / out.height };
}
