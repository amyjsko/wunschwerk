import type { StickerDef } from "./stickers";

/* Zweites Deko-Set: gedämpfte Farben passend zu den Washi-Tapes, mit leichtem Tinten-Strich. */

const ink = "#3d322a";
const W = "weihnachten" as const;

function star(cx: number, cy: number, r: number, k = 0.45) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * k : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

export const deko2: StickerDef[] = [
  // ---------- Weihnachten ----------
  {
    id: "x-kugel", name: "Christbaumkugel", ratio: 0.8, w: 90, color: "#b5413a", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 80 100" width="100%" height="100%">
        <path d="M40 2 C34 2 32 10 40 12 C48 10 46 2 40 2" fill="none" stroke="#c39a6b" strokeWidth="2.5" />
        <rect x="32" y="12" width="16" height="10" rx="2" fill="#d4af5a" stroke={ink} strokeWidth="1.5" />
        <circle cx="40" cy="58" r="36" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M8 52 Q40 66 72 52" fill="none" stroke="#efe4cf" strokeWidth="3" opacity=".8" />
        <path d="M10 66 Q40 80 70 66" fill="none" stroke="#d4af5a" strokeWidth="2.5" strokeDasharray="1 6" strokeLinecap="round" />
        <path d="M24 38 Q30 30 38 30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".45" />
      </svg>
    ),
  },
  {
    id: "x-zuckerstange", name: "Zuckerstange", ratio: 0.55, w: 70, color: "#b5413a", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 55 100" width="100%" height="100%">
        <defs>
          <pattern id={`zs${c.slice(1)}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="#fbf4e8" />
            <rect width="5" height="12" fill={c} />
          </pattern>
        </defs>
        <path d="M18 96 V30 C18 10 46 10 46 28" fill="none" stroke={ink} strokeWidth="15" strokeLinecap="round" />
        <path d="M18 96 V30 C18 10 46 10 46 28" fill="none" stroke={`url(#zs${c.slice(1)})`} strokeWidth="11" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "x-lebkuchen", name: "Lebkuchenmann", ratio: 0.85, w: 90, color: "#a8693a", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 85 100" width="100%" height="100%" strokeLinecap="round" strokeLinejoin="round">
        <path d="M42 4 C54 4 58 14 56 24 C66 22 80 26 80 36 C80 44 66 44 58 44 L62 62 L74 86 C76 94 66 98 62 92 L50 74 C46 70 38 70 34 74 L22 92 C18 98 8 94 10 86 L22 62 L26 44 C18 44 4 44 4 36 C4 26 18 22 28 24 C26 14 30 4 42 4 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M14 34 Q18 30 22 34 M62 34 Q66 30 70 34 M28 84 Q24 80 20 84 M56 84 Q60 80 64 84" stroke="#fbf4e8" strokeWidth="2.5" fill="none" />
        <circle cx="36" cy="16" r="2.5" fill={ink} /><circle cx="48" cy="16" r="2.5" fill={ink} />
        <path d="M36 24 Q42 29 48 24" stroke={ink} strokeWidth="2" fill="none" />
        <circle cx="42" cy="40" r="3" fill="#b5413a" /><circle cx="42" cy="52" r="3" fill="#7d8b63" />
      </svg>
    ),
  },
  {
    id: "x-kerze", name: "Kerze", ratio: 0.5, w: 60, color: "#efe4cf", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 50 100" width="100%" height="100%">
        <path d="M25 4 C33 14 32 24 25 28 C18 24 17 14 25 4 Z" fill="#e9c46a" stroke={ink} strokeWidth="1.5" />
        <path d="M25 14 C28 18 28 22 25 25 C22 22 22 18 25 14 Z" fill="#f6e7b8" />
        <path d="M25 28 V34" stroke={ink} strokeWidth="2" />
        <rect x="12" y="34" width="26" height="58" rx="3" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M14 40 C18 44 22 40 26 46 C26 50 24 52 24 56" fill="none" stroke={ink} strokeWidth="1.2" opacity=".35" />
        <path d="M6 92 H44" stroke="#c39a6b" strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "x-glocke", name: "Glöckchen", ratio: 1, w: 80, color: "#d4af5a", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" strokeLinejoin="round">
        <path d="M38 12 C30 30 50 28 50 14 C50 28 70 30 62 12" fill="none" stroke="#b5413a" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 18 C30 18 26 38 26 56 C26 66 18 72 14 78 H86 C82 72 74 66 74 56 C74 38 70 18 50 18 Z" fill={c} stroke={ink} strokeWidth="2.5" />
        <circle cx="50" cy="84" r="7" fill={c} stroke={ink} strokeWidth="2.5" />
        <path d="M36 34 Q34 46 36 58" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".45" />
      </svg>
    ),
  },
  {
    id: "x-stechpalme", name: "Stechpalme", ratio: 1.3, w: 100, color: "#5f7a4e", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 130 100" width="100%" height="100%" strokeLinejoin="round">
        {[[-28, 1], [208, -1]].map(([r, s], i) => (
          <g key={i} transform={`translate(65 58) rotate(${r})`}>
            <path d="M0 0 C6 -8 10 -6 16 -12 C18 -6 24 -6 28 -10 C30 -4 36 -2 42 -6 C42 2 48 4 54 4 C46 10 46 14 42 18 C36 14 30 16 28 20 C24 14 18 14 14 18 C12 12 6 8 0 0 Z" fill={c} stroke={ink} strokeWidth="1.8" transform={`scale(1 ${s})`} />
            <path d="M2 2 L50 4" stroke={ink} strokeWidth="1.2" opacity=".5" />
          </g>
        ))}
        <circle cx="58" cy="54" r="9" fill="#a8322a" stroke={ink} strokeWidth="1.5" />
        <circle cx="72" cy="52" r="8.5" fill="#b5413a" stroke={ink} strokeWidth="1.5" />
        <circle cx="65" cy="66" r="8.5" fill="#9c2c25" stroke={ink} strokeWidth="1.5" />
        <circle cx="55" cy="51" r="2.2" fill="#fff" opacity=".6" />
      </svg>
    ),
  },
  {
    id: "x-zapfen", name: "Tannenzapfen", ratio: 0.7, w: 70, color: "#8a5a35", group: "anlass", anlass: W,
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
    id: "x-schneemann", name: "Schneemann", ratio: 0.75, w: 90, color: "#fbf7f0", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 75 100" width="100%" height="100%" strokeLinecap="round">
        <circle cx="37" cy="70" r="26" fill={c} stroke={ink} strokeWidth="2" />
        <circle cx="37" cy="32" r="18" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M22 16 H52 M27 16 V2 H47 V16" fill="#3d322a" stroke={ink} strokeWidth="2" />
        <circle cx="31" cy="30" r="2" fill={ink} /><circle cx="43" cy="30" r="2" fill={ink} />
        <path d="M37 34 L50 37 L37 38 Z" fill="#d07a3a" />
        <path d="M20 46 Q37 54 54 46 L58 58 L50 56" fill="none" stroke="#b5413a" strokeWidth="6" />
        <circle cx="37" cy="64" r="2.5" fill={ink} /><circle cx="37" cy="76" r="2.5" fill={ink} />
      </svg>
    ),
  },
  {
    id: "x-schleife", name: "Geschenkschleife", ratio: 1.3, w: 110, color: "#9c2c25", group: "anlass", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 130 100" width="100%" height="100%" strokeLinejoin="round">
        <path d="M65 44 C40 10 6 14 12 40 C16 58 46 54 65 44 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M65 44 C90 10 124 14 118 40 C114 58 84 54 65 44 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M60 48 L38 94 L50 88 L56 98 L64 52 Z M70 48 L92 94 L80 88 L74 98 L66 52 Z" fill={c} stroke={ink} strokeWidth="2" />
        <ellipse cx="65" cy="46" rx="10" ry="12" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M24 30 C34 26 46 32 56 40 M106 30 C96 26 84 32 74 40" fill="none" stroke="#000" strokeWidth="1.5" opacity=".2" />
      </svg>
    ),
  },
  {
    id: "x-briefmarke", name: "Briefmarke Weihnachten", ratio: 0.82, w: 110, color: "#2f4a3a", group: "doodle", anlass: W,
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
    id: "x-stempel", name: "Poststempel Weihnachtspost", ratio: 1, w: 120, color: "#9c2c25", group: "doodle", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke={c} opacity=".85">
        <circle cx="50" cy="50" r="44" strokeWidth="3" />
        <circle cx="50" cy="50" r="34" strokeWidth="1.5" />
        <path id="stp" d="M50 50 m-39 0 a39 39 0 1 1 78 0" stroke="none" />
        <text fontSize="10" fontFamily="var(--font-typewriter), monospace" fill={c} stroke="none" letterSpacing="2">
          <textPath href="#stp" startOffset="50%" textAnchor="middle">WEIHNACHTSPOST</textPath>
        </text>
        <text x="50" y="56" textAnchor="middle" fontSize="15" fontFamily="var(--font-typewriter), monospace" fill={c} stroke="none">24.12.</text>
        <path d="M90 44 Q110 38 130 44 M90 52 Q110 46 130 52 M90 60 Q110 54 130 60" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "x-sternenhimmel", name: "Sternchen-Gruppe", ratio: 1.3, w: 110, color: "#d4af5a", group: "deko", anlass: W,
    draw: (c) => (
      <svg viewBox="0 0 130 100" width="100%" height="100%">
        <polygon points={star(40, 46, 26, 0.42)} fill={c} />
        <polygon points={star(92, 30, 14, 0.42)} fill={c} opacity=".85" />
        <polygon points={star(98, 76, 10, 0.42)} fill={c} opacity=".7" />
        <circle cx="70" cy="58" r="3" fill={c} /><circle cx="14" cy="84" r="2.5" fill={c} /><circle cx="118" cy="52" r="2" fill={c} />
      </svg>
    ),
  },
  // ---------- Alltag ----------
  {
    id: "a-wimpel", name: "Wimpelkette", ratio: 3.2, w: 320, color: "#b5413a", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 320 100" width="100%" height="100%">
        <path d="M4 10 Q160 46 316 10" fill="none" stroke={ink} strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = 22 + i * 46, y = 10 + Math.sin(((x - 4) / 312) * Math.PI) * 26;
          const f = [c, "#e3a993", "#7d8b63", "#efe4cf", "#d4af5a"][i % 5];
          return <path key={i} d={`M${x - 16} ${y} L${x + 16} ${y + 1} L${x} ${y + 40} Z`} fill={f} stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />;
        })}
      </svg>
    ),
  },
  {
    id: "a-fotoecken", name: "Fotoecken", ratio: 1, w: 260, color: "#3d322a", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {[[0, 0, 0], [100, 0, 90], [100, 100, 180], [0, 100, 270]].map(([x, y, r], i) => (
          <path key={i} d="M0 0 H16 L0 16 Z" fill={c} transform={`translate(${x} ${y}) rotate(${r})`} opacity=".9" />
        ))}
      </svg>
    ),
  },
  {
    id: "a-papierfetzen", name: "Papierschnipsel", ratio: 1.6, w: 220, color: "#fbf7f0", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 160 100" width="100%" height="100%">
        <path d="M6 10 L40 6 L72 12 L110 4 L154 10 L150 40 L156 70 L148 94 L110 90 L70 96 L30 90 L4 94 L10 60 L2 34 Z" fill={c} stroke="#d8c7a8" strokeWidth="1" style={{ filter: "drop-shadow(0 2px 2px rgba(60,40,20,.2))" }} />
        {[24, 38, 52, 66, 80].map((y) => <path key={y} d={`M14 ${y} H146`} stroke="#9cb4c8" strokeWidth="1" opacity=".6" />)}
      </svg>
    ),
  },
  {
    id: "a-kreis", name: "Markierungs-Kringel", ratio: 1.8, w: 260, color: "#b5413a", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 180 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
        <path d="M120 12 C60 2 8 26 12 54 C16 86 120 96 160 70 C186 52 168 16 110 14 C90 14 70 18 60 22" />
      </svg>
    ),
  },
  {
    id: "a-sprechblase", name: "Sprechblase", ratio: 1.4, w: 180, color: "#fbf7f0", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 140 100" width="100%" height="100%" strokeLinejoin="round">
        <path d="M70 6 C30 6 6 22 6 44 C6 62 22 74 44 78 L36 96 L62 80 C66 80 68 82 70 82 C110 82 134 66 134 44 C134 22 110 6 70 6 Z" fill={c} stroke={ink} strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: "a-blatt", name: "Eukalyptus", ratio: 0.6, w: 80, color: "#8ea38a", group: "deko",
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
    id: "a-trockenblume", name: "Trockenblume", ratio: 0.5, w: 70, color: "#e3a993", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 50 100" width="100%" height="100%" strokeLinecap="round">
        <path d="M25 98 C24 70 26 50 25 24 M25 60 C18 54 14 46 12 38 M25 50 C32 44 36 36 37 28" stroke="#8a7a52" strokeWidth="1.8" fill="none" />
        {[[25, 18, 9], [12, 32, 6], [37, 22, 6]].map(([x, y, r], i) => (
          <g key={i}>
            {Array.from({ length: 8 }, (_, k) => (
              <ellipse key={k} cx={x} cy={y - r * 0.6} rx={r * 0.32} ry={r * 0.6} fill={c} transform={`rotate(${k * 45} ${x} ${y})`} opacity=".9" />
            ))}
            <circle cx={x} cy={y} r={r * 0.3} fill="#d4af5a" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "a-mond-sterne", name: "Mond mit Sternen", ratio: 1.2, w: 110, color: "#d4af5a", group: "deko",
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
    id: "a-herzballon", name: "Herzen-Doodle", ratio: 1.5, w: 120, color: "#b5413a", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 150 100" width="100%" height="100%" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 80 C10 58 8 36 22 28 C32 22 40 30 40 38 C40 30 48 22 58 28 C72 36 70 58 40 80 Z" />
        <path d="M104 52 C88 40 88 28 96 24 C101 21 106 26 106 30 C106 26 111 21 116 24 C124 28 124 40 104 52 Z" fill={c} opacity=".85" />
        <path d="M76 20 L80 12 M86 24 L94 18 M70 14 L70 6" />
      </svg>
    ),
  },
];
