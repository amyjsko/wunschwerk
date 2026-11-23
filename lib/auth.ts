"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { cloudEnabled, supabase } from "./supabase";

/** undefined = wird noch geladen, null = nicht angemeldet */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(cloudEnabled ? undefined : null);

  useEffect(() => {
    if (!cloudEnabled) return;
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return session;
}

export async function signInWithEmail(email: string) {
  return supabase().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
}

export async function signOut() {
  await supabase().auth.signOut();
}
