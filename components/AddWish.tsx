"use client";
import { useState } from "react";
import { uid } from "@/lib/format";
import { parsePrice } from "@/lib/extract";
import type { ProductPreview, Wish } from "@/lib/types";

export default function AddWish({ onAdd }: { onAdd: (w: Wish) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<(ProductPreview & { url?: string; priceText: string }) | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function load(e: React.FormEvent) {
    e.preventDefault();
    const link = url.trim();
    if (!link) return;
    setLoading(true);
    setHint(null);
    try {
      const href = /^https?:\/\//i.test(link) ? link : `https://${link}`;
      const res = await fetch(`/api/vorschau?url=${encodeURIComponent(href)}`);
      const data = (await res.json()) as ProductPreview & { error?: string; blocked?: boolean };
      if (data.error) return setHint(data.error);
      if (data.blocked || !data.title)
        setHint("Dieser Shop lässt sich nicht automatisch auslesen. Trag die Angaben einfach selbst ein.");
      setDraft({ ...data, url: href, priceText: data.price != null ? String(data.price).replace(".", ",") : "" });
    } catch {
      setHint("Das hat nicht geklappt. Prüf den Link oder trag den Wunsch selbst ein.");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!draft?.title?.trim()) return;
    onAdd({
      id: uid(),
      url: draft.url,
      title: draft.title.trim(),
      image: draft.image || undefined,
      price: parsePrice(draft.priceText),
      currency: draft.currency ?? "EUR",
      shop: draft.shop,
      priority: 2,
    });
    setDraft(null);
    setUrl("");
    setHint(null);
  }

  if (draft)
    return (
      <div className="mt-2 space-y-2 rounded-xl border border-rose-200 bg-rose-50/50 p-3">
        {hint && <p className="text-xs text-amber-700">{hint}</p>}
        <div className="flex gap-3">
          {draft.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.image} alt="" referrerPolicy="no-referrer" className="h-16 w-16 shrink-0 rounded bg-white object-contain" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-white text-2xl">🎁</div>
          )}
          <textarea value={draft.title ?? ""} placeholder="Was wünschst du dir?" rows={3}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm" />
        </div>
        <div className="flex gap-2">
          <input value={draft.priceText} placeholder="Preis, z. B. 29,99" inputMode="decimal"
            onChange={(e) => setDraft({ ...draft, priceText: e.target.value })}
            className="w-1/3 rounded border border-neutral-300 px-2 py-1 text-sm" />
          <input value={draft.image ?? ""} placeholder="Bild-Link (optional)"
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            className="flex-1 rounded border border-neutral-300 px-2 py-1 text-sm" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDraft(null)} className="px-3 py-1.5 text-sm text-neutral-500">Abbrechen</button>
          <button onClick={save} disabled={!draft.title?.trim()}
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40">
            Hinzufügen
          </button>
        </div>
      </div>
    );

  return (
    <div className="mt-2">
      <form onSubmit={load} className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link aus einem Shop einfügen"
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        <button disabled={loading || !url.trim()}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">
          {loading ? "Lädt…" : "Holen"}
        </button>
      </form>
      {hint && <p className="mt-1 text-xs text-red-600">{hint}</p>}
      <button onClick={() => setDraft({ title: "", priceText: "" })} className="mt-2 text-xs text-neutral-500 underline hover:text-rose-600">
        Wunsch ohne Link eintragen, z. B. „Zeit zusammen“
      </button>
    </div>
  );
}
