import type { Metadata } from "next";
import { fetchSharedList } from "@/lib/shared-server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const list = await fetchSharedList(slug);
  if (!list) return { title: "Wunschzettel · Wunschwerk" };
  const n = list.wishes.length;
  const title = list.title || "Mein Wunschzettel";
  const description = `${list.subtitle ? `${list.subtitle} · ` : ""}${n} ${n === 1 ? "Wunsch" : "Wünsche"}. Schau rein und reserviere, was du verschenken möchtest.`;
  return {
    title: `${title} · Wunschwerk`,
    description,
    openGraph: { title, description, type: "website", siteName: "Wunschwerk", locale: "de_DE" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
