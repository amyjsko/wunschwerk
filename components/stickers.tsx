/* Eigenes Sticker-Set im Scrapbook-Stil. Alles als SVG, damit es scharf bleibt
   und sich einfärben lässt. */

export interface StickerDef {
  id: string;
  name: string;
  /** Seitenverhältnis Breite / Höhe */
  ratio: number;
  /** Standardbreite auf der Seite */
  w: number;
  color: string;
  group: "tape" | "deko" | "doodle" | "anlass";
  draw: (c: string) => React.ReactNode;
}

const ink = "#3b2f2a";

function tape(pattern: "streifen" | "punkte" | "karo" | "uni") {
  return (c: string) => (
    <svg viewBox="0 0 240 60" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id={`p-${pattern}-${c.slice(1)}`} width="16" height="16" patternUnits="userSpaceOnUse">
          {pattern === "streifen" && <rect width="8" height="16" fill="#fff" opacity=".45" />}
          {pattern === "punkte" && <circle cx="8" cy="8" r="2.6" fill="#fff" opacity=".7" />}
          {pattern === "karo" && (
            <>
              <rect width="8" height="16" fill="#fff" opacity=".3" />
              <rect width="16" height="8" fill="#fff" opacity=".3" />
            </>
          )}
        </pattern>
      </defs>
      <path
        d="M4 6 L10 2 L16 7 L22 2 L28 6 L232 4 L236 9 L231 15 L237 22 L232 29 L237 36 L232 43 L237 50 L232 56 L28 58 L22 54 L16 58 L10 54 L4 58 L8 50 L3 43 L8 36 L3 29 L8 22 L3 15 L8 9 Z"
        fill={c}
        opacity=".85"
      />
      {pattern !== "uni" && (
        <path
          d="M4 6 L10 2 L16 7 L22 2 L28 6 L232 4 L236 9 L231 15 L237 22 L232 29 L237 36 L232 43 L237 50 L232 56 L28 58 L22 54 L16 58 L10 54 L4 58 L8 50 L3 43 L8 36 L3 29 L8 22 L3 15 L8 9 Z"
          fill={`url(#p-${pattern}-${c.slice(1)})`}
        />
      )}
    </svg>
  );
}

