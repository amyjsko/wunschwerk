"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteList, loadLists, upsertList } from "@/lib/storage";
import { templateList } from "@/lib/templates";
import { uid } from "@/lib/format";
import type { TemplateId, WishList } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [lists, setLists] = useState<WishList[]>([]);

  useEffect(() => setLists(loadLists()), []);

  function create(template: TemplateId) {
    const t = templateList.find((x) => x.id === template)!;
    const now = Date.now();
    const list: WishList = {
      id: uid(),
      title: t.defaultTitle,
      subtitle: "",
      template,
      layout: "raster",
      wishes: [],
      createdAt: now,
      updatedAt: now,
    };
    upsertList(list);
    router.push(`/liste/${list.id}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <section className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-600">Wunschwerk</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl">Wünsche sammeln, schön gestalten, teilen.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
          Füge Links aus jedem Shop ein. Wir holen Titel, Bild und Preis, und du machst daraus einen Wunschzettel, den
          du mit einem Link verschickst.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">Neuer Wunschzettel</h2>
        <p className="text-neutral-600">Wähle einen Anlass. Die Vorlage kannst du später jederzeit wechseln.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {templateList.map((t) => (
            <button
              key={t.id}
              onClick={() => create(t.id)}
              className="group rounded-2xl border border-neutral-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`h-28 rounded-xl border-4 ${t.swatch} flex items-center justify-center text-3xl`}>
                {t.decoration[2] ?? "✎"}
              </div>
              <div className="mt-3 font-semibold">{t.name}</div>
              <div className="text-sm text-neutral-500 group-hover:text-rose-600">Erstellen →</div>
            </button>
          ))}
        </div>
      </section>

      {lists.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold">Meine Wunschzettel</h2>
          <ul className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
            {lists.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 p-4">
                <Link href={`/liste/${l.id}`} className="min-w-0 flex-1 hover:text-rose-600">
                  <div className="truncate font-medium">{l.title}</div>
                  <div className="text-sm text-neutral-500">
                    {l.wishes.length} {l.wishes.length === 1 ? "Wunsch" : "Wünsche"} ·{" "}
                    {templateList.find((t) => t.id === l.template)?.name}
                  </div>
                </Link>
                <button
                  onClick={() => {
                    if (!window.confirm(`„${l.title}“ löschen?`)) return;
                    deleteList(l.id);
                    setLists(loadLists());
                  }}
                  className="text-sm text-neutral-400 hover:text-red-600"
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-400">Im Prototyp werden deine Wunschzettel nur in diesem Browser gespeichert.</p>
        </section>
      )}
    </main>
  );
}
