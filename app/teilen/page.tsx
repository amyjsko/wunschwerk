"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import WishBoard from "@/components/WishBoard";
import { decodeList } from "@/lib/share";
import type { WishList } from "@/lib/types";

type Shared = Pick<WishList, "title" | "subtitle" | "template" | "layout" | "wishes">;

export default function SharedPage() {
  const [list, setList] = useState<Shared | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.hash.slice(1)).get("d");
    if (!code) return setError(true);
    decodeList(code)
      .then((l) => {
        setList(l);
        document.title = `${l.title} · Wunschwerk`;
      })
      .catch(() => setError(true));
  }, []);

  if (error)
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">Dieser Link funktioniert leider nicht.</h1>
        <p className="mt-3 text-neutral-600">Vielleicht wurde er beim Kopieren abgeschnitten.</p>
        <Link href="/" className="mt-6 inline-block text-rose-600 underline">Eigenen Wunschzettel erstellen</Link>
      </main>
    );

  if (!list) return <main className="py-24 text-center text-neutral-400">Wunschzettel wird geladen…</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <WishBoard list={list} />
      <div className="no-print mt-8 text-center text-sm text-neutral-500">
        <Link href="/" className="text-rose-600 underline">Eigenen Wunschzettel erstellen</Link>
      </div>
    </main>
  );
}