export const stickers: StickerDef[] = [
  // Washi-Tape
  { id: "tape-streifen", name: "Washi-Tape gestreift", ratio: 4, w: 200, color: "#f4a7b9", group: "tape", draw: tape("streifen") },
  { id: "tape-punkte", name: "Washi-Tape gepunktet", ratio: 4, w: 200, color: "#a8d5c2", group: "tape", draw: tape("punkte") },
  { id: "tape-karo", name: "Washi-Tape kariert", ratio: 4, w: 200, color: "#f6d38b", group: "tape", draw: tape("karo") },
  { id: "tape-uni", name: "Washi-Tape uni", ratio: 4, w: 200, color: "#b9c4f2", group: "tape", draw: tape("uni") },

  // Deko
  {
    id: "herz", name: "Herz", ratio: 1.1, w: 90, color: "#e8577a", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 110 100" width="100%" height="100%">
        <path d="M55 92 C20 66 6 48 8 30 C10 12 30 4 44 12 C50 16 53 20 55 25 C57 20 60 16 66 12 C80 4 100 12 102 30 C104 48 90 66 55 92 Z" fill={c} />
        <path d="M24 30 C26 22 32 18 38 18" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6" />
      </svg>
    ),
  },
  {
    id: "stern", name: "Stern", ratio: 1, w: 90, color: "#f2c14e", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M50 6 L61 37 L94 38 L68 58 L78 91 L50 72 L22 91 L32 58 L6 38 L39 37 Z" fill={c} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "funkeln", name: "Funkeln", ratio: 1, w: 80, color: "#f2c14e", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M50 4 C53 36 64 47 96 50 C64 53 53 64 50 96 C47 64 36 53 4 50 C36 47 47 36 50 4 Z" fill={c} />
        <path d="M84 8 C85 18 88 21 96 22 C88 23 85 26 84 36 C83 26 80 23 72 22 C80 21 83 18 84 8 Z" fill={c} opacity=".8" />
      </svg>
    ),
  },
  {
    id: "blume", name: "Blume", ratio: 1, w: 100, color: "#f4a7b9", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="50" cy="27" rx="15" ry="22" fill={c} stroke={ink} strokeWidth="2" transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="12" fill="#f6d38b" stroke={ink} strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "gaensebluemchen", name: "Gänseblümchen", ratio: 1, w: 90, color: "#ffffff", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx="50" cy="22" rx="7" ry="19" fill={c} stroke="#d9c9b6" strokeWidth="1.5" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="11" fill="#f2c14e" />
      </svg>
    ),
  },
  {
    id: "zweig", name: "Zweig", ratio: 0.55, w: 90, color: "#7fa77a", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 66 120" width="100%" height="100%">
        <path d="M33 116 C33 80 34 40 30 6" stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {[20, 42, 64, 86].map((y, i) => (
          <g key={y}>
            <path d={`M32 ${y + 10} C18 ${y + 4} 8 ${y - 6} 10 ${y - 14} C22 ${y - 12} 30 ${y - 2} 32 ${y + 10} Z`} fill={c} opacity={0.85 - i * 0.05} />
            <path d={`M33 ${y + 18} C47 ${y + 12} 57 ${y + 2} 56 ${y - 6} C44 ${y - 4} 36 ${y + 6} 33 ${y + 18} Z`} fill={c} opacity={0.8 - i * 0.05} />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "schleife", name: "Schleife", ratio: 1.4, w: 120, color: "#e8577a", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 140 100" width="100%" height="100%">
        <path d="M70 44 C50 20 18 8 10 22 C4 34 22 52 70 50 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M70 44 C90 20 122 8 130 22 C136 34 118 52 70 50 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M64 52 C54 70 44 84 36 94 L50 92 L56 98 C62 82 66 68 70 54 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M76 52 C86 70 96 84 104 94 L90 92 L84 98 C78 82 74 68 70 54 Z" fill={c} stroke={ink} strokeWidth="2" />
        <ellipse cx="70" cy="47" rx="10" ry="9" fill={c} stroke={ink} strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "wolke", name: "Wolke", ratio: 1.6, w: 130, color: "#dcebf7", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 160 100" width="100%" height="100%">
        <path d="M36 84 C14 84 6 66 16 54 C10 36 30 24 46 32 C52 14 80 8 94 24 C108 14 132 22 132 42 C150 44 156 64 144 76 C138 82 132 84 124 84 Z" fill={c} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "mond", name: "Mond", ratio: 1, w: 80, color: "#f6d38b", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M62 8 C36 12 18 34 20 58 C22 80 44 96 68 92 C80 90 88 84 94 76 C66 82 44 62 46 38 C47 24 54 14 62 8 Z" fill={c} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "kirschen", name: "Kirschen", ratio: 0.9, w: 80, color: "#d7263d", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 90 100" width="100%" height="100%">
        <path d="M30 70 C34 44 46 20 62 8 M62 8 C60 34 64 54 66 70" stroke="#4f7a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M62 8 C72 6 82 10 86 18 C76 20 68 16 62 8 Z" fill="#7fa77a" />
        <circle cx="28" cy="78" r="16" fill={c} stroke={ink} strokeWidth="2" />
        <circle cx="66" cy="80" r="16" fill={c} stroke={ink} strokeWidth="2" />
        <circle cx="22" cy="72" r="4" fill="#fff" opacity=".6" />
        <circle cx="60" cy="74" r="4" fill="#fff" opacity=".6" />
      </svg>
    ),
  },
  {
    id: "schmetterling", name: "Schmetterling", ratio: 1.2, w: 100, color: "#b9c4f2", group: "deko",
    draw: (c) => (
      <svg viewBox="0 0 120 100" width="100%" height="100%">
        <path d="M58 48 C40 18 10 10 8 30 C6 46 30 54 58 52 Z M58 54 C34 56 18 72 26 86 C34 98 52 80 58 58 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M62 48 C80 18 110 10 112 30 C114 46 90 54 62 52 Z M62 54 C86 56 102 72 94 86 C86 98 68 80 62 58 Z" fill={c} stroke={ink} strokeWidth="2" />
        <rect x="56" y="34" width="8" height="40" rx="4" fill={ink} />
        <path d="M58 36 C54 26 50 20 44 16 M62 36 C66 26 70 20 76 16" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },

  // Doodles und Büro
  {
    id: "bueroklammer", name: "Büroklammer", ratio: 0.38, w: 40, color: "#9aa3ad", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 38 100" width="100%" height="100%">
        <path d="M10 30 L10 78 C10 92 28 92 28 78 L28 16 C28 4 6 4 6 16 L6 70 C6 76 18 76 18 70 L18 28" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "pfeil", name: "Doodle-Pfeil", ratio: 1.6, w: 130, color: ink, group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 160 100" width="100%" height="100%">
        <path d="M10 80 C30 30 70 20 96 40 C110 52 104 68 92 64 C80 60 86 36 108 30 C124 26 138 32 148 40" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M132 26 L150 40 L130 50" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "kringel", name: "Kringel", ratio: 1.5, w: 160, color: "#e8577a", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 150 100" width="100%" height="100%">
        <path d="M120 22 C96 6 36 8 16 34 C0 56 28 88 78 88 C126 88 146 62 136 40 C128 24 100 14 70 16" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "unterstrich", name: "Unterstrich", ratio: 6, w: 240, color: "#e8577a", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 240 40" width="100%" height="100%" preserveAspectRatio="none">
        <path d="M6 24 C60 12 120 30 180 16 C200 12 220 14 234 18 M20 32 C80 22 140 36 210 26" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "herzchen", name: "Herzchen-Doodle", ratio: 1.6, w: 110, color: "#e8577a", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 160 100" width="100%" height="100%">
        {[[30, 60, 1], [80, 34, 0.8], [128, 64, 0.6]].map(([x, y, s]) => (
          <path key={x} transform={`translate(${x} ${y}) scale(${s})`} d="M0 18 C-16 6 -22 -4 -18 -12 C-14 -20 -4 -20 0 -10 C4 -20 14 -20 18 -12 C22 -4 16 6 0 18 Z" fill="none" stroke={c} strokeWidth="4" strokeLinejoin="round" />
        ))}
      </svg>
    ),
  },
  {
    id: "notiz", name: "Notizzettel", ratio: 1, w: 180, color: "#fff3a8", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M4 6 L96 4 L94 90 C70 94 30 98 6 96 Z" fill={c} />
        <path d="M6 96 C30 98 70 94 94 90 L96 98 C70 100 30 100 6 98 Z" fill="#000" opacity=".06" />
      </svg>
    ),
  },
  {
    id: "etikett", name: "Etikett", ratio: 2.4, w: 220, color: "#ffffff", group: "doodle",
    draw: (c) => (
      <svg viewBox="0 0 240 100" width="100%" height="100%">
        <path d="M40 10 L230 10 L230 90 L40 90 L6 50 Z" fill={c} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="38" cy="50" r="7" fill="none" stroke={ink} strokeWidth="2.5" />
      </svg>
    ),
  },

  // Anlässe
  {
    id: "geschenk", name: "Geschenk", ratio: 1, w: 100, color: "#e8577a", group: "anlass",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect x="12" y="40" width="76" height="54" rx="4" fill={c} stroke={ink} strokeWidth="2.5" />
        <rect x="6" y="28" width="88" height="16" rx="3" fill={c} stroke={ink} strokeWidth="2.5" />
        <rect x="44" y="28" width="12" height="66" fill="#f6d38b" stroke={ink} strokeWidth="2" />
        <path d="M50 28 C36 6 16 12 24 24 C28 30 40 30 50 28 C60 30 72 30 76 24 C84 12 64 6 50 28 Z" fill="#f6d38b" stroke={ink} strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "schneeflocke", name: "Schneeflocke", ratio: 1, w: 80, color: "#9cc7e8", group: "anlass",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {[0, 60, 120].map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`} stroke={c} strokeWidth="5" strokeLinecap="round">
            <path d="M50 6 L50 94" />
            <path d="M50 20 L40 12 M50 20 L60 12 M50 80 L40 88 M50 80 L60 88" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "tannenbaum", name: "Tannenbaum", ratio: 0.8, w: 90, color: "#4f8a5b", group: "anlass",
    draw: (c) => (
      <svg viewBox="0 0 80 100" width="100%" height="100%">
        <path d="M40 4 L58 32 L50 32 L68 58 L58 58 L76 84 L4 84 L22 58 L12 58 L30 32 L22 32 Z" fill={c} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="34" y="84" width="12" height="12" fill="#8b5e3c" stroke={ink} strokeWidth="2" />
        <circle cx="34" cy="48" r="3.5" fill="#e8577a" />
        <circle cx="48" cy="66" r="3.5" fill="#f2c14e" />
        <circle cx="28" cy="72" r="3.5" fill="#f2c14e" />
      </svg>
    ),
  },
  {
    id: "ballon", name: "Luftballon", ratio: 0.6, w: 70, color: "#f4a7b9", group: "anlass",
    draw: (c) => (
      <svg viewBox="0 0 60 100" width="100%" height="100%">
        <ellipse cx="30" cy="30" rx="24" ry="28" fill={c} stroke={ink} strokeWidth="2.5" />
        <path d="M26 58 L34 58 L30 64 Z" fill={c} stroke={ink} strokeWidth="2" />
        <path d="M30 64 C22 74 38 84 28 98" stroke={ink} strokeWidth="2" fill="none" />
        <path d="M18 20 C20 14 24 10 30 9" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".6" />
      </svg>
    ),
  },
  {
    id: "torte", name: "Torte", ratio: 1, w: 100, color: "#f4a7b9", group: "anlass",
    draw: (c) => (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect x="14" y="50" width="72" height="40" rx="6" fill={c} stroke={ink} strokeWidth="2.5" />
        <path d="M14 60 C22 68 30 56 38 64 C46 72 54 56 62 64 C70 72 78 58 86 64" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
        {[34, 50, 66].map((x) => (
          <g key={x}>
            <rect x={x - 3} y="30" width="6" height="20" fill="#b9c4f2" stroke={ink} strokeWidth="1.5" />
            <path d={`M${x} 18 C${x + 6} 24 ${x + 4} 30 ${x} 30 C${x - 4} 30 ${x - 6} 24 ${x} 18 Z`} fill="#f2c14e" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "ringe", name: "Ringe", ratio: 1.4, w: 110, color: "#d4a94e", group: "anlass",
    draw: (c) => (
      <svg viewBox="0 0 140 100" width="100%" height="100%">
        <circle cx="54" cy="58" r="30" fill="none" stroke={c} strokeWidth="8" />
        <circle cx="86" cy="58" r="30" fill="none" stroke={c} strokeWidth="8" />
        <path d="M46 22 L54 12 L62 22 L54 30 Z" fill="#dcebf7" stroke={ink} strokeWidth="2" />
      </svg>
    ),
  },
];

export const stickerMap: Record<string, StickerDef> = Object.fromEntries(stickers.map((s) => [s.id, s]));

export const stickerColors = ["#e8577a", "#f4a7b9", "#f2c14e", "#f6d38b", "#a8d5c2", "#7fa77a", "#9cc7e8", "#b9c4f2", "#c9a7e8", "#d4a94e", "#3b2f2a", "#ffffff"];
