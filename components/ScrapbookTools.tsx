"use client";
import { fonts, papers, textColors } from "@/lib/design";
import type { Design, DesignItem, FontId, PaperId, TemplateId } from "@/lib/types";
import { useRef, useState } from "react";
import { pictureFromFile, pictureFromLink, removeWhite, type Picture } from "@/lib/bild";
import { stickerColors, stickerMap, stickers, type StickerDef } from "./stickers";
import { tags } from "./tags";

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
  onAddTag: (id: string) => void;
  onAddPicture: (p: Picture) => void;
  template?: TemplateId;
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
  const [tab, setTab] = useState<"alle" | "weihnachten">(p.template === "weihnachten" ? "weihnachten" : "alle");
  const fits = (a?: string) => tab === "alle" || a === tab;
  const withText = sel?.kind === "text" || sel?.kind === "tag";
  const fileRef = useRef<HTMLInputElement>(null);
  const originals = useRef<Record<string, string>>({});
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cut, setCut] = useState(0.5);

  async function add(get: () => Promise<Picture>, what: string) {
    setErr(null);
    setBusy(what);
    try {
      p.onAddPicture(await get());
      setLink("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Das hat nicht geklappt.");
    } finally {
      setBusy(null);
    }
  }

  async function cutOut(strength: number) {
    if (!sel?.src) return;
    const orig = (originals.current[sel.id] ??= sel.src);
    setBusy("cut");
    try {
      p.onChangeSelected({ src: await removeWhite(orig, strength) });
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="space-y-6">
      {sel && (
        <section className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
          <div className="flex items-center justify-between">
            <span className={label}>
              {sel.kind === "wish" ? "Wunsch" : sel.kind === "text" ? "Text" : sel.kind === "tag" ? "Anhänger" : sel.kind === "bild" ? "Bild" : "Sticker"} ausgewählt
            </span>
            <div className="flex gap-1 text-sm">
              <button onClick={() => p.onLayer("vor")} className="rounded border border-neutral-300 bg-white px-2 py-0.5" title="Nach vorne holen">⬆ vorne</button>
              <button onClick={() => p.onLayer("zurueck")} className="rounded border border-neutral-300 bg-white px-2 py-0.5" title="Nach hinten schieben">⬇ hinten</button>
              {sel.kind !== "wish" && (
                <button onClick={p.onDeleteSelected} className="rounded border border-neutral-300 bg-white px-2 py-0.5 hover:text-red-600" title="Entfernen">✕</button>
              )}
            </div>
          </div>
          {withText && (
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
          {sel.kind === "bild" && (
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => cutOut(cut)} disabled={busy === "cut"}
                  className="rounded-full bg-neutral-900 px-3 py-1 text-white disabled:opacity-50">
                  {busy === "cut" ? "Einen Moment …" : "✂ Weißen Hintergrund entfernen"}
                </button>
                {originals.current[sel.id] && (
                  <button onClick={() => p.onChangeSelected({ src: originals.current[sel.id] })} className="rounded-full border border-neutral-300 bg-white px-3 py-1">
                    Original
                  </button>
                )}
              </div>
              {originals.current[sel.id] && (
                <label className="flex items-center gap-2">
                  <span className="w-14 text-neutral-600">Stärke</span>
                  <input type="range" min={0} max={1} step={0.05} value={cut}
                    onChange={(e) => setCut(Number(e.target.value))} onPointerUp={() => cutOut(cut)} onKeyUp={() => cutOut(cut)}
                    className="flex-1 accent-rose-600" />
                </label>
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!sel.rahmen} onChange={(e) => p.onChangeSelected({ rahmen: e.target.checked })} className="accent-rose-600" />
                Weißer Fotorand
              </label>
            </div>
          )}
          {sel.kind !== "wish" && sel.kind !== "bild" && !isWashi && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(withText ? textColors : stickerColors).map((c) => (
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

      <div className="flex gap-1 rounded-full bg-neutral-100 p-1 text-sm">
        {([["alle", "Alle"], ["weihnachten", "🎄 Weihnachten"]] as const).map(([id, name]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-full px-3 py-1 ${tab === id ? "bg-white font-semibold shadow-sm" : "text-neutral-600"}`}>
            {name}
          </button>
        ))}
      </div>

      <section>
        <span className={label}>Papier</span>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {papers.filter((pa) => fits(pa.anlass)).map((pa) => (
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
        <div className="mt-3 rounded-xl border border-dashed border-neutral-300 p-3">
          <div className="text-xs text-neutral-500">Eigene Bilder</div>
          <input ref={fileRef} type="file" accept="image/*" hidden
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) add(() => pictureFromFile(f), "file"); }} />
          <button onClick={() => fileRef.current?.click()} disabled={!!busy}
            className="mt-1.5 w-full rounded-full border border-neutral-300 bg-white py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50">
            {busy === "file" ? "Lädt …" : "📷 Bild hochladen"}
          </button>
          <form className="mt-2 flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (link.trim()) add(() => pictureFromLink(link), "link"); }}>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Bild- oder Pinterest-Link"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 px-3 py-1.5 text-sm" />
            <button disabled={!!busy || !link.trim()} className="rounded-full bg-neutral-900 px-3 text-sm text-white disabled:opacity-40">
              {busy === "link" ? "…" : "Einfügen"}
            </button>
          </form>
          {err && <p className="mt-1.5 text-xs text-red-700">{err}</p>}
        </div>
        <div className="mt-3">
          <div className="text-xs text-neutral-500">Geschenkanhänger zum Beschriften</div>
          <div className="mt-1 grid grid-cols-4 gap-1.5">
            {tags.map((t) => (
              <button key={t.id} onClick={() => p.onAddTag(t.id)} title={t.name}
                className="flex h-14 items-center justify-center rounded-lg bg-neutral-50 p-1.5 hover:bg-rose-50">
                <div style={{ height: "100%", aspectRatio: String(t.ratio), maxWidth: "100%" }}>{t.draw(`p${t.id.replace(/-/g, "")}`)}</div>
              </button>
            ))}
          </div>
        </div>
        {groups.map((g) => stickers.some((s) => s.group === g.id && fits(s.anlass)) && (
          <div key={g.id} className="mt-3">
            <div className="text-xs text-neutral-500">{g.name}</div>
            <div className={`mt-1 grid gap-1.5 ${g.id === "tape" ? "grid-cols-2" : "grid-cols-6"}`}>
              {stickers
                .filter((s) => s.group === g.id && fits(s.anlass))
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
