"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WishBoard from "@/components/WishBoard";
import AddWish from "@/components/AddWish";
import BookmarkletButton from "@/components/BookmarkletButton";
import ShareDialog from "@/components/ShareDialog";
import ScrapbookBoard from "@/components/ScrapbookBoard";
import ScrapbookTools from "@/components/ScrapbookTools";
import { stickerMap } from "@/components/stickers";
import { createDesign, paperMap, syncDesign } from "@/lib/design";
import { uid } from "@/lib/format";
import { useSession } from "@/lib/auth";
import { getList, saveList } from "@/lib/store";
import { templateList } from "@/lib/templates";
import { formatPrice } from "@/lib/format";
import type { Design, DesignItem, Wish, WishList } from "@/lib/types";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<WishList | null | undefined>(undefined);
  const [sharing, setSharing] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const session = useSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (session === undefined) return;
    getList(session, id).then((l) => setList(l ?? null)).catch(() => setList(null));
  }, [id, session]);

  function persist(next: WishList) {
    if (!next.slug) return void saveList(next);
    // Im Konto speichern wir gesammelt, nicht bei jedem Tastendruck
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveList(next).then(() => setSaveState("saved")).catch(() => setSaveState("error"));
    }, 600);
  }

  function update(patch: Partial<WishList>) {
    setList((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, updatedAt: Date.now() };
      if (patch.wishes && next.design) next.design = syncDesign(next.design, next.wishes.map((w) => w.id));
      persist(next);
      return next;
    });
  }

  function updateDesign(fn: (d: Design) => Design) {
    setList((prev) => {
      if (!prev?.design) return prev;
      const next = { ...prev, design: fn(prev.design), updatedAt: Date.now() };
      persist(next);
      return next;
    });
  }

  const changeItem = (itemId: string, patch: Partial<DesignItem>) =>
    updateDesign((d) => ({ ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }));

  function addItem(item: Omit<DesignItem, "id" | "z" | "x" | "y" | "rot">) {
    const id = uid();
    updateDesign((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          ...item,
          id,
          x: 500 + Math.round((Math.random() - 0.5) * 200),
          y: 380 + Math.round((Math.random() - 0.5) * 160),
          rot: Math.round((Math.random() - 0.5) * 16),
          z: Math.max(0, ...d.items.map((i) => i.z)) + 1,
        },
      ],
    }));
    setSelectedId(id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    updateDesign((d) => ({ ...d, items: d.items.filter((i) => i.id !== selectedId || i.kind === "wish") }));
    setSelectedId(null);
  }

  function layer(dir: "vor" | "zurueck") {
    updateDesign((d) => {
      const zs = d.items.map((i) => i.z);
      const z = dir === "vor" ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
      return { ...d, items: d.items.map((i) => (i.id === selectedId ? { ...i, z } : i)) };
    });
  }

  async function exportImage() {
    if (!pageRef.current) return;
    setSelectedId(null);
    setExporting(true);
    await new Promise((r) => setTimeout(r, 50));
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(pageRef.current, {
        pixelRatio: 1.2,
        cacheBust: true,
        style: { transform: "none", borderRadius: "0" },
        filter: (n) => !(n instanceof HTMLElement && (n.classList.contains("no-print") || n.classList.contains("export-hide"))),
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(list?.title || "wunschzettel").replace(/[^\p{L}\p{N}]+/gu, "-")}.png`;
      a.click();
    } catch {
      alert("Das Bild konnte nicht erstellt werden. Bitte versuch es noch einmal.");
    }
    setExporting(false);
  }

  // Entf-Taste löscht ausgewählte Sticker und Texte
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) deleteSelected();
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (list === undefined) return <main className="py-24 text-center text-neutral-400">Wird geladen…</main>;
  if (list === null)
    return (
      <main className="py-24 text-center">
        <p>Diesen Wunschzettel gibt es hier nicht. Vielleicht bist du nicht angemeldet?</p>
        <Link href="/" className="text-rose-600 underline">Zur Startseite</Link>
      </main>
    );

  const scrap = Boolean(list.design && !list.design.off);
  const selected = scrap ? list.design!.items.find((i) => i.id === selectedId) ?? null : null;

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
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-neutral-500 hover:text-rose-600">← Übersicht</Link>
            {list.slug && (
              <span className={`text-xs ${saveState === "error" ? "text-red-600" : "text-neutral-400"}`}>
                {saveState === "saving" ? "speichert…" : saveState === "error" ? "nicht gespeichert!" : "gespeichert ✓"}
              </span>
            )}
          </div>
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

        <div className="mt-6 flex rounded-xl bg-neutral-100 p-1 text-sm font-semibold">
          <button
            onClick={() => list.design && update({ design: { ...list.design, off: true } })}
            className={`flex-1 rounded-lg py-2 ${!scrap ? "bg-white shadow" : "text-neutral-500"}`}
          >
            Vorlage
          </button>
          <button
            onClick={() => update({ design: list.design ? { ...list.design, off: false } : createDesign(list) })}
            className={`flex-1 rounded-lg py-2 ${scrap ? "bg-white shadow" : "text-neutral-500"}`}
          >
            Scrapbook 📒
          </button>
        </div>

        {scrap && (
          <div className="mt-6">
            <ScrapbookTools
              design={list.design!}
              selected={selected}
              onPaper={(paper) =>
                updateDesign((d) => {
                  // Texte in Standardfarben passen sich hellem oder dunklem Papier an
                  const dark = paperMap[paper]?.dark;
                  const swap: Record<string, string> = dark
                    ? { "#3b2f2a": "#f3d27a", "#7a6a5e": "#e8dcc4" }
                    : { "#f3d27a": "#3b2f2a", "#e8dcc4": "#7a6a5e", "#ffffff": "#3b2f2a" };
                  return {
                    ...d,
                    paper,
                    items: d.items.map((i) => (i.kind === "text" && i.color && swap[i.color] ? { ...i, color: swap[i.color] } : i)),
                  };
                })
              }
              onAddSticker={(sid) => {
                const def = stickerMap[sid];
                addItem({ kind: "sticker", sticker: sid, w: def?.w ?? 100, ...(def?.washi ? { h: def.h } : {}) });
              }}
              onAddText={() => addItem({ kind: "text", text: "Dein Text", font: "hand", w: 280 })}
              onChangeSelected={(patch) => selectedId && changeItem(selectedId, patch)}
              onLayer={layer}
              onDeleteSelected={deleteSelected}
              onExport={exportImage}
              exporting={exporting}
            />
          </div>
        )}

        <section className={`mt-6 ${scrap ? "hidden" : ""}`}>
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Vorlage</span>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
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
          <BookmarkletButton />
        </section>

        {list.wishes.length > 0 && (
          <section className="mt-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Meine Wünsche ({list.wishes.length})
              {list.wishes.some((w) => w.hidden) && ` · ${list.wishes.filter((w) => w.hidden).length} ausgeblendet`}
            </span>
            <ul className="mt-2 space-y-2">
              {list.wishes.map((w, i) => (
                <li key={w.id} className={`rounded-xl border p-3 ${w.hidden ? "border-dashed border-neutral-300 bg-neutral-50 opacity-70" : "border-neutral-200"}`}>
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
                    <div className="flex items-center gap-1 text-neutral-500">
                      <button onClick={() => setWish(w.id, { hidden: !w.hidden })}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${w.hidden ? "bg-neutral-200 text-neutral-700" : "hover:bg-neutral-100"}`}
                        title={w.hidden ? "Wieder für Gäste einblenden" : "Für Gäste ausblenden"} aria-pressed={!!w.hidden}>
                        {w.hidden ? <EyeOff /> : <Eye />}
                        {w.hidden && <span className="text-xs">ausgeblendet</span>}
                      </button>
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
        {scrap ? (
          <div className="mx-auto max-w-3xl">
            <ScrapbookBoard
              design={list.design!}
              wishes={list.wishes}
              dimmed={new Set(list.wishes.filter((w) => w.hidden).map((w) => w.id))}
              editable
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChangeItem={changeItem}
              pageRef={pageRef}
            />
          </div>
        ) : (
          <WishBoard list={{ ...list, wishes: list.wishes.filter((w) => !w.hidden) }} />
        )}
      </main>

      {sharing && <ShareDialog list={list} onClose={() => setSharing(false)} />}
    </div>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
