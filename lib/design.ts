import { uid } from "./format";
import type { Design, DesignItem, FontId, PaperId, TemplateId, WishList } from "./types";

export const PAGE_W = 1000;
export const PAGE_H = 1400;
export const WISH_W = 250;

export const papers: { id: PaperId; name: string; style: React.CSSProperties; dark?: boolean; anlass?: "weihnachten" }[] = [
  {
    id: "creme",
    name: "Creme",
    style: {
      backgroundColor: "#fbf6ec",
      backgroundImage: "radial-gradient(circle at 20% 15%, rgba(255,255,255,.7) 0, transparent 40%), radial-gradient(circle at 80% 90%, rgba(214,196,164,.25) 0, transparent 45%)",
    },
  },
  {
    id: "kariert",
    name: "Kariert",
    style: {
      backgroundColor: "#fdfcf8",
      backgroundImage: "linear-gradient(rgba(120,150,190,.22) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(120,150,190,.22) 1.5px, transparent 1.5px)",
      backgroundSize: "40px 40px",
    },
  },
  {
    id: "punkte",
    name: "Gepunktet",
    style: {
      backgroundColor: "#fdfbf6",
      backgroundImage: "radial-gradient(rgba(80,70,60,.28) 2px, transparent 2.5px)",
      backgroundSize: "36px 36px",
    },
  },
  {
    id: "liniert",
    name: "Liniert",
    style: {
      backgroundColor: "#fffdf7",
      backgroundImage:
        "linear-gradient(90deg, transparent 88px, rgba(232,87,122,.45) 88px, rgba(232,87,122,.45) 91px, transparent 91px), linear-gradient(rgba(110,150,200,.3) 1.5px, transparent 1.5px)",
      backgroundSize: "100% 100%, 100% 44px",
    },
  },
  {
    id: "kraft",
    name: "Kraftpapier",
    style: {
      backgroundColor: "#c9a77c",
      backgroundImage:
        "radial-gradient(circle at 30% 20%, rgba(255,255,255,.18) 0, transparent 35%), radial-gradient(rgba(90,60,30,.12) 1px, transparent 1.5px)",
      backgroundSize: "100% 100%, 7px 7px",
    },
  },
  {
    id: "rosa",
    name: "Rosé",
    style: {
      backgroundColor: "#f9e3e6",
      backgroundImage: "radial-gradient(rgba(255,255,255,.8) 2px, transparent 2.5px)",
      backgroundSize: "44px 44px",
    },
  },
  {
    id: "salbei",
    name: "Salbei",
    style: {
      backgroundColor: "#dfe8d8",
      backgroundImage: "linear-gradient(rgba(255,255,255,.35) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.35) 1.5px, transparent 1.5px)",
      backgroundSize: "50px 50px",
    },
  },
  {
    id: "nacht",
    name: "Winternacht",
    dark: true,
    style: {
      backgroundColor: "#1d3b33",
      backgroundImage:
        "radial-gradient(rgba(255,255,255,.5) 1.5px, transparent 2px), radial-gradient(rgba(255,255,255,.25) 1px, transparent 1.5px)",
      backgroundSize: "90px 90px, 37px 37px",
      backgroundPosition: "0 0, 20px 13px",
    },
  },
];

