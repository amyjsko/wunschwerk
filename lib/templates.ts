import type { TemplateId } from "./types";

export interface Template {
  id: TemplateId;
  name: string;
  defaultTitle: string;
  /** Classes for the outer sheet */
  sheet: string;
  heading: string;
  subtitle: string;
  card: string;
  cardTitle: string;
  price: string;
  accent: string;
  decoration: string[];
  swatch: string;
}

export const templates: Record<TemplateId, Template> = {
  weihnachten: {
    id: "weihnachten",
    name: "Weihnachten",
    defaultTitle: "Mein Wunschzettel",
    sheet: "bg-[#14402f] text-[#fbf5e9] bg-[radial-gradient(circle_at_20%_10%,#1f5a43_0,transparent_45%),radial-gradient(circle_at_85%_90%,#1f5a43_0,transparent_40%)]",
    heading: "font-script text-6xl text-[#f3d27a]",
    subtitle: "font-serif italic text-[#e8dcc4]",
    card: "bg-[#fbf5e9] text-[#3a2a1a] rounded-xl shadow-lg ring-2 ring-[#c8102e]/70",
    cardTitle: "font-serif font-semibold",
    price: "text-[#c8102e] font-semibold",
    accent: "text-[#c8102e]",
    decoration: ["❄", "✦", "🎄", "✧", "❄", "🎁"],
    swatch: "bg-[#14402f] border-[#f3d27a]",
  },
  geburtstag: {
    id: "geburtstag",
    name: "Geburtstag",
    defaultTitle: "Meine Geburtstagswünsche",
    sheet: "bg-gradient-to-br from-[#ffe1ec] via-[#fff3d6] to-[#dff3ff] text-[#3b2b4f]",
    heading: "font-round text-5xl font-bold text-[#e5487a]",
    subtitle: "font-round text-[#7a5d99]",
    card: "bg-white rounded-3xl shadow-md -rotate-1 even:rotate-1 border-4 border-white",
    cardTitle: "font-round font-semibold",
    price: "text-[#2b8ac6] font-bold",
    accent: "text-[#e5487a]",
    decoration: ["🎈", "🎉", "✨", "🎂", "🎊", "🎈"],
    swatch: "bg-gradient-to-br from-[#ffb3cb] to-[#a9dcff] border-white",
  },
  hochzeit: {
    id: "hochzeit",
    name: "Hochzeit",
    defaultTitle: "Unsere Hochzeitswünsche",
    sheet: "bg-[#f7f2ea] text-[#4a4038]",
    heading: "font-serif text-5xl tracking-wide text-[#8a6d3b]",
    subtitle: "font-serif italic text-[#8c7f72]",
    card: "bg-white/80 rounded-none border border-[#d8c7a3] shadow-sm",
    cardTitle: "font-serif text-lg",
    price: "text-[#8a6d3b]",
    accent: "text-[#b8955a]",
    decoration: ["❦", "✿", "❧", "✿"],
    swatch: "bg-[#f7f2ea] border-[#b8955a]",
  },
  minimal: {
    id: "minimal",
    name: "Schlicht",
    defaultTitle: "Wunschliste",
    sheet: "bg-white text-neutral-900",
    heading: "font-sans text-5xl font-extrabold tracking-tight",
    subtitle: "font-sans text-neutral-500",
    card: "bg-neutral-50 rounded-2xl border border-neutral-200",
    cardTitle: "font-sans font-semibold",
    price: "text-neutral-900 font-semibold",
    accent: "text-neutral-900",
    decoration: [],
    swatch: "bg-white border-neutral-900",
  },
};

export const templateList = Object.values(templates);
