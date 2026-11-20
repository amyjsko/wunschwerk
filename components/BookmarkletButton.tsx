"use client";
import { useEffect, useRef, useState } from "react";
import { bookmarkletHref } from "@/lib/bookmarklet";

export default function BookmarkletButton() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // React blockiert javascript:-Links im JSX, darum setzen wir ihn direkt
    ref.current?.setAttribute("href", bookmarkletHref(window.location.origin));
  }, []);

  return (
    <div className="mt-3 rounded-xl border border-dashed border-neutral-300 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <a
          ref={ref}
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className="cursor-grab rounded-full bg-rose-600 px-3 py-1.5 font-semibold text-white"
          title="In die Lesezeichenleiste ziehen"
        >
          ♥ Wunschwerk merken
        </a>
        <button onClick={() => setOpen(!open)} className="text-xs text-neutral-500 underline">
          {open ? "weniger" : "Was ist das?"}
        </button>
      </div>
      {open && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-neutral-600">
          <li>Blende die Lesezeichenleiste ein: Strg+Umschalt+B (Mac: ⌘+Umschalt+B).</li>
          <li>Zieh den roten Knopf mit der Maus in die Leiste.</li>
          <li>Öffne ein Produkt in einem Shop, zum Beispiel bei Amazon oder Douglas, und klick in der Leiste auf „Wunschwerk merken“.</li>
        </ol>
      )}
      <p className="mt-2 text-xs text-neutral-500">
        Klappt auch bei Shops, die das automatische Auslesen blockieren.
      </p>
    </div>
  );
}