papers.push(
  {
    id: "tartan", name: "Schottenkaro", anlass: "weihnachten",
    style: {
      backgroundColor: "#8e2f2a",
      backgroundImage:
        "repeating-linear-gradient(90deg, rgba(36,64,46,.55) 0 60px, transparent 60px 120px), repeating-linear-gradient(0deg, rgba(36,64,46,.55) 0 60px, transparent 60px 120px), repeating-linear-gradient(90deg, transparent 0 27px, rgba(233,196,106,.5) 27px 30px, transparent 30px 60px), repeating-linear-gradient(0deg, transparent 0 27px, rgba(233,196,106,.5) 27px 30px, transparent 30px 60px)",
    },
    dark: true,
  },
  {
    id: "vichyrot", name: "Vichy Rot", anlass: "weihnachten",
    style: {
      backgroundColor: "#fbf6ec",
      backgroundImage: "linear-gradient(90deg, rgba(168,50,42,.28) 50%, transparent 50%), linear-gradient(rgba(168,50,42,.28) 50%, transparent 50%)",
      backgroundSize: "56px 56px",
    },
  },
  {
    id: "zuckerstange", name: "Zuckerstange", anlass: "weihnachten",
    style: {
      backgroundColor: "#fbf4e8",
      backgroundImage: "repeating-linear-gradient(-45deg, rgba(168,50,42,.18) 0 22px, transparent 22px 64px)",
    },
  },
  {
    id: "schneekraft", name: "Kraft mit Schnee", anlass: "weihnachten",
    style: {
      backgroundColor: "#c39a6b",
      backgroundImage:
        "radial-gradient(rgba(255,255,255,.85) 2.5px, transparent 3px), radial-gradient(rgba(255,255,255,.55) 1.5px, transparent 2px), radial-gradient(rgba(90,60,30,.12) 1px, transparent 1.5px)",
      backgroundSize: "80px 80px, 43px 43px, 7px 7px",
      backgroundPosition: "0 0, 21px 17px, 0 0",
    },
  },
  {
    id: "schneecreme", name: "Creme mit Flocken", anlass: "weihnachten",
    style: {
      backgroundColor: "#f8f2e6",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g stroke='%2390a4b8' stroke-width='1.6' stroke-linecap='round' opacity='.45'><path d='M30 18v24M18 30h24M21.5 21.5l17 17M38.5 21.5l-17 17'/><path d='M90 78v18M81 87h18M84 81l12 12M96 81l-12 12'/></g></svg>\")",
      backgroundSize: "120px 120px",
    },
  },
  {
    id: "goldpunkte", name: "Tanne & Gold", anlass: "weihnachten", dark: true,
    style: {
      backgroundColor: "#2f4a3a",
      backgroundImage: "radial-gradient(rgba(233,196,106,.75) 2px, transparent 2.5px), radial-gradient(rgba(233,196,106,.35) 1.2px, transparent 1.7px)",
      backgroundSize: "60px 60px, 31px 31px",
      backgroundPosition: "0 0, 15px 11px",
    },
  },
);

export const paperMap = Object.fromEntries(papers.map((p) => [p.id, p])) as Record<PaperId, (typeof papers)[number]>;

export const fonts: { id: FontId; name: string; family: string; size: number }[] = [
  { id: "hand", name: "Handschrift", family: "var(--font-hand), cursive", size: 1 },
  { id: "marker", name: "Marker", family: "var(--font-marker), cursive", size: 0.9 },
  { id: "schreib", name: "Schreibschrift", family: "var(--font-script), cursive", size: 1.1 },
  { id: "serif", name: "Elegant", family: "var(--font-cormorant), serif", size: 0.8 },
  { id: "rund", name: "Verspielt", family: "var(--font-fredoka), sans-serif", size: 0.8 },
  { id: "weihnacht", name: "Weihnachtlich", family: "var(--font-xmas), cursive", size: 0.85 },
  { id: "schreibmaschine", name: "Schreibmaschine", family: "var(--font-typewriter), monospace", size: 0.7 },
  { id: "feder", name: "Feder", family: "var(--font-feder), cursive", size: 0.6 },
  { id: "amatic", name: "Kreide", family: "var(--font-amatic), sans-serif", size: 1.15 },
];

export const fontMap = Object.fromEntries(fonts.map((f) => [f.id, f])) as Record<FontId, (typeof fonts)[number]>;

export const textColors = ["#3b2f2a", "#b5573b", "#7d8b63", "#e3a993", "#e8577a", "#c8102e", "#2b6cb0", "#4f8a5b", "#8a6d3b", "#7a5d99", "#ffffff"];

const templatePaper: Record<TemplateId, PaperId> = {
  journal: "creme",
  weihnachten: "nacht",
  geburtstag: "rosa",
  hochzeit: "creme",
  minimal: "punkte",
};

