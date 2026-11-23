"use client";
import { useId } from "react";
import { fontMap } from "@/lib/design";
import type { DesignItem } from "@/lib/types";

/* Geschenkanhänger: Papier-Anhänger mit Kordel, auf die man selbst schreiben kann. */

export interface TagDef {
  id: string;
  name: string;
  /** Breite / Höhe */
  ratio: number;
  /** Textfarbe als Standard */
  ink: string;
  /** Bereich für den Text in Prozent der Fläche: links, oben, rechts, unten */
  area: [number, number, number, number];
  draw: (uid: string) => React.ReactNode;
}

const paperNoise = (uid: string, strength = 0.18) => (
  <filter id={`n${uid}`} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" result="t" />
    <feColorMatrix in="t" values={`0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 ${strength} 0`} result="g" />
    <feComposite in="g" in2="SourceGraphic" operator="in" result="m" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="m" />
    </feMerge>
  </filter>
);

/** Klassischer Anhänger mit abgeschrägten Ecken, Loch links */
const tagPath = "M60 8 H392 Q400 8 400 16 V184 Q400 192 392 192 H60 L8 140 V60 Z";

function Twine({ a, b }: { a: string; b: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M44 100 C10 70 -10 40 -2 6" stroke={a} strokeWidth="5" />
      <path d="M44 100 C10 70 -10 40 -2 6" stroke={b} strokeWidth="5" strokeDasharray="6 7" />
      <path d="M44 100 C20 120 -6 150 -4 196" stroke={a} strokeWidth="5" />
      <path d="M44 100 C20 120 -6 150 -4 196" stroke={b} strokeWidth="5" strokeDasharray="6 7" />
    </g>
  );
}

function Holly({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C8 -14 22 -16 34 -10 C30 -4 34 2 30 6 C24 2 18 6 14 2 C8 6 4 2 0 0 Z" fill="#5f7a4e" />
      <path d="M0 0 C-4 -16 2 -30 12 -38 C14 -30 22 -28 22 -22 C16 -22 16 -14 12 -12 C12 -6 4 -6 0 0 Z" fill="#7d8b63" />
      <path d="M0 0 L28 -6 M0 0 L12 -32" stroke="#4b5f3d" strokeWidth="1.5" fill="none" />
      <circle cx="-4" cy="4" r="6" fill="#a8322a" />
      <circle cx="6" cy="8" r="5.5" fill="#b5413a" />
      <circle cx="-2" cy="2" r="1.6" fill="#fff" opacity=".6" />
    </g>
  );
}

export const tags: TagDef[] = [
  {
    id: "anh-kraft", name: "Anhänger Kraftpapier", ratio: 2.1, ink: "#3d322a", area: [20, 14, 96, 86],
    draw: (u) => (
      <svg viewBox="-8 0 416 200" width="100%" height="100%">
        <defs>{paperNoise(u, 0.28)}</defs>
        <path d={tagPath} fill="#c39a6b" filter={`url(#n${u})`} />
        <path d={tagPath} fill="none" stroke="#9c7650" strokeWidth="1.5" opacity=".5" />
        <circle cx="44" cy="100" r="15" fill="#e6d3b3" />
        <circle cx="44" cy="100" r="8" fill="#fff" opacity=".9" />
        <Twine a="#fbf4e8" b="#b5413a" />
      </svg>
    ),
  },
  {
    id: "anh-creme", name: "Anhänger Creme mit Stechpalme", ratio: 2.1, ink: "#3d322a", area: [20, 14, 90, 86],
    draw: (u) => (
      <svg viewBox="-8 0 416 200" width="100%" height="100%">
        <defs>{paperNoise(u, 0.12)}</defs>
        <path d={tagPath} fill="#f8f0e1" filter={`url(#n${u})`} />
        <path d={tagPath} fill="none" stroke="#d8c7a8" strokeWidth="2" />
        <path d="M70 22 H384 V178 H70" fill="none" stroke="#b5413a" strokeWidth="1.5" strokeDasharray="5 5" opacity=".55" />
        <circle cx="44" cy="100" r="9" fill="#fff" stroke="#d8c7a8" strokeWidth="2" />
        <Holly x={372} y={168} s={0.9} />
        <Twine a="#c39a6b" b="#8a6d4b" />
      </svg>
    ),
  },
  {
    id: "anh-gruen", name: "Anhänger Tannengrün", ratio: 2.1, ink: "#e9c46a", area: [20, 14, 96, 86],
    draw: (u) => (
      <svg viewBox="-8 0 416 200" width="100%" height="100%">
        <defs>{paperNoise(u, 0.22)}</defs>
        <path d={tagPath} fill="#2f4a3a" filter={`url(#n${u})`} />
        <path d="M66 20 H386 Q388 20 388 22 V178 Q388 180 386 180 H66 L22 136 V64 Z" fill="none" stroke="#d4af5a" strokeWidth="2" opacity=".85" />
        <circle cx="44" cy="100" r="14" fill="#d4af5a" />
        <circle cx="44" cy="100" r="8" fill="#fff" opacity=".9" />
        {[[110, 40], [360, 48], [330, 160], [140, 168]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#e9c46a" opacity=".8" />
        ))}
        <Twine a="#d4af5a" b="#8c6a2a" />
      </svg>
    ),
  },
  {
    id: "anh-rund", name: "Runder Anhänger Bordeaux", ratio: 1.15, ink: "#fbf4e8", area: [16, 22, 84, 82],
    draw: (u) => (
      <svg viewBox="0 0 230 200" width="100%" height="100%">
        <defs>{paperNoise(u, 0.22)}</defs>
        <path d="M115 6 C130 30 150 18 150 2" fill="none" stroke="#c39a6b" strokeWidth="4" strokeLinecap="round" />
        <path d="M115 6 C100 30 80 18 80 2" fill="none" stroke="#c39a6b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="115" cy="110" r="86" fill="#7c2a2a" filter={`url(#n${u})`} />
        <circle cx="115" cy="110" r="76" fill="none" stroke="#fbf4e8" strokeWidth="1.5" strokeDasharray="4 5" opacity=".7" />
        <circle cx="115" cy="38" r="10" fill="#e6d3b3" />
        <circle cx="115" cy="38" r="5" fill="#fff" />
        <path d="M115 6 L115 30" stroke="#c39a6b" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const tagMap: Record<string, TagDef> = Object.fromEntries(tags.map((t) => [t.id, t]));

export function GiftTag({ item }: { item: DesignItem }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const def = tagMap[item.sticker ?? ""] ?? tags[0];
  const f = fontMap[item.font ?? "hand"] ?? fontMap.hand;
  const [l, t, r, b] = def.area;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: String(def.ratio) }}>
      <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 2px 3px rgba(60,40,20,.25))" }}>{def.draw(u)}</div>
      <div
        style={{
          position: "absolute", left: `${l}%`, top: `${t}%`, right: `${100 - r}%`, bottom: `${100 - b}%`,
          display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
          fontFamily: f.family, fontSize: item.w * 0.11 * f.size, lineHeight: 1.05,
          color: item.color ?? def.ink, whiteSpace: "pre-line", overflow: "hidden",
        }}
      >
        {item.text || " "}
      </div>
    </div>
  );
}
