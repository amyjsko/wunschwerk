"use client";
import { useEffect, useRef, useState } from "react";
import { prepareImage } from "@/lib/cutout";
import { useSession } from "@/lib/auth";
import { listCollections, type Collection } from "@/lib/collections";
import type { DesignItem } from "@/lib/types";

type NewImage = Pick<DesignItem, "src" | "ratio" | "frame" | "link" | "credit">;

const frames: { id: NonNullable<DesignItem["frame"]>; name: string }[] = [
  { id: "ohne", name: "Ohne Rahmen" },
  { id: "sticker", name: "Sticker-Rand" },
  { id: "polaroid", name: "Polaroid" },
];

/** Eigenes Bild oder Pin einfügen, mit Freistellen und Rahmen */
export default function ImageInsert({ local, onInsert, onClose }: {
  /** Liste ohne Konto: eigene Bilder passen nicht in den Teilen-Link */
  local: boolean;
  /** liefert eine Fehlermeldung zurück, wenn kein Platz mehr ist */
  onInsert: (img: NewImage) => string | null;
  onClose: () => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [cut, setCut] = useState(false);
  const [strength, setStrength] = useState(30);
  const [frame, setFrame] = useState<NonNullable<DesignItem["frame"]>>("ohne");
  const [preview, setPreview] = useState<{ src: string; ratio: number } | null>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const session = useSession();
  const [cols, setCols] = useState<Collection[]>([]);
  const [colId, setColId] = useState("");
  /** Quelle, wenn das Bild aus Pinterest stammt */
  const [meta, setMeta] = useState<{ link?: string; credit?: string; id?: string } | null>(null);

  useEffect(() => {
    if (session === undefined) return;
    listCollections(session)
      .then((cs) => {
        // Im Scrapbook gehen nur Pinterest-Bilder (andere Seiten erlauben das Einbinden oft nicht)
        const filled = cs
          .map((c) => ({ ...c, items: c.items.filter((i) => i.src.startsWith("https://i.pinimg.com/")) }))
          .filter((c) => c.items.length > 0);
        setCols(filled);
        if (filled[0]) setColId(filled[0].id);
      })
      .catch(() => {});
  }, [session]);
  const col = cols.find((c) => c.id === colId);

  function load(src: string, done?: () => void) {
    setError("");
    const el = new Image();
    el.onload = () => {
      setImg(el);
      done?.();
    };
    el.onerror = () => {
      setError("Dieses Bild konnte nicht geladen werden.");
      done?.();
    };
    el.src = src;
  }

  function loadFile(f: File | null | undefined) {
    if (!f) return;
    setMeta(null);
    if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(f.type)) return setError("Bitte ein Bild wählen (PNG, JPG oder WebP).");
    if (f.size > 15 * 1024 * 1024) return setError("Das Bild ist zu groß (höchstens 15 MB).");
    const u = URL.createObjectURL(f);
    load(u, () => URL.revokeObjectURL(u));
  }

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])].find((x) => x.type.startsWith("image/"));
      if (f) {
        e.preventDefault();
        loadFile(f);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => {
      try {
        setPreview(prepareImage(img, cut, strength));
      } catch {
        setError("Dieses Bild lässt sich nicht bearbeiten.");
      }
    }, 60);
    return () => clearTimeout(t);
  }, [img, cut, strength]);

  async function fromLink(e: React.FormEvent) {
    e.preventDefault();
    const link = url.trim();
    if (!link) return;
    setError("");
    setBusy(true);
    try {
      if (/pinterest\.|pin\.it\//i.test(link)) {
        const res = await fetch(`/api/pin?url=${encodeURIComponent(link)}`);
        const data = await res.json();
        if (!res.ok) setError(data.error);
        else {
          setMeta({ link: data.link, credit: data.credit });
          load(`/api/bild?url=${encodeURIComponent(data.src)}`, () => setBusy(false));
          return;
        }
        setBusy(false);
      } else {
        setMeta(null);
        load(`/api/bild?url=${encodeURIComponent(link)}`, () => setBusy(false));
      }
    } catch {
      setError("Das hat nicht geklappt. Prüf bitte den Link.");
      setBusy(false);
    }
  }

  function setErrorOrClose(err: string | null) {
    if (err) setError(err);
    else onClose();
  }

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-label="Bild einfügen" className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold">Bild einfügen</h2>
        <button
          onClick={() => file.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            loadFile(e.dataTransfer.files[0]);
          }}
          className="mt-3 w-full rounded-xl border-2 border-dashed border-neutral-300 px-3 py-4 text-sm text-neutral-600 hover:border-rose-400"
        >
          <b>Bild auswählen</b>, hierher ziehen oder mit Strg + V einfügen
        </button>
        <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={(e) => loadFile(e.target.files?.[0])} />

        <form onSubmit={fromLink} className="mt-3 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Bild-Link oder Pinterest-Pin" className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <button disabled={busy || !url.trim()} className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Lädt…" : "Holen"}</button>
        </form>
        {col && (
          <div className="mt-3 rounded-xl bg-neutral-50 p-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold">📌 Aus deinen Sammlungen</span>
              <select value={colId} onChange={(e) => setColId(e.target.value)} aria-label="Sammlung" className="min-w-0 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs">
                {cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {col.items.map((i) => (
                <button key={i.id} title={i.title || "Einfügen"} onClick={() => {
                  setMeta({ link: i.link, credit: i.credit, id: i.id });
                  setFrame("sticker");
                  setBusy(true);
                  load(`/api/bild?url=${encodeURIComponent(i.src)}`, () => setBusy(false));
                }}
                  className={`h-20 shrink-0 overflow-hidden rounded-lg hover:ring-2 hover:ring-rose-500 ${meta?.id === i.id ? "ring-2 ring-rose-600" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.src} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-auto" style={{ aspectRatio: String(i.ratio || 1) }} />
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-neutral-500">Klick auf einen Pin, dann kannst du den Hintergrund entfernen und einen Rahmen wählen. Nimm bitte nur Bilder, die du verwenden darfst.</p>

        {preview && (
          <>
            <div className="mt-4 flex h-52 items-center justify-center rounded-xl p-3" style={{ background: "repeating-conic-gradient(#efe6d8 0 25%, #fbf7f0 0 50%) 0 0 / 22px 22px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.src} alt="Vorschau" className="max-h-full max-w-full object-contain" />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cut} onChange={(e) => setCut(e.target.checked)} className="accent-rose-600" /> Weißen Hintergrund entfernen
            </label>
            {cut && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-neutral-600">Stärke</span>
                <input type="range" min={0} max={100} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="flex-1 accent-rose-600" />
              </label>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {frames.map((f) => (
                <button key={f.id} onClick={() => setFrame(f.id)} className={`rounded-full px-3 py-1 text-sm ${frame === f.id ? "bg-neutral-900 text-white" : "border border-neutral-300"}`}>{f.name}</button>
              ))}
            </div>
            {local && <p className="mt-3 text-xs text-amber-700">Ohne Anmeldung siehst nur du dieses Bild. Es passt nicht in den Teilen-Link. Mit Konto sehen es auch deine Gäste.</p>}
          </>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm text-neutral-500">Abbrechen</button>
          <button disabled={!preview} onClick={() => preview && setErrorOrClose(onInsert({ ...preview, frame, ...(meta?.link ? { link: meta.link, credit: meta.credit } : {}) }))} className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">Einfügen</button>
        </div>
      </div>
    </div>
  );
}
