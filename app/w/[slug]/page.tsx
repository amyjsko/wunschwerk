"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import WishBoard from "@/components/WishBoard";
import ScrapbookBoard from "@/components/ScrapbookBoard";
import {
  cancelReservation,
  getSharedList,
  myReservations,
  rememberReservation,
  reserveWish,
} from "@/lib/store";
import type { SharedList, Wish } from "@/lib/types";

const NAME_KEY = "wunschwerk:mein-name";

export default function SharedListPage() {
  const { slug } = useParams<{ slug: string }>();
  const [asList, setAsList] = useState(false);
  const [list, setList] = useState<SharedList | null | undefined>(undefined);
  const [mine, setMine] = useState<Record<string, string>>({});
  const [asking, setAsking] = useState<Wish | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const l = await getSharedList(slug);
      setList(l);
      if (l) document.title = `${l.title} · Wunschwerk`;
    } catch {
      setList(null);
    }
    setMine(myReservations(slug));
  }, [slug]);

  useEffect(() => {
    load();
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
  }, [load]);

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!asking || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const token = await reserveWish(slug, asking.id, name.trim());
      rememberReservation(slug, asking.id, token);
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {}
      setAsking(null);
    } catch (err) {
      setError(
        (err as Error).message.includes("Schon reserviert")
          ? "Das hat gerade jemand anderes reserviert."
          : "Das hat nicht geklappt. Bitte versuch es noch einmal.",
      );
    }
    setBusy(false);
    load();
  }

  async function cancel(w: Wish) {
    const token = mine[w.id];
    if (!token || !window.confirm("Reservierung aufheben?")) return;
    await cancelReservation(token).catch(() => {});
    rememberReservation(slug, w.id, null);
    load();
  }

  if (list === undefined) return <main className="py-24 text-center text-neutral-400">Wunschzettel wird geladen…</main>;
  if (list === null)
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">Diesen Wunschzettel gibt es nicht (mehr).</h1>
        <Link href="/" className="mt-6 inline-block text-rose-600 underline">Eigenen Wunschzettel erstellen</Link>
      </main>
    );

  const reserved = Object.fromEntries((list.reservations ?? []).map((r) => [r.wish_id, r.name]));
  const reserveProps = list.is_owner
    ? undefined
    : { reserved, mine: new Set(Object.keys(mine)), onReserve: (w: Wish) => { setError(""); setAsking(w); }, onCancel: cancel };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {list.is_owner ? (
        <div className="no-print mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm">
          Das ist dein eigener Wunschzettel, so sehen ihn deine Gäste. Was schon reserviert ist, siehst du nicht,
          damit es eine Überraschung bleibt. 🤫
        </div>
      ) : (
        <p className="no-print mb-6 text-center text-sm text-neutral-500">
          Klick auf „Ich schenke das“, damit niemand dasselbe Geschenk kauft. Die beschenkte Person sieht das nicht.
        </p>
      )}

      {list.design && !list.design.off && !asList ? (
        <div className="mx-auto max-w-3xl">
          <ScrapbookBoard design={list.design} wishes={list.wishes} reserve={reserveProps} />
          <div className="no-print mt-4 text-center">
            <button onClick={() => setAsList(true)} className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              📋 Wünsche als Liste ansehen
            </button>
          </div>
        </div>
      ) : (
        <WishBoard list={asList ? { ...list, layout: "liste" } : list} reserve={reserveProps} />
      )}

      <div className="no-print mt-8 text-center text-sm text-neutral-500">
        <Link href="/" className="text-rose-600 underline">Eigenen Wunschzettel erstellen</Link>
      </div>

      {asking && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAsking(null)}>
          <form onSubmit={confirm} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">„{asking.title}“ schenken</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Andere Gäste sehen deinen Namen, damit niemand dasselbe kauft. Die beschenkte Person sieht ihn nicht.
            </p>
            <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Dein Name"
              className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setAsking(null)} className="px-3 py-2 text-sm text-neutral-500">Abbrechen</button>
              <button disabled={busy || !name.trim()} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "Moment…" : "Reservieren"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
