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

interface Props {
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
  const shown = stickers.filter(
    (s) => (occasion === "alle" || s.occasions?.includes(occasion)) && (!farbe || farbenVon(s).includes(farbe)),
  );
  return (
    <div className="space-y-6">
      {sel && (
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
            {sel.kind === "wish" && " Wünsche entfernst du unten in der Liste."}
          </p>
        </section>
      )}

      <section>
        <span className={label}>Papier</span>
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
      </section>

      <section>
        <div className="flex items-center justify-between">
          <span className={label}>Sticker & Deko</span>
          <div className="flex gap-1.5">
          <button onClick={() => setInserting(true)} className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50">+ Bild</button>
          <button onClick={p.onAddText} className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50" style={{ fontFamily: "var(--font-hand), cursive" }}>
            + Text
          </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
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
        {shown.length === 0 && <p className="mt-3 text-xs text-neutral-500">Keine Sticker in dieser Kombination.</p>}
        {groups.filter((g) => shown.some((s) => s.group === g.id)).map((g) => (
          <div key={g.id} className="mt-3">
            <div className="text-xs text-neutral-500">{g.name}</div>
            <div className={`mt-1 grid gap-1.5 ${g.id === "tape" || g.id === "border" ? "grid-cols-2" : g.id === "zettel" ? "grid-cols-4" : "grid-cols-6"}`}>
              {shown
                .filter((s) => s.group === g.id)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => p.onAddSticker(s.id)}
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
      </section>

      {inserting && <ImageInsert local={p.local} onInsert={p.onAddImage} onClose={() => setInserting(false)} />}

      <button
        onClick={p.onExport}
        disabled={p.exporting}
        className="w-full rounded-full border border-neutral-900 py-2 text-sm font-semibold hover:bg-neutral-900 hover:text-white disabled:opacity-50"
      >
        {p.exporting ? "Bild wird erstellt…" : "📷 Als Bild speichern"}
      </button>
    </div>
  );
}
