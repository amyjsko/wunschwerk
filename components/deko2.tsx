import type { StickerDef } from "./stickers";

/* Zweites Deko-Set: gedämpfte Farben passend zu den Washi-Tapes, mit leichtem Tinten-Strich. */

const ink = "#3d322a";

function star(cx: number, cy: number, r: number, k = 0.45) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * k : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export const deko2: StickerDef[] = [
  {
    id: "x-zapfen", name: "Tannenzapfen", ratio: 0.7, w: 70, color: "#8a5a35", group: "deko", occasions: ["weihnachten"],
    draw: (c) => (
      <svg viewBox="0 0 70 100" width="100%" height="100%">
        <path d="M35 2 V12" stroke="#5f4630" strokeWidth="3" />
        {[0, 1, 2, 3, 4, 5].map((r) =>
          [-1, 0, 1].map((k) => {
            const y = 18 + r * 13, sp = 10 + Math.sin((r / 5) * Math.PI) * 8;
            const x = 35 + k * sp;
            if (r === 0 && k !== 0) return null;
            if (r === 5 && k !== 0) return null;
            return <path key={`${r}${k}`} d={`M${x - 9} ${y} Q${x} ${y + 16} ${x + 9} ${y} Q${x} ${y + 6} ${x - 9} ${y} Z`} fill={c} stroke="#3d2a1c" strokeWidth="1.5" />;
          }),
        )}
      </svg>
    ),
  },
  {
    id: "x-briefmarke", name: "Briefmarke Weihnachten", ratio: 0.82, w: 110, color: "#2f4a3a", group: "doodle", occasions: ["weihnachten"],
    draw: (c) => (
      <svg viewBox="0 0 82 100" width="100%" height="100%">
        <defs>
          <mask id="bm-x">
            <rect width="82" height="100" fill="#fff" />
            {Array.from({ length: 9 }, (_, i) => <circle key={`t${i}`} cx={5 + i * 9} cy="0" r="3" fill="#000" />)}
            {Array.from({ length: 9 }, (_, i) => <circle key={`b${i}`} cx={5 + i * 9} cy="100" r="3" fill="#000" />)}
            {Array.from({ length: 11 }, (_, i) => <circle key={`l${i}`} cx="0" cy={5 + i * 9} r="3" fill="#000" />)}
            {Array.from({ length: 11 }, (_, i) => <circle key={`r${i}`} cx="82" cy={5 + i * 9} r="3" fill="#000" />)}
          </mask>
        </defs>
        <rect width="82" height="100" fill="#fbf7f0" mask="url(#bm-x)" />
        <rect x="9" y="9" width="64" height="70" fill={c} />
        <path d="M41 20 L58 66 H24 Z" fill="#7d8b63" />
        <path d="M41 32 L52 62 H30 Z" fill="#5f7a4e" />
        <polygon points={star(41, 20, 6)} fill="#e9c46a" />
        <rect x="37" y="66" width="8" height="7" fill="#8a5a35" />
        <text x="41" y="92" textAnchor="middle" fontSize="9" fontFamily="var(--font-typewriter), monospace" fill={ink}>2026 · 80 ct</text>
      </svg>
    ),
  },
  {
    id: "x-sternenhimmel", name: "Sternchen-Gruppe", ratio: 1.3, w: 110, color: "#d4af5a", group: "deko", occasions: ["weihnachten"],
    draw: (c) => (
      <svg viewBox="0 0 130 100" width="100%" height="100%">
        <polygon points={star(40, 46, 26, 0.42)} fill={c} />
        <polygon points={star(92, 30, 14, 0.42)} fill={c} opacity=".85" />
        <polygon points={star(98, 76, 10, 0.42)} fill={c} opacity=".7" />
        <circle cx="70" cy="58" r="3" fill={c} /><circle cx="14" cy="84" r="2.5" fill={c} /><circle cx="118" cy="52" r="2" fill={c} />
      </svg>
    ),
  },
  // ---------- Alltag ----------,
  {
    id: "a-fotoecken", name: "Fotoecken", ratio: 1, w: 260, color: "#3d322a", occasions: ["alltag"], group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {[[0, 0, 0], [100, 0, 90], [100, 100, 180], [0, 100, 270]].map(([x, y, r], i) => (
          <path key={i} d="M0 0 H16 L0 16 Z" fill={c} transform={`translate(${x} ${y}) rotate(${r})`} opacity=".9" />
        ))}
      </svg>
    ),
  },
  {
    id: "a-kreis", name: "Markierungs-Kringel", ratio: 1.8, w: 260, color: "#b5413a", occasions: ["alltag"], group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 180 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
        <path d="M120 12 C60 2 8 26 12 54 C16 86 120 96 160 70 C186 52 168 16 110 14 C90 14 70 18 60 22" />
      </svg>
    ),
  },
  {
    id: "a-blatt", name: "Eukalyptus", ratio: 0.6, w: 80, color: "#8ea38a", occasions: ["alltag"], group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 60 100" width="100%" height="100%">
        <path d="M30 98 C28 70 32 40 30 4" stroke="#6f7f5c" strokeWidth="2" fill="none" />
        {[14, 30, 46, 62, 78].map((y, i) => (
          <ellipse key={y} cx={i % 2 ? 40 : 20} cy={y} rx="11" ry="8" fill={c} stroke="#6f7f5c" strokeWidth="1" opacity={0.85 + (i % 2) * 0.15} transform={`rotate(${i % 2 ? 20 : -20} ${i % 2 ? 40 : 20} ${y})`} />
        ))}
      </svg>
    ),
  },
  {
    id: "a-mond-sterne", name: "Mond mit Sternen", ratio: 1.2, w: 110, color: "#d4af5a", occasions: ["alltag"], group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 120 100" width="100%" height="100%">
        <path d="M52 10 C30 16 18 40 26 62 C34 82 58 92 80 84 C56 82 40 62 42 40 C43 28 46 18 52 10 Z" fill={c} stroke={ink} strokeWidth="1.5" />
        <polygon points={star(86, 30, 10, 0.4)} fill={c} />
        <polygon points={star(104, 58, 6, 0.4)} fill={c} />
        <circle cx="74" cy="56" r="2" fill={c} />
      </svg>
    ),
  },
  {
    id: "a-herzballon", name: "Herzen-Doodle", ratio: 1.5, w: 120, color: "#b5413a", occasions: ["alltag"], group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 150 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 80 C10 58 8 36 22 28 C32 22 40 30 40 38 C40 30 48 22 58 28 C72 36 70 58 40 80 Z" />
        <path d="M104 52 C88 40 88 28 96 24 C101 21 106 26 106 30 C106 26 111 21 116 24 C124 28 124 40 104 52 Z" fill={c} opacity=".85" />
        <path d="M76 20 L80 12 M86 24 L94 18 M70 14 L70 6" />
      </svg>
    ),
  },
  {
    id: "d-stern", name: "Doodle-Stern", ratio: 1, w: 80, color: "#3d322a", group: "doodle", occasions: ["weihnachten"],
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 8 L61 38 L93 40 L68 60 L77 91 L50 73 L24 92 L32 61 L7 41 L39 38 Z" />
        <path d="M50 22 L57 41 L77 43" opacity=".35" />
      </svg>
    ),
  },
  {
    id: "d-flocke", name: "Doodle-Schneeflocke", ratio: 1, w: 80, color: "#3d322a", group: "doodle", occasions: ["weihnachten"],
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round">
        {[0, 60, 120].map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            <path d="M50 8 V92" />
            <path d="M50 22 L41 13 M50 22 L59 13 M50 78 L41 87 M50 78 L59 87" />
          </g>
        ))}
        <circle cx="50" cy="50" r="5" />
      </svg>
    ),
  },
  {
    id: "d-pfeil-schleife", name: "Pfeil mit Schleife", ratio: 2.4, w: 200, color: "#3d322a", group: "doodle", occasions: ["weihnachten"],
    draw: (c) => (
      <svg viewBox="0 0 240 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 70 C60 30 120 80 160 50 C180 36 196 34 222 40" />
        <path d="M206 28 L224 40 L208 54" />
        <path d="M86 58 C70 38 64 64 86 58 C104 40 110 66 86 58 L78 82 M86 58 L96 84" stroke="#b5413a" />
      </svg>
    ),
  },
];
