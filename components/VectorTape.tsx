import { useId } from "react";

/* Gezeichnete Washi-Tapes: abgerissene Enden bleiben gleich, das Muster läuft
   endlos weiter. Alle Kacheln sind 100 Einheiten hoch. */

const snow = (x: number, y: number, s: number, c: string) => (
  <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`} stroke={c} strokeWidth="3.5" strokeLinecap="round" fill="none">
    {[0, 60, 120].map((a) => (
      <path key={a} transform={`rotate(${a})`} d="M0 -20 V20 M0 -12 L-6 -18 M0 -12 L6 -18 M0 12 L-6 18 M0 12 L6 18" />
    ))}
  </g>
);

const star = (x: number, y: number, s: number, c: string) => (
  <path key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`} fill={c} d="M0 -20 L5.5 -6.5 L20 -6 L8.5 3 L12.5 17 L0 9 L-12.5 17 L-8.5 3 L-20 -6 L-5.5 -6.5 Z" />
);

const holly = (x: number, y: number, r: number) => (
  <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M0 0 C-10 -14 -26 -14 -34 -4 C-26 10 -10 12 0 0 Z M0 0 C10 -14 26 -14 34 -4 C26 10 10 12 0 0 Z" fill="#48694f" />
    <circle cx="-4" cy="3" r="6" fill="#9c2b33" /><circle cx="6" cy="4" r="6" fill="#9c2b33" /><circle cx="1" cy="-5" r="6" fill="#b23a42" />
  </g>
);

export const tapePatterns: Record<string, { base: string; w: number; tile: React.ReactNode }> = {
  tartan: {
    base: "#8c2f35", w: 100,
    tile: (
      <>
        <rect width="100" height="100" fill="#8c2f35" />
        <rect x="10" width="30" height="100" fill="#2f5040" opacity=".75" /><rect y="32" width="100" height="36" fill="#2f5040" opacity=".6" />
        <rect x="22" width="4" height="100" fill="#f0e2c4" opacity=".8" /><rect x="70" width="4" height="100" fill="#d8b25c" opacity=".9" />
        <rect y="14" width="100" height="4" fill="#d8b25c" opacity=".9" /><rect y="82" width="100" height="4" fill="#f0e2c4" opacity=".7" />
      </>
    ),
  },
  tannenzweig: {
    base: "#f3e9d7", w: 120,
    tile: (
      <g stroke="#4c6b50" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M0 50 H120" stroke="#7a5b3e" />
        {[6, 22, 38, 54, 70, 86, 102].map((x, i) => (
          <path key={x} d={`M${x} 50 L${x + 14} ${24 + (i % 2) * 4} M${x} 50 L${x + 14} ${76 - (i % 2) * 4}`} />
        ))}
        <circle cx="60" cy="50" r="7" fill="#a3343c" stroke="none" />
      </g>
    ),
  },
  schnee: { base: "#f7f0e3", w: 120, tile: <>{snow(30, 34, 1, "#8fa9b8")}{snow(88, 66, 1.1, "#a9bec9")}<circle cx="60" cy="18" r="4" fill="#b9cbd4" /><circle cx="16" cy="78" r="4" fill="#b9cbd4" /></> },
  zuckerstange: {
    base: "#fbf4ea", w: 100,
    tile: <path d="M-50 100 L50 0 H85 L-15 100 Z M50 100 L150 0 H185 L85 100 Z" fill="#b23a42" />,
  },
  goldsterne: { base: "#f4ead8", w: 120, tile: <>{star(30, 36, 0.9, "#c79a3f")}{star(90, 62, 0.75, "#d8b25c")}{star(60, 84, 0.35, "#c79a3f")}{star(62, 18, 0.35, "#d8b25c")}</> },
  stechpalme: { base: "#f6eee0", w: 130, tile: <>{holly(38, 34, -14)}{holly(102, 68, 12)}</> },
  gruen: {
    base: "#375746", w: 60,
    tile: <>{[0, 15, 30, 45].map((x) => <path key={x} d={`M${x} 0 V100`} stroke="#fff" opacity=".07" strokeWidth="3" />)}</>,
  },
  bordeauxpunkte: { base: "#7d2a33", w: 60, tile: <><circle cx="15" cy="25" r="6" fill="#f3e4c8" /><circle cx="45" cy="50" r="6" fill="#f3e4c8" /><circle cx="15" cy="75" r="6" fill="#f3e4c8" /></> },
  kraft: { base: "#c8a67c", w: 80, tile: <><path d="M0 22 H80 M0 78 H80" stroke="#fff6e4" strokeWidth="4" strokeDasharray="10 10" /></> },
  noten: {
    base: "#f5ecdb", w: 140,
    tile: (
      <g>
        <path d="M0 26 H140 M0 38 H140 M0 50 H140 M0 62 H140 M0 74 H140" stroke="#8d7b66" strokeWidth="1.5" />
        <g fill="#4a3b30"><ellipse cx="28" cy="62" rx="9" ry="7" /><rect x="34" y="26" width="3" height="36" /><ellipse cx="78" cy="50" rx="9" ry="7" /><rect x="84" y="16" width="3" height="34" /><ellipse cx="114" cy="56" rx="9" ry="7" /><rect x="120" y="22" width="3" height="34" /><path d="M84 16 L123 22 V30 L84 24 Z" /></g>
      </g>
    ),
  },
  salbei: { base: "#a9b495", w: 60, tile: <path d="M0 60 L60 0 M-30 30 L30 -30 M30 90 L90 30" stroke="#fff" opacity=".28" strokeWidth="5" /> },
  herzen: { base: "#f5dcd2", w: 90, tile: <>{[[24, 34], [68, 66]].map(([x, y]) => <path key={x} transform={`translate(${x} ${y})`} fill="#b5573b" d="M0 16 C-16 4 -20 -4 -16 -11 C-12 -18 -3 -17 0 -8 C3 -17 12 -18 16 -11 C20 -4 16 4 0 16 Z" />)}</> },
  ginghamsalbei: {
    base: "#f7f1e4", w: 50,
    tile: <><rect width="25" height="100" fill="#8f9d78" opacity=".5" /><rect width="50" height="25" fill="#8f9d78" opacity=".5" /><rect y="50" width="50" height="25" fill="#8f9d78" opacity=".5" /></>,
  },
};

