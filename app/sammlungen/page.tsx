"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import BookmarkletButton from "@/components/BookmarkletButton";
import { useSession } from "@/lib/auth";
import { createCollection, listCollections, type Collection } from "@/lib/collections";

export default function SammlungenPage() {
  const session = useSession();
  const [cols, setCols] = useState<Collection[] | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session === undefined) return;
    listCollections(session).then(setCols).catch(() => setCols([]));
  }, [session]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (session === undefined || !name.trim()) return;
    setBusy(true);
    try {
      const c = await createCollection(session, name);
      setCols([c, ...(cols ?? [])]);
      setName("");
    } catch {
      alert("Die Sammlung konnte nicht angelegt werden. Bitte versuch es noch einmal.");
    }
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Link href="/" className="text-sm text-neutral-500 hover:text-rose-600">← Übersicht</Link>
      <h1 className="mt-4 font-serif text-4xl">Meine Sammlungen</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Merk dir Pins und Bilder, die dir gefallen, und sortiere sie in eigene Sammlungen. Im Scrapbook kannst du sie
        später mit einem Klick einfügen.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
          <div className="font-semibold">Am Computer</div>
          <p className="mt-1 text-neutral-600">Öffne einen Pin auf Pinterest und klick in der Lesezeichenleiste auf „Wunschwerk merken“. Dann wählst du „Sammlung“.</p>
          <BookmarkletButton />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
          <div className="font-semibold">Am Handy</div>
          <p className="mt-1 text-neutral-600">
            Tipp in der Pinterest-App bei einem Pin auf „Teilen“ und dann auf „Link kopieren“. Füge den Link in einer
            Sammlung oben ins Feld ein.
          </p>
        </div>
      </div>

      <form onSubmit={create} className="mt-8 flex max-w-md gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Neue Sammlung, z. B. Weihnachtsdeko"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm" />
        <button disabled={busy || !name.trim()} className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          Anlegen
        </button>
      </form>

      {cols && cols.length === 0 && <p className="mt-6 text-neutral-500">Noch keine Sammlung. Leg oben deine erste an.</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cols?.map((c) => (
          <Link key={c.id} href={`/sammlungen/${c.id}`} className="group">
            <div className="grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl bg-neutral-100">
              {c.items.slice(0, 3).map((i, n) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i.id} src={i.src} alt="" referrerPolicy="no-referrer" loading="lazy"
                  className={`h-full w-full object-cover ${n === 0 ? "row-span-2" : ""} ${c.items.length === 1 ? "col-span-2" : ""} ${c.items.length === 2 && n === 1 ? "row-span-2" : ""}`} />
              ))}
              {c.items.length === 0 && <div className="col-span-2 row-span-2 flex items-center justify-center text-4xl text-neutral-300">📌</div>}
            </div>
            <div className="mt-2 truncate font-semibold group-hover:text-rose-600">{c.name}</div>
            <div className="text-sm text-neutral-500">{c.items.length} {c.items.length === 1 ? "Pin" : "Pins"}</div>
          </Link>
        ))}
      </div>
      {session === null && cols && cols.length > 0 && (
        <p className="mt-4 text-xs text-neutral-400">Ohne Anmeldung liegen deine Sammlungen nur in diesem Browser.</p>
      )}
    </main>
  );
}
