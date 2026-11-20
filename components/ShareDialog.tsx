"use client";
import { useEffect, useState } from "react";
import { encodeList } from "@/lib/share";
import type { WishList } from "@/lib/types";

export default function ShareDialog({ list, onClose }: { list: WishList; onClose: () => void }) {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    encodeList(list).then((code) => setLink(`${window.location.origin}/teilen#d=${code}`));
  }, [list]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const text = `Hier ist mein Wunschzettel „${list.title}“: ${link}`;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold">Wunschzettel teilen</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Jeder mit diesem Link sieht deinen Wunschzettel, ganz ohne Konto. Änderungen, die du später machst, brauchen einen neuen Link.
        </p>
        <div className="mt-4 flex gap-2">
          <input readOnly value={link || "Link wird erstellt…"} onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm" />
          <button onClick={copy} disabled={!link} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
            {copied ? "Kopiert ✓" : "Kopieren"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-[#25d366] px-4 py-2 font-semibold text-white">WhatsApp</a>
          <a href={`mailto:?subject=${encodeURIComponent(list.title)}&body=${encodeURIComponent(text)}`}
            className="rounded-full border border-neutral-300 px-4 py-2">E-Mail</a>
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="rounded-full border border-neutral-300 px-4 py-2">
              Vorschau öffnen
            </a>
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-lg py-2 text-sm text-neutral-500 hover:bg-neutral-50">Schließen</button>
      </div>
    </div>
  );
}
