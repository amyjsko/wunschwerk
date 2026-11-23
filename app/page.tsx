"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccountBar from "@/components/AccountBar";
import { useSession } from "@/lib/auth";
import { loadLists } from "@/lib/storage";
import { createList, importLocalLists, listLists, removeList } from "@/lib/store";
import { cloudEnabled } from "@/lib/supabase";
import { templateList } from "@/lib/templates";
import { uid } from "@/lib/format";
import type { TemplateId, WishList } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const session = useSession();
  const [lists, setLists] = useState<WishList[]>([]);
  const [localCount, setLocalCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<TemplateId | "alle">("alle");
  const [sort, setSort] = useState<"neu" | "name" | "wuensche">("neu");

  async function refresh() {
    if (session === undefined) return;
    setLists(await listLists(session).catch(() => []));
    setLocalCount(session ? loadLists().length : 0);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function create(template: TemplateId) {
    if (session === undefined || busy) return;
    setBusy(true);
    const t = templateList.find((x) => x.id === template)!;
    const now = Date.now();
    try {
      const list = await createList(session, {
        id: uid(), title: t.defaultTitle, subtitle: "", template, layout: "raster", wishes: [], createdAt: now, updatedAt: now,
      });
      router.push(`/liste/${list.id}`);
    } catch (err) {
      setBusy(false);
      const msg = (err as { message?: string })?.message ?? String(err);
      console.error("createList", err);
      alert(`Der Wunschzettel konnte nicht angelegt werden. Bitte versuch es noch einmal.\n\n(${msg})`);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <AccountBar session={session} />
      <section className="mt-6 text-center sm:mt-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-600">Wunschwerk</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl">Wünsche sammeln, schön gestalten, teilen.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
          Füge Links aus jedem Shop ein. Wir holen Titel, Bild und Preis, und du machst daraus einen Wunschzettel, den
          du mit einem Link verschickst.
        </p>
      </section>

      {cloudEnabled && session === null && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm">
          <Link href="/anmelden" className="font-semibold text-rose-700 underline">Melde dich an</Link>, damit deine
          Wunschzettel auf allen Geräten da sind und Gäste Geschenke reservieren können.
        </div>
      )}

      {session && localCount > 0 && (
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <span>In diesem Browser liegen noch {localCount} {localCount === 1 ? "Wunschzettel" : "Wunschzettel"} ohne Konto.</span>
          <button
            onClick={async () => {
              setBusy(true);
              await importLocalLists(session).catch(() => alert("Das Übernehmen hat nicht ganz geklappt."));
              setBusy(false);
              refresh();
            }}
            disabled={busy}
            className="rounded-full bg-neutral-900 px-4 py-1.5 font-semibold text-white disabled:opacity-50"
          >
            In mein Konto übernehmen
          </button>
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Neuer Wunschzettel</h2>
        <p className="text-neutral-600">Wähle einen Anlass. Die Vorlage kannst du später jederzeit wechseln.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {templateList.map((t) => (
            <button key={t.id} onClick={() => create(t.id)} disabled={busy || session === undefined}
              className="group rounded-2xl border border-neutral-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">Meine Wunschzettel</h2>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm" aria-label="Sortieren">
              <option value="neu">Zuletzt bearbeitet</option>
              <option value="name">Name A–Z</option>
              <option value="wuensche">Meiste Wünsche</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {([["alle", "Alle"], ...templateList.map((t) => [t.id, t.id === "minimal" ? "Sonstiges" : t.name])] as [TemplateId | "alle", string][]).map(
              ([id, name]) => {
                const count = id === "alle" ? lists.length : lists.filter((l) => l.template === id).length;
                if (id !== "alle" && count === 0) return null;
                return (
                  <button key={id} onClick={() => setFilter(id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm ${filter === id ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white hover:bg-neutral-50"}`}>
                    {name} <span className="opacity-60">{count}</span>
                  </button>
                );
              },
            )}
          </div>
          <ul className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
            {lists
              .filter((l) => filter === "alle" || l.template === filter)
              .sort((a, b) =>
                sort === "name" ? a.title.localeCompare(b.title, "de") : sort === "wuensche" ? b.wishes.length - a.wishes.length : b.updatedAt - a.updatedAt,
              )
              .map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 p-4">
                <Link href={`/liste/${l.id}`} className="min-w-0 flex-1 hover:text-rose-600">
                  <div className="truncate font-medium">{l.title}</div>
                  <div className="text-sm text-neutral-500">
                    {l.wishes.length} {l.wishes.length === 1 ? "Wunsch" : "Wünsche"} ·{" "}
                    {l.template === "minimal" ? "Sonstiges" : templateList.find((t) => t.id === l.template)?.name}
                    {l.design && !l.design.off ? " · Scrapbook" : ""}
                  </div>
                </Link>
                <button
                  onClick={async () => {
                    if (!window.confirm(`„${l.title}“ löschen?`)) return;
                    await removeList(l).catch(() => alert("Löschen hat nicht geklappt."));
                    refresh();
                  }}
                  className="text-sm text-neutral-400 hover:text-red-600"
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
          {!session && (
            <p className="mt-2 text-xs text-neutral-400">Ohne Anmeldung werden deine Wunschzettel nur in diesem Browser gespeichert.</p>
          )}
        </section>
      )}
    </main>
  );
}
