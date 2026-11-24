"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PinAdd from "@/components/PinAdd";
import { useSession } from "@/lib/auth";
import { addToCollection, getCollection, listCollections, removeCollection, saveCollection, type Collection } from "@/lib/collections";

export default function SammlungPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();
  const [col, setCol] = useState<Collection | null | undefined>(undefined);
  const [others, setOthers] = useState<Collection[]>([]);

  useEffect(() => {
    if (session === undefined) return;
    getCollection(session, id).then((c) => setCol(c ?? null)).catch(() => setCol(null));
    listCollections(session).then((cs) => setOthers(cs.filter((c) => c.id !== id))).catch(() => {});
  }, [session, id]);

  if (col === undefined) return null;
  if (col === null)
    return (
      <main className="py-24 text-center">
        <p>Diese Sammlung gibt es nicht (mehr).</p>
        <Link href="/sammlungen" className="text-rose-600 underline">Zu meinen Sammlungen</Link>
      </main>
    );

  async function update(next: Collection) {
    setCol(next);
    await saveCollection(next).catch(() => alert("Speichern hat nicht geklappt."));
  }

  async function move(itemId: string, targetId: string) {
    if (!col) return;
    const item = col.items.find((i) => i.id === itemId);
    const target = others.find((o) => o.id === targetId);
    if (!item || !target) return;
    try {
      const t = await addToCollection(target, item);
      setOthers(others.map((o) => (o.id === t.id ? t : o)));
      await update({ ...col, items: col.items.filter((i) => i.id !== itemId) });
    } catch {
      alert("Verschieben hat nicht geklappt.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Link href="/sammlungen" className="text-sm text-neutral-500 hover:text-rose-600">← Meine Sammlungen</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <input
          defaultValue={col.name}
          aria-label="Name der Sammlung"
          maxLength={80}
          onBlur={(e) => e.target.value.trim() && e.target.value !== col.name && update({ ...col, name: e.target.value.trim() })}
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 font-serif text-4xl hover:border-neutral-200 focus:border-neutral-300 focus:bg-white"
        />
        <button
          onClick={async () => {
            if (!window.confirm(`Sammlung „${col.name}“ mit ${col.items.length} Pins löschen?`)) return;
            await removeCollection(col).catch(() => alert("Löschen hat nicht geklappt."));
            router.push("/sammlungen");
          }}
          className="text-sm text-neutral-400 hover:text-red-600"
        >
          Sammlung löschen
        </button>
      </div>
      <div className="mt-4 max-w-xl">
        <PinAdd onAdd={async (item) => setCol(await addToCollection(col, item))} />
      </div>

      {col.items.length === 0 && (
        <p className="mt-8 text-neutral-500">Noch leer. Füge oben einen Pin-Link ein oder nutze am Computer den Knopf „Wunschwerk merken“.</p>
      )}
      <div className="mt-6 columns-2 gap-3 sm:columns-3 lg:columns-4">
        {col.items.map((i) => (
          <figure key={i.id} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-neutral-100">
            <a href={i.link || i.src} target="_blank" rel="noopener noreferrer" title={i.title || "Zur Quelle"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.src} alt={i.title || ""} referrerPolicy="no-referrer" loading="lazy" className="block w-full" style={{ aspectRatio: String(i.ratio || 1) }} />
            </a>
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <span className="truncate">{i.credit ? `von ${i.credit}` : ""}</span>
            </figcaption>
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
              {others.length > 0 && (
                <select
                  value=""
                  aria-label="In andere Sammlung verschieben"
                  onChange={(e) => move(i.id, e.target.value)}
                  className="max-w-28 rounded-full bg-white/90 px-2 py-1 text-xs shadow"
                >
                  <option value="">Verschieben…</option>
                  {others.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => update({ ...col, items: col.items.filter((x) => x.id !== i.id) })}
                aria-label="Aus Sammlung entfernen"
                className="rounded-full bg-white/90 px-2 py-1 text-xs shadow hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </figure>
        ))}
      </div>
      <p className="mt-6 text-xs text-neutral-400">Die Bilder bleiben bei Pinterest und den jeweiligen Seiten. Wunschwerk merkt sich nur die Links, für dich privat.</p>
    </main>
  );
}
