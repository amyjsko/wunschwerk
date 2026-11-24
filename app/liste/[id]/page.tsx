"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WishBoard from "@/components/WishBoard";
import AddWish from "@/components/AddWish";
import BookmarkletButton from "@/components/BookmarkletButton";
import ShareDialog from "@/components/ShareDialog";
import ScrapbookBoard from "@/components/ScrapbookBoard";
import ScrapbookTools, { DRAG_TYPE, type DragData } from "@/components/ScrapbookTools";
import { isTape, stickerMap } from "@/components/stickers";
import { createDesign, paperMap, syncDesign, WISH_W } from "@/lib/design";
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
  const [tab, setTab] = useState<"wuensche" | "papier" | "deko" | "extras" | "vorlage">("wuensche");
  const [openWish, setOpenWish] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState(false);
  const [sheet, setSheet] = useState(false);
  // Rückgängig: frühere Stände merken (eine Ziehbewegung oder ein Tippschwall = ein Schritt)
  const listRef = useRef(list);
  listRef.current = list;
  const past = useRef<WishList[]>([]);
  const future = useRef<WishList[]>([]);
  const lastSnap = useRef({ at: 0, key: "" });
  const [, setHist] = useState(0);

  useEffect(() => {
    if (session === undefined) return;
    getList(session, id)
      .then((l) =>
        // Wünsche, die von außen dazukamen (z. B. über „Merken“), gleich aufs Papier legen
        setList(l ? (l.design ? { ...l, design: syncDesign(l.design, l.wishes.map((w) => w.id)) } : l) : null),
      )
      .catch(() => setList(null));
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

  /** key: gleichartige Änderungen kurz hintereinander (Ziehen, Tippen) zählen als ein Schritt */
  function snapshot(key?: string) {
    const cur = listRef.current;
    const now = Date.now();
    const same = key && key === lastSnap.current.key && now - lastSnap.current.at < 1000;
    if (cur && !same) {
      past.current.push(cur);
      if (past.current.length > 60) past.current.shift();
      future.current = [];
      setHist((h) => h + 1);
    }
    lastSnap.current = { at: now, key: key ?? "" };
  }

  function undo(redo = false) {
    const from = redo ? future : past;
    const to = redo ? past : future;
    const cur = listRef.current;
    const target = from.current.pop();
    if (!cur || !target) return;
    to.current.push(cur);
    lastSnap.current = { at: 0, key: "" };
    const next = { ...target, updatedAt: Date.now() };
    setList(next);
    persist(next);
    setSelectedId((sid) => (next.design?.items.some((i) => i.id === sid) ? sid : null));
    setHist((h) => h + 1);
  }

  function update(patch: Partial<WishList>, key?: string) {
    snapshot(key);
    setList((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, updatedAt: Date.now() };
      if (patch.wishes && next.design) next.design = syncDesign(next.design, next.wishes.map((w) => w.id));
      persist(next);
      return next;
    });
  }

  function updateDesign(fn: (d: Design) => Design, key?: string) {
    snapshot(key);
    setList((prev) => {
      if (!prev?.design) return prev;
      const next = { ...prev, design: fn(prev.design), updatedAt: Date.now() };
      persist(next);
      return next;
    });
  }

  const changeItem = (itemId: string, patch: Partial<DesignItem>) =>
    updateDesign((d) => ({ ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }), `item:${itemId}:${Object.keys(patch).sort().join()}`);

  function addItem(item: Omit<DesignItem, "id" | "z" | "x" | "y" | "rot">, at?: { x: number; y: number }) {
    const id = uid();
    updateDesign((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          ...item,
          id,
          x: at ? at.x : 500 + Math.round((Math.random() - 0.5) * 200),
          y: at ? at.y : 380 + Math.round((Math.random() - 0.5) * 160),
          rot: Math.round((Math.random() - 0.5) * 16),
          z: Math.max(0, ...d.items.map((i) => i.z)) + 1,
        },
      ],
    }));
    setSelectedId(id);
    setSheet(false);
  }

  function addSticker(sid: string, at?: { x: number; y: number }) {
    const def = stickerMap[sid];
    if (!def) return;
    addItem({ kind: "sticker", sticker: sid, w: def.w ?? 100, ...(isTape(def) ? { h: def.h } : {}), ...(def.label ? { text: def.label.text } : {}) }, at);
  }

  /** Legt einen Wunsch an die Stelle (oder holt ihn nach oben in die Mitte) */
  function placeWish(wishId: string, at?: { x: number; y: number }) {
    const pos = at ?? { x: 500, y: 450 };
    const found = list?.design?.items.find((i) => i.kind === "wish" && i.wishId === wishId);
    const itemId = found?.id ?? uid();
    updateDesign((d) => {
      const z = Math.max(0, ...d.items.map((i) => i.z)) + 1;
      return d.items.some((i) => i.id === itemId)
        ? { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, ...pos, z } : i)) }
        : { ...d, items: [...d.items, { id: itemId, kind: "wish", wishId, ...pos, w: WISH_W, rot: Math.round((Math.random() - 0.5) * 8), z }] };
    });
    setSelectedId(itemId);
    setSheet(false);
  }

  function onDrop(e: React.DragEvent) {
    setDropHint(false);
    const raw = e.dataTransfer.getData(DRAG_TYPE);
    if (!raw || !pageRef.current) return;
    e.preventDefault();
    const rect = pageRef.current.getBoundingClientRect();
    const scale = rect.width / 1000;
    const at = { x: Math.round((e.clientX - rect.left) / scale), y: Math.round((e.clientY - rect.top) / scale) };
    if (at.x < 0 || at.x > 1000 || at.y < 0) return;
    try {
      const d = JSON.parse(raw) as DragData;
      if (d.type === "sticker") addSticker(d.id, at);
      else placeWish(d.id, at);
    } catch {}
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
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        return undo(e.shiftKey);
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        return undo(true);
      }
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
    update({ wishes: list.wishes.map((w) => (w.id === wid ? { ...w, ...patch } : w)) }, `wish:${wid}:${Object.keys(patch).join()}`);
  const move = (i: number, dir: -1 | 1) => {
    const ws = [...list.wishes];
    const j = i + dir;
    if (j < 0 || j >= ws.length) return;
    [ws[i], ws[j]] = [ws[j], ws[i]];
    update({ wishes: ws });
  };

  const tabs: { id: typeof tab; name: string; icon: string }[] = scrap
    ? [
        { id: "wuensche", name: "Wünsche", icon: "🎁" },
        { id: "papier", name: "Papier", icon: "📄" },
        { id: "deko", name: "Deko", icon: "✨" },
        { id: "extras", name: "Bild & Text", icon: "🖼️" },
      ]
    : [
        { id: "wuensche", name: "Wünsche", icon: "🎁" },
        { id: "vorlage", name: "Vorlage", icon: "🎨" },
      ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "wuensche";
  const label = "text-xs font-semibold uppercase tracking-wide text-neutral-500";

  const tools = (show: "auswahl" | "papier" | "deko" | "extras") => (
    <ScrapbookTools
      show={show}
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
      onAddSticker={(sid) => addSticker(sid)}
      local={!list.slug}
      startOccasion={list.template === "weihnachten" || list.template === "geburtstag" || list.template === "hochzeit" ? list.template : "alle"}
      onAddImage={(img) => {
        // Browser-Speicher und Datenbankzeile klein halten
        const used = list.design!.items.reduce((n, i) => n + (i.src?.length ?? 0), 0);
        const stored = list.slug ? 0 : JSON.stringify(localStorage).length;
        const size = img.src?.length ?? 0;
        if (used + size > 2_000_000 || stored + size > 4_000_000)
          return "Für weitere eigene Bilder ist kein Platz mehr. Entferne bitte erst ein anderes Bild.";
        const ratio = img.ratio || 1;
        addItem({ kind: "image", ...img, w: Math.round(ratio >= 1 ? 280 : 280 * Math.max(0.4, ratio)) });
        return null;
      }}
      onAddText={() => addItem({ kind: "text", text: "Dein Text", font: "hand", w: 280 })}
      onChangeSelected={(patch) => selectedId && changeItem(selectedId, patch)}
      onLayer={layer}
      onDeleteSelected={deleteSelected}
      onExport={exportImage}
      exporting={exporting}
    />
  );

  const undoButtons = (
    <div className="flex items-center gap-0.5">
      <button onClick={() => undo()} disabled={!past.current.length} title="Rückgängig (Strg + Z)" aria-label="Rückgängig"
        className="rounded-full px-2 py-1 text-lg leading-none text-neutral-600 hover:bg-neutral-100 disabled:opacity-25">↶</button>
      <button onClick={() => undo(true)} disabled={!future.current.length} title="Wiederholen (Strg + Umschalt + Z)" aria-label="Wiederholen"
        className="rounded-full px-2 py-1 text-lg leading-none text-neutral-600 hover:bg-neutral-100 disabled:opacity-25">↷</button>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-neutral-200 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
        <Link href="/" className="text-sm text-neutral-500">← Übersicht</Link>
        {undoButtons}
        <button onClick={() => setSharing(true)} className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white">Teilen</button>
      </header>

      <aside className={`no-print border-neutral-200 bg-white ${sheet ? "fixed inset-x-0 bottom-16 z-40 max-h-[62vh] overflow-y-auto rounded-t-2xl border-t shadow-[0_-8px_30px_rgba(0,0,0,.15)]" : "hidden"} lg:static lg:block lg:h-screen lg:max-h-none lg:overflow-y-auto lg:rounded-none lg:border-r lg:border-t-0 lg:shadow-none`}>
        <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 px-5 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between lg:hidden">
            <b className="text-sm">{tabs.find((t) => t.id === activeTab)?.name}</b>
            <button onClick={() => setSheet(false)} className="rounded-full px-2 py-1 text-neutral-500" aria-label="Schließen">✕</button>
          </div>
          <div className="hidden items-center justify-between gap-2 lg:flex">
            <div className="min-w-0">
              <Link href="/" className="text-sm text-neutral-500 hover:text-rose-600">← Übersicht</Link>
              {list.slug && (
                <div className={`text-xs ${saveState === "error" ? "text-red-600" : "text-neutral-400"}`}>
                  {saveState === "saving" ? "speichert…" : saveState === "error" ? "nicht gespeichert!" : "gespeichert ✓"}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {undoButtons}
              <button onClick={() => window.print()} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">
                Drucken
              </button>
              <button onClick={() => setSharing(true)} className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">
                Teilen
              </button>
            </div>
          </div>

          <div className="mt-3 flex rounded-xl bg-neutral-100 p-1 text-sm font-semibold">
            <button
              onClick={() => list.design && update({ design: { ...list.design, off: true } })}
              className={`flex-1 rounded-lg py-1.5 ${!scrap ? "bg-white shadow" : "text-neutral-500"}`}
            >
              Vorlage
            </button>
            <button
              onClick={() => update({ design: list.design ? { ...list.design, off: false } : createDesign(list) })}
              className={`flex-1 rounded-lg py-1.5 ${scrap ? "bg-white shadow" : "text-neutral-500"}`}
            >
              Scrapbook 📒
            </button>
          </div>

          <nav className="mt-3 hidden gap-1 text-xs font-semibold lg:grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={(e) => { setTab(t.id); e.currentTarget.closest("aside")?.scrollTo({ top: 0 }); }} aria-pressed={activeTab === t.id}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 ${activeTab === t.id ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200" : "text-neutral-500 hover:bg-neutral-50"}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                {t.name}
              </button>
            ))}
          </nav>

          {scrap && selected && <div className="mt-3 hidden lg:block">{tools("auswahl")}</div>}
        </div>

        <div className="p-5">
          {scrap && (
            <>
              <div className={activeTab === "papier" ? "" : "hidden"}>{tools("papier")}</div>
              <div className={activeTab === "deko" ? "" : "hidden"}>{tools("deko")}</div>
              <div className={activeTab === "extras" ? "" : "hidden"}>{tools("extras")}</div>
            </>
          )}

          {activeTab === "vorlage" && (
            <section>
              <div className="grid grid-cols-5 gap-1.5">
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
          )}

          {activeTab === "wuensche" && (
            <>
              <section className="space-y-3">
                <label className="block">
                  <span className={label}>Titel</span>
                  <input value={list.title} onChange={(e) => update({ title: e.target.value }, "title")}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
                </label>
                <label className="block">
                  <span className={label}>Untertitel</span>
                  <input value={list.subtitle} placeholder="z. B. Von Lena, Weihnachten 2026"
                    onChange={(e) => update({ subtitle: e.target.value }, "subtitle")}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
                </label>
              </section>

              <section className="mt-6">
                <span className={label}>Wunsch hinzufügen</span>
                <AddWish onAdd={(w) => update({ wishes: [...list.wishes, w] })} />
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-neutral-500 hover:text-rose-600">♥ Merken-Knopf für Shops und Pinterest</summary>
                  <BookmarkletButton />
                </details>
              </section>

              {list.wishes.length > 0 && (
                <section className="mt-6">
                  <span className={label}>
                    Meine Wünsche ({list.wishes.length})
                    {list.wishes.some((w) => w.hidden) && ` · ${list.wishes.filter((w) => w.hidden).length} ausgeblendet`}
                  </span>
                  {scrap && <p className="mt-1 text-xs text-neutral-500">Zieh einen Wunsch aufs Papier, um ihn dort hinzulegen.</p>}
                  <ul className="mt-2 space-y-1.5">
                    {list.wishes.map((w, i) => {
                      const open = openWish === w.id;
                      return (
                        <li
                          key={w.id}
                          draggable={scrap}
                          onDragStart={(e) => {
                            e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ type: "wish", id: w.id } satisfies DragData));
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          className={`rounded-xl border ${w.hidden ? "border-dashed border-neutral-300 bg-neutral-50 opacity-70" : "border-neutral-200 bg-white"} ${scrap ? "cursor-grab active:cursor-grabbing" : ""}`}
                        >
                          <div className="flex items-center gap-2 p-2">
                            {scrap && <span className="select-none text-neutral-300" aria-hidden>⠿</span>}
                            {w.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={w.image} alt="" referrerPolicy="no-referrer" draggable={false} className="h-10 w-10 shrink-0 rounded bg-neutral-50 object-contain" />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-neutral-100">🎁</div>
                            )}
                            <button onClick={() => setOpenWish(open ? null : w.id)} className="min-w-0 flex-1 text-left">
                              <div className="truncate text-sm font-medium">{w.title || "Ohne Titel"}</div>
                              <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <span className="text-rose-600">{"♥".repeat(w.priority)}</span>
                                <span className="truncate">{formatPrice(w.price, w.currency) ?? "kein Preis"}</span>
                              </div>
                            </button>
                            {scrap && (
                              <button onClick={() => placeWish(w.id)} className="rounded-full px-1.5 py-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600" title="Auf dem Papier nach vorne holen">
                                📍
                              </button>
                            )}
                            <button onClick={() => setWish(w.id, { hidden: !w.hidden })}
                              className={`rounded-full px-1.5 py-1 ${w.hidden ? "bg-neutral-200 text-neutral-700" : "text-neutral-400 hover:bg-neutral-100"}`}
                              title={w.hidden ? "Wieder für Gäste einblenden" : "Für Gäste ausblenden"} aria-pressed={!!w.hidden}>
                              {w.hidden ? <EyeOff /> : <Eye />}
                            </button>
                            <button onClick={() => setOpenWish(open ? null : w.id)} className="px-1 text-neutral-400 hover:text-neutral-700" aria-expanded={open} title="Bearbeiten">
                              {open ? "▴" : "▾"}
                            </button>
                          </div>
                          {open && (
                            <div className="border-t border-neutral-100 p-2 pt-2">
                              <input value={w.title} onChange={(e) => setWish(w.id, { title: e.target.value })} aria-label="Titel"
                                className="w-full rounded border border-neutral-200 px-2 py-1 text-sm font-medium" />
                              <input value={w.note ?? ""} placeholder="Notiz, z. B. Größe M, in Blau"
                                onChange={(e) => setWish(w.id, { note: e.target.value })}
                                className="mt-2 w-full rounded border border-neutral-200 px-2 py-1 text-sm" />
                              <div className="mt-2 flex items-center justify-between text-sm">
                                <div className="flex gap-0.5" aria-label="Wie sehr wünschst du es dir?">
                                  {([1, 2, 3] as const).map((p) => (
                                    <button key={p} onClick={() => setWish(w.id, { priority: p })}
                                      className={`text-lg ${p <= w.priority ? "text-rose-600" : "text-neutral-300"}`} title={["Wäre nett", "Schön", "Herzenswunsch"][p - 1]}>
                                      ♥
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 text-neutral-500">
                                  <button onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 disabled:opacity-30" title="Nach vorne">↑</button>
                                  <button onClick={() => move(i, 1)} disabled={i === list.wishes.length - 1} className="px-1.5 disabled:opacity-30" title="Nach hinten">↓</button>
                                  <button onClick={() => window.confirm(`„${w.title}“ löschen?`) && update({ wishes: list.wishes.filter((x) => x.id !== w.id) })}
                                    className="px-1.5 hover:text-red-600" title="Löschen">✕ löschen</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </aside>

      {scrap && selected && !sheet && (
        <div className="no-print fixed inset-x-2 bottom-[4.5rem] z-30 max-h-[45vh] overflow-y-auto rounded-xl bg-white shadow-xl lg:hidden">{tools("auswahl")}</div>
      )}

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid h-16 border-t border-neutral-200 bg-white lg:hidden" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((t) => (
          <button key={t.id}
            onClick={() => {
              if (sheet && activeTab === t.id) return setSheet(false);
              setTab(t.id);
              setSheet(true);
            }}
            aria-pressed={sheet && activeTab === t.id}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${sheet && activeTab === t.id ? "text-rose-700" : "text-neutral-500"}`}>
            <span className="text-xl leading-none">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </nav>

      <main className="p-4 pb-24 sm:p-8 sm:pb-24 lg:h-screen lg:overflow-y-auto lg:pb-8">
        {scrap ? (
          <div
            className={`relative mx-auto max-w-3xl rounded-2xl transition ${dropHint ? "ring-4 ring-rose-300 ring-offset-4" : ""}`}
            onDragOver={(e) => {
              if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === "move" ? "move" : "copy";
              if (!dropHint) setDropHint(true);
            }}
            onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDropHint(false)}
            onDrop={onDrop}
          >
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
