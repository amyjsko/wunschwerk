"use client";
import { useState } from "react";
import ImageInsert from "./ImageInsert";
import { fonts, papers, textColors } from "@/lib/design";
import type { Design, DesignItem, FontId, PaperId } from "@/lib/types";
import { farbFilter, farbenVon, isTape, stickerColors, stickerMap, stickers, type Farbe, type Occasion, type StickerDef } from "./stickers";

const occasions: { id: Occasion | "alle"; name: string }[] = [
  { id: "alle", name: "Alle" },
  { id: "weihnachten", name: "Weihnachten" },
  { id: "geburtstag", name: "Geburtstag" },
  { id: "hochzeit", name: "Hochzeit" },
  { id: "alltag", name: "Alltag" },
];

const groups: { id: StickerDef["group"]; name: string }[] = [
  { id: "tape", name: "Washi-Tape" },
  { id: "border", name: "Borders & Bänder" },
  { id: "deko", name: "Deko" },
  { id: "doodle", name: "Doodles" },
  { id: "zettel", name: "Anhänger & Zettel" },
];

/** Datentyp beim Ziehen aufs Papier */
export const DRAG_TYPE = "application/x-wunschwerk";
export type DragData = { type: "sticker" | "wish"; id: string };

interface Props {
  /** Welcher Teil der Werkzeuge angezeigt wird */
  show: "auswahl" | "papier" | "deko" | "extras";
  design: Design;
  selected: DesignItem | null;
  onPaper: (p: PaperId) => void;
  onAddSticker: (id: string) => void;
  onAddText: () => void;
  onAddImage: (img: Pick<DesignItem, "src" | "ratio" | "frame" | "link" | "credit">) => string | null;
  local: boolean;
  startOccasion: Occasion | "alle";
  onChangeSelected: (patch: Partial<DesignItem>) => void;
  onLayer: (dir: "vor" | "zurueck") => void;
  onDeleteSelected: () => void;
  onExport: () => void;
  exporting: boolean;
}

const label = "text-xs font-semibold uppercase tracking-wide text-neutral-500";

