"use client";
import { useState } from "react";
import { itemFromLink, type CollectionItem } from "@/lib/collections";

/** Feld zum Einfügen eines Pin- oder Bildlinks */
export default function PinAdd({ onAdd }: { onAdd: (item: Omit<CollectionItem, "id" | "addedAt">) => Promise<void> }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onAdd(await itemFromLink(url));
      setUrl("");
    } catch (err) {
      setError((err as Error)?.message || "Das hat nicht geklappt.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" placeholder="Pin-Link einfügen, z. B. pin.it/… oder pinterest.de/pin/…"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm" />
        <button disabled={busy || !url.trim()} className="shrink-0 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          {busy ? "…" : "Merken"}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </form>
  );
}