export default function VectorTape({ name, width, height, fit }: { name: string; width: number; height: number; fit?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = tapePatterns[name];
  if (!p) return null;
  const s = height / 100;
  // Abrisskante: kleine, feste Zacken links und rechts
  const bites = [0, 5, 1, 7, 3, 8, 2, 6, 0];
  const yAt = (i: number) => (i / (bites.length - 1)) * height;
  const left = bites.map((b, i) => `${b * s},${yAt(i)}`);
  const right = bites.map((b, i) => `${width - (8 - b) * s},${yAt(i)}`).reverse();
  return (
    <svg width="100%" height={fit ? "100%" : height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block", filter: "drop-shadow(0 2px 2px rgba(61,50,42,.18))" }} aria-hidden>
      <defs>
        <pattern id={`p${id}`} patternUnits="userSpaceOnUse" width={p.w} height="100" patternTransform={`scale(${s})`}>
          <rect width={p.w} height="100" fill={p.base} />
          {p.tile}
        </pattern>
        <pattern id={`f${id}`} patternUnits="userSpaceOnUse" width="23" height="17">
          <path d="M2 4 L9 5 M14 11 L21 10 M6 14 L10 13" stroke="#5a4636" strokeWidth=".7" opacity=".22" />
          <path d="M12 3 L18 2 M1 10 L7 10" stroke="#fff" strokeWidth=".8" opacity=".35" />
        </pattern>
      </defs>
      <polygon points={[...left, ...right].join(" ")} fill={`url(#p${id})`} opacity=".95" />
      <polygon points={[...left, ...right].join(" ")} fill={`url(#f${id})`} />
      <path d={`M0 1 H${width}`} stroke="#fff" opacity=".25" strokeWidth="2" />
    </svg>
  );
}