export default function ScrapbookTools(p: Props) {
  const sel = p.selected;
  const washi = sel?.kind === "sticker" ? stickerMap[sel.sticker ?? ""] : undefined;
  const isWashi = isTape(washi);
  const label_ = washi?.label;
  const [occasion, setOccasion] = useState(p.startOccasion);
  const [inserting, setInserting] = useState(false);
  const [farbe, setFarbe] = useState<Farbe | null>(null);
  const [gruppe, setGruppe] = useState<StickerDef["group"] | "alle">("alle");
  const shown = stickers.filter(
    (s) => (occasion === "alle" || s.occasions?.includes(occasion)) && (!farbe || farbenVon(s).includes(farbe)),
  );
  return (
    <div className="space-y-6">
      {p.show === "auswahl" && sel && (
        <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
          <div className="flex items-center justify-between">
            <span className={label}>
              {sel.kind === "wish" ? "Wunsch" : sel.kind === "text" ? "Text" : sel.kind === "image" ? "Bild" : "Sticker"} ausgewählt
            </span>
            <div className="flex gap-1 text-sm">
              <button onClick={() => p.onLayer("vor")} className="rounded border border-neutral-300 bg-white px-2 py-0.5" title="Nach vorne holen">⬆ vorne</button>
              <button onClick={() => p.onLayer("zurueck")} className="rounded border border-neutral-300 bg-white px-2 py-0.5" title="Nach hinten schieben">⬇ hinten</button>
              {sel.kind !== "wish" && (
                <button onClick={p.onDeleteSelected} className="rounded border border-neutral-300 bg-white px-2 py-0.5 hover:text-red-600" title="Entfernen">✕</button>
              )}
            </div>
          </div>
          {(sel.kind === "text" || label_) && (
            <>
              <textarea
                aria-label="Text"
                value={sel.text ?? label_?.text ?? ""}
                rows={2}
                onChange={(e) => p.onChangeSelected({ text: e.target.value })}
                className="mt-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => p.onChangeSelected({ font: f.id as FontId })}
                    className={`rounded-full px-2.5 py-1 text-sm ${sel.font === f.id ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white"}`}
                    style={{ fontFamily: f.family }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {isWashi && (
            <div className="mt-2 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <span className="w-14 text-neutral-600">Länge</span>
                <input type="range" min={60} max={1000} value={sel.w} onChange={(e) => p.onChangeSelected({ w: Number(e.target.value) })} className="flex-1 accent-rose-600" />
              </label>
              <label className="flex items-center gap-2">
                <span className="w-14 text-neutral-600">Dicke</span>
                <input type="range" min={20} max={90} value={sel.h ?? washi?.h ?? 42} onChange={(e) => p.onChangeSelected({ h: Number(e.target.value) })} className="flex-1 accent-rose-600" />
              </label>
            </div>
          )}
          {sel.kind === "image" && !sel.credit && (
            <div className="mt-2 flex flex-wrap gap-1 text-sm">
              {(["ohne", "sticker", "polaroid"] as const).map((f) => (
                <button key={f} onClick={() => p.onChangeSelected({ frame: f })} className={`rounded-full px-2.5 py-1 ${(sel.frame ?? "ohne") === f ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white"}`}>
                  {f === "ohne" ? "Ohne Rahmen" : f === "sticker" ? "Sticker-Rand" : "Polaroid"}
                </button>
              ))}
            </div>
          )}
          {sel.kind !== "wish" && sel.kind !== "image" && !isWashi && !washi?.fixedColor && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(sel.kind === "text" ? textColors : stickerColors).map((c) => (
                <button
                  key={c}
                  onClick={() => p.onChangeSelected({ color: c })}
                  className={`h-6 w-6 rounded-full border ${sel.color === c ? "ring-2 ring-rose-600 ring-offset-1" : "border-neutral-300"}`}
                  style={{ background: c }}
                  aria-label={`Farbe ${c}`}
                />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-neutral-500">
            Ziehen zum Verschieben. Mit dem roten Griff drehst du und änderst die {isWashi ? "Länge" : "Größe"}.
            {sel.kind === "wish" && " Wünsche bearbeitest oder löschst du unter „Wünsche“."}
          </p>
        </section>
      )}

      {p.show === "papier" && <section>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {papers.map((pa) => (
            <button
              key={pa.id}
              onClick={() => p.onPaper(pa.id)}
              className={`rounded-lg p-1 text-xs ${p.design.paper === pa.id ? "ring-2 ring-rose-600" : "ring-1 ring-neutral-200"}`}
            >
              <div className="h-10 rounded-md" style={pa.style} />
              <div className="mt-1 truncate">{pa.name}</div>
            </button>
          ))}
        </div>
      </section>}

      {p.show === "deko" && <section>
        <div className="flex flex-wrap gap-1">
          {occasions.map((o) => (
            <button key={o.id} onClick={() => setOccasion(o.id)} aria-pressed={occasion === o.id} className={`rounded-full px-2.5 py-1 text-xs ${occasion === o.id ? "bg-neutral-900 text-white" : "bg-neutral-100 hover:bg-neutral-200"}`}>
              {o.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-500">Farbe:</span>
          {farbFilter.map((f) => (
            <button
              key={f.id}
              title={f.name}
              aria-label={f.name}
              aria-pressed={farbe === f.id}
              onClick={() => setFarbe(farbe === f.id ? null : f.id)}
              className={`h-6 w-6 rounded-full border border-neutral-300 ${farbe === f.id ? "ring-2 ring-rose-600 ring-offset-1" : ""}`}
              style={{ background: f.swatch }}
            />
          ))}
          {farbe && (
            <button onClick={() => setFarbe(null)} className="text-xs underline">
              alle Farben
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto border-b border-neutral-200 pb-2 text-sm">
          {([{ id: "alle", name: "Alles" }, ...groups] as { id: StickerDef["group"] | "alle"; name: string }[]).map((g) => (
            <button key={g.id} onClick={() => setGruppe(g.id)} aria-pressed={gruppe === g.id}
              className={`shrink-0 rounded-lg px-2.5 py-1 ${gruppe === g.id ? "bg-rose-100 font-semibold text-rose-800" : "text-neutral-600 hover:bg-neutral-100"}`}>
              {g.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">Klicken oder aufs Papier ziehen.</p>
        {shown.length === 0 && <p className="mt-3 text-xs text-neutral-500">Keine Sticker in dieser Kombination.</p>}
        {groups.filter((g) => (gruppe === "alle" || gruppe === g.id) && shown.some((s) => s.group === g.id)).map((g) => (
          <div key={g.id} className="mt-3">
            {gruppe === "alle" && <div className="text-xs text-neutral-500">{g.name}</div>}
            <div className={`mt-1 grid gap-1.5 ${g.id === "tape" || g.id === "border" ? "grid-cols-2" : g.id === "zettel" ? "grid-cols-4" : "grid-cols-6"}`}>
              {shown
                .filter((s) => s.group === g.id)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => p.onAddSticker(s.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ type: "sticker", id: s.id } satisfies DragData));
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    title={s.name}
                    className={`flex items-center justify-center rounded-lg bg-neutral-50 p-1.5 hover:bg-rose-50 ${isTape(s) || s.group === "border" ? "h-12" : "aspect-square"}`}
                  >
                    <div
                      style={
                        isTape(s)
                          ? { pointerEvents: "none", width: "100%", height: 24 }
                          : { pointerEvents: "none", width: s.ratio >= 1 ? "100%" : `${s.ratio * 100}%`, aspectRatio: String(s.ratio) }
                      }
                    >
                      {s.draw(s.color)}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </section>}

      {p.show === "extras" && (
        <section className="space-y-3">
          <button onClick={() => setInserting(true)} className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-rose-300 hover:bg-rose-50/50">
            <span className="text-2xl">🖼️</span>
            <span><b className="block text-sm">Bild oder Pin einfügen</b><span className="text-xs text-neutral-500">Eigenes Foto, Bild-Link oder aus deinen Sammlungen, auch als Sticker</span></span>
          </button>
          <button onClick={p.onAddText} className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-rose-300 hover:bg-rose-50/50">
            <span className="text-2xl" style={{ fontFamily: "var(--font-hand), cursive" }}>Aa</span>
            <span><b className="block text-sm">Text hinzufügen</b><span className="text-xs text-neutral-500">Schrift und Farbe wählst du, wenn der Text ausgewählt ist</span></span>
          </button>
          <button onClick={p.onExport} disabled={p.exporting} className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-rose-300 hover:bg-rose-50/50 disabled:opacity-50">
            <span className="text-2xl">📷</span>
            <span><b className="block text-sm">{p.exporting ? "Bild wird erstellt…" : "Als Bild speichern"}</b><span className="text-xs text-neutral-500">Die ganze Seite als PNG, z. B. für WhatsApp oder Instagram</span></span>
          </button>
        </section>
      )}

      {inserting && <ImageInsert local={p.local} onInsert={p.onAddImage} onClose={() => setInserting(false)} />}
    </div>
  );
}
