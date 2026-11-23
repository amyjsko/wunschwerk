"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { decodeCaptured, type Captured } from "@/lib/bookmarklet";
import { parsePrice } from "@/lib/extract";
import { useSession } from "@/lib/auth";
import { createList, listLists, saveList } from "@/lib/store";
import { templates } from "@/lib/templates";
import { uid } from "@/lib/format";
import type { WishList } from "@/lib/types";

export default function MerkenPage() {
  const router = useRouter();
  const [item, setItem] = useState<Captured | null | undefined>(undefined);
  const [lists, setLists] = useState<WishList[]>([]);
  const [target, setTarget] = useState("neu");
  const [busy, setBusy] = useState(false);
  const session = useSession();

  useEffect(() => {
    const c = decodeCaptured(window.location.hash);
    setItem(c ? { ...c, price: c.price ? String(parsePrice(c.price) ?? "").replace(".", ",") : "" } : null);
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    listLists(session)
      .then((ls) => {
        setLists(ls);
        if (ls[0]) setTarget(ls[0].id);
      })
      .catch(() => {});
  }, [session]);

  if (item === undefined || session === undefined) return null;
  if (item === null)
    return (
      <main className="py-24 text-center">
        <p>Hier ist nichts angekommen. Klick auf einer Produktseite auf „Wunschwerk merken“.</p>
        <Link href="/" className="text-rose-600 underline">Zur Startseite</Link>
      </main>
    );

  async function save() {
    if (!item?.title?.trim() || session === undefined) return;
    setBusy(true);
    try {
    const now = Date.now();
    const list: WishList =
      lists.find((l) => l.id === target) ??
      (await createList(session, {
        id: uid(),
        title: templates.weihnachten.defaultTitle,
        subtitle: "",
        template: "weihnachten",
        layout: "raster",
        wishes: [],
        createdAt: now,
        updatedAt: now,
      }));
    await saveList({
      ...list,
      updatedAt: now,
      wishes: [
        ...list.wishes,
        {
          id: uid(),
          url: item.url,
          title: item.title.trim(),
          image: item.image || undefined,
          price: parsePrice(item.price),
          currency: item.currency?.length === 3 ? item.currency.toUpperCase() : "EUR",
          shop: item.shop,
          priority: 2,
        },
      ],
    });
    router.push(`/liste/${list.id}`);
    } catch {
      setBusy(false);
      alert("Das Merken hat nicht geklappt. Bitte versuch es noch einmal.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl">Wunsch merken</h1>
      <div className="mt-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex gap-3">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" referrerPolicy="no-referrer" className="h-20 w-20 shrink-0 rounded bg-neutral-50 object-contain" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-neutral-100 text-3xl">🎁</div>
          )}
          <textarea value={item.title ?? ""} rows={3} onChange={(e) => setItem({ ...item, title: e.target.value })}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm" />
        </div>
        <div className="flex gap-2 text-sm">
          <input value={item.price ?? ""} placeholder="Preis" onChange={(e) => setItem({ ...item, price: e.target.value })}
            className="w-1/3 rounded border border-neutral-300 px-2 py-1" />
          <span className="self-center text-neutral-500">{item.shop}</span>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Auf welchen Wunschzettel?</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
            <option value="neu">+ Neuer Wunschzettel</option>
          </select>
        </label>
        <button onClick={save} disabled={busy || !item.title?.trim()}
          className="w-full rounded-full bg-rose-600 py-2 font-semibold text-white disabled:opacity-40">
          {busy ? "Wird gemerkt…" : "Merken"}
        </button>
      </div>
    </main>
  );
}
