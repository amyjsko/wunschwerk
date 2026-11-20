"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WishBoard from "@/components/WishBoard";
import AddWish from "@/components/AddWish";
import ShareDialog from "@/components/ShareDialog";
import { getList, upsertList } from "@/lib/storage";
import { templateList } from "@/lib/templates";
import { formatPrice } from "@/lib/format";
import type { Wish, WishList } from "@/lib/types";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<WishList | null | undefined>(undefined);
  const [sharing, setSharing] = useState(false);

  useEffect(() => setList(getList(id) ?? null), [id]);

  function update(patch: Partial<WishList>) {
    setList((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, updatedAt: Date.now() };
      upsertList(next);
      return next;
    });
  }

  if (list === undefined) return null;
  if (list === null)
    return (
      <main className="py-24 text-center">
        <p>Diesen Wunschzettel gibt es in diesem Browser nicht.</p>
        <Link href="/" className="text-rose-600 underline">Zur Startseite</Link>
      </main>
    );

  const setWish = (wid: string, patch: Partial<Wish>) =>
    update({ wishes: list.wishes.map((w) => (w.id === wid ? { ...w, ...patch } : w)) });
  const move = (i: number, dir: -1 | 1) => {
    const ws = [...list.wishes];
    const j = i + dir;
    if (j < 0 || j >= ws.length) return;
    [ws[i], ws[j]] = [ws[j], ws[i]];
    update({ wishes: ws });
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <aside className="no-print border-b border-neutral-200 bg-white p-5 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-rose-600">← Übersicht</Link>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">
              Drucken / PDF
            </button>
            <button onClick={() => setSharing(true)} className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">
              Teilen
            </button>
          </div>
        </div>

        <section className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Titel</span>
            <input value={list.title} onChange={(e) => update({ title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Untertitel</span>
            <input value={list.subtitle} placeholder="z. B. Von Lena, Weihnachten 2026"
              onChange={(e) => update({ subtitle: e.target.value })}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
          </label>
        </section>

        <section className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Vorlage</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {templateList.map((t) => (
              <button key={t.id} onClick={() => update({ template: t.id })}
                className={`rounded-lg p-1 text-xs ${list.template === t.id ? "ring-2 ring-rose-600" : "ring-1 ring-neutral-200"}`}>
                <div className={`h-10 rounded-md border-2 ${t.swatch}`} />
                <div className="mt-1 truncate">{t.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex rounded-lg border border-neutral-300 p-0.5 text-sm">
            {(["raster", "liste"] as const).map((l) => (
              <button key={l} onClick={() => update({ layout: l })}
                className={`flex-1 rounded-md py-1.5 ${list.layout === l ? "bg-neutral-900 text-white" : ""}`}>
                {l === "raster" ? "Kacheln" : "Liste"}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Wunsch hinzufügen</span>
          <AddWish onAdd={(w) => update({ wishes: [...list.wishes, w] })} />
        </section>

        {list.wishes.length > 0 && (
          <section className="mt-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Meine Wünsche ({list.wishes.length})
            </span>
            <ul className="mt-2 space-y-2">
              {list.wishes.map((w, i) => (
                <li key={w.id} className="rounded-xl border border-neutral-200 p-3">
                  <div className="flex gap-3">
                    {w.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={w.image} alt="" referrerPolicy="no-referrer" className="h-12 w-12 shrink-0 rounded object-contain bg-neutral-50" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-neutral-100">🎁</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <input value={w.title} onChange={(e) => setWish(w.id, { title: e.target.value })}
                        className="w-full truncate rounded px-1 font-medium hover:bg-neutral-50 focus:bg-neutral-50" />
                      <div className="px-1 text-xs text-neutral-500">
                        {formatPrice(w.price, w.currency) ?? "kein Preis"} {w.shop && `· ${w.shop}`}
                      </div>
                    </div>
                  </div>
                  <input value={w.note ?? ""} placeholder="Notiz, z. B. Größe M, in Blau"
                    onChange={(e) => setWish(w.id, { note: e.target.value })}
                    className="mt-2 w-full rounded border border-neutral-200 px-2 py-1 text-sm" />
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex gap-0.5" aria-label="Wie sehr wünschst du es dir?">
                      {([1, 2, 3] as const).map((p) => (
                        <button key={p} onClick={() => setWish(w.id, { priority: p })}
                          className={p <= w.priority ? "text-rose-600" : "text-neutral-300"} title={["Wäre nett", "Schön", "Herzenswunsch"][p - 1]}>
                          ♥
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 text-neutral-500">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 disabled:opacity-30" title="Nach vorne">↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === list.wishes.length - 1} className="px-1.5 disabled:opacity-30" title="Nach hinten">↓</button>
                      <button onClick={() => update({ wishes: list.wishes.filter((x) => x.id !== w.id) })}
                        className="px-1.5 hover:text-red-600" title="Entfernen">✕</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <main className="p-4 sm:p-8 lg:h-screen lg:overflow-y-auto">
        <WishBoard list={list} />
      </main>

      {sharing && <ShareDialog list={list} onClose={() => setSharing(false)} />}
    </div>
  );
}
