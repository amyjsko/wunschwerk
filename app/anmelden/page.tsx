"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithEmail, useSession } from "@/lib/auth";
import { cloudEnabled } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  if (!cloudEnabled)
    return <main className="py-24 text-center text-neutral-500">Anmelden ist noch nicht eingerichtet.</main>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setError(
        error.status === 429
          ? "Gerade wurden zu viele Anmelde-Links verschickt. Versuch es in ein paar Minuten noch einmal."
          : "Das hat nicht geklappt. Prüf die E-Mail-Adresse.",
      );
      setState("error");
    } else setState("sent");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <Link href="/" className="text-sm text-neutral-500 hover:text-rose-600">← Wunschwerk</Link>
      <h1 className="mt-4 font-serif text-4xl">Anmelden</h1>
      {state === "sent" ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold">Schau in dein Postfach 💌</p>
          <p className="mt-1 text-sm text-neutral-600">
            Wir haben dir einen Anmelde-Link an <strong>{email}</strong> geschickt. Öffne ihn im selben Browser. Schau notfalls auch im Spam-Ordner nach.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <p className="text-neutral-600">
            Gib deine E-Mail-Adresse ein. Du bekommst einen Link, mit dem du dich ohne Passwort anmeldest.
          </p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
          {state === "error" && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={state === "sending"}
            className="w-full rounded-full bg-rose-600 py-2 font-semibold text-white disabled:opacity-50">
            {state === "sending" ? "Wird verschickt…" : "Anmelde-Link schicken"}
          </button>
        </form>
      )}
    </main>
  );
}
