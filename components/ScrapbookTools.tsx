"use client";
import { fonts, papers, textColors } from "@/lib/design";
import type { Design, DesignItem, FontId, PaperId } from "@/lib/types";
import { stickerColors, stickerMap, stickers, type StickerDef } from "./stickers";

const groups: { id: StickerDef["group"]; name: string }[] = [
  { id: "tape", name: "Washi-Tape" },
  { id: "deko", name: "Deko" },
  { id: "doodle", name: "Doodles & Zettel" },
  { id: "anlass", name: "Anlässe" },
];

interface Props {
  design: Design;
  selected: DesignItem | null;
  onPaper: (p: PaperId) => void;
  onAddSticker: (id: string) => void;
  onAddText: () => void;
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
  const isWashi = !!washi?.washi;
  return (
    <div className="space-y-6">
      {sel && (
        <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
          <div className="flex items-center justify-between">
            <span className={label}>
              {sel.kind === "wish" ? "Wunsch" : sel.kind === "text" ? "Text" : "Sticker"} ausgewählt
            </span>
            <div className="flex gap-1 text-sm">
              <button onClick={() => p.onLayer("vor")} className="rounded border border-neutral-300 bg-white px-2 py-0.5" title="Nach vorne holen">⬆ vorne</button>
              <button onClick={() => p.onLayer("zurueck")} className="rounded border border-neutral-300 bg-white px-2 py-0.5" title="Nach hinten schieben">⬇ hinten</button>
              {sel.kind !== "wish" && (
                <button onClick={p.onDeleteSelected} className="rounded border border-neutral-300 bg-white px-2 py-0.5 hover:text-red-600" title="Entfernen">✕</button>
              )}
            </div>
          </div>
          {sel.kind === "text" && (
            <>
              <textarea
                value={sel.text ?? ""}
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
          {sel.kind !== "wish" && !isWashi && (
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
          <button onClick={p.onAddText} className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50" style={{ fontFamily: "var(--font-hand), cursive" }}>
            + Text
          </button>
        </div>
        {groups.map((g) => (
          <div key={g.id} className="mt-3">
            <div className="text-xs text-neutral-500">{g.name}</div>
            <div className={`mt-1 grid gap-1.5 ${g.id === "tape" ? "grid-cols-2" : "grid-cols-6"}`}>
              {stickers
                .filter((s) => s.group === g.id)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => p.onAddSticker(s.id)}
                    title={s.name}
                    className={`flex items-center justify-center rounded-lg bg-neutral-50 p-1.5 hover:bg-rose-50 ${s.washi ? "h-12" : "aspect-square"}`}
                  >
                    <div style={{ width: s.ratio >= 1 ? "100%" : `${s.ratio * 100}%`, aspectRatio: String(s.ratio) }}>{s.draw(s.color)}</div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </section>

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