const templateStickers: Record<TemplateId, string[]> = {
  journal: ["zweig", "funkeln", "herzchen", "blume", "zweig"],
  weihnachten: ["tannenbaum", "schneeflocke", "stern", "geschenk", "funkeln"],
  geburtstag: ["ballon", "torte", "funkeln", "herz", "ballon"],
  hochzeit: ["ringe", "zweig", "gaensebluemchen", "herzchen", "zweig"],
  minimal: ["funkeln", "blume", "herz", "zweig", "stern"],
};

const tapes = ["washi-streifen", "washi-karo", "washi-ranke", "washi-rosa"];

/** Rastert Wünsche in einer lockeren Collage, leicht schräg, wie eingeklebt. */
export function wishSlot(index: number): Pick<DesignItem, "x" | "y" | "rot"> {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const jitter = (n: number) => (((index * 7919 + n * 104729) % 1000) / 1000 - 0.5) * 2;
  return {
    x: 205 + col * 295 + jitter(1) * 18,
    y: 470 + row * 360 + jitter(2) * 20,
    rot: jitter(3) * 6,
  };
}

/** Erstes Scrapbook-Layout aus einer bestehenden Liste. */
export function createDesign(list: Pick<WishList, "title" | "subtitle" | "template" | "wishes">): Design {
  const items: DesignItem[] = [];
  let z = 1;
  const dark = templatePaper[list.template] === "nacht";
  items.push({
    id: uid(), kind: "text", text: list.title || "Meine Wünsche", font: "schreib",
    x: 500, y: 150, w: 560, rot: -2, z: z++, color: dark ? "#f3d27a" : "#3b2f2a",
  });
  if (list.subtitle)
    items.push({
      id: uid(), kind: "text", text: list.subtitle, font: "hand",
      x: 500, y: 265, w: 300, rot: 1, z: z++, color: dark ? "#e8dcc4" : "#7a6a5e",
    });
  items.push({ id: uid(), kind: "sticker", sticker: "unterstrich", x: 500, y: 215, w: 300, rot: 0, z: z++, color: "#b5573b" });

  list.wishes.forEach((w, i) => {
    const slot = wishSlot(i);
    items.push({ id: uid(), kind: "wish", wishId: w.id, ...slot, w: WISH_W, z: z++ });
    items.push({
      id: uid(), kind: "sticker", sticker: tapes[i % tapes.length],
      x: slot.x + (i % 2 ? 40 : -30), y: slot.y - 165, w: 150, h: 36, rot: slot.rot + (i % 2 ? 8 : -10), z: 900 + i,
    });
  });

  const deco = templateStickers[list.template];
  const spots = [
    [110, 110, -12], [890, 120, 14], [90, 1300, 8], [900, 1290, -10], [860, 300, 6],
  ];
  deco.forEach((s, i) => {
    const [x, y, rot] = spots[i];
    items.push({ id: uid(), kind: "sticker", sticker: s, x, y, w: 100, rot, z: z++ });
  });

  return { paper: templatePaper[list.template], items };
}

/** Sorgt dafür, dass jeder Wunsch auf der Seite vorkommt und gelöschte verschwinden. */
export function syncDesign(design: Design, wishIds: string[]): Design {
  const present = new Set(design.items.filter((i) => i.kind === "wish").map((i) => i.wishId));
  const keep = design.items.filter((i) => i.kind !== "wish" || wishIds.includes(i.wishId!));
  const missing = wishIds.filter((id) => !present.has(id));
  if (!missing.length && keep.length === design.items.length) return design;
  let count = keep.filter((i) => i.kind === "wish").length;
  const maxZ = Math.max(0, ...keep.map((i) => i.z));
  const added: DesignItem[] = missing.map((wishId, i) => ({
    id: uid(), kind: "wish", wishId, ...wishSlot(count++), w: WISH_W, z: maxZ + 1 + i,
  }));
  return { ...design, items: [...keep, ...added] };
}
