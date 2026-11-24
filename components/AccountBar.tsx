"use client";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { signOut } from "@/lib/auth";
import { cloudEnabled } from "@/lib/supabase";

export default function AccountBar({ session }: { session: Session | null | undefined }) {
  const sammlungen = (
    <Link href="/sammlungen" className="mr-auto rounded-full border border-neutral-300 bg-white px-3 py-1.5 hover:border-rose-400">
      📌 Meine Sammlungen
    </Link>
  );
  if (!cloudEnabled || session === undefined) return <div className="flex h-9 items-center text-sm">{sammlungen}</div>;
  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      {sammlungen}
      {session ? (
        <>
          <span className="truncate text-neutral-500">{session.user.email}</span>
          <button onClick={() => signOut()} className="rounded-full border border-neutral-300 px-3 py-1.5 hover:bg-white">
            Abmelden
          </button>
        </>
      ) : (
        <Link href="/anmelden" className="rounded-full bg-neutral-900 px-4 py-1.5 font-semibold text-white">
          Anmelden
        </Link>
      )}
    </div>
  );
}
