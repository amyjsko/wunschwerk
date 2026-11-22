"use client";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { signOut } from "@/lib/auth";
import { cloudEnabled } from "@/lib/supabase";

export default function AccountBar({ session }: { session: Session | null | undefined }) {
  if (!cloudEnabled || session === undefined) return <div className="h-9" />;
  return (
    <div className="flex items-center justify-end gap-3 text-sm">
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
